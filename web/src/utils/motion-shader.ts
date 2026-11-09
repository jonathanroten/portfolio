import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Vector2,
  WebGLRenderer,
} from "three";

const MAX_PIXEL_RATIO = 2;
const MAX_SAMPLES = 12;
const PIXELS_PER_SAMPLE = 2;
const MAX_ANISOTROPY = 8;
const BEND_SEGMENTS = 24;

const VERTEX = /* glsl */ `
  uniform vec2 uReach;
  uniform vec2 uSize;
  uniform vec2 uBend;
  varying vec2 vUv;

  void main() {
    vUv = (uv - 0.5) * uReach + 0.5;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec2 bend = vec2(uBend.x, -uBend.y);
    float amount = length(bend);
    if (amount > 0.0) {
      vec2 across = vec2(-bend.y, bend.x) / amount;
      float extent = dot(abs(across), uSize) * 0.5;
      float side = clamp(dot((vUv - 0.5) * uSize, across) / extent, -1.0, 1.0);
      world.xy -= bend * (1.0 - side * side);
    }
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uCover;
  uniform vec2 uSize;
  uniform vec2 uBlur;
  uniform float uShift;
  uniform vec2 uLag;
  uniform float uPixelRatio;
  uniform int uSamples;
  varying vec2 vUv;

  const float MIP_SCALE = pow(2.0, -0.25);
  const float OVERLAP = 2.0;
  const float DITHER = 0.5;

  float interleavedNoise(vec2 position) {
    return fract(52.9829189 * fract(dot(position, vec2(0.06711056, 0.00583715))));
  }

  void main() {
    float pixel = 1.0 / uPixelRatio;
    float blurLength = length(uBlur);
    vec2 heading = blurLength > 0.0 ? vec2(uBlur.x, -uBlur.y) / blurLength : vec2(0.0, 1.0);
    float span = blurLength + abs(uShift) * 2.0;
    float strideLength = span / float(uSamples);
    vec2 stride = heading * strideLength;
    float offset = uSamples > 1
      ? 0.5 + (interleavedNoise(gl_FragCoord.xy) - 0.5) * DITHER
      : 0.5;
    vec2 along = strideLength > pixel ? stride * OVERLAP : vec2(pixel, 0.0);
    vec2 across = normalize(vec2(-along.y, along.x)) * pixel;
    vec2 footprint = uCover * MIP_SCALE / uSize;
    vec2 ramp = max(abs(stride), vec2(pixel));
    float channelReach = max(blurLength, strideLength) * 0.5;
    float channelEdge = max(strideLength, pixel);
    vec3 channels = vec3(uShift, 0.0, -uShift);
    vec3 light = vec3(0.0);
    vec3 coverage = vec3(0.0);
    vec3 total = vec3(0.0);

    for (int i = 0; i < uSamples; i++) {
      float position = ((float(i) + offset) / float(uSamples) - 0.5) * span;
      vec2 point = vUv + (heading * position + vec2(uLag.x, -uLag.y)) / uSize;
      vec4 color = textureGrad(
        uTexture,
        (point - 0.5) * uCover + 0.5,
        along * footprint,
        across * footprint
      );
      vec2 edge = clamp((0.5 - abs(point - 0.5)) * uSize / ramp + 0.5, 0.0, 1.0);
      vec3 weight = clamp((channelReach - abs(position + channels)) / channelEdge + 0.5, 0.0, 1.0);
      light += color.rgb * color.rgb * weight * color.a * edge.x * edge.y;
      coverage += weight * color.a * edge.x * edge.y;
      total += weight;
    }

    vec3 amount = coverage / max(total, vec3(0.0001));
    gl_FragColor = vec4(
      sqrt(light / max(coverage, vec3(0.0001))) * amount,
      (amount.r + amount.g + amount.b) / 3.0
    );
  }
`;

/** One image to draw this frame, in CSS pixels from the canvas's top left. */
export type MotionShaderItem = {
  key: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

/** How the wall is moving this frame, in CSS pixels. */
export type MotionShaderMotion = {
  /** Motion blur along x. */
  blurX: number;
  /** Motion blur along y. */
  blurY: number;
  /** How far red and blue separate from green along the motion. Negative swaps them. */
  shift: number;
  /** How far each image sits behind its true position along x. */
  lagX: number;
  /** How far each image sits behind its true position along y. */
  lagY: number;
  /** How far the middle of each image bows back along x. */
  bendX: number;
  /** How far the middle of each image bows back along y. */
  bendY: number;
};

/**
 * Draws images on a canvas with WebGL, one texture per source image. `context`
 * is created by the caller, so it can check for WebGL before downloading three.
 */
export function createMotionShader(
  canvas: HTMLCanvasElement,
  context: WebGL2RenderingContext,
) {
  const renderer = new WebGLRenderer({ canvas, context });
  renderer.sortObjects = false;

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1);
  const geometry = new PlaneGeometry(1, 1, BEND_SEGMENTS, BEND_SEGMENTS);
  const textures = new Map<number, { texture: Texture; aspect: number }>();
  const meshes: Mesh<PlaneGeometry, ShaderMaterial>[] = [];
  const view = { width: 0, height: 0 };
  const shared = {
    uBlur: { value: new Vector2() },
    uShift: { value: 0 },
    uLag: { value: new Vector2() },
    uBend: { value: new Vector2() },
    uPixelRatio: { value: 1 },
    uSamples: { value: 1 },
  };

  const meshAt = (index: number) => {
    let mesh = meshes[index];
    if (!mesh) {
      mesh = new Mesh(
        geometry,
        new ShaderMaterial({
          vertexShader: VERTEX,
          fragmentShader: FRAGMENT,
          uniforms: {
            ...shared,
            uTexture: { value: null },
            uCover: { value: new Vector2(1, 1) },
            uSize: { value: new Vector2(1, 1) },
            uReach: { value: new Vector2(1, 1) },
          },
          transparent: true,
          premultipliedAlpha: true,
          depthTest: false,
          depthWrite: false,
        }),
      );
      mesh.frustumCulled = false;
      meshes[index] = mesh;
      scene.add(mesh);
    }
    return mesh;
  };

  meshAt(0);
  renderer.compile(scene, camera);

  return {
    has: (key: number) => textures.has(key),

    isLost: () => context.isContextLost(),

    upload(key: number, image: HTMLImageElement) {
      if (textures.has(key)) return;
      const texture = new Texture(image);
      texture.anisotropy = Math.min(
        renderer.capabilities.getMaxAnisotropy(),
        MAX_ANISOTROPY,
      );
      texture.needsUpdate = true;
      renderer.initTexture(texture);
      textures.set(key, {
        texture,
        aspect: image.naturalWidth / image.naturalHeight,
      });
    },

    resize(width: number, height: number) {
      view.width = width;
      view.height = height;
      renderer.setSize(width, height, false);
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
    },

    /** Draws `items` in order, so later items sit on top. */
    draw(
      items: MotionShaderItem[],
      { blurX, blurY, shift, lagX, lagY, bendX, bendY }: MotionShaderMotion,
    ) {
      const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
      if (ratio !== renderer.getPixelRatio()) renderer.setPixelRatio(ratio);
      const length = Math.hypot(blurX, blurY);
      const spread = Math.abs(shift);
      const samples = Math.ceil(
        ((length + spread * 2) * ratio) / PIXELS_PER_SAMPLE,
      );
      const reach = 0.5 + spread / Math.max(length, 1);
      const paddingX = Math.abs(blurX) * reach + Math.abs(lagX) + 1;
      const paddingY = Math.abs(blurY) * reach + Math.abs(lagY) + 1;
      shared.uBlur.value.set(blurX, blurY);
      shared.uShift.value = shift;
      shared.uLag.value.set(lagX, lagY);
      shared.uBend.value.set(bendX, bendY);
      shared.uPixelRatio.value = ratio;
      shared.uSamples.value = Math.min(Math.max(samples, 1), MAX_SAMPLES);
      items.forEach(({ key, left, top, width, height }, index) => {
        const mesh = meshAt(index);
        const source = textures.get(key);
        mesh.visible = !!source;
        if (!source) return;
        const { uniforms } = mesh.material;
        const aspect = width / height;
        mesh.scale.set(width + paddingX * 2, height + paddingY * 2, 1);
        mesh.position.set(
          left + width / 2 - view.width / 2,
          view.height / 2 - top - height / 2,
          0,
        );
        uniforms.uTexture.value = source.texture;
        uniforms.uCover.value.set(
          Math.min(1, aspect / source.aspect),
          Math.min(1, source.aspect / aspect),
        );
        uniforms.uSize.value.set(width, height);
        uniforms.uReach.value.set(
          (width + paddingX * 2) / width,
          (height + paddingY * 2) / height,
        );
      });
      for (let index = items.length; index < meshes.length; index++) {
        meshes[index].visible = false;
      }
      renderer.render(scene, camera);
    },
  };
}

export type MotionShader = ReturnType<typeof createMotionShader>;

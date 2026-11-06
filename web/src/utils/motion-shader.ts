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

const VERTEX = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uCover;
  varying vec2 vUv;

  const float MIP_BIAS = -0.25;

  void main() {
    vec4 color = texture2D(uTexture, (vUv - 0.5) * uCover + 0.5, MIP_BIAS);
    gl_FragColor = vec4(color.rgb * color.a, color.a);
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
  const geometry = new PlaneGeometry();
  const textures = new Map<number, { texture: Texture; aspect: number }>();
  const meshes: Mesh<PlaneGeometry, ShaderMaterial>[] = [];
  const view = { width: 0, height: 0 };

  const meshAt = (index: number) => {
    let mesh = meshes[index];
    if (!mesh) {
      mesh = new Mesh(
        geometry,
        new ShaderMaterial({
          vertexShader: VERTEX,
          fragmentShader: FRAGMENT,
          uniforms: {
            uTexture: { value: null },
            uCover: { value: new Vector2(1, 1) },
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
    draw(items: MotionShaderItem[]) {
      const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
      if (ratio !== renderer.getPixelRatio()) renderer.setPixelRatio(ratio);
      items.forEach(({ key, left, top, width, height }, index) => {
        const source = textures.get(key);
        if (!source) return;
        const mesh = meshAt(index);
        const { uniforms } = mesh.material;
        const aspect = width / height;
        mesh.visible = true;
        mesh.scale.set(width, height, 1);
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
      });
      for (let index = items.length; index < meshes.length; index++) {
        meshes[index].visible = false;
      }
      renderer.render(scene, camera);
    },
  };
}

export type MotionShader = ReturnType<typeof createMotionShader>;

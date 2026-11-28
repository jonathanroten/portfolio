import {
  defineArrayMember,
  defineField,
  defineType,
  type FileValue,
  type ImageValue,
  type ValidationContext,
} from 'sanity'
import {getImageDimensions} from '@sanity/asset-utils'
import {GalleryItemPreview} from '../components/GalleryItemPreview'

/**
 * The shapes of the gallery's frames. An item's ratio picks both its crop and the frames it fills.
 * `minWidth` is the widest the site shows that ratio (`SIZES` in GalleryInfinite), so the smallest
 * upload that stays sharp. `clip` is the size of the device screen in the still, so the size a clip
 * must be (`devices` in GalleryInfinite). `shape` (width over height) and `minHeight` follow from
 * `value` and `minWidth`.
 */
const aspectRatios = [
  {title: 'Square (1:1)', value: '1:1', minWidth: 1200},
  {title: 'Wide (16:9)', value: '16:9', minWidth: 1800, clip: {width: 1920, height: 1024}},
  {title: 'Tall (3:4)', value: '3:4', minWidth: 1200, clip: {width: 720, height: 1560}},
].map((frame) => {
  const [across, down] = frame.value.split(':').map(Number)
  const shape = across / down
  return {...frame, shape, minHeight: Math.ceil(frame.minWidth / shape)}
})

type GalleryItemValue = ImageValue & {aspectRatio?: string; video?: FileValue}

/** Cloudflare's largest static file. A bigger clip fails the site's deploy. */
const clipLimit = 25 * 1024 * 1024

/** The clip size the Video field asks for, so clips start quickly. */
const clipTarget = 3 * 1000 * 1000

type ClipAsset = {size: number; url: string}

type ClipFrame = {width: number; height: number}

const clipAssets = new Map<string, Promise<ClipAsset | null>>()

const clipFrames = new Map<string, Promise<ClipFrame | null>>()

/**
 * Size in bytes and URL of an uploaded clip, or `null` when they can't be read. Fetched once per
 * file, since a file never changes; a failed read is tried again next time.
 */
const clipAsset = (ref: string, {getClient}: ValidationContext) => {
  const cached = clipAssets.get(ref)
  if (cached) return cached
  const asset = getClient({apiVersion: '2026-11-27'})
    .fetch<Partial<ClipAsset> | null>('*[_id == $ref][0]{size, url}', {ref})
    .then(
      (found) => (found?.size && found.url ? {size: found.size, url: found.url} : null),
      () => null,
    )
    .then((found) => {
      if (!found) clipAssets.delete(ref)
      return found
    })
  clipAssets.set(ref, asset)
  return asset
}

/**
 * Width and height of a clip, read by opening it in the browser, or `null` when it won't open
 * (often a codec other than H.264). Read once per file, like `clipAsset`.
 */
const clipFrame = (url: string) => {
  const cached = clipFrames.get(url)
  if (cached) return cached
  const frame = new Promise<ClipFrame | null>((resolve) => {
    const video = document.createElement('video')
    const done = (found: ClipFrame | null) => {
      video.removeAttribute('src')
      video.load()
      resolve(found)
    }
    video.preload = 'metadata'
    video.muted = true
    video.onloadedmetadata = () => done({width: video.videoWidth, height: video.videoHeight})
    video.onerror = () => done(null)
    video.src = url
  }).then((found) => {
    if (!found) clipFrames.delete(url)
    return found
  })
  clipFrames.set(url, frame)
  return frame
}

/** The item's frame, still size and crop insets, or `null` before an image and ratio are set. */
const measure = (item?: GalleryItemValue) => {
  const frame = aspectRatios.find(({value}) => value === item?.aspectRatio)
  if (!item?.asset?._ref || !frame) return null
  const {width, height} = getImageDimensions(item.asset._ref)
  const {top = 0, bottom = 0, left = 0, right = 0} = item.crop ?? {}
  return {frame, width, height, top, bottom, left, right}
}

const minSizes = aspectRatios
  .map(({value, minWidth, minHeight}) => `${value} (${minWidth} × ${minHeight})`)
  .join(', ')

const clipSizes = aspectRatios
  .flatMap(({value, clip}) => (clip ? [`${value} (${clip.width} × ${clip.height})`] : []))
  .join(', ')

export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Gallery Item',
  type: 'image',
  options: {hotspot: true},
  components: {preview: GalleryItemPreview},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative Text',
      type: 'string',
      description:
        'Describe the image for people who cannot see it. The site uses this, not the Alt Text in Media.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      description: `Minimum sizes: ${minSizes}`,
      options: {
        list: aspectRatios.map(({title, value}) => ({title, value})),
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: '1:1',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'services',
      type: 'array',
      description:
        'Shown under the image when it is selected. Pick from existing services, or create a new one. Renaming a service updates every image.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
      validation: (rule) => rule.required().unique(),
    }),
    defineField({
      name: 'video',
      type: 'file',
      description: `Optional. A loop of the screen only, played over the still when it's selected. MP4 (H.264), no sound, under 3 MB. Sizes, matching the screen in the still: ${clipSizes}`,
      options: {accept: 'video/mp4'},
      hidden: ({parent, value}) => !value && parent?.aspectRatio === '1:1',
      validation: (rule) => [
        rule.custom<FileValue>(async (clip, context) => {
          const ref = clip?.asset?._ref
          const asset = ref ? await clipAsset(ref, context) : null
          return asset && asset.size > clipLimit
            ? "Over Cloudflare's 25 MiB file limit, so the site can't deploy. Export a smaller clip."
            : true
        }),
        rule
          .custom<FileValue>(async (clip, context) => {
            const ref = clip?.asset?._ref
            if (!ref) return true
            const asset = await clipAsset(ref, context)
            if (!asset) {
              return "Couldn't check this clip's size. Make sure it's under 25 MiB, or the site can't deploy."
            }
            return asset.size > clipTarget
              ? 'Over 3 MB. Aim for under 3 MB so the clip starts quickly.'
              : true
          })
          .warning(),
      ],
    }),
  ],
  validation: (rule) => [
    rule.custom<GalleryItemValue>((item) => {
      if (!item?.video?.asset) return true
      if (item.aspectRatio === '1:1') {
        return {
          message: 'Square has no screen, so the video never plays. Remove it.',
          path: ['video'],
        }
      }
      const still = measure(item)
      if (!still) return true
      const {frame, width, height, top, bottom, left, right} = still
      return top || bottom || left || right || Math.abs(width / height - frame.shape) > 0.001
        ? `The video is placed on the uncropped still, so the image must be exactly ${frame.value} with no crop.`
        : true
    }),
    rule
      .custom<GalleryItemValue>(async (item, context) => {
        const ref = item?.video?.asset?._ref
        const clip = aspectRatios.find(({value}) => value === item?.aspectRatio)?.clip
        if (!ref || !clip || context.environment !== 'studio') return true
        const asset = await clipAsset(ref, context)
        if (!asset) return true
        const frame = await clipFrame(asset.url)
        if (!frame) {
          return {
            message: "Couldn't open this clip to check its size. Make sure it's an H.264 MP4.",
            path: ['video'],
          }
        }
        return frame.width === clip.width && frame.height === clip.height
          ? true
          : {
              message: `This clip is ${frame.width} × ${frame.height}. ${item?.aspectRatio} needs ${clip.width} × ${clip.height} to line up with the screen in the still.`,
              path: ['video'],
            }
      })
      .warning(),
    rule
      .custom<GalleryItemValue>((item) => {
        const still = measure(item)
        if (!still) return true
        const {frame, width, height, top, bottom, left, right} = still
        const croppedWidth = Math.round(
          Math.min(width * (1 - left - right), height * (1 - top - bottom) * frame.shape),
        )
        return croppedWidth < frame.minWidth
          ? `Too small for ${frame.value}: ${croppedWidth} px wide after cropping. Needs a minimum size of ${frame.minWidth} × ${frame.minHeight} px.`
          : true
      })
      .warning(),
  ],
  preview: {
    select: {title: 'alt', aspectRatio: 'aspectRatio', media: 'asset'},
  },
})

import {defineArrayMember, defineField, defineType, type ImageValue} from 'sanity'
import {getImageDimensions} from '@sanity/asset-utils'
import {GalleryItemPreview} from '../components/GalleryItemPreview'

/**
 * The shapes of the gallery's frames. An item's ratio picks both its crop and the frames it fills.
 * `minWidth` is the widest the site shows that ratio (`SIZES` in GalleryInfinite), so the smallest
 * upload that stays sharp. `shape` (width over height) and `minHeight` follow from `value` and `minWidth`.
 */
const aspectRatios = [
  {title: 'Square (1:1)', value: '1:1', minWidth: 1200},
  {title: 'Wide (16:9)', value: '16:9', minWidth: 1800},
  {title: 'Tall (3:4)', value: '3:4', minWidth: 1200},
].map((frame) => {
  const [across, down] = frame.value.split(':').map(Number)
  const shape = across / down
  return {...frame, shape, minHeight: Math.ceil(frame.minWidth / shape)}
})

const minSizes = aspectRatios
  .map(({value, minWidth, minHeight}) => `${value} (${minWidth} × ${minHeight})`)
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
      description:
        "Optional. A loop of the screen only, played over the still when it's selected. MP4 (H.264), no sound, under 3 MB. Wide 1600 × 900, Tall 600 × 1300.",
      options: {accept: 'video/mp4'},
      hidden: ({parent}) => parent?.aspectRatio === '1:1',
    }),
  ],
  validation: (rule) =>
    rule
      .custom<ImageValue & {aspectRatio?: string; video?: {asset?: unknown}}>((item) => {
        const frame = aspectRatios.find(({value}) => value === item?.aspectRatio)
        if (!item?.asset?._ref || !frame) return true
        const {width, height} = getImageDimensions(item.asset._ref)
        const {top = 0, bottom = 0, left = 0, right = 0} = item.crop ?? {}
        if (item.video?.asset && (top || bottom || left || right || Math.abs(width / height - frame.shape) > 0.001)) {
          return `The video is placed on the uncropped still, so the image must be exactly ${frame.value} with no crop.`
        }
        const croppedWidth = Math.round(
          Math.min(width * (1 - left - right), height * (1 - top - bottom) * frame.shape),
        )
        return croppedWidth < frame.minWidth
          ? `Too small for ${frame.value}: ${croppedWidth} px wide after cropping. Needs a minimum size of ${frame.minWidth} × ${frame.minHeight} px.`
          : true
      })
      .warning(),
  preview: {
    select: {title: 'alt', aspectRatio: 'aspectRatio', media: 'asset'},
  },
})

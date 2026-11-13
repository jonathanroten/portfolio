import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons/Images'
import {aspectRatios} from './galleryItem'

/**
 * Images per ratio so none repeats within a 2x2 block of tiles, which fills a typical screen.
 * Each tile shows three of each ratio.
 */
const MIN_PER_RATIO = 12

export const gallery = defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  fields: [
    defineField({
      name: 'items',
      title: 'Gallery Items',
      type: 'array',
      description: 'Drop multiple images here at once. Drag to reorder.',
      of: [defineArrayMember({type: 'galleryItem'})],
      options: {layout: 'grid'},
      validation: (rule) =>
        rule
          .custom<{aspectRatio?: string}[]>((items = []) =>
            aspectRatios.some(
              ({value}) =>
                items.filter((item) => item.aspectRatio === value).length < MIN_PER_RATIO,
            )
              ? `Aim for ${MIN_PER_RATIO} images per ratio to avoid repeats on screen.`
              : true,
          )
          .warning(),
    }),
  ],
  preview: {
    prepare: () => ({title: 'Gallery'}),
  },
  icon: ImagesIcon,
})

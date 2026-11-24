import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons/Images'

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
      description: `Add several images at once and drag to reorder. Use at least ${MIN_PER_RATIO} per ratio to avoid visible repeats.`,
      of: [defineArrayMember({type: 'galleryItem'})],
      options: {layout: 'grid'},
    }),
  ],
  preview: {
    prepare: () => ({title: 'Gallery'}),
  },
  icon: ImagesIcon,
})

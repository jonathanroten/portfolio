import {defineArrayMember, defineField, defineType} from 'sanity'
import {orderRankField} from '@sanity/orderable-document-list'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    // Drag-and-drop order, managed by the Studio structure (see structure/index.ts)
    orderRankField({type: 'project'}),
    defineField({
      name: 'title',
      type: 'string',
      options: {aiAssist: {exclude: true}},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', aiAssist: {exclude: true}},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'services',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags', aiAssist: {exclude: true}},
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 4,
      options: {aiAssist: {exclude: true}},
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      description: 'Drop multiple images here at once. Drag to reorder.',
      options: {layout: 'grid'},
      of: [defineArrayMember({type: 'galleryImage'})],
    }),
  ],
  preview: {
    select: {title: 'title', media: 'gallery.0'},
  },
})

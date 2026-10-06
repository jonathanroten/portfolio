import {defineArrayMember, defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home',
  type: 'document',
  fields: [
    defineField({
      name: 'heroImages',
      title: 'Hero images',
      type: 'array',
      description: 'Images that follow the cursor in the hero. Drag to reorder.',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid', aiAssist: {exclude: true}},
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    prepare: () => ({title: 'Home'}),
  },
  icon: HomeIcon,
})

import {defineField, defineType} from 'sanity'

export const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Gallery image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describe the image for people who cannot see it.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'layout',
      type: 'string',
      description: 'Default sits in the two-column grid; full width spans both columns.',
      options: {
        list: [
          {title: 'Default', value: 'default'},
          {title: 'Full width', value: 'fullWidth'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'default',
      validation: (rule) => rule.required(),
    }),
  ],
})

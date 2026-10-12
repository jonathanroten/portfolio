import {defineField, defineType} from 'sanity'

export const projectImage = defineType({
  name: 'projectImage',
  title: 'Project image',
  type: 'image',
  options: {
    hotspot: true,
    // Manual only: adds a "Generate image description" button to alt, never runs on upload
    aiAssist: {
      imageDescriptionField: {path: 'alt', updateOnImageChange: false},
    },
  },
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
        aiAssist: {exclude: true},
      },
      initialValue: 'default',
      validation: (rule) => rule.required(),
    }),
  ],
})

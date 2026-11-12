import {defineField, defineType} from 'sanity'

export const caseStudyImage = defineType({
  name: 'caseStudyImage',
  title: 'Case Study Image',
  type: 'image',
  options: {hotspot: true},
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
      name: 'layout',
      type: 'string',
      description: 'Default sits in the two-column grid; full width spans both columns.',
      options: {
        list: [
          {title: 'Default', value: 'default'},
          {title: 'Full Width', value: 'fullWidth'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'default',
      validation: (rule) => rule.required(),
    }),
  ],
})

import {defineArrayMember, defineField, defineType} from 'sanity'

// The gallery's frames come in these shapes. An item's ratio picks both its crop and the frames it fills
export const aspectRatios = [
  {title: 'Square (1:1)', value: '1:1'},
  {title: 'Wide (16:9)', value: '16:9'},
  {title: 'Tall (3:4)', value: '3:4'},
]

export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Gallery Item',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative Text',
      type: 'string',
      description: 'Describe the image for people who cannot see it.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      description:
        'The shape the image is cropped to, around its hotspot. It also decides which frames in the gallery the image can fill.',
      options: {
        list: aspectRatios,
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
  ],
  preview: {
    select: {title: 'alt', subtitle: 'aspectRatio', media: 'asset'},
  },
})

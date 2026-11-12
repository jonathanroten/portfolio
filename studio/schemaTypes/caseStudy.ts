import {ALL_FIELDS_GROUP, defineArrayMember, defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'
import {orderRankField} from '@sanity/orderable-document-list'

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'brief', title: 'Brief'},
    {name: 'approach', title: 'Approach'},
    {...ALL_FIELDS_GROUP, hidden: true},
  ],
  fields: [
    orderRankField({type: 'caseStudy'}),
    defineField({
      name: 'title',
      type: 'string',
      group: 'overview',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'The page’s address: /case-studies/<slug>.',
      group: 'overview',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 4,
      group: 'overview',
    }),
    defineField({
      name: 'services',
      type: 'array',
      description:
        'Pick from existing services, or create a new one. Renaming a service updates every case study.',
      group: 'overview',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'engagement',
      type: 'string',
      description: 'How the work was taken on.',
      group: 'overview',
      options: {
        list: [
          {title: 'Freelance', value: 'freelance'},
          {title: 'Agency', value: 'agency'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description:
        'Shown at the top of the case study, and as the teaser at the end of the previous one.',
      group: 'overview',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Describe the image for people who cannot see it.',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required().assetRequired(),
    }),
    defineField({
      name: 'featureGallery',
      title: 'Feature Gallery',
      type: 'array',
      description:
        'Shown with the case study on Home, which shows the first 5 rows: a Full Width image fills a row, and two Default images share one. Images past that are kept but not shown. Drop multiple images here at once. Drag to reorder.',
      group: 'overview',
      options: {layout: 'grid'},
      of: [defineArrayMember({type: 'caseStudyImage'})],
    }),
    defineField({
      name: 'brief',
      title: 'Text',
      type: 'text',
      rows: 4,
      description:
        'The first section after the hero, shown above the gallery. Each line is a paragraph. Leave this and the gallery empty to leave the section off the page.',
      group: 'brief',
    }),
    defineField({
      name: 'briefGallery',
      title: 'Gallery',
      type: 'array',
      description: 'Drop multiple images here at once. Drag to reorder.',
      group: 'brief',
      options: {layout: 'grid'},
      of: [defineArrayMember({type: 'caseStudyImage'})],
    }),
    defineField({
      name: 'approach',
      title: 'Text',
      type: 'text',
      rows: 4,
      description:
        'Follows the brief, shown above the gallery. Each line is a paragraph. Leave this and the gallery empty to leave the section off the page.',
      group: 'approach',
    }),
    defineField({
      name: 'approachGallery',
      title: 'Gallery',
      type: 'array',
      description: 'Drop multiple images here at once. Drag to reorder.',
      group: 'approach',
      options: {layout: 'grid'},
      of: [defineArrayMember({type: 'caseStudyImage'})],
    }),
  ],
  preview: {
    select: {title: 'title', media: 'featureGallery.0'},
  },
  icon: CaseIcon,
})

import {defineArrayMember, defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'
import {orderRankField} from '@sanity/orderable-document-list'

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fieldsets: [
    {
      name: 'overview',
      title: 'Overview',
      description:
        'The top of the case study’s page at /case-studies/<slug>, and its feature on Home. Empty fields are left off the page.',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'brief',
      title: 'Brief',
      description:
        'The first section after the hero. Left off the page when both fields are empty.',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'approach',
      title: 'Approach',
      description: 'Follows the brief. Left off the page when both fields are empty.',
      options: {collapsible: true, collapsed: false},
    },
  ],
  fields: [
    // Drag-and-drop order, managed by the Studio structure (see structure/index.ts)
    orderRankField({type: 'caseStudy'}),
    defineField({
      name: 'title',
      type: 'string',
      fieldset: 'overview',
      options: {aiAssist: {exclude: true}},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      fieldset: 'overview',
      options: {source: 'title', aiAssist: {exclude: true}},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 4,
      fieldset: 'overview',
      options: {aiAssist: {exclude: true}},
    }),
    defineField({
      name: 'services',
      type: 'array',
      description:
        'Pick from existing services, or create a new one. Renaming a service updates every case study.',
      fieldset: 'overview',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
      options: {aiAssist: {exclude: true}},
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'engagement',
      type: 'string',
      description: 'How the work was taken on.',
      fieldset: 'overview',
      options: {
        list: [
          {title: 'Freelance', value: 'freelance'},
          {title: 'Agency', value: 'agency'},
        ],
        layout: 'radio',
        direction: 'horizontal',
        aiAssist: {exclude: true},
      },
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description:
        'Shown at the top of the case study, and as the teaser at the end of the previous one.',
      fieldset: 'overview',
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
          title: 'Alternative Text',
          type: 'string',
          description: 'Describe the image for people who cannot see it.',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'featureGallery',
      title: 'Feature Gallery',
      type: 'array',
      description:
        'Shown with the case study on Home. Drop multiple images here at once. Drag to reorder.',
      fieldset: 'overview',
      options: {layout: 'grid'},
      of: [defineArrayMember({type: 'caseStudyImage'})],
    }),
    defineField({
      name: 'brief',
      title: 'Text',
      type: 'text',
      rows: 4,
      description: 'Shown above the gallery. Each line is a paragraph.',
      fieldset: 'brief',
      options: {aiAssist: {exclude: true}},
    }),
    defineField({
      name: 'briefGallery',
      title: 'Gallery',
      type: 'array',
      description: 'Drop multiple images here at once. Drag to reorder.',
      fieldset: 'brief',
      options: {layout: 'grid'},
      of: [defineArrayMember({type: 'caseStudyImage'})],
    }),
    defineField({
      name: 'approach',
      title: 'Text',
      type: 'text',
      rows: 4,
      description: 'Shown above the gallery. Each line is a paragraph.',
      fieldset: 'approach',
      options: {aiAssist: {exclude: true}},
    }),
    defineField({
      name: 'approachGallery',
      title: 'Gallery',
      type: 'array',
      description: 'Drop multiple images here at once. Drag to reorder.',
      fieldset: 'approach',
      options: {layout: 'grid'},
      of: [defineArrayMember({type: 'caseStudyImage'})],
    }),
  ],
  preview: {
    select: {title: 'title', media: 'featureGallery.0'},
  },
  icon: CaseIcon,
})

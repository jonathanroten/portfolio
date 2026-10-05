import {defineField, defineType} from 'sanity'
import {TagsIcon} from '@sanity/icons/Tags'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  description:
    'A service you offer. Projects and the site footer reference these, so renaming one here updates it everywhere.',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      options: {aiAssist: {exclude: true}},
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'title'},
  },
  icon: TagsIcon,
})

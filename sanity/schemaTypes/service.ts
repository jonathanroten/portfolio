import {defineField, defineType} from 'sanity'
import {UlistIcon} from '@sanity/icons/Ulist'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  description:
    'A service you offer. Case studies and the site footer reference these, so renaming one here updates it everywhere.',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
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
  icon: UlistIcon,
})

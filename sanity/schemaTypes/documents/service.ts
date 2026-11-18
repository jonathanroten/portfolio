import {defineField, defineType} from 'sanity'
import {UlistIcon} from '@sanity/icons/Ulist'
import {orderRankField} from '@sanity/orderable-document-list'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  description:
    'A service you offer. Case studies and the site footer reference these, so renaming one here updates it everywhere.',
  fields: [
    orderRankField({type: 'service'}),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
  icon: UlistIcon,
})

import {defineArrayMember, defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'
import {LinkIcon} from '@sanity/icons/Link'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'navigation',
      type: 'array',
      description: 'Main links in the nav, on every page. Drag to reorder.',
      of: [
        defineArrayMember({
          name: 'navigationLink',
          type: 'object',
          icon: LinkIcon,
          fields: [
            defineField({
              name: 'label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Destination',
              type: 'string',
              description: 'A path (/projects), a section (/#gallery), or a full URL.',
              validation: (rule) =>
                rule
                  .required()
                  .custom((href) =>
                    !href || /^(\/|#|https:\/\/|mailto:)/.test(href)
                      ? true
                      : 'Start with /, #, https:// or mailto:',
                  ),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'href'}},
        }),
      ],
      options: {aiAssist: {exclude: true}},
    }),
    defineField({
      name: 'socialLinks',
      type: 'array',
      description: 'Shown in the mobile menu. Each opens in a new tab. Drag to reorder.',
      of: [
        defineArrayMember({
          name: 'socialLink',
          type: 'object',
          icon: LinkIcon,
          fields: [
            defineField({
              name: 'label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required().uri({scheme: ['https']}),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'url'}},
        }),
      ],
      options: {aiAssist: {exclude: true}},
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description:
        'Default description for search results and social shares, on every page that does not set its own.',
      options: {aiAssist: {exclude: true}},
      validation: (rule) => [
        rule.required(),
        rule.max(160).warning('Search results cut off after about 160 characters'),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site Settings'}),
  },
  icon: CogIcon,
})

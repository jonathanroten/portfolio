import {createElement} from 'react'
import {
  defineArrayMember,
  defineField,
  defineType,
  isPortableTextSpan,
  isPortableTextTextBlock,
} from 'sanity'
import {HighlightIcon} from '@sanity/icons/Highlight'
import {HomeIcon} from '@sanity/icons/Home'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home',
  type: 'document',
  fields: [
    defineField({
      name: 'description',
      type: 'array',
      description:
        'One sentence for the hero and the mobile menu on every page. Select words and click Highlight to emphasise them in the hero.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {
                title: 'Highlight',
                value: 'highlight',
                icon: HighlightIcon,
                component: ({children}) =>
                  createElement('span', {style: {textTransform: 'uppercase'}}, children),
              },
            ],
            annotations: [],
          },
        }),
      ],
      validation: (rule) => [
        rule.required(),
        rule.max(1).error('Keep the description to one paragraph'),
        rule
          .custom((blocks) => {
            const length = (blocks ?? [])
              .filter(isPortableTextTextBlock)
              .flatMap((block) => block.children.filter(isPortableTextSpan))
              .reduce((sum, span) => sum + span.text.length, 0)
            return (
              length <= 90 ||
              "Over 90 characters can wrap the hero text to a fourth line and slow the home page's load score (LCP)."
            )
          })
          .warning(),
      ],
    }),
    defineField({
      name: 'heroImages',
      title: 'Hero Images',
      type: 'array',
      description: 'Images that follow the cursor in the hero. Drag to reorder.',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid'},
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    prepare: () => ({title: 'Home'}),
  },
  icon: HomeIcon,
})

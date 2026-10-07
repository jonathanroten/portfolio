import {CogIcon} from '@sanity/icons/Cog'
import {HomeIcon} from '@sanity/icons/Home'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import type {StructureResolver} from 'sanity/structure'

const AI_CONTEXT_TYPE = 'assist.instruction.context'
// Left out of the generated list: projects, home, site settings, and AI context are placed by
// hand, and the Media plugin's tags and folders are managed in its Media tool rather than edited
// as documents
const HIDDEN_TYPES = [
  'project',
  'homePage',
  'siteSettings',
  AI_CONTEXT_TYPE,
  'media.tag',
  'media.folder',
]

export const structure: StructureResolver = (S, context) => {
  // A drag-to-order list of projects narrowed by a GROQ filter. Each list needs its own id
  const projectList = (id: string, title: string, filter: string, params?: {projectType: string}) =>
    orderableDocumentListDeskItem({
      type: 'project',
      id: `orderable-${id}-projects`,
      title,
      filter,
      params,
      S,
      context,
    })

  return S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home')
        .icon(HomeIcon)
        .child(S.document().title('Home').schemaType('homePage').documentId('homePage')),
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(
          S.document().title('Site Settings').schemaType('siteSettings').documentId('siteSettings'),
        ),
      S.divider(),
      S.listItem()
        .title('Project')
        .child(
          S.list()
            .title('Project')
            .items([
              projectList('brand', 'Brand', 'projectType == $projectType', {
                projectType: 'brand',
              }),
              projectList('interactive', 'Interactive', 'projectType == $projectType', {
                projectType: 'interactive',
              }),
            ]),
        ),
      ...S.documentTypeListItems().filter((item) => !HIDDEN_TYPES.includes(item.getId() ?? '')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => item.getId() === AI_CONTEXT_TYPE),
    ])
}

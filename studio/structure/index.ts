import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import type {StructureResolver} from 'sanity/structure'
import {ProjectsIcon} from '@sanity/icons/Projects'

const AI_CONTEXT_TYPE = 'assist.instruction.context'
// Left out of the generated list: projects and AI context are placed by hand, and the Media
// plugin's tags and folders are managed in its Media tool rather than edited as documents
const HIDDEN_TYPES = ['project', AI_CONTEXT_TYPE, 'media.tag', 'media.folder']

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      orderableDocumentListDeskItem({
        type: 'project',
        title: 'Projects',
        icon: ProjectsIcon,
        S,
        context,
      }),
      ...S.documentTypeListItems().filter((item) => !HIDDEN_TYPES.includes(item.getId() ?? '')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => item.getId() === AI_CONTEXT_TYPE),
    ])

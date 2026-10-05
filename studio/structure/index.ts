import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import type {StructureResolver} from 'sanity/structure'

const AI_CONTEXT_TYPE = 'assist.instruction.context'

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      orderableDocumentListDeskItem({
        type: 'project',
        title: 'Projects',
        S,
        context,
      }),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'project' && item.getId() !== AI_CONTEXT_TYPE,
      ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => item.getId() === AI_CONTEXT_TYPE),
    ])

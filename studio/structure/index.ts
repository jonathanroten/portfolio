import {CaseIcon} from '@sanity/icons/Case'
import {UlistIcon} from '@sanity/icons/Ulist'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      S.listItem().singleton('homePage'),
      S.divider(),
      S.listItem()
        .title('Services')
        .icon(UlistIcon)
        .child(S.documentTypeList('service').title('Services')),
      orderableDocumentListDeskItem({
        type: 'caseStudy',
        title: 'Case Studies',
        icon: CaseIcon,
        S,
        context,
      }),
      S.listItem().singleton('gallery'),
      S.divider(),
      S.listItem().singleton('siteSettings'),
    ])

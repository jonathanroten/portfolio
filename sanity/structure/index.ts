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
      orderableDocumentListDeskItem({
        type: 'service',
        title: 'Services',
        icon: UlistIcon,
        S,
        context,
      }),
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

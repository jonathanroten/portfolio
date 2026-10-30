import {CaseIcon} from '@sanity/icons/Case'
import {CogIcon} from '@sanity/icons/Cog'
import {HomeIcon} from '@sanity/icons/Home'
import {ImagesIcon} from '@sanity/icons/Images'
import {UlistIcon} from '@sanity/icons/Ulist'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home')
        .icon(HomeIcon)
        .child(S.document().title('Home').schemaType('homePage').documentId('homePage')),
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
      S.listItem()
        .title('Gallery')
        .icon(ImagesIcon)
        .child(S.document().title('Gallery').schemaType('gallery').documentId('gallery')),
      S.divider(),
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(
          S.document().title('Site Settings').schemaType('siteSettings').documentId('siteSettings'),
        ),
    ])

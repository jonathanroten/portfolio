import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {assist} from '@sanity/assist'
import {media, mediaAssetSource} from 'sanity-plugin-media'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {createBulkAltTextActions} from './helpers/bulkAltText'
import {AssetDetails} from './helpers/assetDetails'

const SINGLETON_TYPES = ['homePage', 'gallery', 'siteSettings']

export default defineConfig({
  name: 'default',
  title: 'Portfolio',

  projectId: 'fk2vli4s',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    visionTool(),
    media({components: {details: AssetDetails}}),
    assist({
      fieldActions: {
        title: 'Images',
        useFieldActions: createBulkAltTextActions({
          targets: [
            {documentType: 'project', arrayField: 'gallery'},
            {documentType: 'gallery', arrayField: 'items'},
          ],
        }),
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  // "Select" on image fields opens the Media browser only (folders, tags, search) instead of the
  // built-in flat list. It opens on the all-assets grid; folders are behind the folder view button.
  form: {
    image: {
      assetSources: (sources) => sources.filter((source) => source === mediaAssetSource),
    },
  },

  document: {
    // Removes it from the "+" create menu
    newDocumentOptions: (prev, {creationContext}) =>
      creationContext.type === 'global'
        ? prev.filter((option) => !SINGLETON_TYPES.includes(option.templateId))
        : prev,
    // Keeps only publish/discard/restore. Drops duplicate and delete
    actions: (prev, {schemaType}) =>
      SINGLETON_TYPES.includes(schemaType)
        ? prev.filter(
            ({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action),
          )
        : prev,
  },
})

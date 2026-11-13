import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {media, mediaAssetSource} from 'sanity-plugin-media'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'Portfolio',

  projectId: 'fk2vli4s',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool(), media()],

  schema: {
    types: schemaTypes,
  },

  form: {
    image: {
      assetSources: (sources) => sources.filter((source) => source === mediaAssetSource),
    },
  },

  document: {
    singletons: ['homePage', 'gallery', 'siteSettings'],
  },
})

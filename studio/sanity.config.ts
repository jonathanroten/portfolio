import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {assist} from '@sanity/assist'
import {media} from 'sanity-plugin-media'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {createBulkAltTextActions} from './assist/bulkAltText'

export default defineConfig({
  name: 'default',
  title: 'Portfolio',

  projectId: 'fk2vli4s',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    visionTool(),
    media(),
    assist({
      fieldActions: {
        title: 'Gallery',
        useFieldActions: createBulkAltTextActions({documentType: 'project', arrayField: 'gallery'}),
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})

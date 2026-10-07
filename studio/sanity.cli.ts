import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'fk2vli4s',
    dataset: 'production',
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  // Re-extract the schema and regenerate the website's query types during sanity dev and build
  schemaExtraction: {
    enabled: true,
    enforceRequiredFields: true,
  },
  typegen: {
    enabled: true,
    path: '../web/src/**/*.{ts,astro}',
    generates: '../web/src/sanity.types.ts',
    formatGeneratedCode: false,
  },
})

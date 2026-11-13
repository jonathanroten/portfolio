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
  schemaExtraction: {
    enabled: true,
    enforceRequiredFields: true,
  },
  typegen: {
    enabled: true,
    path: '../src/**/*.{ts,astro}',
    generates: '../sanity.types.ts',
    formatGeneratedCode: false,
  },
})

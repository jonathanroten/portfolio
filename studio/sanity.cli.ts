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
  // Schema edits during sanity dev and build re-extract the schema and regenerate the website's
  // query types. Query edits in web/ need npm run typegen, or npm run typegen:watch running.
  // The types are written outside web/src so the watcher doesn't react to its own output.
  schemaExtraction: {
    enabled: true,
    enforceRequiredFields: true,
  },
  typegen: {
    enabled: true,
    path: '../web/src/**/*.{ts,astro}',
    generates: '../web/sanity.types.ts',
    formatGeneratedCode: false,
  },
})

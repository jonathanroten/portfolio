/**
 * Files gallery images into one Media plugin folder per project.
 *
 * Run after adding or editing a project:
 *   npm run organize-media
 * Preview without writing anything:
 *   npm run organize-media -- --dry-run
 *
 * Safe to re-run. Only published projects are read. Each project gets a folder with a
 * deterministic ID, so renaming a project renames its folder on the next run. Images already in
 * a folder are never moved, so moves made by hand in the Media tool stick. Images no project
 * uses stay unfiled, and folders are never deleted.
 */
import {getCliClient} from 'sanity/cli'

// The Studio doesn't ship @types/node; this script only needs these members
declare const process: {argv: string[]; exitCode?: number}

const dryRun = process.argv.includes('--dry-run')

// The Media plugin's folder document type
const FOLDER_TYPE = 'media.folder'

type Project = {_id: string; title?: string; assetIds: string[]}
type Folder = {_id: string; name: string}
type Asset = {_id: string; _rev: string}

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({useCdn: false})

const folderIdFor = (projectId: string) => `${FOLDER_TYPE}.project-${projectId}`

async function main() {
  const {projects, folders} = await client.fetch<{projects: Project[]; folders: Folder[]}>(
    `{
      "projects": *[_type == "project" && !(_id in path("drafts.**"))] | order(orderRank) {
        _id, title, "assetIds": array::unique(gallery[defined(asset._ref)].asset._ref)
      },
      "folders": *[_type == $folderType]{_id, name}
    }`,
    {folderType: FOLDER_TYPE},
  )
  const folderNames = new Map(folders.map((folder) => [folder._id, folder.name]))

  const tx = client.transaction()
  let changes = 0
  // An image in several galleries goes to the first project (in Studio order) that uses it
  const claimed = new Set<string>()

  for (const project of projects) {
    const folderId = folderIdFor(project._id)
    const name = project.title?.trim() || 'Untitled project'

    if (!folderNames.has(folderId)) {
      console.log(`Create folder "${name}"`)
      tx.create({_id: folderId, _type: FOLDER_TYPE, name})
      changes++
    } else if (folderNames.get(folderId) !== name) {
      console.log(`Rename folder "${folderNames.get(folderId)}" -> "${name}"`)
      tx.patch(folderId, (patch) => patch.set({name}))
      changes++
    }

    const unfiled = (
      await client.fetch<Asset[]>(`*[_id in $ids && !defined(opt.media.folder)]{_id, _rev}`, {
        ids: project.assetIds,
      })
    ).filter((asset) => !claimed.has(asset._id))
    unfiled.forEach((asset) => claimed.add(asset._id))
    if (unfiled.length) console.log(`File ${unfiled.length} image(s) into "${name}"`)

    for (const asset of unfiled) {
      // Same patch the Media plugin applies when you move an image into a folder
      tx.patch(asset._id, (patch) =>
        patch
          .ifRevisionId(asset._rev)
          .setIfMissing({opt: {}})
          .setIfMissing({'opt.media': {}})
          .set({'opt.media.folder': {_type: 'reference', _ref: folderId, _weak: true}}),
      )
      changes++
    }
  }

  if (!changes) {
    console.log('Everything is already organized.')
    return
  }
  if (dryRun) {
    console.log(`\nDry run: ${changes} change(s) not applied.`)
    return
  }
  await tx.commit()
  console.log(`\nApplied ${changes} change(s).`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

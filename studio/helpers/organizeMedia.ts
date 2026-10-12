/**
 * Files project images into one Media plugin folder per project and tags them "Project".
 *
 * Run after adding or editing a project:
 *   npm run organize-media
 * Preview without writing anything:
 *   npm run organize-media -- --dry-run
 *
 * Safe to re-run. Only published projects are read. Each project gets a folder named after it
 * when the folder is first created; after that the name is yours to change in the Media tool.
 * Images already in a folder are never moved, so moves made by hand in the Media tool stick.
 * Every project image gets the "Project" tag, which makes its Alt Text read-only in the Media tool
 * (see assetDetails.tsx). Images no project uses stay unfiled and untagged, and folders and
 * tags are never deleted.
 */
import {getCliClient} from 'sanity/cli'
import {PROJECT_TAG_NAME} from './projectTag'

// The Studio doesn't ship @types/node; this script only needs these members
declare const process: {argv: string[]; exitCode?: number}

const dryRun = process.argv.includes('--dry-run')

// The Media plugin's document types
const FOLDER_TYPE = 'media.folder'
const TAG_TYPE = 'media.tag'

type Project = {_id: string; title?: string; assetIds: string[]}
type Asset = {_id: string; _rev: string; filed: boolean; tagged: boolean}

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({useCdn: false})

const folderIdFor = (projectId: string) => `${FOLDER_TYPE}.project-${projectId}`

// Weak, like the Media plugin's own references, so deleting a folder or tag never fails
const weakRef = (id: string) => ({_type: 'reference', _ref: id, _weak: true})

async function main() {
  const {projects, folderIds, tagId} = await client.fetch<{
    projects: Project[]
    folderIds: string[]
    tagId: string | null
  }>(
    `{
      "projects": *[_type == "project" && !(_id in path("drafts.**"))] | order(orderRank) {
        _id, title, "assetIds": array::unique(projectGallery[defined(asset._ref)].asset._ref)
      },
      "folderIds": *[_type == $folderType]._id,
      "tagId": *[_type == $tagType && name.current == $tagName][0]._id
    }`,
    {folderType: FOLDER_TYPE, tagType: TAG_TYPE, tagName: PROJECT_TAG_NAME},
  )
  const existingFolders = new Set(folderIds)

  const tx = client.transaction()
  let changes = 0

  // Reuse a "Project" tag made by hand in the Media tool if there is one
  const projectTagId = tagId ?? `${TAG_TYPE}.project`
  if (!tagId) {
    console.log(`Create tag "${PROJECT_TAG_NAME}"`)
    tx.create({
      _id: projectTagId,
      _type: TAG_TYPE,
      name: {_type: 'slug', current: PROJECT_TAG_NAME},
    })
    changes++
  }

  // An image in several galleries goes to the first project (in Studio order) that uses it
  const claimed = new Set<string>()

  for (const project of projects) {
    const folderId = folderIdFor(project._id)
    const name = project.title?.trim() || 'Untitled project'

    if (!existingFolders.has(folderId)) {
      console.log(`Create folder "${name}"`)
      tx.create({_id: folderId, _type: FOLDER_TYPE, name})
      changes++
    }

    const assets = (
      await client.fetch<Asset[]>(
        `*[_id in $ids && !(defined(opt.media.folder) && $tagId in coalesce(opt.media.tags[]._ref, []))]{
          _id, _rev,
          "filed": defined(opt.media.folder),
          "tagged": $tagId in coalesce(opt.media.tags[]._ref, [])
        }`,
        {ids: project.assetIds, tagId: projectTagId},
      )
    ).filter((asset) => !claimed.has(asset._id))
    assets.forEach((asset) => claimed.add(asset._id))

    const toFile = assets.filter((asset) => !asset.filed).length
    const toTag = assets.filter((asset) => !asset.tagged).length
    if (toFile) console.log(`File ${toFile} image(s) into "${name}"`)
    if (toTag) console.log(`Tag ${toTag} image(s) in "${name}" as "${PROJECT_TAG_NAME}"`)

    // The same patches the Media plugin applies when you move an image or add a tag
    for (const asset of assets) {
      tx.patch(asset._id, (patch) => {
        let next = patch
          .ifRevisionId(asset._rev)
          .setIfMissing({opt: {}})
          .setIfMissing({'opt.media': {}})
        if (!asset.filed) next = next.set({'opt.media.folder': weakRef(folderId)})
        if (!asset.tagged) {
          next = next
            .setIfMissing({'opt.media.tags': []})
            .append('opt.media.tags', [{_key: 'project', ...weakRef(projectTagId)}])
        }
        return next
      })
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

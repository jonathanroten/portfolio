import {getCliClient} from 'sanity/cli'
import {CASE_STUDY_TAG_NAME} from './caseStudyTag'

/** The members this script uses. The Studio doesn't ship @types/node. */
declare const process: {argv: string[]; exitCode?: number}

const dryRun = process.argv.includes('--dry-run')

/** The Media plugin's folder document type. */
const FOLDER_TYPE = 'media.folder'
/** The Media plugin's tag document type. */
const TAG_TYPE = 'media.tag'

type CaseStudy = {_id: string; title?: string; assetIds: string[]}
type Asset = {_id: string; _rev: string; filed: boolean; tagged: boolean}

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({useCdn: false})

const folderIdFor = (caseStudyId: string) => `${FOLDER_TYPE}.case-study-${caseStudyId}`

/** A weak reference, like the Media plugin's own, so deleting a folder or tag never fails. */
const weakRef = (id: string) => ({_type: 'reference', _ref: id, _weak: true})

/**
 * Files each published case study's images into a Media folder named after it, and tags them
 * "Case Study". Safe to re-run: images already in a folder never move, folder names can be
 * changed in the Media tool, and nothing is ever deleted. Pass --dry-run to preview.
 */
async function main() {
  const {caseStudies, folderIds, tagId} = await client.fetch<{
    caseStudies: CaseStudy[]
    folderIds: string[]
    tagId: string | null
  }>(
    `{
      "caseStudies": *[_type == "caseStudy" && !(_id in path("drafts.**"))] | order(orderRank) {
        _id, title, "assetIds": array::unique(array::compact(
          [heroImage.asset._ref]
            + coalesce(featureGallery[].asset._ref, [])
            + coalesce(briefGallery[].asset._ref, [])
            + coalesce(approachGallery[].asset._ref, [])
        ))
      },
      "folderIds": *[_type == $folderType]._id,
      "tagId": *[_type == $tagType && name.current == $tagName][0]._id
    }`,
    {folderType: FOLDER_TYPE, tagType: TAG_TYPE, tagName: CASE_STUDY_TAG_NAME},
  )
  const existingFolders = new Set(folderIds)

  const tx = client.transaction()
  let changes = 0

  const caseStudyTagId = tagId ?? `${TAG_TYPE}.case-study`
  if (!tagId) {
    console.log(`Create tag "${CASE_STUDY_TAG_NAME}"`)
    tx.create({
      _id: caseStudyTagId,
      _type: TAG_TYPE,
      name: {_type: 'slug', current: CASE_STUDY_TAG_NAME},
    })
    changes++
  }

  const claimed = new Set<string>()

  for (const caseStudy of caseStudies) {
    const folderId = folderIdFor(caseStudy._id)
    const name = caseStudy.title?.trim() || 'Untitled case study'

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
        {ids: caseStudy.assetIds, tagId: caseStudyTagId},
      )
    ).filter((asset) => !claimed.has(asset._id))
    assets.forEach((asset) => claimed.add(asset._id))

    const toFile = assets.filter((asset) => !asset.filed).length
    const toTag = assets.filter((asset) => !asset.tagged).length
    if (toFile) console.log(`File ${toFile} image(s) into "${name}"`)
    if (toTag) console.log(`Tag ${toTag} image(s) in "${name}" as "${CASE_STUDY_TAG_NAME}"`)

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
            .append('opt.media.tags', [{_key: 'case-study', ...weakRef(caseStudyTagId)}])
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

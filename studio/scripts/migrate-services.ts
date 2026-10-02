/**
 * One-time migration: project.services string tags -> references to `service` documents.
 *
 * Creates a published `service` document for every distinct service (plus the services the
 * site footer used to hardcode), then rewrites each project's `services` (published and draft
 * versions) as references. Safe to re-run: services use deterministic IDs and projects that
 * already hold only references are skipped.
 *
 * Dry run (default, writes nothing):
 *   npx sanity exec scripts/migrate-services.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/migrate-services.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

// The Studio doesn't ship @types/node; this script only needs these two members
declare const process: {argv: string[]; exit(code?: number): never}

const apply = process.argv.includes('--apply')

// Services the site footer listed before it was driven from `service` documents.
const FOOTER_SERVICES = [
  'Branding',
  'Design Systems',
  'Editorial and Print Design',
  'Front-End Development',
  'Identity Design',
  'Illustration',
  'Interactive Design',
  'Lettering',
  'Merchandising',
  'Webflow',
]

type ProjectDoc = {_id: string; _rev: string; title?: string; services?: unknown[]}

// perspective 'raw' so draft versions (`drafts.*`) are returned alongside published ones
const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  perspective: 'raw',
  useCdn: false,
})

const tidy = (name: string) => name.trim().replace(/\s+/g, ' ')

// No dots in the ID: a dotted ID makes a document private (like `drafts.`)
const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

async function main() {
  const projects = await client.fetch<ProjectDoc[]>(
    `*[_type == "project"]{_id, _rev, title, services}`,
  )
  const existingServiceIds = new Set(await client.fetch<string[]>(`*[_type == "service"]._id`))

  // slug -> display name. The footer's casing wins, then the first spelling seen on a project.
  const services = new Map<string, string>()
  for (const name of FOOTER_SERVICES) services.set(slugify(name), name)
  for (const project of projects) {
    for (const item of project.services ?? []) {
      if (typeof item !== 'string' || !tidy(item)) continue
      const name = tidy(item)
      const slug = slugify(name)
      if (!services.has(slug)) services.set(slug, name)
      else if (services.get(slug) !== name) {
        console.log(`  merging "${name}" into "${services.get(slug)}"`)
      }
    }
  }

  const tx = client.transaction()

  console.log(`\nServices (${services.size}):`)
  for (const [slug, title] of services) {
    const _id = `service-${slug}`
    const exists = existingServiceIds.has(_id)
    console.log(`  ${exists ? 'exists ' : 'create '} ${_id}  "${title}"`)
    if (!exists) tx.createIfNotExists({_id, _type: 'service', title})
  }

  console.log('\nProjects:')
  for (const project of projects) {
    const items = project.services ?? []
    if (!items.some((item) => typeof item === 'string')) {
      console.log(`  skip    ${project._id}  (no string services)`)
      continue
    }

    const seen = new Set<string>()
    const next: unknown[] = []
    for (const item of items) {
      if (typeof item !== 'string') {
        next.push(item) // already a reference: keep as-is
        continue
      }
      if (!tidy(item)) continue
      const slug = slugify(tidy(item))
      if (seen.has(slug)) continue // same service listed twice on one project
      seen.add(slug)
      next.push({_type: 'reference', _key: slug, _ref: `service-${slug}`})
    }

    console.log(
      `  patch   ${project._id}  "${project.title ?? ''}": ` +
        items.filter((item) => typeof item === 'string').join(', '),
    )
    tx.patch(project._id, (patch) => patch.ifRevisionId(project._rev).set({services: next}))
  }

  if (!apply) {
    console.log('\nDry run only. Re-run with `-- --apply` to write these changes.')
    return
  }

  const result = await tx.commit()
  console.log(`\nApplied. Transaction ${result.transactionId}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

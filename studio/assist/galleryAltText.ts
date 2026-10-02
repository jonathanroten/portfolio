import {defineAssistFieldAction, type AssistFieldActionProps} from '@sanity/assist'
import {ImageIcon} from '@sanity/icons/Image'
import {useMemo, useRef} from 'react'
import {useToast} from '@sanity/ui/toast'
import {useClient} from 'sanity'
import {useDocumentPane} from 'sanity/structure'

type GalleryItem = {_key: string; asset?: {_ref?: string}; alt?: string}

// Tuned against the output of the built-in "Generate image description" button, whose own prompt
// isn't exposed, so the two read alike. The style examples are invented on purpose: real project
// content here would leak into other projects' alt text.
const ALT_TEXT_INSTRUCTION = `Write alternative text for this image: a single sentence that ends with a period, written as a noun phrase with no main verb. Start directly with the main subject, never with "Image of" or "Picture of". Use participles or prepositions to connect details, for example "Laptop displaying…", "…featuring…", "…next to…", "…on a black background".

Describe only the main subject and one or two clearly visible details such as color, material or setting. Do not interpret, speculate or list incidental background items.

If a logo, brand name or headline is visible, include that text verbatim in double quotes, written in normal capitalization rather than ALL CAPS. Do not transcribe personal names, contact details, body copy or fine print. If the sentence ends with quoted text, put the final period inside the closing quote and do not add a second one.

Aim for roughly 75 to 175 characters.

Style examples (invented, do not reuse their content):
- White "Acme Studio" logo and text on a reflective glass window.
- Laptop displaying a bakery website with a hand holding a croissant and the headline "Fresh Every Morning."
- Three light gray ring shapes joined at the center on a black background.`

// Images described per request. Fewer requests means fewer of the plugin's built-in
// "Success: Transform" toasts (it shows one per request) and a quicker run.
const BATCH_SIZE = 10

/**
 * Adds "Generate missing alt text" to the AI Assist menu on a project's gallery. It describes every
 * image whose alt is empty, in batches, and leaves images that already have alt text untouched.
 */
export function useGalleryAltTextActions(props: AssistFieldActionProps) {
  const {path, documentSchemaType, documentIdForAction, schemaId} = props
  const client = useClient({apiVersion: 'vX'})
  const toast = useToast()
  const running = useRef(false)

  // Not props.getDocumentValue: AI Assist captures that value once, when the menu first mounts, and
  // never refreshes it. A new project (or any images added since) would look empty.
  const {value: documentValue} = useDocumentPane()
  const documentValueRef = useRef(documentValue)
  documentValueRef.current = documentValue

  const isGallery =
    documentSchemaType.name === 'project' && path.length === 1 && path[0] === 'gallery'

  return useMemo(() => {
    if (!isGallery) return []

    return [
      defineAssistFieldAction({
        title: 'Generate missing alt text',
        icon: ImageIcon,
        onAction: async () => {
          if (running.current) return

          const gallery = (documentValueRef.current?.gallery ?? []) as GalleryItem[]
          const missing = gallery.filter((item) => item.asset?._ref && !item.alt?.trim())

          if (!missing.length) {
            toast.push({status: 'info', title: 'Every image already has alt text'})
            return
          }

          running.current = true
          toast.push({
            status: 'info',
            title: `Generating alt text for ${missing.length} ${missing.length === 1 ? 'image' : 'images'}…`,
          })

          const describe = (items: GalleryItem[]) =>
            client.agent.action.transform({
              schemaId,
              documentId: documentIdForAction,
              instruction: ALT_TEXT_INSTRUCTION,
              target: items.map((item) => ({
                path: [...path, {_key: item._key}, 'alt'],
                operation: {type: 'image-description' as const},
              })),
            })

          // Batches run in sequence since they all write to the same draft. If one fails, retry its
          // images individually so a single bad image can't block the rest.
          let failed = 0
          for (let i = 0; i < missing.length; i += BATCH_SIZE) {
            const batch = missing.slice(i, i + BATCH_SIZE)
            try {
              await describe(batch)
            } catch (error) {
              console.error('Alt text batch failed, retrying one by one', error)
              for (const item of batch) {
                try {
                  await describe([item])
                } catch (itemError) {
                  failed++
                  console.error('Alt text generation failed for', item._key, itemError)
                }
              }
            }
          }
          running.current = false

          const done = missing.length - failed
          toast.push(
            failed
              ? {
                  status: 'warning',
                  title: `Added alt text to ${done} of ${missing.length} images`,
                  description: 'Run it again to retry the rest.',
                }
              : {
                  status: 'success',
                  title: `Added alt text to ${done} ${done === 1 ? 'image' : 'images'}`,
                },
          )
        },
      }),
    ]
  }, [isGallery, toast, client, schemaId, documentIdForAction, path])
}

import type {ComponentProps} from 'react'
import type {MediaToolOptions} from 'sanity-plugin-media'
import {CASE_STUDY_TAG_NAME} from './caseStudyTag'

type DetailsComponent = NonNullable<NonNullable<MediaToolOptions['components']>['details']>

/**
 * Makes the Media plugin's Alt Text read-only on images tagged "Case Study". The site reads their
 * alt text from the case study, so the asset's copy would go unused. The plugin has no option for
 * this: it works because the plugin spreads whatever register() returns onto the input, so check
 * it after a plugin update. Read-only rather than disabled, so an existing value survives a save.
 */
export function AssetDetails({renderDefaultDetails, ...props}: ComponentProps<DetailsComponent>) {
  const isCaseStudyImage = props.assetTagOptions?.some((tag) => tag.label === CASE_STUDY_TAG_NAME)

  const register: typeof props.register = (name, options) => {
    const field = props.register(name, options)
    if (!isCaseStudyImage || !name.startsWith('altText')) return field
    return Object.assign({}, field, {
      readOnly: true,
      placeholder: `Tagged "${CASE_STUDY_TAG_NAME}": Alt Text is set on the case study`,
    })
  }

  return renderDefaultDetails({...props, register})
}

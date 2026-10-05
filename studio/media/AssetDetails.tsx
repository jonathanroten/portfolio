import type {ComponentProps} from 'react'
import type {MediaToolOptions} from 'sanity-plugin-media'
import {PROJECT_TAG_NAME} from './projectTag'

type DetailsComponent = NonNullable<NonNullable<MediaToolOptions['components']>['details']>

// The site reads a gallery image's alt text from its gallery item, never from the asset, so the
// Media plugin's own Alt Text field would only hold a second copy that nothing uses.
export function AssetDetails({renderDefaultDetails, ...props}: ComponentProps<DetailsComponent>) {
  const isProjectImage = props.assetTagOptions?.some((tag) => tag.label === PROJECT_TAG_NAME)

  // Makes Alt Text read-only. The plugin has no option for this; it works because the plugin
  // spreads whatever register() returns onto the input. Read-only rather than disabled, so a
  // value already there is kept on save instead of cleared.
  const register: typeof props.register = (name, options) => {
    const field = props.register(name, options)
    if (!isProjectImage || !name.startsWith('altText')) return field
    return Object.assign({}, field, {
      readOnly: true,
      placeholder: `Tagged "${PROJECT_TAG_NAME}": Alt Text is set in the project gallery`,
    })
  }

  return renderDefaultDetails({...props, register})
}

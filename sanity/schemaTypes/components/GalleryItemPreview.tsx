import {Badge} from '@sanity/ui'
import type {PreviewProps} from 'sanity'

type GalleryItemPreviewProps = PreviewProps & {aspectRatio?: string}

/**
 * Draws the default gallery item tile with its aspect ratio as a badge in the top-right corner, so
 * ratios can be told apart at a glance in the grid. Reads `aspectRatio` from the item's preview select.
 * Used by galleryItem.
 */
export function GalleryItemPreview(props: PreviewProps) {
  const {aspectRatio} = props as GalleryItemPreviewProps

  return (
    <div style={{position: 'relative'}}>
      {props.renderDefault(props)}
      {aspectRatio && (
        <div style={{position: 'absolute', top: 16, right: 16, pointerEvents: 'none'}}>
          <Badge tone="neutral" fontSize={1}>
            {aspectRatio}
          </Badge>
        </div>
      )}
    </div>
  )
}

import { FlatfileListener } from '@flatfile/listener'
import { csEntrySheet } from '../../blueprints'
import { simpleSpaceSetup } from '../../plugins/simple.space.setup'

/**
 * Configures a Flatfile space with an employee registry
 * workbook, sheets and actions.
 *
 * @param listener The FlatfileListener instance
 *
 * @returns void
 */
export function configureSpace(listener: FlatfileListener) {
  listener.use(
    simpleSpaceSetup({
      workbook: {
        name: 'Customer Success Entry Sheet',
        sheets: [csEntrySheet],
        actions: [
          {
            operation: 'review-data',
            mode: 'foreground',
            label: 'Request Review',
            type: 'string',
            description:
              'A representative from Acme Inc. will review your data.',
            primary: true,
          },
        ],
      },
    })
  )
}

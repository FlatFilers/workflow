import { FlatfileListener } from '@flatfile/listener'
import { configureSpace } from './src/jobs/space/configure'

/**
 * This default export is used by Flatfile to register event handlers for any
 * event that occurs within the Flatfile Platform.
 *
 * @param listener
 */
export default function (listener: FlatfileListener) {
  listener.use(configureSpace)
}

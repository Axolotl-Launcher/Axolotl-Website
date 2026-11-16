import { comarkContent } from 'comark-content'
import snapshot, { type SnapshotLoader } from 'comark-content/sources/snapshot'

import manifest from '../../.content/default/manifest.json'
import data from '../../.content/default/snapshot.json'

/**
 * Static content client. The snapshot is generated before Nuxt starts, so the
 * same instance works during prerendering and in the browser without an API.
 */
export const content = comarkContent({
  source: snapshot(data as unknown as SnapshotLoader, manifest as unknown as SnapshotLoader),
})

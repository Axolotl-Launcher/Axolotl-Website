import { comarkContent } from 'comark-content'
import fs from 'comark-content/sources/fs'
import schemaValidation from 'comark-content/plugins/schema-validation'
import toc from 'comark/plugins/toc'
import shiki from 'comark/plugins/shiki'
import { z } from 'zod'

import { contentFrontmatterSchema } from './shared/schemas/content.ts'

const content = comarkContent({
  source: fs('./content', {
    exclude: ['blog/**'],
    schema: z.toJSONSchema(contentFrontmatterSchema),
  }),
  plugins: [schemaValidation({ onError: 'throw' })],
  markdown: {
    plugins: [toc(), shiki()],
  },
})

export { content }
export default content

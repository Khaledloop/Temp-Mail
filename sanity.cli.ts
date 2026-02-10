import {defineCliConfig} from 'sanity/cli'

import {dataset, projectId} from './src/sanity/env'

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  deployment: {
    appId: 'zjk5tpvv1kaa1607wc4gnr1u',
  },
})

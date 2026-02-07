'use client'

import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'

import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schemaTypes} from './src/sanity/schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Temp Mail CMS',
  projectId,
  dataset,
  basePath: '/studio',
  apiVersion,
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
})

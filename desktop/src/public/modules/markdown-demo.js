import module from '@sillonious/module'
import { marked } from 'marked'

const $ = module('markdown-demo')

$.draw(() => marked(`
  # Hello World

  <hello-world></hello-world>
`))

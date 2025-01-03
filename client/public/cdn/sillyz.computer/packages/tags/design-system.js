import { tag } from "/deps.js"
import $user from "/packages/widgets/menu-user.js"

const $ = tag('design-system')

$.render(() => {
  const { colorVariables } = $user.read()

  return `
    <style>
      :root {
        ${colorVariables}
      }
    </style>
  `
})

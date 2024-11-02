import silly from '@silly/elf'

const $ = silly('stylized-forever')

$.draw(() => `
  <pre>
f
                       r
            o
                 e
                       v
            e                              r
  </pre>
`)

$.style(`
  & {
    display: block;
    overflow: auto;
    max-width: 100%;
  }
`)

import { EditorView, ViewPlugin, Decoration } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'

const RUNES = {
  '@': 'saga-character',   // character name
  '>': 'saga-dialogue',    // dialogue
  '#': 'saga-scene',       // scene heading (Int./Ext.)
  '^': 'saga-transition',  // transitions (Fade out, Cut to…)
  '<': 'saga-element',     // custom web components
}

function sagaLineDecorations(view) {
  const builder = new RangeSetBuilder()

  for (const { from, to } of view.visibleRanges) {
    let pos = from
    while (pos <= to) {
      const line = view.state.doc.lineAt(pos)
      const text = line.text.trimStart()
      const rune = text[0]
      const cls = RUNES[rune]

      if (cls) {
        builder.add(
          line.from,
          line.from,
          Decoration.line({ class: cls })
        )
      } else if (text.includes(':') && !text.startsWith(' ')) {
        // Split key: value — use mark decorations instead of line decoration
        const colonIdx = line.text.indexOf(':')
        if (colonIdx !== -1) {
          builder.add(
            line.from,
            line.from + colonIdx,
            Decoration.mark({ class: 'saga-meta-key' })
          )
          builder.add(
            line.from + colonIdx,
            line.from + colonIdx + 1,
            Decoration.mark({ class: 'saga-meta-colon' })
          )
          builder.add(
            line.from + colonIdx + 1,
            line.to,
            Decoration.mark({ class: 'saga-meta-value' })
          )
        }
      } else if (text.length > 0) {
        // plain text = action / description
        builder.add(
          line.from,
          line.from,
          Decoration.line({ class: 'saga-action' })
        )
      }

      pos = line.to + 1
    }
  }

  return builder.finish()
}

export const sagaSyntaxHighlighter = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = sagaLineDecorations(view)
    }
    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = sagaLineDecorations(update.view)
      }
    }
  },
  { decorations: v => v.decorations }
)

export const sagaTheme = EditorView.theme({
  '.saga-scene':      { color: '#fabd2f' },   // bright_yellow
  '.saga-character':  { color: '#83a598' },   // bright_aqua
  '.saga-dialogue':   { color: '#8ec07c' },   // neutral_teal
  '.saga-transition': { color: '#fe8019' },   // bright_orange
  '.saga-element':    { color: '#b16286' },   // neutral_purple
  '.saga-meta-key':   { color: '#a89984' },   // light4 (dimmer)
  '.saga-meta-colon': { color: '#665c54' },   // bg3 (really recedes)
  '.saga-meta-value': { color: '#fbf1c7' },   // fg0 (brightest)
  '.saga-action':     { color: '#bdae93' },   // light3
})

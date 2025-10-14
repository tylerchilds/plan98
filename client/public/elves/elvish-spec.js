import elf from '@silly/elf'
import { marked } from "marked"

fetch('/public/sagas/sillyz.computer/elvish-spec.md')
  .then(x => x.text())
  .then(main)

function main(data) {
  function decodeHtmlEntities(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }

  const renderer = new marked.Renderer();

  renderer.codespan = (code) => {
    return `<code>${escapeHyperText(decodeHtmlEntities(code))}</code>`;
  };

  // Override code block rendering
  renderer.code = (code, language) => {
    let decodedCode = decodeHtmlEntities(code); // First decode pass
    decodedCode = decodeHtmlEntities(decodedCode); // Second decode to fix double encoding

    const langClass = language ? ` class="language-${language}"` : "";
    return `<pre><code${langClass}>${escapeHyperText(decodedCode)}</code></pre>`;
  };

  marked.setOptions({
    renderer,
    gfm: true,        // Enable GitHub Flavored Markdown
    breaks: false,    // Keep standard line breaks
    sanitize: false,
    smartypants: false, // Prevent automatic quote conversions
  });

  marked.use({
    extensions: [{
      name: 'static-code',
      level: 'block',
      start(src) { return src.match(/<static-code>/)?.index; },
      tokenizer(src) {
        const match = src.match(/^<static-code>\n?([\s\S]*?)\n?<\/static-code>/);
        if (match) {
          return {
            type: 'static-code',
            raw: match[0],
            text: match[1]  // Raw content without parsing
          };
        }
      },
      renderer(token) {
        // Return your custom HTML with vim/syntax highlighting
        return `<static-code>${token.text}</static-code>`;
      }
    }]
  });

  const $ = elf('elvish-spec')
  const html = marked.parse(data)
  const cache = `
    <div class="wizard">
      ${html}
    </div>
  `
  $.draw(_=>cache)
}

function escapeHyperText(text = '') {
  return text.replace(/[&<>'"]/g, 
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}

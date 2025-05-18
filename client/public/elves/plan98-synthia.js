import elf from '@silly/elf'
import diffHTML from 'diffhtml'
const $ = elf('body')

const tooltip = document.getElementById('selection-tooltip');

  // Handle text selection
$.when('mouseup', '*', function(event) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Hide tooltip if no text is selected or if selection is too short
    if (!selectedText || selectedText.length < 2) {
      $.teach({ selectedText: null })
      return;
    }

    // Position the tooltip above the selection
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    $.teach({ selectedText, rect: { ...rect } })

  });

// Hide tooltip when clicking elsewhere
$.when('mousedown', '*', function(event) {
  if (event.target !== tooltip) {
    $.teach({ selectedText: null })
  }
});

const context = document.createElement('div')
context.classList.add('plan98-synthia')
document.body.appendChild(context)

$.draw(() => null, {
  afterUpdate(target) {
    if(self.self === self.top) {
      const { rect, selectedText } = $.learn()
      console.log({ rect, selectedText })
      diffHTML.innerHTML(context, selectedText ? `
        <div class="hi">
          <button>Synthia</button>
        </div>
        <div>
          <input value="${selectedText}" />
        </div>
      `: '')
    }
  }
})

$.style(`
  .plan98-synthia {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
`)

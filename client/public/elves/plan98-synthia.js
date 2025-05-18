import elf from '@silly/elf'
import diffHTML from 'diffhtml'
const $ = elf('plan98-synthia')

const tooltip = document.getElementById('selection-tooltip');

  // Handle text selection
$.when('mouseup', '*', function(event) {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  // Hide tooltip if no text is selected or if selection is too short
  if (!selectedText || selectedText.length < 2) {
    //$.teach({ selectedText: null })
    return;
  }

  // Position the tooltip above the selection
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  $.teach({ selectedText, rect: { ...rect } })

});

// Hide tooltip when clicking elsewhere
$.when('mousedown', '*', function(event) {
  if (event.target !== tooltip && !event.target.closest('.plan98-synthia')) {
    $.teach({ selectedText: null })
  }
});

const context = document.createElement('plan98-synthia')
context.classList.add('plan98-synthia')
document.body.appendChild(context)

$.draw(() => null, {
  afterUpdate(target) {
    if(self.self === self.top) {
      const { rect, activated, selectedText } = $.learn()
      console.log({ rect, selectedText })
      diffHTML.innerHTML(context, selectedText ? `
        <div class="activator-bar">
          <button class="synthia">Synthia</button>
        </div>
        ${activated ? `
          <div class="result activated">
            <input value="${selectedText}" />
          </div>
        ` : `
          <div class="result">
            <input value="${selectedText}" />
          </div>
        `}
      `: '')
    }
  }
})

$.when('click', '.synthia', (event) => {
  $.teach({ activated: !$.learn().activated })
})

$.style(`
  .plan98-synthia {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 900000;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  .plan98-synthia .result {
    pointer-events: all;
    background: white;
    position: relative;
    z-index: 900000;
    transform: translateY(100%);
    transition: transform 100ms ease-in-out;
  }

  .plan98-synthia .result.activated {
    transform: translateY(0);
  }

  .plan98-synthia .activator-bar {
    pointer-events: all;
    position: relative;
    z-index: 900000;
    display: flex;
    place-content: center;
  }
`)

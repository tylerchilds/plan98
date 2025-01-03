import $, { tooltip } from './tooltip.js';

$.on('click', `:not(ctx-tooltip)`, hide);

export function popover(event, content) {
  tooltip(event, content);
}

function hide(event) {
  if(event.target.closest('ctx-tooltip')) return
  tooltip();
}

import elf from '@silly/elf'
import jspreadsheet from 'jspreadsheet-ce'

const $ = elf('spread-sheet', { rowData: [] })

function mods(x) {
  const table = {
  }
  return table[x] ? table[x] : {}
}
$.draw((target) => {
  const { rowData } = $.learn()

  if(!target.fetched) {
    target.fetched = true

    jspreadsheet(target, {
      csv: target.getAttribute('src'),
      defaultColWidth: 120,
      csvHeaders:true,
    });
  }
})

$.style(`
  & {
    background: white;
    color: black;
    width: 100%;
    height: 100%;
    display: block;
    overflow: auto;
  }
`)


// Dynamically load AG Grid CSS
const cssUrl1 = 'https://esm.sh/jspreadsheet-ce@4.15.0/dist/jspreadsheet.css';

loadCSS(cssUrl1);

function loadCSS(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

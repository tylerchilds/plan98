import elf from '@silly/elf'
import { Grid } from 'ag-grid-community';
import Papa from 'papaparse'

const $ = elf('data-grid', { rowData: [] })

function mods(x) {
  const table = {
  }
  return table[x] ? table[x] : {}
}

$.draw((target) => {
  const { rowData } = $.learn()

  if(!target.fetched) {
    target.fetched = true
    Papa.parse(target.getAttribute('src'), {
      download: true,
      complete: function(results) {
        if(results.errors.length === 0) {
          $.teach({ rowData: results.data })
        }
      }
    })
  }

  target.classList.add('ag-theme-custom')

  const sample = rowData[0]

  if(!sample) return

  const columnDefs = sample.map((x, i) => {
    return { headerName: x, field: `${i}`, flex: 1, ...mods(x) }
  })

  const gridOptions = {
    rowHeight: '42px',
    columnDefs,
    rowData: rowData.slice(1, -1),
    autoSizeStrategy: {
      type: 'fitCellContents'
    },
  };

  new Grid(target, gridOptions);
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
const cssUrl1 = 'https://esm.sh/ag-grid-community@31.3.1/styles/ag-grid.css';
const cssUrl2 = '/cdn/fantasysports.social/table.css';

loadCSS(cssUrl1);
loadCSS(cssUrl2);

function loadCSS(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

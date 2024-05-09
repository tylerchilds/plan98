import module from '@silly/tag'
import { Grid } from 'https://esm.sh/ag-grid-community';

// Dynamically load AG Grid CSS
const cssUrl1 = 'https://esm.sh/ag-grid-community@31.3.1/styles/ag-grid.css';
const cssUrl2 = 'https://esm.sh/ag-grid-community@31.3.1/styles/ag-theme-alpine.css';

loadCSS(cssUrl1);
loadCSS(cssUrl2);

function loadCSS(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

const $ = module('hello-table')

$.draw((target) => {
  const gridOptions = {
    columnDefs: [
      { headerName: "Make", field: "make" },
      { headerName: "Model", field: "model" },
      { headerName: "Price", field: "price" }
    ],
    rowData: [
      { make: "Toyota", model: "Celica", price: 35000 },
      { make: "Ford", model: "Mondeo", price: 32000 },
      { make: "Porsche", model: "Boxster", price: 72000 }
    ]
  };


  new Grid(target, gridOptions);
})

$.style(`
  & {
    display: block;
    height: 280px;
  }
`)


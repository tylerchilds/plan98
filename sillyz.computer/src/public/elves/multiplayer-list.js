import module from '@silly/tag'
import { Grid } from 'ag-grid-community';

const minWidth = 60

const $ = module('multiplayer-list')

$.draw((target) => {
  const { id } = target.dataset

  const rowData = [
    {
      max: 8,
      size: 3,
      name: 'chill wavers',
      vibe: 'silly'
    },
    {
      max: 8,
      size: 1,
      name: 'metal4metal',
      vibe: 'amped'
    },
    {
      max: 8,
      size: 8,
      name: 'bluesy-two-shoes',
      vibe: 'down'
    },
  ]

  const columnDefs = [
    {
      headerName: 'x / y',
      valueGetter: function({ data }) {
        return data.max + '/' + data.size;
      },
      minWidth: 60,
    },
    {
      headerName: 'Room',
      field: 'name',
      minWidth: 200,
    },
    {
      headerName: 'Vibe',
      field: 'vibe',
      minWidth: 60,
    }
  ]

  const gridOptions = {
    rowHeight: '42px',
    minWidth: '42px',
    columnDefs,
    rowData
  };

  new Grid(target, gridOptions);
  gridOptions.api.sizeColumnsToFit();

})

$.when('click', '.new', ({ target }) => {
  const { id } = target.dataset
  updateInstance(id, { nextPanel: PANEL_CREATE })
})

$.when('click', '.join', ({ target }) => {
  const { id } = target.dataset
  updateInstance(id, { nextPanel: PANEL_LIST })
})

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

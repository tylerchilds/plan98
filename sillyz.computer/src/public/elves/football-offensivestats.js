import module from '@silly/tag'
import { Grid } from 'ag-grid-community';
import { createClient } from '@supabase/supabase-js'

function mods(x) {
  const table = {
    teams: { headerName: "Teams", minWidth: 200 }
  }
  return table[x] ? table[x] : {}
}

const url = "https://alhvsudxbwemectbuqro.supabase.co"
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsaHZzdWR4YndlbWVjdGJ1cXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjU3MTc5OTksImV4cCI6MTk4MTI5Mzk5OX0.fvfrU2TACETuv21wt0VAfYVeUAuO0MIaV1-CmVcMmGw"

const $ = module('football-offensivestats')

const minWidth = 80


$.draw(async (target) => {
  const { year } = target.dataset
  const supabase = createClient(url, key)
  let { data: rowData, error } = await supabase
  .from(`nfl_teams_offensive_stats_${year}`)
  .select('*')
  .range(0, 99)

  target.classList.add('ag-theme-custom')

  const sample = rowData[0]

  const columnDefs = Object.keys(sample).map(x => {
    return { headerName: x, field: x, minWidth, ...mods(x) }
  })

  const gridOptions = {
    rowHeight: '42px',
    minWidth: '42px',
    columnDefs,
    rowData
  };

  new Grid(target, gridOptions);
  gridOptions.api.sizeColumnsToFit();
})

$.style(`
  & {
    display: block;
    min-height: 280px;
    height: 100%;
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

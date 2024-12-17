import module from '@silly/tag'
import { Grid } from 'ag-grid-community';
import { createClient } from '@supabase/supabase-js'

const url = "https://alhvsudxbwemectbuqro.supabase.co"
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsaHZzdWR4YndlbWVjdGJ1cXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjU3MTc5OTksImV4cCI6MTk4MTI5Mzk5OX0.fvfrU2TACETuv21wt0VAfYVeUAuO0MIaV1-CmVcMmGw"

const $ = module('baseball-players')

const minWidth = 60

// Column definitions including the new "Team" column
var columnDefs = [
    { headerName: "ID (yahoo)", field: "yahoo_id", minWidth }, // Column for Team
    { headerName: "Pre-Rank", field: "pre_rank", minWidth },
    { headerName: "Full Name", field: "full_name", minWidth: 200 }, // Column for Team
    { headerName: "Last Name", field: "last_name", minWidth },
    { headerName: "First Name", field: "first_name", minWidth },
    { headerName: "ADP", field: "adp", minWidth },
    { headerName: "AAC", field: "aac", minWidth },
    { headerName: "Projected $", field: "projected_value", minWidth },
    { headerName: "Position", field: "position", minWidth },
    { headerName: "Team", field: "team", minWidth },
    { headerName: "Roster Percent", field: "roster_percent", minWidth },
    { headerName: "Is New", field: "is_new", minWidth },
    { headerName: "Position Changed", field: "position_changed", minWidth },
    { headerName: "Position Gained", field: "position_gained", minWidth },
    { headerName: "Position Lost", field: "position_lost", minWidth },
];

$.draw(async (target) => {

  const supabase = createClient(url, key)
  let { data: yahoo_baseball_players_2024, error } = await supabase
  .from('yahoo_baseball_players_2024')
  .select('*')
  .range(0, 99)

  console.log(yahoo_baseball_players_2024, error)

  target.classList.add('ag-theme-custom')

  const gridOptions = {
    rowHeight: '42px',
    minWidth: '42px',
    columnDefs: columnDefs,
    rowData: yahoo_baseball_players_2024
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

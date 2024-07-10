import module from '@silly/tag'
import { Grid } from 'ag-grid-community';

const $ = module('football-catches')

$.draw((target) => {
  target.classList.add('ag-theme-custom')
  const gridOptions = {
    rowHeight: '42px',
    columnDefs: [
      { headerName: "Team", field: "team" },
      { headerName: "RBC", field: "rbc" },
      { headerName: "SPT", field: "spt" },
      { headerName: "RYD", field: "ryd" },
      { headerName: "YD", field: "yd" },
      { headerName: "YC", field: "yc" },
      { headerName: "TGT", field: "tgt" },
      { headerName: "TD", field: "td" },
      { headerName: "RK", field: "rk" },
    ],
    rowData: [
      { team: "Denver Broncos", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "New York Jets", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "New Orleans Saints", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Miami Dolphins", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "New England Patriots", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Pittsburgh Steelers", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "San Francisco 49ers", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Kansas City Chiefs", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Washington Commanders", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Atlanta Falcons", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Dallas Cowboys", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Tampa Bay Buccaneers", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Tennessee Titans", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Chicago Bears", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Detroit Lions", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Cincinnati Bengals", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Philadelphia Eagles", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Carolina Panthers", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "New York Giants", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Las Vegas Raiders", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Buffalo Bills", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Jacksonville Jaguars", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Minnesota Vikings", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Cleveland Browns", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Green Bay Packers", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Seattle Seahawks", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Los Angeles Chargers", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Arizona Cardinals", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Indianapolis Colts", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Houston Texans", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Baltimore Ravens", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
      { team: "Los Angeles Rams", rbc: 131, spt: .389, ryd: 35000, yd: .239, yc: 6.50, tgt: 153, td: 4, rk: 1 },
    ]
  };


  new Grid(target, gridOptions);
  gridOptions.api.sizeColumnsToFit();
})

$.style(`
  & {
    display: block;
    height: 280px;
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

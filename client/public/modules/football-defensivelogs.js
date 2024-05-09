import module from '@silly/tag'
import { Grid } from 'ag-grid-community';

const $ = module('football-defensivelogs')

var teams = [
    "Houston Texans",
    "Cincinnati Bengals",
    "Indianapolis Colts",
    "Cleveland Browns",
    "Pittsburgh Steelers",
    "Tennessee Titans - L",
    "Detroit Lions",
    "Arizona Cardinals",
    "Seattle Seahawks",
    "Cleveland Browns",
    "Cincinnati Bengals",
    "Los Angeles Chargers",
    "Los Angeles Rams",
    "Jacksonville Jaguars",
    "San Francisco 49ers",
    "Miami Dolphins",
    "Pittsburgh Steelers"
];

// Generate random data for each team
var rowData = teams.map(function(team) {
    return {
        Team: team,
        Plays: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for Plays
        TOP: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for TOP
        POS: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for POS
        FG: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for FG
        TDs: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for TDs
        PTs: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for PTs
        "FB/R": Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for FB/R
        INT: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for INT
        DTD: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for DTD
        SP: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for SP
        RATT: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for RATT
        YDS: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for YDS
        YA: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for YA
        QRA: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for QRA
        QRY: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for QRY
        QTD: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for QTD
        WRA: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for WRA
        WRY: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for WRY
        WTD: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for WTD
        CMP: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for CMP
        ATT: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for ATT
        PTDs: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for PTDs
        SKs: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for SKs
        RBC: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for RBC
        RYD: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for RYD
        TGT: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for TGT
        RTD: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for RTD
        WRC: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for WRC
        WYD: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for WYD
        WTGT: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for WTGT
        WRTD: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for WRTD
        TC: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for TC
        TYD: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for TYD
        TTGT: Math.floor(Math.random() * 1000) + 1, // Random number between 1 and 1000 for TTGT
        TRTD: Math.floor(Math.random() * 1000) + 1 // Random number between 1 and 1000 for TRTD
    };
});

const minWidth = 60

// Column definitions including the new "Team" column
var columnDefs = [
    { headerName: "Team", field: "Team", minWidth: 200 }, // Column for Team
    { headerName: "Plays", field: "Plays", minWidth },
    { headerName: "TOP", field: "TOP", minWidth },
    { headerName: "POS", field: "POS", minWidth },
    { headerName: "FG", field: "FG", minWidth },
    { headerName: "TDs", field: "TDs", minWidth },
    { headerName: "PTs", field: "PTs", minWidth },
    { headerName: "FB/R", field: "FB/R", minWidth },
    { headerName: "INT", field: "INT", minWidth },
    { headerName: "DTD", field: "DTD", minWidth },
    { headerName: "SP", field: "SP", minWidth },
    { headerName: "RATT", field: "RATT", minWidth },
    { headerName: "YDS", field: "YDS", minWidth },
    { headerName: "YA", field: "YA", minWidth },
    { headerName: "QRA", field: "QRA", minWidth },
    { headerName: "QRY", field: "QRY", minWidth },
    { headerName: "QTD", field: "QTD", minWidth },
    { headerName: "WRA", field: "WRA", minWidth },
    { headerName: "WRY", field: "WRY", minWidth },
    { headerName: "WTD", field: "WTD", minWidth },
    { headerName: "CMP", field: "CMP", minWidth },
    { headerName: "ATT", field: "ATT", minWidth },
    { headerName: "PTDs", field: "PTDs", minWidth },
    { headerName: "SKs", field: "SKs", minWidth },
    { headerName: "RBC", field: "RBC", minWidth },
    { headerName: "RYD", field: "RYD", minWidth },
    { headerName: "TGT", field: "TGT", minWidth },
    { headerName: "RTD", field: "RTD", minWidth },
    { headerName: "WRC", field: "WRC", minWidth },
    { headerName: "WYD", field: "WYD", minWidth },
    { headerName: "WTGT", field: "WTGT", minWidth },
    { headerName: "WRTD", field: "WRTD", minWidth },
    { headerName: "TC", field: "TC", minWidth },
    { headerName: "TYD", field: "TYD", minWidth },
    { headerName: "TTGT", field: "TTGT", minWidth },
    { headerName: "TRTD", field: "TRTD" }
];

console.log(rowData); // Random data for each team
console.log(columnDefs);

$.draw((target) => {
  target.classList.add('ag-theme-custom')
  const gridOptions = {
    rowHeight: '42px',
    minWidth: '42px',
    columnDefs: columnDefs,
    rowData: rowData
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

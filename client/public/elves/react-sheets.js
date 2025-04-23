import elf from '@silly/elf'
import Konva from 'https://registry.rowsncolumns.app/konva/lib/Core.js';
import { Konva as KonvaFull}  from 'https://registry.rowsncolumns.app/konva/lib/_FullInternals.js';

import React from "https://registry.rowsncolumns.app/react";
import { jsx } from "https://registry.rowsncolumns.app/react/jsx-runtime";
import { createRoot } from "https://registry.rowsncolumns.app/react-dom/client";
import { CanvasGrid } from "https://registry.rowsncolumns.app/@rowsncolumns/spreadsheet?deps=react@19";

Object.assign(Konva, KonvaFull)

const $ = elf('react-sheets')

$.draw(target => {
  if(target.innerHTML) return

  const App = () => {
    return jsx(React.StrictMode, {
      children: [
        jsx("div", {
          style: { height: 300, width: 800, display: "flex", position: 'relative' },
          children: jsx(CanvasGrid, {
            rowCount: 10,
            columnCount: 10,
            sheetId: 1,
            licenseKey: plan98.env.ROWS_N_COLUMNS_LICENSE_KEY
          }),
        }),
      ],
    });
  };

  createRoot(target).render(jsx(App, {}));
})

const cssUrl1 = 'https://registry.rowsncolumns.app/@rowsncolumns/spreadsheet/dist/spreadsheet.min.css';

loadCSS(cssUrl1);

function loadCSS(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

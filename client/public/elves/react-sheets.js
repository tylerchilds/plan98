import elf from '@silly/elf'
import Konva from 'konva';
import { Konva as KonvaFull}  from 'konva-full';

import React from "react";
import { jsx } from "jsx-runtime";
import { createRoot } from "react-dom/client";
import { CanvasGrid } from "@rowsncolumns/spreadsheet";

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

const cssUrl1 = 'https://registry.rowsncolumns.app/@rowsncolumns/spreadsheet@7.0.8/dist/spreadsheet.min.css';

loadCSS(cssUrl1);

function loadCSS(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

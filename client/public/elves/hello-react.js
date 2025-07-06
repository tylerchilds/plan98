import elf from '@plan98/elf'

import React from "react";
import { jsx } from "jsx-runtime";
import { createRoot } from "react-dom/client";

// Main spreadsheet imports
const $ = elf('hello-react')

const App = () => {
  return jsx(React.StrictMode, {
    children: [
      jsx("div", {
        style: {
          height: "100%",
          width: "100%",
          display: "grid",
          position: "relative",
          placeContent: "center"
        },
        children: jsx('hello-world', {}),
      }),
    ],
  });
};

$.draw(target => {
  if(target.innerHTML) return
  createRoot(target).render(jsx(App, {}));
})

$.style(`
  & {
    display; block;
    height: 100%;
    width: 100%;
  }
`)


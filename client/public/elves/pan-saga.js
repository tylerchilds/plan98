import { PanSaga } from "pan-saga";
const tag = "pan-saga"
customElements.define(tag, PanSaga);

/*
  and this is where you add custom mods when the standards orgs get the api wrong
*/

// break in case of emergency
// import('@plan98/types').then(({Self})=> { const $ = Self(tag)/*; Self($)*/ })

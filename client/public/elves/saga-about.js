/*

<#^@>

Welcome to E.L.F.

This is a secure page. Each line invokes a command in the E.L.F. system.

Learn the language of the E.L.F. and you will be blessed with their abilities.

*/

import elf from '@silly/elf'
import { r } from '@sillonious/saga'

const $ = elf('saga-about')

$.draw(() => {

  return `
    <a href="javascript:history.length===1?close():history.back()" style="float: left;">
      ${r($, '/public/sagas/sillyz.computer/en-us/saga-about.back.saga')}
    </a>

    <h1>
      ${r($, '/public/sagas/sillyz.computer/en-us/saga-about.header.saga')}
    </h1>

    <a href="/app/silly-wizard?dialect=en-us">
      ${r($, '/public/sagas/sillyz.computer/en-us/saga-about.english.saga')}
    </a>

    <a href="/app/code-module?src=/public/elves/saga-about.js">
      ${r($, '/public/sagas/sillyz.computer/en-us/saga-about.js.saga')}
    </a>

    <hr>

    <div class="fine-print">
      <p>
        ${r($, '/public/sagas/sillyz.computer/en-us/saga-about.memex.saga')}
      </p>

      <p>
        ${r($, '/public/sagas/sillyz.computer/en-us/saga-about.privacy.saga')}
      </p>

      <p>
        ${r($, '/public/sagas/sillyz.computer/en-us/saga-about.terms.saga')}
      </p>
    </div>

    <a href="mailto:player1@sillyz.computer">
      ${r($, '/public/sagas/sillyz.computer/en-us/saga-about.mailto.label.saga')}
    </a>
  `

})

$.style(`
  & {
    padding: 1rem;
    max-width: 55ch;
    text-align: right;
    display: block;
    margin: auto;
    font-size: 2rem;
    background: white;
    height: 100%;
    overflow: auto;
  }

  & a:link,
  & a:visited {
    padding: 1rem;
    color: rgba(0,0,0,.85);
    text-decoration: none;
    display: inline-block;
  }

  & .fine-print {
    font-family: courier;
    font-size: 13px;
    line-height: 2;
  }
`)

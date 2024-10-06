/*

<@#>

Welcome to E.L.F.

This is a secure page. Each line invokes a command in the E.L.F. system.

Learn the language of the E.L.F. and you will be blessed with their abilities.

*/

import elf from '@silly/tag'

const $ = elf('saga-about')

$.draw(() => {

  return `

    <h1>

      More languages coming soon!

    </h1>

    <a href="javascript:history.back()">

      Back

    </a>

    <a href="/sagas/sillyz.computer/en-us/about.saga">

      English

    </a>

    <a href="/app/code-module?src=/public/elves/saga-about.js">

      JavaScript (en-us)

    </a>

    <hr>

    <div class="fine-print">
      <p>
        this internet experience is founded on performance, security, and transparency as the three pillars. the foundation (plan98) is permissible in multiple license formats, but the live installation is protected under the MIT license under legal advice provided to the author. the spirit of the project is personal access to all knowledge for all persons, a form of memory expansion: a memex.
      </p>

      <p>
        all artists retain full ownership and copyrights to their material, processes, and products. their works are not and will not be used to train generative models for deriving derivative works.
      </p>

      <p>
        for questions comments or concerns, contact player one
      </p>
    </div>

    <a href="mailto:player1@sillyz.computer">
      player1@sillyz.computer
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
  }

  & a:link,
  & a:visited {
    padding: 1rem;
    color: rgba(0,0,0,.85);
    text-decoration: none;
  }

  & .fine-print {
    font-family: courier;
    font-size: 13px;
    line-height: 2;
  }
`)

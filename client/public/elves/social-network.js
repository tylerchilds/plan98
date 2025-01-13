import elf, { state } from '@silly/tag'
import { showModal } from './plan98-modal.js'

const $ = elf('social-network')

$.draw((target) => {
  const loggedIn = !!state['ls/supabase.auth.token']
  if(loggedIn) {
    target.innerHTML = `
      <supabase-logout></supabase-logout>
      <supabase-profile></supabase-profile>
      <supabase-social></supabase-social>
    `
    return
  }

  target.innerHTML = `
    <supabase-login></supabase-login>
  `
})

$.style(`
  & {
    display: block;
    position: relative;
  }

  & supabase-logout {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    color: white;
  }

  & supabase-logout > * {
    position: relative;
    z-index: 3;
  }

  & supabase-logout::before {
    height: 4rem;
    content: '';
    background: linear-gradient(rgba(0,0,0,.6) 50%, rgba(0,0,0,0));
    width: 100%;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
  }

  & .auth {
    display: flex;
    justify-content: end;
    gap: .5rem;
    flex-wrap: wrap;
    padding: .5rem;
  }

  & .register,
  & .login {
    border: none;
    border-radius: 0;
    color: black;
    padding: .25rem .5rem;
    text-decoration: none;
    opacity: .75;
    transition: opacity 150ms;
  }

  & .register:hover,
  & .login:hover,
  & .register:focus,
  & .login:focus {
    opacity: 1;
  }

  & .register {
    background: rgba(0,0,0,.25);
  }

  & .login {
    background: navy;
    color: white;
  }

  & [data-share] {
    border: none;
    border-radius: none;
    background: navy;
    padding: 1rem;
    font-size: 1.5rem;
    color: white;
    opacity: .75;
    transition: opacity 150ms;
  }

  & [data-share]:hover,
  & [data-share]:focus {
    opacity: 1;
  }

  & .row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
    justify-content: center;
  }

  & .row a {
    display: block;
    text-align: center;
    text-decoration: none;
  }

  & img {
    margin: 2rem auto;
    display: block;
    padding: .5rem;
  }
`)

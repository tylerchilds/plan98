import elf, { state }  from '@silly/tag'
import supabase from '@sillonious/database'
import { $ as $login } from './hive-login.js'

const $ = elf('secure-following', { following: [] })

$.draw((target) => {
  mount(target)

  const { following, loading } = $.learn()
  if(loading) {
    return 'Loading...'
  }

  return following.length > 0 ? `
    <div class="relationship-group">
      ${following.map(render).join('')}
    </div>
  ` : `
    Find some friends to follow
  `
}, {
  afterUpdate: (target) => {
    recoverElves(target, 'sl-icon')
  }
})

function render(following) {
  return `
    <div class="relationship-member">
      <a class="member-picture" href="/app/secure-profile?data-user=${following.user_id}">
        <img  src="${following.picture || '/public/cdn/sillyz.computer/default-picture.png' }" />
      </a>
      <div class="member-handle" data-tooltip="${following.moniker}@${following.organization}">
        ${following.nick || following.moniker}
      </div>
      <div class="member-remove" data-target="${following.target_id}">
        ${following.approved ? `
          <button class="inline-action unfollow" >
            <span>
              <sl-icon name="door-closed"></sl-icon>
            </span>
            Unfollow
          </button>
        `:`
          <button class="inline-action unfollow" data-target="${following.target_id}">
            <span>
              <sl-icon name="door-closed"></sl-icon>
            </span>
            Remove Request
          </button>
        `}
      </div>
    </div>

  `
}

$.when('click', '.unfollow', async (event) => {
  const { target } = event.target.dataset

  const { error } = await supabase
    .from('friendcryption')
    .delete()
    .eq('target_id', target);

    if (error) {
      console.error('Error deleting row:', error);
      return
    }

  query()
})

function mount(target) {
  if(target.mounted) return
  target.mounted = true
  $.teach({ loading: true })

  query()
}

async function query() {
  const userId = $login.learn().user?.id

  const { data: followingData, error: followingError } = await getFollowingWithMutual(userId)

  $.teach({ loading: false })
  if(followingError) {
    console.error(followingError)
  } else {
    $.teach({ following: followingData })
  }
}

async function getFollowingWithMutual(userId) {
  const { data: personaData, error: personaError } = await supabase
    .from('persona')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (personaError || !personaData) {
    console.error('Error fetching persona:', personaError);
    return { data: null, error: personaError };
  }

  const personaId = personaData.id;

  const { data: followingData, error: followingError } = await supabase.rpc(
    'get_following_with_mutual',
    { current_persona_id: personaId }
  );

  if (followingError) {
    console.error('Error fetching following with mutual:', followingError);
    return { data: null, error: followingError };
  }

  return { data: followingData };
}

$.style(`
  & {
    display: block;
    max-width: 55ch;
    margin: auto;
  }

  & .relationship-group {
    display: flex;
    flex-direction: column;
  }

  & .relationship-member {
    display: grid;
    grid-template-columns: 32px 1fr auto;
    border-radius: 4px;
    background: rgba(255,255,255,.15);
    gap: 1rem;
    align-items: center;
  }

  & .member-handle {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  & .member-picture img {
    width: 32px;
    height: 32px;
    object-fit: cover;
  }

  & .inline-action {
    background: transparent;
    color: rgba(0,0,0,.65);
    border: none;
    border-radius: 0;
    border: 1px solid rgba(0,0,0,.65);
    padding: .25rem .5rem;
    border-radius: 2px;
  }

  & .inline-action:hover,
  & .inline-actions:focus {
    border: 1px solid rgba(0,0,0,.85);
    color: rgba(0,0,0,.85);
    background: rgba(0,0,0,.25);
  }

`)

function recoverElves(target, tag) {
  [...target.querySelectorAll(tag)].map(node => {
    const newNode = document.createElement(tag)
    for (const attr of node.attributes) {
      newNode.setAttribute(attr.name, attr.value)
    }
    node.replaceWith(newNode)
  })
}

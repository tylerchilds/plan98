import RAPIER from '@dimforge/rapier2d';
import module from '@silly/tag';

const $ = module('rapier-2d', { instances: [] })

async function run_simulation(target) {
  if(target.started) return
  target.started = true
  await RAPIER.init();
  const gravity = { x: 0.0, y: -9.81 };
  const world = new RAPIER.World(gravity);

  // Create the ground
  const groundColliderDesc = RAPIER.ColliderDesc.cuboid(100.0, 0.1);
  world.createCollider(groundColliderDesc);

  // Create a dynamic rigid-body.
  const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(0.0, 1.0);
  const rigidBody = world.createRigidBody(rigidBodyDesc);

  // Create a cuboid collider attached to the dynamic rigidBody.
  const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5);
  const collider = world.createCollider(colliderDesc, rigidBody);

  // Game loop. Replace by your own game loop system.
  const gameLoop = () => {
    // Ste the simulation forward.
    world.step();

    // Get and print the rigid-body's position.
    const position = rigidBody.translation();

    const { id } = target
    updateInstance({ id }, { id, position })
    setTimeout(gameLoop, 16);
  };

  gameLoop();
}

$.draw((target) => {
  run_simulation(target)
  const { position } = instance(target)

  if(position) {
    target.style.setProperty('--local-x', `${position.x*100}px`)
    target.style.setProperty('--local-y', `${position.y*100}px`)
  }

  return `
    <div class="box"></div>
  `
})

$.style(`
  & {
    background: linear-gradient(dodgerblue,green);
    height: 200px;
    display: block;
  }

  & .box {
    transform: translate(var(--local-x,0), var(--local-y,0));
    width: 100px;
    height: 100px;
    background: orange;
  }
`)

function instance(target) {
  const root = target.closest($.link)
  return $.learn().instances[root.id] || {}
}

function updateInstance({ id }, payload) {
  $.teach({...payload}, (s, p) => {
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          ...p
        }
      }
    }
  })
}


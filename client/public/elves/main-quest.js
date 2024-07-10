import module from '@silly/tag'
import HavokPhysics from 'havok'
import BABYLON from 'babylonjs'

const $ = module('main-quest')

$.style(`
  & {
		display: block;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
  }
	& canvas {
		width: 100%;
		height: 100%;
	}
`)

const canvas = document.createElement('canvas')
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false });
const createScene = async function () {
	// This creates a basic Babylon Scene object (non-mesh)
	const scene = new BABYLON.Scene(engine);

	// This creates and positions a free camera (non-mesh)
	const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

	// This targets the camera to scene origin
	camera.setTarget(BABYLON.Vector3.Zero());

	// This attaches the camera to the canvas
	camera.attachControl(canvas, true);

	// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
	const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

	// Default intensity is 1. Let's dim the light a small amount
	light.intensity = 0.7;

	// Our built-in 'sphere' shape.
	const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);

	// Move the sphere upward at 4 units
	sphere.position.y = 4;

	// Our built-in 'ground' shape.
	const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

	// initialize plugin
	const havokInstance = await HavokPhysics();
	// pass the engine to the plugin
	const hk = new BABYLON.HavokPlugin(true, havokInstance);
	// enable physics in the scene with a gravity
	scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

	// Create a sphere shape and the associated body. Size will be determined automatically.
	const sphereAggregate = new BABYLON.PhysicsAggregate(sphere, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.75 }, scene);

	// Create a static box shape.
	const groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);

	return scene;
};

createScene(canvas).then((scene) => {
	$.draw((target) => {
		if(!target.querySelector('canvas')) {
			target.appendChild(canvas)
		}
	})

	engine.runRenderLoop(function () {
		if (scene) {
			engine.resize();
			scene.render();
		}
	});
});

// Resize
window.addEventListener("resize", function () {
	engine.resize();
});


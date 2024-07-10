import module from '@silly/tag'
import * as twgl from 'twgl.js'

const $ = module('twgl-demo')

function main(target) {
  const m4 = twgl.m4;
  const gl = target.querySelector("canvas").getContext("webgl");
  twgl.addExtensionsToContext(gl);
  if (!gl.drawArraysInstanced || !gl.createVertexArray) {
    alert("need drawArraysInstanced and createVertexArray"); // eslint-disable-line
    return;
  }
  const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

  function rand(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + Math.random() * (max - min);
  }

  const numInstances = 100000;
  const instanceWorlds = new Float32Array(numInstances * 16);
  const instanceColors = [];
  const r = 70;
  for (let i = 0; i < numInstances; ++i) {
    const mat = new Float32Array(instanceWorlds.buffer, i * 16 * 4, 16);
    m4.translation([rand(-r, r), rand(-r, r), rand(-r, r)], mat);
    m4.rotateZ(mat, rand(0, Math.PI * 2), mat);
    m4.rotateX(mat, rand(0, Math.PI * 2), mat);
    instanceColors.push(rand(1), rand(1), rand(1));
  }
  const arrays = twgl.primitives.createCubeVertices();
  Object.assign(arrays, {
    instanceWorld: {
      numComponents: 16,
      data: instanceWorlds,
      divisor: 1,
    },
    instanceColor: {
      numComponents: 3,
      data: instanceColors,
      divisor: 1,
    },
  });
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  const vertexArrayInfo = twgl.createVertexArrayInfo(gl, programInfo, bufferInfo);

  const uniforms = {
    u_lightWorldPos: [1, 8, -30],
    u_lightColor: [1, 1, 1, 1],
    u_ambient: [0, 0, 0, 1],
    u_specular: [1, 1, 1, 1],
    u_shininess: 50,
    u_specularFactor: 1,
  };

  function render(time) {
    time *= 0.001;
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fov = 30 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.5;
    const zFar = 500;
    const projection = m4.perspective(fov, aspect, zNear, zFar);
    const radius = 25;
    const speed = time * .1;
    const eye = [Math.sin(speed) * radius, Math.sin(speed * .7) * 10, Math.cos(speed) * radius];
    const target = [0, 0, 0];
    const up = [0, 1, 0];

    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);
    uniforms.u_viewProjection = m4.multiply(projection, view);
    uniforms.u_viewInverse = camera;

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, vertexArrayInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, vertexArrayInfo, gl.TRIANGLES, vertexArrayInfo.numelements, 0, numInstances);

    // do it with drawObjectList (not you'd probably make/update the list outside the render loop
    // twgl.drawObjectList(gl, [
    //   {
    //     programInfo: programInfo,
    //     vertexArrayInfo: vertexArrayInfo,
    //     uniforms: uniforms,
    //     instanceCount: numInstances,
    //   },
    // ]);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

$.draw(target => {
  target.innerHTML = `
    <canvas></canvas>
    <script id="vs" type="notjs">
      uniform mat4 u_viewProjection;
      uniform vec3 u_lightWorldPos;
      uniform mat4 u_viewInverse;

      attribute vec4 instanceColor;
      attribute mat4 instanceWorld;
      attribute vec4 position;
      attribute vec3 normal;

      varying vec4 v_position;
      varying vec2 v_texCoord;
      varying vec3 v_normal;
      varying vec3 v_surfaceToLight;
      varying vec3 v_surfaceToView;
      varying vec4 v_color;

      void main() {
        v_color = instanceColor;
        vec4 worldPosition = instanceWorld * position;
        v_position = u_viewProjection * worldPosition;
        v_normal = (instanceWorld * vec4(normal, 0)).xyz;
        v_surfaceToLight = u_lightWorldPos - worldPosition.xyz;
        v_surfaceToView = u_viewInverse[3].xyz - worldPosition.xyz;
        gl_Position = v_position;
      }
    </script>
    <script id="fs" type="notjs">
      precision mediump float;

      varying vec4 v_position;
      varying vec3 v_normal;
      varying vec3 v_surfaceToLight;
      varying vec3 v_surfaceToView;
      varying vec4 v_color;

      uniform vec4 u_lightColor;
      uniform vec4 u_ambient;
      uniform vec4 u_specular;
      uniform float u_shininess;
      uniform float u_specularFactor;

      vec4 lit(float l ,float h, float m) {
        return vec4(1.0,
                    max(l, 0.0),
                    (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
                    1.0);
      }

      void main() {
        vec4 diffuseColor = v_color;
        vec3 a_normal = normalize(v_normal);
        vec3 surfaceToLight = normalize(v_surfaceToLight);
        vec3 surfaceToView = normalize(v_surfaceToView);
        vec3 halfVector = normalize(surfaceToLight + surfaceToView);
        vec4 litR = lit(dot(a_normal, surfaceToLight),
                          dot(a_normal, halfVector), u_shininess);
        vec4 outColor = vec4((
        u_lightColor * (diffuseColor * litR.y + diffuseColor * u_ambient +
                      u_specular * litR.z * u_specularFactor)).rgb,
            diffuseColor.a);
        gl_FragColor = outColor;
      }
    </script>
  `

  main(target)
})

$.style(`
  &,
  & canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
`)

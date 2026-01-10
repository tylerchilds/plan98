export default class ChromakeyProcessor {
  constructor() {
    this.canvas = document.createElement('canvas')
    this.gl = this.canvas.getContext('webgl', { premultipliedAlpha: false })
    if (!this.gl) {
      console.warn('WebGL not available, falling back to CPU chromakey')
      return
    }
    this._initShaders()
    this._initBuffers()
  }

  _initShaders() {
    const gl = this.gl

    const vertexSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `

    const fragmentSource = `
      precision mediump float;
      uniform sampler2D u_image;
      uniform vec3 u_keyColor;
      uniform float u_tolerance;
      varying vec2 v_texCoord;

      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        float dist = distance(color.rgb * 255.0, u_keyColor);
        if (dist <= u_tolerance) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        } else {
          gl_FragColor = color;
        }
      }
    `

    const vertexShader = this._compileShader(gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = this._compileShader(gl.FRAGMENT_SHADER, fragmentSource)

    this.program = gl.createProgram()
    gl.attachShader(this.program, vertexShader)
    gl.attachShader(this.program, fragmentShader)
    gl.linkProgram(this.program)

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Shader program failed:', gl.getProgramInfoLog(this.program))
    }

    this.locations = {
      position: gl.getAttribLocation(this.program, 'a_position'),
      texCoord: gl.getAttribLocation(this.program, 'a_texCoord'),
      image: gl.getUniformLocation(this.program, 'u_image'),
      keyColor: gl.getUniformLocation(this.program, 'u_keyColor'),
      tolerance: gl.getUniformLocation(this.program, 'u_tolerance')
    }
  }

  _compileShader(type, source) {
    const gl = this.gl
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  _initBuffers() {
    const gl = this.gl

    // Full-screen quad
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ])

    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0
    ])

    this.positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    this.texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)

    this.texture = gl.createTexture()
  }

  process(sourceCanvas, keyColor, tolerance) {
    const gl = this.gl
    if (!gl) return sourceCanvas // Fallback

    const width = sourceCanvas.width
    const height = sourceCanvas.height

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width
      this.canvas.height = height
    }

    gl.viewport(0, 0, width, height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(this.program)

    // Upload source canvas as texture
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas)

    // Set uniforms
    gl.uniform1i(this.locations.image, 0)
    gl.uniform3f(this.locations.keyColor, keyColor.r, keyColor.g, keyColor.b)
    gl.uniform1f(this.locations.tolerance, tolerance)

    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
    gl.enableVertexAttribArray(this.locations.position)
    gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0)

    // Bind texCoord buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer)
    gl.enableVertexAttribArray(this.locations.texCoord)
    gl.vertexAttribPointer(this.locations.texCoord, 2, gl.FLOAT, false, 0, 0)

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    return this.canvas
  }

  destroy() {
    const gl = this.gl
    if (!gl) return

    gl.deleteTexture(this.texture)
    gl.deleteBuffer(this.positionBuffer)
    gl.deleteBuffer(this.texCoordBuffer)
    gl.deleteProgram(this.program)
  }
}

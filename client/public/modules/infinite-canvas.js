import statebus, { state } from 'statebus'
import module from '@sillonious/module'

const $ = module('infinite-canvas', { instances: [] })

// Initial state of the canvas
const ZOOM_SPEED = 0.1;
const minScale = 0.35;
const maxScale = 1.25;

function instance(target) {
  const root = target.closest($.link) || document.querySelector($.link)
  return state[$.link].instances[root.id]
}

function updateInstance({ id }, payload) {
  const s = statebus.cache[$.link] || {}

  if(!s.instances[id]) {
    s.instances[id] = {}
  }

  return {
    ...s,
    instances: {
      ...s.instances,
      [id]: {
        ...s.instances[id],
        ...payload
      }
    }
  }
}

function source(target) {
  const head = target.closest($.link)
  const explicit = head.getAttribute('src')
  const remote = head.getAttribute('remote') || ''
  const implicit = `/public/cdn/sillyz.computer/index.canvas`

  return `${remote}${explicit || implicit}`
}

function sourceCanvas(target) {
  const src = source(target)
  const data = state[$.link][src] || {}

  if(target.initialized) return data
  target.initialized = true

  return data.canvas
    ? data
    : (function initialize() {
      schedule(() => {
        let canvas = {nodes:[],edges:[]}
        fetch(src).then(async res => {
          if(res.status === 200) {
            canvas = await res.json()
          }
        }).catch((error) => {
          console.error(error)
        }).finally(() => {
          state[$.link][src] = { canvas }
        })
      })
      return data
    })()
}

function schedule(x, delay=1) { setTimeout(x, delay) }

function seed(target) {


  if(target.seeded) return
  target.seeded = true

  const {
    id,
  } = target

  const {
    edges,
    nodes,
  } = target



  //target.innerHTML = template(edgesSVG, nodesHTML)
  /*
  schedule(() => {
    const id = target.id
    updateInstance({ id }, {
      id,
      scale,
      panOffsetX,
      panOffsetY,
      isDragging: false,
      isSpacePressed: false,
      isPanning: false,
      startX: 0,
      startY: 0,
      lastTouchX: 0,
      lastTouchY: 0,
      touchStartPanX: 0,
      touchStartPanY: 0,
      nodes: [],
      edges: []
    })
  })
  */
}


$.draw((target) => {
  const { canvas } = sourceCanvas(target)
  debugger
  seed(target)
  const { instances } = $.learn()
  if(!instances[target.id]) return

  const {
    id,
    scale,
    panOffsetX,
    panOffsetY,
    isDragging,
    isSpacePressed,
    isPanning,
    startX,
    startY,
    lastTouchX,
    lastTouchY,
    touchStartPanX,
    touchStartPanY,
    edges,
    nodes,
  } = instance(target)

  const edgesSVG = drawEdges(edges)
  const nodesHTML = drawNodes(nodes)

  return template(edgesSVG, nodesHTML)
})

function template(edgesSVG, nodesHTML) {
  return `
    <div name="canvas-container">
        <svg id="canvas-edges">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="8" 
          refX="5" refY="4" orient="auto">
            <polygon points="0 0, 10 4, 0 8"/>
          </marker>
        </defs>
        <g name="edge-paths">
          ${edgesSVG}
        </g>
      </svg>

      <div id="canvas-nodes">
        ${nodesHTML}
      </div>

      <div name="output" class="theme-dark hidden">
        <div class="code-header">
          <span class="language">JSON&nbsp;Canvas</span>
          <span class="close-output">×</span>
        </div>
        <div id="output-code">
          <pre><code class="language-json" id="positionsOutput"></code></pre>
        </div>
         <div class="code-footer">
          <button class="button-copy">Copy code</button>
          <button class="button-download">Download file</button>
        </div>
      </div>

      <div name="controls">
        <div name="zoom-controls">
          <button name="toggle-output">Toggle output</button>
          <button name="zoom-out">Zoom out</button>
          <button name="zoom-in">Zoom in</button>
          <button name="zoom-reset">Reset</button>
        </div>
      </div>
    </div>
  `

}

$.style(`
  & {
    display: block;
  }
`)
function adjustCanvasToViewport(event) {
  const {
    id,
    nodes,
    scale,
    panOffsetX,
    panOffsetY,
    isDragging,
    isSpacePressed,
    isPanning,
    startX,
    startY,
    lastTouchX,
    lastTouchY,
    touchStartPanX,
    touchStartPanY
  } = instance(event.target)


  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  nodes.forEach(node => {
    const x = parseInt(node.style.left, 10);
    const y = parseInt(node.style.top, 10);
    const width = node.offsetWidth;
    const height = node.offsetHeight;

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + width);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + height);
  });

  const boundingBoxWidth = maxX - minX;
  const boundingBoxHeight = maxY - minY;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const scaleX = viewportWidth / (boundingBoxWidth + 80);
  const scaleY = viewportHeight / (boundingBoxHeight + 80);
  scale = Math.min(scaleX, scaleY, 1); // Ensure the scale is not more than 1

  panOffsetX = (viewportWidth - boundingBoxWidth * scale) / 2 - minX * scale;
  panOffsetY = (viewportHeight - boundingBoxHeight * scale) / 2 - minY * scale;

  // Apply the calculated scale and pan offsets
  applyPanAndZoom();

  updateInstance({ id }, {
    edgesOpacity: 1,
    nodesOpacity: 1
  })
}

document.addEventListener('DOMContentLoaded', adjustCanvasToViewport);

// Zoom
window.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.deltaY > 0) {
            scale = Math.max(scale - ZOOM_SPEED, minScale);
        } else {
            scale = Math.min(scale + ZOOM_SPEED, maxScale);
        }

        document.body.style.setProperty('--scale', scale);
        e.preventDefault();
    }
}, {passive: false});

$.when('click', '[name="zoom-in"]', () => {
  scale = Math.min(scale + ZOOM_SPEED, maxScale);
  document.body.style.setProperty('--scale', scale);
});

$.when('click', '[name="zoom-out"]', () => {
  scale = Math.max(scale - ZOOM_SPEED, minScale);
  document.body.style.setProperty('--scale', scale);
});

$.when('click', '[name="zoom-reset"]', adjustCanvasToViewport);

$.when('click', '[name="toggle-output"]', function(event) {
  const { id, outputHidden } = instance(event.target)

  updateInstance({ id }, {
    outputHidden: !outputHidden,
  })
});

$.when('click', '[name="close-output"]', function() {
  const { id } = instance(event.target)
  updateInstance({ id }, {
    outputHidden: true,
  })
});

$.when('click', '[name="button-copy"]', function() {
  const positionsOutput = document.getElementById('positionsOutput').textContent;
  navigator.clipboard.writeText(positionsOutput).catch(err => {
    console.error('Error copying canvas data: ', err);
  });
});

$.when('click', '[name="button-download"]', function() {
  const positionsOutput = document.getElementById('positionsOutput').textContent;
  const blob = new Blob([positionsOutput], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample.canvas';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Very simplified Markdown conversion
function htmlToMarkdown(html) {
  let markdown = html.replace(/<br\s*[\/]?>/gi, "\n");
  markdown = markdown.replace(/<a href="([^"]+)">([^<]+)<\/a>/gi, "[$2]($1)");
  markdown = markdown.replace(/<ul>/gi, "\n\n").replace(/<\/ul>/gi, "\n\n").replace(/<li>/gi, "- ").replace(/<\/li>/gi, "\n");
  markdown = markdown.replace(/<[^>]+>/g, '');
  markdown = markdown.replace(/\n\s*-\s+/g, "\n- ");
  markdown = markdown.trim().replace(/\n{3,}/g, "\n\n");
  return markdown;
}

// Serialize canvas data
function updateCanvasData() {
  const {
    id,
    nodes,
    scale,
    panOffsetX,
    panOffsetY,
    isDragging,
    isSpacePressed,
    isPanning,
    startX,
    startY,
    lastTouchX,
    lastTouchY,
    touchStartPanX,
    touchStartPanY
  } = instance(event.target)

  /*
  const nodes = Array.from(document.querySelectorAll('.node')).map(node => {
      const nodeObject = {
          id: node.id,
          type: node.getAttribute('data-node-type'),
          x: parseInt(node.style.left, 10),
          y: parseInt(node.style.top, 10),
          width: node.offsetWidth,
          height: node.offsetHeight,
      };

      const fileAttribute = node.getAttribute('data-node-file');
      if (fileAttribute) {
          nodeObject.file = fileAttribute;
      }

      if (nodeObject.type === 'text') {
          const textContent = node.querySelector('.node-text-content').innerHTML;
          nodeObject.text = htmlToMarkdown(textContent);
      }


      return nodeObject;
  });

  const canvasData = {
    nodes: nodes,
    edges: edges,
  };

  const positionsOutput = document.getElementById('positionsOutput');
  positionsOutput.textContent = JSON.stringify(canvasData, null, 2);

  Prism.highlightElement(positionsOutput);
  */
}

function getAnchorPoint(node, side) {
  const x = parseInt(node.x, 10);
  const y = parseInt(node.y, 10);
  const width = node.offsetWidth;
  const height = node.offsetHeight;

  switch (side) {
    case 'top':
      return { x: x + width / 2, y: y };
    case 'right':
      return { x: x + width, y: y + height / 2 };
    case 'bottom':
      return { x: x + width / 2, y: y + height };
    case 'left':
      return { x: x, y: y + height / 2 };
    default: // center or unspecified case
      return { x: x + width / 2, y: y + height / 2 };
  }
}

function nodeById(target, id) {
  const { nodes } = instance(target)
 
  return nodes.find(x => x.id === id)
}

function drawEdges(target) {
  const { edges } = instance(target)
  return edges.map(edge => {
    const fromNode = nodeById(target, edge.fromNode);
    const toNode = nodeById(target, edge.toNode);

    if (fromNode && toNode) {
      const fromPoint = getAnchorPoint(fromNode, edge.fromSide);
      const toPoint = getAnchorPoint(toNode, edge.toSide);

      const curveTightness = 0.75;
      const controlPointX1 = fromPoint.x + (toPoint.x - fromPoint.x) * curveTightness;
      const controlPointX2 = fromPoint.x + (toPoint.x - fromPoint.x) * (1 - curveTightness);
      const controlPointY1 = fromPoint.y;
      const controlPointY2 = toPoint.y;

      const d = `M ${fromPoint.x} ${fromPoint.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${toPoint.x} ${toPoint.y}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', 'black');
      path.setAttribute('fill', 'none');
      if (edge.toEnd === 'arrow') {
        path.setAttribute('marker-end', 'url(#arrowhead)');
      }

      return path;
    }
  }).join('')
}

function drawNodes(target) {
  const { nodes } = instance(target)
  return `
    <node id="logo" class="node node-file" data-node-type="file" data-node-file="logo.svg" style="left: 36px; top: 48px;">
        <div class="node-name">logo.svg</div>
        <img width="160" height="60" src="logo.svg" alt="JSON Feed" />
    </node>

    <node id="readme" class="node node-link" data-node-type="file" data-node-file="readme.md" style="left: 36px; top: 240px;">
      <div class="node-name">readme</div>
      {{ content }}
    </node>

    <node id="spec" class="node node-link" data-node-type="file" data-node-file="spec/1.0.md" style="left: 600px; top: 140px;">
      <div class="node-name">spec/1.0</div>
      <iframe
        width="100%"
        height="100%"
        src="/spec/1.0">
      </iframe>
    </node>

    <node id="nav" class="node node-text" data-node-type="text" style="left: 336px; top: 36px;">
      <div class="node-name"></div>
      <div class="node-text-content">
        <p>Learn more:</p>
        <ul>
          <li><a href="/">Readme</a></li>
          <li><a href="/spec/1.0">Spec</a></li>
          <li><a href="https://github.com/obsidianmd/jsoncanvas">GitHub</a></li>
        </ul>
      </div>
    </node>
  `

  return node.map(node => {
    const fromNode = document.getElementById(edge.fromNode);
    const toNode = document.getElementById(edge.toNode);

    if (fromNode && toNode) {
      const fromPoint = getAnchorPoint(fromNode, edge.fromSide);
      const toPoint = getAnchorPoint(toNode, edge.toSide);

      const curveTightness = 0.75;
      const controlPointX1 = fromPoint.x + (toPoint.x - fromPoint.x) * curveTightness;
      const controlPointX2 = fromPoint.x + (toPoint.x - fromPoint.x) * (1 - curveTightness);
      const controlPointY1 = fromPoint.y;
      const controlPointY2 = toPoint.y;

      const d = `M ${fromPoint.x} ${fromPoint.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${toPoint.x} ${toPoint.y}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', 'black');
      path.setAttribute('fill', 'none');
      if (edge.toEnd === 'arrow') {
        path.setAttribute('marker-end', 'url(#arrowhead)');
      }

      svgContainer.appendChild(path);
    }
  }).join('')
}


$.when('mousedown', '.node .node-name', function(e) {
  if (isSpacePressed) return;

  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  selectedElement = this.parentElement;
  selectedElement.classList.add('is-dragging');
});

$.when('mousemove', '[name="canvas-container"]', function(e) {
  if (!isDragging || !selectedElement) return;
  
  const dx = (e.clientX - startX) / scale;
  const dy = (e.clientY - startY) / scale;

  selectedElement.style.left = `${parseInt(selectedElement.style.left, 10) + dx}px`;
  selectedElement.style.top = `${parseInt(selectedElement.style.top, 10) + dy}px`;

  startX = e.clientX;
  startY = e.clientY;

  drawEdges();
});

$.when('mouseup', '[name="canvas-container"]', function(e) {
  if (isDragging && selectedElement) {
    selectedElement.classList.remove('is-dragging');
    isDragging = false;
    selectedElement = null;
    updateCanvasData(target);
    drawEdges();
  }
});

//Panning
$.when('keydown', '[name="canvas-container"]', function(e) {
  if (e.code === 'Space') {
    e.preventDefault();
    isSpacePressed = true;
    document.body.classList.add('will-pan');
  }
});

$.when('keyup', '[name="canvas-container"]', function(e) {
  if (e.code === 'Space') {
    isSpacePressed = false;
    document.body.classList.remove('will-pan');
  }
});

$.when('mousedown', '[name="canvas-container"]', function(e) {
  if (isSpacePressed && !isDragging) {
    isPanning = true;
    document.body.style.cursor = 'grabbing';
    panStartX = e.clientX - panOffsetX;
    panStartY = e.clientY - panOffsetY;
  }
});

$.when('mousemove', '[name="canvas-container"]', function(e) {
  if (isPanning) {
    panOffsetX = e.clientX - panStartX;
    panOffsetY = e.clientY - panStartY;

    document.body.style.setProperty('--pan-x', `${panOffsetX}px`);
    document.body.style.setProperty('--pan-y', `${panOffsetY}px`);
  }
});

$.when('mouseup', '[name="canvas-container"]', function(e) {
  if (isPanning) {
    isPanning = false;
    document.body.style.cursor = '';
  }
});

// Touch-based devices 
let initialDistance = null;

document.addEventListener('gesturestart', function(e){ e.preventDefault(); });

$.when('touchstart', '[name="canvas-container"]', function(e) {
  if (e.touches.length === 1) { // Single touch for panning
    isPanning = true;
    const touch = e.touches[0];
    touchStartPanX = touch.pageX - panOffsetX;
    touchStartPanY = touch.pageY - panOffsetY;
    lastTouchX = touch.pageX;
    lastTouchY = touch.pageY;
  } else if (e.touches.length === 2) { // Two-finger touch for zooming
    e.preventDefault(); // Prevent page zoom
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    initialDistance = Math.sqrt((touch2.pageX - touch1.pageX) ** 2 + (touch2.pageY - touch1.pageY) ** 2);
  }
}, { passive: false });

// Touch move for panning and zooming
$.when('touchmove', '[name="canvas-container"]', function(e) {
  if (e.touches.length === 1 && isPanning) {
    const touch = e.touches[0];
    const dx = touch.pageX - lastTouchX;
    const dy = touch.pageY - lastTouchY;
    panOffsetX += dx;
    panOffsetY += dy;
    lastTouchX = touch.pageX;
    lastTouchY = touch.pageY;
    applyPanAndZoom();
    drawEdges();
  } else if (e.touches.length === 2) { // Adjust for zooming
    e.preventDefault();
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.sqrt((touch2.pageX - touch1.pageX) ** 2 + (touch2.pageY - touch1.pageY) ** 2);
    const scaleChange = distance / initialDistance;
    scale = Math.min(Math.max(minScale, scale * scaleChange), maxScale); // Apply and limit scale
    document.body.style.setProperty('--scale', scale);
    initialDistance = distance;
    applyPanAndZoom();
  }
}, { passive: false });

$.when('touchend', '[name="canvas-container"]', function(e) {
  if (isPanning) {
    isPanning = false;
  }
  if (e.touches.length < 2) {
    initialDistance = null; // Reset zoom tracking on lifting one finger
  }
});

// Activate node on touch
$.when('touchstart', '.node .node-name', function(e) {
    // Prevent activating multiple nodes simultaneously
    deactivateAllNodes();
    const node = this.parentElement;
    node.classList.add('is-active');
    // Prepare for potential drag
    isDragging = false;
    const touch = e.touches[0];
    startX = touch.pageX;
    startY = touch.pageY;
    selectedElement = node;
    e.stopPropagation();
});

// Deactivate nodes when tapping outside
$.when('touchstart', '[name="canvas-container"]', function(e) {
  if (!e.target.closest('.node')) {
    deactivateAllNodes();
  }
});

function deactivateAllNodes() {
  document.querySelectorAll('.node').forEach(node => {
    node.classList.remove('is-active');
  });
}

// Handling dragging for an activated node
$.when('touchmove', '[name="canvas-container"]', function(e) {
  if (isDragging && selectedElement && selectedElement.classList.contains('is-active')) {
    const touch = e.touches[0];
    const dx = (touch.pageX - startX) / scale;
    const dy = (touch.pageY - startY) / scale;
    selectedElement.style.left = `${parseInt(selectedElement.style.left, 10) + dx}px`;
    selectedElement.style.top = `${parseInt(selectedElement.style.top, 10) + dy}px`;

    // Update startX and startY for the next move event
    startX = touch.pageX;
    startY = touch.pageY;

    // Call drawEdges to update edge positions based on the new node positions
    drawEdges();

    e.preventDefault(); // Prevent default to avoid scrolling and other touch actions
  }
});

// Determine if dragging should start
$.when('touchmove', '[name="canvas-container"]', function(e) {
  if (selectedElement && !isDragging) {
    const touch = e.touches[0];
    if (Math.abs(touch.pageX - startX) > 10 || Math.abs(touch.pageY - startY) > 10) {
      isDragging = true; // Start dragging if moved beyond threshold
    }
  }
});

// End dragging
$.when('touchend', '[name="canvas-container"]', function(e) {
  if (isDragging && selectedElement) {
    selectedElement.classList.remove('is-dragging');
    isDragging = false;
    selectedElement = null;
  }
});

function applyPanAndZoom() {
  document.body.style.setProperty('--scale', scale);
  document.body.style.setProperty('--pan-x', `${panOffsetX}px`);
  document.body.style.setProperty('--pan-y', `${panOffsetY}px`);
}

// Prevent the whole page from zooming on pinch
document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});

document.addEventListener('gesturechange', function(e) {
  e.preventDefault();
});

/*
drawEdges();
updateCanvasData();
*/

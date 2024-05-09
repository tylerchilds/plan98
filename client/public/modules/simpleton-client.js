import module from '@silly/tag'
// Globals
let url = "https://test.bloop.monster:61870/yo40";
let seq = -1;
let last_text = "";
let current_version = null;
let connection = null;

const $ = module('simpleton-client')

$.draw((target) => {
  connect(target)
})

// Networking
async function connect(target) {
  if(target.connected) return
  target.connected = true
  const texty = document.createElement('textarea')
  target.appendChild(texty)
  try {
    connection = await braid_fetch(url, {
      headers: { Accept: "text/plain" },
      subscribe: true,
      ...(current_version ? { parents: [current_version] } : {}),
    });

    connection.subscribe(receive_edits(texty), (e) => {
      console.log(`e = ${e}`);
      connection = null;
      setTimeout(connect, 1000);
    });
  } catch (e) {
    console.log(`e = ${e}`);
    connection = null;
    setTimeout(connect, 1000);
  }
}

function receive_edits(texty) {
  return function actually_receive_edits({ version, parents, body, patches }) {
    if (current_version != parents?.[0]) {
      console.log("skipping version");
      return;
    }
    current_version = version;

    if (body != null) {
      texty.value = body;
    } else {
      apply_changes_and_update_cursor(texty, patches);
    }
    last_text = texty.value;
  }
}


$.when('change', 'textarea', (event) => {
  const { value } = event.target
  if (connection) {
    let patches = do_diff(last_text, value);
    console.log(`patches = ${patches}`);
    last_text = value;
    if (patches.length) send_edits(patches);
  }
});

function send_edits(patches) {
  console.log(`sending: ${JSON.stringify(patches)}`);
  let version = JSON.stringify([peer + "-" + seq]);
  let parents = [current_version];
  current_version = version;

  fetchWithRetry(url, {
    method: "PUT",
    mode: "cors",
    version,
    parents,
    patches,
  });
}

// Diffing and patching
function do_diff(before, after) {
  let diff = diff_main(before, after);
  let patches = [];
  let offset = 0;
  for (let d of diff) {
    let p = null;
    if (d[0] == 1) {
      p = {
        range: `[${offset}:${offset}]`,
        content: d[1],
      };
      seq += d[1].length;
    } else if (d[0] == -1) {
      p = {
        range: `[${offset}:${offset + d[1].length}]`,
        content: "",
      };
      seq += d[1].length;
      offset += d[1].length;
    } else {
      offset += d[1].length;
    }
    if (p) {
      p.unit = "json";
      patches.push(p);
    }
  }
  return patches;
}

function apply_changes_and_update_cursor(target, patches) {
  let original = target.value;
  let sel = [target.selectionStart, target.selectionEnd];

  for (var p of patches) {
    if (p.unit == "fake") continue;

    let range = p.range.match(/\d+/g).map((x) => parseInt(x));

    for (let i = 0; i < sel.length; i++) {
      if (sel[i] > range[0]) {
        if (sel[i] > range[1]) {
          sel[i] -= range[1] - range[0];
        } else sel[i] = range[0];
      }
    }

    for (let i = 0; i < sel.length; i++) {
      if (sel[i] > range[0]) {
        sel[i] += p.content.length;
      }
    }

    original =
      original.substring(0, range[0]) +
      p.content +
      original.substring(range[1]);
  }

  target.value = original;
  target.selectionStart = sel[0];
  target.selectionEnd = sel[1];
}

async function fetchWithRetry(url, options) {
  let maxWait = 3000; // 3 seconds
  let waitTime = 100;
  let i = 0;

  while (true) {
    try {
      console.log(`sending PUT[${i++}]..`);
      let x = await braid_fetch(url, { ...options });
      if (x.status !== 200) throw "status not 200: " + x.status;

      console.log("got back: " + (await x.text()));

      break;
    } catch (e) {
      console.log(`got BAD!: ${e}`);

      waitTime *= 2;
      if (waitTime > maxWait) {
        waitTime = maxWait;
      }

      console.log(`Retrying in ${waitTime / 1000} seconds...`);

      await new Promise((done) => setTimeout(done, waitTime));
    }
  }
}

$.style(`
  & {
    display: block;
    background: dodgerblue;
    padding: 1rem;
    border-radius: 1rem;
  }

  & textarea {
    width: 100%;
    resize: none;
    height:  10rem;
  }
`)

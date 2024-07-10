import module from '@silly/tag'
// probably some legacy internet explorer compatibility flex
import './trade-maximizer/trademax-util.js'

const $ = module('trade-maximizer', {
  listid: geturlparameter('listid'),
  url: geturlparameter('url') || "trade-maximizer/testwants.txt",
  outframe: '',
  output: '',
  progressframe: null,
  uploadnow: null,
  fileupload: null
})

var progressframe;
var uploadnow;
var fileupload;
var output;
var worker = null;

function processmessage(e) {
  let { outframe, output } = $.learn()
  switch( e.data[0] ) {
    case OUTPUT :
      output += e.data[1] + (e.data[2] ? "\n" : "");
      outframe += e.data[1] + (e.data[2] ? "<br>" : ""); 
      $.teach({ outframe, output })
      break;

    case ERROR :
      //alert(e.data[1]);
      e.data[0] = OUTPUT;
      e.data[2] = true;
      processmessage(e);
      break;

    case PROGRESS :
      let bar = "<progress value="+e.data[1]+" max="+e.data[2]+"></progress>";
      let text = e.data[1] + " of " + e.data[2] + ", " + e.data[3] + ", trades: " + e.data[4];
      progressframe.innerHTML = bar + "<br>" + text;
      break;

    case DONE :
      fileupload.value = output;
      uploadnow.disabled = false;
      break;
  }
}

function doit() {
  const { url } = $.learn()
  $.teach({ outframe: url + "<br>"})
  output = "";

  if( worker != null )
    worker.terminate();

  worker = new Worker("./public/elves/trade-maximizer/trademax-worker.js");
  worker.onmessage = processmessage;
  worker.postMessage([RUN, url]);
}

function copytoclipboard(id) {
    var div = document.getElementById(id);
    div.select();
    div.setSelectionRange(0,999999);
    document.execCommand("copy");
}

function geturlparameter(name) {
    return (new URLSearchParams(window.location.search)).get(name);
}

$.draw(() => {
  const { url, listid, outframe, results } = $.learn()
  
  if(!results) {
    return `
      Enter the url of TradeMaximizer input (aka wants) and submit
      <input value="${url}" />
      <input type=submit value="Run" id="runnow">
      <div id=progress></div>
    `
  }

  return `
    <div class=results id="output">
      ${outframe}
    </div>
    <button onclick="copytoclipboard('output')"></button>
  `
})

$.when('click', '#runnow', doit)


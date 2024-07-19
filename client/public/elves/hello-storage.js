import supabase from '@sillonious/database'
import tag from '@silly/tag'

const $ = tag('hello-storage')

function schedule(x, delay=1) { setTimeout(x, delay) }
async function mount(target) {
  if(target.mounted) return
  target.mounted = true
  schedule(() => $.teach({ message: null }))

  const savedSession = localStorage.getItem('supabase.auth.token');

  if (savedSession) {
    const session = JSON.parse(savedSession);
    await supabase.auth.setSession(session.access_token);
    $.teach({ user: session.user })
  }
}


$.draw((target) => {
  mount(target)

  const input = target.getAttribute('edit') ? `<input type="file" name="input" accept="image/*">` : ''

  return `
    ${input}
    ${image(target)}
  `
})

function image(target) {
  const key = target.getAttribute('key') || 'paste'
  const media = $.learn()[key]
  return media ? `<img name="image" alt="picture resized at ${media.updatedAt}" src="${media.value}">` : `<img name="image" alt="default" src="/cdn/tychi.me/photos/professional-headshot.jpg">`
}

$.when('click', '[name="image"]', (event) => {
  const root = event.target.closest($.link)
  const input = root.querySelector('[name="input"]')
  if(input) { input.click() }
})

$.when('change', '', async (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert("No file selected.");
    return;
  }
});

$.when('change', '[name="input"]', onImageSelection)

async function onImageSelection({ target }) {
  const { id } = target.closest($.link)
  const file = target.files && target.files[0];
  if(!file) return


  const { data, error } = await supabase
  .storage
  .from('party-like-it-1998')
  .upload('public.png', file, {
    cacheControl: '3600',
    upsert: false
  })
}

async function getImageElement(imageSource) {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject({ reason: 'getImageElement: Image Load Error' });
    image.src = imageSource;
  })
}

async function getMime(imageSource) {
  const image = await fetch(imageSource);
  return (await image.blob()).type;
};

function getResizedDimensions(elem, maxDimensionSize) {
  // This code has high complexity, don't dwell on it too much
  // I wrote it like this to keep what really matters more simplified
  const 
    [ bigSide, smallSide ] = elem.width > elem.height ?
    ['width', 'height']:
    ['height', 'width'];

  // if big side is smaller than our max dimension, then pass dimensions through
  if(maxDimensionSize > elem[bigSide] || !maxDimensionSize){
    return {
      [bigSide]: elem[bigSide],
      [smallSide]: elem[smallSide]
    }
  }

  return {
    [bigSide]: maxDimensionSize,
    [smallSide]: maxDimensionSize / elem[bigSide] * elem[smallSide]
  }
}

function createCanvasImage(imageElement, dimensions) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  ctx.drawImage(imageElement, 0, 0, dimensions.width, dimensions.height);

  return canvas;
}

async function loadFile(file) {
  console.log(file)
  return await new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (e) => resolve(e.target.result);
    fileReader.onabort = () => reject({ reason: 'loadFile: File Read Aborted' });
    fileReader.onerror = () => reject({ reason: 'loadFile: File Read Error' });

    fileReader.readAsDataURL(file);
  });
}

async function resizeImage(imageSource, maxDimensionSize) {
  const mime = await getMime(imageSource);
  const imageElement = await getImageElement(imageSource);
  const dimensions = getResizedDimensions(imageElement, maxDimensionSize);

  const image = createCanvasImage(imageElement, dimensions);

  return {
    blob: await new Promise((resolve) => {
      image.toBlob(blob => resolve(blob), mime, 1);
    }),
    dataURL: image.toDataURL(mime, 1)
  }
}

async function getResizedImageFromFile(file, maxDimensionSize) {
  return await new Promise((resolve, reject) => {
    (async function() {
      const imageSource = await loadFile(file).catch((e) => reject(e));
      const resizedImage = await resizeImage(imageSource, maxDimensionSize).catch(((e) => reject(e)));

      resolve(resizedImage);
    })()
  });
}

$.style(`
  & {
    display: block;
    position: relative;
    height: 100%;
  }

  & img {
    margin: 0 auto;
    position: relative;
    z-index: 2;
    height: 100%;
    object-fit: cover;
    overflow: hidden;
    width: 100%;
  }

  & input {
    position: absolute;
    z-index: 1;
    opacity: 0;
  }
`)

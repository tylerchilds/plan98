import tag from '@silly/tag'
import { showModal } from '@plan98/modal'

const $ = tag('secret-thanksgiving')

const helper = thanksgivingAlbum()

$.draw(target => {
  const gallery = helper.filenames.map((filename) => {
    return `<button data-file="${filename}"></button>`
  }).join('')
  return `
    <div class="gallery">
      ${gallery}
    </div>
  `
}, {afterUpdate})

function afterUpdate(target) {
  if(!target.observer) {
    const options = {
      root: target,
      rootMargin: "0px",
      threshold: 0,
    };

    target.observer = new IntersectionObserver(helper.callback, options);
    [...target.querySelectorAll('[data-file]')].map((fileNode) => {
      target.observer.observe(fileNode);
    })
  }
}

$.when('click', '[data-file]', (event) => {
  showModal(event.target.dataset.modal)
})

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
    background: #54796d;
    color: rgba(255,255,255,.85);
    overflow: auto;
    padding: 1rem;
  }
  & .note {
    background: lemonchiffon;
    color: saddlebrown;
    padding: 1rem;
  }

  & .gallery {
    display: grid;
    gap: .25rem;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  & [data-file] {
    aspect-ratio: 16 / 9;
    background: black;
    display: grid;
    place-items: center;
    border-radius: 3px;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, .85);
    border: none;
    padding: 0;
    transform: scale(1);
    transition: transform 200ms;
  }

  & [data-file]:hover,
  & [data-file]:focus {
    box-shadow: 1px 1px 3px rgba(255, 255, 255, .85);
    transform: scale(1.05);
  }

  & [data-file] img {
    width: 100%;
    max-width: 100%;
    height: 100%;
  }
`)

function thanksgivingAlbum() {
  let filenames  = []
  const base = '/private/home/tychi/Pictures/2024-thanksgiving-trip/'
  const thumbnailFolder = '/.cache/144'
  const smallFolder = '/.cache/320'
  const mediumFolder = '/.cache/640'
  const largeFolder = '/.cache/1280'
  const hdFolder = '/.cache/1920'

  for(let i = 1944; i <= 2366; i++) {
    filenames.push(`DSC0${i}.JPG`)
  }

  const paths = {
    thumbnail: (file) => {
      return self.plan98.env.HEAVY_ASSET_CDN_URL + thumbnailFolder + base + file
    },
    small: (file) => {
      return self.plan98.env.HEAVY_ASSET_CDN_URL + smallFolder + base + file
    },
    medium: (file) => {
      return self.plan98.env.HEAVY_ASSET_CDN_URL + mediumFolder + base + file

    },
    large: (file) => {
      return self.plan98.env.HEAVY_ASSET_CDN_URL + largeFolder + base + file
    },
    hd: (file) => {
      return self.plan98.env.HEAVY_ASSET_CDN_URL + hdFolder + base + file
    },
    full: (file) => {
      return base + file
    },
  }

  return {
    filenames,
    paths,
    callback: (entries, observer) => {
      entries.forEach((entry) => {
        if(entry.isIntersecting) {
          const { file } = entry.target.dataset
          entry.target.innerHTML = `<img src="${paths.full(file)}"  alt=""/>`
          entry.target.dataset.modal = `<img src="${paths.full(file)}" alt=""/>`
        } else {
          entry.target.innerHTML = ''
        }
      });
    }
  }
}

import tag from '@silly/tag'
import { showModal } from '@plan98/modal'

const $ = tag('comedy-day', { activeIndex: 0 })

const helper = albumHelper2024()

$.draw(target => {
  if(target.innerHTML) return
  const gallery = helper.filenames.map((filename, index) => {
    return `<button data-file="${filename}" data-index="${index}"></button>`
  }).join('')
  return `
    <div class="padded-cell">
      <h1>Comedy Day, 2024</h1>
      <p class="subtitle">
        Robin Williams Meadow - September 15th 2024
      </p>
      <div class="note">
        <ol>
          <li>
            issues? <a href="mailto:ty@sillyz.computer">ty@sillyz.computer</a>
          </li>
          <li>
            <a href="https://sillyz.computer">Powered by Sillyz.Computer</a>
          </li>
        </ol>
      </div>

      <h2>Curtain Call</h2>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/eBKO8vcq2kw?si=zo7Ncj8FUROAHWaL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

      <h3>Gallery</h3>
      <div class="gallery">
        ${gallery}
      </div>
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

  {
    console.log($.learn().activeIndex)
    const image = target.querySelector('.image')

    if(image) {
      const { filenames, paths } = helper
      const file = filenames[$.learn().activeIndex]
      image.innerHTML = `<img src="${paths.thumbnail(file)}" srcset="${paths.thumbnail(file)}, ${paths.small(file)} 320w, ${paths.medium(file)} 640w, ${paths.large(file)} 1280w, ${paths.hd(file)} 1920w" alt=""/>`
    }
  }
}

$.when('click', '[data-file]', (event) => {
  const { index } = event.target.dataset
  $.teach({ activeIndex: parseInt(index) })
  showModal(`
    <comedy-day>
      <div class="viewbox">
        <div class="image">
          ${event.target.innerHTML}
        </div>
        <button data-back>
          &lt;
        </button>
        <button data-next>
          &gt;
        </button>
      </div>
    </comedy-day>
  `)
})

$.when('click', '[data-back]', (event) => {
  const { activeIndex } = $.learn()

  if(activeIndex === 0) return
  $.teach({ activeIndex: activeIndex - 1 })
})

$.when('click', '[data-next]', (event) => {
  const { activeIndex } = $.learn()

  const { filenames } = helper
  if(activeIndex === filenames.length - 1) return
  $.teach({ activeIndex: activeIndex + 1 })
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
  }

  & .viewbox {
    height: 100%;
    display: grid;
    place-items: center;
    position: relative;
  }

  & [data-back],
  & [data-next] {
    position: absolute;
    bottom: 0;
    width: 64px;
    height: 64px;
    line-height: 64px;
    text-align: center;
    border: none;
    background: rgba(0,0,0,.65);
    color: white;
    font-size: 48px;
    font-weight: bold;
  }

  & [data-back] {
    left: 0;
  }

  & [data-next] {
    right: 0;
  }

  & .padded-cell {
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
    display: grid;
    background: #54796d;
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

function albumHelper2024() {
  let filenames  = []
  const base = '/private/tychi.1998.social/Pictures/2024-09-15-comedy-day/'
  const thumbnailFolder = '/.cache/144'
  const smallFolder = '/.cache/320'
  const mediumFolder = '/.cache/640'
  const largeFolder = '/.cache/1280'
  const hdFolder = '/.cache/1920'

  for(let i = 1796; i <= 1917; i++) {
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
          entry.target.innerHTML = `<img src="${paths.thumbnail(file)}" srcset="${paths.thumbnail(file)}, ${paths.small(file)} 320w, ${paths.medium(file)} 640w, ${paths.large(file)} 1280w, ${paths.hd(file)} 1920w" alt=""/>`
          entry.target.dataset.modal = ``
        } else {
          entry.target.innerHTML = ''
        }
      });
    }
  }
}

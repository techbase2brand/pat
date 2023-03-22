import { isBase64 } from './helper-functions.js'

class AdaptiveImage extends HTMLElement {
  constructor() {
    super()
    // This list of asset widths to select from will be comprehensive for most use cases
    this.srcsetWidths = [493, 600, 713, 823, 1100, 1206, 1346, 1426, 1646, 1946]

    const imageData = isBase64(this.dataset.image)
      ? atob(this.dataset.image)
      : this.dataset.image
    try {
      this.image = JSON.parse(imageData)
    } catch (e) {
      this.image = imageData
    }
    this.width = this.image.width || 1946
    this.src = this.image?.src || this.image
    this.alt = this.dataset.alt || this.image?.alt || ''
    this.sizes = this.dataset.sizes || '100vw'
    this.loading = this.dataset.loading || 'lazy'
    this.objectFit = this.dataset.objectFit || 'cover'
    this.aspectRatio =
      this.image?.aspect_ratio || parseFloat(this.dataset.aspectRatio) || 1

    this.attachShadow({ mode: 'open' })
    this.render()
  }

  static get observedAttributes() {
    return ['data-image']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-image') {
      if (!!newValue) {
        const imageData = isBase64(this.dataset.image)
          ? atob(this.dataset.image)
          : this.dataset.image
        try {
          this.image = JSON.parse(imageData)
        } catch (e) {
          this.image = imageData
        }

        this.src = this.image?.src || this.image
        this.render()
      }
    }
  }

  updateImage(data) {
    Object.assign(this, data)
    this.render()
  }

  generateStyles() {
    return `
      <style>
        :host {
          display: block;
          aspect-ratio: ${this.aspectRatio};
          position: relative;
        }
        @supports not (aspect-ratio: ${this.aspectRatio}) {
          :host::before {
            float: left;
            padding-top: calc(100% / ${this.aspectRatio});
            content: '';
          }

          :host::after {
            display: block;
            clear: both;
            content: '';
          }
        }
        #image-element {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          object-fit: ${this.objectFit};
          -webkit-transform: translate3d(0,0,0);
        }
      </style>
    `
  }

  generateSrcset() {
    let srcset = ''
    for (const width of this.srcsetWidths) {
      if (this.width >= width) srcset += `${this.src}&width=${width} ${width}w,`
    }
    srcset += `${this.src} ${this.width}w`
    return srcset
  }

  generateImageMarkup() {
    return `
      <picture>
        <source srcset="${this.srcset}" sizes="${this.sizes}">
        <img id="image-element" src="${this.src}&width=${this.srcsetWidths[0]}" alt="${this.alt}" loading="${this.loading}">
      </picture>
    `
  }

  show() {
    this.style.display = 'block'
  }

  hide() {
    this.style.display = 'none'
  }

  render() {
    this.srcset = this.generateSrcset()
    this.shadowRoot.innerHTML = `
      ${this.generateStyles()}
      ${this.generateImageMarkup()}
    `
    this.closest('.js-product-card-link')
      ?.querySelector('.js-product-card-badge')
      ?.classList.remove('hidden')
  }
}

window.customElements.define('adaptive-image', AdaptiveImage)

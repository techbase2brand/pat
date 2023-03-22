const HYDRATION_CACHE = {}
const HYDRATION_SMALL_CACHE = {}
const SKELETON_ATTRUBUTES = [
  'data-product-href',
  'data-product-image-primary',
  'data-product-image-secondary',
  'data-product-title',
  'data-product-description',
  'data-product-price',
]
class ProductCard extends HHBaseElement {
  constructor() {
    super()
    this._hydrated = !this.shouldHydrate
    this._addToCart = this._addToCart.bind(this)
    this._selectItems = this._selectItems.bind(this)
    this._trackQuickShopToggle = this._trackQuickShopToggle.bind(this)
    this._skeletonTemplate = document.getElementById('skeleton-product-card')
  }

  get productHandle() {
    return this.getAttribute('product-handle')
  }

  get sectionHeadline() {
    return this.getAttribute('data-section-headline')
  }

  get cardSize() {
    return this.getAttribute('card-size') ?? ''
  }

  get shouldHydrate() {
    return this.hasAttribute('hydrate')
  }

  static get observedAttributes() {
    return ['product-handle']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (
      name === 'product-handle' &&
      newValue !== oldValue &&
      newValue &&
      this.shouldHydrate
    ) {
      this._hydrated = false
      this._hydrate()
    }
  }

  connectedCallback() {
    if (this.shouldHydrate) {
      return this._hydrate()
    }
    this._selectItems()
    this._attachListeners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  async _hydrate() {
    const cacheVar =
      this.cardSize === 'small' ? HYDRATION_SMALL_CACHE : HYDRATION_CACHE
    const viewParam =
      this.cardSize === 'small' ? 'product-card-small' : 'product-card'

    if (cacheVar[this.productHandle]) {
      this.innerHTML = cacheVar[this.productHandle]
    } else {
      if (this.cardSize !== 'small') this._renderSkeleton()

      const request = await fetch(
        `${__GLOBAL__.routes.rootUrl}/products/${this.productHandle}?view=${viewParam}`
      )
      const container = document.createElement('div')
      container.innerHTML = await request.text()
      cacheVar[this.productHandle] =
        container.querySelector(viewParam).innerHTML
      this.innerHTML = cacheVar[this.productHandle]
      this._hydrated = true
      this._handleHydration()
    }
  }

  _renderSkeleton() {
    if (!this._skeletonTemplate) return null
    const contents = this._skeletonTemplate.cloneNode(true)
    this.innerHTML = contents.innerHTML
    SKELETON_ATTRUBUTES.forEach((attr) => {
      const data = this.getAttribute(attr)
      if (!!data) {
        const targets = Array.from(this.querySelectorAll(`[${attr}]`))
        targets.forEach((target) => {
          if (target.tagName === 'ADAPTIVE-IMAGE') {
            target.setAttribute('data-image', data)
          } else if (target.tagName === 'A') {
            target.setAttribute('href', data)
          } else {
            target.innerHTML = data
          }
        })
      }
    })
  }

  _handleHydration() {
    this._selectItems()
    this._removeListeners()
    this._attachListeners()
    this.classList.add('hydrated')
    const wrapperAnchor = this.querySelector('.js-product-card-link')
    const titleSpan = this.querySelector('.js-product-card-title')

    if (wrapperAnchor) {
      wrapperAnchor.setAttribute(
        'aria-labelledby',
        this.productHandle + '--' + this.sectionHeadline
      )
      titleSpan.setAttribute(
        'id',
        this.productHandle + '--' + this.sectionHeadline
      )
    }
    this._setURLPostfix()
  }

  _setURLPostfix() {
    const urlPostfix = this.getAttribute('url-postfix')

    if (!!urlPostfix) {
      try {
        const link = this.querySelector('.js-product-card-link')
        if (link && !!link.href) {
          const href = new URL(link.href)
          href.searchParams.append(...urlPostfix.split('='))
          link.href = href.toString()
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  _selectItems() {
    this.addToCartToggle = this.querySelector('.js-quick-shop-atc')
    this.quickShopToggle = this.querySelector('.js-toggle-quick-shop')
  }

  _attachListeners() {
    if (this.addToCartToggle) {
      this.addToCartToggle.addEventListener('click', this._addToCart)
    }

    if (this.quickShopToggle) {
      this.quickShopToggle.addEventListener('click', this._trackQuickShopToggle)
    }
  }

  _trackQuickShopToggle() {
    this.triggerEvent('click::quick-shop-toggle', {
      product_id: this.getAttribute('data-id'),
      variant_id: this.quickShopToggle.dataset.value,
    })
  }

  _removeListeners() {
    if (this.addToCartToggle) {
      this.addToCartToggle.removeEventListener('click', this._addToCart)
    }

    if (this.quickShopToggle) {
      this.quickShopToggle.removeEventListener(
        'click',
        this._trackQuickShopToggle
      )
    }
  }

  async _addToCart(e) {
    e.preventDefault()
    window.__CART__CONTROLLER__.add([
      {
        id: this.addToCartToggle.dataset.value,
        quantity: 1,
      },
    ])

    this.triggerEvent('click::add-to-cart', {
      product_id: this.getAttribute('data-id'),
      variant_id: this.addToCartToggle.dataset.value,
    })
  }
}
window.customElements.define('product-card', ProductCard)

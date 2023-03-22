class FeaturedProductsTallWithSwatches extends HHBaseElement {
  constructor() {
    super()

    this.total = this.dataset.length
    this.swatches = this.querySelectorAll('.swatch-element button')
    this.blocks = [
      ...this.querySelectorAll('.featured-products-tall-with-swatches'),
    ]
    this.addToCartButtons = this.querySelectorAll('.js-quick-shop-atc')
    this._addToCart = this._addToCart.bind(this)

    this.touchstartX = 0
    this.touchstartY = 0
    this.touchendX = 0
    this.touchendY = 0
    this.touchOffset = 50

    this.addEventListener(
      'touchstart',
      (event) => {
        this.touchstartX = event.pageX
        this.touchstartY = event.pageY
      },
      false
    )

    this.addEventListener(
      'touchend',
      (event) => {
        this.touchendX = event.pageX
        this.touchendY = event.pageY
        this.handleGesure()
      },
      false
    )

    this.swatches.forEach((item) => {
      item.addEventListener(
        'click',
        (e) => {
          let index = Number(item.dataset.index)
          this.showBlock(index)
        },
        false
      )
    })
  }

  connectedCallback() {
    this._attachListeners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  handleGesure() {
    const activeBlock = this.querySelector(
      '.featured-products-tall-with-swatches.active'
    )
    const index = Number(activeBlock.dataset.index)
    if (this.touchendX < this.touchstartX - this.touchOffset) {
      this.nextBlock(index)
    }
    if (this.touchendX - this.touchOffset > this.touchstartX) {
      this.prevBlock(index)
    }
  }

  prevBlock(index) {
    if (index > 0) {
      index -= 1
    } else {
      index = this.total - 1
    }
    this.showBlock(index)
  }

  nextBlock(index) {
    if (index < this.total - 1) {
      index += 1
    } else {
      index = 0
    }
    this.showBlock(index)
  }

  showBlock(index) {
    this.blocks.forEach((item, i) => {
      item.classList.remove('active')
      if (i === index) {
        item.classList.add('active')
        item.querySelectorAll('.color-select-container').forEach((elem, no) => {
          elem.classList.remove('selected')
          if (i === no) {
            elem.classList.add('selected')
          }
        })
      }
    })
  }

  _attachListeners() {
    if (this.addToCartButtons.length > 0) {
      this.addToCartButtons.forEach((item) => {
        item.addEventListener('click', (event) => {
          this._addToCart(event, item)
        })
      })
    }
  }

  _removeListeners() {
    if (this.addToCartButtons.length > 0) {
      this.addToCartButtons.forEach((item) => {
        item.removeEventListener('click', (event) => {
          this._addToCart(event, item)
        })
      })
    }
  }

  async _addToCart(e, item) {
    e.preventDefault()
    let selectedVariantId = Number(item.dataset.variantId)
    window.__CART__CONTROLLER__.add([
      {
        id: selectedVariantId,
        quantity: 1,
      },
    ])
  }
}

window.customElements.define(
  'featured-products-tall-with-swatches',
  FeaturedProductsTallWithSwatches
)

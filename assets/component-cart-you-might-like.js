class CartYouMightLike extends HHBaseElement {
  constructor() {
    super()
    this.resultId = this.dataset.id
    this.$products = []
    this.$placementID = this.dataset.id
    this.$container = this.querySelector('.cart-popup__upsell-container')
    this.$controlContainer = this.querySelector(
      '.cart-popup__upsell-header'
    ).cloneNode(true)

    this.runNosto = this.runNosto.bind(this)
    this._generateSimpleSlider = this._generateSimpleSlider.bind(this)
    this._generateControlBar = this._generateControlBar.bind(this)
    this._generateList = this._generateList.bind(this)
    this._generateProductCard = this._generateProductCard.bind(this)
  }

  runNosto() {
    window.__NOSTO_RECOMMENDER__?.getRecommendation().then((response) => {
      if (typeof response.recommendations[this.$placementID] !== 'undefined') {
        this.$products = response.recommendations[
          this.$placementID
        ].products.filter((product) => !product.tags1.includes('free'))
        this.resultId = response.recommendations[this.$placementID].result_id
        this.buildCarousel()
        this.triggerEvent('nosto::rendered')
      }
    })
  }

  buildCarousel() {
    this.$container.innerHTML = ''

    const wrapperElem = document.createElement('div')
    wrapperElem.className = 'cart-popup__upsell-wrapper'
    wrapperElem.innerHTML = this._generateSimpleSlider()

    this.$container.appendChild(wrapperElem)
  }

  _generateSimpleSlider() {
    const controlContents = this._generateControlBar()
    const listContents = this._generateList()

    return `
      <simple-slider class='cart-popup__upsell' loop='true'>
        ${controlContents}
        ${listContents}
      </simple-slider>
    `
  }

  _generateControlBar() {
    this.$controlContainer.querySelector(
      'span'
    ).innerHTML = `01 / ${this.$products.length.toString().padStart(2, '0')}`

    return `
      <div class='flex cart-popup__upsell-header align-center justify-space-between cart-popup__section'>
        ${this.$controlContainer.innerHTML}
      </div>
    `
  }

  _generateList() {
    const productsList = this.$products.map(this._generateProductCard)

    return `
      <div class='flex cart-popup__upsell-items hide-scrollbars' data-slider-items>
        ${productsList.join('')}
      </div>
    `
  }

  _generateProductCard(item, key) {
    return `
      <div class='cart-popup__upsell-item cart-popup__section' data-slider-item>
        <product-card
          class="flex align-center cart-popup__item align-start background-color-off-white"
          hydrate
          product-handle="${item.url.split('/').slice(-1)}"
          card-size='small'
          url-postfix='nosto=${this.resultId}'
        ></product-card>
      </div>
    `
  }

  connectedCallback() {
    this.runNosto()
    this.addEventListener('click::add-to-cart', (event) => {
      window.__NOSTO_RECOMMENDER__?.trackAddToCart(
        event.detail.product_id,
        this.$placementID
      )
    })

    this.addEventListener('click::quick-shop-toggle', (event) => {
      window.__NOSTO_RECOMMENDER__?.trackProductView(
        event.detail.product_id,
        this.$placementID
      )
    })
  }
}

window.customElements.define('cart-you-might-like', CartYouMightLike)

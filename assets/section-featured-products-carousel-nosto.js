class FeaturedProductsCarouselNosto extends HHBaseElement {
  constructor() {
    super()
    this.resultId = this.dataset.id
    this.$products = []
    this.$placementID = this.dataset.id
    this.sectionHeadline = this.dataset.sectionHeadline
    this.titleRecommended = ''
    this.$container = this.querySelector(
      '.featured-products-carousel-nosto__container'
    )
    this.$titleContainer = this.querySelector(
      '.featured-products-carousel__heading'
    )
    this.$controlContainer = this.querySelector(
      '.featured-products-carousel__slider-header'
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
        this.titleRecommended = response.recommendations[this.$placementID].title
        this.resultId = response.recommendations[this.$placementID].result_id

        if (this.titleRecommended) {
          this.$titleContainer.innerHTML = this.titleRecommended
        }
        if (this.$products.length > 0) {
          this.buildCarousel()
        } else {
          this.remove()
        }
      } else {
        this.remove()
      }
    })
  }

  buildCarousel() {
    this.$container.innerHTML = ''

    const wrapperElem = document.createElement('div')
    wrapperElem.className = 'featured-products-carousel__products'
    wrapperElem.innerHTML = this._generateSimpleSlider()

    this.$container.appendChild(wrapperElem)
  }

  _generateSimpleSlider() {
    const controlContents = this._generateControlBar()
    const listContents = this._generateList()

    return `
      <simple-slider class='featured-products-carousel__slider' loop='true'>
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
      <div class='featured-products-carousel__slider-header flex align-center justify-space-between${
        this.$products.length < 5 ? ' no-carousel-controls' : ''
      }'>
        ${this.$controlContainer.innerHTML}
      </div>
    `
  }

  _generateList() {
    const productsList = this.$products.map(this._generateProductCard)

    return `
      <div class='featured-products-carousel__slider-items hide-scrollbars flex no-margin' data-slider-items>
        ${productsList.join('')}
      </div>
    `
  }

  _generateProductCard(item, key) {
    return `
      <div class='featured-products-carousel__slider-item' data-slider-item>
        <product-card
          class="product-card"
          hydrate
          data-id="${item.product_id}"
          product-handle="${item.url.split('/').slice(-1)}"
          url-postfix='nosto=${this.resultId}'
          data-product-href="${item.url}"
          data-product-image-primary="${item.image_url}"
          data-product-image-secondary="${item.alternate_image_urls[0] || ''}"
          data-product-title="${item.name}"
          data-product-description=""
          data-product-price="${item.price}"
          data-section-headline="${this.sectionHeadline}"
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

window.customElements.define(
  'featured-products-carousel-nosto',
  FeaturedProductsCarouselNosto
)

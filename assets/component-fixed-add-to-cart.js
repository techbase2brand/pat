class FixedATC extends HHBaseElement {
  constructor() {
    super()

    this.footer = document.querySelector('footer')
    this.addToCartToggle = this.querySelector(
      '.fixed-add-to-cart__button-container button'
    )

    this.productDetailsSection = document.querySelector(
      '.single-product__details'
    )

    this.mobileAddToCartButton = document.querySelector(
      '.atc-container.mobile-sticky'
    )

    this._addToCart = this._addToCart.bind(this)
    this._handleScrolling = this._handleScrolling.bind(this)
    this._clearMobileStyles = this._clearStickyStyles.bind(this)

    this.mql = window.matchMedia('(min-width: 992px)')
  }

  connectedCallback() {
    this._attachListeners()
    this._handleScrolling()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  _attachListeners() {
    document.addEventListener('scroll', this._handleScrolling, {
      passive: true,
    })
    if (this.addToCartToggle) {
      this.addToCartToggle.addEventListener('click', this._addToCart)
    }

    window.addEventListener('resize', this._clearMobileStyles)
  }

  _removeListeners() {
    document.removeEventListener('scroll', this._handleScrolling)

    window.removeEventListener('resize', this._clearMobileStyles)
    if (this.addToCartToggle) {
      this.addToCartToggle.removeEventListener('click', this._addToCart)
    }
  }

  _handleScrolling(e) {
    let footer = this.footer
    let footerDistanceFromTop =
      window.pageYOffset +
      footer.getBoundingClientRect().top -
      footer.offsetHeight

    if (this.mql.matches) {
      let scrolling = false
      let productDetailsSection = this.productDetailsSection

      if (!scrolling) {
        window.requestAnimationFrame(() => {
          let pdpDetailsDistanceFromTop =
            window.pageYOffset +
            productDetailsSection.getBoundingClientRect().top +
            productDetailsSection.offsetHeight / 4

          if (
            window.scrollY > pdpDetailsDistanceFromTop &&
            window.scrollY < footerDistanceFromTop
          ) {
            this.style.transform = 'translate3d(0, 0%, 0)'
          } else {
            this.style.transform = 'translate3d(0, 100%, 0)'
          }

          scrolling = false
        })

        scrolling = true
      }
    } else {
      let scrolling = false

      let mobileAtcButton = this.mobileAddToCartButton

      if (!scrolling) {
        window.requestAnimationFrame(() => {
          let mobileStickyAtcDistanceFromTop =
            window.pageYOffset +
            mobileAtcButton.getBoundingClientRect().top -
            window.innerHeight

          let gutter = parseFloat(
            getComputedStyle(document.documentElement)
              .getPropertyValue('--gutter')
              .replace('px', '')
          )

          let zIndexHighest = getComputedStyle(
            document.documentElement
          ).getPropertyValue('--z-index-highest')

          let containerWidth = getComputedStyle(document.documentElement)
            .getPropertyValue('--container-width')
            .replace('px', '')

          if (window.scrollY > footerDistanceFromTop) {
            mobileAtcButton.querySelector('.sticky-container').style.transform =
              'translate3d(0, 110%, 0)'
          } else if (
            window.scrollY - gutter >=
            mobileStickyAtcDistanceFromTop + mobileAtcButton.offsetHeight
          ) {
            mobileAtcButton.querySelector('.sticky-container').style.transform =
              'translate3d(0, 0%, 0)'

            mobileAtcButton.querySelector('.sticky-inner').style.paddingLeft =
              gutter + 'px'
            mobileAtcButton.querySelector('.sticky-inner').style.paddingRight =
              gutter + 'px'
            mobileAtcButton.querySelector('.sticky-inner').style.margin =
              '0 auto'

            mobileAtcButton.querySelector('.sticky-inner').style.maxWidth =
              containerWidth + 'px'

            mobileAtcButton.querySelector('.sticky-container').style.position =
              'fixed'
            mobileAtcButton.querySelector('.sticky-container').style.bottom = 0
            mobileAtcButton.querySelector('.sticky-container').style.left = 0
            mobileAtcButton.querySelector('.sticky-container').style.width =
              '100%'
            mobileAtcButton.querySelector(
              '.sticky-container'
            ).style.backgroundImage =
              'linear-gradient(180deg, rgba(255, 251, 247, 0) 0%, #fffbf7 100%)'
            mobileAtcButton.querySelector('.sticky-container').style.zIndex =
              zIndexHighest
            mobileAtcButton.querySelector(
              '.sticky-container'
            ).style.paddingBottom = gutter + 'px'
            mobileAtcButton.querySelector(
              '.sticky-container'
            ).style.transition = 'transform 0.25s'
          } else {
            mobileAtcButton.style.minHeight = 0
            mobileAtcButton.querySelector('.sticky-container').style = ''
            mobileAtcButton.querySelector('.sticky-inner').style = ''
          }

          scrolling = false
        })

        scrolling = true
      }
    }
  }

  _clearStickyStyles() {
    if (this.mql.matches) {
      this.mobileAddToCartButton.style.minHeight = 0
      this.mobileAddToCartButton.querySelector('.sticky-container').style = ''
      this.mobileAddToCartButton.querySelector('.sticky-inner').style = ''

      this.style.transform = 'translate3d(0, 100%, 0)'
    }
  }

  async _addToCart(e) {
    e.preventDefault()
    const triggerButton = e.currentTarget
    if (triggerButton) {
      triggerButton.setAttribute('loading', true)
    }

    let selectedVariantId = document.querySelector('.selected-variant')
    const hexcode = document.querySelector('.js-selected-variant-hex')
    const body = {
      id: selectedVariantId.value,
      quantity: 1,
    }
    if (hexcode) {
      body['properties'] = {}
      body['properties']['hex'] = hexcode.value
    }

    try {
      await window.__CART__CONTROLLER__.add([body])
    } finally {
      triggerButton.removeAttribute('loading')
    }
  }
}
window.customElements.define('fixed-atc', FixedATC)

class VirtualTryOn extends HHBaseElement {
  constructor() {
    super()
    this.isReady = false
    this._isOpen = false
    this.mainProduct = this.closest('main-product')
    this._handleMakeupApplied = this._handleMakeupApplied.bind(this)
    this._handleClick = this._handleClick.bind(this)
    this._handleEngineClosed = this._handleEngineClosed.bind(this)
    this._applyMakeupFilter = this._applyMakeupFilter.bind(this)
    this._handleOpened = this._handleOpened.bind(this)
    this._handleClosed = this._handleClosed.bind(this)
    this._handleSelectedVariantChange =
      this._handleSelectedVariantChange.bind(this)

    if (document.querySelectorAll('virtual-try-on').length > 1) {
      throw new Error('Only one virtual-try-on component can be used per page')
    }
    this.$product = this.closest('.single-product-page')
    this.variantSelector = this.$product.querySelector('product-variants')
    this.$button = this.querySelector('button')
    this.$largeGallery = this.$product.querySelector(
      '.product-media__container.m-block product-gallery'
    )
    this.$mobileGallery = this.$product.querySelector(
      '.product-media__container.m-none product-gallery'
    )
    this.mql = window.matchMedia('(min-width: 992px)')

    this._injectTarget()
    if (!this.isQuickView) {
      this._initScript()
    }
  }

  get isOpen() {
    return this._isOpen
  }

  set isOpen(value) {
    this._isOpen = value
    this.target.classList.toggle('open', value)
  }

  get apiKey() {
    return this.getAttribute('api-key')
  }

  get widgetId() {
    return this.getAttribute('widget-id')
  }

  get language() {
    return this.getAttribute('language')
  }

  get enableKissDetection() {
    return this.hasAttribute('enable-kiss-detect')
  }

  get privacyPolicyURL() {
    return this.getAttribute('privacy-policy')
  }

  get isQuickView() {
    return this.getAttribute('quick-view') === 'true'
  }

  get productUrl() {
    return this.getAttribute('data-url')
  }

  get productData() {
    return this.mainProduct.product
  }

  get selectedVariantSKU() {
    const matchingVariant =
      this.productData.variants.length > 1
        ? this.productData.variants.find(
            (variant) =>
              String(variant.id) === String(this.variantSelector?.variantId)
          )
        : this.productData.variants[0]

    return matchingVariant ? matchingVariant.sku : null
  }

  _handleMakeupApplied(success) {}

  _injectTarget() {
    this.target = document.createElement('div')
    this.target.id = 'YMK-module'
    this.target.setAttribute(
      'class',
      'ymk-module background-color-off-white grid justify-center'
    )
  }

  _initScript() {
    if (document.getElementById('ymk-script')) {
      this._initWidget()
    } else {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.id = 'ymk-script'
      window.ymkAsyncInit = () => {
        this._initWidget()
      }
      script.src = `https://plugins-media.makeupar.com/${this.widgetId}/sdk.js?apiKey=${this.apiKey}`
      document.body.appendChild(script)
    }
  }

  _initWidget() {
    this.isReady = true
    YMK.addEventListener('loaded', this._applyMakeupFilter)
    YMK.addEventListener('loaded', this._handleOpened)
    YMK.addEventListener('opened', this._handleOpened)
    YMK.addEventListener('engineClosed', this._handleEngineClosed)
    YMK.addEventListener('closed', this._handleClosed)
    YMK.init({
      autoOpen: false,
      language: this.language,
      enableKissDetection: this.enableKissDetection,
      privacyPolicyURL: this.privacyPolicyURL,
      height: Math.min(this.target.clientHeight, 600),
      width: Math.min(this.target.clientWidth, 600),
    })

    if (location.hash === '#virtual-try-on') {
      this.show()
    }
  }

  _handleOpened() {
    this.isOpen = true
    this.target.scrollIntoView({ behavior: 'smooth' })
  }

  _handleEngineClosed() {
    this.isOpen = false
    YMK.close()
  }

  _handleClosed() {
    this.target.classList.remove('open')
    const mobileSlider = this.$mobileGallery.querySelector(
      '.product-gallery__mobile-slider-container'
    )
    mobileSlider.style.opacity = 1
    mobileSlider.style.marginBottom = 0
    this.isOpen = false
  }

  _applyMakeupFilter() {
    if (!this.isReady) return
    YMK.applyMakeupBySku(this.selectedVariantSKU, this._handleMakeupApplied)
  }

  _handleMediaQuery() {
    if (this.target.parentNode) {
      this.target.parentNode.removeChild(this.target)
    }
    this.target.innerHTML = ''

    if (this.mql.matches) {
      this.$largeGallery?.appendChild(this.target)
    } else {
      this.$mobileGallery?.appendChild(this.target)
    }
  }

  _handleClick() {
    if (this.isQuickView) {
      location.href = this.productUrl
    } else {
      if (!!this.selectedVariantSKU) {
        this.show()
      } else {
        throw new Error('Failed to Find SKU')
      }
    }
  }

  _handleSelectedVariantChange() {
    if (!!this.selectedVariantSKU) {
      this._applyMakeupFilter()
      this.$button?.removeAttribute('disabled')
    } else {
      if (this.$button) this.$button.disabled = 'true'

      if (this.isOpen) {
        this.close()
      }
    }
  }

  _resetWidget() {
    YMK.removeEventListener('loaded', this._applyMakeupFilter)
    YMK.removeEventListener('loaded', this._handleOpened)
    YMK.removeEventListener('opened', this._handleOpened)
    YMK.removeEventListener('engineClosed', this._handleEngineClosed)
    YMK.removeEventListener('closed', this._handleClosed)
    this.isOpen = false
    this._initWidget()
  }

  _attachListeners() {
    this._handleMediaQuery()
    this.mql.onchange = () => {
      this._handleMediaQuery()
      if (this.isReady) {
        this._resetWidget()
      }
    }

    this.$button.addEventListener('click', this._handleClick)
    this._handleSelectedVariantChange()
  }

  _removeListeners() {
    this.mql.onchange = null
    this.$button.removeEventListener('click', this._handleClick)
    this._resetWidget()
  }

  close() {
    this.target.classList.remove('open')
    YMK.closeEngine()
  }

  show() {
    this.target.classList.add('open')
    const mobileSlider = this.$mobileGallery.querySelector(
      '.product-gallery__mobile-slider-container'
    )
    mobileSlider.style.opacity = 0
    mobileSlider.style.marginBottom = "60px"
    if (this.isOpen) {
      this._applyMakeupFilter()
    } else {
      YMK.open(true)
    }
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  connectedCallback() {
    this._attachListeners()
  }
}

window.customElements.define('virtual-try-on', VirtualTryOn)

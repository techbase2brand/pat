class MatchedShadeFinder extends HHBaseElement {
  constructor() {
    super()

    this._handleClosed = this._handleClosed.bind(this)
    this._handleAddToBag = this._handleAddToBag.bind(this)

    this._initScript()
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

  _initScript() {
    if (document.getElementById('ymk-matched-script')) {
      this.show()
    } else {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.id = 'ymk-matched-script'
      window.ymkAsyncInit = () => {
        this._initWidget()
      }
      script.src = `https://plugins-media.makeupar.com/${this.widgetId}/sdk.js?apiKey=${this.apiKey}`
      document.body.appendChild(script)
    }
  }

  _initWidget() {
    YMK.addEventListener('closed', this._handleClosed)
    YMK.addEventListener('addToBag', this._handleAddToBag)
    YMK.init({
      autoOpen: false,
      language: this.language,
      enableKissDetection: this.enableKissDetection,
      privacyPolicyURL: this.privacyPolicyURL,
    })

    this.show()
  }

  _handleClosed() {
    this.close()
  }

  async _handleAddToBag(sku) {
    let variantID = 0
    variantID = await this.fetchVariantIdBySKU(sku)

    if (variantID) {
      window.__CART__CONTROLLER__.add([
        {
          id: variantID,
          quantity: 1,
        },
      ])
    } else {
      console.error('Not found product')
    }
  }

  show() {
    YMK.open(true, null, true)
  }

  close() {
    document
      .querySelector('#foundation-finder')
      ._shadowRoot.querySelector('.js-close-slideout')
      .click()
  }

  async fetchVariantIdBySKU(sku) {
    const url = `/search?q=${sku}`
    const response = await fetch(url)
    const responseText = await response.text()
    const results = JSON.parse(responseText)
    let variant = null
    if (results.length) {
      variant = results.find((item) => item.sku === sku)
    }
    if (variant) return variant.id
    return 0
  }
}

window.customElements.define('matched-shade-finder', MatchedShadeFinder)

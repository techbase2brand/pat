class FindationButton extends HHBaseElement {
  constructor() {
    super()

    this._handleClick = this._handleClick.bind(this)
    this.$button = this.querySelector('button')
    if (!this.isQuickView) {
      this._injectTaget()
      this._initScript()
      this.$button.disabled = 'true'
    }
  }

  connectedCallback() {
    if (this.isQuickView) {
      this._attachListeners()
    }
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  widgetEmbedded() {
    this.$button.removeAttribute('disabled')
    document
      .getElementById('findation-button-iframe')
      .setAttribute('aria-hidden', 'true')
    this._attachListeners()
    // 'Presented' is the default state
  }

  widgetDidOpen() {
    // Opened
    document.querySelector('product-gallery').style.top = '0'
    document.querySelector('html').classList.add('frozen')
    document.querySelector('body').classList.add('frozen')
  }

  widgetDidClose() {
    // Closed
    document.querySelector('product-gallery').style.top = 'var(--header-spacer)'
    document.querySelector('html').classList.remove('frozen')
    document.querySelector('body').classList.remove('frozen')
    document.getElementById('findation-iframe').src += ''
  }

  onSearchComplete(data) {
    // data.countShadesEntered
    if (data.matchSuccess) {
      // data.recommendedShade is the recommended shade
    } else {
      // Widget No Recommendation
    }
  }

  get apiKey() {
    return this.getAttribute('api-key')
  }

  get mode() {
    return this.getAttribute('mode') === "true"
  }

  get isQuickView() {
    return this.getAttribute('quick-view') === 'true'
  }

  get productUrl() {
    return this.getAttribute('data-url')
  }

  _injectTaget() {
    this.target = document.createElement('div')
    this.target.id = 'findation-widget-button'
    this.appendChild(this.target)
  }

  _initScript() {
    if (document.getElementById('findation-widget-script')) {
      this._initWidget()
    } else {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.id = 'findation-widget-script'
      script.onload = () => {
        this._initWidget()
      }
      script.src = 'https://assets.findation.com/javascripts/w-adv-10.min.js'
      document.body.appendChild(script)
    }
  }

  _initWidget() {
    window.Findation = window.Findation || {}
    Findation.widgetEmbedded = this.widgetEmbedded.bind(this)
    Findation.widgetDidOpen = this.widgetDidOpen.bind(this)
    Findation.widgetDidClose = this.widgetDidClose.bind(this)
    Findation.onSearchComplete = this.onSearchComplete.bind(this)
    Findation.init(this.target, this.apiKey, {
      isDemoMode: this.mode,
    })

    if (location.hash === '#find-my-shade') {
      this._handleClick()
    }
  }

  _handleClick() {
    if (this.isQuickView) {
      location.href = this.productUrl
    } else {
      window.postMessage('overlayOpen')
    }
  }

  _attachListeners() {
    this.$button.addEventListener('click', this._handleClick)
  }

  _removeListeners() {
    this.$button.removeEventListener('click', this._handleClick)
  }
}

window.customElements.define('findation-button', FindationButton)

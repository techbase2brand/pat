class LoadingButton extends HTMLButtonElement {
  static LOADER_HTML = `
    <div class="lds-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  `

  static get observedAttributes() {
    return ['loading']
  }

  get variantId() {
    return this.dataset.variantId
  }

  get isAtcButton() {
    return this.hasAttribute('atc-button')
  }

  constructor() {
    super()
    this._handleLoading = this._handleLoading.bind(this)
    this._addToCart = this._addToCart.bind(this)
    this._injectLoader()
  }

  _injectLoader() {
    this.loader = document.createElement('div')
    this.loader.setAttribute(
      'class',
      'loading-button__loader absolute inset flex align-center justify-center'
    )
    this.loader.innerHTML = LoadingButton.LOADER_HTML
    this.loader.style.display = 'none'
    this.classList.add('relative')
    this.appendChild(this.loader)
  }

  _handleLoading() {
    if (this.hasAttribute('loading')) {
      this.setAttribute('disabled', true)
      this.loader.style.display = ''
    } else {
      this.removeAttribute('disabled')
      this.loader.style.display = 'none'
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'loading') {
      this._handleLoading()
    }
  }

  connectedCallback() {
    if (this.isAtcButton) {
      this.addEventListener('click', this._addToCart)
    }
  }

  disconnectedCallback() {
    if (this.isAtcButton) {
      this.removeEventListener('click', this._addToCart)
    }
  }

  async _addToCart(e) {
    try {
      e.preventDefault()
      this.setAttribute('loading', true)
      await window.__CART__CONTROLLER__.add([
        {
          id: this.variantId,
          quantity: 1,
        },
      ])
    } finally {
      this.removeAttribute('loading')
    }
  }
}

window.customElements.define('loading-button', LoadingButton, {
  extends: 'button',
})

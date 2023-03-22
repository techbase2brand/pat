class QuickView extends HHBaseElement {
  static get observedAttributes() {
    return ['product-handle', 'variant-id']
  }

  productHandle = null
  productHTML = ''

  constructor() {
    super()
    this.$title = this.querySelector('[slot="title"]')
    this.$content = this.querySelector('[slot="content"]')
    this.slidePanel = this.querySelector('slide-panel')
    this.collectionGrid = document.querySelector('.collection-grid')
    this._handleClick = this._handleClick.bind(this)
    this.close = this.close.bind(this)

    this._openSlideout = this._openSlideout.bind(this)
    this._updateVariantInPanel = this._updateVariantInPanel.bind(this)
  }

  connectedCallback() {
    this._attachListeners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'product-handle') {
      if (
        oldValue === newValue &&
        this.getAttribute('variant-id') !== this.variantId
      ) {
        this._updateVariantInPanel(this.getAttribute('variant-id'))
        return
      }

      if (!!newValue) {
        this.variantId = this.getAttribute('variant-id')
        this._showProduct(newValue, oldValue)
      } else {
        this.close()
      }
    }
  }

  showProduct(productHandle, variantId) {
    this.setAttribute('variant-id', variantId)
    this.setAttribute('product-handle', productHandle)
  }

  close() {
    this.slidePanel.open = false
    this._reset()
  }

  async _fetchProduct() {
    const response = await fetch(
      `${__GLOBAL__.routes.rootUrl}/products/${this.productHandle}?view=quick-view&variant=${this.variantId}`
    )
    if (response.ok) {
      this.productHTML = await response.text()
    } else {
      throw new Error('Failed to fetch product')
    }
  }

  get product() {
    const container = document.createElement('div')
    container.innerHTML = this.productHTML
    return container
  }

  get productTitle() {
    return this.product.querySelector('[data-product-title]').innerHTML
  }

  get productContent() {
    return this.product.innerHTML
  }

  _attachListeners() {
    document.addEventListener('click', this._handleClick)
    document.addEventListener('quick-shop::close', this.close)
  }

  _removeListeners() {
    document.removeEventListener('click', this._handleClick)
    document.removeEventListener('quick-shop::close', this.close)
  }

  async _handleClick(e) {
    if (
      e.target.dataset.productHandle &&
      e.target.classList.contains('js-toggle-quick-shop')
    ) {
      e.preventDefault()
      let button = e.target
      let handle = button.dataset.productHandle
      let variantId = button.dataset.variantId
      this.editLineItemKey = button.dataset.editLineItemKey || null
      this.editLineItemQuantity = button.dataset.editLineItemQuantity || null

      await this.showProduct(handle, variantId)
    }
  }

  _reset() {
    this.productHandle = null
    this.variantId = null
    this.editLineItemKey = null
    this.editLineItemQuantity = null
    this.productHTML = ''
    this.removeAttribute('product-handle')
    this.$content.innerHTML = ''
    this.$title.innerHTML = ''
  }

  _setInnerHTML = function (elm, html) {
    elm.innerHTML = html
    Array.from(elm.querySelectorAll('script')).forEach((oldScript) => {
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      )
      newScript.appendChild(document.createTextNode(oldScript.innerHTML))
      oldScript.parentNode.replaceChild(newScript, oldScript)
    })
  }

  async _showProduct(productHandle, oldValue) {
    this.productHandle = productHandle
    await this._fetchProduct()

    this._setInnerHTML(this.$content, this.productContent)

    this.slidePanel.open = true

    this.querySelector('slide-panel').setupFocusTrap()
  }

  _openSlideout() {
    this.slidePanel.open = true
    this.querySelector('slide-panel').setupFocusTrap()
  }

  _updateVariantInPanel(newVariantId) {
    this.slidePanel
      .querySelector('variant-dropdown')
      .setAttribute('variant', newVariantId)

    this._openSlideout()
  }
}
window.customElements.define('quick-shop', QuickView)

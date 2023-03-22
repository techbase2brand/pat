class CartPopup extends HHBaseElement {
  CLOSE_TIMEOUT = 3000
  SELECTORS_TO_UPDATE = [
    '[data-cart-gwp]',
    '[data-cart-footer]',
    '[data-cart-content]',
    '[data-cart-items-count]',
    'price-progress',
  ]
  constructor() {
    super()
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this._show = this._show.bind(this)
    this._hide = this._hide.bind(this)
    this._handlePointerEnter = this._handlePointerEnter.bind(this)
    this._handlePointerLeave = this._handlePointerLeave.bind(this)
    this._handleDocumentClick = this._handleDocumentClick.bind(this)
    this.setPosition = this.setPosition.bind(this)
    this.closeBtn = this.querySelector('[data-cart-close]')
    this.cartItemCountInHeader = document.querySelector(
      '[data-header-cart-count]'
    )
    setTimeout(() => {
      this.classList.add('block')
    }, 300)
  }

  connectedCallback() {
    this._attachListeners()
    this.setPosition()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  static get observedAttributes() {
    return ['anchor']
  }

  get anchorElement() {
    return document.querySelector(this.getAttribute('anchor'))
  }

  get isTallerThenViewPort() {
    return this.clientHeight > window.innerHeight
  }

  setPosition() {
    try {
      const bounds = this.anchorElement.getBoundingClientRect()
      this.style.setProperty(
        '--cart-popup-anchor-offset-top',
        20 + bounds.top + bounds.height + 'px'
      )

      this.style.setProperty(
        '--cart-popup-anchor-offset-right',
        bounds.left + bounds.width * 2 + 'px'
      )

      this.classList[this.isTallerThenViewPort ? 'add' : 'remove']('taller')
    } catch (error) {}
  }

  _handleDocumentClick(event) {
    if (!this.contains(event.target)) {
      this.close()
    }
  }

  _attachListeners() {
    document.addEventListener('cart-popup::open', this.open)
    document.addEventListener('click', this._handleDocumentClick)
    this.addEventListener('pointerenter', this._handlePointerEnter)
    this.addEventListener('pointerleave', this._handlePointerLeave)
    this.closeBtn.addEventListener('click', this.close)
    this.addEventListener('nosto::rendered', this.setPosition)
  }

  _removeListeners() {
    document.removeEventListener('cart-popup::open', this.open)
    document.removeEventListener('click', this._handleDocumentClick)
    this.removeEventListener('pointerenter', this._handlePointerEnter)
    this.removeEventListener('pointerleave', this._handlePointerLeave)
    this.closeBtn.removeEventListener('click', this.close)
    this.removeEventListener('nosto::rendered', this.setPosition)
  }

  _handlePointerEnter() {
    this.clearCloseTimer()
  }

  _handlePointerLeave() {
    this.setCloseTimer()
  }

  setCloseTimer() {
    this.clearCloseTimer()
    this.timerId = setTimeout(this.close, this.CLOSE_TIMEOUT)
  }

  clearCloseTimer() {
    clearTimeout(this.timerId)
    this.timerId = null
  }

  async open(event) {
    await this.update(event.detail.items)
    this._show()
    this.setCloseTimer()
  }

  close() {
    this.clearCloseTimer()
    this._hide()
  }

  _show() {
    this.setPosition()
    this.classList.add('active')
  }

  _hide() {
    this.classList.remove('active')
  }

  async update(items = []) {
    const response = await fetch(`${__GLOBAL__.routes.rootUrl}/cart?view=popup`)
    const element = document.createElement('div')
    element.innerHTML = await response.text()
    const $lineItems = Array.from(
      element.querySelectorAll('[data-cart-content] .cart-popup__item')
    )

    $lineItems.forEach(($lineItem, index) => {
      if (
        !items.find(
          (item) => String(item.id) === $lineItem.getAttribute('line-item-id')
        )
      ) {
        $lineItem.remove()
      }
    })

    this.SELECTORS_TO_UPDATE.forEach((selector) => {
      const content = element.querySelector(selector)
      if (selector === '[data-cart-items-count]') {
        this.cartItemCountInHeader.innerHTML = content.dataset.count
        this.cartItemCountInHeader.classList.remove('hidden')
      } else if (selector === 'price-progress') {
        if (this.querySelector(selector)) {
          this.querySelector(selector).value = content.value
        }
      } else {
        this.querySelector(selector).innerHTML = content.innerHTML
      }
    })
  }
}
window.customElements.define('cart-popup', CartPopup)

class CartLineItem extends HHBaseElement {
  lineItemId = null
  lineItemIndex = null
  lineItemKey = null
  _lineItemQuantity = 0
  state = {
    updating: false,
    error: null,
  }

  constructor() {
    super()
    this.$mainCart = this.closest('main-cart')
    this.$mainFreeSamples =
      this.closest('main-cart').querySelector('cart-free-samples')
    this.$errorText = this.querySelector('.js-main-cart__line-item__error-text')
    this.$quantityInput = this.querySelector('quantity-input')
    this.$removeItem = this.querySelector('.main-cart__line-item__remove')
    this.$editItem = this.querySelector('.main-cart__line-item__edit')
    this._handleQuantityChange = this._handleQuantityChange.bind(this)
    this._removeLineItem = this._removeLineItem.bind(this)
  }

  get key() {
    return this.getAttribute('line-item-key')
  }

  get lineItemQuantity() {
    return this._lineItemQuantity
  }

  set lineItemQuantity(quantity) {
    this._lineItemQuantity = quantity
    if (this.$quantityInput) this.$quantityInput.setAttribute('value', quantity)

    if (this.$editItem) {
      this.$editItem.setAttribute('data-edit-line-item-quantity', quantity)
    }
  }

  update(lineItem) {
    this.setAttribute('line-item-quantity', lineItem.quantity)
    if (this.$editItem) {
      this.$editItem.setAttribute(
        'data-edit-line-item-quantity',
        lineItem.quantity
      )
      this.$editItem.setAttribute('data-edit-line-item-key', lineItem.key)
      this.$editItem.setAttribute('data-variant-id', lineItem.variant_id)
    }
  }

  connectedCallback() {
    if (!this.$mainCart) {
      throw new Error('Line items should always be inside <main-cart />')
    }
    this._attachListeners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  static get observedAttributes() {
    return [
      'line-item-id',
      'line-item-index',
      'line-item-key',
      'line-item-quantity',
    ]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'line-item-id') {
      this.lineItemId = newValue
    }

    if (name === 'line-item-index') {
      this.lineItemIndex = newValue
    }

    if (name === 'line-item-key') {
      this.lineItemKey = newValue
    }

    if (name === 'line-item-quantity') {
      this.lineItemQuantity = newValue
    }
  }

  hide() {
    return new Promise((resolve) => {
      this.classList.add('hiding')
      setTimeout(resolve, 350)
    })
  }

  async hideAndRemove() {
    await this.hide()
    this.remove()
  }

  async _removeLineItem(event) {
    try {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      this._applyState({ updating: true, error: null })
      await this.$mainCart.updateQuantity({ [this.lineItemKey]: 0 })
      this.$mainFreeSamples.removedFromCart(this.lineItemKey)
    } catch (error) {
      this._applyState({ error: error.message || window.cartStrings.failedToRemove })
    } finally {
      this._applyState({ updating: false })
    }
  }

  async _handleQuantityChange(event) {
    try {
      const quantity = Number(event.detail.value)
      if (quantity === 0) {
        return this._removeLineItem()
      }
      this._applyState({ updating: true, error: null })
      await this.$mainCart.updateQuantity({ [this.lineItemKey]: quantity })
    } catch (error) {
      let errorMsg = "";
      if (error?.message.indexOf("Cannot read") > -1) {
        errorMsg = "Failed to Update Quantity"
      } else if (error?.message) {
        errorMsg = error.message;
      }
      this._applyState({ error: errorMsg|| window.cartStrings.failedQuantity })
    } finally {
      this._applyState({ updating: false })
    }
  }

  _attachListeners() {
    if (this.$quantityInput)
      this.$quantityInput.addEventListener('change', this._handleQuantityChange)
    this.$removeItem.addEventListener('click', this._removeLineItem)
  }

  _removeListeners() {
    if (this.$quantityInput)
      this.$quantityInput.removeEventListener(
        'change',
        this._handleQuantityChange
      )
    this.$removeItem.removeEventListener('click', this._removeLineItem)
  }

  _applyState(partialState) {
    this.state = { ...this.state, ...partialState }
    this._renderState()
  }

  _renderState() {
    if (this.state.updating) {
      this.classList.add('updating')
    } else {
      this.classList.remove('updating')
    }

    if (this.state.error) {
      this.$errorText.innerText = this.state.error
    } else {
      this.$errorText.innerText = ''
    }
  }
}

window.customElements.define('cart-line-item', CartLineItem)

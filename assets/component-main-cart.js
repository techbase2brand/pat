class MainCart extends HHBaseElement {
  updating = false

  constructor() {
    super()
    this.cart = window.__CART__
    this._handleStickyCTA = this._handleStickyCTA.bind(this)
    this.refresh = this.refresh.bind(this)
    this.$items = this.querySelector('#cart-items .cart-items__items')
    this.$stickyCTA = this.querySelector('.js-main-cart-sticky-cta')
    this.$stickDetect = this.querySelector('.js-main-cart-sticky-detect')
    this.$gwp = this.querySelector('price-progress')
    this.$cartItemsContainer = this.querySelector('.main-cart__items-container')
    this.$checkoutBtns = Array.from(
      this.querySelectorAll('.js-checkout-button')
    )
    this.$cartItemCountInHeader = document.querySelector(
      '[data-header-cart-count]'
    )
    this.$cartFreeSamples = this.querySelector('.js-main-cart__free')
  }

  connectedCallback() {
    // this._viewportWatcher()
    this._attachListeners()
    // this._calculateHeaderHeight()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  _handleStickyCTA(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.$stickyCTA.classList.remove('stuck')
      } else {
        this.$stickyCTA.classList.add('stuck')
      }
    })
  }

  _attachListeners() {
    this.stickyObserver = new IntersectionObserver(this._handleStickyCTA)

    if (this.$stickDetect) {
      this.stickyObserver.observe(this.$stickDetect)
    }
    document.addEventListener('main-cart::refresh', this.refresh)
  }

  _removeListeners() {
    this.stickyObserver.disconnect()
    document.removeEventListener('main-cart::refresh', this.refresh)
  }

  async updateQuantity(updates) {
    try {
      this.updating = true

      const response = await fetch(
        `${__GLOBAL__.routes.rootUrl}/cart/update.js`,
        {
          method: 'POST',
          body: JSON.stringify({
            updates,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      const cart = await response.json()
      this.updateCart(cart)
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      this.updating = false
    }
  }

  async refresh() {
    try {
      const response = await fetch(`${__GLOBAL__.routes.rootUrl}/cart.js`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      const cart = await response.json()
      this.updateCart(cart)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  _applyAttrUpdates() {
    const cartDataAttributes = this.querySelectorAll('[data-cart-attribute]')

    for (const cartDataAttribute of cartDataAttributes) {
      const fetcher = cartDataAttribute.getAttribute('data-cart-attribute')

      if (this.cart.hasOwnProperty(fetcher)) {
        if (cartDataAttribute.hasAttribute('data-format-currency')) {
          cartDataAttribute.innerHTML = Shopify.formatMoney(this.cart[fetcher])
        } else {
          cartDataAttribute.innerHTML = this.cart[fetcher]
        }
      }
    }
  }

  async _fetchRawCartItems() {
    const response = await fetch(`${__GLOBAL__.routes.rootUrl}/cart`)
    const container = document.createElement('div')
    container.innerHTML = await response.text()
    const lineItems = container.querySelectorAll('cart-line-item')

    return Array.from(lineItems)
  }

  async _applyCartItems(previousCart) {
    const $lineItems = Array.from(this.querySelectorAll('cart-line-item'))
    const previousLineItems = previousCart.items || []
    const cartItems = this.cart.items || []

    if (cartItems.length === 0) {
      this.$cartItemsContainer.classList.add('is-empty')
    } else {
      this.$cartItemsContainer.classList.remove('is-empty')
    }

    const removedItems = previousLineItems.filter(
      (previousItem) => !cartItems.some((item) => item.key == previousItem.key)
    )
    const addedItems = cartItems.filter(
      (newItem) => !previousLineItems.some((item) => item.key == newItem.key)
    )
    const updatedItems = cartItems.filter((newItem) =>
      previousLineItems.some((item) => item.key === newItem.key)
    )

    const rawLineItems = addedItems.length
      ? await this._fetchRawCartItems()
      : []

    updatedItems.forEach((updatedItem) => {
      const $lineItem = $lineItems.find(
        ($lineItem) => $lineItem.key === updatedItem.key
      )
      if ($lineItem) {
        $lineItem.update(updatedItem)
      }
    })

    removedItems.forEach((updatedItem) => {
      const $lineItem = $lineItems.find(
        ($lineItem) => $lineItem.key === updatedItem.key
      )

      if ($lineItem) {
        $lineItem.hideAndRemove()
      }
    })

    if (addedItems.length) {
      const newLineItems = rawLineItems
        .filter((lineItem) =>
          addedItems.some((item) => item.key === lineItem.key)
        )
        .map((el) => el.outerHTML)

      this.$items.insertAdjacentHTML('afterbegin', newLineItems.join(''))
    }
  }

  setBusy(status) {
    this.$checkoutBtns.forEach((btn) => {
      if (status) {
        btn.classList.add('disabled')
      } else {
        btn.classList.remove('disabled')
      }
    })
  }

  updateItemCountInHeader() {
    this.$cartItemCountInHeader.innerHTML = this.cart.item_count
    this.$cartItemCountInHeader.classList[
      this.cart.item_count ? 'remove' : 'add'
    ]('hidden')
  }

  async manageFreeSamples() {
    const freeSamplesParams = {}
    const nonFreeItemsCount = this.cart.items.reduce((count, item) => {
      if (!Object.keys(item.properties).includes('_free-sample')) {
        if (!item.gift_card) count += 1
      } else freeSamplesParams[item.key] = 0
      return count
    }, 0)
    if (nonFreeItemsCount === 0) {
      if (!this.$cartFreeSamples.classList.contains('hidden'))
        this.$cartFreeSamples.classList.add('hidden')
      await this.updateQuantity(freeSamplesParams)
      this.$cartFreeSamples.removedAllFromCart()
    } else {
      this.$cartFreeSamples?.classList.remove('hidden')
    }
  }

  async updateCart(cart) {
    try {
      this.setBusy(true)
      const previousCart = { ...this.cart }
      this.cart = { ...cart }

      this._applyAttrUpdates()
      await this._applyCartItems(previousCart)
      if (this.$gwp) {
        this.$gwp.value = this.cart.items_subtotal_price
      }

      this.updateItemCountInHeader()
      await this.manageFreeSamples()
    } catch (error) {
      console.error(error)
    } finally {
      this.setBusy(false)
    }
  }
}

window.customElements.define('main-cart', MainCart)

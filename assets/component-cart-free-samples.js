class CartFreeSamples extends HHBaseElement {
  constructor() {
    super()

    this.$atcLabels = JSON.parse(window.atob(this.dataset.atcLabels))
    this.limits = Number(this.dataset.limits)
    this.$actions = this.querySelectorAll('.js-free-smaple-action')
    this._doFreeSample = this._doFreeSample.bind(this)
    this._addFreeSample = this._addFreeSample.bind(this)
    this._removeFreeSample = this._removeFreeSample.bind(this)

    this.totalAdded = 0
    setTimeout(() => {
      this.totalAdded = this.querySelectorAll('.added:not(.clone-set-1)').length
      this.checkLimits()
    }, 100)
  }

  update(lineItem) {
    this.setAttribute('line-item-quantity', lineItem.quantity)
  }

  connectedCallback() {
    this._attachListeners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  checkLimits() {
    if (this.limits === 0) return false

    if (this.limits <= this.totalAdded) {
      this.querySelectorAll('.main-cart__free-sample:not(.added)').forEach(
        (item) => {
          item.querySelector('button').disabled = true
        }
      )
    } else {
      this.querySelectorAll('.main-cart__free-sample:not(.added)').forEach(
        (item) => {
          item.querySelector('button').disabled = false
        }
      )
    }
  }

  async _doFreeSample(item) {
    const sliderContainer = item.closest('simple-slider')
    sliderContainer.classList.add('processing')

    const parent = item.closest('.main-cart__free-sample')
    if (parent.classList.contains('added')) {
      this.totalAdded -= 1
      await this._removeFreeSample(item)
      item.querySelector('span').innerHTML = this.$atcLabels.add
      parent.classList.remove('added')
    } else {
      this.totalAdded += 1
      await this._addFreeSample(item)
      item.querySelector('span').innerHTML = this.$atcLabels.remove
      parent.classList.add('added')
    }
    this.triggerGlobalEvent('main-cart::refresh')
    this.checkLimits()
    sliderContainer.classList.remove('processing')
  }

  async _addFreeSample(item) {
    const variant_id = Number(item.dataset.variantId)
    await window.__CART__CONTROLLER__.add(
      [
        {
          id: variant_id,
          quantity: 1,
          properties: {
            '_free-sample': true,
          },
        },
      ],
      true
    )
  }

  async _removeFreeSample(item) {
    const variant_id = Number(item.dataset.variantId)
    await window.__CART__CONTROLLER__.update({
      [variant_id]: 0,
    })
  }

  removedFromCart(key) {
    const sliderContainers = this.querySelectorAll('simple-slider')
    sliderContainers.forEach((item) => item.classList.add('processing'))
    const variant_id = key.split(':')[0]
    let hasMatchedItem = false
    this.$actions.forEach((item) => {
      if (item.dataset.variantId === variant_id) {
        item.querySelector('span').innerHTML = this.$atcLabels.add
        item.closest('.main-cart__free-sample').classList.remove('added')
        hasMatchedItem = true
      }
    })
    if (hasMatchedItem) this.totalAdded -= 1

    this.checkLimits()
    sliderContainers.forEach((item) => item.classList.remove('processing'))
  }

  removedAllFromCart() {
    this.totalAdded = 0
    this.checkLimits()
  }

  _attachListeners() {
    this.$actions.forEach((item) => {
      item.addEventListener('click', (event) => this._doFreeSample(item))
    })
  }

  _removeListeners() {
    this.$actions.forEach((item) => {
      item.removeEventListener('click', (event) => this._doFreeSample(item))
    })
  }
}

window.customElements.define('cart-free-samples', CartFreeSamples)

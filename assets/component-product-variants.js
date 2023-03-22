/**
 * Convert rgb to hex
 *
 * @param {r, g, b} int rgb values
 */
function componentToHex(c) {
  const hex = c.toString(16)
  return hex.length == 1 ? '0' + hex : hex
}

const rgbToHex = (r, g, b) => {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

class ProductVariants extends HHBaseElement {
  productHandle = null
  productHTML = ''

  static get observedAttributes() {
    return ['variantId']
  }

  constructor() {
    super()

    this.mainProduct = this.closest('main-product')

    this.allSwatches = [...this.querySelectorAll('.swatch button')]
    this.allSizeButtons = [
      ...this.querySelectorAll('.size-variants-container button'),
    ]
    // variants that aren't size or color
    this.allVariantDropdownOptions = [
      ...this.mainProduct.querySelectorAll(
        '.general-variants-container variant-dropdown .dropdown-options input'
      ),
    ]

    this.productForm = this.mainProduct.querySelector(
      '#product-form-installment'
    )
    this.atcButton = this.mainProduct.querySelector('#add-to-cart')
    this.quickShopParent = this.closest('quick-shop')

    this._updateVariant = this._updateVariant.bind(this)
    this._initOptionSelectorMap = this._initOptionSelectorMap.bind(this)
  }

  async connectedCallback() {
    await this.mainProduct.isReadyPromise
    this._initOptionSelectorMap()
    this._attachListeners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  get isUpdatingLineItem() {
    return this.quickShopParent && !!this.quickShopParent.editLineItemKey
  }

  get productId() {
    return this.getAttribute('product-id')
  }

  get product() {
    return JSON.parse(
      window.atob(
        this.querySelector(`#main-product-data-${this.productId}`).innerText
      )
    )
  }

  get variantType() {
    return this.getAttribute('variantType')?.trim()
  }

  set variantId(id) {
    this.setAttribute('variantId', id)
  }

  get variantId() {
    return this.getAttribute('variantId')
  }

  get product() {
    return JSON.parse(
      window.atob(
        document.querySelector(`#main-product-data-${this.productId}`).innerText
      )
    )
  }

  _attachListeners() {
    if (this.variantType === 'color') {
      this.allSwatches.forEach((swatch) =>
        swatch.addEventListener('click', this._updateVariant)
      )

      let matchingButton = this.allSwatches.filter(
        (button) => button.dataset.variantId === this.variantId
      )?.[0]

      matchingButton.click()
    } else if (this.variantType === 'size') {
      this.allSizeButtons.forEach((button) =>
        button.addEventListener('click', this._updateVariant.bind(this))
      )
    } else if (
      this.variantType === 'other' ||
      this.variantType === 'general-variants'
    ) {
      this.allVariantDropdownOptions.forEach((input) =>
        input.addEventListener('change', this._updateVariant.bind(this))
      )
    }

    this.productForm.addEventListener('submit', this.addToCart.bind(this))
  }

  _removeListeners() {
    if (this.variantType === 'color') {
      this.allSwatches.forEach((swatch) =>
        swatch.removeEventListener('click', this._updateVariant)
      )
    } else if (this.variantType === 'size') {
      this.allSizeButtons.forEach((button) =>
        button.removeEventListener('click', this._updateVariant)
      )
    }

    this.productForm.removeEventListener('submit', this.addToCart)
  }

  _updateVariant(e) {
    let newVariantValue = e.target.dataset.label
      ? e.target.dataset.label
      : e.target.value
    let newVariantId = e.target.dataset.variantId

    let isSelector = this.querySelector('.single-option-selector')
    let isGeneralVariants = this.variantType === 'general-variants'

    this.variantId = newVariantId

    if (isSelector && !isGeneralVariants) {
      this.variantSelector = this.querySelector('.single-option-selector')
      let backgroundColor = e.target.style.backgroundColor
      if (backgroundColor.indexOf('rgb') > -1) {
        backgroundColor = backgroundColor
          .replace('rgb(', '')
          .replace(')')
          .split(', ')
        const r = parseInt(backgroundColor[0]) || 0
        const g = parseInt(backgroundColor[1]) || 0
        const b = parseInt(backgroundColor[2].replace('undefined', '')) || 0
        backgroundColor = rgbToHex(r, g, b)
      }

      if (newVariantValue && isSelector) {
        this.mainProduct.querySelector('.js-selected-variant-hex').value =
          backgroundColor

        let variantMapValue = Array.from(this.variantMap).filter(
          (variant) => variant.name === newVariantValue
        )?.[0]?.optionGenName

        this.variantSelector.value = variantMapValue
        let event = new Event('change')
        this.variantSelector.dispatchEvent(event)
      }
    } else {
      let div = this
      let variantMap = this.variantMap
      setTimeout(function () {
        div
          .querySelector('variant-dropdown')
          .setAttribute('variant', newVariantId)

        let variantMapValue = variantMap.filter(
          (variant) => variant.name === newVariantValue
        )?.[0]?.optionGenName

        if (isSelector) {
          isSelector.value = variantMapValue
          isSelector.dispatchEvent(new Event('change'))
        }
      }, 20)
      return
    }
  }

  // This creates a map for easier variant switching
  _initOptionSelectorMap() {
    if (this.variantType === 'none' || !this.variantType) {
      return
    }

    let selector = this.querySelector('.single-option-selector')
    let options = [...selector.querySelectorAll('option')]

    let liquidVariants = this.querySelector('.hidden-variants')
    let liquidOptions = [...liquidVariants.querySelectorAll('option')]

    let rawVariants = this.product.variants

    this.variantMap = options.map((option, index) => {
      return {
        value: rawVariants[index].id,
        name: liquidOptions[index].innerText,
        optionGenName: option.value,
      }
    })
  }

  async addToCart(e) {
    e.preventDefault()
    const triggerButton = this.atcButton
    const selectedVariantId = this.mainProduct.querySelector(
      '.js-selected-variant'
    )
    const hexcode = this.mainProduct.querySelector('.js-selected-variant-hex')
    const body = {
      id: selectedVariantId.value,
      quantity: 1,
    }
    const sellingPlanId = new FormData(e.target).get('selling_plan');
    if (sellingPlanId) {
      body['selling_plan'] = sellingPlanId;
    }
    if (hexcode) {
      body['properties'] = {}
      body['properties']['hex'] = hexcode.value
    }

    if (this.isUpdatingLineItem) {
      try {
        if (triggerButton) {
          triggerButton.setAttribute('loading', true)
        }

        body['quantity'] = this.quickShopParent.editLineItemQuantity || 1
        await window.__CART__CONTROLLER__.add([body], true)
        await window.__CART__CONTROLLER__.update({
          [this.quickShopParent.editLineItemKey]: 0,
        })
        this.triggerGlobalEvent('main-cart::refresh')
        this.quickShopParent.close()
      } finally {
        if (triggerButton) {
          triggerButton.removeAttribute('loading')
        }
      }
    } else {
      try {
        if (triggerButton) {
          triggerButton.setAttribute('loading', true)
        }

        await window.__CART__CONTROLLER__.add([body])
        if (this.closest('quick-shop')) {
          document.dispatchEvent(new CustomEvent('quick-shop::close'))
        }
      } finally {
        if (triggerButton) {
          triggerButton.removeAttribute('loading')
        }
      }
    }
  }
}

window.customElements.define('product-variants', ProductVariants)

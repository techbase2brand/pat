class MainProduct extends HHBaseElement {
  constructor() {
    super()
    this._isReadyPromise = new Deferred()
    this.selectCallback = this.selectCallback.bind(this)
    this.subscriptionPercent =
      this.product.selling_plan_groups[0]?.selling_plans[0]
        ?.price_adjustments[0]?.value ?? 0
    this.originalPrice =
      this.product.price_max > this.product.price_min
        ? this.product.price_max
        : this.product.price
    this.subscriptionPrice =
      this.originalPrice * ((100 - this.subscriptionPercent) / 100)

    this.stockNotification = this.querySelectorAll(
      '.single-product-page .atc-container #stock_notification'
    )
    this.fixedAddToCartButton = this.querySelectorAll(
      '.fixed-add-to-cart__button-container .atc-container #add_to_cart'
    )

    // Ensure ATC price is always correct by observing '#product-form-installment .atc-price' for textContent mutations.
    // This is important for displaying the ATC correctly on the initial page load
    this.atcPriceObserver = new MutationObserver((mutationRecords) => {
      for (const mutation of mutationRecords) {
        if (mutation.type === 'childList') {
          if (mutation.target.textContent !== this.atcPrice) {
            this.updateAtcPrice()
          }
        }
      }
    })

    // Update the ATC price when a subscription is selected / unselected
    this.subscriptionObserser = new MutationObserver((mutationRecords) => {
      for (const mutation of mutationRecords) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'subscribed'
        ) {
          this.updateAtcPrice()
        }
      }
    })

    if (this.orderGrooveEnabled) {
      this.updateAtcPrice()
      const subscriptionObserserTarget = document.querySelector('og-offer')
      if (subscriptionObserserTarget) {
        this.subscriptionObserser.observe(subscriptionObserserTarget, {
          attributes: true,
        })
      }

      const atcPriceObserverTarget = document.querySelector(
        '#product-form-installment .atc-price'
      )
      if (atcPriceObserverTarget) {
        this.atcPriceObserver.observe(atcPriceObserverTarget, {
          childList: true,
        })
      }
    }
  }

  get productId() {
    return this.getAttribute('product-id')
  }

  get product() {
    return JSON.parse(
      decodeURIComponent(
        escape(
          window.atob(
            this.querySelector(`#main-product-data-${this.productId}`).innerText
          )
        )
      )
    )
  }

  get currency() {
    return this.getAttribute('currency')
  }

  get variantType() {
    return this.getAttribute('variant-type')?.trim()
  }

  get withHistoryState() {
    return Boolean(this.getAttribute('with-history'))
  }

  get orderGrooveEnabled() {
    return Boolean(this.getAttribute('order-groove'))
  }

  get stockNotificationEnabled() {
    return Boolean(this.getAttribute('stock-notification'))
  }

  get variantStock() {
    return window[`variantStock${this.product.id}`]
  }

  get atcPrice() {
    const subscriptionSelected = document.querySelector(
      'og-optin-button[subscribed]'
    )
    if (Shopify.currency.active == 'GBP') {
      return Shopify.formatMoney(
        subscriptionSelected ? this.subscriptionPrice : this.originalPrice,
        '£{{amount}}'
      )
    } else {
      return Shopify.formatMoney(
        subscriptionSelected ? this.subscriptionPrice : this.originalPrice
      )
    }
  }

  stockNotificationHide() {
    if (this.stockNotificationEnabled) {
      this.stockNotification.forEach((button) => button.classList.add('hidden'))
      this.fixedAddToCartButton.forEach((button) =>
        button.classList.remove('hidden')
      )
    }
  }

  stockNotificationShow() {
    if (this.stockNotificationEnabled) {
      this.stockNotification.forEach((button) =>
        button.classList.remove('hidden')
      )
      this.fixedAddToCartButton.forEach((button) =>
        button.classList.add('hidden')
      )
    }
  }

  clearSelectedSizes() {
    let allSelectedSizes = [
      ...document.querySelectorAll('.size-select-container.selected'),
    ]
    allSelectedSizes.forEach((item) => item.classList.remove('selected'))
  }

  clearSelectedColors() {
    let allSelectedSwatches = [
      ...document.querySelectorAll('.color-select-container.selected'),
    ]
    allSelectedSwatches.forEach((item) => item.classList.remove('selected'))
  }

  selectCallback(variant, selector) {
    if (variant) {
      if (
        selector.domIdPrefix === 'size-variants' ||
        selector.domIdPrefix === 'size-variants-quick'
      ) {
        // size logic

        // 1.clear selected size and select new size
        this.clearSelectedSizes()
        let newSelectedSize = this.querySelector(
          `.options-wrapper li[data-value="${variant.title}"] .size-select-container`
        )
        newSelectedSize.classList.add('selected')

        let variantDropdowns = this.querySelectorAll('variant-dropdown')
        variantDropdowns.forEach((dropdown) =>
          dropdown.setAttribute('variant', variant.id)
        )
      } else if (
        selector.domIdPrefix === 'general-variants' ||
        selector.domIdPrefix === 'general-variants-quick'
      ) {
        let variantDropdowns = this.querySelectorAll('variant-dropdown')
        variantDropdowns.forEach((dropdown) =>
          dropdown.setAttribute('variant', variant.id)
        )
      } else {
        // update color dropdowns sort logic
        let variantDropdowns = this.querySelectorAll('variant-dropdown')
        variantDropdowns.forEach((dropdown) =>
          dropdown.setAttribute('variant', variant.id)
        )

        // // 3. Update selected color variant
        this.clearSelectedColors()

        let variantMapValue = this.variantMap.filter(
          (mappedVariant) => mappedVariant.optionGenName === variant.title
        )?.[0]?.name

        let newSelectedItem = this.querySelector(
          `.options-wrapper div[data-value="${variantMapValue}"] .color-select-container`
        )

        newSelectedItem?.classList.add('selected')

        // Apply to VTO
        if (
          typeof this.querySelector('virtual-try-on')
            ?._handleSelectedVariantChange === 'function'
        ) {
          this.querySelector('virtual-try-on')._handleSelectedVariantChange()
        }
      }

      // both color + size logic
      let variantInput = this.querySelector('.selected-variant')
      let viewMoreLink = this.querySelector('.view-full-details-link a')

      //  1. Update add to cart variant id
      variantInput.value = variant.id
      if (viewMoreLink) {
        let newViewMoreLink = new URL(viewMoreLink.href)
        newViewMoreLink.searchParams.set('variant', variant.id)
        viewMoreLink.href = newViewMoreLink?.href
      }

      // 2. Update product-gallery
      let productGalleries = this.querySelectorAll('product-gallery')
      productGalleries.forEach((gallery) =>
        gallery.setAttribute('variant', variant.title)
      )

      // 4. Update pricing
      let variantPrice = variant.price / 100
      let compareVariantPrice = variant?.compare_at_price / 100

      let priceParent = this.querySelector('.single-product-page .price ')
      let normalPriceContainer = this.querySelector(
        '.single-product-page .price__regular'
      )
      let salePriceContainer = this.querySelector(
        '.single-product-page .price__sale '
      )
      let addToCartButton = this.querySelectorAll(
        '.single-product-page .atc-container #add_to_cart'
      )
      let addToCartButtonPrices = this.querySelectorAll(
        '.single-product-page .atc-container #add_to_cart .atc-price'
      )
      let addToCartButtonTitle = this.querySelectorAll(
        '.single-product-page .atc-container #add_to_cart span:nth-child(1)'
      )
      let addToCartButtonSeparate = this.querySelectorAll(
        '.single-product-page .atc-container #add_to_cart .atc-separator'
      )
      let addToCartButtonIcon = this.querySelectorAll(
        '.single-product-page .atc-container #add_to_cart svg'
      )

      if (variant.compare_at_price) {
        // reveal compare price
        priceParent.classList.add('price--on-sale')
        normalPriceContainer.classList.add('hidden')
        salePriceContainer.classList.remove('hidden')

        // set new variant price
        let compareVariantDiv = salePriceContainer.querySelector(
          '.price-item--regular'
        )
        let priceDiv = salePriceContainer.querySelector('.price-item--sale')

        variantPrice = variantPrice.toLocaleString('en-US', {
          style: 'currency',
          currency: this.currency,
        })
        compareVariantPrice = compareVariantPrice.toLocaleString('en-US', {
          style: 'currency',
          currency: this.currency,
        })

        compareVariantDiv.innerHTML = compareVariantPrice
        priceDiv.innerHTML = variantPrice

        if (variant.available) {
          addToCartButtonPrices.forEach(
            (price) => (price.innerHTML = variantPrice)
          )
          addToCartButtonPrices.forEach((price) =>
            price.classList.remove('hidden')
          )
          addToCartButtonSeparate.forEach((separate) =>
            separate.classList.remove('hidden')
          )
          addToCartButtonIcon.forEach((icon) => icon.classList.remove('hidden'))
          addToCartButtonTitle.forEach(
            (title) => (title.innerHTML = atcStatusTitle.addToBag)
          )
          addToCartButton.forEach((button) => (button.disabled = false))
          this.stockNotificationHide()
        } else {
          addToCartButtonPrices.forEach((price) => {
            if (!price.classList.contains('hidden'))
              price.classList.add('hidden')
          })
          addToCartButtonSeparate.forEach((separate) => {
            if (!separate.classList.contains('hidden'))
              separate.classList.add('hidden')
          })
          addToCartButtonIcon.forEach((icon) => {
            if (!icon.classList.contains('hidden')) icon.classList.add('hidden')
          })
          addToCartButtonTitle.forEach(
            (title) => (title.innerHTML = atcStatusTitle.outOfStock)
          )
          addToCartButton.forEach((button) => (button.disabled = true))
          this.stockNotificationShow()
        }
      } else {
        // hide compare price
        priceParent.classList.remove('price--on-sale')
        normalPriceContainer.classList.remove('hidden')
        salePriceContainer.classList.add('hidden')

        // set new variant price
        let priceDiv = normalPriceContainer.querySelector(
          '.price-item--regular'
        )
        variantPrice = variantPrice.toLocaleString('en-US', {
          style: 'currency',
          currency: this.currency,
        })
        priceDiv.innerHTML = variantPrice

        if (variant.available) {
          addToCartButtonPrices.forEach(
            (price) => (price.innerHTML = variantPrice)
          )
          addToCartButtonPrices.forEach((price) =>
            price.classList.remove('hidden')
          )
          addToCartButtonSeparate.forEach((separate) =>
            separate.classList.remove('hidden')
          )
          addToCartButtonIcon.forEach((icon) => icon.classList.remove('hidden'))
          addToCartButtonTitle.forEach(
            (title) => (title.innerHTML = atcStatusTitle.addToBag)
          )
          addToCartButton.forEach((button) => (button.disabled = false))
          this.stockNotificationHide()
        } else {
          addToCartButtonPrices.forEach((price) => {
            if (!price.classList.contains('hidden'))
              price.classList.add('hidden')
          })
          addToCartButtonSeparate.forEach((separate) => {
            if (!separate.classList.contains('hidden'))
              separate.classList.add('hidden')
          })
          addToCartButtonIcon.forEach((icon) => {
            if (!icon.classList.contains('hidden')) icon.classList.add('hidden')
          })
          addToCartButtonTitle.forEach(
            (title) => (title.innerHTML = atcStatusTitle.outOfStock)
          )
          addToCartButton.forEach((button) => (button.disabled = true))
          this.stockNotificationShow()
        }
      }

      // 5. Update Selling Fast badge based on variant inventory - there are currently two instances of the badge
      let sellFastBadges = [
        ...this.querySelectorAll(
          '.single-product-page .selling-fast-container'
        ),
      ]

      if (sellFastBadges.length > 0) {
        let variantInventory = parseFloat(this.variantStock?.[variant.id]) || 0
        let sellFastThreshold = parseFloat(
          this.querySelector('.single-product-page .selling-fast-container')
            .dataset.threshold
        )

        if (variantInventory <= sellFastThreshold) {
          sellFastBadges.forEach((badge) => badge.classList.remove('hidden'))
        } else {
          sellFastBadges.forEach((badge) => badge.classList.add('hidden'))
        }
      }
    }

    // 6. Update fixed atc

    let fixedAtc = this.querySelector('.fixed-add-to-cart__container')

    if (fixedAtc && window.innerWidth > 992) {
      let fixedVariantTitle = this.querySelector(
        '.fixed-add-to-cart__container .current-variant__title'
      )

      let doesProductHaveColor =
        [...this.querySelectorAll('.swatch-element.color')].length > 0

      if (variant) {
        fixedVariantTitle.innerText = variant.title

        if (doesProductHaveColor) {
          let currentVariantShade = this.querySelector(
            '.fixed-add-to-cart__container .swatch-color-span'
          )
          let newVariantColorEl = this.querySelector(
            'span[data-tooltip="' + variant.title + '"] button'
          )

          if (newVariantColorEl) {
            currentVariantShade.style.backgroundColor =
              newVariantColorEl.style.backgroundColor
          }
        }
      }
    }
  }

  initOptionSelector() {
    if (this.variantType === 'none' || !this.variantType) {
      return
    }

    this.optionsSelector = new Shopify.OptionSelectors(this.variantType, {
      product: this.product,
      onVariantSelected: this.selectCallback,
      enableHistoryState: this.withHistoryState,
    })

    let selector = this.querySelector('.single-option-selector')
    let options = [...selector.querySelectorAll('option')]

    let liquidVariants = this.querySelector('.hidden-variants')
    let liquidOptions = [...liquidVariants.querySelectorAll('option')]

    let rawVariants = this.product.variants

    let uniqueSelector = options.map((option, index) => {
      let newObject = {
        value: rawVariants[index].id,
        name: liquidOptions[index].innerText,
        optionGenName: option.value,
      }

      return newObject
    })

    this.variantMap = uniqueSelector
  }

  updateAtcPrice() {
    document.querySelectorAll('.atc-price').forEach((el) => {
      el.textContent = this.atcPrice
    })
  }

  disconnectedCallback() {
    this.atcPriceObserver.disconnect()
    this.subscriptionObserser.disconnect()
  }

  connectedCallback() {
    this.initOptionSelector()
    this.triggerEvent('main-product::ready')
    this._isReadyPromise.resolve()
  }

  get isReadyPromise() {
    return this._isReadyPromise.promise
  }
}

window.customElements.define('main-product', MainProduct)

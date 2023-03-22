class SimpleSlider extends HHBaseElement {
  variant = 'single'
  activeIndex = 0

  constructor() {
    super()
    this.scrolledToStart = false
    this.scrolledToEnd = false
    this.classList[!this.isScrollable ? 'add' : 'remove']('not-scrollable')
    this.isScrollable = false
    this.variant = this.getAttribute('variant') || 'single'
    this.firstSlide = this.getAttribute('data-first-slide') || '1'
    this.$nextBtn = this.querySelector('[data-slider-next]')
    this.$backBtn = this.querySelector('[data-slider-back]')
    this.$status = this.querySelector('[data-slider-status]')
    this.$itemsContainer = this.querySelector('[data-slider-items]')

    this.cloneSetCounter = 1

    this._addClones = this._addClones.bind(this)
    this._handleNext = this._handleNext.bind(this)
    this._handleBack = this._handleBack.bind(this)
    this._addToIntersectionObservers =
      this._addToIntersectionObservers.bind(this)
    this._mutationWatcher = this._mutationWatcher.bind(this)
    this._handleContainerScroll = this._handleContainerScroll.bind(this)
    this._handleIntersection = this._handleIntersection.bind(this)
    this._handleADAIntersection = this._handleADAIntersection.bind(this)
    this._initCloneSet = this._initCloneSet.bind(this)
    this.classList.add(`simple-slider--${this.variant}`)

    this._setupADA()
    if (this.infinite) {
      this.classList.add(`simple-slider--infinite`)
    }
  }

  connectedCallback() {
    if (this.$items.length >= 1) {
      this._attachListeners()
      this._applyState()
      this._handleContainerScroll()
      this._initCloneSet()

      if (this.infinite) {
        // Adding Placeholder Clones
        this._addClones()
        this._addClones(false)
      }
    }

    if (this.firstSlide != '1') {
      this.scrollCarousel(this.scrollDistance * parseFloat(this.firstSlide - 1))
    }
  }

  disconnectedCallback() {
    if (this.$items.length > 1) {
      this._removeListeners()
    }
  }

  renderWithBaseZero(amount) {
    return amount < 10 ? `0${amount}` : amount
  }

  get $items() {
    return Array.from(this.querySelectorAll('[data-slider-item]')).filter(
      (item) => !item.classList.contains('hidden')
    )
  }

  set $items(val) {
    return val
  }

  get _status() {
    let currentSlide = this.renderWithBaseZero(this.activeIndex + 1)

    const finalSlide = this.renderWithBaseZero(
      this.$items.filter((item) => !item.classList.contains('is-clone')).length
    )

    return `${currentSlide} / ${finalSlide}`
  }

  get autoplayEnabled() {
    return this.getAttribute('autorotate') === 'true'
  }

  get autoplayInterval() {
    return parseFloat(this.getAttribute('autorotate-interval')) * 1000
  }

  get loops() {
    return this.$items.length > 1 ? !!this.getAttribute('loop') : false
  }

  get infinite() {
    return this.loops && !this.$status
  }

  get scrollDistance() {
    return this.$items[0].clientWidth
  }

  get carouselInnerPadding() {
    const padding = parseInt(
      getComputedStyle(this.$itemsContainer).getPropertyValue(
        '--simple-carousel-padding'
      )
    )

    return (isNaN(padding) ? 0 : padding) + this.infinite
      ? this.scrollDistance
      : 0
  }

  _setupADA() {
    // Perhaps in the future this could be replaced with role=listbox - more research is required
    if (
      !this.$itemsContainer.classList.contains('product-gallery__mobile-slider')
    ) {
      this.$itemsContainer.setAttribute('role', 'region')
    }

    this.$itemsContainer.setAttribute(
      'aria-label',
      this.getAttribute('aria-label') + window.localeStrings.itemmsContainer ||
        window.localeStrings.carousel
    )
  }

  _initCloneSet() {
    this.$items.forEach((item) => {
      item.classList.add(`clone-set-${this.cloneSetCounter}`)
    })
  }

  _handleButtonEvent(event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  _handleNext(event) {
    this._handleButtonEvent(event)

    if (this.scrolledToEnd) {
      if (this.infinite) {
        this._addClones(false)
      } else if (this.loops) {
        return this.scrollTo(0)
      } else {
        return
      }
    }

    this.scrollCarousel(this.scrollDistance)

    if (this.infinite) {
      clearTimeout(this.removeNextClonesTimer)
      this.removeNextClonesTimer = setTimeout(() => {
        this.removeClonesNotInView()
      }, 1000)
    }
  }

  _handleBack(event) {
    this._handleButtonEvent(event)

    if (this.scrolledToStart) {
      if (this.infinite) {
        const currentElement = this.$items[0]
        this._addClones(true)
        this.scrollJumpTo(currentElement.offsetLeft)
      } else if (this.loops) {
        return this.scrollTo(
          this.$itemsContainer.scrollWidth - this.$itemsContainer.clientWidth
        )
      } else {
        return
      }
    }

    this.scrollCarousel(-1 * this.scrollDistance)

    if (this.infinite) {
      clearTimeout(this.removePrevClonesTimer)
      this.removePrevClonesTimer = setTimeout(() => {
        this.removeClonesNotInView(true)
      }, 1000)
    }
  }

  _mutationWatcher() {
    this.$items = Array.from(
      this.querySelectorAll('[data-slider-item]')
    ).filter((item) => !item.classList.contains('hidden'))
    this._handleContainerScroll()
  }

  _handleContainerScroll() {
    const { scrollLeft, scrollWidth, clientWidth } = this.$itemsContainer
    this.scrolledToStart = scrollLeft <= this.carouselInnerPadding
    const scrollEndRatio =
      (scrollLeft + this.carouselInnerPadding) / (scrollWidth - clientWidth)
    this.scrolledToEnd = scrollEndRatio > 0.98
    this.isScrollable = scrollWidth > clientWidth
    this._applyState()
  }

  _addClones(prepend = false) {
    const clones = this.$items.map((item) => item.cloneNode(true))
    clones.forEach((item) => {
      item.classList.add('is-clone')
      item.classList.remove(`clone-set-${this.cloneSetCounter}`)
      item.classList.add(
        `clone-set-${
          prepend ? this.cloneSetCounter - 1 : this.cloneSetCounter + 1
        }`
      )
      this._addToIntersectionObservers(item)
    })

    if (prepend) {
      this.$itemsContainer.prepend(...clones)
    } else {
      this.$itemsContainer.append(...clones)
    }

    this.cloneSetCounter = this.cloneSetCounter + 1
  }

  _isVisible(elem, removePrevious = false) {
    const scrollLeft = this.$itemsContainer.scrollLeft
    const clientWidth = this.$itemsContainer.clientWidth
    const elementLeft = elem.offsetLeft
    if (removePrevious) {
      const offset = elementLeft - scrollLeft
      const isOutOfView = offset > clientWidth * 2

      return !isOutOfView
    }

    const offset = scrollLeft - elementLeft
    const isOutOfView = offset > clientWidth * 2
    return !isOutOfView
  }

  removeClonesNotInView(removePrevious = false) {
    Array.from(this.querySelectorAll('.is-clone'))
      .filter((item) => !this._isVisible(item, removePrevious))
      .forEach((item) => {
        item.remove()
      })
  }

  _setUpResizeObserver() {
    if ('ResizeObserver' in window) {
      // Update scrollflags when a child's size changes (e.g., a custom element becomes
      // defined or an image is loaded)
      this.resizeObserver = new ResizeObserver(() =>
        this._handleContainerScroll()
      )
      Array.from(this.children).forEach((element) => {
        this.resizeObserver.observe(element)
      })
    }
  }

  _addToIntersectionObservers(item) {
    this.activeItemObserver.observe(item)
    this.adaVisiblityObserver.observe(item)
  }

  _setItemADAVisible(item) {
    item.removeAttribute('aria-hidden')
    item.removeAttribute('tabindex')
    item.style.visibility = ''
  }

  _setItemADAHidden(item) {
    item.setAttribute('aria-hidden', 'true')
    item.setAttribute('tabindex', '-1')
    item.style.visibility = 'hidden'
  }

  _handleADAIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this._setItemADAVisible(entry.target)
      } else {
        this._setItemADAHidden(entry.target)
      }
    })
  }

  _handleIntersection(entries) {
    let gotActiveIndex = false
    entries.forEach((entry) => {
      if (entry.isIntersecting && !gotActiveIndex) {
        const activeIndex = this.$items.indexOf(entry.target)
        if (activeIndex !== this.activeIndex) {
          this.activeIndex = activeIndex
          this._applyState()
        }
        gotActiveIndex = true
      }
    })
  }

  _attachListeners() {
    this.$nextBtn.addEventListener('click', this._handleNext)
    this.$backBtn.addEventListener('click', this._handleBack)
    this.optionsObserver = new MutationObserver(this._mutationWatcher)
    this.optionsObserver.observe(this.$itemsContainer, {
      childList: true,
    })
    this._setUpResizeObserver()

    this.$itemsContainer.addEventListener('scroll', this._handleContainerScroll)
    this.activeItemObserver = new IntersectionObserver(
      this._handleIntersection,
      { root: this.$itemsContainer, threshold: 0.51 }
    )

    this.adaVisiblityObserver = new IntersectionObserver(
      this._handleADAIntersection,
      { root: this.$itemsContainer, threshold: 0.01 }
    )
    this.$items.forEach((item) => this._addToIntersectionObservers(item))

    if (this.autoplayEnabled) {
      this.setAutoplayTimer()
      this.addEventListener('mouseover', this.clearAutoplayTimer)
      this.addEventListener('mouseout', this.setAutoplayTimer)
    }

    this.addEventListener('swiped-left', this._handleNext, false)
    this.addEventListener('swiped-right', this._handleBack, false)
  }

  _removeListeners() {
    this.$nextBtn.removeEventListener('click', this._handleNext)
    this.$backBtn.removeEventListener('click', this._handleBack)
    this.$itemsContainer.removeEventListener('scroll', this._applyIndexState)
    this.$itemsContainer.removeEventListener(
      'scroll',
      this._handleContainerScroll
    )

    if (this.optionsObserver) this.optionsObserver.disconnect()
    if (this.activeItemObserver) this.activeItemObserver.disconnect()
    if (this.adaVisiblityObserver) this.adaVisiblityObserver.disconnect()
    if (this.resizeObserver) this.resizeObserver.disconnect()

    if (this.autoplayEnabled) {
      this.removeEventListener('mouseenter', this.clearAutoplayTimer)
      this.removeEventListener('mouseout', this.setAutoplayTimer)
    }

    this.removeEventListener('swiped-left', this._handleNext, false)
    this.removeEventListener('swiped-right', this._handleBack, false)
  }

  _applyState() {
    // check slide status
    let atEndOfSlides = false

    if (this._status && !this.infinite) {
      let numbers = this._status.split('/')
      if (parseFloat(numbers[0]) === parseFloat(numbers[1])) {
        atEndOfSlides = true
      }
    }

    this.classList[this.scrolledToStart ? 'add' : 'remove']('first-slide')
    this.classList[this.scrolledToEnd || atEndOfSlides ? 'add' : 'remove'](
      'last-slide'
    )
    this.classList[!this.isScrollable ? 'add' : 'remove']('not-scrollable')
    if (this.$status) {
      this.$status.innerText = this._status
    }
  }

  clearAutoplayTimer() {
    try {
      clearInterval(this.slideshowTimer)
      this.slideshowTimer = null
    } catch (e) {
      console.log(e)
    }
  }

  setAutoplayTimer() {
    try {
      let interval = this.autoplayInterval
      this.slideshowTimer = setInterval(() => {
        this._handleNext()
      }, interval)
    } catch (error) {
      console.error(error)
    }
  }

  scrollCarousel(num) {
    this.$itemsContainer.scrollLeft += num
  }

  scrollTo(num) {
    this.$itemsContainer.scrollLeft = num
  }

  scrollJumpTo(x) {
    this.$itemsContainer.style.scrollBehavior = 'unset'
    this.$itemsContainer.scrollTo(x, 0)
    this.$itemsContainer.style.scrollBehavior = ''
  }

  static get observedAttributes() {
    return ['variant']
  }

  _clearClones() {
    let clones = [...document.querySelectorAll('.is-clone')]
    clones.forEach((clone) => clone.remove())
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Product Gallery hides/shows respective variants

    if (name === 'variant') {
      // clear clones

      this._clearClones()
      this.$items = Array.from(
        this.querySelectorAll('[data-slider-item]')
      ).filter((item) => !item.classList.contains('hidden'))

      this.scrollJumpTo(0)
    }
  }
}

window.customElements.define('simple-slider', SimpleSlider)

class KlevuInstantSearchPopup extends HHBaseElement {
  _open = false
  constructor() {
    super()
    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this._handleDocumentClick = this._handleDocumentClick.bind(this)
    this._handleDocumentKeydown = this._handleDocumentKeydown.bind(this)
    this._handleQueryChange = this._handleQueryChange.bind(this)
    this.closeBtn = this.querySelector('[data-instant-search-close]')
    this.$results = this.querySelector('.klevu-results')
    this.$input = this.querySelector('#ku-search-field')
    this.$submitBtns = Array.from(
      this.querySelectorAll('.klevu-instant-search__submit')
    )
    this._handleMutation = this._handleMutation.bind(this)
    this._setupFocusTrap()
  }

  get open() {
    return this._open
  }

  set open(value) {
    this._open = value
    this.classList.toggle('active', value)
    if (!this._open) {
      this._handleClose()
    } else {
      this._handleOpen()
    }

    if (this._open && this._firstFocusableElement) {
      setTimeout(() => {
        this._firstFocusableElement.focus()
      }, 100)
    }
  }

  reset() {
    klevu.search.quick.getScope().element.value = ''
  }

  connectedCallback() {
    this._attachListeners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  _attachListeners() {
    document.addEventListener('instant-search-popup::open', this.show)
    document.addEventListener('click', this._handleDocumentClick)
    document.addEventListener('keydown', this._handleDocumentKeydown)
    this.$input.addEventListener('keyup', this._handleQueryChange)
    this.$input.addEventListener('change', this._handleQueryChange)
    this.closeBtn.addEventListener('click', this.hide)
    this.observer = new MutationObserver(this._handleMutation)

    this.observer.observe(this.$results, {
      attributes: true,
      attributeFilter: ['style'],
    })
  }

  _handleQueryChange(event) {
    if (!!event.currentTarget.value) {
      this.$submitBtns.forEach((submitBtn) =>
        submitBtn.removeAttribute('disabled')
      )
    } else {
      this.$submitBtns.forEach((submitBtn) =>
        submitBtn.setAttribute('disabled', true)
      )
    }
  }

  _handleDocumentKeydown(event) {
    if (event.key === 'Escape' && this.open) {
      event.preventDefault()
      this.open = false
    }
  }

  scrollToElementTop(elem, offset) {
    offset = offset || 0

    const rect = elem.getBoundingClientRect()
    const padding = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--header-spacer'
      )
    )
    const targetPosition = rect.top + window.pageYOffset + offset - padding

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    })

    return new Promise((resolve) => {
      const scrollHandler = () => {
        if (window.pageYOffset === targetPosition) {
          window.removeEventListener('scroll', scrollHandler)
          resolve()
        }
      }
      window.addEventListener('scroll', scrollHandler)
    })
  }

  async _handleDocumentClick(event) {
    if (event.target.hasAttribute('data-instant-search-toggle')) {
      if (event.target.hasAttribute('data-search-results-page')) {
        await this.scrollToElementTop(
          document.querySelector('klevu-landing .klevu-landing__form')
        )
        document.querySelector('klevu-landing .kuSearchInput').focus()
      } else {
        this.open ? this.hide() : this.show()
      }
    }
  }

  _removeListeners() {
    document.removeEventListener('instant-search-popup::open', this.show)
    document.removeEventListener('click', this._handleDocumentClick)
    document.removeEventListener('click', this._handleDocumentClick)
    this.closeBtn.removeEventListener('click', this.hide)
    this.$input.removeEventListener('keyup', this._handleQueryChange)
    this.$input.removeEventListener('change', this._handleQueryChange)
  }

  _handleMutation() {
    this.$results.removeAttribute('style')
    this._setupFocusTrap()

    if (!!this.$input.value) {
      this.$submitBtns.forEach((submitBtn) =>
        submitBtn.removeAttribute('disabled')
      )
    }
  }

  show() {
    this.open = true
  }

  hide() {
    this.open = false
  }

  _handleOpen() {
    Array.from(
      document.querySelectorAll('[data-instant-search-toggle]')
    ).forEach((el) => el.classList.add('is-open'))
    this._freezeBody()
  }

  _handleClose() {
    setTimeout(() => {
      this.reset()
    }, 150)

    Array.from(
      document.querySelectorAll('[data-instant-search-toggle]')
    ).forEach((el) => el.classList.remove('is-open'))
    this._unfreezeBody()
  }
}

window.customElements.define(
  'klevu-instant-search-popup',
  KlevuInstantSearchPopup
)

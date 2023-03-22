class FloatingInput extends HHBaseElement {
  constructor() {
    super()
    this._handleFocus = this._handleFocus.bind(this)
    this._handleFocusOut = this._handleFocusOut.bind(this)
    this.$input = this.querySelector('input')
  }

  connectedCallback() {
    this.$input.addEventListener('focus', this._handleFocus)
    this.$input.addEventListener('focusout', this._handleFocusOut)
    this.$input.previousElementSibling.addEventListener(
      'click',
      this._handleFocus
    )
    if (!!this.$input.value) {
      this._activate()
    }

    // Refresh Input after Customer Fields have Loaded to make sure UI is updated
    document.addEventListener(
      'cf:customer_ready',
      () => {
        setTimeout(() => {
          if (!!this.$input.value) {
            this._activate()
          }
        }, 500)
      },
      { once: true }
    )
  }

  disconnectedCallback() {
    this.$input.removeEventListener('focus', this._handleFocus)
    this.$input.removeEventListener('focusout', this._handleFocusOut)
    this.$input.previousElementSibling.removeEventListener(
      'click',
      this._handleFocus
    )
  }

  _activate() {
    this.$input.previousElementSibling.classList.add('active')
    this.classList.add('active')
  }

  _deactivate() {
    if (this.$input.value === '') {
      this.$input.previousElementSibling.classList.remove('active')
      this.classList.remove('active')
    }
  }

  _handleFocus() {
    this._activate()
    this.$input.focus()
  }

  _handleFocusOut() {
    this._deactivate()
  }
}
window.customElements.define('floating-input', FloatingInput)

class SimpleAccordion extends HTMLElement {
  constructor() {
    super()
  }

  get open() {
    return this.getAttribute('open')
  }

  set open(val) {
    if (val) {
      this.setAttribute('open', val)
    } else {
      this.removeAttribute('open')
    }
  }

  _toggleAccordion() {
    const status = this.open == '' ? 'open' : 'closed'
    if (status === 'open') {
      this.$accordionBody.style.height = '0px'
      this.removeAttribute('open')
    } else {
      this.$accordionBody.style.height = this.$accordionBody.scrollHeight + 'px'
      this.setAttribute('open', '')
    }
  }

  static get observedAttributes() {
    return ['open']
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open' && this.$toggleButton) {
      if (newValue === null) {
        // close
        this.$toggleButton.setAttribute('aria-label', window.localeStrings.openAccordion)
        this.$accordionBody.setAttribute('aria-hidden', true)
        this.$accordionBody.setAttribute('tabindex', '-1')
      } else {
        // open
        this.$toggleButton.setAttribute('aria-label', window.localeStrings.closeAccordion)
        this.$accordionBody.removeAttribute('tabindex')
        this.$accordionBody.setAttribute('aria-hidden', false)
      }
    }
  }

  closeOnEscape(e) {
    const status = this.open == '' ? 'open' : 'closed'
    if (e.key === "Escape" && status === 'open') {
      this.$accordionBody.style.height = '0px'
      this.removeAttribute('open')
    }
  }

  connectedCallback() {
    // add event listeners on both buttons
    // we bind "this" to the callback of the listener to attach the component's scope.

    this.$toggleButton = this.querySelector('.accordion__title')
    this.$accordionBody = this.querySelector('.accordion__body')
    const status = this.open == '' ? 'open' : 'closed'

    if (status === 'open') {
      this.$accordionBody.style.height = this.$accordionBody.scrollHeight + 'px'
    } else {
      this.$accordionBody.style.height = '0px'
    }

    this.$toggleButton.addEventListener(
      'click',
      this._toggleAccordion.bind(this)
    )

    this.$toggleButton.addEventListener('keydown', (e) => this.closeOnEscape(e))
  }
  disconnectedCallback() {
    // add event listeners on both buttons
    // we bind "this" to the callback of the listener to attach the component's scope.
    this.$toggleButton.removeEventListener(
      'click',
      this._toggleAccordion.bind(this)
    )

    this.$toggleButton.removeEventListener('keydown', this.closeOnEscape)
  }
}

window.customElements.define('simple-accordion', SimpleAccordion)

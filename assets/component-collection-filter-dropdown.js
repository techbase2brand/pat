class CollectionFilterDropdown extends HHBaseElement {
  loading = false

  constructor() {
    super()
    this.$toggle = this.querySelector('[data-toggle]')
    this._handleToggle = this._handleToggle.bind(this)
    this.close = this.close.bind(this)
    this._handleDocumentClick = this._handleDocumentClick.bind(this)
  }

  connectedCallback() {
    this._attachListeners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  static get observedAttributes() {
    return ['open']
  }

  attributeChangedCallback(name) {
    if (name === 'open') {
      this._appleState()
    }
  }

  get isAccordionMode() {
    return this.hasAttribute('accordion')
  }

  get isOpen() {
    return this.hasAttribute('open')
  }

  _attachListeners() {
    this.$toggle.addEventListener('click', this._handleToggle)
    if (!this.isAccordionMode) {
      this.addEventListener('change', this.close)
      document.addEventListener('click', this._handleDocumentClick)
    }
  }

  _removeListeners() {
    this.removeEventListener('change', this.close)
    this.$toggle.removeEventListener('click', this._handleToggle)
    document.removeEventListener('click', this._handleDocumentClick)
  }

  close() {
    this.removeAttribute('open')
  }

  open() {
    this.setAttribute('open', 'true')
  }

  _handleToggle() {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  _handleDocumentClick(event) {
    if (this.isOpen && !this.contains(event.target)) {
      this.close()
    }
  }

  _appleState() {
    this.classList.toggle('open', this.isOpen)
  }
}

window.customElements.define(
  'collection-filter-dropdown',
  CollectionFilterDropdown
)

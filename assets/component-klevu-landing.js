class KlevuLanding extends HHBaseElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this._attachListeners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  _attachListeners() {}

  _removeListeners() {}
}

window.customElements.define('klevu-landing', KlevuLanding)

class QuantityInput extends HHBaseElement {
  constructor() {
    super()
    this.$mainCart = this.closest('main-cart')

    this.$input = this.querySelector('input')
    this.$minus = this.querySelector('.js-minus')
    this.$plus = this.querySelector('.js-plus')
    this._handleMinusClick = this._handleMinusClick.bind(this)
    this._handlePlusClick = this._handlePlusClick.bind(this)
    this._handleInputChange = this._handleInputChange.bind(this)
  }

  get max() {
    const max = this.$input.getAttribute('max')
    return !!max
      ? Math.max(Number(this.$input.getAttribute('max')), 0)
      : Infinity
  }

  get value() {
    return this.$input.value
  }

  set value(newVal) {
    const previousValue = this.value
    if (String(previousValue) !== String(newVal)) {
      this.triggerEvent('change', { value: newVal })
    }
  }

  static get observedAttributes() {
    return ['value']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'value') {
      if (this.$input) {
        this.$input.value = newValue
      }
    }
  }

  connectedCallback() {
    this._attachListeners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  _handleMinusClick() {
    this.$plus.removeAttribute("disabled");
    if (this.value <= 0) {
      this.value = 0
    } else {
      this.value = parseInt(this.value) - 1
    }
  }

  _handlePlusClick() {
    if (this.value >= this.max) {
      if (this.max > 0) {
        this.value = this.max
      }
    } else {
      this.value = parseInt(this.value) + 1
    }
    if (this.value == this.max - 1) {
      this.$plus.setAttribute("disabled", true);
    }
  }

  _handleInputChange() {
    let newValue = this.value;
    if (parseInt(this.value) > this.max) {
      this.value = this.max
      newValue = this.max;
    } else if (this.value < 0) {
      this.value = 0;
      newValue = 0;
    }
    this.triggerEvent('change', { value: newValue })
  }

  _attachListeners() {
    this.$minus.addEventListener('click', this._handleMinusClick)
    this.$plus.addEventListener('click', this._handlePlusClick)
    this.$input.addEventListener('change', this._handleInputChange)
  }

  _removeListeners() {
    this.$minus.removeEventListener('click', this._handleMinusClick)
    this.$plus.removeEventListener('click', this._handlePlusClick)
    this.$input.removeEventListener('change', this._handleInputChange)
  }
}

window.customElements.define('quantity-input', QuantityInput)

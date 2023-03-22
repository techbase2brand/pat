const template = `
  <style>
    .price-progress__wrapper {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .price-progress__label {
      text-transform: var(--price-progress-label-transform, uppercase);
      font: var(--price-progress-label-font, bold 12px 'Montserrat', sans-serif);
      letter-spacing: var(--price-progress-label-letter-spacing, 0.16em);
      text-align: var(--price-progress-label-align, left);
    }

    .price-progress__progress {
      padding: 3px;
      border-radius: 10px;
      background-color: var(--price-progress-bg-color, var(--color-light-tan));
    }

    .price-progress__progress span {
      display: block;
      border-radius: inherit;
      height: var(--price-progress-height, 4px);
      background: var(--price-progress-bg, var(--color-gradient-pewter));
      width: var(--progress-width);
      transition: 0.3s ease width;
    }
  </style>
  <div class="price-progress__wrapper">
    <span class="price-progress__label"></span>
    <span class="price-progress__progress">
      <span></span>
    </span>
  </div>
`
class PriceProgress extends HHBaseElement {
  constructor() {
    super(template)
    this.$label = this._shadowRoot.querySelector('.price-progress__label')
  }

  get labelPattern() {
    return this.getAttribute('label')
  }

  get completionLabel() {
    return this.getAttribute('complete-label')
  }

  get label() {
    if (Shopify.currency.active == 'GBP') {
      return this.labelPattern.replace(
        /###/i,
        Shopify.formatMoney(this.balance, '£{{amount}}')
      )
    } else {
      return this.labelPattern.replace(
        /###/i,
        Shopify.formatMoney(this.balance)
      )
    }
  }

  get balance() {
    return Math.abs(this.limit - this.value)
  }

  get value() {
    return Number(this.getAttribute('value'))
  }

  set value(value) {
    return this.setAttribute('value', value)
  }

  get limit() {
    return Number(this.getAttribute('limit'))
  }

  set limit(limit) {
    return this.setAttribute('limit', limit)
  }

  get progress() {
    return this.value / this.limit
  }

  static get observedAttributes() {
    return ['value', 'limit', 'label', 'complete-label']
  }

  attributeChangedCallback() {
    this.applyState()
  }

  connectedCallback() {
    this.applyState()
  }

  applyState() {
    this.style.setProperty(
      '--progress-width',
      `${Math.min(this.progress, 1) * 100}%`
    )
    if (this.progress >= 1) {
      if (this.completionLabel) {
        this.$label.innerHTML = this.completionLabel
        this.style.display = ''
      } else {
        this.style.display = 'none'
      }
    } else {
      this.$label.innerHTML = this.label
      this.style.display = ''
    }
  }
}
window.customElements.define('price-progress', PriceProgress)

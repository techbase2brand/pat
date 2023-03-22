// const variantDropdowntemplate = document.createElement('template')

const variantDropdownTemplateHTML = `
<div class="dropdown">
  <button type="button" class="dropdown-toggle no-styles">
    <label>
      <slot name="label"></slot>
    </label>
    <div class="selected-variant"></div>
    <select style="pointer-events:none"></select>
    <span class="icon">
      <slot name="icon"></slot>
    </span>
  </button>
  <div class="dropdown-content">
    <slot name="dropdown-list"></slot>
  </div>
</div>`

class VariantSwatchDropdown extends HHBaseElement {
  constructor() {
    super(variantDropdownTemplateHTML, 'closed')

    this.mainProduct = this.closest('main-product')
    this._toggleDropdown = this._toggleDropdown.bind(this)
    this._handleSelectChange = this._handleSelectChange.bind(this)
    this._handleSelectOption = this._handleSelectOption.bind(this)
    this._handleClickOutside = this._handleClickOutside.bind(this)

    this._dropDownList = this.querySelector('[slot="dropdown-list"]')
    this._toggleLabel = this._shadowRoot.querySelector('label')
    this._dropdownMenu = this._shadowRoot.querySelector('.dropdown-content')
    this._dropDownToggle = this._shadowRoot.querySelector('.dropdown-toggle')
    this._dropDownSelect = this._shadowRoot.querySelector('select')
    this._dropdownOptions =
      this._dropDownList.querySelectorAll('.dropdown-option')
    this.selectedVariant = this._shadowRoot.querySelector('.selected-variant')
    this.allColorSwatches = [
      ...this.mainProduct.querySelectorAll(
        '.color-variants .color-select-container button'
      ),
    ]
    this.allSizeButtons = [
      ...this.mainProduct.querySelectorAll(
        '.size-variants-container .size-select-container button'
      ),
    ]

    this.otherVariantDropdown = this.mainProduct.querySelector(
      '.general-variants-container'
    )
  }

  connectedCallback() {
    this._attachListeners()
    this._attachOptionsListners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  open() {
    this.setAttribute('open', true)
  }

  close() {
    this.removeAttribute('open', true)
  }

  get usesNativeSelect() {
    return this.isiOSOrAndroid || !this.mql.matches
  }

  get isOpen() {
    return this.getAttribute('open')
  }

  _checkFocus() {
    if (this.isOpen) {
      this._dropdownOptions.forEach((item) => {
        const input = item.querySelector('input')
        if (input === document.activeElement) {
          item.classList.add('selected')
        } else {
          item.classList.remove('selected')
        }
      })
    }
  }

  set variant(newValue) {
    // clear selected dropdown options
    this._clearSelectedDropdownInputs()

    // update variant
    let matchingNewVariants = [...this._dropdownOptions].filter(
      (option) => option.querySelector('input').dataset.variantId === newValue
    )

    this._dropdownOptions.forEach((item) => item.classList.remove('selected'))

    if (matchingNewVariants.length > 0) {
      let newVariantClone = matchingNewVariants[0].cloneNode(true)

      this.selectedVariant.innerHTML = ''
      this.selectedVariant.append(newVariantClone)

      matchingNewVariants.forEach((label) => {
        label.querySelector('input').checked = true
        label.classList.add('selected')
      })
      if (this.allColorSwatches.length > 0) {
        // update variant
        this.allColorSwatches
          .filter((button) => button.dataset.variantId === newValue)[0]
          .click()
      } else if (this.allSizeButtons.length > 0) {
        this.selectedVariant.innerHTML = ''
        this.selectedVariant.innerHTML = matchingNewVariants[0].dataset.label
        this.allSizeButtons
          .filter((button) => button.dataset.variantId === newValue)[0]
          .click()
      } else if (this.otherVariantDropdown) {
        this.selectedVariant.innerHTML = ''
        this.selectedVariant.innerHTML = matchingNewVariants[0].dataset.label

        this.close()
      }
    }
  }

  _clearSelectedDropdownInputs() {
    let allCheckedInputs = [
      ...this.mainProduct.querySelectorAll('.dropdown-menu input:checked'),
    ]
    allCheckedInputs.forEach((input) => (input.checked = false))
  }

  _setVariantId(id) {
    this.setAttribute('variant', id)
  }

  _toggleDropdown(event) {
    event.preventDefault()
    this.isOpen ? this.close() : this.open()
  }

  _handleSelectChange(event) {
    this.value = event.currentTarget.value
    this.close()
  }

  _attachListeners() {
    // this._removeListeners()
    this._dropDownToggle.addEventListener('click', this._toggleDropdown)
    document.addEventListener('focusin', (event) => this._checkFocus(event))
    // this._nativeSelect.addEventListener('change', this._handleSelectChange)
    window.addEventListener('click', this._handleClickOutside)
  }

  _removeListeners() {
    this._dropDownToggle.removeEventListener('click', this._toggleDropdown)
    document.removeEventListener('focusin', this._checkFocus)

    // this._nativeSelect.removeEventListener('change', this._handleSelectChange)
    window.removeEventListener('click', this._handleClickOutside)
  }

  _handleSelectOption(event) {
    const value = event.currentTarget.value
    const id = event.currentTarget.dataset.variantId
    this.value = value
    this.variant = id
  }

  _handleClickOutside(event) {
    if (!this.contains(event.target)) this.close()
  }

  _applyDropdownState(state) {
    if (state) {
      this._dropdownMenu.classList.add('show')
    } else {
      this._dropdownMenu.classList.remove('show')
    }
  }

  _attachOptionsListners() {
    for (const dropdownOption of this._dropdownOptions) {
      dropdownOption
        .querySelector('input')
        .addEventListener('change', this._handleSelectOption)
    }
  }

  static get observedAttributes() {
    return ['name', 'id', 'placeholder', 'open', 'variant']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'variant') {
      this.variant = newValue
    }

    if (name === 'open') {
      this._applyDropdownState(newValue === 'true')
    }
  }
}

window.customElements.define('variant-dropdown', VariantSwatchDropdown)

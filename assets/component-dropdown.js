const template = document.createElement('template')

const templateHTML = `
<div class="dropdown">
  <button type="button" class="dropdown-toggle no-styles" part="button">
    <label>
      <slot name="label"></slot>
    </label>
    <select part="select"></select>
    <span class="icon">
      <slot name="icon"></slot>
    </span>
  </button>
  <div class="dropdown-content">
    <slot name="dropdown-list"></slot>
  </div>
</div>
`

let dropdownCounter = 0

class SimpleDropdown extends HHBaseElement {
  constructor() {
    super(templateHTML, 'closed')
    this._toggleDropdown = this._toggleDropdown.bind(this)
    this._handleSelectChange = this._handleSelectChange.bind(this)
    this._handleSelectOption = this._handleSelectOption.bind(this)
    this._handleClickOutside = this._handleClickOutside.bind(this)
    this._clearSelectedDropdownOptions =
      this._clearSelectedDropdownOptions.bind(this)
    this._renderNativeSelectOptions = this._renderNativeSelectOptions.bind(this)
    this._pseudoInput = this.initPseudoInput()
    this._uid = `#dropdown-${dropdownCounter++}`
    this._nativeSelect = this._shadowRoot.querySelector('select')
    this._dropDownList = this.querySelector('[slot="dropdown-list"]')
    this._toggleLabel = this._shadowRoot.querySelector('label')
    this._dropdownMenu = this._shadowRoot.querySelector('.dropdown-content')
    this._dropDownToggle = this._shadowRoot.querySelector('.dropdown-toggle')
    this._dropdownOptions = []
    this.mql = window.matchMedia('(min-width: 768px)')
    this.mql_m = window.matchMedia('(min-width: 992px)')
    this._initNativeSelect()
    this._setLabelSelectIds()
  }

  set value(newValue) {
    if (this._nativeSelect.value != newValue) {
      this._nativeSelect.value = newValue
      this._nativeSelect.dispatchEvent(new Event('change'))
    }
    const dropdownElement = this._dropDownList.querySelector(
      `[value="${newValue}"]`
    )

    if (dropdownElement && !dropdownElement.checked) {
      dropdownElement.checked = true
    }

    this._pseudoInput.value = newValue

    this.setAttribute('value', newValue)

    return this._pseudoInput.value
  }

  get value() {
    return this._pseudoInput.value
  }

  initPseudoInput() {
    const input = document.createElement('input')
    input.hidden = true
    this.append(input)
    return input
  }

  connectedCallback() {
    this._attachListeners()
    this._viewportWatcher()
    this._setInitialValue()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  static get observedAttributes() {
    return ['name', 'id', 'placeholder', 'open']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'name') {
      this._nativeSelect.name = newValue
      this._pseudoInput.name = newValue
    }

    if (name === 'id') {
      this._setLabelSelectIds()
    }

    if (name === 'placeholder') {
      this._renderNativeSelectOptions()
    }

    if (name === 'open') {
      this._applyDropdownState(newValue === 'true')
    }
  }

  get isiOSOrAndroid() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  }

  _setInitialValue() {
    const value = this.getAttribute('value')
    this.value = value
  }

  _viewportWatcher() {
    this.mql.onchange = (e) => {
      this._detectSelectType()
    }
    this._detectSelectType()
  }

  _detectSelectType() {
    if (this.usesNativeSelect) {
      this._nativeSelect.classList.remove('virtual')
    } else {
      this._nativeSelect.classList.add('virtual')
    }
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

  _toggleDropdown(event) {
    event.preventDefault()
    if (window.innerWidth > 767) {
      this.isOpen ? this.close() : this.open()
    }
  }

  _handleSelectChange(event) {
    this.value = event.currentTarget.value

    const customEvent = new Event('nativeItemSelected')

    this.dispatchEvent(customEvent)

    let matchingOptions = [...this._dropdownOptions].filter(
      (option) => option.dataset.value === event.currentTarget.value
    )

    if (matchingOptions.length > 0) {
      matchingOptions[0].click()
    }

    this.close()
  }

  _clearSelectedDropdownOptions() {
    this._dropdownOptions.forEach((item) => item.classList.remove('selected'))
  }

  _handleSelectOption(event) {
    this._clearSelectedDropdownOptions()

    const value = event.currentTarget.value

    let matchingOption = [...this._dropdownOptions].filter(
      (option) => option.querySelector('input').value === value
    )?.[0]

    matchingOption.classList.add('selected')

    this.value = value
  }

  _handleClickOutside(event) {
    if (!this.contains(event.target)) this.close()
  }

  get placeholder() {
    return this.getAttribute('placeholder')
  }

  _attachListeners() {
    this._removeListeners()
    this._dropDownToggle.addEventListener('click', this._toggleDropdown)
    this._nativeSelect.addEventListener('change', this._handleSelectChange)
    window.addEventListener('click', this._handleClickOutside)
  }

  _removeListeners() {
    this._dropDownToggle.removeEventListener('click', this._toggleDropdown)
    this._nativeSelect.removeEventListener('change', this._handleSelectChange)
    window.removeEventListener('click', this._handleClickOutside)
  }

  _attachOptionsListners() {
    for (const dropdownOption of this._dropdownOptions) {
      dropdownOption
        .querySelector('input')
        .addEventListener('change', this._handleSelectOption)
    }
  }

  _removeOptionsListners() {
    for (const dropdownOption of this._dropdownOptions) {
      dropdownOption
        .querySelector('input')
        .removeEventListener('click', this._handleSelectOption)
    }
  }

  _renderNativeSelectOptions() {
    this._removeOptionsListners()
    this._dropdownOptions =
      this._dropDownList.querySelectorAll('.dropdown-option')
    this._nativeSelect.innerHTML = `

      ${Array.from(this._dropdownOptions)
        .map(
          (button) =>
            `<option value="${button.getAttribute(
              'data-value'
            )}">${button.getAttribute('data-label')}</option>`
        )
        .join('')}
    `

    this._attachOptionsListners()
    this._setInitialValue()
  }

  _initNativeSelect() {
    this.optionsObserver = new MutationObserver(this._renderNativeSelectOptions)
    this.optionsObserver.observe(this._dropDownList, {
      childList: true,
    })
    this._renderNativeSelectOptions()
  }

  _setLabelSelectIds() {
    this._nativeSelect.setAttribute('id', this.getAttribute('id') || this._uid)
    this._toggleLabel.setAttribute('for', this.getAttribute('id') || this._uid)
    this._pseudoInput.setAttribute('id', this.getAttribute('id') || this._uid)
  }

  _applyDropdownState(state) {
    if (state) {
      this._dropdownMenu.classList.add('show')
    } else {
      this._dropdownMenu.classList.remove('show')
    }
  }
}

window.customElements.define('simple-dropdown', SimpleDropdown)

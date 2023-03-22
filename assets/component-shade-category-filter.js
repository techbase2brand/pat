class ShadeCategoryFilter extends HHBaseElement {
  constructor() {
    super()

    this.dropdownContainer = this.querySelector('.shade-categories-dropdown')

    this.handleSwatchesFilter = this.handleSwatchesFilter.bind(this)
    this.revealAllSwatches = this.revealAllSwatches.bind(this)

    this.shadeDropdown = this.querySelector('simple-dropdown')
    this.selectedShadeDropdown = document.querySelector(
      '.selected-shade-dropdown variant-dropdown'
    )
    this.selectedShadeDropdownMenus =
      this.selectedShadeDropdown.querySelectorAll(
        '.dropdown-options .dropdown-menu'
      )

    this.selectedOption = 'all-shades'
    this._addDropdownObserver = this._addDropdownObserver.bind(this)
    this.handleSwatchCategorySelect = this.handleSwatchCategorySelect.bind(this)

    this.swatches = [...document.querySelectorAll('.swatch-element')]
    this.dropdownOptions = [...this.shadeDropdown.querySelectorAll('label')]
  }

  connectedCallback() {
    this._addDropdownObserver()

    this.shadeDropdown.addEventListener('change', this.handleSwatchesFilter)

    this.dropdownOptions.forEach((option) =>
      option.addEventListener('click', this.handleSwatchCategorySelect)
    )
  }

  disconnectedCallback() {
    this.dropdownOptions.forEach((option) =>
      option.removeEventListener('click', this.handleSwatchCategorySelect)
    )
  }

  revealAllSwatches() {
    this.selectedShadeDropdownMenus.forEach((menu) =>
      menu.classList.remove('hidden')
    )
  }
  revealAllDropdownMenus() {
    this.swatches.forEach((swatch) => swatch.classList.remove('hidden'))
  }

  _addDropdownObserver() {
    const config = { attributes: true, childList: true, subtree: true }

    const callback = (mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.attributeName == 'open') {
          if (mutation.target.getAttribute('open') === 'true') {
            this.dropdownContainer.classList.add('open')
          } else {
            this.dropdownContainer.classList.remove('open')
          }
        }
        if (mutation.attributeName == 'value') {
          this.handleSwatchesFilter()
        }
      }
    }

    const observer = new MutationObserver(callback)

    observer.observe(this.shadeDropdown, config)
  }

  handleSwatchesFilter(e) {
    this.selectedOption = this.shadeDropdown.value || e?.target?.value

    // if all, remove hidden from all
    if (this.selectedOption === 'all-shades') {
      this.revealAllSwatches()
      this.revealAllDropdownMenus()
    } else {
      // filter swatches
      this.swatches.forEach((swatch) => {
        if (!swatch.classList.contains(this.selectedOption)) {
          swatch.classList.add('hidden')
        } else {
          swatch.classList.remove('hidden')
        }
      })

      // filter dropdown options
      this.selectedShadeDropdownMenus.forEach((menu) => {
        if (!menu.classList.contains(this.selectedOption)) {
          menu.classList.add('hidden')
        } else {
          menu.classList.remove('hidden')
        }
      })
    }
  }
  handleSwatchCategorySelect(e) {
    if (e.target.value) {
      let firstSwatchMatches = this.swatches.filter((swatch) =>
        swatch.classList.contains(e.target.value)
      )

      let firstSwatch = firstSwatchMatches?.[0]

      if (firstSwatchMatches.length === 0) {
        firstSwatch = this.swatches[0]
      }

      firstSwatch.querySelector('button').click()
    }
  }
}

window.customElements.define('shade-category-filter', ShadeCategoryFilter)

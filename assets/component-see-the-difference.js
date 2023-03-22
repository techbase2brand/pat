class SeeTheDifference extends HHBaseElement {
  constructor() {
    super()

    this.$itemsContainer = this.querySelector('[data-slider-items]')
    this.$staticImageContainer = this.querySelector('.see-the-difference__image_static')
    this.$beforeImageContainer = this.querySelector('.see-the-difference__image_before')
    this.$afterImageContainer = this.querySelector('.see-the-difference__image_after')
    this.$imageCompare = this.querySelector('.image-compare')
    this.$arrowContainer = this.querySelector(
      '.see-the-difference__matches-slider-controls'
    )
    this.$slideItems = this.querySelectorAll(
      '.see-the-difference__matches-item'
    )
    this.$shadeItems = this.querySelectorAll('simple-dropdown .dropdown-option')
    this._checkHasArrows = this._checkHasArrows.bind(this)

    setTimeout(() => {
      this._checkHasArrows()
    }, 250)
  }

  connectedCallback() {
    this._attachListeners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  _handleSelectShade(shadeItem) {
    const value = shadeItem.dataset.value
    this.$slideItems.forEach((item) => {
      item.classList.remove('active')
      if (!item.classList.contains('hidden')) {
        item.classList.add('hidden')
      }
    })

    let skinTones = []
    let activeItem = null
    this.$slideItems.forEach((slideItem) => {
      if (value === 'all') {
        slideItem.classList.remove('hidden')
        if (!activeItem) {
          slideItem.classList.add('active')
          activeItem = slideItem
        }
      } else {
        skinTones = JSON.parse(slideItem.dataset.skinTone)
        skinTones.forEach((item) => {
          if (item.toLowerCase() === value) {
            slideItem.classList.remove('hidden')
            if (!activeItem) {
              slideItem.classList.add('active')
              activeItem = slideItem
            }
          }
        })
      }
    })

    this.$itemsContainer.scrollLeft = 0
    this._handleSelectItem(activeItem)
    this._checkHasArrows()
  }

  _checkHasArrows() {
    if (this.$itemsContainer.scrollWidth > this.$itemsContainer.offsetWidth) {
      this.$arrowContainer.classList.remove('hidden')
    } else {
      if (!this.$arrowContainer.classList.contains('hidden'))
        this.$arrowContainer.classList.add('hidden')
    }
  }

  _handleSelectItem(slideItem) {
    const activeItems = [...this.$slideItems].filter(
      (item) => !item.classList.contains('hidden')
    )
    activeItems.forEach((item) => {
      item.classList.remove('active')
      if (item === slideItem) {
        item.classList.add('active')
      }
    })
    this.changeBeforeAfterImages(slideItem)
  }

  changeBeforeAfterImages(item) {
    this.$imageCompare.innerHTML = 
    `<img slot="image-1" class="see-the-difference__image_before" alt="${item.dataset.title}, before image comparison slider" src="${item.dataset.beforeImage}"/>
    <img slot="image-2" class="see-the-difference__image_after" alt="${item.dataset.title}, after image comparison slider" src="${item.dataset.afterImage}"/>`
  }

  _attachListeners() {
    this.$slideItems.forEach((item) => {
      item.addEventListener('click', (event) => {
        if (item.classList.contains('active')) {
          return true
        }
        this._handleSelectItem(item)
      })
    })
    this.$shadeItems.forEach((item) => {
      item.addEventListener('click', (event) => {
        this._handleSelectShade(item)
      })
    })
  }

  _removeListeners() {
    this.$slideItems.forEach((item) => {
      item.removeEventListener('click', (event) => {
        if (slideItem.classList.contains('active')) {
          return true
        }
        this._handleSelectItem(item)
      })
    })
    this.$shadeItems.forEach((item) => {
      item.removeEventListener('click', (event) => {
        this._handleSelectShade(item)
      })
    })
  }
}

window.customElements.define('see-the-difference', SeeTheDifference)

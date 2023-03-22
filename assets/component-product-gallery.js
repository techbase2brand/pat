import {
  generateImageMarkup,
  generateVideoMarkup,
  generateExternalVideoMarkup,
  generateProductModelMarkup,
  isMobile,
} from './helper-functions.js'

class ProductGallery extends HTMLElement {
  constructor() {
    super()

    this.scrollTimer = null
    this.mainProduct = this.closest('main-product')
    // desktop - vars
    this.thumbnailContainer = this.querySelector('.js-thumbnail-container')
    this.thumbnailButtons = [...this.querySelectorAll('.js-thumbnail-button')]
    this.thumbnailListItems = [...this.querySelectorAll('.js-thumbnail')]
    this.scrollUpButton = this.querySelector('.js-scroll-up')
    this.scrollDownButton = this.querySelector('.js-scroll-down')
    this.activeMedia = this.querySelector('.js-active-media')
    this.isQuickview = this.dataset.isQuickview === 'true'

    this.galleryModal = this.querySelector('.js-gallery-modal')
    this.closeZoomButtons = [...this.querySelectorAll('.js-close-zoom')]
    this.galleryModalImages = this.querySelector('.js-gallery-modal-images')
    this.galleryModalThumbs = this.querySelector('.js-gallery-modal-thumbs')

    this.galleryModalMobile = this.querySelector('.js-gallery-modal-mobile')
    this.closeZoomMobileButtons = [
      ...this.querySelectorAll('.js-close-zoom-mobile'),
    ]

    this._initOptionSelector = this._initOptionSelector.bind(this)
    this.galleryModalImagesMobile = this.querySelector(
      '.js-gallery-modal-images-mobile'
    )
    this.galleryModalThumbsMobile = this.querySelector(
      '.js-gallery-modal-thumbs-mobile'
    )

    this.scrollPositions = []
    this.doesPDPHaveStickyGallery =
      [...document.querySelectorAll('.product-gallery--sticky')].length > 0

    this.thumbnailIndex = -1

    this.visibleThumbnails = this.thumbnailListItems.filter(
      (item) => !item.classList.contains('hidden')
    )

    this.variantType = this.getAttribute('galleryType')?.trim()

    // mobile - vars
    this.mobileSlidesContainer = this.querySelector(
      '.product-gallery__mobile-slider'
    )

    this.mobileSlider = this.querySelector('simple-slider')

    this.mobileSlides = [...this.querySelectorAll('.js-mobile-slide')]
    this.visibleMobileSlides = this.mobileSlides.filter(
      (item) => !item.classList.contains('hidden')
    )

    this.mobileSlideOffset = 2

    this.closeZoomModal = this.closeZoomModal.bind(this)

    this.scrollLeftButton = this.querySelector('.js-scroll-left')
    this.scrollRightButton = this.querySelector('.js-scroll-right')

    this.xDown = null
    this.yDown = null

    this.galleryAdditionalContent =
      this.querySelector('.js-gallery-additional')?.innerHTML || ''

    // mobile bindings not required, simple slider controls nav

    // desktop - bindings
    this.thumbnailButtons.forEach((button) => {
      button.addEventListener('click', this.handleThumbnailClick.bind(this))
    }, false)

    if (this.scrollUpButton) {
      this.scrollUpButton.addEventListener(
        'click',
        this.handleScrollUpClick.bind(this)
      )
      this.scrollDownButton.addEventListener(
        'click',
        this.handleScrollDownClick.bind(this)
      )
    }

    if (this.thumbnailContainer) {
      this.activeMedia.addEventListener(
        'click',
        this.handleActiveMediaClick.bind(this)
      )

      this.activeMedia.addEventListener(
        'keydown',
        this.handleActiveMediaClick.bind(this)
      )

      this.closeZoomButtons.forEach((button) =>
        button.addEventListener(
          'click',
          this.handleCloseZoomButtonClick.bind(this)
        )
      )
    }

    this.closeZoomMobileButtons.forEach((button) =>
      button.addEventListener(
        'click',
        this.handleCloseZoomButtonClick.bind(this)
      )
    )

    this.mobileSlides.forEach((button) =>
      button.addEventListener('click', this.handleActiveMediaClick.bind(this))
    )
  }

  async connectedCallback() {
    await this.mainProduct.isReadyPromise
    this.setAspectRatio()
    this.selectVisibleThumbs()
    this.selectVisibleMobileSlide()

    if (this.thumbnailListItems.length > 3) {
      this.initMobileSlideIndex()
    }

    if (this.variantType === 'none') {
      this.handleInitialSliderSizing()
      this.initThumbnailClones()
    }
  }

  get productId() {
    return this.getAttribute('product-id')
  }

  get product() {
    return JSON.parse(
      window.atob(
        document.querySelector(`#main-product-data-${this.productId}`).innerText
      )
    )
  }

  getTouches(evt) {
    return (
      evt.touches || // browser API
      evt.originalEvent.touches
    ) // jQuery
  }

  handleTouchStart(evt) {
    const firstTouch = this.getTouches(evt)[0]
    this.xDown = firstTouch.clientX
    this.yDown = firstTouch.clientY
  }

  handleTouchMove(evt) {
    if (!this.xDown || !this.yDown) {
      return
    }

    var xUp = evt.touches[0].clientX
    var yUp = evt.touches[0].clientY

    var xDiff = this.xDown - xUp
    var yDiff = this.yDown - yUp

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      /*most significant*/
      if (xDiff > 0) {
        /* right swipe */

        this.handleScrollRightClick()
      } else {
        /* left swipe */
        this.handleScrollLeftClick()
      }
    }
    /* reset values */
    this.xDown = null
    this.yDown = null
  }

  setAspectRatio() {
    const minAspectRatio = Math.min(
      ...this.thumbnailButtons.map((button) => button.dataset?.aspectRatio)
    )
  }

  cloneMobileSlides(amount, visibleSlidesWithNoClones) {
    if (amount > 1) {
      let firstTwoSlides = visibleSlidesWithNoClones.slice(0, 2)
      let lastTwoSlides = visibleSlidesWithNoClones.slice(amount - 2, amount)

      lastTwoSlides.forEach((slide, index) => {
        let clonedSlide = slide.cloneNode(true)

        clonedSlide.classList.add('mobile-cloned-slide')

        if (index === 0) {
          clonedSlide.classList.add('first-mobile-cloned-slide')
        }

        this.mobileSlidesContainer.insertBefore(
          clonedSlide,
          visibleSlidesWithNoClones[0]
        )
      })

      firstTwoSlides.forEach((slide, index) => {
        let clonedSlide = slide.cloneNode(true)

        clonedSlide.classList.add('mobile-cloned-slide')

        if (index === firstTwoSlides.length - 1) {
          clonedSlide.classList.add('last-mobile-cloned-slide')
        }

        this.mobileSlidesContainer.appendChild(clonedSlide)
      })

      this.mobileSlides = [...this.querySelectorAll('.js-mobile-slide')]

      let visibleMobileSlides = this.mobileSlides.filter(
        (item) => !item.classList.contains('hidden')
      )

      if (visibleMobileSlides[this.mobileSlideOffset].offsetLeft !== 0) {
        this.mobileSlidesContainer.dataset.scrollIndex = this.mobileSlideOffset
        let mobileSlideContainer = this.mobileSlidesContainer
        setTimeout(() => {
          mobileSlideContainer.scrollTo({
            left: visibleMobileSlides[2].offsetLeft,
            top: 0,
            behavior: 'instant',
          })
        }, 250)
      }
    }
  }

  cloneThumbnails(amount) {
    // If thumbs < 3, there is no slider :/
    if (amount > 3) {
      this._revealArrows()

      // 1. Remove cloned slides
      let clonedSlides = [...this.querySelectorAll('.cloned-slide')]
      clonedSlides.forEach((slide) => slide.remove())

      // 2. Create new ones

      let firstSetOfSlides = this.thumbnailListItems
        .filter(
          (item) =>
            !item.classList.contains('hidden') &&
            !item.classList.contains('cloned-slide')
        )
        .slice(0, 5)

      let lastSetOfSlidesIndex = this.thumbnailListItems.filter(
        (item) =>
          !item.classList.contains('hidden') &&
          !item.classList.contains('cloned-slide')
      ).length

      let lastSetOfSlides = this.thumbnailListItems
        .filter(
          (item) =>
            !item.classList.contains('hidden') &&
            !item.classList.contains('cloned-slide')
        )
        .slice(
          lastSetOfSlidesIndex - lastSetOfSlidesIndex.length,
          lastSetOfSlidesIndex
        )

      let thumbnailContainer = this.thumbnailContainer

      lastSetOfSlides.forEach((item, index) => {
        let clonedSlide = item.cloneNode(true)

        if (index === 0) {
          clonedSlide.classList.add('last-clone')
        }
        clonedSlide.classList.add('cloned-slide')

        thumbnailContainer.insertBefore(clonedSlide, firstSetOfSlides[0])
      })

      firstSetOfSlides.forEach((item, index) => {
        let clonedSlide = item.cloneNode(true)

        if (index === 0) {
          clonedSlide.classList.add('first-clone')
        }

        clonedSlide.classList.add('cloned-slide')
        clonedSlide.classList.remove('active')

        thumbnailContainer.appendChild(clonedSlide)
      })

      this.thumbnailListItems = [...this.querySelectorAll('.js-thumbnail')]
      this.thumbnailButtons = [...this.querySelectorAll('.js-thumbnail-button')]

      this.thumbnailButtons.forEach((button, index) => {
        button.setAttribute('data-thumbnail-index', index)
        button.addEventListener('click', this.handleThumbnailClick.bind(this))
      }, false)
    } else {
      this.thumbnailButtons = [...this.querySelectorAll('.js-thumbnail-button')]

      this.thumbnailButtons.forEach((button, index) => {
        button.setAttribute('data-thumbnail-index', index)
      }, false)

      this._hideArrows()
    }
  }

  _hideArrows() {
    this.scrollDownButton?.classList.add('hidden')
    this.scrollUpButton?.classList.add('hidden')
  }
  _revealArrows() {
    this.scrollDownButton.classList.remove('hidden')
    this.scrollUpButton.classList.remove('hidden')
  }

  handleThumbnailClick(event) {
    this.updateSelection({ ...event.target.dataset })
  }

  handleInitialSliderSizing() {
    let visibleSlides = this.thumbnailListItems
      .filter(
        (item) =>
          !item.classList.contains('hidden') &&
          !item.classList.contains('cloned-slide')
      )
      .slice(0, 5)

    let sliderHeight = 0

    visibleSlides.map((thumb) => {
      let styles = getComputedStyle(thumb)

      let thumbMargin = parseFloat(styles['marginTop'])

      sliderHeight += thumb.offsetHeight + thumbMargin
    })

    if (this.thumbnailContainer) {
      this.thumbnailContainer.style.maxHeight = sliderHeight + 'px'
    }

    this.thumbnailContainer?.classList.remove('init-hidden')
  }

  selectThumb(element) {
    if (element) {
      element.querySelector('button').click()
    }
  }

  selectFirstThumb() {
    const currentIndex = parseInt(this.thumbnailContainer?.dataset.scrollIndex)
    let firstVisibleThumb = this.visibleThumbnails?.[currentIndex]

    setTimeout(function () {
      firstVisibleThumb.querySelector('button').click()
    }, 350)
  }

  clearVisibleThumbs() {
    this.thumbnailListItems.map((item) => {
      item.classList.remove('slide-visible')
      item.querySelector('button').setAttribute('tabindex', -1)
    })
  }

  clearVisibleSlides() {
    this.mobileSlides.map((item) => {
      item.querySelector('button').setAttribute('tabindex', -1)
      item.setAttribute('aria-hidden', true)
    })
  }

  selectVisibleMobileSlide() {
    let scrollIndex = parseFloat(this.mobileSlidesContainer.dataset.scrollIndex)
    this.clearVisibleSlides()
    if (this.mobileSlides[scrollIndex]) {
      this.mobileSlides[scrollIndex].setAttribute('aria-hidden', false)
      this.mobileSlides[scrollIndex]
        .querySelector('button')
        .setAttribute('tabindex', 0)
    }
  }

  // tracks which thumbnails are showing
  selectVisibleThumbs() {
    if (this.thumbnailContainer) {
      // 1. remove visible class from old thumbs
      this.clearVisibleThumbs()
      // 2. add visible class to five visible thumbs
      let scrollIndex = parseFloat(this.thumbnailContainer.dataset.scrollIndex)

      this.visibleThumbnails.map((item) =>
        item.setAttribute('aria-hidden', true)
      )

      this.visibleThumbnails.slice(scrollIndex, scrollIndex + 5).map((item) => {
        item.classList.add('slide-visible')
        item.setAttribute('aria-hidden', false)
        item.querySelector('button').setAttribute('tabindex', 0)
      })
    }
  }

  scrollByOneThumb(direction) {
    this.clearSlideTimer()
    const currentIndex = parseInt(this.thumbnailContainer.dataset.scrollIndex)
    const visibleThumbs = this.thumbnailListItems.filter(
      (item) => !item.classList.contains('hidden')
    )

    let nextThumb

    switch (direction) {
      case 'down':
        if (currentIndex >= visibleThumbs.length - 1) {
          return
        }

        this.thumbnailContainer.dataset.scrollIndex = currentIndex + 1
        nextThumb = visibleThumbs[currentIndex + 1]

        break
      case 'up':
        if (currentIndex - 1 < 0) {
          return
        }
        this.thumbnailContainer.dataset.scrollIndex = currentIndex - 1
        nextThumb = visibleThumbs[currentIndex - 1]
    }

    this.visibleThumbnails = this.thumbnailListItems.filter(
      (item) => !item.classList.contains('hidden')
    )

    const newTopPosition = nextThumb.offsetTop
    let thumbnailContainer = this.thumbnailContainer

    thumbnailContainer.scrollTo({
      top: newTopPosition,
      behavior: 'smooth',
    })

    // Reset slide index
    let visibleThumbnails = this.visibleThumbnails
    let thumbnailOffset = this.thumbnailOffset
    let selectThumb = this.selectThumb

    if (nextThumb.classList.contains('first-clone')) {
      thumbnailContainer.dataset.scrollIndex = this.thumbnailOffset
      try {
        this.scrollTimer = setTimeout(() => {
          thumbnailContainer.scrollTo({
            top: visibleThumbnails[thumbnailOffset].offsetTop,
            behavior: 'instant',
          })
        }, 350)
        selectThumb(visibleThumbnails[thumbnailOffset])
      } catch (error) {
        console.error(error)
      }
    } else if (nextThumb.classList.contains('last-clone')) {
      thumbnailContainer.dataset.scrollIndex = this.thumbnailOffset

      try {
        this.scrollTimer = setTimeout(() => {
          thumbnailContainer.scrollTo({
            top: visibleThumbnails[thumbnailOffset].offsetTop,
            behavior: 'instant',
          })
          selectThumb(visibleThumbnails[thumbnailOffset])
        }, 350)
      } catch (error) {
        console.error(error)
      }

      setTimeout(function () {
        thumbnailContainer.scrollTo({
          top: visibleThumbnails[thumbnailOffset].offsetTop,
          behavior: 'instant',
        })
      }, 350)
    } else {
      this.selectFirstThumb()
    }
  }

  clearSlideTimer() {
    try {
      clearTimeout(this.scrollTimer)
      this.scrollTimer = null
    } catch (error) {
      console.error(error)
    }
  }

  scrollByOneMobileSlide(direction) {
    let currentIndex = parseInt(this.mobileSlidesContainer.dataset.scrollIndex)

    const visibleSlides = this.mobileSlides.filter(
      (slide) => !slide.classList.contains('hidden')
    )

    let nextSlide

    switch (direction) {
      case 'right':
        if (currentIndex >= visibleSlides.length) {
          return
        }

        this.mobileSlidesContainer.dataset.scrollIndex = currentIndex + 1
        nextSlide = visibleSlides[currentIndex + 1]

        break
      case 'left':
        if (currentIndex <= 0) {
          return
        }

        this.mobileSlidesContainer.dataset.scrollIndex = currentIndex - 1
        nextSlide = visibleSlides[currentIndex - 1]
    }

    const newLeftPosition = nextSlide?.offsetLeft

    this.mobileSlidesContainer.scrollTo({
      left: newLeftPosition,
      top: 0,
      behavior: 'smooth',
    })

    let mobileOffset = this.mobileSlideOffset
    let mobileSlideContainer = this.mobileSlidesContainer

    if (nextSlide.classList.contains('first-mobile-cloned-slide')) {
      setTimeout(function () {
        mobileSlideContainer.dataset.scrollIndex =
          visibleSlides.length - 2 - mobileOffset
        mobileSlideContainer.scrollTo({
          left: visibleSlides[visibleSlides.length - mobileOffset * 2]
            .offsetLeft,
          behavior: 'instant',
        })
      }, 350)
    } else if (nextSlide.classList.contains('last-mobile-cloned-slide')) {
      setTimeout(function () {
        mobileSlideContainer.dataset.scrollIndex = mobileOffset + 1
        mobileSlideContainer.scrollTo({
          left: visibleSlides[mobileOffset + 1].offsetLeft,
          behavior: 'instant',
        })
      }, 350)
    }
  }

  // Starts on 2nd slide, first one is clone of last
  initMobileSlideIndex() {
    let slideContainer = this.mobileSlidesContainer

    const visibleMobileSlides = this.mobileSlides.filter(
      (slide) => !slide.classList.contains('hidden')
    )

    let mobileOffset = this.mobileSlideOffset

    if (visibleMobileSlides > 3) {
      setTimeout(function () {
        slideContainer.scrollTo({
          left: visibleMobileSlides[mobileOffset].offsetLeft,
          top: 0,
          behavior: 'instant',
        })
      })
    }
  }

  handleScrollRightClick() {
    this.scrollByOneMobileSlide('right')
    this.selectVisibleMobileSlide()
  }
  handleScrollLeftClick() {
    this.scrollByOneMobileSlide('left')
    this.selectVisibleMobileSlide()
  }

  handleScrollUpClick() {
    this.scrollByOneThumb('up')
    this.selectVisibleThumbs()
  }

  handleScrollDownClick() {
    this.scrollByOneThumb('down')
    this.selectVisibleThumbs()
  }

  handleActiveMediaClick(event) {
    // on enter key only
    if (event.type === 'keydown' && event.keyCode !== 13) {
      return
    }

    if (document.querySelector('.gift-card-gallery')) {
      return
    }

    if (event.target.nodeName === 'ADAPTIVE-IMAGE') {
      document.body.classList.add('frozen')
      if (this.active) {
        this.activeMedia.style.aspectRatio = null
      }

      if (!this.isQuickview) {
        isMobile()
          ? this.openZoomModalMobile(event.target.parentElement)
          : this.openZoomModal()
      }

      let toggleCloseZoom = this.handleCloseZoomButtonClick.bind(this)

      function handleEsc(e) {
        if (e.keyCode === 27) {
          toggleCloseZoom()
        }
      }

      document.addEventListener('keydown', handleEsc)
    }
  }

  handleCloseZoomButtonClick(event) {
    document.body.classList.remove('frozen')
    this.closeZoomModal()
    this.setAspectRatio()
  }

  initThumbnailClones() {
    let visibleSlidesWithNoClones = this.thumbnailListItems.filter(
      (item) =>
        !item.classList.contains('hidden') &&
        !item.classList.contains('cloned-slide')
    )

    this.thumbnailOffset = visibleSlidesWithNoClones.length

    if (this.thumbnailContainer) {
      this.thumbnailContainer.dataset.scrollIndex = this.thumbnailOffset
    }

    this.cloneThumbnails(visibleSlidesWithNoClones.length)

    this.visibleThumbnails = this.thumbnailListItems.filter(
      (item) => !item.classList.contains('hidden')
    )

    this.snapToFirstThumbnail()
  }

  updateSelection(data) {
    let thumbnailIndex = parseFloat(data.thumbnailIndex)
    let currentVariant = this.getAttribute('variant')

    let mappedValue = this?.variantMap?.filter(
      (variant) => variant.optionGenName === currentVariant
    )?.[0]?.name

    let isMediaVideo = data?.video ? true : false
    let aspectRatio = Number(data.aspectRatio) > 0.9 ? Math.round(Number(data.aspectRatio)) : Number(data.aspectRatio)

    if (aspectRatio < 1) {
      if (!this.activeMedia.classList.contains('has-tall'))
        this.activeMedia.classList.add('has-tall')
    } else {
      this.activeMedia.classList.remove('has-tall')
    }

    // for sizes
    let imageIndex = [...this.thumbnailButtons].findIndex((button) => {
      return data.previewImageUrl.includes(button.dataset.previewImageUrl)
    })

    if (thumbnailIndex === -1) {
      console.error('Could not find thumbnail')
      return
    }

    const media = isMediaVideo
      ? __GLOBAL__.product.media.filter(
          (item) => item?.media_type === 'external_video'
        )[0]
      : this.variantType === 'color'
      ? __GLOBAL__.product.media.filter(
          (item) =>
            item?.alt?.split('__')[0] === mappedValue ||
            item.alt === mappedValue ||
            item.alt?.trim().toLowerCase() === 'all' ||
            item.alt === '' ||
            item.alt === null
        )[0]
      : __GLOBAL__.product.media[imageIndex]

    const activeImage = this.activeMedia.querySelector('adaptive-image')
    const activeVideo = this.activeMedia.querySelector(
      'adaptive-video[data-type=video]'
    )
    const activeExternalVideo = this.activeMedia.querySelector(
      'adaptive-video[data-type=external_video]'
    )
    const activeModel = this.activeMedia.querySelector('product-model')

    let oldActiveItems = [
      ...this.thumbnailContainer.querySelectorAll('.active'),
    ]

    oldActiveItems.forEach((item) => item.classList.remove('active'))

    if (thumbnailIndex) {
      this.thumbnailListItems[thumbnailIndex].classList.add('active')
      this.thumbnailIndex = thumbnailIndex
    } else {
      this.thumbnailListItems[0].classList.add('active')

      this.variantThumbnails = this.thumbnailListItems.filter(
        (item) =>
          !item.classList.contains('hidden') &&
          !item.classList.contains('cloned-slide')
      )
      this.thumbnailIndex = -1
      if (this.variantThumbnails.length > 0) {
        this.thumbnailIndex =
          this.variantThumbnails[0].querySelector(
            'button'
          ).dataset.thumbnailIndex
      }
    }

    switch (media?.media_type) {
      case 'image':
        if (!activeImage) {
          const additionalContents = `
            <div class="js-gallery-additional product-gallery__additional">
              ${this.galleryAdditionalContent}
            </div>
          `
          this.activeMedia.innerHTML =
            generateImageMarkup(data) + additionalContents
        } else {
          activeImage.updateImage(data)
          activeImage.show()
        }

        activeVideo && activeVideo.hide()
        activeExternalVideo && activeExternalVideo.hide()
        activeModel && activeModel.hide()
        break
      case 'video':
        if (!activeVideo) {
          this.activeMedia.innerHTML = generateVideoMarkup(data)
        } else {
          activeVideo.updateVideo(data)
          activeVideo.show()
        }

        activeExternalVideo && activeExternalVideo.hide()
        activeModel && activeModel.hide()
        activeImage && activeImage.hide()
        break
      case 'external_video':
        if (!activeExternalVideo) {
          this.activeMedia.innerHTML = generateExternalVideoMarkup(data)
        } else {
          activeExternalVideo.updateVideo(data)
          activeExternalVideo.show()
        }

        activeVideo && activeVideo.hide()
        activeModel && activeModel.hide()
        activeImage && activeImage.hide()
        break
      case 'model':
        if (!activeModel) {
          this.activeMedia.innerHTML = generateProductModelMarkup(data)
        } else {
          activeExternalVideo.updateVideo(data)
          activeExternalVideo.show()
        }

        activeVideo && activeVideo.hide()
        activeModel && activeModel.hide()
        activeImage && activeImage.hide()
        break
      default:
        activeImage && activeImage.hide()
        activeVideo && activeVideo.hide()
        activeExternalVideo && activeExternalVideo.hide()
        activeModel && activeModel.hide()
    }
  }

  static get observedAttributes() {
    return ['variant']
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'variant') {
      // On variant change:
      if (!this.variantMap) {
        this._initOptionSelector()
      }

      let refinedAlt =
        this.variantMap &&
        Array.from(this.variantMap).filter(
          (variant) => variant.optionGenName === newValue
        )?.[0]?.name

      if (this.thumbnailContainer) {
        // DESKTOP

        this.thumbnailListItems.forEach((item) => {
          if (
            item?.dataset?.variantAlt?.trim() !== refinedAlt &&
            item?.dataset?.variantAlt.trim() !== 'All' &&
            item?.dataset?.variantAlt.trim() !== ''
          ) {
            item.classList.add('hidden')
          } else {
            item.classList.remove('hidden')
          }
        })

        let visibleSlidesWithNoClones = this.thumbnailListItems.filter(
          (item) =>
            !item.classList.contains('hidden') &&
            !item.classList.contains('cloned-slide')
        )

        this.thumbnailOffset = visibleSlidesWithNoClones.length

        if (this.thumbnailContainer) {
          this.thumbnailContainer.dataset.scrollIndex = this.thumbnailOffset
        }

        this.handleInitialSliderSizing()
        this.cloneThumbnails(visibleSlidesWithNoClones.length)
        this.snapToFirstThumbnail(true)

        this.visibleThumbnails = this.thumbnailListItems.filter(
          (item) => !item.classList.contains('hidden')
        )
      }

      // // MOBILE

      // 1. Remove hidden class from all thumbs
      // 2. Add hidden class to all slides that don't have matching dataset alt

      this.mobileSlides.forEach((item) => {
        if (
          item?.dataset?.variantAlt?.trim() !== refinedAlt &&
          item?.dataset?.variantAlt?.trim() !== 'All' &&
          item?.dataset?.variantAlt?.trim() !== '' &&
          this.mobileSlides.length > 1
        ) {
          item.classList.add('hidden')
        } else {
          item.classList.remove('hidden')
        }
      })

      this.mobileSlider.setAttribute(
        'variant',
        refinedAlt?.replace(/\W+/g, '-').toLowerCase()
      )

      let visibleMobileSlidesWithNoClones = this.mobileSlides.filter(
        (item) =>
          !item.classList.contains('hidden') &&
          !item.classList.contains('mobile-cloned-slide')
      )

      if (this.scrollLeftButton && this.scrollRightButton) {
        this.scrollLeftButton.classList.toggle(
          'hidden',
          visibleMobileSlidesWithNoClones.length <= 1
        )
        this.scrollRightButton.classList.toggle(
          'hidden',
          visibleMobileSlidesWithNoClones.length <= 1
        )
      }
    }
  }

  snapToFirstThumbnail(instant = false) {
    let firstSetOfSlides = this.thumbnailListItems
      .filter(
        (item) =>
          !item.classList.contains('hidden') &&
          !item.classList.contains('cloned-slide')
      )
      .slice(0, 1)

    let thumbnailContainer = this.thumbnailContainer

    clearTimeout(this.snapToFirstThumbnailTimer)
    this.snapToFirstThumbnailTimer = setTimeout(
      function () {
        if (firstSetOfSlides.length) {
          firstSetOfSlides[0].querySelector('button').click()
          thumbnailContainer.scrollTo({
            top: firstSetOfSlides[0].offsetTop,
            behavior: 'instant',
          })
        }
      },
      instant ? 0 : 350
    )
  }

  generateThumbnailMarkup(data, i) {
    return `
      <li>
        <button
          class="js-gallery-thumbnail-button"
          data-index="${i}"
        >
          <img
            alt="${data.alt}"
            src="${data.thumb}"
            loading="eager">
        </button>
      </li>
    `
  }

  setCurrentThumbnail(currentIndex, mobile) {
    if (mobile) {
      this.muteModalMobileScroll = true
    }
    const _currentIndex = Number(currentIndex)
    this.querySelectorAll('.js-gallery-thumbnail-button').forEach((item) =>
      item.classList.remove('active')
    )
    this.querySelectorAll('.js-gallery-thumbnail-button').forEach(
      (item, index) => {
        item.classList[index === _currentIndex ? 'add' : 'remove']('active')
      }
    )

    if (!mobile) {
      this.galleryModal.scrollTo({
        top: this.scrollPositions[_currentIndex],
        behavior: 'smooth',
      })
    } else {
      this.galleryModalImagesMobile.scrollTo({
        left: this.scrollPositions[_currentIndex],
        top: 0,
        behavior: 'smooth',
      })
      this.doMuteModalMobileScroll()
    }
  }

  doMuteModalMobileScroll() {
    setTimeout(() => {
      this.muteModalMobileScroll = false
    }, 700)
  }

  trapFocus(e) {
    const focusableEls = this.galleryModal.querySelectorAll(
      '.js-close-zoom, .js-gallery-thumbnail-button'
    )
    const firstFocusableEl = focusableEls[0]
    const lastFocusableEl = focusableEls[focusableEls.length - 1]
    const KEYCODE_TAB = 9

    const isTabPressed = e.key === 'Tab' || e.keyCode === KEYCODE_TAB

    if (!isTabPressed) {
      return
    }

    if (e.shiftKey) {
      /* shift + tab */ if (document.activeElement === firstFocusableEl) {
        lastFocusableEl.focus()
        e.preventDefault()
      }
    } /* tab */ else {
      if (document.activeElement === lastFocusableEl) {
        firstFocusableEl.focus()
        e.preventDefault()
      }
    }
  }

  openZoomModal() {
    this._initModalReady(this.galleryModalImages, this.galleryModalThumbs)
  }

  openZoomModalMobile(item) {
    this.muteModalMobileScroll = false
    this.thumbnailIndex = Number(item.dataset.thumbnailIndex)
    this._initModalReady(
      this.galleryModalImagesMobile,
      this.galleryModalThumbsMobile,
      true
    )
    this.addEventListeners()
  }

  // This creates a map for easier variant switching
  _initOptionSelector() {
    if (this.variantType === 'none') {
      return
    }

    let selector = document.querySelector('.single-option-selector')
    let options = [...selector.querySelectorAll('option')]

    let liquidVariants = document.querySelector('.hidden-variants')
    let liquidOptions = [...liquidVariants.querySelectorAll('option')]

    let rawVariants = this.product.variants

    let uniqueSelector = options.map((option, index) => {
      let newObject = {
        value: rawVariants[index].id,
        name: liquidOptions[index].innerText,
        optionGenName: option.value,
      }

      return newObject
    })

    this.variantMap = uniqueSelector
  }

  _initModalReady(imagesContainer, thumbsContainer, mobile = false) {
    imagesContainer.innerHTML = ''
    thumbsContainer.innerHTML = ''

    this.classList.remove('product-gallery--sticky')

    this.scrollPositions = []

    let variantThumbs = []
    if (mobile) {
      variantThumbs = Array.from(
        this.querySelectorAll('.js-mobile-slide')
      ).filter((item) => !item.classList.contains('hidden'))
    } else {
      variantThumbs = Array.from(this.querySelectorAll('.js-thumbnail')).filter(
        (item) =>
          item.classList.contains('cloned-slide') !== true &&
          item.classList.contains('hidden') !== true
      )
    }

    const imagesData = []
    let thumbButton = null,
      thumbImg = null
    variantThumbs.forEach((item) => {
      thumbButton = item.querySelector('button')
      thumbImg = item.querySelector('img')
      imagesData.push({
        id: thumbButton.dataset.thumbnailIndex,
        alt: thumbButton.dataset.alt,
        aspectRatio: thumbButton.dataset.aspectRatio ?? null,
        loading: thumbButton.dataset.loading ?? null,
        thumb: thumbImg
          ? thumbImg.dataset.src
          : thumbButton.dataset.thumbSrc ?? null,
        src: thumbButton.dataset.previewImageUrl,
        posterImage: thumbButton.dataset.previewImageUrl,
        video: thumbButton.dataset.video ?? null,
        mediaType: thumbButton.dataset.mediaType,
      })
    })

    let imagesMarkUp = ''
    imagesData.forEach((item) => {
      if (item.video) {
        if (
          item.mediaType === 'external_video' ||
          typeof item.mediaType === 'undefined'
        ) {
          imagesMarkUp += generateExternalVideoMarkup(item)
        } else {
          imagesMarkUp += generateVideoMarkup(item)
        }
      } else {
        imagesMarkUp += generateImageMarkup(item)
      }
    })

    imagesContainer.innerHTML = imagesMarkUp

    let thumbsMarkUp = ''
    imagesData.forEach((item, i) => {
      thumbsMarkUp += this.generateThumbnailMarkup(item, i)
    })
    thumbsContainer.innerHTML = thumbsMarkUp

    if (mobile) {
      this.galleryModalMobile.classList.add('opened')
    } else {
      this.galleryModal.classList.add('m-block')
    }

    let currentIndex = 0
    imagesData.forEach((item, i) => {
      if (Number(item.id) === Number(this.thumbnailIndex)) {
        currentIndex = i
      }
    })

    setTimeout(() => {
      this.scrollPositions = Array.from(imagesContainer.children).reduce(
        (positions, item) => {
          mobile
            ? positions.push(item.offsetLeft)
            : positions.push(item.offsetTop)
          return positions
        },
        []
      )

      this.setCurrentThumbnail(currentIndex, mobile)

      if (!mobile) {
        this.galleryModal.addEventListener('keydown', this.trapFocus.bind(this))
      }
    }, 100)

    this.querySelectorAll('.js-gallery-thumbnail-button').forEach((item) => {
      item.addEventListener(
        'click',
        (e) => {
          this.setCurrentThumbnail(item.dataset.index, mobile)
        },
        false
      )
    })
  }

  closeZoomModal() {
    this.galleryModalImages.innerHTML = ''
    this.galleryModalThumbs.innerHTML = ''
    this.galleryModal.classList.remove('m-block')

    this.galleryModalImagesMobile.innerHTML = ''
    this.galleryModalThumbsMobile.innerHTML = ''
    this.galleryModalMobile.classList.remove('opened')

    if (this.doesPDPHaveStickyGallery) {
      this.classList.add('product-gallery--sticky')
    }

    this.galleryModal.removeEventListener('keydown', this.trapFocus.bind(this))
    this.removeEventListeners()
  }

  addEventListeners() {
    this.galleryModalImagesMobile.addEventListener(
      'scroll',
      this.watchModalMobileScroll.bind(this)
    )
  }

  removeEventListeners() {
    this.galleryModalImagesMobile.removeEventListener(
      'scroll',
      this.watchModalMobileScroll.bind(this)
    )
  }

  watchModalMobileScroll(ev) {
    if (this.muteModalMobileScroll) return
    this.setCurrentThumbnail(
      this.scrollPositions.indexOf(
        [...this.scrollPositions].sort((a, b) => {
          return (
            Math.abs(ev.target.scrollLeft - a) -
            Math.abs(ev.target.scrollLeft - b)
          )
        })[0]
      ),
      true
    )
  }
}

window.customElements.define('product-gallery', ProductGallery)

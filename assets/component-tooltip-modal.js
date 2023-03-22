const template = `
<div class="tooltip-modal__backdrop"></div>
<div class="tooltip-modal__container">
  <div class="tooltip-modal__content">
    <div class="tooltip-modal__inner">
        <div class="tooltip-modal__title-container grid sm-grid align-center">
            <div class="tooltip-modal__col--title-container col text-center">
              <slot name="title"></slot>
            </div>
            <div class="tooltip-modal__col--close-container text-right col">
              <button class="js-close-slideout tooltip-modal__col--close-button" aria-label="${window.localeStrings.close}">
                <slot name="close-btn">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.1421 0L14.4957 0.353502L14.8492 0.707107L8.13171 7.42458L14.8492 14.1421L14.4957 14.4956L14.1421 14.8492L7.42461 8.13169L0.707107 14.8492L0.353554 14.4956L0 14.1421L6.7175 7.42459L2.16748e-05 0.707107L0.353524 0.353502L0.707129 0L7.42461 6.71748L14.1421 0Z" fill="#FFFBF7"/>
                  </svg>
                </slot>
              </button>
            </div>
        </div>
        <div class="tooltip-modal__body-container">
          <slot name="content"></slot>
        </div>
    </div>
  </div>
</div>
`

const tooltipModalTemplate = document.createElement('template')
const tooltipModal = document.querySelector('tooltip-modal')

class TooltipModal extends HHBaseElement {
  timeoutId = 0

  constructor() {
    super(template)
    this.id = this.getAttribute('slideout-id')

    if (!this.id) {
      throw new Error('ID not specified on the Slide Out Element')
    }

    this.updateTransitionDuration(this.transitionDuration)
    this._handleDocumentClick = this._handleDocumentClick.bind(this)
  }

  connectedCallback() {
    if (this.position) {
      this.setAnchorClass(this.position)
    } else {
      this.setAnchorClass()
    }
    if (this.transitionDuration) {
      this.updateTransitionDuration(this.transitionDuration)
    }
    this._upgradeProperty('open')
    this._upgradeProperty('transitionDuration')
    this._upgradeProperty('position')
    this.classList.remove('hidden')
    if (!this.open) {
      this.hideRoot()
      this.hideBackdrop()
      this.hidePanel()
    }
    this.attachEventListeners()
    this.setupFocusTrap()
    if (window.location.search.includes(this.id + '=true')) {
      this.open = true
    }
    this._attach
  }

  setupFocusTrap() {
    const focusableElements =
      'button, [href], input[type="email"], select, textarea, [tabindex]:not([tabindex="-1"])'
    const focusableContent = [
      ...this._shadowRoot.querySelectorAll(focusableElements),
      ...this.querySelectorAll(focusableElements),
    ]
    if (focusableContent.length == 0) {
      return
    }
    this.firstFocusableElement = focusableContent[0]
    this.lastFocusableElement = focusableContent[focusableContent.length - 1]
    document.addEventListener('keydown', (e) => {
      let isTabPressed = e.key === 'Tab' || e.keyCode === 9

      if (!isTabPressed) {
        return
      }

      if (!this.contains(e.target)) {
        return
      }

      if (e.shiftKey) {
        if (document.activeElement === this.firstFocusableElement) {
          this.lastFocusableElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === this.lastFocusableElement) {
          if (this.firstFocusableElement) this.firstFocusableElement.focus()
          e.preventDefault()
        }
      }
    })
  }

  getRoot() {
    return this._shadowRoot.querySelector('.slide-panel')
  }
  getBackdrop() {
    return this._shadowRoot.querySelector('.slide-panel__backdrop')
  }
  hideBackdrop() {
    const backdrop = this.getBackdrop()
    if (backdrop) {
      backdrop.style.visibility = 'hidden'
    }
  }

  showBackdrop() {
    const backdrop = this.getBackdrop()
    if (backdrop) {
      backdrop.style.opacity = '1'
      backdrop.style.removeProperty('visibility')
    }
  }
  hideRoot() {
    const root = this.getRoot()
    root === null || root === void 0
      ? void 0
      : root.setAttribute('aria-hidden', 'true')
  }
  showRoot() {
    const root = this.getRoot()
    root === null || root === void 0
      ? void 0
      : root.setAttribute('aria-hidden', 'false')
  }

  static get observedAttributes() {
    return ['open', 'position', 'transitionDuration', 'type']
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (oldVal === newVal) {
      return
    }

    if (attrName === 'type') {
      if (oldVal) {
        this.classList.remove('slide-panel--' + oldVal)
      }
      this.classList.add('slide-panel--' + newVal)
    }

    if (attrName === 'open' && this.isReady) {
      if (newVal === '' || newVal === 'true') {
        if (this.firstFocusableElement) {
          setTimeout(() => {
            this.firstFocusableElement.focus()
          }, 100)
        }
        this.showRoot()
        this.showBackdrop()
        this.triggerEvent('slide-panel-open', { id: this.id })
      } else {
        this.hideRoot()
        this.hideBackdrop()
        this.triggerEvent(
          this.triggerEvent('slide-panel-close', { id: this.id })
        )
        this._unsetUrlParam()
        document.removeEventListener('keydown', this._handleKeyDown.bind(this))
      }
    }
    if (attrName === 'position') {
      this.removeAnchorClass(oldVal)
      this.setAnchorClass(newVal)
    }
    if (attrName === 'transitionDuration') {
      this.updateTransitionDuration(newVal)
    }
  }

  _unsetUrlParam() {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.delete(this.id)
    const newRelativePathQuery =
      window.location.pathname + '?' + searchParams.toString()
    history.pushState(null, '', newRelativePathQuery)
  }

  getAnchorClass(position) {
    let className = 'slide-panel__panel'
    switch (position) {
      case 'left':
        className += '--left'
        break
      case 'right':
        className += '--right'
        break
      case 'top':
        className += '--top'
        break
      case 'bottom':
        className += '--bottom'
        break
      default:
        className += '--left'
    }
    return className
  }

  removeAnchorClass(position) {
    const className = this.getAnchorClass(position)
    const panel = this.panel
    panel === null || panel === void 0
      ? void 0
      : panel.classList.remove(className)
  }

  setAnchorClass(position = 'left') {
    const className = this.getAnchorClass(position)
    const panel = this.panel
    panel === null || panel === void 0 ? void 0 : panel.classList.add(className)
  }

  get open() {
    return Boolean(this.getAttribute('open'))
  }

  set open(value) {
    const isOpen = Boolean(value)
    if (isOpen) {
      this.setAttribute('open', 'true')
    } else {
      this.setAttribute('open', 'false')
    }
  }

  get position() {
    return this.getAttribute('position')
  }

  get contentSlot() {
    return this.querySelector('[slot="content"]') || this
  }

  set position(value) {
    this.position = value
  }

  get transitionDuration() {
    return this.getAttribute('transitionDuration') || '300'
  }

  set transitionDuration(value) {
    if (value) {
      this.transitionDuration = value
    }
  }

  get handleClose() {
    return this.getAttribute('handleClose')
  }

  set handleClose(value) {
    this.handleClose = value
  }

  attachEventListeners() {
    const backdrop = this.getBackdrop()
    backdrop === null || backdrop === void 0
      ? void 0
      : backdrop.addEventListener('click', () => {
          this._handleBackdropClick()
        })
    document.addEventListener('keydown', this._handleKeyDown.bind(this))
    const allSlideOutCloseTriggers = [
      ...this._shadowRoot.querySelectorAll('.js-close-slideout'),
    ]

    this.contentSlot.addEventListener('pointerdown', (e) => {
      if (e.target.classList.contains('js-close-slideout')) {
        this.open = false
      }
    })

    allSlideOutCloseTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault()
        this.open = false
      })
    })

    document.addEventListener('click', this._handleDocumentClick)
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._handleDocumentClick)
  }

  _handleDocumentClick(event) {
    if (
      event.target.classList.contains('js-open-tooltip-modal') &&
      this.id === event.target.dataset.target
    ) {
      let topDistance =
        event.target.getBoundingClientRect().top +
        document.documentElement.scrollTop -
        this._shadowRoot.querySelector('.tooltip-modal__container')
          .offsetHeight -
        20

      let leftDistance

      if (window.innerWidth > 992) {
        leftDistance = event.target.getBoundingClientRect().left
      } else {
        leftDistance =
          (window.innerWidth -
            this._shadowRoot.querySelector('.tooltip-modal__container')
              .offsetWidth) /
          2
      }

      this._shadowRoot.querySelector('.tooltip-modal__container').style.top =
        topDistance + 'px'

      this._shadowRoot.querySelector('.tooltip-modal__container').style.left =
        leftDistance + 'px'

      this.open = true
    } else if (this.open === true && !this.contains(event.target)) {
      this.open = false
    }
  }

  get panel() {
    return this._shadowRoot.querySelector('.slide-panel__panel')
  }

  updateTransitionDuration() {
    const backdrop = this.getBackdrop()
    if (backdrop) {
      backdrop.style.transitionDuration = this.transitionDuration + 'ms'
    }
    const panel = this.panel
    if (panel) {
      panel.style.transitionDuration = this.transitionDuration + 'ms'
    }
  }

  _handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      this.open = false
    }
  }

  _handleBackdropClick() {
    this.open = false
  }
}
window.customElements.define('tooltip-modal', TooltipModal)

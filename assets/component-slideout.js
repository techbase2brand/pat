const template = `
<div class="slide-panel__backdrop"></div>
<div class="slide-panel__panel slide-panel__panel--right" tabindex="0">
  <div class="slide-panel__content">
    <div class="slide-panel__inner" tabindex="0">
        <div class="slide-panel__title-container grid sm-grid align-center">
            <div class="slide-panel__col--title-container col text-center">
              <slot name="title"></slot>
            </div>
            <div class="slide-panel__col--close-container text-right col">
              <button class="js-close-slideout slide-panel__col--close-button" aria-label="${window.localeStrings.close}">
                <slot name="close-btn">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.1421 0L14.4957 0.353502L14.8492 0.707107L8.13171 7.42458L14.8492 14.1421L14.4957 14.4956L14.1421 14.8492L7.42461 8.13169L0.707107 14.8492L0.353554 14.4956L0 14.1421L6.7175 7.42459L2.16748e-05 0.707107L0.353524 0.353502L0.707129 0L7.42461 6.71748L14.1421 0Z" fill="#FFFBF7"/>
                  </svg>
                </slot>
              </button>
            </div>
        </div>
        <div class="slide-panel__body-container">
          <slot name="content"></slot>
        </div>
    </div>
  </div>
</div>
`

const slidePanelTemplate = document.createElement('template')
const slidePanel = document.querySelector('slide-panel')

class SlidePanel extends HHBaseElement {
  timeoutId = 0

  constructor() {
    super(template)
    this.id = this.getAttribute('slideout-id')

    if (!this.id) {
      throw new Error('ID not specified on the Slide Out Element')
    }

    this.updateTransitionDuration(this.transitionDuration)
    this._handleDocumentClick = this._handleDocumentClick.bind(this)
    this._handleLocationHashChange = this._handleLocationHashChange.bind(this)
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
      this._close()
    }
    this.attachEventListeners()
    this.setupFocusTrap()
    document.addEventListener('cf:ready', () => {
      this.setupFocusTrap()
    })

    if (window.location.search.includes(this.id + '=true')) {
      this.show()
    } else {
      this._handleLocationHashChange()
    }
  }

  setupFocusTrap() {
    const focusableElements =
      'button, [href], input[type="email"], input[type="text"], input[type="tel"], select, textarea, [tabindex]:not([tabindex="-1"]) iframe'

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
      let isTabPressed = e.key === 'Tab'

      if (!isTabPressed) {
        return
      }

      if (!this.contains(e.target)) {
        return
      }

      if (e.shiftKey) {
        if (document.activeElement === this.firstFocusableElement) {
          this.lastFocusableElement.focus()
          document.activeElement.scrollIntoView(true)

          e.preventDefault()
        }
      } else {
        if (document.activeElement === this.lastFocusableElement) {
          if (this.firstFocusableElement) this.firstFocusableElement.focus()
          document.activeElement.scrollIntoView(true)
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
  freezeBody() {
    document.querySelector('html').classList.add('frozen')
    document.querySelector('body').classList.add('frozen')
  }
  unfreezeBody() {
    document.querySelector('html').classList.remove('frozen')
    document.querySelector('body').classList.remove('frozen')
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
          this._lastFocusElement = document.activeElement
          setTimeout(() => {
            this.firstFocusableElement.focus()
          }, 100)
        }
        this.freezeBody()
        this.showRoot()
        this.showBackdrop()
        this.triggerEvent('slide-panel-open', { id: this.id })
      } else {
        this.unfreezeBody()
        this.hideRoot()
        this.hideBackdrop()
        this.triggerEvent('slide-panel-close', { id: this.id })
        this._unsetUrlParam()
        document.removeEventListener('keydown', this._handleKeyDown.bind(this))

        if (this._lastFocusElement) {
          setTimeout(() => {
            this._lastFocusElement.focus()
            this._lastFocusElement = null
          }, 100)
        } else {
          document.body.focus()
        }
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

  _handleLocationHashChange() {
    const currentHash = window.location.hash.replace('#', '')
    if (currentHash === this.id) {
      this.show()
    } else if (this.open) {
      this._close()
    }
  }

  _unsetUrlParam() {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.delete(this.id)
    const currentHash = window.location.hash.replace('#', '')
    const newRelativePathQuery =
      window.location.pathname +
      `${!!searchParams.toString() ? '?' + searchParams.toString() : ''}${
        currentHash === this.id ? '' : window.location.hash
      }`
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

  show() {
    this.open = true
    this.freezeBody()
  }

  get open() {
    return this.getAttribute('open') === 'true'
  }

  set open(value) {
    const isOpen = Boolean(value)
    if (isOpen) {
      this.setAttribute('open', 'true')
      this.setAttribute('aria-hidden', false)

      this._checkYMKModule(true)
    } else {
      this.setAttribute('open', 'false')
      this.setAttribute('aria-hidden', true)
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
    this.unfreezeBody()
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
      ...this.querySelectorAll('.js-close-slideout'),
    ]

    this.contentSlot.addEventListener('pointerdown', (e) => {
      if (e.target.classList.contains('js-close-slideout')) {
        this._close()
      }
    })

    allSlideOutCloseTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault()
        this._close()
      })
    })
    window.addEventListener('hashchange', this._handleLocationHashChange)
    document.addEventListener('click', this._handleDocumentClick)
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this._handleLocationHashChange)
    document.removeEventListener('click', this._handleDocumentClick)
  }

  _handleDocumentClick(event) {
    const target = event.target.dataset.target
    const iframe = document.querySelector(`iframe[data-target='${target}']`)

    if (
      event.target.classList.contains('js-open-slideout') &&
      this.id === target
    ) {
      this.open = true
      if (iframe) {
        const srcAttr = event.target.dataset.videolink
        const iframe = document.querySelector(`iframe[data-target='${target}']`)
        iframe.src = srcAttr
        iframe.style = 'opacity:1;'
      }
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
      this._close()
    }
  }

  _handleBackdropClick() {
    this._close()
  }

  _checkYMKModule(open) {
    const matchedShadeFinder = this.querySelector('matched-shade-finder')
    if (matchedShadeFinder) {
      const iframe = this.querySelector('iframe')
      const hasYMKModule =
        typeof this.querySelector('#YMK-module') !== 'undefined'
      if (open) {
        if (!iframe && hasYMKModule) {
          matchedShadeFinder.show()
        }
      } else {
        if (iframe && !hasYMKModule) {
          iframe.src = ''
        }
      }
    }
  }

  _close() {
    if (this.open) {
      this.open = false
      this.unfreezeBody()
      this.hideRoot()
      this.hideBackdrop()
    }
    this._checkYMKModule(false)
  }
}
window.customElements.define('slide-panel', SlidePanel)

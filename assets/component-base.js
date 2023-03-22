// Base Component Class
class HHBaseElement extends HTMLElement {
  isReady = false
  constructor(template, mode) {
    super()
    if (template) {
      this.template = template
      this._shadowRoot = this.attachShadow({ mode: mode ?? 'open' })
      this.render()
      this.loadStyles()
    } else {
      this.bootstrap()
    }
  }

  _setupFocusTrap() {
    const focusableElements =
      'button, [href], input[type="email"], input[type="text"], select, textarea, [tabindex]:not([tabindex="-1"])'
    const focusableContent = [
      ...(this._shadowRoot
        ? this._shadowRoot.querySelectorAll(focusableElements)
        : []),
      ...this.querySelectorAll(focusableElements),
    ]
    if (focusableContent.length == 0) {
      return
    }
    this._firstFocusableElement = focusableContent[0]
    this._lastFocusableElement = focusableContent[focusableContent.length - 1]
    document.addEventListener('keydown', (e) => {
      let isTabPressed = e.key === 'Tab' || e.keyCode === 9

      if (!isTabPressed) {
        return
      }

      if (!this.contains(e.target)) {
        return
      }

      if (e.shiftKey) {
        if (document.activeElement === this._firstFocusableElement) {
          this._lastFocusableElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === this._lastFocusableElement) {
          if (this._firstFocusableElement) this._firstFocusableElement.focus()
          e.preventDefault()
        }
      }
    })
  }

  bootstrap() {
    this.removeAttribute('cloak')
    this.isReady = true
    if (this.handleReady) {
      this.handleReady()
    }
  }

  _onStylesLoaded() {
    this.bootstrap()
    this.dispatchEvent(new CustomEvent('stylesLoaded'))
    if (this.onStylesLoaded) this.onStylesLoaded()
  }

  _upgradeProperty(prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop]
      delete this[prop]
      this[prop] = value
    }
  }

  _freezeBody() {
    document.querySelector('html').classList.add('frozen')
    document.querySelector('body').classList.add('frozen')
  }

  _unfreezeBody() {
    document.querySelector('html').classList.remove('frozen')
    document.querySelector('body').classList.remove('frozen')
  }

  triggerEvent(event, data) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, detail: data }))
  }

  triggerGlobalEvent(event, data) {
    document.dispatchEvent(
      new CustomEvent(event, { bubbles: true, detail: data })
    )
  }

  loadStyles() {
    const styleSheet = this.getAttribute('shadowStylesheet')
    if (!!styleSheet) {
      const link = document.createElement('link')
      link.type = 'text/css'
      link.rel = 'stylesheet'
      link.onload = () => this._onStylesLoaded()
      link.href = this.getAttribute('shadowStylesheet')
      this._shadowRoot.append(link)
    } else {
      this._onStylesLoaded()
    }
  }

  render() {
    if (this.template) {
      this._shadowRoot.innerHTML = `${this.template}`
    }
  }
}

class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject
      this.resolve = resolve
    })
  }
}

class MainMenu extends HHBaseElement {
  EXIT_TIMEOUT = 500

  constructor() {
    super()
    this.openMenu = this.openMenu.bind(this)
    this.openMobileMenu = this.openMobileMenu.bind(this)
    this.closeMenu = this.closeMenu.bind(this)
    this.closeAllMenus = this.closeAllMenus.bind(this)
    this.handleNavBack = this.handleNavBack.bind(this)
    this.handleMenuItemEnter = this.handleMenuItemEnter.bind(this)
    this.handleMenuItemLeave = this.handleMenuItemLeave.bind(this)
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this)

    this._calculateHeaderHeight = this._calculateHeaderHeight.bind(this)
    this.activeId = null

    this.triggers = this.querySelectorAll('.js-main-navigation-link')
    this.menuItems = this.querySelectorAll('.megamenu')
    this.backdrop = this.querySelector('.js-backdrop')
    this.mobileToggle = this.querySelector('.js-mobilemenu-trigger')
    this.mobileMenu = this.querySelector('.js-mobilemenu')
    this.mobileBackMenus = this.querySelectorAll('.js-open-mobile-menu')
    this.navLeaveTimer = null
    this.announcementBar = this.querySelector(
      '#shopify-section-section-announcement-bar'
    )
    this.header = this.querySelector('#shopify-section-section-header')
    this.mql = window.matchMedia('(min-width: 992px)')
  }

  connectedCallback() {
    this._viewportWatcher()
    this._attachListeners()
    this._calculateHeaderHeight()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  getMenuForLink(id) {
    return this.querySelector(id)
  }

  showBackdrop() {
    this.backdrop.classList.add('visible')
  }

  hideBackdrop() {
    this.backdrop.classList.remove('visible')
    document.documentElement.classList.remove('frozen')
    document.body.classList.remove('frozen')
  }

  clearExitTimer() {
    try {
      clearTimeout(this.navLeaveTimer)
      this.navLeaveTimer = null
    } catch (error) {
      console.error(error)
    }
  }

  setExitTimer() {
    try {
      this.navLeaveTimer = setTimeout(() => {
        this.activeId = null
        this.applyState()
      }, this.EXIT_TIMEOUT)
    } catch (error) {
      console.error(error)
    }
  }

  openMenu(event) {
    if (!this.mql.matches) {
      this.openMobileMenu()
      this.mobileToggle.classList.add('active')
    }

    try {
      event.preventDefault()
      this.clearExitTimer()
      this.activeId = (event.currentTarget.getAttribute('href') || '').split(
        '#'
      )[1]
    } catch (error) {
      this.activeId = null
    } finally {
      this.applyState()
    }
  }

  openMobileMenu() {
    this.activeId = null
    this.applyState()
    this.mobileToggle.classList.add('active')
    this.mobileMenu.classList.add('open')
    this.showBackdrop()
  }

  closeMenu(event) {
    event.preventDefault()
    this.setExitTimer()
  }

  closeAllMenus() {
    this.activeId = null
    this.applyState()
    this.classList.remove('is-active')
    this.mobileToggle.classList.remove('active')
    this.mobileMenu.classList.remove('open')
    this.hideBackdrop()
  }

  applyState() {
    this.classList[this.isMenuActive ? 'add' : 'remove']('is-active')

    if (this.activeId) {
      this.showBackdrop()
    } else {
      if (this.mql.matches) {
        this.hideBackdrop()
      }
    }

    for (const menuItem of this.menuItems) {
      if (this.activeId === menuItem.id) {
        menuItem.open()
      } else {
        menuItem.close()
      }
    }
  }

  handleMenuItemEnter() {
    this.clearExitTimer()
  }

  handleMenuItemLeave() {
    this.setExitTimer()
  }

  handleNavBack() {
    this.activeId = null
    this.openMobileMenu()
  }

  get isMenuActive() {
    return this.mobileMenuOpen || this.activeId
  }

  get mobileMenuOpen() {
    return this.mobileMenu.classList.contains('open')
  }

  toggleMobileMenu() {
    if (this.mobileMenuOpen) {
      this.handleNavBack()
      this.hideBackdrop()
      this.closeAllMenus()
    } else {
      this.showBackdrop()
      this.openMobileMenu()
    }
    this.applyState()
  }

  _viewportWatcher() {
    this.mql.onchange = (e) => {
      this._removeListeners()
      this._attachListeners()
    }
  }

  _attachListeners() {
    this.addEventListener(
      'announcement-bar::ready',
      this._calculateHeaderHeight
    )
    window.addEventListener('resize', this._calculateHeaderHeight)
    this.backdrop.addEventListener('click', this.closeAllMenus)
    if (this.mql.matches) {
      for (const trigger of this.triggers) {
        trigger.addEventListener('pointerleave', (event) => {
          if (event.pointerType === 'mouse') this.closeMenu(event)
        })
        trigger.addEventListener('pointerenter', (event) => {
          if (event.pointerType === 'mouse') this.openMenu(event)
        })
        trigger.addEventListener('pointerup', this.openMenu)
      }

      for (const menuItem of this.menuItems) {
        menuItem.addEventListener('pointerenter', this.handleMenuItemEnter)
        menuItem.addEventListener('pointerleave', this.handleMenuItemLeave)
      }
    } else {
      for (const trigger of this.triggers) {
        // check if the trigger is a link to an internal page
        const isLink = trigger.getAttribute('href').includes('/');

        if (!isLink) {
          trigger.addEventListener('click', this.openMenu);
        }
      }
      this.mobileToggle.addEventListener('click', this.toggleMobileMenu)

      for (const mobileBackMenu of this.mobileBackMenus) {
        mobileBackMenu.addEventListener('click', this.handleNavBack)
      }
    }
  }

  _removeListeners() {
    this.removeEventListener(
      'announcement-bar::ready',
      this._calculateHeaderHeight
    )
    window.removeEventListener('resize', this._calculateHeaderHeight)
    this.backdrop.removeEventListener('click', this.toggleMobileMenu)
    for (const trigger of this.triggers) {
      trigger.removeEventListener('pointerenter', this.openMenu)
      trigger.removeEventListener('pointerleave', this.closeMenu)
    }

    for (const menuItem of this.menuItems) {
      menuItem.removeEventListener('pointerenter', this.handleMenuItemEnter)
      menuItem.removeEventListener('pointerleave', this.handleMenuItemLeave)
    }

    for (const mobileBackMenu of this.mobileBackMenus) {
      mobileBackMenu.removeEventListener('click', this.handleNavBack)
    }
    this.mobileToggle.removeEventListener('click', this.toggleMobileMenu)
    this.backdrop.removeEventListener('pointerenter', this.closeMenu)
  }

  _calculateHeaderHeight() {
    setTimeout(() => {
      document.documentElement.style.setProperty(
        '--header-spacer',
        (this.announcementBar.offsetHeight || 0) +
          (this.header.offsetHeight || 0) +
          'px'
      )

      if (this.mql.matches && this.mobileMenuOpen) {
        this.handleNavBack()
        this.hideBackdrop()
        this.closeAllMenus()
      }
    }, 100)
  }
}

window.customElements.define('main-menu', MainMenu)

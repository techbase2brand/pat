class CFForm extends HHBaseElement {
  submitting = false

  constructor() {
    super()
    this.$form = this.querySelector('form')
    this.$wrapperSlideout = this.closest('slide-panel')
    this._onSubmit = this._onSubmit.bind(this)
    this._submitButton = this.querySelector('button[type="submit"]')
  }

  get formId() {
    return this.getAttribute('form-id')
  }

  connectedCallback() {
    this._attachListeners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  async _onSubmit(event) {
    event.preventDefault()
    if (this.submitting) return
    if (this.errorMessage) {
      this.errorMessage.remove()
      this.errorMessage = null
    }
    const formData = new FormData(this.$form)
    const checkboxes = this.$form.querySelectorAll('input[type="checkbox"]')
    formData.forEach(function (value, key) {
      CF.customer.set(key, value)
    })

    Array.from(checkboxes).forEach((checkbox) => {
      if (checkbox.hasAttribute('as-tag')) {
        if (!!checkbox.checked) {
          CF.customer.addTag(checkbox.name)
        } else {
          CF.customer.removeTag(checkbox.name)
        }
      } else {
        CF.customer.set(checkbox.name, !!checkbox.checked)
      }
    })

    const payload = {}

    if (this.formId) {
      payload['formId'] = this.formId
    }
    try {
      this.submitting = true

      if (this._submitButton) {
        this._submitButton.setAttribute('loading', 'true')
      }
      await CF.customer.save(payload)
      // If inside a slideout close it
      if (this.$wrapperSlideout) {
        this.$wrapperSlideout.open = false
      }
    } catch (error) {
      this.errorMessage = document.createElement('span')
      this.errorMessage.innerHTML = `
        <small class="form__message color-error-red" tabindex="-1" autofocus>
          <svg aria-hidden="true" focusable="false" role="presentation">
            <use href="#icon-error" />
          </svg>
          ${error.message || window.localeStrings.somethingWentWrong}
        </small>
      `
      this.$form.prepend(this.errorMessage)
      this.errorMessage.scrollIntoView()
    } finally {
      this.submitting = false
      if (this._submitButton) {
        this._submitButton.removeAttribute('loading')
      }
    }
  }

  _attachListeners() {
    this.$form.addEventListener('submit', this._onSubmit.bind(this))
  }

  _removeListeners() {
    this.$form.removeEventListener('submit', this._onSubmit.bind(this))
  }
}

window.customElements.define('cf-form', CFForm)

class LangSelector extends HHBaseElement {
  constructor() {
    super();

    this.submitButton = this.querySelector(".js-submit-localization")
    this.countrySelector = this.querySelector(".js-country-selector")
    this.languageSelector = this.querySelector(".js-language-selector")
    this.form = this.querySelector("form")
    this.langHiddenInput = this.querySelector(".js-lang")

    this.submitButton.addEventListener("click", this.submit.bind(this))
    document.addEventListener('countryChanged', this.toggleLangSelector.bind(this))
  }

  onItemClick(event) {
    event.preventDefault();
    const lang = this.querySelector(".js-lang")
    const form = this.querySelector('form');
    lang.value = event.currentTarget.dataset.value;
    if (form) form.submit();
  }

  toggleLangSelector() {
    const country = this.countrySelector.querySelector('[aria-selected="true"]')?.innerText;
    if (country === "CA" || country === "Canada") {
      this.languageSelector.classList.remove("hidden")
    } else {
      this.languageSelector.classList.add("hidden")
    }
  }

  submit() {
    if (!this.languageSelector.classList.contains("hidden")) {
      if (window.location.href.indexOf('ca') > -1) {
        // if you're already on the canadian site, resubmit the form to be directed to the right language
        this.langHiddenInput.value = this.form.querySelector('[aria-selected="true"]')?.dataset.value
        this.form.submit()
      } else {
        const countryUrl = this.countrySelector.querySelector('[aria-selected="true"]')?.dataset?.href
        const lang = this.form.querySelector('[aria-selected="true"]')?.dataset.value
        window.location.href = `${countryUrl}${lang === 'fr' ? 'fr/' : ''}`
      }
    } else {
      const countryUrl = this.countrySelector.querySelector('[aria-selected="true"]')?.dataset?.href
      if (countryUrl) {
        window.location.href = countryUrl
      }
    }
  }
}

window.customElements.define('lang-selector', LangSelector);

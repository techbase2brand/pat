const selectors = {
  customerAddresses: '[data-customer-addresses]',
  addressCountrySelect: '[data-address-country-select]',
  addressContainer: '[data-address]',
  toggleAddressButton: 'button[aria-expanded]',
  cancelAddressButton: 'button[type="reset"]',
  deleteAddressButton: 'button[data-confirm-message]',
}

const attributes = {
  expanded: 'aria-expanded',
  confirmMessage: 'data-confirm-message',
}

class CustomerAddresses {
  constructor() {
    this.elements = this._getElements()
    if (Object.keys(this.elements).length === 0) return
    this._setupCountries()
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses)
    return container
      ? {
          container,
          addressContainer: container.querySelector(selectors.addressContainer),
          countrySelects: container.querySelectorAll(
            selectors.addressCountrySelect
          ),
        }
      : {}
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(
        'AddressCountryNew',
        'AddressProvinceNew',
        {
          hideElement: 'AddressProvinceContainerNew',
        }
      )
      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(
          `AddressCountry_${formId}`,
          `AddressProvince_${formId}`,
          {
            hideElement: `AddressProvinceContainer_${formId}`,
          }
        )
      })
    }
  }
}

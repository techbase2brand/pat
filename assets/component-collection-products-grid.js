class CollectionProductsGrid extends HHBaseElement {
  loading = false

  constructor() {
    super()
    this.$grid = this.querySelector('.collection-grid')
    this.$backdrop = this.querySelector('.js-backdrop')
    this._handleLoadMore = this._handleLoadMore.bind(this)
    this._handleFiltersChange = this._handleFiltersChange.bind(this)
    this._handleFilterFormSubmit = this._handleFilterFormSubmit.bind(this)
    this._handleClearAllClick = this._handleClearAllClick.bind(this)
    this._handleLocationPopState = this._handleLocationPopState.bind(this)
    this.$filtersForm = this.querySelector('[data-filters-form]')
    this.$filtersFormSubmitable = this.querySelector(
      '[data-filter-form-submitable]'
    )
    this.$slideoutContainer = document.querySelector(
      `[slideout-id="mobile-filters"]`
    )
  }

  connectedCallback() {
    this._attachListeners()
    this._setLoadMoreListners()
  }

  disconnectedCallback() {
    this._removeListeners()
  }

  get nextPageUrl() {
    return this.getAttribute('data-paginate-next')
  }

  set nextPageUrl(value) {
    return this.setAttribute('data-paginate-next', value)
  }

  get previousPageUrl() {
    return this.getAttribute('data-paginate-previous')
  }

  set previousPageUrl(value) {
    return this.setAttribute('data-paginate-previous', value)
  }

  async _fetchPage(nextUrl) {
    if (nextUrl) {
      const response = await fetch(nextUrl)
      const $page = document.createElement('div')
      $page.innerHTML = await response.text()
      const collectionGrid = $page.querySelector('collection-products-grid')
      return {
        products: $page.querySelectorAll(
          'collection-products-grid #collection-products-grid > *:not([data-load-more])'
        ),
        loadMoreButton: $page.querySelector(
          'collection-products-grid #collection-products-grid .collection-grid__load-more'
        ),
        paginateNext: collectionGrid.nextPageUrl,
        paginatePrevious: collectionGrid.previousPageUrl,
        filterContent: $page.querySelector('[data-filters-form]'),
        mobileFilterContent: $page.querySelector(
          '[data-filter-form-submitable]'
        ),
      }
    }

    throw new Error('No More Page to Load')
  }

  _addProductsAndCards(contents = []) {
    if (this.$loadMoreContainer) {
      this.$loadMoreContainer.before(...contents)
    } else {
      this.$grid.append(...contents)
    }
  }

  _renderPage(page, reset = false) {
    this.nextPageUrl = page.paginateNext
    this.previousPageUrl = page.paginatePrevious
    if (reset) {
      this.$grid.innerHTML = ''
      for (const item of page.products) {
        this.$grid.append(item)
      }
    } else {
      this._addProductsAndCards(page.products)
    }

    if (page.filterContent) {
      this.$filtersForm.innerHTML = page.filterContent.innerHTML
      this.$filtersFormSubmitable.innerHTML = page.mobileFilterContent.innerHTML
    }

    if (page.loadMoreButton) {
      this.$loadMoreContainer.remove()
      this.$grid.append(page.loadMoreButton)
      this._setLoadMoreListners()
    }
  }

  async _handleLoadMore(event) {
    event.preventDefault()
    try {
      if (this.loading) {
        return
      }
      this._setLoading(true)
      this.$loadMore.setAttribute('disabled', true)
      const nextPage = await this._fetchPage(this.nextPageUrl)
      this._renderPage(nextPage)
    } catch (error) {
      console.error(error)
    } finally {
      this._setLoading(false)
    }
  }

  _setLoadMoreListners() {
    if (this.$loadMore) {
      this.$loadMore.removeEventListener('click', this._handleLoadMore)
    }

    this.$loadMore = this.querySelector('[data-load-more]')
    this.$loadMoreContainer = this.querySelector('.collection-grid__load-more')

    if (this.$loadMore) {
      this.$loadMore.addEventListener('click', this._handleLoadMore)
    }
  }

  get filterFormData() {
    return new FormData(
      this._submitedFilterForm ? this.$filtersFormSubmitable : this.$filtersForm
    )
  }

  get filterQueryString() {
    return this._clearAll
      ? new URLSearchParams({
          sort_by: this.filterFormData.get('sort_by'),
        }).toString()
      : new URLSearchParams(this.filterFormData).toString()
  }

  async _handleFiltersChange(_, queryString) {
    try {
      if (this.$slideoutContainer) {
        this.$slideoutContainer.open = false
      }

      this._setLoading(true)
      if (!queryString) {
        window.history.pushState(
          {},
          '',
          `${window.location.pathname}?${this.filterQueryString}`
        )
      }
      const pageData = await this._fetchPage(
        `${window.location.pathname}?${queryString ?? this.filterQueryString}`
      )
      this._renderPage(pageData, true)
    } catch (error) {
      console.log(error)
    } finally {
      this._setLoading(false)
      this._submitedFilterForm = false
      this._clearAll = false
      this.$slideoutContainer.open = false
    }
  }

  _handleFilterFormSubmit(event) {
    event.preventDefault()
    this._submitedFilterForm = true
    this._handleFiltersChange()
  }

  _handleClearAllClick(event) {
    if (event.target.hasAttribute('data-clear-all')) {
      event.preventDefault()
      this._clearAll = true
      this._handleFiltersChange()
    }
  }

  _handleLocationPopState(event) {
    this._handleFiltersChange(event, window.location.search.split('?')[1])
  }

  _attachListeners() {
    this.$filtersForm?.addEventListener('change', this._handleFiltersChange)
    this.$filtersFormSubmitable?.addEventListener(
      'submit',
      this._handleFilterFormSubmit
    )
    this.addEventListener('click', this._handleClearAllClick)
    window.addEventListener('popstate', this._handleLocationPopState)
  }

  _removeListeners() {
    this.$filtersForm.removeEventListener('change', this._handleFiltersChange)
    this.$filtersFormSubmitable.removeEventListener(
      'submit',
      this._handleFilterFormSubmit
    )
    this.removeEventListener('click', this._handleClearAllClick)
    window.removeEventListener('popstate', this._handleLocationPopState)
  }

  _setLoading(loading) {
    this.loading = loading
    this._applyState()
  }

  _applyState() {
    this.$backdrop.classList[this.loading ? 'add' : 'remove']('visible')
    this.classList[this.loading ? 'add' : 'remove']('loading')
  }
}

window.customElements.define('collection-products-grid', CollectionProductsGrid)

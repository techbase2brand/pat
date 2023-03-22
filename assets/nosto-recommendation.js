class NostoRecommendations {
  constructor() {
    if (!window.nostojs) {
      throw new Error('Nostro Not initialized')
    }
    this._callback = this._callback.bind(this)
    this._errorCallback = this._errorCallback.bind(this)
    this._defferedPromise = new Deferred()

    window.addEventListener('DOMContentLoaded', () => {
      window.nostojs((api) => {
        api
          .createRecommendationRequest({ includeTagging: true })
          .setResponseMode('JSON_ORIGINAL')
          .load()
          .then(this._callback)
          .catch(this._errorCallback)
      })
    })
  }

  _callback(response) {
    this._nostoResponse = response
    this._loaded = true
    this._defferedPromise.resolve(this._nostoResponse)
  }

  _errorCallback(error) {
    this._defferedPromise.reject(error)
  }

  getRecommendation() {
    return new Promise(async (resolve, reject) => {
      if (this._loaded) {
        return resolve(this._nostoResponse)
      }
      try {
        await this._defferedPromise.promise
        return resolve(this._nostoResponse)
      } catch (error) {
        reject(error)
      }
    })
  }

  trackAddToCart(productId, placementID) {
    nostojs(function (api) {
      api.recommendedProductAddedToCart(productId, placementID)
    })
  }

  trackProductView(productId, placementID) {
    nostojs(function (api) {
      api
        .createRecommendationRequest()
        .setProducts([{ product_id: productId }], placementID)
        .load()
    })
  }
}

window.__NOSTO_RECOMMENDER__ = new NostoRecommendations()

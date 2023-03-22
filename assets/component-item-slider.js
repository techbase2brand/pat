// Item Slider
class ItemSlider extends HTMLElement {
  constructor() {
    super()

    const prevButton = '.item-slider .prev'
    const nextButton = '.item-slider .next'
    const sliderElement = '.item-slider .js-slider'

    window.addEventListener(
      'load',
      function () {
        var slider = tns({
          container: sliderElement,
          items: 2,
          mode: 'carousel',
          slideBy: 1,
          autoplay: false,
          fixedWidth: 320,
          axis: 'horizontal',
          nav: false,
          loop: false,
          gutter: 60,
          prevButton,
          nextButton,
          onInit: (data) => {
            let slideCountOffset = 0

            if (window.innerWidth > 1200) {
              slideCountOffset = 2
            }

            let { controlsContainer, displayIndex, slideCount } = data
            // Inject slider count into slide controls (subtract by amount of slides visible starting from 0)
            let countContainer = document.querySelector(
              '.item-slider .slider-nav ul .slide-count p'
            )
            countContainer.innerHTML = `0${displayIndex} / 0${
              slideCount - slideCountOffset
            }`
          },

          responsive: {
            768: {
              fixedWidth: false,
            },
            1200: {
              items: 3,
              slideBy: 1,
              gutter: 0,
              fixedWidth: 650,
            },
          },
        })

        slider.events.on('transitionEnd', (data) => {
          let slideCountOffset = 0
          if (window.innerWidth > 1200) {
            slideCountOffset = 2
          }

          let { controlsContainer, displayIndex, slideCount } = data
          // Inject slider count into slide controls (subtract by amount of slides visible starting from 0)
          let countContainer = document.querySelector(
            '.item-slider .slider-nav ul .slide-count p'
          )

          countContainer.innerHTML = `0${displayIndex} / 0${
            slideCount - slideCountOffset
          }`
        })
      },
      false
    )
  }
}

window.customElements.define('item-slider', ItemSlider)

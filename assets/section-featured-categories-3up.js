document.addEventListener('DOMContentLoaded', function () {
  const wrapper = document.querySelector('.js-slider-controls-wrapper')

  const handleSliderControlsTop = () => {
    const slider = document.querySelectorAll(
      '.js-featured-collection-slider'
    )[0]

    if (slider) {
      const image = slider.querySelector(
        '.js-featured-collection-three-up-image'
      )

      const top = image.clientHeight

      wrapper.style.top = `${top + 25}px`
    }
  }

  handleSliderControlsTop()

  window.addEventListener('resize', () => handleSliderControlsTop())
})

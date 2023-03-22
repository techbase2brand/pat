document.addEventListener('DOMContentLoaded', function () {
  const target = document.querySelector(
    '.js-comparison-slider-3up-text-container'
  )
  const carouselButtons = document.querySelector(
    '.js-carousel-buttons-container'
  )

  const addStyleToCarouselButtons = () => {
    const makeup = (target.parentElement.offsetHeight - target.offsetHeight) / 2

    if (window.innerWidth > 767) {
      carouselButtons.style = `top: ${
        target.offsetHeight + makeup + 40
      }px; left: ${(target.parentElement.offsetWidth + 60) * -1}px;`
    } else {
      carouselButtons.style = `top: -3rem; left: unset; right: 0;`
    }
  }

  addStyleToCarouselButtons()

  window.onresize = addStyleToCarouselButtons
})

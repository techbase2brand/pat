// Fullscreen Slider
window.addEventListener('DOMContentLoaded', function () {
  // fade in text
  let allSlideTextSections = [
    ...document.querySelectorAll('.fullscreen-slider .init-hidden'),
  ]
  allSlideTextSections.map((section) => section.classList.remove('init-hidden'))

  const parentElement = document.querySelector('.fullscreen-slider')

  // Handle scroll to func

  parentElement.addEventListener('click', function (e) {
    if (e.target.classList.contains('fullscreen-slider__scroll-to-button')) {
      let headerOffset = parseFloat(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--header-spacer')
          .replace('px', '')
      )

      window.scrollTo({
        top:
          window.scrollY +
          parentElement.offsetHeight +
          parentElement.getBoundingClientRect().top -
          headerOffset,
        behavior: 'smooth',
      })
    }

    // handle play/pause logic on video slides
    if (e.target.classList.contains('play-video')) {
      let videoComponent =
        e.target.parentElement.parentElement.previousElementSibling

      // hide clicked button li
      e.target.parentElement.classList.add('hidden')

      // show pause button
      videoComponent.parentElement
        .querySelector('.pause-video')
        .parentElement.classList.remove('hidden')

      videoComponent.setAttribute('playing', true)
    } else if (e.target.classList.contains('pause-video')) {
      let videoComponent =
        e.target.parentElement.parentElement.previousElementSibling

      // hide clicked button li
      e.target.parentElement.classList.add('hidden')

      // show play button
      videoComponent.parentElement
        .querySelector('.play-video')
        .parentElement.classList.remove('hidden')

      videoComponent.setAttribute('playing', false)
    }
  })
})

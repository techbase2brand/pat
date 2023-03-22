document.addEventListener('DOMContentLoaded', function () {
  checkPage()

  function checkPage() {
    let loginContent = document.querySelector('#login')
    let resetContent = document.querySelector('.recover')

    if (window.location.href.includes('recover')) {
      loginContent.classList.add('hidden')
      resetContent.classList.remove('hidden')
    } else {
      loginContent.classList.remove('hidden')
      resetContent.classList.add('hidden')
    }
  }

  window.addEventListener('hashchange', function () {
    window.scrollTo(0, 0)

    checkPage()
  })
})

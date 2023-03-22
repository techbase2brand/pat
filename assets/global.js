// HH - Sam

// Tel Input - only allow numbers

let allTelInputs = [...document.querySelectorAll('input[type="tel"]')]

allTelInputs.forEach((input) => {
  input.addEventListener('keyup', function (e) {
    input.value = e.target.value
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*?)\..*/g, '$1')
      .replace(/^0[^.]/, '0')
  })
})

const allInputs = [...document.querySelectorAll('.js-input-container input')]
// Change border color based on focus

allInputs.forEach((input) => {
  input.addEventListener('focus', function () {
    if (!input.parentElement.classList.contains('disabled')) {
      if (input.previousElementSibling) {
        input.previousElementSibling.classList.add('active')
      }

      input.parentElement.classList.add('active')
    }
  })

  if (!!input.value) {
    input.parentElement.classList.add('active')
  }
})

allInputs.forEach((input) =>
  input.addEventListener('focusout', function () {
    if (input.value === '') {
      input.parentElement.classList.remove('active')
    }
  })
)

window.handleize = function (str) {
  str = str.toLowerCase()

  var toReplace = ['"', "'", '\\', '(', ')', '[', ']']

  // For the old browsers
  for (var i = 0; i < toReplace.length; ++i) {
    str = str.replace(toReplace[i], '')
  }

  str = str.replace(/\W+/g, '-')

  if (str.charAt(str.length - 1) == '-') {
    str = str.replace(/-+\z/, '')
  }

  if (str.charAt(0) == '-') {
    str = str.replace(/\A-+/, '')
  }

  return str
}

window.__CART__CONTROLLER__ = {
  async add(items = [], hidePopup) {
    const response = await fetch(`${__GLOBAL__.routes.rootUrl}/cart/add.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    })

    const data = await response.json()
    if (response.ok) {
      if (!hidePopup) {
        document.dispatchEvent(
          new CustomEvent('cart-popup::open', { detail: data })
        )
      }
    } else {
      alert(data.description)
      throw new Error(data.description)
    }

    return data
  },

  async update(updates) {
    const response = await fetch(
      `${__GLOBAL__.routes.rootUrl}/cart/update.js`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      }
    )

    const data = await response.json()
    if (!response.ok) {
      alert(data.description)
      throw new Error(data.description)
    }

    return data
  },
}

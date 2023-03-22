let allMMTriggers = [
  ...document.querySelectorAll(
    '.header__nav--bottom .bottom-nav__nav-list-item .js-mm-toggle'
  ),
]

function handleFirstAndLastMenuElements(last, tabBackElement, currentIndex) {
  if (tabBackElement) {
    tabBackElement.addEventListener('keydown', function (e) {
      let isTabPressed = e.key === 'Tab' || e.keyCode === 9
      if (!isTabPressed) {
        return
      }

      if (e.shiftKey) {
        // focus on nav link
        let previousMenuId = currentIndex - 1
        let previousMenuItem =
          allMMTriggers[
            previousMenuId === allMMTriggers.length ? 4 : previousMenuId
          ]

        // need this to select right item
        setTimeout(function () {
          previousMenuItem.focus()
        }, 10)
      }
    })
  }

  last.addEventListener('keydown', function (e) {
    let isTabPressed = e.key === 'Tab' || e.keyCode === 9
    if (!isTabPressed) {
      return
    }

    if (e.shiftKey) {
      // do nothing
    } else {
      // focus next menu item
      let nextMenuId = currentIndex
      let nextMenuItem = allMMTriggers[nextMenuId]

      nextMenuItem.focus()
    }
  })
}

allMMTriggers.forEach((trigger) =>
  trigger.addEventListener('keydown', function (e) {
    let isTabPressed = e.key === 'Tab' || e.keyCode === 9

    if (!isTabPressed) {
      return
    }

    if (!this.contains(e.target)) {
      return
    }

    if (e.shiftKey) {
      // do nothing
    } else {
      // move focus to first element in megamenu

      let targetMenuIndex = allMMTriggers.indexOf(e.target)
      let targetMenu = document.querySelector(
        '#' + allMMTriggers[targetMenuIndex].href.split('#')?.[1]
      )

      if (!targetMenu) {
        return
      }

      let allFocusItems = targetMenu.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      let firstItem =
        targetMenu.querySelector('.megamenu__link-with-images:first-child') ||
        targetMenu.querySelector(
          '.megamenu__menu-first-level-ul > *:first-child'
        )

      let lastItem = allFocusItems[allFocusItems.length - 1]

      let tabBackElement =
        targetMenu.querySelector(
          '.megamenu__menu-first-level-ul > *:first-child > a'
        ) ||
        targetMenu.querySelector(
          '.megamenu__menu-first-level-ul > *:first-child > a'
        ) ||
        firstItem

      firstItem.focus()

      handleFirstAndLastMenuElements(lastItem, tabBackElement, targetMenuIndex)
    }
  })
)

function handleBottomNavOverflow() {
  const nav = document.querySelector('.js-bottom-nav__nav')
  const navList = document.querySelector('.js-bottom-nav__nav-list')
  nav.classList.toggle('no-scroll', navList.scrollWidth <= nav.offsetWidth)
}

function handleScrollHeaderNav () {
  const arrowLeft = document.querySelector('.js-arrow-left');
  const arrowRight = document.querySelector('.js-arrow-right');
  let headerMenu = document.querySelector('.js-bottom-nav__nav-list')

  const debounce = (fn) => {
    let frame;
    return (...params) => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      frame = requestAnimationFrame(() => {
        fn(...params);
      });
    };
  };

  arrowLeft.addEventListener('click', () => {
    headerMenu.scrollLeft -= 85;
  })
  arrowRight.addEventListener('click', () => {
    headerMenu.scrollLeft += 85;
  });

  const setNavScrollX = () => {
    headerMenu.dataset.scrollX = headerMenu.scrollLeft;
    headerMenu.dataset.scrollPosition =
      headerMenu.scrollLeft === 0
        ? "start"
        : headerMenu.scrollLeft < headerMenu.scrollWidth - headerMenu.clientWidth
        ? "middle"
        : "end";

    if( headerMenu.getAttribute('data-scroll-position') === 'end' ) {
      arrowRight.classList?.add('hidden');
    } else if ( headerMenu.getAttribute('data-scroll-position') === 'start' ) {
      arrowLeft.classList?.add('hidden');
    } else {
      arrowLeft.classList?.remove('hidden');
      arrowRight.classList?.remove('hidden');
    }
  };

  headerMenu.addEventListener("scroll", debounce(setNavScrollX), { passive: true });
  setNavScrollX();
}
document.addEventListener('DOMContentLoaded', () => {
  handleBottomNavOverflow();
  handleScrollHeaderNav();
})

window.addEventListener('resize', () => {
  handleBottomNavOverflow()
})


class Megamenu extends HTMLElement {
  constructor() {
    super()
  }

  open() {
    this.classList.add('active')
    this.setAttribute('aria-hidden', false)
  }

  close() {
    this.classList.remove('active')
    this.setAttribute('aria-hidden', true)
  }
}

window.customElements.define('section-megamenu', Megamenu)

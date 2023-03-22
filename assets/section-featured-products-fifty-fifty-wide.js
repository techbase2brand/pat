class FeaturedProductsFiftyFiftyWide extends HHBaseElement {
  constructor() {
    super()

    this.total = this.dataset.length
    this.prevArrows = this.querySelectorAll('.arrow-nav-inner button.prev')
    this.nextArrows = this.querySelectorAll('.arrow-nav-inner button.next')
    this.blocks = [
      ...this.querySelectorAll('.featured-products-fifty-fifty-wide'),
    ]

    this.touchstartX = 0
    this.touchstartY = 0
    this.touchendX = 0
    this.touchendY = 0
    this.touchOffset = 50

    this.addEventListener(
      'touchstart',
      (event) => {
        this.touchstartX = event.pageX
        this.touchstartY = event.pageY
      },
      false
    )

    this.addEventListener(
      'touchend',
      (event) => {
        this.touchendX = event.pageX
        this.touchendY = event.pageY
        this.handleGesure()
      },
      false
    )

    this.prevArrows.forEach((item) => {
      item.addEventListener(
        'click',
        (e) => {
          let index = Number(
            item.closest('.featured-products-fifty-fifty-wide').dataset.index
          )
          this.prevBlock(index)
        },
        false
      )
    })

    this.nextArrows.forEach((item) => {
      item.addEventListener(
        'click',
        (e) => {
          let index = Number(
            item.closest('.featured-products-fifty-fifty-wide').dataset.index
          )
          this.nextBlock(index)
        },
        false
      )
    })
  }

  handleGesure() {
    const activeBlock = this.querySelector(
      '.featured-products-fifty-fifty-wide.active'
    )
    const index = Number(activeBlock.dataset.index)
    if (this.touchendX < this.touchstartX - this.touchOffset) {
      this.nextBlock(index)
    }
    if (this.touchendX - this.touchOffset > this.touchstartX) {
      this.prevBlock(index)
    }
  }

  prevBlock(index) {
    if (index > 0) {
      index -= 1
    } else {
      index = this.total - 1
    }
    this.showBloc(index)
  }

  nextBlock(index) {
    if (index < this.total - 1) {
      index += 1
    } else {
      index = 0
    }
    this.showBloc(index)
  }

  showBloc(index) {
    this.blocks.forEach((item, i) => {
      item.classList.remove('active')
      if (i === index) {
        item.classList.add('active')
      }
    })
  }
}

window.customElements.define(
  'featured-products-fifty-fifty-wide',
  FeaturedProductsFiftyFiftyWide
)

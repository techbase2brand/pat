import { externalVideoEmbedSrc } from './helper-functions.js'

class AdaptiveVideo extends HHBaseElement {
  constructor() {
    super()
    this.initialize(this.dataset)
    this.type = this.dataset.type
    this.video =
      this.dataset.encode === 'true'
        ? JSON.parse(atob(this.dataset.video || 'e30='))
        : this.dataset.video
    this.url = this.dataset.url

    this.captionSrc = this.dataset.captionSrc
    this.captionSrclang = this.dataset.captionSrclang
    this.captionLabel = this.dataset.captionLabel

    this.url = this.dataset.url
    this.autoplay = this.dataset.autoplay === 'true'
    this.loop = this.getAttribute('loop') === 'true'
    this.controlsPosition = this.dataset.controlsPosition
    this.playsInline = this.dataset.playsInline === 'true'
    this.id = this.video?.external_id ?? this.dataset.id
    this.host = this.dataset.host || this.video?.host
    this.alt = this.dataset.alt || this.video?.alt
    this.playAriaLabel = this.dataset.playVideo
    this.pauseAriaLavel = this.dataset.pauseVideo
    this.aspectRatio =
      (this.dataset.aspectRatio === 'wide' && 16 / 9) ||
      (this.dataset.aspectRatio === 'full' && 4 / 3) ||
      parseFloat(this.dataset.aspectRatio) ||
      this.video?.aspect_ratio ||
      16 / 9
    this.posterImage = this.dataset.posterImage
    this.customControls = this.dataset.customControls === 'true'
    this.disabled = this.dataset.controlsDisabled === true
    this.videoPlayer = null

    this.generateControls = this.generateControls.bind(this)
    this._addControlListeners = this._addControlListeners.bind(this)
    this._playVideo = this._playVideo.bind(this)
    this._pauseVideo = this._pauseVideo.bind(this)

    this.attachShadow({ mode: 'open' })
    this.render()
    this._addControlListeners()

    if (this.autoplay && this.customControls) {
      this._playVideo()
    }
  }

  initialize(data) {
    this.type = data.type
    this.video =
      data.encode === 'true'
        ? JSON.parse(atob(data.video || 'e30='))
        : data.video
    this.url = data.url
    this.autoplay = data.autoplay === 'true'
    this.id = data.id || JSON.parse(atob(data.video || 'e30=')).external_id
    this.host = data.host || this.video?.host
    this.alt = data.alt || this.video?.alt
    this.aspectRatio =
      (data.aspectRatio === 'wide' && 16 / 9) ||
      (data.aspectRatio === 'full' && 4 / 3) ||
      parseFloat(data.aspectRatio) ||
      this.video?.aspect_ratio ||
      16 / 9
    this.posterImage = data.posterImage

    this.style.paddingTop = `${100 / this.aspectRatio}%`
  }

  doPlayClick() {
    const videoPlayButton = this.shadowRoot.querySelector('.video-play-button')
    if (videoPlayButton) {
      videoPlayButton.addEventListener('click', (e) => {
        let t = document.createElement('iframe')
        t.setAttribute('data-ot-ignore', '')
        t.classList.add('optanon-category-C0004')
        t.setAttribute(
          'src',
          externalVideoEmbedSrc(this.host, this.id, this.autoplay) +
            '&autoplay=1'
        )
        t.setAttribute('id', 'video-element')
        t.setAttribute('frameborder', '0')
        t.setAttribute(
          'allow',
          'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
        )
        t.setAttribute('allowfullscreen', 'allowfullscreen')
        t.setAttribute('loading', 'lazy')
        t.setAttribute('title', `${this.alt}`)
        videoPlayButton.parentNode.replaceChild(t, videoPlayButton)
      })
    }
  }

  updateVideo(data) {
    this.initialize(data)
    this.render()
  }

  generateStyles() {
    return `
      <style>
        :host {
          display: block;
          aspect-ratio: ${this.aspectRatio};
          position: relative;
        }
        #video-element,
        #video-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        #video-element:hover ~ .video-player-controls ul .play-video,
        #video-element:hover ~ .video-player-controls ul .pause-video,
        .pause-video:focus,
        .play-video:focus {
          opacity: 1;
        }

        .video-player-controls ul {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .video-player-controls.top-right {
          display: block;
          text-align: right;
          width: 100%;
          height: auto;
          bottom: auto;
        }
        .with-border-radius {
          border-radius: 370px 370px 0px 0px;
        }

        .video-player-controls.top-right ul {
          padding: var(--gutter) var(--gutter) 0 0;
        }

        .video-player-controls.bottom-center {
          align-items: flex-end;
          height: auto;
          top: auto;
          background: red;
          z-index: 1000000;
          display: none;
        }
        .video-player-controls.bottom-center ul {
          padding: 0 0 calc(var(--gutter) * 1.1);
        }
        .hidden {
          display: none;
        }

        .play-video svg, .pause-video svg {
          width: 30px;
          height: 30px;
          overflow: visible;
        }
        .play-video svg, .pause-video path {
          fill: #fff;
        }
        .play-video {
          background-repeat: no-repeat;
          background-position: center;
          border: none;
          background-color: transparent;
          background-size: contain;
          background: radial-gradient(50% 50% at 50% 50%, rgba(62, 43, 46, 0.5) 0%, rgba(62, 43, 46, 0) 100%);
          opacity: 0;
          transition: 0.25s;
          cursor: pointer;
          position: relative;
          padding: 10px;
          border-radius: 50%;
        }
        .pause-video {
          background-repeat: no-repeat;
          background-position: center;
          border: none;
          background-color: transparent;
          background-size: contain;
          background: radial-gradient(50% 50% at 50% 50%, rgba(62, 43, 46, 0.5) 0%, rgba(62, 43, 46, 0) 100%);
          opacity: 0;
          transition: 0.25s;
          cursor: pointer;
          position: relative;
          padding: 10px;
          border-radius: 50%;
        }
        .video-player-controls:hover .play-video,
        .video-player-controls:hover .pause-video,
        .pause-video:focus,
        .play-video:focus {
          opacity: 1;
        }
        #video-container {
          background-color: #000;
        }
        .video-thumbnail-overlay-image {
          background-size: contain;
          -moz-background-size: contain;
          -webkit-background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
          width: 100%;
          height: 100%;
          position: absolute;
        }
        .video-play-button {
          cursor: pointer;
          border: none;
          background-color: transparent;
          padding: 0;
          position: absolute;
          left: 50%;
          top: 50%;
          width: 68px;
          height: 48px;
          margin-left: -34px;
          margin-top: -24px;
          -webkit-transition: opacity .25s cubic-bezier(0,0,0.2,1);
          transition: opacity .25s cubic-bezier(0,0,0.2,1);
          z-index: 1;
        }
        .video-play-button svg {
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
        }
        .video-play-button-bg {
          fill: #f00;
          fill-opacity: 1;
          transition: fill .1s cubic-bezier(0.4,0,1,1),fill-opacity .1s cubic-bezier(0.4,0,1,1);
        }
        @media(max-width: 767px) {
          .pause-video,
          .play-video {
            opacity: 1;
          }
        }
      </style>
    `
  }

  generateVideoMarkup() {
    let sources = ''
    let captions = ''

    if (this.type === 'url') {
      sources = `<source src="${this.url}" type="video/mp4"></source>`
    } else if (this.type === 'video') {
      for (const source of this.video.sources) {
        sources += `<source src="${source.url}" type="${source.mime_type}"></source>`
      }
    }

    if (this.captionSrc && this.captionSrc && this.captionLabel) {
      captions += `<track src="${this.captionSrc}" kind="captions" srclang="${this.captionSrclang}" label="${this.captionLabel}" >`
    }

    /*
      the data-ot-ignore attribute is used to prevent the OneTrust cookie settings function from blocking the src attr update in this iframe

      documentation on this can be found under development notes in the OneTrust page in Notion
    */

    let markup = `
      <video
        id="video-element"
        ${this.customControls && !this.disabled && 'controls="controls"'}
        ${this.autoplay && `autoplay="autoplay"`}
        preload="none"
        muted="muted"
        aria-label="${this.alt}"
        ${(this.posterImage && `poster="${this.posterImage}"`) || ''}
        ${(this.loop && `loop="true"`) || ''}
        ${(this.playsInline && `playsinline`) || ''}
        ${
          this.dataset.withBorderRadius === 'true' &&
          'class="with-border-radius"'
        }
      >
        ${sources}
        ${captions}
        ${
          (this.posterImage &&
            `<img src="${this.posterImage}" alt="${this.alt}">`) ||
          ''
        }
      </video>
    `

    if (this.customControls) {
      markup += `${this.generateControls()}`
    }

    return markup
  }

  generateControls() {
    let markup

    markup = `<div class="video-player-controls ${
      (this.controlsPosition && this.controlsPosition) || ''
    }">
      <ul>
        <li>
          <button class="play-video" aria-label="${this.playAriaLabel}">
            <svg width="18" height="30" viewBox="0 0 18 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.3999 14.8923L-7.35208e-05 29.7846L-7.3e-05 14.8923L-7.24792e-05 -9.50721e-07L17.3999 14.8923Z"
                fill="#FFFBF7" />
            </svg>
          </button>
        </li>
        <li>
          <button class="pause-video" aria-label="${this.pauseAriaLabel}">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 25 25">
              <path fill="currentColor" d="M4.736 2.318h5.504v20H4.736zm9.632 0h5.504v20h-5.504z"/>
            </svg>
          </button>
        </li>
      </ul>
      </div>`

    return markup
  }

  generateIframeContainer() {
    return `
      <div id="video-container">
        <div class="video-thumbnail-overlay-image" style="background-image: url(${this.posterImage});"></div>
        <button class="video-play-button" aria-label="Play">
          <svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%">
            <path class="video-play-button-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
            <path d="M 45,24 27,14 27,34" fill="#fff"></path>
          </svg>
        </button>
      </div>
    `
  }

  generateIframeMarkup() {
    return `
      <iframe
        id="video-element"
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen="allowfullscreen"
        loading="lazy"
        src="${externalVideoEmbedSrc(this.host, this.id, this.autoplay)}"
        title="${this.alt}">
      </iframe>
    `
  }

  show() {
    this.style.display = 'block'
  }

  hide() {
    this.style.display = 'none'
  }

  _showPauseButton () {
    if (this.customControls) {
      this.playButton.classList.add('hidden')
      this.pauseButton.classList.remove('hidden')
    }
  }

  _showPlayButton () {
    if (this.customControls) {
      this.playButton.classList.remove('hidden')
      this.pauseButton.classList.add('hidden')
    }
  }

  _playVideo() {
    this._showPauseButton()
    return this.videoPlayer.play()
  }

  _pauseVideo() {
    this._showPlayButton()
    return this.videoPlayer.pause()
  }

  _addControlListeners() {
    this.videoPlayer = this.shadowRoot.querySelector('video')

    this.playButton = this.shadowRoot.querySelector('.play-video')
    this.pauseButton = this.shadowRoot.querySelector('.pause-video')

    this.videoPlayer.addEventListener('play', () => {
      this._showPauseButton()
    })

    this.videoPlayer.addEventListener('pause', () => {
      this._showPlayButton()
    })

    if (this.playButton)
      this.playButton.addEventListener('click', this._playVideo)
    if (this.pauseButton)
      this.pauseButton.addEventListener('click', this._pauseVideo)
  }

  render() {
    this.shadowRoot.innerHTML = `
      ${this.generateStyles()}
      ${
        ['hosted_url', 'external_video'].includes(this.type)
          ? this.generateIframeContainer()
          : this.generateVideoMarkup()
      }
    `
    this.doPlayClick()
  }

  static get observedAttributes() {
    return ['playing']
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'playing') {
      if (newValue === 'false') {
        this._pauseVideo()
      } else {
        this._playVideo()
      }
    }
  }
}

window.customElements.define('adaptive-video', AdaptiveVideo)

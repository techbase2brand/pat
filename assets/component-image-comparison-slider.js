const template = document.createElement("template");

// Styling range input thumbs requires you to separately define the CSS rules
// for different browsers. We store them once here for ease of maintenance.
const thumbStyles = `
  background-color: var(--thumb-background-color);
  background-image: var(--thumb-background-image);
  background-size: 90%;
  background-position: center center;
  background-repeat: no-repeat;
  border-radius: var(--thumb-radius);
  border: var(--thumb-border-size) var(--thumb-border-color) solid;
  color: var(--thumb-border-color);
  width: 153px;
  height: 20px;
`;

const thumbFocusStyles = `
  box-shadow: 0px 0px 0px var(--focus-width) var(--focus-color);
`;

const thumbSvgWidth = 4;

// Since the code below is a template string literal, it will not be minified or
// transpiled
template.innerHTML = /*html*/`
  <style>
    :host {
      --exposure: 50%;
      --thumb-background-color: transparent;
      --thumb-background-image: url("data:image/svg+xml,%3Csvg width='153' height='11' viewBox='0 0 153 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.636162 10V0.899999H4.90016C5.99216 0.899999 6.82416 1.11667 7.39616 1.55C7.96816 1.97467 8.25416 2.54667 8.25416 3.266C8.25416 3.75133 8.1415 4.16733 7.91616 4.514C7.69083 4.852 7.3875 5.11633 7.00616 5.307C6.6335 5.489 6.22616 5.58 5.78416 5.58L6.01816 5.112C6.5295 5.112 6.98883 5.20733 7.39616 5.398C7.8035 5.58 8.12416 5.84867 8.35816 6.204C8.60083 6.55933 8.72216 7.00133 8.72216 7.53C8.72216 8.31 8.42316 8.91667 7.82516 9.35C7.22716 9.78333 6.33883 10 5.16016 10H0.636162ZM2.32616 8.674H5.05616C5.68883 8.674 6.17416 8.57 6.51216 8.362C6.85016 8.154 7.01916 7.82033 7.01916 7.361C7.01916 6.91033 6.85016 6.581 6.51216 6.373C6.17416 6.15633 5.68883 6.048 5.05616 6.048H2.19616V4.735H4.71816C5.3075 4.735 5.75816 4.631 6.07016 4.423C6.39083 4.215 6.55116 3.903 6.55116 3.487C6.55116 3.06233 6.39083 2.746 6.07016 2.538C5.75816 2.33 5.3075 2.226 4.71816 2.226H2.32616V8.674Z' fill='%23FFFBF7'/%3E%3Cpath d='M13.3728 10.091C12.6015 10.091 11.9255 9.93933 11.3448 9.636C10.7728 9.324 10.3265 8.89933 10.0058 8.362C9.69381 7.82467 9.53781 7.21367 9.53781 6.529C9.53781 5.83567 9.68948 5.22467 9.99281 4.696C10.3048 4.15867 10.7295 3.73833 11.2668 3.435C11.8128 3.13167 12.4325 2.98 13.1258 2.98C13.8018 2.98 14.4041 3.12733 14.9328 3.422C15.4615 3.71667 15.8775 4.13267 16.1808 4.67C16.4841 5.20733 16.6358 5.84 16.6358 6.568C16.6358 6.63733 16.6315 6.71533 16.6228 6.802C16.6228 6.88867 16.6185 6.971 16.6098 7.049H10.8248V5.97H15.7518L15.1148 6.308C15.1235 5.90933 15.0411 5.55833 14.8678 5.255C14.6945 4.95167 14.4561 4.71333 14.1528 4.54C13.8581 4.36667 13.5158 4.28 13.1258 4.28C12.7271 4.28 12.3761 4.36667 12.0728 4.54C11.7781 4.71333 11.5441 4.956 11.3708 5.268C11.2061 5.57133 11.1238 5.931 11.1238 6.347V6.607C11.1238 7.023 11.2191 7.39133 11.4098 7.712C11.6005 8.03267 11.8691 8.27967 12.2158 8.453C12.5625 8.62633 12.9611 8.713 13.4118 8.713C13.8018 8.713 14.1528 8.65233 14.4648 8.531C14.7768 8.40967 15.0541 8.219 15.2968 7.959L16.1678 8.96C15.8558 9.324 15.4615 9.60567 14.9848 9.805C14.5168 9.99567 13.9795 10.091 13.3728 10.091Z' fill='%23FFFBF7'/%3E%3Cpath d='M18.1577 10V2.668C18.1577 1.94 18.3701 1.35933 18.7947 0.926C19.2281 0.484 19.8434 0.263 20.6407 0.263C20.9267 0.263 21.1954 0.293333 21.4467 0.353999C21.7067 0.414666 21.9234 0.51 22.0967 0.64L21.6547 1.862C21.5334 1.76667 21.3947 1.69733 21.2387 1.654C21.0827 1.602 20.9224 1.576 20.7577 1.576C20.4197 1.576 20.1641 1.67133 19.9907 1.862C19.8174 2.044 19.7307 2.32133 19.7307 2.694V3.474L19.7827 4.202V10H18.1577ZM17.0137 4.41V3.11H21.6417V4.41H17.0137Z' fill='%23FFFBF7'/%3E%3Cpath d='M25.494 10.091C24.7833 10.091 24.1507 9.93933 23.596 9.636C23.0413 9.324 22.6037 8.89933 22.283 8.362C21.9623 7.82467 21.802 7.21367 21.802 6.529C21.802 5.83567 21.9623 5.22467 22.283 4.696C22.6037 4.15867 23.0413 3.73833 23.596 3.435C24.1507 3.13167 24.7833 2.98 25.494 2.98C26.2133 2.98 26.8503 3.13167 27.405 3.435C27.9683 3.73833 28.406 4.15433 28.718 4.683C29.0387 5.21167 29.199 5.827 29.199 6.529C29.199 7.21367 29.0387 7.82467 28.718 8.362C28.406 8.89933 27.9683 9.324 27.405 9.636C26.8503 9.93933 26.2133 10.091 25.494 10.091ZM25.494 8.7C25.8927 8.7 26.248 8.61333 26.56 8.44C26.872 8.26667 27.1147 8.01533 27.288 7.686C27.47 7.35667 27.561 6.971 27.561 6.529C27.561 6.07833 27.47 5.69267 27.288 5.372C27.1147 5.04267 26.872 4.79133 26.56 4.618C26.248 4.44467 25.897 4.358 25.507 4.358C25.1083 4.358 24.753 4.44467 24.441 4.618C24.1377 4.79133 23.895 5.04267 23.713 5.372C23.531 5.69267 23.44 6.07833 23.44 6.529C23.44 6.971 23.531 7.35667 23.713 7.686C23.895 8.01533 24.1377 8.26667 24.441 8.44C24.753 8.61333 25.104 8.7 25.494 8.7Z' fill='%23FFFBF7'/%3E%3Cpath d='M30.4929 10V3.058H32.0399V4.969L31.8579 4.41C32.0659 3.942 32.3909 3.58667 32.8329 3.344C33.2836 3.10133 33.8426 2.98 34.5099 2.98V4.527C34.4406 4.50967 34.3756 4.501 34.3149 4.501C34.2542 4.49233 34.1936 4.488 34.1329 4.488C33.5176 4.488 33.0279 4.67 32.6639 5.034C32.2999 5.38933 32.1179 5.92233 32.1179 6.633V10H30.4929Z' fill='%23FFFBF7'/%3E%3Cpath d='M38.8279 10.091C38.0566 10.091 37.3806 9.93933 36.7999 9.636C36.2279 9.324 35.7816 8.89933 35.4609 8.362C35.1489 7.82467 34.9929 7.21367 34.9929 6.529C34.9929 5.83567 35.1446 5.22467 35.4479 4.696C35.7599 4.15867 36.1846 3.73833 36.7219 3.435C37.2679 3.13167 37.8876 2.98 38.5809 2.98C39.2569 2.98 39.8593 3.12733 40.3879 3.422C40.9166 3.71667 41.3326 4.13267 41.6359 4.67C41.9393 5.20733 42.0909 5.84 42.0909 6.568C42.0909 6.63733 42.0866 6.71533 42.0779 6.802C42.0779 6.88867 42.0736 6.971 42.0649 7.049H36.2799V5.97H41.2069L40.5699 6.308C40.5786 5.90933 40.4963 5.55833 40.3229 5.255C40.1496 4.95167 39.9113 4.71333 39.6079 4.54C39.3133 4.36667 38.9709 4.28 38.5809 4.28C38.1823 4.28 37.8313 4.36667 37.5279 4.54C37.2333 4.71333 36.9993 4.956 36.8259 5.268C36.6613 5.57133 36.5789 5.931 36.5789 6.347V6.607C36.5789 7.023 36.6743 7.39133 36.8649 7.712C37.0556 8.03267 37.3243 8.27967 37.6709 8.453C38.0176 8.62633 38.4163 8.713 38.8669 8.713C39.2569 8.713 39.6079 8.65233 39.9199 8.531C40.2319 8.40967 40.5093 8.219 40.7519 7.959L41.6229 8.96C41.3109 9.324 40.9166 9.60567 40.4399 9.805C39.9719 9.99567 39.4346 10.091 38.8279 10.091Z' fill='%23FFFBF7'/%3E%3Cpath d='M120.273 10L124.368 0.899999H126.032L130.14 10H128.372L124.849 1.797H125.525L122.015 10H120.273ZM122.158 7.894L122.613 6.568H127.527L127.982 7.894H122.158Z' fill='%23FFFBF7'/%3E%3Cpath d='M131.103 10V2.668C131.103 1.94 131.315 1.35933 131.74 0.926C132.173 0.484 132.788 0.263 133.586 0.263C133.872 0.263 134.14 0.293333 134.392 0.353999C134.652 0.414666 134.868 0.51 135.042 0.64L134.6 1.862C134.478 1.76667 134.34 1.69733 134.184 1.654C134.028 1.602 133.867 1.576 133.703 1.576C133.365 1.576 133.109 1.67133 132.936 1.862C132.762 2.044 132.676 2.32133 132.676 2.694V3.474L132.728 4.202V10H131.103ZM129.959 4.41V3.11H134.587V4.41H129.959Z' fill='%23FFFBF7'/%3E%3Cpath d='M138.034 10.091C137.271 10.091 136.681 9.896 136.265 9.506C135.849 9.10733 135.641 8.52233 135.641 7.751V1.524H137.266V7.712C137.266 8.04133 137.349 8.297 137.513 8.479C137.687 8.661 137.925 8.752 138.228 8.752C138.592 8.752 138.896 8.65667 139.138 8.466L139.593 9.623C139.403 9.779 139.169 9.896 138.891 9.974C138.614 10.052 138.328 10.091 138.034 10.091ZM134.497 4.41V3.11H139.125V4.41H134.497Z' fill='%23FFFBF7'/%3E%3Cpath d='M143.705 10.091C142.933 10.091 142.257 9.93933 141.677 9.636C141.105 9.324 140.658 8.89933 140.338 8.362C140.026 7.82467 139.87 7.21367 139.87 6.529C139.87 5.83567 140.021 5.22467 140.325 4.696C140.637 4.15867 141.061 3.73833 141.599 3.435C142.145 3.13167 142.764 2.98 143.458 2.98C144.134 2.98 144.736 3.12733 145.265 3.422C145.793 3.71667 146.209 4.13267 146.513 4.67C146.816 5.20733 146.968 5.84 146.968 6.568C146.968 6.63733 146.963 6.71533 146.955 6.802C146.955 6.88867 146.95 6.971 146.942 7.049H141.157V5.97H146.084L145.447 6.308C145.455 5.90933 145.373 5.55833 145.2 5.255C145.026 4.95167 144.788 4.71333 144.485 4.54C144.19 4.36667 143.848 4.28 143.458 4.28C143.059 4.28 142.708 4.36667 142.405 4.54C142.11 4.71333 141.876 4.956 141.703 5.268C141.538 5.57133 141.456 5.931 141.456 6.347V6.607C141.456 7.023 141.551 7.39133 141.742 7.712C141.932 8.03267 142.201 8.27967 142.548 8.453C142.894 8.62633 143.293 8.713 143.744 8.713C144.134 8.713 144.485 8.65233 144.797 8.531C145.109 8.40967 145.386 8.219 145.629 7.959L146.5 8.96C146.188 9.324 145.793 9.60567 145.317 9.805C144.849 9.99567 144.311 10.091 143.705 10.091Z' fill='%23FFFBF7'/%3E%3Cpath d='M148.269 10V3.058H149.816V4.969L149.634 4.41C149.842 3.942 150.167 3.58667 150.609 3.344C151.059 3.10133 151.618 2.98 152.286 2.98V4.527C152.216 4.50967 152.151 4.501 152.091 4.501C152.03 4.49233 151.969 4.488 151.909 4.488C151.293 4.488 150.804 4.67 150.44 5.034C150.076 5.38933 149.894 5.92233 149.894 6.633V10H148.269Z' fill='%23FFFBF7'/%3E%3Cpath d='M64.5 0L62 5L64.5 10L63.2271 8.51743C62.4104 7.56621 61.5284 6.69426 60.5898 5.91028L59.5 5L60.5898 4.08972C61.5284 3.30574 62.4104 2.43379 63.2271 1.48257L64.5 0Z' fill='%23FFFBF7'/%3E%3Cpath d='M98.5 0L101 5L98.5 10L99.7729 8.51743C100.59 7.56621 101.472 6.69426 102.41 5.91028L103.5 5L102.41 4.08972C101.472 3.30574 100.59 2.43379 99.7729 1.48257L98.5 0Z' fill='%23FFFBF7'/%3E%3C/svg%3E");
      --thumb-size: 153px;
      --thumb-radius: 2px;
      --thumb-border-color: transparent;
      --thumb-border-size: 2px;
      --focus-width: var(--thumb-border-size);
      --focus-color: var(--color-blue);
      --divider-width: 1px;
      --divider-color: var(--color-pale-pink);
      display: flex;
      flex-direction: column;
      margin: 0;
      overflow: hidden;
      position: relative;
    }
    ::slotted(img) {
      height: auto;
      width: 100%;
    }
    ::slotted([slot='image-2']) {
      clip-path: polygon(
        calc(var(--exposure) + var(--divider-width)/2) 0, 
        100% 0, 
        100% 100%, 
        calc(var(--exposure) + var(--divider-width)/2) 100%);
    }
    slot {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    slot[name='image-2'] {
      position: absolute;
      top:0;
      filter: drop-shadow(calc(var(--divider-width) * -1) 0 0 var(--divider-color));
    }
    .visually-hidden {
      border: 0; 
      clip: rect(0 0 0 0); 
      clip-path: polygon(0px 0px, 0px 0px, 0px 0px);
      -webkit-clip-path: polygon(0px 0px, 0px 0px, 0px 0px);
      height: 1px; 
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
      white-space: nowrap;
    }
    label {
      align-items: stretch;
      display: flex;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
    input {
      cursor: col-resize;
      margin: 0 calc(var(--thumb-size) / -2 - 6px);
      width: calc(100% + var(--thumb-size));
      appearance: none;
      -webkit-appearance: none;
      background: none;
      border: none;
    }
    ::-moz-range-thumb {
      ${thumbStyles}
    }
    ::-webkit-slider-thumb {
      -webkit-appearance: none;
      ${thumbStyles}
    }
    input:focus::-moz-range-thumb {
      ${thumbFocusStyles}
    }
    input:focus::-webkit-slider-thumb {
      ${thumbFocusStyles}
    }
  </style>
  <slot name="image-1"></slot>
  <slot name="image-2"></slot>
  
  <label>
 
    <span class="visually-hidden js-label-text">
      Control how much of each overlapping image is shown. 
      0 means the first image is completely hidden and the second image is fully visible.
      100 means the first image is fully visible and the second image is completely hidden.
      50 means both images are half-shown, half-hidden.
    </span>
    
    <input type="range" value="50" min="0" max="100"/>
    
  </label>
`;

/**
 * Our ImageCompare web component class
 * 
 * @attr {string} label-text - Provide additional context to screen reader users.
 * 
 * @slot image-1 - Your first image. Will appear on the "left"
 * @slot image-2 - Your second image. Will appear on the "right"
 * 
 * @cssprop --thumb-background-color - The background color of the range slider handle. 
 * @cssprop --thumb-background-image - The background image of the range slider handle.
 * @cssprop --thumb-size - The size of the range slider handle.
 * @cssprop --thumb-radius - The border-radius of the range slider handle.
 * @cssprop --thumb-border-color - The color of the range slider handle border.
 * @cssprop --thumb-border-size - The width of the range slider handle border.
 * 
 * @ccprop --focus-width - The width of the range slider handle's focus outline.
 * @ccprop --focus-color - The color of the range slider handle's focus outline.
 *
 * @ccprop --divider-width - The width of the divider shown between the two images.
 * @ccprop --divider-color - The color of the divider shown between the two images.
 */
class ImageCompare extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    ['input', 'change'].forEach((eventName) => {
      this.shadowRoot.querySelector("input").addEventListener(
        eventName,
        ({ target }) => {
          if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

          this.animationFrame = requestAnimationFrame(() => {
            this.shadowRoot.host.style.setProperty('--exposure', `${target.value}%`)
          });
        },
      );
    });

    const customLabel = this.shadowRoot.host.getAttribute('label-text');
    if(customLabel) {
      this.shadowRoot.querySelector(".js-label-text").textContent = customLabel;
    }
  }
}

customElements.define("image-compare", ImageCompare);
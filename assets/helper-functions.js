/**
 * A very simple helper function that checks
 * a single breakpoint. Note: this is a way to guess
 * at the device type, it is by no means the best way.
 */
export const isMobile = () => window.innerWidth < 992

export const isTablet = () => window.innerWidth < 1023

/**
 * A helper function that checks for the current breakpoint.
 * Note that these values need to be kept in sync with the CSS breakpoints.
 */
export const getBreakpoint = () => {
  if (window.innerWidth < 415) {
    return 'xxs'
  } else if (window.innerWidth > 414 && window.innerWidth < 769) {
    return 'xs'
  } else if (window.innerWidth > 768 && window.innerWidth < 1024) {
    return 's'
  } else if (window.innerWidth > 1023 && window.innerWidth < 1201) {
    return 'm'
  } else if (window.innerWidth > 1200 && window.innerWidth < 1441) {
    return 'md'
  } else if (window.innerWidth > 1440) {
    return 'l'
  }
}

/**
 * Returns a config object for use with Shopify fetch requests
 *
 * @param {string} type The request MIME type
 */
export const fetchConfig = (type = 'json') => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: `application/${type}`,
    },
  }
}

/**
 * Generates a slug from a readable value
 *
 * @param {*} value Readable value
 */
export const slug = (value) => value.toLowerCase().replace(' ', '-')

/**
 * Generates a swatch filename based on vendor and option name
 *
 * @param {string} optionName product vendor
 * @param {string} vendor product vendor
 */
export const swatchFilename = (optionName, vendor = false) => {
  let filename = 'swatch__'
  if (vendor) {
    filename += `${slug(vendor)}__`
  }
  filename += `${slug(optionName)}.png`

  return filename
}

/**
 * Retrieves a translation string from global namespace and interpolates variables
 *
 * @param {string} key The translation string's key
 * @param {Object} values A key/value object specifying which values to replace
 */
export const t = (key, values = {}) => {
  let string = __GLOBAL__.langMessages[key]
  for (const entry of Object.entries(values)) {
    string = string.replace(`{{ ${entry[0]} }}`, entry[1])
  }
  return string
}

/**
 * Returns an iFrame src URL value for either YouTube or Vimeo hosted videos
 *
 * @param {string} host 'youtube' or 'vimeo'
 * @param {string} id A key/value object specifying which values to replace
 */
export const externalVideoEmbedSrc = (
  host = 'youtube',
  id,
  autoplay = false
) => {
  let src = ''
  switch (host) {
    case 'youtube':
      src = `https://www.youtube.com/embed/${id}?${
        autoplay && `autoplay=1&amp;`
      }controls=1&amp;enablejsapi=1&amp;loop=&amp;modestbranding=1&amp;origin=${encodeURI(
        __GLOBAL__.domain
      )}&amp;playsinline=1&amp;rel=0`
      break
    case 'vimeo':
      src = `https://player.vimeo.com/video/${id}?${
        autoplay && `autoplay=1&amp;`
      }byline=0&amp;controls=1&amp;loop=&amp;playsinline=1&amp;title=0`
      break
    default:
      console.error('Invalid host value (must be "youtube" or "vimeo")')
  }
  return src
}

/**
 * Generates markup for a product image component
 *
 * @param {Object} data Data needed to render the component
 */
export const generateImageMarkup = (data) => `
   <adaptive-image
     data-image="${data.src}"
     data-aspect-ratio="${data.aspectRatio}"
     data-alt="${data.alt}"
     data-loading="${data.loading}"
   >
   </adaptive-image>
 `

/**
 * Generates markup for a video component based on a Shopify Video object
 *
 * @param {Object} data Data needed to render the component
 */
export const generateVideoMarkup = (data) => `
   <adaptive-video
     data-type="video"
     data-video="${data.video}"
     data-alt="${data.alt}"
     ${(data.posterImage && `data-poster-image="${data.posterImage}"`) || ''}
   >
   </adaptive-video>
 `

/**
 * Generates markup for a video component based on a Shopify external_video object
 *
 * @param {Object} data Data needed to render the component
 */
export const generateExternalVideoMarkup = (data) => `
   <adaptive-video
     data-type="external_video"
     data-video="${data.video}"
     data-alt="${data.alt}"
     ${(data.posterImage && `data-poster-image="${data.posterImage}"`) || ''}
     ${(data.videoId && `data-video-id="${data.videoId}"`) || ''}
   >
   </adaptive-video>
 `

/**
 * Generates markup for a product model component
 *
 * @param {Object} data Data needed to render the component
 */
export const generateProductModelMarkup = (data) => `
   <product-model
     data-src="${data.src}"
     data-id="${data.id}"
     data-ios-src="${data.iosSrc}"
     data-poster="${data.poster}"
     data-alt="${data.alt}"
   >
   </product-model>
 `

/**
 * Checks if a string is in base64 format, returning boolean
 *
 * @param {string} string String to test
 */
export const isBase64 = (string) => {
  const regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
  return regex.test(string)
}

/**
 * Checks if library loaded
 *
 * @param {string} lib script url
 */
export const isLoadedScript = (lib) => {
  return document.querySelectorAll('[src="' + lib + '"]').length > 0
}

/**
 * Load library
 *
 * @param {string} lib script url
 */
export const loadScript = (lib) => {
  var script = document.createElement('script')
  script.src = lib
  const firstScriptTag = document.getElementsByTagName('script')[0]
  firstScriptTag.parentNode.insertBefore(script, firstScriptTag)
  return script
}

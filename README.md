# Laura Mercier Shopify Theme

### About

This custom theme is built by Half Helix exclusively for Orveon Group. This project is based on reworked Dawn theme (Shopify’s Online Store 2.0).

## Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:

1. [Shopify CLI for themes](https://shopify.dev/themes/tools/cli/installation) based on your platform/preferred method.
2. [Theme Check VS Code](https://marketplace.visualstudio.com/items?itemName=Shopify.theme-check-vscode)
3. Recommended extensions:
   - [AXE Chrome Exentension](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd) (web accessibility testing tool).
   - [Shopify Liquid Prettier Plugin](https://shopify.dev/themes/tools/liquid-prettier-plugin)
4. Shopify store collaborator account or a staff account with the "Manage themes" permission.

## Getting Started

1. Run `shopify theme dev --store $STORE` which will create a Development theme to preview changes in real time or use an [existing theme](https://shopify.dev/themes/tools/cli/getting-started#use-an-existing-theme) for development.
2. Run `shopify theme push` to upload your local theme files to Shopify, overwriting the remote versions. Use the `--unpublished` flag to upload the theme to the theme library without overwriting an existing theme.
3. When developing locally, you may need to delete the files in `.shopifyignore` to get the local server to run properly.

**Additional Notes:**

- _Use [shopify theme check](https://shopify.dev/themes/tools/cli/theme-commands#check) to analyze your code for errors and ensure that it follows theme and Liquid best practices. The recommendation is via VSCode plugin, and then once more as it runs in our GitHub check action. Learn more about the checks that Theme Check runs [here](https://shopify.dev/themes/tools/theme-check/checks)_.
- _For more information about Shopify CLI commands please visit [here](https://shopify.dev/themes/tools/cli/theme-commands)_.

## Branching Strategy

1. The developers work on `feature/` or `bugfix/` branches based on `main` when beginning a new feature, and open a WIP pull request into main while committing updates.
2. Once approved, `feature/` and `bugfix/` branches are merged into the `main` branch. In order to maintain clean commit history and avoid merge conflicts, **the `main` branch should never be synced with a Shopify theme**.
3. At the end of a sprint, he `main` branch is merged into the `staging` branch so that all features from that sprint are in a single place and will be deployed to a theme for QA/UAT. It is safe to sync staging to a theme in the Shopify stor called "Staging" . This branch is useful to keep all the theme content synced up.
4. Once all testing is completed and content editors do their work, the `main` branch can then be merged with the `production` branch, which is synced with a theme called "Production" in Shopify

# Best Practices

Please read through:

- [Shopify's general best practices](https://shopify.dev/themes/best-practices)
- [Shopify's accessibility best practices](https://shopify.dev/themes/best-practices/accessibility)
- [Shopify's preformance best practices](https://shopify.dev/docs/themes/best-practices/performance)

## Javscript Best Practics

- Only use Javascript when absolutely necessary.
- Reduce your dependency on external frameworks and libraries
  If you need to use JavaScript, consider avoiding introducing third-party frameworks, libraries, and dependencies. Instead, use native browser features and modern DOM APIs whenever possible. Including JavaScript libraries in your package can lead to large bundle sizes, slow load times, and a poor experience for customers. Frameworks such as React, Angular, and Vue, and large utility libraries such as jQuery have significant performance costs.
- Use ES6 Syntax
- Prefix javascript files with the correct hierarchy
  - I.E. Page level scripts should be prefixed with page-
  - Component scripts should be prefixed with component-
- Use "js-" prefixed classes
  - Avoid binding to the same class in both your CSS and JavaScript. Conflating the two often leads to, at a minimum, time wasted during refactoring when a developer must cross-reference each class they are changing, and at its worst, developers being afraid to make changes for fear of breaking functionality. Use javascript specific classes to bind, prefixed with .js-, to reference DOM Nodes.

## HTML Best Practices

- Always use semantic elements (`nav`, `<header>`, `<aside>`, `<address>`)
- Try to keep in mind your heading structure - headings should always increase by 1 on a page (ie, you shouldn't have `<h1>`, `<h3>`, `<h4>`: semantically it might make more sense to use an `<h2>` and then style it using `.h3`)
- Use `<details> / <summary>` for collapsible elements (ex. FAQs) - you shouldn't necessarily need JS
- Reduce the number of elements, when possible. If you have a `<div>` as the sole child of its parent `<div>`, chances are, those two can be consolidated in to one
- The best way to load your site fonts is by including them in the head with the link tag and the prefetch/preload attribute. You can still include the CSS @font-face rule in your external stylesheet.
- Use `<strong>` instead of `<b>` and `<em>` instead of `<i>`
- When it makes sense, use CSS Grid instead of `<table>`
- Choose `<picture>` over `<img>` when possible. `<picture>` allows you to specify different source files for different screen widths
- Images can have `loading="lazy"`
- Videos should typically have `preload="none"`
- Use web components when needed, and extend from them when possible (ex. a `<newsletter-modal>` might extend from a base `<modal>`)

## CSS Helper Classes

We have some Project Shimmer specific helper classes to create reusable styling for global elements, most of these sit in `base.css` some specifics are laid out below:

**Typography classes**

| Type              | `Class name`         |
| ----------------- | -------------------- |
| Subtitle styles   | `.s1`                |
| Navigation styles | `.n1, .n2, .n3, .n4` |
| Body styles       | `.b1, .b2`           |
| Heading styles    | `h*, .h*`            |
| Link Styles       | `.a1`                |

## CSS Best Practices

- CSS files follow the same naming convention as Javscript
  - Prefix javascript files with the correct hierarchy
  - I.E. Page level scripts should be prefixed with page-
  - Component scripts should be prefixed with component-
- Avoid inline styles. When possible, even in JavaScript, styles should be updated by adding a class (`.hidden`) instead of setting the style (`...style.display = 'none'`)
- We use a mix of functional CSS and BEM.
  - We use a mix of functional css classes and BEM selectors when we style a website. Functional classes can be thought of as helper classes. They allow us to easily bind a style declaration to a DOM node by just attaching a class. BEM complements these functional classes by providing a robust framework to create context-specific classes.

```
  .media--square {
    padding-bottom: 100%;
  }

  .media--portrait {
    padding-bottom: 125%;
  }

  .media--landscape {
    padding-bottom: 66.6%;
  }

  .media--cropped {
    padding-bottom: 56%;
  }

  .media--16-9 {
    padding-bottom: 56.25%;
  }

  .media--circle {
    padding-bottom: 100%;
    border-radius: 50%;
  }
```

- Variables
  Use dash-cased variable names --type-variable-name (e.g. --color-red) over camelCased or snake_cased variable names.
- Use stateful classes
  Stateful classes tell a developer that an element is in a current state, or that a script is acting upon the component. Stateful classes are not global, meaning they do not carry styles on their own. Scope stateful classes to an existing selector using "active" prefixes .is-, .has-, .was-, etc.

  ```
  .info__tab {
    color: var(--color-grey);
  }

  .info__tab. is-active {
    color: var(--color-white);
  }
  ```

### Accessibility Dev Checklist

- [ ] Appropriate html tags are used
- [ ] Roles used when html tags are not available
- [ ] Hidden items are displayed correctly
  - [ ] Aria-hidden added
  - [ ] Aria-expanded added (if dropdown)
  - [ ] Aria-controls (as needed)
  - [ ] display: none used when item is out of view
- [ ] Focus
  - [ ] Items have focus state outline
  - [ ] Tabbable items that aren’t default tabbable have tabindex=“0” or greater than 0
  - [ ] Items that should not be tabbable have tabindex=“-1”
- [ ] Forms
  - [ ] Inputs have labels that are properly linked
  - [ ] Aria-required and html 5 required are added to required inputs
  - [ ] Custom form inputs (not default html5) have:
    - [ ] Aria-label / aria-labeledby
    - [ ] aria-describedby
    - [ ] aria-required
    - [ ] aria-invalid
- [ ] Modals
  - [ ] Focus is trapped to opened modal

#### Forms

- Use Shopify forms when possible - they include their own accessible validation
- All inputs need `<label>`s, and the labels should not disappear on input
- Make sure that the screen reader moves to your success/error message appropriately, either by using .focus() or aria-live elements
- aria-required is being replaced by the HTML5 required attribute, but some documentation says to still include aria-required just in case required isn’t supported
- Use event.preventDefault() followed by a fetch/ajax request for custom validation/to stop any default submissions/to add third party integrations
- From Shopify’s accessibility best practices:
  - All form fields include a label. Fields can use aria-label, the .visuallyhidden element, floating labels, or a visible label to label forms. Form inputs and controls have names that clearly state their purpose.
  - Form inputs have labels with for attributes, including form labels in the theme settings.
  - Required inputs have the required attribute.
  - Fields use the autocomplete attribute. Auto-complete helps people fill in form fields by using the data stored in their browser.
  - Focus is placed on the feedback message. Any errors returned as a result of completing or submitting a form are communicated to screen readers where possible and as soon as possible.
  - Error messages are clear and descriptive.
  - The aria-describedby attribute is applied to input elements which reference the error text container.
  - Notifications, error messages, success messages are announced aloud. Critical information is announced by screen readers using aria-live.

#### Add JS dependencies

If you need to use JavaScript, consider avoiding introducing third-party frameworks, libraries, and dependencies. Instead, use native browser features and modern DOM APIs whenever possible. Including JavaScript libraries in your package can lead to large bundle sizes, slow load times, and a poor experience for customers. Frameworks such as React, Angular, and Vue, and large utility libraries such as jQuery have significant performance costs.
Choose a CDN over an npm installation if possible to minimize build steps.
If a script only belongs to a certain component that only appears on certain pages, include that script within that component file, instead of in `global.js` or the `<head>`

#### Fetch Ajax Requests

We are using shopify's [ajax api](https://shopify.dev/api/ajax) using [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

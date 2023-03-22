(function($) {
  $(document).on("page:load page:change", function() {
    // Adds the color swatch to appropriate line items
    document.querySelectorAll(".product__description__property.order-summary__small-text, .product__description__property.page-main__small-text").forEach((el) => {
      if (el.textContent.indexOf("hex") > -1) {
        const hexcode = el.textContent.split(":")[1].trim();
        const swatch = `
          <div class="color-select-container">
            <div class="color-select-inner">
              <span class="swatch-color-span" style="background-color: ${hexcode}" ></span>
            </div>
          </div>
        `;
        let hook = el.closest(".product__description").querySelector(".product__description__variant.order-summary__small-text");
        if (!hook) {
          hook = el.closest(".product__description").querySelector(".product__description__variant.page-main__small-text");
        }
        if (hook && !hook.querySelector('.color-select-container')) {
          hook.insertAdjacentHTML("afterbegin", swatch);
        }
        el.classList.add("hidden");
      }
    })
  });

  // toggle hide/show for order note
  document.querySelector(".js-toggle-order-note")?.addEventListener("click", () => {
    document.querySelector(".js-order-note").classList.toggle("hidden");
  })
})(Checkout.$);

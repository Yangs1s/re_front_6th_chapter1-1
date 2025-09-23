import { Router } from "./lib/Router.js";
import { router } from "./router/Router.js";
import { addEvent } from "./utils/eventUtil.js";
export const registerProductDetailEvent = () => {
  addEvent("click", ".product-image, .product-info", async e => {
    const productId = e.target.closest(".product-card").dataset.productId;

    console.log("ProductId", productId);
    if (productId) {
      router.navigate(`/product/${productId}`);
    }
  });
};

export const selectCategoryEvent = () => {
  addEvent("click", ".category1-filter-btn, .category2-filter-btn", e => {
    const category1 = e.target.dataset.category1;
    const category2 = e.target.dataset.category2;
    const url = Router.getUrl({ category1, category2, page: 1 }, window.location.origin);
    router.navigate(url);
    console.log("url", url, category1, category2);
  });
};

export const selectSortEvent = () => {
  addEvent("change", "#sort-select", e => {
    const sort = e.target.value;
    const url = Router.getUrl({ sort, page: 1 }, window.location.origin);
    router.navigate(url);
  });
};
export const selectLimitEvent = () => {
  addEvent("change", "#limit-select", e => {
    const limit = e.target.value;
    const url = Router.getUrl({ limit, page: 1 }, window.location.origin);
    router.navigate(url);
  });
};
export function registerAllEvent() {
  selectSortEvent();
  selectLimitEvent();
  registerProductDetailEvent();
  selectCategoryEvent();
}

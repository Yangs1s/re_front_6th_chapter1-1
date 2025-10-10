import { Router } from "./lib/Router.js";
import { router } from "./router/Router.js";
import { cartStore, uiStore } from "./store/index.js";
import { addEvent } from "./utils/eventUtil.js";
export const registerProductDetailEvent = () => {
  addEvent("click", ".product-image, .product-info", e => {
    const productId = e.target.closest(".product-card").dataset.productId;

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

const openCartModalEvent = () => {
  addEvent("click", "#cart-icon-btn", () => {
    uiStore.openCartModal();
  });
};

const closeCartModalEvent = () => {
  addEvent("click", "#cart-modal-close-btn", () => {
    uiStore.closeCartModal();
  });
  addEvent("click", ".cart-modal-overlay", () => {
    uiStore.closeCartModal();
  });

  // ESC 키 이벤트는 document에 직접 추가
  addEvent("keydown", "key:Escape", () => {
    if (uiStore.state.cartModalOpen) {
      uiStore.closeCartModal();
    }
  });
};

const checkAllCartEvent = () => {
  addEvent("change", "#cart-modal-select-all-checkbox", () => {
    cartStore.toggleSelectAll();
  });
};

const checkCartItemEvent = () => {
  addEvent("change", ".cart-item-checkbox", e => {
    const productId = e.target.dataset.productId;
    cartStore.toggleSelectItem(productId);
  });
};

const addToCartEvent = () => {
  addEvent("click", ".add-to-cart-btn", e => {
    // 클릭된 버튼에서 상품 정보 가져오기
    const productCard = e.target.closest(".product-card");
    const productId = productCard.dataset.productId;

    // 상품 정보 수집
    const title = productCard.querySelector("h3").textContent.trim();
    const priceText = productCard.querySelector("p.text-lg").textContent;
    const price = parseInt(priceText.replace(/[^0-9]/g, ""));
    const image = productCard.querySelector("img").src;

    const product = {
      productId,
      title,
      price,
      image,
      quantity: 1,
    };
    cartStore.addToCart(product);
    uiStore.showSuccessToast("장바구니에 추가되었습니다");
  });
};
const deleteFromCartEvent = () => {
  addEvent("click", ".cart-item-remove-btn", e => {
    const productCard = e.target.closest(".cart-item");
    const productId = productCard.dataset.productId;
    cartStore.deleteProduct(productId);
  });
};
const deleteSelectedItemsEvent = () => {
  addEvent("click", "#cart-modal-remove-selected-btn", () => {
    cartStore.deleteSelectedItems();
  });
};
const incrementQuantityEvent = () => {
  addEvent("click", ".quantity-increase-btn", e => {
    // 버튼 요소를 찾아서 productId 가져오기 (SVG 클릭 시에도 작동)
    const button = e.target.closest(".quantity-increase-btn");
    const productId = button.dataset.productId;

    if (productId) {
      cartStore.incrementQuantity(productId);
    }
  });
};
const decrementQuantityEvent = () => {
  addEvent("click", ".quantity-decrease-btn", e => {
    // 버튼 요소를 찾아서 productId 가져오기 (SVG 클릭 시에도 작동)
    const button = e.target.closest(".quantity-decrease-btn");
    const productId = button.dataset.productId;

    if (productId) {
      cartStore.decrementQuantity(productId);
    }
  });
};
export function registerAllEvent() {
  selectSortEvent();
  selectLimitEvent();
  registerProductDetailEvent();
  selectCategoryEvent();
  openCartModalEvent();
  closeCartModalEvent();
  addToCartEvent();
  deleteFromCartEvent();
  checkAllCartEvent();
  checkCartItemEvent();
  deleteSelectedItemsEvent();
  incrementQuantityEvent();
  decrementQuantityEvent();
}

import { findByText, getByText, queryByText, screen } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { debug } from "vitest-preview";
const goTo = path => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("popstate"));
};

// 장바구니에 상품을 추가하는 헬퍼 함수
const addProductToCart = async productName => {
  const productElement = await findByText(document.querySelector("#products-grid"), new RegExp(productName, "i"));
  const cartButton = productElement.closest(".product-card").querySelector(".add-to-cart-btn");

  await userEvent.click(cartButton);

  expect(screen.getByText("장바구니에 추가되었습니다")).toBeInTheDocument();
};

beforeAll(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  await import("../main.js");
});

beforeEach(() => goTo("/"));

afterEach(() => {
  // 각 테스트 후 상태 초기화
  document.getElementById("root").innerHTML = "";
  localStorage.clear();

  // Toast 상태 초기화
  if (window.uiStore) {
    window.uiStore.hideToast();
  }
});

describe("1. 장바구니 모달", () => {
  test("장바구니 아이콘 클릭 시 모달 형태로 장바구니가 열린다", async () => {
    const { render } = await import("../render.js");

    window.cartStore.subscribe(render);
    // 장바구니 아이콘 클릭

    window.uiStore.openCartModal();

    const cartIcon = document.querySelector("#cart-icon-btn");

    expect(cartIcon).toBeInTheDocument();

    await userEvent.click(cartIcon);

    expect(screen.getByText("장바구니가 비어있습니다")).toBeInTheDocument();
    expect(document.querySelector(".cart-modal-overlay")).toBeInTheDocument();
  });

  test("X 버튼으로 모달을 닫을 수 있다", async () => {
    await screen.findByText(/총 의 상품/i);

    // 장바구니 모달 열기
    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);

    // X 버튼 클릭
    const closeButton = document.querySelector("#cart-modal-close-btn");
    expect(closeButton).toBeInTheDocument();
    await userEvent.click(closeButton);

    // 모달이 닫혔는지 확인
    expect(document.querySelector(".cart-modal-overlay")).not.toBeInTheDocument();
  });

  test("배경 클릭으로 모달을 닫을 수 있다", async () => {
    await screen.findByText(/총 의 상품/i);

    // 장바구니 모달 열기
    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);

    // 배경 오버레이 클릭
    const overlay = document.querySelector(".cart-modal-overlay");
    expect(overlay).toBeInTheDocument();
    await userEvent.click(overlay);

    // 모달이 닫혔는지 확인
    expect(document.querySelector(".cart-modal-overlay")).not.toBeInTheDocument();
  });

  test("ESC 키로 모달을 닫을 수 있다", async () => {
    await screen.findByText(/총 의 상품/i);

    // 장바구니 모달 열기
    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);
    const overlay = document.querySelector(".cart-modal-overlay");
    expect(overlay).toBeInTheDocument();

    // ESC 키 입력
    await userEvent.keyboard("{Escape}");

    // 모달이 닫혔는지 확인
    expect(document.querySelector(".cart-modal-overlay")).not.toBeInTheDocument();
  });
});

describe.sequential("2. 장바구니 수량 조절", () => {
  test("각 장바구니 상품의 수량을 증가할 수 있다", async () => {
    await screen.findByText(/총 의 상품/i);

    // 상품을 장바구니에 추가
    await addProductToCart("pvc 투명 젤리 쇼핑백");

    // 장바구니 모달 열기
    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);

    // 수량 증가 버튼 클릭
    const increaseButton = document.querySelector(".quantity-increase-btn");
    expect(increaseButton).toBeInTheDocument();

    // 현재 수량 확인
    const quantityInput = document.querySelector(".quantity-input");
    expect(quantityInput.value).toBe("1");

    await userEvent.click(increaseButton);
    // 수량이 증가했는지 확인
    debug();
    console.log("수량 :", quantityInput.value);
    expect(quantityInput.value).toBe("2");
  });

  test("각 장바구니 상품의 수량을 감소할 수 있다", async () => {
    await screen.findByText(/총 의 상품/i);

    // 상품을 장바구니에 추가하고 수량을 2개로 증가
    await addProductToCart("pvc 투명 젤리 쇼핑백");

    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);

    expect(document.querySelector(".quantity-input").value).toBe("1");

    // 수량을 먼저 2개로 증가
    const increaseButton = document.querySelector(".quantity-increase-btn");
    await userEvent.click(increaseButton);

    // 수량 감소 버튼 클릭
    const decreaseButton = document.querySelector(".quantity-decrease-btn");
    expect(decreaseButton).toBeInTheDocument();

    const quantityInput = document.querySelector(".quantity-input");
    expect(quantityInput.value).toBe("2");

    await userEvent.click(decreaseButton);

    // 수량이 감소했는지 확인
    expect(quantityInput.value).toBe("1");
  });

  test("수량 변경 시 총 금액이 실시간으로 업데이트된다", async () => {
    await screen.findByText(/총 의 상품/i);

    // 상품을 장바구니에 추가
    await addProductToCart("pvc 투명 젤리 쇼핑백");

    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);

    // 초기 총 금액 확인
    const getTotalAmountElement = () => screen.getByText("총 금액").parentNode.querySelector("span:last-child");
    const initialAmount = getTotalAmountElement().textContent;
    expect(initialAmount).toBe("220원");

    // 수량 증가
    const increaseButton = document.querySelector(".quantity-increase-btn");
    await userEvent.click(increaseButton);

    // 총 금액이 업데이트되었는지 확인
    const updatedAmount = getTotalAmountElement().textContent;
    expect(updatedAmount).toBe("440원");
  });
});

describe.sequential("3. 장바구니 삭제", () => {
  test("각 상품에 삭제 버튼이 배치되어 있다", async () => {
    await screen.findByText(/총 의 상품/i);

    // 상품을 장바구니에 추가
    await addProductToCart("pvc 투명 젤리 쇼핑백");

    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);

    // 삭제 버튼이 있는지 확인
    const deleteButton = document.querySelector(".cart-item-remove-btn");
    expect(deleteButton).toBeInTheDocument();
  });

  test("삭제 버튼 클릭 시 해당 상품이 장바구니에서 제거된다", async () => {
    await screen.findByText(/총 의 상품/i);

    // 상품을 장바구니에 추가
    await addProductToCart("pvc 투명 젤리 쇼핑백");

    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);

    // 상품이 장바구니에 있는지 확인
    expect(getByText(document.querySelector(".cart-modal"), /pvc 투명 젤리 쇼핑백/i)).toBeInTheDocument();

    // 삭제 버튼 클릭
    const deleteButton = document.querySelector(".cart-item-remove-btn");
    await userEvent.click(deleteButton);

    // 장바구니가 비어있는지 확인
    expect(screen.getByText("장바구니가 비어있습니다")).toBeInTheDocument();

    // 장바구니 아이콘의 카운트가 0이 되었는지 확인
    expect(document.querySelector("#cart-icon-btn span")).not.toBeInTheDocument();
  });
});

describe.sequential("4. 장바구니 선택 삭제", () => {
  test("각 상품에 선택을 위한 체크박스가 제공되고, 체크된 상품들만 삭제할 수 있다.", async () => {
    await screen.findByText(/총 의 상품/i);
    screen.getByText("340개");

    // 두 개의 상품을 장바구니에 추가
    await addProductToCart("pvc 투명 젤리 쇼핑백");
    await addProductToCart("샷시 풍지판");

    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);

    // 첫 번째 상품만 선택
    const checkboxes = document.querySelectorAll(".cart-item-checkbox");
    expect(checkboxes.length).toBe(2);

    await userEvent.click(checkboxes[0]);

    // 선택 삭제 버튼 클릭
    const selectedDeleteButton = document.querySelector("#cart-modal-remove-selected-btn");
    await userEvent.click(selectedDeleteButton);

    // 선택된 상품만 삭제되고 나머지는 남아있는지 확인
    await screen.findByText("전체선택 (1개)");
    const cartModal = document.querySelector(".cart-modal");
    expect(queryByText(cartModal, /pvc 투명 젤리 쇼핑백/i)).not.toBeInTheDocument();
    expect(getByText(cartModal, /샷시 풍지판/i)).toBeInTheDocument();
  });
});

describe.sequential("5. 장바구니 전체 선택", () => {
  test("모든 상품을 한 번에 선택할 수 있는 마스터 체크박스가 있다", async () => {
    await screen.findByText(/총 의 상품/i);

    // 상품을 장바구니에 추가
    await addProductToCart("pvc 투명 젤리 쇼핑백");

    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);

    // 전체 선택 체크박스가 있는지 확인
    const selectAllCheckbox = document.querySelector("#cart-modal-select-all-checkbox");
    expect(selectAllCheckbox).toBeInTheDocument();
    expect(screen.getByText(/전체선택/)).toBeInTheDocument();
  });

  test("전체 선택 시 모든 상품의 체크박스가 선택된다", async () => {
    await screen.findByText(/총 의 상품/i);

    // 두 개의 상품을 장바구니에 추가
    await addProductToCart("pvc 투명 젤리 쇼핑백");
    await addProductToCart("고양이 난간 안전망");

    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);

    // 전체 선택 체크박스 클릭
    const selectAllCheckbox = document.querySelector("#cart-modal-select-all-checkbox");
    await userEvent.click(selectAllCheckbox);

    // 모든 상품의 체크박스가 선택되었는지 확인
    const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
    itemCheckboxes.forEach(checkbox => {
      expect(checkbox.checked).toBe(true);
    });
  });

  test("전체 해제 시 모든 상품의 체크박스가 해제된다", async () => {
    await screen.findByText(/총 의 상품/i);

    // 두 개의 상품을 장바구니에 추가
    await addProductToCart("pvc 투명 젤리 쇼핑백");
    await addProductToCart("고양이 난간 안전망");

    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);

    // 전체 선택 후 전체 해제
    await userEvent.click(document.querySelector("#cart-modal-select-all-checkbox"));
    expect([...document.querySelectorAll(".cart-item-checkbox")].map(v => v.checked)).toEqual([true, true]);

    await userEvent.click(document.querySelector("#cart-modal-select-all-checkbox"));
    expect([...document.querySelectorAll(".cart-item-checkbox")].map(v => v.checked)).toEqual([false, false]);
  });
});

describe.sequential("6. 장바구니 비우기", () => {
  test("장바구니에 있는 모든 상품을 한 번에 삭제할 수 있다", async () => {
    await screen.findByText(/총 의 상품/i);

    // 상품들을 장바구니에 추가
    await addProductToCart("pvc 투명 젤리 쇼핑백");
    await addProductToCart("고양이 난간 안전망");

    const cartIcon = document.querySelector("#cart-icon-btn");
    await userEvent.click(cartIcon);

    // 전체 비우기 버튼이 있는지 확인
    const clearCartButton = document.querySelector("#cart-modal-clear-cart-btn");
    expect(clearCartButton).toBeInTheDocument();
  });
});

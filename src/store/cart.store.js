export class CartStore {
  #state = {
    cart: [],
    totalAmount: 0,
    count: 0,
    selectedItems: [], // 선택된 아이템들의 productId 배열
    isAllSelected: false, // 전체 선택 상태
  };
  #listeners = [];

  constructor() {
    // localStorage에서 cart 데이터 로드
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        this.#state = {
          cart: parsedCart,
          totalAmount: parsedCart.reduce((acc, product) => acc + product.price * product.quantity, 0),
          count: parsedCart.length,
          selectedItems: [],
          isAllSelected: false,
        };
      } catch (e) {
        console.error("파싱 실패:", e);
        // 파싱 실패 시 기본값 사용
        this.#state = {
          cart: [],
          totalAmount: 0,
          count: 0,
          selectedItems: [],
          isAllSelected: false,
        };
      }
    } else {
      this.#state = {
        cart: [],
        totalAmount: 0,
        count: 0,
        selectedItems: [],
        isAllSelected: false,
      };
    }
  }

  subscribe(callback) {
    this.#listeners.push(callback);
    return () => this.#listeners.delete(callback);
  }

  async addToCart(product) {
    // 같은 상품이 이미 있는지 확인
    const existingProduct = this.#state.cart.find(item => item.productId === product.productId);

    if (existingProduct) {
      // 이미 있으면 수량만 증가
      existingProduct.quantity += product.quantity || 1;
    } else {
      // 없으면 새로 추가
      this.#state.cart.push(product);
    }

    this.#state.count = this.#state.cart.length;
    this.#state.totalAmount = this.#state.cart.reduce((acc, product) => acc + product.price * product.quantity, 0);

    // localStorage에 저장
    localStorage.setItem("cart", JSON.stringify(this.#state.cart));

    this.notify();
  }

  deleteProduct(productId) {
    this.#state.cart = this.#state.cart.filter(product => product.productId !== productId);
    this.#state.count = this.#state.cart.length;
    // 삭제된 상품이 선택되어 있었다면 선택 목록에서도 제거
    this.#state.selectedItems = this.#state.selectedItems.filter(id => id !== productId);
    this.#updateSelectionState();

    // localStorage에 저장
    localStorage.setItem("cart", JSON.stringify(this.#state.cart));

    this.notify();
  }

  // 전체 선택/해제
  toggleSelectAll() {
    if (this.#state.isAllSelected) {
      // 전체 해제
      this.#state.selectedItems = [];
      this.#state.isAllSelected = false;
    } else {
      // 전체 선택
      this.#state.selectedItems = this.#state.cart.map(item => item.productId);
      this.#state.isAllSelected = true;
    }
    this.notify();
  }

  // 개별 아이템 선택/해제
  toggleSelectItem(productId) {
    const index = this.#state.selectedItems.indexOf(productId);
    if (index > -1) {
      // 선택 해제
      this.#state.selectedItems.splice(index, 1);
    } else {
      // 선택 추가
      this.#state.selectedItems.push(productId);
    }
    this.#updateSelectionState();
    this.notify();
  }

  // 선택된 아이템들 삭제
  deleteSelectedItems() {
    this.#state.cart = this.#state.cart.filter(item => !this.#state.selectedItems.includes(item.productId));
    this.#state.count = this.#state.cart.length;
    this.#state.selectedItems = [];
    this.#state.isAllSelected = false;

    // localStorage에 저장
    localStorage.setItem("cart", JSON.stringify(this.#state.cart));

    this.notify();
  }

  // 전체 선택 상태 업데이트 (내부 헬퍼)
  #updateSelectionState() {
    this.#state.isAllSelected =
      this.#state.cart.length > 0 && this.#state.selectedItems.length === this.#state.cart.length;
  }
  // 선택된 아이템의 수량 증가
  incrementQuantity(productId) {
    console.log("📦 incrementQuantity called with:", productId);
    console.log("📦 Current cart:", JSON.parse(JSON.stringify(this.#state.cart)));

    const item = this.#state.cart.find(item => item.productId === productId);
    console.log("📦 Found item:", item);

    if (item) {
      const oldQuantity = item.quantity;
      item.quantity++;
      console.log("📦 Quantity changed:", oldQuantity, "→", item.quantity);

      this.#state.totalAmount = this.#state.cart.reduce((acc, product) => acc + product.price * product.quantity, 0);

      // localStorage에 저장
      localStorage.setItem("cart", JSON.stringify(this.#state.cart));

      // 먼저 DOM 업데이트 시도 (재렌더링 전 기존 요소)
      const existingInput = document.querySelector(`input.quantity-input[data-product-id="${productId}"]`);
      console.log("📦 existingInput:", existingInput, "value before:", existingInput?.value);

      if (existingInput) {
        existingInput.value = item.quantity;
        console.log("📦 existingInput value after:", existingInput.value);
      }

      this.notify();
      console.log("📦 notify() called");

      // 재렌더링 후 새 요소도 업데이트
      queueMicrotask(() => {
        const newInput = document.querySelector(`input.quantity-input[data-product-id="${productId}"]`);
        console.log("📦 newInput after render:", newInput, "value:", newInput?.value);
        if (newInput && newInput !== existingInput) {
          newInput.value = item.quantity;
          console.log("📦 newInput updated to:", newInput.value);
        }
      });
    } else {
      console.log("📦 Item not found!");
    }
  }
  // 선택된 아이템의 수량 감소.
  decrementQuantity(productId) {
    const item = this.#state.cart.find(item => item.productId === productId);
    if (item) {
      item.quantity--;
      if (item.quantity < 1) {
        item.quantity = 1;
      }
      this.#state.totalAmount = this.#state.cart.reduce((acc, product) => acc + product.price * product.quantity, 0);

      // localStorage에 저장
      localStorage.setItem("cart", JSON.stringify(this.#state.cart));

      // 먼저 DOM 업데이트 시도 (재렌더링 전 기존 요소)
      const existingInput = document.querySelector(`input.quantity-input[data-product-id="${productId}"]`);
      if (existingInput) {
        existingInput.value = item.quantity;
      }

      this.notify();

      // 재렌더링 후 새 요소도 업데이트
      queueMicrotask(() => {
        const newInput = document.querySelector(`input.quantity-input[data-product-id="${productId}"]`);
        if (newInput && newInput !== existingInput) {
          newInput.value = item.quantity;
        }
      });
    }
  }
  // 선택된 아이템들 가져오기 (계산된 속성)
  get selectedCartItems() {
    return this.#state.cart.filter(item => this.#state.selectedItems.includes(item.productId));
  }
  checkAllCart() {
    this.toggleSelectAll();
  }

  // 장바구니 전체 비우기
  clearCart() {
    this.#state = {
      cart: [],
      totalAmount: 0,
      count: 0,
      selectedItems: [],
      isAllSelected: false,
    };
    localStorage.removeItem("cart");
    this.notify();
  }

  get state() {
    return this.#state;
  }

  notify() {
    this.#listeners.forEach(callback => callback(this.#state));
  }
}

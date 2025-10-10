export class UiStore {
  #state = {
    cartModalOpen: false,
    toast: null, // 단일 Toast 객체 { message, type }
  };
  #listeners = [];
  #toastTimer = null;

  constructor() {
    this.cartModalOpen = false;
    this.toast = null;
  }

  subscribe(callback) {
    this.#listeners.push(callback);
    return () => this.#listeners.delete(callback);
  }

  // Toast 표시 (기본 메서드)
  showToast(type = "success", message = "", duration = 3000) {
    if (this.#toastTimer) {
      clearTimeout(this.#toastTimer);
    }
    // 이전 Toast 자동 대체
    this.#state.toast = { type, message };
    this.notify();

    // 자동 제거
    this.#toastTimer = setTimeout(() => {
      this.#state.toast = null;
      this.notify();
      this.#toastTimer = null;
    }, duration);
  }

  // Toast 즉시 제거
  hideToast() {
    if (this.#toastTimer) {
      clearTimeout(this.#toastTimer);
      this.#toastTimer = null;
    }
    this.#state.toast = null;
    this.notify();
  }

  // 편의 메서드들
  showSuccessToast(message = "성공했습니다") {
    return this.showToast("success", message);
  }

  showErrorToast(message = "오류가 발생했습니다") {
    return this.showToast("error", message);
  }

  showInfoToast(message = "정보입니다") {
    return this.showToast("info", message);
  }

  // Cart Modal 관련
  openCartModal() {
    this.#state.cartModalOpen = true;
    this.notify();
  }

  closeCartModal() {
    this.#state.cartModalOpen = false;
    this.notify();
  }

  get state() {
    return this.#state;
  }

  notify() {
    this.#listeners.forEach(callback => callback(this.#state));
  }
}

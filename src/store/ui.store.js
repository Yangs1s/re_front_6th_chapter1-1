export class UiStore {
  #state = { cartModalOpen: false };
  #listeners = [];

  constructor() {
    this.cartModalOpen = false;
  }

  subscribe(callback) {
    this.#listeners.push(callback);
    return () => this.#listeners.delete(callback);
  }

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

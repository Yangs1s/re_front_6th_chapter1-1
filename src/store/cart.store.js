export class CartStore {
  #state = { cartItems: [], totalAmount: 0 };
  #listeners = [];

  constructor() {
    this.cart = [];
  }

  subscribe(callback) {
    this.#listeners.push(callback);
    return () => this.#listeners.delete(callback);
  }

  async addProduct(product) {
    this.cart.push(product);
  }

  notify() {
    this.#listeners.forEach(callback => callback(this.#state));
  }
}

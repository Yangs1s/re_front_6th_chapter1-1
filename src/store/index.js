export * from "./cart.store.js";
export * from "./ui.store.js";

// 전역 스토어 인스턴스들
import { CartStore } from "./cart.store.js";
import { UiStore } from "./ui.store.js";

export const uiStore = new UiStore();
export const cartStore = new CartStore();

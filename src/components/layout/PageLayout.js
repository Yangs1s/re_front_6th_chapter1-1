import { cartStore, uiStore } from "../../store/index.js";
import { CartModal } from "../CartModal.js";
import { Footer } from "../layout/Footer.js";
import { ToastItem } from "../Toast.js";
const cartIconBtn = () => {
  return `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
    </svg>
  `;
};

const PageLayout = ({ headerLeft, children }) => {
  // 안전한 스토어 상태 접근
  const cartState = cartStore.state || {};
  const uiState = uiStore.state || {};

  return `
     <div class="min-h-screen bg-gray-50">
         <header class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
          ${headerLeft}
           
            <div class="flex items-center space-x-2">
              <!-- 장바구니 아이콘 -->
              <button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
              ${cartIconBtn()}
              ${
                cartState.count
                  ? `<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                ${cartState.count}
              </span>`
                  : ""
              }
              </button>
            </div>
          </div>
        </div>
        </header>

        <main class="max-w-md mx-auto px-4 py-4">
         ${children}
         </main>
         ${Footer()}
         ${CartModal({
           isOpen: uiState.cartModalOpen || false,
           items: cartState.cart || [],
           selectedItems: cartStore.selectedCartItems || [],
           totalAmount: cartState.totalAmount || 0,
           isAllSelected: cartState.isAllSelected || false,
         })}
         ${uiState.toast ? ToastItem({ type: uiState.toast.type, message: uiState.toast.message }) : ""}
      </div>
    `;
};

export default PageLayout;

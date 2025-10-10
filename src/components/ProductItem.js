const formatPrice = price => {
  return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
const ProductItem = item => {
  return `
   <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
                   data-product-id=${item.productId}>
                <!-- 상품 이미지 -->
                <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
                  <img src=${item.image}
                       alt="PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장"
                       class="w-full h-full object-cover hover:scale-105 transition-transform duration-200 product-image"
                       loading="lazy">
                </div>
                <!-- 상품 정보 -->
                <div class="p-3">
                  <div class="cursor-pointer product-info mb-3">
                    <h1 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        ${item.title}
                    </h1>
                    <p class="text-xs text-gray-500 mb-2"></p>
                    <p class="text-lg font-bold text-gray-900">
                      ${formatPrice(item.lprice)}원
                    </p>
                  </div>
                  <!-- 장바구니 버튼 -->
                  <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
                         hover:bg-blue-700 transition-colors add-to-cart-btn" data-product-id=${item.productId}>
                    장바구니 담기
                  </button>
                </div>
              </div>
   
   
  `;
};

export default ProductItem;

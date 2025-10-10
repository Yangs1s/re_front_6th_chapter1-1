import PageLayout from "../components/layout/PageLayout.js";
import ProductDetailLayout from "../components/ProductDetailLayout.js";
import { withLifeCycle } from "../lib/withLifeCycle.js";
import { loadProduct } from "../services/product.js";

const Product = ctx => {
  const { product } = ctx.state;

  console.log("Product", product);
  return PageLayout({
    headerLeft: `
             <div class="flex items-center space-x-3">
              <button onclick="window.history.back()" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
            </div>
            `,
    children: ProductDetailLayout(product),
  });
};

withLifeCycle(
  {
    state: {
      product: null,
    },
    async mounted(ctx) {
      const product = await loadProduct(ctx.params.id);
      // console.log("Product mounted", product);
      ctx.updateState({
        product,
      });
      console.log("Product mounted", ctx.state.product);
    },
    updated(prevCtx, nextCtx) {
      console.log("Product updated", prevCtx, nextCtx);
    },
    unmounted(ctx) {
      console.log("Product unmounted", ctx);
    },
  },
  Product
);

export default Product;

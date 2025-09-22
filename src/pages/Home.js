import { FilterPanel, LoadingIndicator, ProductSkeletonGrid, SearchBar } from "../components/index.js";
import PageLayout from "../components/layout/PageLayout.js";
import { withLifeCycle } from "../lib/withLifeCycle.js";
import { loadProductsandCategories } from "../services/product.js";
const Home = ctx => {
  const { products, categories } = ctx.state;
  console.log("Home", products, ctx);
  return PageLayout({
    headerLeft: `
      <h1 class="text-xl font-bold text-gray-900">
        <a href="/" data-link="">쇼핑몰</a>
      </h1>
    `,
    children: `
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        ${SearchBar()}      
        ${FilterPanel({ categories, selectedCategory: "" })}
        </div>
        <!-- 상품 목록 -->
        <div class="mb-6">
          <div>
            <!-- 상품 그리드 -->
            ${ProductSkeletonGrid()}
            ${LoadingIndicator()}
          </div>
        </div>
  `,
  });
};

withLifeCycle(
  {
    async mounted(ctx) {
      const { products: newProducts, categories: newCategories } = await loadProductsandCategories();
      ctx.updateState({
        products: newProducts,
        categories: newCategories,
      });
      console.log("mounted", ctx);
    },
    updated(prevCtx, nextCtx) {
      console.log("updated", prevCtx, nextCtx);
    },
    unmounted(ctx) {
      console.log("unmounted", ctx);
    },
  },
  Home
);

export default Home;

import { FilterPanel, LoadingIndicator, SearchBar } from "../components/index.js";
import PageLayout from "../components/layout/PageLayout.js";
import ProductList from "../components/ProductList.js";
import { withLifeCycle } from "../lib/withLifeCycle.js";
import { loadProductsandCategories } from "../services/product.js";
const Home = ctx => {
  const { products, categories } = ctx.state;

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
        ${ProductList({ products })}
        ${LoadingIndicator()}
          </div>
        </div>
  `,
  });
};

withLifeCycle(
  {
    async mounted(ctx) {
      const { productResponse: newProducts, categories: newCategories } = await loadProductsandCategories();
      ctx.updateState({
        products: newProducts.products,
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

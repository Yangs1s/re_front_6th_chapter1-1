import { FilterPanel, LoadingIndicator, SearchBar } from "../components/index.js";
import PageLayout from "../components/layout/PageLayout.js";
import ProductList from "../components/ProductList.js";
import { withLifeCycle } from "../lib/withLifeCycle.js";
import { loadProductsandCategories } from "../services/product.js";
import { getUrlFilters } from "../utils/getUrlFilters.js";

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
        ${
          products?.pagination?.total > 0
            ? `
         <div class="mb-4 text-sm text-gray-600">
          총 <span class="font-medium text-gray-900">${products.pagination.total.toLocaleString()}개</span>의 상품
        </div>
      </div>
          `
            : ""
        }
        ${ProductList(products?.products)}
        ${LoadingIndicator()}
          </div>
        </div>
  `,
  });
};

withLifeCycle(
  {
    async mounted(ctx) {
      const { productResponse: newProducts, categories: newCategories } = await loadProductsandCategories({
        category1: "",
        category2: "",
        limit: 20,
        sort: "price_asc",
        search: "",
      });
      ctx.updateState({
        products: newProducts,
        categories: newCategories,
      });
    },
    async updated(prevCtx, nextCtx) {
      const urlFilters = getUrlFilters(nextCtx);
      const qs = new URLSearchParams(window.location.search).toString();
      if (qs === nextCtx.state.query) return;

      const { productResponse: newProducts, categories: newCategories } = await loadProductsandCategories(urlFilters);
      console.log("newProducts", newProducts, newCategories);
      nextCtx.updateState({
        products: newProducts,
        query: qs,
      });
    },
    unmounted(ctx) {
      return ctx;
    },
  },
  Home
);

export default Home;

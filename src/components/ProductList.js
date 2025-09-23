import ProductItem from "./ProductItem.js";

const ProductSkeletonCard = () => {
  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div class="aspect-square bg-gray-200"></div>
      <div class="p-3">
        <div class="h-4 bg-gray-200 rounded mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div class="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  `;
};

const ProductSkeletonGrid = ({ count = 4 } = {}) => {
  return `
      ${Array.from({ length: count })
        .map(() => ProductSkeletonCard())
        .join("")}

  `;
};

const ProductGrid = ({ products }) => {
  console.log("ProductGrid", products);
  return `
        ${products?.map(product => ProductItem(product)).join("")}
       `;
};

const ProductList = products => {
  console.log("ProductList", products);
  return `
    <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">


      ${products?.length > 0 ? ProductGrid({ products: products ?? [] }) : ProductSkeletonGrid()}
    </div>
  `;
};

export default ProductList;

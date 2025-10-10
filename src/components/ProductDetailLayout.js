import ProductDetailMain from "./ProductDetailMain.js";

const ProductDetailLayout = product => `
  <div class="min-h-screen bg-gray-50">

    ${ProductDetailMain(product)}
  </div>
`;

export default ProductDetailLayout;

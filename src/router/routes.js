import Home from "../pages/Home.js";
import Product from "../pages/Product.js";

export const routes = [
  { path: "/", component: Home },
  { path: "/product/:id", component: Product },
];

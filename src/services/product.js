import { getCategories, getProduct, getProducts } from "../api/productApi";

export const loadProductsandCategories = async (params = {}) => {
  const [productResponse, categories] = await Promise.all([getProducts(params), getCategories()]);
  return { productResponse, categories };
};

export const loadProduct = async id => {
  const response = await getProduct(id);
  return await response.json();
};

export const loadCategories = async () => {
  const response = await getCategories();
  return await response.json();
};

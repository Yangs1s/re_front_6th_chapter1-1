import { Router } from "../lib/Router";

export const getUrlFilters = context => {
  const q = context.query ?? Router.parseQuery();

  const category1 = q.category1 || "";
  const category2 = q.category2 || "";
  const limit = q.limit || 20;
  const search = q.search || "";
  const sort = q.sort || "price_asc";
  const page = Number(q.page) || 1;
  return { category1, category2, limit, search, sort, page };
};

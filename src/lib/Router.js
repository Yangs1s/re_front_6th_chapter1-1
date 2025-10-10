export class Router {
  #routes;
  #route;
  #baseUrl;
  #listeners;

  constructor(baseUrl = "") {
    this.#routes = new Map();
    this.#route = null;
    this.#baseUrl = baseUrl.replace(/\/+$/, "");
    this.#listeners = new Set();

    window.addEventListener("popstate", () => {
      this.#route = this.#findRoute();
      this.notify();
    });
  }

  get baseUrl() {
    return this.#baseUrl;
  }
  get route() {
    return this.#route;
  }
  get params() {
    return this.#route?.params ?? {};
  }

  get query() {
    return Router.parseQuery(window.location.search);
  }

  set query(query) {
    const newUrl = Router.getUrl(query, this.#baseUrl);
    this.navigate(newUrl);
  }

  get target() {
    return this.#route?.handler;
  }

  subscribe(callback) {
    this.#listeners.add(callback);
    // 구독 해제 함수 반환
    return () => this.#listeners.delete(callback);
  }
  // 라우트 등록
  addRoute(path, handler) {
    const paramsNames = [];
    const regexPath = path
      .replace(/:\w+/g, match => {
        paramsNames.push(match.slice(1));
        return "([^/]+)";
      })
      .replace(/\//g, "\\/");
    const regex = new RegExp(`^${this.#baseUrl}${regexPath}/?$`);
    this.#routes.set(path, {
      regex,
      paramsNames,
      handler,
    });
  }

  #findRoute(url = window.location.pathname) {
    const { pathname } = new URL(url, window.location.origin);
    for (const [path, route] of this.#routes) {
      const match = pathname.match(route.regex);
      if (match) {
        const matchParams = {};
        route.paramsNames.forEach((param, index) => {
          matchParams[param] = match[index + 1];
        });
        return { ...route, params: matchParams, path };
      }
    }
    return null;
  }

  getParams(path) {
    const { pathname } = new URL(path, window.location.origin);
    const { params } = this.#findRoute(pathname);
    return params;
  }

  start() {
    this.#route = this.#findRoute();
    this.notify();
  }

  navigate(path, state) {
    window.history.pushState(state, "", path);
    this.#route = this.#findRoute(path);
    this.notify(this.#route);
  }
  /**
   * 쿼리 파라미터를 객체로 파싱
   * @param {string} search - location.search 또는 쿼리 문자열
   * @returns {Object} 파싱된 쿼리 객체
   */
  static parseQuery(search = window.location.search) {
    // 쿼리 파라미터를 객체로 파싱
    const parameters = new URLSearchParams(search);
    // 쿼리 파라미터 객체
    const query = {};
    parameters.forEach((value, key) => {
      query[key] = value;
    });
    return query;
  }

  static buildQuery(query = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    return params.toString();
  }
  static getUrl(newQuery, baseUrl = "") {
    const currentQuery = Router.parseQuery();
    const updateQuery = { ...currentQuery, ...newQuery };

    Object.keys(updateQuery).forEach(key => {
      if (updateQuery[key] === undefined || updateQuery[key] === null || updateQuery[key] === "") {
        delete updateQuery[key];
      }
    });
    const queryString = Router.buildQuery(updateQuery);
    return `${baseUrl}${window.location.pathname.replace(baseUrl, "")}${queryString ? `?${queryString}` : ""}`;
  }
  notify() {
    this.#listeners.forEach(callback => callback());
  }
}

import { registerAllEvent } from "./event.js";
import { initRender } from "./render.js";
import { router } from "./router/Router.js";
import { cartStore, uiStore } from "./store/index.js";
import { registerGlobalEvent } from "./utils/eventUtil.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    })
  );

async function main() {
  registerAllEvent();
  registerGlobalEvent();
  // 렌더링 초기화
  initRender();

  // 구독 후 라우터 시작
  router.start();

  // 테스트를 위해 전역에 노출
  if (import.meta.env.MODE === "test") {
    window.uiStore = uiStore;
    window.cartStore = cartStore;
  }
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}

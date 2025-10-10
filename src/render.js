import { lifeCycleRegistry } from "./lib/lifeCycle.js";
import { router } from "./router/Router.js";
import { routes } from "./router/routes.js";
import { cartStore, uiStore } from "./store/index.js";
routes.forEach(route => {
  router.addRoute(route.path, route.component);
});

// 현재 렌더 트리에서 활성화된 컴포넌트와 상태를 기억한다
let activeComponent = null;
let activeCleanup = null;
let activeContext = null;

export const render = () => {
  const rootElement = document.getElementById("root");
  const route = router.route;

  if (!rootElement || !route) return;

  const component = router.target; // 현재 라우트가 가리키는 컴포넌트

  if (!component) return;

  // localStorage가 비어있으면 cartStore도 초기화 (테스트 환경 대응)
  if (!localStorage.getItem("cart") && cartStore.state.cart.length > 0) {
    cartStore.clearCart();
  }

  const lifecycle = lifeCycleRegistry.get(component) ?? {};
  // 컴포넌트와 라이프사이클 훅이 공유하는 렌더 컨텍스트를 구성한다
  const nextContext = {
    route, // 라우터가 찾은 현재 경로 정보
    query: router.query,
    params: route.params ?? {}, // 동적 세그먼트가 있을 때 전달되는 URL 파라미터
    state: activeContext?.state ?? {}, // 동일 컴포넌트 재렌더 시 이전 state를 재사용
    // 컴포넌트 내부에서 호출할 수 있는 상태 갱신 헬퍼
    updateState(patch) {
      // 1. 이전 상태 사본 확보
      const prevState = nextContext.state;
      // 2. 새 상태 생성 : patch가 함수면, prevState를 인자로 호출하고, 객체면 병합
      const nextState = typeof patch === "function" ? patch({ ...prevState }) : { ...prevState, ...patch };
      // 3. 상태 갱신
      nextContext.state = nextState;

      // 4. 컴퍼넌트 다시 렌더
      const html = component(nextContext);
      rootElement.innerHTML = html;

      // 5. updated 훅 호출
      lifecycle.updated?.({ ...activeContext, state: prevState }, nextContext);
      // 6. 현재 컨텍스트 갱신
      activeContext = nextContext;
    },
  };
  // 같은 컴포넌트가 다시 렌더될 때는 updated 훅만 호출한다
  if (component === activeComponent) {
    const html = component(nextContext); // ✅ 동일 컴포넌트여도 렌더
    rootElement.innerHTML = html;
    lifecycle.updated?.({ ...activeContext, state: nextContext.state }, nextContext);
    activeContext = nextContext;
    return;
  }

  // 다른 컴포넌트로 전환되면 정리 루틴을 먼저 실행한다
  // 이전 컴포넌트의 라이프사이클 훅을 호출한다
  if (typeof activeCleanup === "function") {
    activeCleanup();
    activeCleanup = null;
  }
  lifeCycleRegistry.get(activeComponent)?.unmounted?.(activeContext);

  const html = component(nextContext); // 새 컴포넌트를 실제 DOM에 반영
  rootElement.innerHTML = html;

  console.log("🎨 HTML rendered, length:", html.length);
  console.log("🎨 Checking for h1...");
  const h1Elements = rootElement.querySelectorAll("h1");
  console.log("🎨 h1 count:", h1Elements.length);
  h1Elements.forEach((h1, i) => {
    console.log(`🎨 h1[${i}]:`, h1.textContent);
  });

  // 새 컴포넌트 마운트 훅 실행 및 정리 함수 기억
  activeCleanup = lifecycle.mounted?.(nextContext) ?? null;
  activeComponent = component;
  activeContext = nextContext;
};

// 초기 렌더링
// 렌더링 전에 스토어 상태 변경 시 재렌더링 해줘야 함
export const initRender = () => {
  router.subscribe(render);
  // UiStore 상태 변경 시에도 재렌더링
  uiStore.subscribe(() => {
    render();
  });
  // CartStore 상태 변경 시에도 재렌더링
  cartStore.subscribe(() => {
    render();
  });
};

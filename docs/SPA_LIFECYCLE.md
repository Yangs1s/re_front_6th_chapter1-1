# SPA 구조와 라이프사이클 적용 개요

본 문서는 현재 프로젝트의 구조를 요약하고, 라이프사이클(mounted/updated/unmounted)을 적용했을 때의 목표 구조를 도식화하여 정리합니다. 또한 렌더 루프 의사 코드, ctx 인터페이스, 라이프사이클 등록 방법, 트러블슈팅을 포함합니다.

## 현재 구조 개요
- Router (`src/lib/Router.js`)
  - 라우트 등록: `addRoute(path, handler)` → 정규식/파라미터 이름 저장
  - 매칭: `#findRoute()` → `{ handler, params, path }` 반환
  - 알림: `start()`/`navigate()` → `notify()`로 구독자 호출
  - 현재 타깃 컴포넌트: `router.target` (게터, `route?.handler` 반환)

- Render (`src/render.js`)
  - 라우터에서 현재 컴포넌트(함수)를 받아 템플릿 문자열을 생성하고 `#root`에 삽입
  - 라이프사이클 훅 호출/상태 추적 없음 → 페이지 전환·업데이트 타이밍 관리 불가
  - 구독 순서 유의: `router.start()` 전에 `initRender()`로 구독을 먼저 걸어야 첫 렌더가 실행됨

- Page/Components
  - Page 예: `src/pages/Home.js` — 현재 `PageLayout`으로 감싼 HTML 문자열을 반환
  - 재사용 컴포넌트: `src/components/*` — 검색바, 필터, 스켈레톤 등 템플릿 조각

- Lifecycle Registry (`src/lib/lifeCycleRegistry.js`)
  - `export const lifeCycleRegistry = new WeakMap();`
  - 각 페이지에서 `lifeCycleRegistry.set(Component, { mounted, updated, unmounted })`로 훅을 등록하는 패턴을 목표로 함

### 현재 데이터 흐름 (도식)
```
URL 변경/popstate ─┐
                   │
            ┌──────▼──────┐   route.match → handler
            │   Router    │─────────────────────────┐
            └──────┬──────┘                         │
                   │ notify()                        │
                   ▼                                 │
            ┌──────────────┐                        │
            │   Render     │── comp(ctx) ──> HTML ──┴─> #root
            └──────────────┘
```
- 현재는 Render가 컴포넌트를 “한 번 호출하고 끝”이어서 라이프사이클/상태 전환 제어가 없음

---

## 라이프사이클 적용 목표 구조
라이프사이클을 적용하려면 Render가 “작은 프레임워크”처럼 현재/이전 컴포넌트와 컨텍스트를 추적하고, 적절한 타이밍에 훅을 호출해야 합니다.

### 목표 구조 (도식)
```
URL 변경/popstate ─┐
                   │
            ┌──────▼──────┐    route.match → handler (Component)
            │   Router    │───────────────────────────┐
            └──────┬──────┘                           │ notify()
                   │                                   │
                   ▼                                   │
            ┌────────────────┐    lifecycleRegistry    │
            │  Render(상태ful)│◀───────────────┐       │
            │  activeComponent│                │       │
            │  activeContext  │                │       │
            │  activeCleanup  │                │       │
            └──────┬─────────┘                │       │
                   │ comp(ctx)                │       │
                   ▼                          │       │
            ┌──────────────┐                  │       │
            │  Component   │──────────────┐   │       │
            └──────────────┘              │   │       │
                   ▲                      │   │       │
     mounted(ctx)/cleanup  updated(prev,next)  unmounted(ctx)
```

### Render 루프 핵심 (의사 코드)
- PageLayout 적용 위치는 “컴포넌트 내부” 또는 “렌더러” 중 택1 (현 프로젝트는 컴포넌트 내부 적용)

```js
let activeComponent = null;   // 이전 렌더의 컴포넌트 함수
let activeCleanup = null;     // 이전 mounted가 반환한 cleanup 함수
let activeContext = null;     // 이전 렌더 컨텍스트

export const render = () => {
  const root = document.getElementById('root');
  const route = router.route;
  if (!root || !route) return;

  const component = router.target; // 예: Home, Product
  if (!component) return;

  const lifecycle = lifeCycleRegistry.get(component) ?? {};
  const nextContext = {
    route,
    params: route.params ?? {},
    state: activeContext?.state ?? {},
    updateState(patch) {
      const prevState = nextContext.state;
      const nextState = typeof patch === 'function'
        ? patch({ ...prevState })
        : { ...prevState, ...patch };
      nextContext.state = nextState;

      const html = component(nextContext); // PageLayout은 컴포넌트 내부에서 적용
      root.innerHTML = html;

      lifecycle.updated?.({ ...activeContext, state: prevState }, nextContext);
      activeContext = nextContext;
    },
  };

  if (component === activeComponent) {
    lifecycle.updated?.(activeContext, nextContext);
    activeContext = nextContext;
    return;
  }

  activeCleanup?.();
  lifeCycleRegistry.get(activeComponent)?.unmounted?.(activeContext);

  const html = component(nextContext);
  root.innerHTML = html;

  activeCleanup = lifecycle.mounted?.(nextContext) ?? null;
  activeComponent = component;
  activeContext = nextContext;
};
```

### ctx 인터페이스(예)
- `route`: 현재 라우트 객체 (`router.route`)
- `params`: 동적 파라미터 객체 (미사용 시 `{}`)
- `state`: 페이지 로컬 상태 객체 (없으면 `{}`로 시작)
- `updateState(patch)`: 상태 갱신 헬퍼 (객체 병합 또는 함수 패치)

### 라이프사이클 훅 계약(예)
- `mounted(ctx)`: DOM 반영 직후 1회. 이벤트 바인딩/초기 fetch. cleanup 함수 반환 가능.
- `updated(prevCtx, nextCtx)`: 같은 컴포넌트에서 상태/파라미터 변경 시 호출.
- `unmounted(ctx)`: 다른 컴포넌트로 전환 직전 정리.

### 등록 방법(WeakMap)
```js
// src/lib/lifeCycleRegistry.js
export const lifeCycleRegistry = new WeakMap();

// 예: src/pages/Home.js
import { lifeCycleRegistry } from '../lib/lifeCycleRegistry.js';

const Home = (ctx) => { /* PageLayout(...) */ };

lifeCycleRegistry.set(Home, {
  async mounted(ctx) {
    // 데이터 로딩 → ctx.updateState({ ... })
    return () => {/* remove listeners */};
  },
  updated(prev, next) { /* 상태/파라미터 변화 대응 */ },
  unmounted(ctx) { /* 추가 정리 */ },
});
```

---

## 현재 vs 목표 구조 비교 요약
- 현재
  - Render는 단순 템플릿 삽입만 담당 (라이프사이클/상태 추적 없음)
  - Page는 PageLayout 포함 템플릿 함수 중심
  - 라이프사이클 등록 시도는 있으나 호출 지점이 없어 무용
- 목표
  - Render가 활성 컴포넌트/컨텍스트/클린업 추적
  - 같은 컴포넌트: `updated`만 호출·부분 갱신
  - 다른 컴포넌트: `cleanup → unmounted → 새 렌더 → mounted`
  - 컴포넌트는 PageLayout 포함 템플릿 + 라이프사이클 훅 제공

---

## 트러블슈팅
- 첫 렌더가 나오지 않음
  - 원인: `router.start()`를 `initRender()`보다 먼저 호출 → 구독 전에 notify 발생
  - 조치: `initRender()`로 구독 설정 후 `router.start()` 호출

- `Cannot access 'lifecycleRegistry' before initialization`
  - 원인: 순환 import (예: Home.js ↔ render.js)
  - 조치: `lifeCycleRegistry`는 별도 파일(`src/lib/lifeCycleRegistry.js`)로 분리하여 양쪽에서 참조

- `ctx.state` 구조분해 에러
  - 원인: 첫 렌더에서 `state`가 `undefined`
  - 조치: `const { ... } = ctx.state ?? {};`로 방어, render에서 `state: activeContext?.state ?? {}` 보장

- `unmounted`가 호출되지 않음
  - 원인: 새 컴포넌트 기준으로 훅 조회
  - 조치: 반드시 이전 컴포넌트(`activeComponent`) 기준으로 훅을 조회/호출

- 라우트 매칭 이상 (루트가 과매칭)
  - 원인: 정규식 끝 앵커 미사용
  - 조치: `new RegExp(^${base}${regexPath}/?$)` 등으로 보완 (선택 사항)

---

## 체크리스트 (적용 순서)
1. `lifeCycleRegistry`를 별도 파일로 유지 (`src/lib/lifeCycleRegistry.js`)
2. `render.js`에 활성 컴포넌트/컨텍스트/클린업 상태 및 라이프사이클 호출 골격 추가
3. `initRender()`를 `router.start()` 이전에 호출 (최초 렌더 보장)
4. 각 페이지에서 `lifeCycleRegistry.set(Page, { ... })`로 훅 등록
5. `ctx.state ?? {}` 방어 코드 반영, 필요 시 `ctx.updateState` 사용

이로써, 현재 코드 스타일(Page 내부에서 PageLayout 적용)을 유지하면서도 라이프사이클이 살아있는 SPA 구조를 만들 수 있습니다.

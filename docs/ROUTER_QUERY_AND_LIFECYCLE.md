# Router Query + Lifecycle Troubleshooting

이 문서는 이번 작업 중 겪었던 이슈를 정리하고, 왜 지금은 동작하는지(루프가 멈춘 이유)를 코드 기준으로 설명합니다. 코드 변경 없이 개념 정리와 최소 스니펫만 포함합니다.

## 왜 무한 루프가 발생했나
- 원인: `updated`에서 항상 fetch → `updateState`를 호출하여 다시 `updated`가 호출되는 구조. 변화가 없는 상황에서도 “변경”으로 인식했기 때문.
- 해결: “현재 URL 쿼리 스냅샷”과 “직전 스냅샷(state)”을 비교해 같으면 즉시 `return`.
- 적용 방식(핵심 로직)
  - `mounted`: 최초 렌더 후 현재 쿼리를 정규화해 스냅샷으로 저장
  - `updated`: 현재 쿼리 스냅샷이 state에 저장된 값과 같으면 즉시 종료
  - fetch 후 `updateState` 시에도 현재 쿼리 스냅샷을 함께 저장

스니펫(핵심 라인만)

```js
// mounted
const qs = new URLSearchParams(window.location.search).toString();
ctx.updateState({ ..., query: qs });

// updated
const qs = new URLSearchParams(window.location.search).toString();
if (qs === nextCtx.state?.query) return; // 루프 차단
// ...fetch
nextCtx.updateState({ ..., query: qs }); // 스냅샷 갱신
```

이렇게 하면 `updateState`로 인해 `updated`가 재호출되어도 바로 `return` 되므로 반복이 멈춥니다.

## 왜 쿼리 파라미터가 route에 “등록”되지 않았나
- 설계상 구분: `route.params`는 경로 파라미터(`/product/:id`)만 포함. 쿼리(`?category1=...`)는 `findRoute`에서 다루지 않음.
- 현재 구현(`src/lib/Router.js`): `#findRoute()`가 `pathname`만 보고 매칭 → 쿼리 미포함이 정상 동작.
- 사용 패턴 권장:
  - 경로 파라미터: `ctx.params.id`
  - 쿼리 파라미터: `ctx.query`(또는 `Router.parseQuery()`)
- 대안(원하면): `#findRoute()`에서 쿼리를 병합해 `params`로 같이 반환하는 방법도 가능.

## 왜 링크는 바뀌는데 홈만 렌더되었나
- 루트 과매칭:
  - 정규식이 끝 앵커가 없어 `/`가 모든 경로에 매칭.
  - 정규식 개선: `new RegExp(^${base}${regexPath}/?$)` 형태로 끝 앵커 추가 권장.
- 등록 순서:
  - `routes`에서 `/`를 먼저 등록하면 Map 순회상 루트가 먼저 매칭됨. 더 구체적인 경로(`/product/:id`)를 먼저 등록.

## 왜 쿼리가 URL에 보이는데 뒤에 제대로 붙지 않았나
- 문제: `buildQuery` 직렬화 버그.
  - 현재 구현은 인자를 받지 않고, `URLSearchParams` 인스턴스를 `Object.entries`로 순회해 항상 빈 문자열 반환.
- 올바른 형태(개념 스니펫):

```js
static buildQuery(obj = {}) {
  const sp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  return sp.toString();
}
```

- 사용: `Router.getUrl(patch)` → `router.navigate(url)`.
- 참고: `router.getUrl`이 아닌 `Router.getUrl`(정적 메서드)로 호출.

## 왜 클릭 이벤트가 먹지 않았나
- 구조 미스매치: 델리게이션 레지스트리가 `eventType → selector → handler` 형태가 아니거나, 초기화 타이밍이 잘못되어 리스너가 실제로 붙지 않음.
- 개선 포인트:
  - `addEvent`가 처음 보는 `eventType`에 대해 즉시 `document.body.addEventListener(type, globalHandler)` 등록.
  - 델리게이션 처리 시 `e.target.closest(selector)`로 매칭.

## 왜 ProductList가 렌더되지 않았나
- 인자 형태 불일치: `ProductGrid({ products })`로 객체를 넘겼는데 정의는 배열을 기대(`products.map`). → `ProductGrid(products)`로 수정.

## 왜 리소스를 많이 먹는 느낌이 났나
- 동일 컴포넌트에서도 `root.innerHTML`로 전체 교체.
- 반복 콘솔 로그(특히 리스트 렌더 루프 내부).
- 큰 정적 마크업(상세 페이지) 그대로 삽입.
- 대응:
  - `updated`에서 필요한 영역만 부분 갱신(그리드/총개수 등)
  - 루프 내 콘솔 제거
  - cleanup 가드: `activeCleanup?.(); activeCleanup = null;`

## 체크리스트(빠른 자가 점검)
- 렌더 구독 순서: `initRender()` → `router.start()`
- 라우트 정규식: 끝 앵커(`/?$`) 적용
- 라우트 등록 순서: 구체 → 루트
- 쿼리 직렬화: `buildQuery(obj)` 구현
- 정적 메서드: `Router.getUrl(...)`로 URL 구성
- 클릭 델리게이션: `addEvent`에서 타입별 최초 등록
- 루프 가드: `mounted`에서 쿼리 스냅샷 저장, `updated`에서 동일성 비교 후 return

## 파일별 참고
- Router: `src/lib/Router.js`
- Render: `src/render.js`
- Home: `src/pages/Home.js`
- 이벤트 유틸: `src/utils/eventUtil.js`
- 쿼리 파싱 유틸(선택): `src/utils/getUrlFilters.js`

이 문서의 목적은 “왜 그 문제가 생겼는지”와 “코드에서 어디가 원인이었는지”를 빠르게 추적할 수 있도록 하는 것입니다. 실제 변경은 최소화하여, 현재 구조(쿼리 분리, updated 가드) 기반으로 안정화되었습니다.

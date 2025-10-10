let eventHandler = {};

// 테스트를 위해 전역에 노출
if (typeof window !== "undefined") {
  window.eventHandler = eventHandler;
}
const globalEventHandler = e => {
  const handlers = eventHandler[e.type];
  if (!handlers) return;

  // 각 선택자에 대해 확인
  for (const [selector, handler] of Object.entries(handlers)) {
    // 키보드 이벤트 처리 (특수 케이스)
    if (e.type === "keydown" && selector.startsWith("key:")) {
      const keyName = selector.replace("key:", "");
      if (e.key === keyName) {
        try {
          handler(e);
        } catch (error) {
          console.error(`키보드 이벤트 핸들러 실행 오류 (${keyName}):`, error);
        }
      }
      continue;
    }

    // 일반 DOM 이벤트 처리
    const targetElement = e.target.closest(selector);

    // 일치하는 요소가 있으면 핸들러 실행
    if (targetElement) {
      try {
        handler(e);
      } catch (error) {
        console.error(`이벤트 핸들러 실행 오류 (${selector}):`, error);
      }
    }
  }
};

export const registerGlobalEvent = (() => {
  let initailize = false;

  return () => {
    if (initailize) return;

    // 모든 이벤트 타입에 대해 리스너 등록
    ["click", "change", "keydown", "input"].forEach(type => {
      document.addEventListener(type, globalEventHandler);
    });

    initailize = true;
  };
})();

export const addEvent = (eventType, selector, handler) => {
  if (!eventHandler[eventType]) {
    eventHandler[eventType] = {};
  }
  eventHandler[eventType][selector] = handler;
};

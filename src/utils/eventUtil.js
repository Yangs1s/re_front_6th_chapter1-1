let eventHandler = {};
const globalEventHandler = e => {
  const handlers = eventHandler[e.type];
  if (!handlers) return;

  // 각 선택자에 대해 확인
  for (const [selector, handler] of Object.entries(handlers)) {
    const targetElement = e.target.closest(selector);

    // 일치하는 요소가 있으면 핸들러 실행
    if (targetElement) {
      try {
        handler(e);
        console.log("🔥 이벤트 핸들러 실행:", selector);
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

    console.log("이벤트 리스너 등록중..");
    Object.keys(eventHandler).forEach(type => {
      console.log("이벤트 리스너 등록중..", type);
      document.body.addEventListener(type, globalEventHandler);
    });

    initailize = true;
    console.log("이벤트 리스너 등록완료");
  };
})();

export const addEvent = (eventType, selector, handler) => {
  console.log("addEvent", selector, eventType, handler);

  if (!eventHandler[eventType]) {
    eventHandler[eventType] = {};
  }
  eventHandler[eventType][selector] = handler;
};

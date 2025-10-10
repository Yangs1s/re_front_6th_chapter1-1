// Toast 컴포넌트 - 다양한 타입의 알림 메시지를 표시

/**
 * 개별 Toast 아이템 컴포넌트
 * @param {string} type - 토스트 타입 ('success', 'info', 'error')
 * @param {string} message - 표시할 메시지
 * @param {boolean} showCloseButton - 닫기 버튼 표시 여부 (기본값: true)
 */
export const ToastItem = ({ type = "success", message = "" }) => {
  // 타입별 배경색만 설정
  const getBgColor = type => {
    switch (type) {
      case "success":
        return "bg-green-600";
      case "info":
        return "bg-blue-600";
      case "error":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  return `<div class="fixed top-4 left-1/2 z-50 ${getBgColor(type)} text-white px-4 py-3 rounded-lg shadow-lg" style="transform: translateX(-50%); max-width: 24rem; font-size: 0.875rem; font-weight: 500;">${message}</div>`;
};

/**
 * Toast 컨테이너 컴포넌트 - 여러 개의 토스트를 세로로 배열
 * @param {Array} toasts - 토스트 배열 [{ type, message, showCloseButton }]
 */
export const ToastContainer = ({ toasts = [] }) => {
  if (!toasts.length) return "";

  return `
    <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 items-center justify-center mx-auto" style="width: fit-content;">
      ${toasts.map(toast => ToastItem(toast)).join("")}
    </div>
  `;
};

/**
 * 기본 토스트 메시지들 (sample.js에서 사용하던 것들)
 */
export const DefaultToasts = () => {
  const defaultToasts = [
    {
      type: "success",
      message: "장바구니에 추가되었습니다",
      showCloseButton: true,
    },
    {
      type: "info",
      message: "선택된 상품들이 삭제되었습니다",
      showCloseButton: true,
    },
    {
      type: "error",
      message: "오류가 발생했습니다.",
      showCloseButton: true,
    },
  ];

  return ToastContainer({ toasts: defaultToasts });
};

// 개별 토스트 메시지 생성 헬퍼 함수들
export const SuccessToast = (message = "성공했습니다") => ToastItem({ type: "success", message });

export const InfoToast = (message = "정보입니다") => ToastItem({ type: "info", message });

export const ErrorToast = (message = "오류가 발생했습니다") => ToastItem({ type: "error", message });

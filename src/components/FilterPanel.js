const buildCategoryButtons = (categories = {}, selectedValue = "") => {
  if (!Object.keys(categories).length) {
    return '<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>';
  }

  return Object.keys(categories)
    .map(value => {
      const isActive = value === selectedValue;
      const baseClass = "category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors";
      const activeClass = isActive
        ? " bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-100"
        : " bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

      return `
        <button data-category1="${value}" class="${baseClass}${activeClass} category-item">
          ${value}
        </button>
      `;
    })
    .join("");
};

const buildSelectOptions = (options = [], selectedValue) => {
  return options
    .map(({ value, label }) => {
      const selectedAttr = String(value) === String(selectedValue) ? " selected" : "";
      return `
        <option value="${value}"${selectedAttr}>
          ${label}
        </option>
      `;
    })
    .join("");
};

export const FilterPanel = ({
  categories = {},
  selectedCategory = "",
  showReset = true,
  limitOptions = [
    { value: 10, label: "10개" },
    { value: 20, label: "20개" },
    { value: 50, label: "50개" },
    { value: 100, label: "100개" },
  ],
  limitValue = 20,
  sortOptions = [
    { value: "price_asc", label: "가격 낮은순" },
    { value: "price_desc", label: "가격 높은순" },
    { value: "name_asc", label: "이름순" },
    { value: "name_desc", label: "이름 역순" },
  ],
  sortValue = "price_asc",
  limitSelectId = "limit-select",
  sortSelectId = "sort-select",
} = {}) => {
  return `

      <div class="space-y-3">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">카테고리:</label>
            ${
              showReset
                ? '<button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>'
                : ""
            }
          </div>
          <div class="flex flex-wrap gap-2">
            ${buildCategoryButtons(categories, selectedCategory)}
          </div>
        </div>

        <div class="flex gap-2 items-center justify-between">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600" for="${limitSelectId}">개수:</label>
            <select
              id="${limitSelectId}"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              ${buildSelectOptions(limitOptions, limitValue)}
            </select>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600" for="${sortSelectId}">정렬:</label>
            <select
              id="${sortSelectId}"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              ${buildSelectOptions(sortOptions, sortValue)}
            </select>
          </div>
        </div>
      </div>
   
  `;
};

export default FilterPanel;

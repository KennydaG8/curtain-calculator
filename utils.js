// utils.js

/**
 * Gets the numeric value from an element safely.
 * @param {HTMLElement|null} element - The HTML element.
 * @param {number} [defaultValue=0] - The value to return if parsing fails or value is not positive.
 * @returns {number} The parsed number or the default value.
 */
export function getNumberValue(element, defaultValue = 0) {
    if (!element) return defaultValue;
    const value = parseFloat(element.value);
    return !isNaN(value) && value >= 0 ? value : defaultValue;
}

/**
 * Gets the string value from an element safely. Handles radio buttons within a group/section.
 * @param {HTMLElement|null} element - The HTML element.
 * @returns {string} The element's value or an empty string.
 */
export function getStringValue(element) {
   if (!element) return '';
   // Special handling for radio button groups within a context
   if (element.type === 'radio') {
        const groupName = element.name;
        const section = element.closest('.window-section'); // Find parent section
        const checkedRadio = section ? section.querySelector(`input[name="${groupName}"]:checked`) : document.querySelector(`input[name="${groupName}"]:checked`); // Fallback if not in section?
        return checkedRadio ? checkedRadio.value : '';
    }
   return element.value;
}

/**
 * Gets the filename from a file input element safely.
 * @param {HTMLElement|null} element - The file input element.
 * @returns {string} The filename or '未選擇檔案'.
 */
 export function getFileNameFromInput(element) {
     return element?.files?.length > 0 ? element.files[0].name : '未選擇檔案';
 }

/**
 * Creates a paragraph HTML string if the value is valid.
 * @param {string} label - The label text.
 * @param {string|number} value - The value to display.
 * @param {string} [unit=''] - An optional unit to append.
 * @returns {string} The HTML paragraph string or an empty string.
 */
export function createParagraph(label, value, unit = '') {
    const valueExists = value !== null && value !== undefined && value !== '';
    return valueExists ? `<p><strong>${label}:</strong> ${value} ${unit}</p>` : '';
}

/**
 * Formats a number as currency (rounded integer with commas).
 * @param {number} value - The number to format.
 * @returns {string} The formatted currency string.
 */
export function formatCurrency(value) {
    return Math.round(value).toLocaleString();
}
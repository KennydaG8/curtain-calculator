// Constants
const CM_SQUARE_TO_TSAI = 918.09; // 1才 = 30.3cm * 30.3cm ≈ 918.09 cm²

// --- Helper Functions ---

/**
 * Gets the numeric value from an element ID safely.
 * @param {string} id - The ID of the HTML element.
 * @param {number} [defaultValue=0] - The value to return if parsing fails or value is not positive.
 * @returns {number} The parsed number or the default value.
 */
function getNumberValue(id, defaultValue = 0) {
    const element = document.getElementById(id);
    const value = parseFloat(element?.value);
    // Return the value if it's a non-negative number, otherwise the default
    return !isNaN(value) && value >= 0 ? value : defaultValue;
}

/**
 * Gets the string value from an element ID safely. Handles radio buttons.
 * @param {string} id - The ID of the HTML element (can be one radio button in a group).
 * @returns {string} The element's value or an empty string.
 */
function getValue(id) {
   const element = document.getElementById(id);
   if (!element) return '';

   // Special handling for radio button groups
   if (element.type === 'radio') {
        const groupName = element.name;
        const checkedRadio = document.querySelector(`input[name="${groupName}"]:checked`);
        return checkedRadio ? checkedRadio.value : '';
    }
   return element.value;
}

/**
 * Gets the filename from a file input element safely.
 * @param {string} id - The ID of the file input element.
 * @returns {string} The filename or '未選擇檔案'.
 */
 function getFileName(id) {
     const element = document.getElementById(id);
     return element?.files?.length > 0 ? element.files[0].name : '未選擇檔案';
 }

/**
 * Creates a paragraph HTML string if the value is valid.
 * @param {string} label - The label text.
 * @param {string|number} value - The value to display.
 * @param {string} [unit=''] - An optional unit to append.
 * @returns {string} The HTML paragraph string or an empty string.
 */
function createParagraph(label, value, unit = '') {
    // Check if value exists or is 0 (valid number)
    const valueExists = value !== null && value !== undefined && value !== '';
    return valueExists ? `<p><strong>${label}:</strong> ${value} ${unit}</p>` : '';
}

/**
 * Formats a number as currency (rounded integer with commas).
 * @param {number} value - The number to format.
 * @returns {string} The formatted currency string.
 */
function formatCurrency(value) {
    return Math.round(value).toLocaleString(); // Format to integer with commas
}

// --- Core Calculation Logic ---

/**
 * Calculates prices based on form inputs and updates the UI.
 * @returns {object} An object containing calculated values.
 */
function calculatePrice() {
    const width = getNumberValue('windowWidth');
    const height = getNumberValue('windowHeight');

    // 1. Calculate Area (才)
    const areaCm2 = width * height;
    const areaTsai = areaCm2 > 0 ? (areaCm2 / CM_SQUARE_TO_TSAI) : 0;
    const calculatedAreaEl = document.getElementById('calculatedArea');
    if(calculatedAreaEl) calculatedAreaEl.textContent = areaTsai.toFixed(2); // Display area

    // 2. Calculate Material Subtotals
    const unitPrice1 = getNumberValue('material1UnitPrice');
    const unitPrice2 = getNumberValue('material2UnitPrice');
    const unitPrice3 = getNumberValue('material3UnitPrice');

    const total1 = areaTsai * unitPrice1;
    const total2 = areaTsai * unitPrice2;
    const total3 = areaTsai * unitPrice3;

    const mat1TotalEl = document.getElementById('material1Total');
    const mat2TotalEl = document.getElementById('material2Total');
    const mat3TotalEl = document.getElementById('material3Total');
    if(mat1TotalEl) mat1TotalEl.textContent = formatCurrency(total1);
    if(mat2TotalEl) mat2TotalEl.textContent = formatCurrency(total2);
    if(mat3TotalEl) mat3TotalEl.textContent = formatCurrency(total3);

    // 3. Determine Selected Material and its Price
    const selectedMaterialValue = getValue('mat1'); // Get value from the radio group name
    let selectedMaterialPrice = 0;
    let selectedUnitPrice = 0;
    if (selectedMaterialValue === 'mat1') {
        selectedMaterialPrice = total1;
        selectedUnitPrice = unitPrice1;
    } else if (selectedMaterialValue === 'mat2') {
        selectedMaterialPrice = total2;
        selectedUnitPrice = unitPrice2;
    } else if (selectedMaterialValue === 'mat3') {
        selectedMaterialPrice = total3;
        selectedUnitPrice = unitPrice3;
    }

    // Update the disabled 'unitPrice' field
    const unitPriceInput = document.getElementById('unitPrice');
    if(unitPriceInput) unitPriceInput.value = selectedUnitPrice > 0 ? selectedUnitPrice.toFixed(2) : ''; // Show blank if 0


    // 4. Determine Installation Cost
    const installMethod = getValue('installMethod');
    let installCost = 0;
    if (installMethod === '牆裝') {
        installCost = getNumberValue('installWallCost');
    } else if (installMethod === '天花板裝') {
        installCost = getNumberValue('installCeilingCost');
    }
    // Add logic here if '其他' needs a cost calculation

    // 5. Calculate Grand Total
    const grandTotal = selectedMaterialPrice + installCost;
    const subTotal = grandTotal; // Subtotal includes material + install cost

    // Update disabled fields and display span
    const subtotalInput = document.getElementById('subtotal');
    const totalPriceInput = document.getElementById('totalPrice');
    const grandTotalDisplay = document.getElementById('grandTotalDisplay');

    if(subtotalInput) subtotalInput.value = subTotal > 0 ? subTotal.toFixed(0) : '';
    if(totalPriceInput) totalPriceInput.value = grandTotal > 0 ? grandTotal.toFixed(0) : '';
    if(grandTotalDisplay) grandTotalDisplay.textContent = formatCurrency(grandTotal);


    // Return calculated values for quote generation
    return {
        areaTsai: areaTsai.toFixed(2),
        selectedUnitPrice: selectedUnitPrice,
        selectedMaterialPrice: Math.round(selectedMaterialPrice),
        installMethod: installMethod,
        installCost: Math.round(installCost),
        grandTotal: Math.round(grandTotal)
    };
}

// --- Document Generation Functions ---

/**
 * Generates the content for the Customer Quote preview section.
 * @param {object} data - Basic form data.
 * @param {object} calculated - Calculated pricing data.
 */
 function generateQuote(data, calculated) {
    let content = createParagraph('專案名稱/地址', data.projectName);
    content += createParagraph('丈量日期', data.measureDate);
    content += createParagraph('丈量人員', data.measurePersonnel);
    content += createParagraph('樓層/空間', data.floorSpace);
    content += createParagraph('現場照片', data.sitePhoto);
    content += createParagraph('窗戶寬度', data.windowWidth, 'cm');
    content += createParagraph('窗戶高度', data.windowHeight, 'cm');
    content += createParagraph('計算面積', calculated.areaTsai, '才');
    content += createParagraph('窗簾盒/預留空間', data.boxDepth);
    content += createParagraph('窗框/開窗方式', data.frameType);
    content += createParagraph('窗簾種類', data.curtainType);
    content += createParagraph('開法', data.openingStyle);

    content += '<hr style="border-top: 1px dashed #ccc;">';
    content += `<h3>計價項目</h3>`;
    const selectedMaterialRadio = document.querySelector('input[name="materialSelection"]:checked');
    const selectedMaterialLabel = selectedMaterialRadio ? document.querySelector(`label[for="${selectedMaterialRadio.id}"]`)?.textContent.replace(':','').trim() : '未選擇';
    content += createParagraph('選用材質', selectedMaterialLabel);
    content += createParagraph('材質單價', calculated.selectedUnitPrice > 0 ? calculated.selectedUnitPrice : '-', '/才');
    content += createParagraph('材質小計', formatCurrency(calculated.selectedMaterialPrice), '$');
    content += createParagraph('安裝方式', calculated.installMethod);
    content += createParagraph('安裝加價', formatCurrency(calculated.installCost), '$');
    content += createParagraph('電源需求', data.powerReq);
    content += '<hr style="border-top: 1px dashed #ccc;">';

    content += createParagraph('備註(現場狀況)', data.remarks);
    if (data.installReminder) {
         content += createParagraph('施工提醒', data.installReminder);
    }

    content += `<h3 style='text-align:right; margin-top: 20px;'>總計金額: $${formatCurrency(calculated.grandTotal)}</h3>`;

    const quoteContentEl = document.getElementById('quoteContent');
    const quoteOutputEl = document.getElementById('quoteOutput');
    if(quoteContentEl) quoteContentEl.innerHTML = content;
    if(quoteOutputEl) quoteOutputEl.style.display = 'block';
}

/**
 * Generates the content for the Factory Order preview section.
 * @param {object} data - Basic form data.
 */
function generateFactoryOrder(data) {
     let content = createParagraph('製作標示 (樓層/空間)', data.floorSpace);
     content += createParagraph('窗戶寬度(cm)', data.windowWidth);
     content += createParagraph('窗戶高度(cm)', data.windowHeight);
     // Optional: Add calculated area if useful for factory
     // content += createParagraph('計算面積(才)', calculatePrice().areaTsai);
     content += createParagraph('軌道依據 (窗簾盒/預留)', data.boxDepth);
     content += createParagraph('設計依據 (窗框/開窗)', data.frameType);
     content += createParagraph('產品分類 (窗簾種類)', data.curtainType);
     content += createParagraph('製作參數 (開法)', data.openingStyle);
     content += createParagraph('核心資訊 (布料/布號)', data.fabricInfo); // Keep this for specifics
     content += createParagraph('核心資訊 (紗料/紗號)', data.sheerInfo);
     content += createParagraph('軌道加工 (種類/顏色)', data.trackInfo);
     content += createParagraph('配件選擇 (安裝方式)', data.installMethod);
      if (data.powerReq) {
         content += createParagraph('關鍵製作 (電源需求)', data.powerReq);
     }
      if (data.factoryNotes) {
         content += createParagraph('工廠備註', data.factoryNotes);
     }

     const factoryContentEl = document.getElementById('factoryContent');
     const factoryOutputEl = document.getElementById('factoryOutput');
     if(factoryContentEl) factoryContentEl.innerHTML = content;
     if(factoryOutputEl) factoryOutputEl.style.display = 'block';
}

/**
 * Generates the content for the Installation Work Order preview section.
 * @param {object} data - Basic form data.
 * @param {object} calculated - Calculated pricing data (only installMethod needed here).
 */
function generateInstallOrder(data, calculated) {
      let content = createParagraph('定位 (專案名稱/地址)', data.projectName);
      content += createParagraph('責任 (丈量日期)', data.measureDate);
      content += createParagraph('責任 (丈量人員)', data.measurePersonnel);
      content += createParagraph('位置 (樓層/空間)', data.floorSpace);
      content += createParagraph('辨識 (現場照片)', data.sitePhoto);
      content += createParagraph('用料核對 (寬度cm)', data.windowWidth);
      content += createParagraph('用料核對 (高度cm)', data.windowHeight);
      content += createParagraph('安裝確認 (窗簾盒/預留)', data.boxDepth);
      content += createParagraph('安裝確認 (窗框/開窗)', data.frameType);
      content += createParagraph('安裝項目 (窗簾種類)', data.curtainType);
      content += createParagraph('安裝方向 (開法)', data.openingStyle);
      content += createParagraph('物料核對 (布料/布號)', data.fabricInfo);
      content += createParagraph('物料核對 (紗料/紗號)', data.sheerInfo);
      content += createParagraph('物料核對 (軌道種類/顏色)', data.trackInfo);
      content += createParagraph('施工方式 (安裝方式)', calculated.installMethod);
      content += createParagraph('現場注意 (備註)', data.remarks);
      if (data.installReminder) {
           content += createParagraph('重要提醒 (施工提醒)', data.installReminder);
      }
       if (data.powerReq) {
          content += createParagraph('電動相關 (電源需求)', data.powerReq);
      }

      const installContentEl = document.getElementById('installContent');
      const installOutputEl = document.getElementById('installOutput');
      if(installContentEl) installContentEl.innerHTML = content;
      if(installOutputEl) installOutputEl.style.display = 'block';
 }

/**
 * Main function to handle generating document previews based on selections.
 */
function handleGenerateDocuments() {
    // Hide outputs first
    const quoteOutputEl = document.getElementById('quoteOutput');
    const factoryOutputEl = document.getElementById('factoryOutput');
    const installOutputEl = document.getElementById('installOutput');
    const quoteContentEl = document.getElementById('quoteContent');
    const factoryContentEl = document.getElementById('factoryContent');
    const installContentEl = document.getElementById('installContent');

    if(quoteOutputEl) quoteOutputEl.style.display = 'none';
    if(factoryOutputEl) factoryOutputEl.style.display = 'none';
    if(installOutputEl) installOutputEl.style.display = 'none';
    if(quoteContentEl) quoteContentEl.innerHTML = '';
    if(factoryContentEl) factoryContentEl.innerHTML = '';
    if(installContentEl) installContentEl.innerHTML = '';


    // Perform final calculation before generating
     const calculatedData = calculatePrice();

    // Collect basic form data
     const formData = {
         projectName: getValue('projectName'),
         measureDate: getValue('measureDate'),
         measurePersonnel: getValue('measurePersonnel'),
         floorSpace: getValue('floorSpace'),
         sitePhoto: getFileName('sitePhoto'),
         windowWidth: getValue('windowWidth'),
         windowHeight: getValue('windowHeight'),
         boxDepth: getValue('boxDepth'),
         frameType: getValue('frameType'),
         curtainType: getValue('curtainType'),
         openingStyle: getValue('openingStyle'),
         fabricInfo: getValue('fabricInfo'),
         sheerInfo: getValue('sheerInfo'),
         trackInfo: getValue('trackInfo'),
         installMethod: getValue('installMethod'), // Base selection from dropdown
         remarks: getValue('remarks'),
         installReminder: getValue('installReminder'),
         powerReq: getValue('powerReq'),
         factoryNotes: getValue('factoryNotes')
     };


    // Check checkboxes and call generation functions
    if (document.getElementById('generateQuote')?.checked) {
        generateQuote(formData, calculatedData);
    }
    if (document.getElementById('generateFactoryOrder')?.checked) {
        generateFactoryOrder(formData);
    }
    if (document.getElementById('generateInstallOrder')?.checked) {
        generateInstallOrder(formData, calculatedData);
    }
}

// --- Event Listeners ---

// Wait for the DOM to be fully loaded before attaching listeners
document.addEventListener('DOMContentLoaded', () => {
    // Calculation triggers
    const fieldsToRecalculate = [
        'windowWidth', 'windowHeight', 'material1UnitPrice', 'material2UnitPrice',
        'material3UnitPrice', 'installWallCost', 'installCeilingCost'
    ];
    fieldsToRecalculate.forEach(id => {
        const element = document.getElementById(id);
        element?.addEventListener('input', calculatePrice);
    });

    const installMethodSelect = document.getElementById('installMethod');
    installMethodSelect?.addEventListener('change', calculatePrice);

    const materialRadios = document.querySelectorAll('input[name="materialSelection"]');
    materialRadios.forEach(radio => {
        radio.addEventListener('change', calculatePrice);
    });

    // Document generation trigger
    const generateBtn = document.getElementById('generateBtn');
    generateBtn?.addEventListener('click', handleGenerateDocuments);

    // Initial calculation on page load
    calculatePrice();
});
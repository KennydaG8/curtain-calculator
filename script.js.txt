// Constants
const CM_SQUARE_TO_TSAI = 918.09; // 1才 = 30.3cm * 30.3cm ≈ 918.09 cm²
let windowCounter = 0; // Counter for unique window identifiers

// --- Helper Functions --- (Mostly same as before)

function getNumberValue(element, defaultValue = 0) {
    if (!element) return defaultValue;
    const value = parseFloat(element.value);
    return !isNaN(value) && value >= 0 ? value : defaultValue;
}

function getStringValue(element) {
    if (!element) return '';
    // Special handling for radio button groups within a context
    if (element.type === 'radio') {
         // Find the checked radio *within the same group* inside the closest section
         const groupName = element.name;
         const section = element.closest('.window-section'); // Find parent section
         const checkedRadio = section ? section.querySelector(`input[name="${groupName}"]:checked`) : null;
         return checkedRadio ? checkedRadio.value : '';
     }
    return element.value;
}

 function getFileNameFromInput(element) {
     return element?.files?.length > 0 ? element.files[0].name : '未選擇檔案';
 }

function createParagraph(label, value, unit = '') {
    const valueExists = value !== null && value !== undefined && value !== '';
    return valueExists ? `<p><strong>${label}:</strong> ${value} ${unit}</p>` : '';
}

function formatCurrency(value) {
    return Math.round(value).toLocaleString();
}


// --- Core Window Calculation Logic ---

/**
 * Calculates prices for a specific window section based on its inputs.
 * @param {HTMLElement} windowSection - The .window-section element.
 * @returns {object} An object containing calculated values for this window.
 */
function calculatePriceForWindow(windowSection) {
    if (!windowSection) return null;

    const widthInput = windowSection.querySelector('.windowWidth');
    const heightInput = windowSection.querySelector('.windowHeight');
    const areaDisplay = windowSection.querySelector('.calculatedArea');

    const width = getNumberValue(widthInput);
    const height = getNumberValue(heightInput);

    // 1. Calculate Area (才)
    const areaCm2 = width * height;
    const areaTsai = areaCm2 > 0 ? (areaCm2 / CM_SQUARE_TO_TSAI) : 0;
    if (areaDisplay) areaDisplay.textContent = areaTsai.toFixed(2);

    // 2. Calculate Material Subtotals for this window
    let selectedMaterialPrice = 0;
    let selectedUnitPrice = 0;
    const materialUnitPrices = windowSection.querySelectorAll('.materialUnitPrice');
    const materialTotals = windowSection.querySelectorAll('.materialTotal');
    const selectedMaterialRadio = windowSection.querySelector('.materialSelection:checked'); // Find checked radio in this section
    const selectedMaterialValue = selectedMaterialRadio ? selectedMaterialRadio.value : null; // e.g., 'mat1', 'mat2'

    materialUnitPrices.forEach((input, index) => {
        const matIndex = input.dataset.matIndex; // Get index (1, 2, or 3)
        const unitPrice = getNumberValue(input);
        const total = areaTsai * unitPrice;
        const totalDisplay = windowSection.querySelector(`.materialTotal[data-mat-index="${matIndex}"]`);
        if (totalDisplay) totalDisplay.textContent = formatCurrency(total);

        // Check if this material is the selected one
        if (selectedMaterialValue === `mat${matIndex}`) {
            selectedMaterialPrice = total;
            selectedUnitPrice = unitPrice;
        }
    });

    // 3. Determine Installation Cost for this window
    const installMethodSelect = windowSection.querySelector('.installMethod');
    const installWallCostInput = windowSection.querySelector('.installWallCost');
    const installCeilingCostInput = windowSection.querySelector('.installCeilingCost');

    const installMethod = getStringValue(installMethodSelect);
    let installCost = 0;
    if (installMethod === '牆裝') {
        installCost = getNumberValue(installWallCostInput);
    } else if (installMethod === '天花板裝') {
        installCost = getNumberValue(installCeilingCostInput);
    }

    // 4. Calculate Grand Total for this window
    const windowGrandTotal = selectedMaterialPrice + installCost;
    const windowTotalDisplay = windowSection.querySelector('.windowGrandTotal');
    if (windowTotalDisplay) windowTotalDisplay.textContent = formatCurrency(windowGrandTotal);

    // Return calculated values
    const results = {
        windowIndex: windowSection.dataset.windowIndex,
        areaTsai: areaTsai.toFixed(2),
        selectedUnitPrice: selectedUnitPrice,
        selectedMaterialPrice: Math.round(selectedMaterialPrice),
        installMethod: installMethod,
        installCost: Math.round(installCost),
        windowGrandTotal: Math.round(windowGrandTotal)
    };
    // Store calculated total on the element for easy aggregation later
    windowSection.dataset.calculatedTotal = results.windowGrandTotal;

    return results;
}

/**
 * Updates the overall grand total by summing totals from all window sections.
 */
function updateOverallTotal() {
    let overallTotal = 0;
    const windowSections = document.querySelectorAll('#windowsContainer .window-section');
    windowSections.forEach(section => {
        // Read the calculated total stored on the element's dataset
        const windowTotal = parseFloat(section.dataset.calculatedTotal || '0');
        overallTotal += windowTotal;
    });

    const overallDisplay = document.getElementById('overallGrandTotalDisplay');
    if (overallDisplay) {
        overallDisplay.textContent = '$' + formatCurrency(overallTotal);
    }
}

// --- UI Interaction Functions ---

/**
 * Toggles the collapsed state of a window section.
 * @param {Event} event - The click event object.
 */
function toggleWindowCollapse(event) {
     // Find the header that was clicked, or the button's parent header
    const header = event.target.closest('.window-header');
    if (!header) return;

    const content = header.nextElementSibling; // Assumes content div is immediately after header
    const icon = header.querySelector('.toggle-window-btn i');

    if (content && content.classList.contains('window-content')) {
        content.classList.toggle('collapsed');
        // Toggle icon direction (Font Awesome example)
        if (icon) {
            icon.classList.toggle('fa-chevron-up');
            icon.classList.toggle('fa-chevron-down');
        }
    }
}


/**
 * Creates and adds a new window section to the form.
 */
function addWindow() {
    windowCounter++;
    const template = document.getElementById('windowTemplate');
    if (!template) {
        console.error("Window template not found!");
        return;
    }

    // Clone the template content
    const newWindowFragment = template.content.cloneNode(true);
    const newWindowSection = newWindowFragment.querySelector('.window-section');
    if (!newWindowSection) return;

    // --- Update identifiers and content ---
    newWindowSection.dataset.windowIndex = windowCounter; // Store index

    // Update title
    const title = newWindowSection.querySelector('.window-title');
    if (title) title.textContent = `窗戶 ${windowCounter}`;

    // Update radio button group names to be unique for this section
    const radioButtons = newWindowSection.querySelectorAll('.materialSelection');
    radioButtons.forEach(radio => {
        radio.name = `materialSelection_${windowCounter}`;
    });

    // --- Attach event listeners to the new elements ---
    const inputsToRecalculate = newWindowSection.querySelectorAll('.windowWidth, .windowHeight, .materialUnitPrice, .installWallCost, .installCeilingCost');
    inputsToRecalculate.forEach(input => {
        input.addEventListener('input', (e) => {
            const section = e.target.closest('.window-section');
            calculatePriceForWindow(section);
            updateOverallTotal(); // Update overall total whenever a window changes
        });
    });

    const selectsToRecalculate = newWindowSection.querySelectorAll('.installMethod, .materialSelection');
    selectsToRecalculate.forEach(select => {
        select.addEventListener('change', (e) => {
            const section = e.target.closest('.window-section');
            calculatePriceForWindow(section);
            updateOverallTotal(); // Update overall total whenever a window changes
        });
    });

    // Attach listener for collapse/expand to the header
    const header = newWindowSection.querySelector('.window-header');
    if (header) {
        header.addEventListener('click', toggleWindowCollapse);
    }

    // Collapse new windows by default (except the first one)
    const content = newWindowSection.querySelector('.window-content');
     const icon = newWindowSection.querySelector('.toggle-window-btn i');
    if (windowCounter > 1 && content) {
        content.classList.add('collapsed');
         if (icon) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    } else {
         if (icon) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
         }
         // Mark the first window if needed for styling/logic
        newWindowSection.classList.add('first-window');

    }


    // Append the new section to the container
    const container = document.getElementById('windowsContainer');
    if (container) {
        container.appendChild(newWindowFragment);
    }

    // Optional: Scroll to the new section
    newWindowSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Initial calculation for the new window (optional, starts at 0)
    // calculatePriceForWindow(newWindowSection);
    updateOverallTotal(); // Ensure total reflects the new empty window (if needed)

}


// --- Document Generation Functions (Modified) ---

/**
 * Gathers data for a single window section.
 * @param {HTMLElement} windowSection
 * @returns {object} Object containing data for the window.
 */
function getWindowData(windowSection) {
    if (!windowSection) return null;
    const calculated = calculatePriceForWindow(windowSection); // Recalculate to be sure? Or read from dataset? Let's use dataset.
    const windowTotal = parseFloat(windowSection.dataset.calculatedTotal || '0');

    const selectedMaterialRadio = windowSection.querySelector('.materialSelection:checked');
    const matIndex = selectedMaterialRadio ? selectedMaterialRadio.value.replace('mat','') : null;
    const matLabelElement = selectedMaterialRadio ? windowSection.querySelector(`label[for="${selectedMaterialRadio.id}"]`) : null;
    const selectedMaterialLabel = matLabelElement ? matLabelElement.textContent.replace(':','').trim() : 'N/A';
    const unitPriceInput = matIndex ? windowSection.querySelector(`.materialUnitPrice[data-mat-index="${matIndex}"]`) : null;
    const selectedUnitPrice = getNumberValue(unitPriceInput);


    return {
        index: windowSection.dataset.windowIndex,
        floorSpace: getStringValue(windowSection.querySelector('.floorSpace')),
        sitePhoto: getFileNameFromInput(windowSection.querySelector('.sitePhoto')),
        windowWidth: getStringValue(windowSection.querySelector('.windowWidth')),
        windowHeight: getStringValue(windowSection.querySelector('.windowHeight')),
        boxDepth: getStringValue(windowSection.querySelector('.boxDepth')),
        frameType: getStringValue(windowSection.querySelector('.frameType')),
        curtainType: getStringValue(windowSection.querySelector('.curtainType')),
        openingStyle: getStringValue(windowSection.querySelector('.openingStyle')),
        trackInfo: getStringValue(windowSection.querySelector('.trackInfo')),
        powerReq: getStringValue(windowSection.querySelector('.powerReq')),
        installMethod: getStringValue(windowSection.querySelector('.installMethod')),
        remarks: getStringValue(windowSection.querySelector('.remarks')),
        installReminder: getStringValue(windowSection.querySelector('.installReminder')),
        factoryNotes: getStringValue(windowSection.querySelector('.factoryNotes')),
        // Calculated values specific to this window
        areaTsai: windowSection.querySelector('.calculatedArea')?.textContent || '0.0',
        selectedMaterialLabel: selectedMaterialLabel,
        selectedUnitPrice: selectedUnitPrice,
        installCost: parseFloat(windowSection.querySelector('.installWallCost, .installCeilingCost')?.value || '0'), // Approximation, refine if needed
        windowGrandTotal: windowTotal,
    };
}


function generateQuote(projectData, allWindowsData) {
    let content = `<h2>${projectData.projectName || '專案報價單'}</h2>`;
    content += createParagraph('丈量日期', projectData.measureDate);
    content += createParagraph('丈量人員', projectData.measurePersonnel);
    content += '<hr>';

    let overallTotal = 0;

    allWindowsData.forEach(winData => {
        if (!winData) return;
        overallTotal += winData.windowGrandTotal;

        content += `<h4>窗戶 ${winData.index} (${winData.floorSpace || '未指定空間'})</h4>`;
        content += createParagraph('窗戶寬度', winData.windowWidth, 'cm');
        content += createParagraph('窗戶高度', winData.windowHeight, 'cm');
        content += createParagraph('計算面積', winData.areaTsai, '才');
        content += createParagraph('窗簾種類', winData.curtainType);
        content += createParagraph('選用材質', winData.selectedMaterialLabel);
        content += createParagraph('材質單價', winData.selectedUnitPrice > 0 ? winData.selectedUnitPrice : '-', '/才');
        content += createParagraph('安裝方式', winData.installMethod);
        content += createParagraph('安裝加價', formatCurrency(winData.installCost), '$');
        if (winData.powerReq) content += createParagraph('電源需求', winData.powerReq);
        if (winData.remarks) content += createParagraph('備註', winData.remarks);
        content += `<p><strong>此窗小計:</strong> ${formatCurrency(winData.windowGrandTotal)} $</p>`;
        content += '<br>'; // Add space between windows
    });

    content += `<div class="total-summary">專案總計金額: $${formatCurrency(overallTotal)}</div>`;

    const quoteContentEl = document.getElementById('quoteContent');
    const quoteOutputEl = document.getElementById('quoteOutput');
    if(quoteContentEl) quoteContentEl.innerHTML = content;
    if(quoteOutputEl) quoteOutputEl.style.display = 'block';
}

function generateFactoryOrder(projectData, allWindowsData) {
     let content = `<h2>工廠下單單 - ${projectData.projectName || '專案'}</h2>`;
     content += createParagraph('下單日期', new Date().toLocaleDateString());
     content += '<hr>';

     allWindowsData.forEach(winData => {
         if (!winData) return;
         content += `<h4>生產項目: 窗戶 ${winData.index} (${winData.floorSpace || '未指定空間'})</h4>`;
         content += createParagraph('窗戶寬度(cm)', winData.windowWidth);
         content += createParagraph('窗戶高度(cm)', winData.windowHeight);
         content += createParagraph('窗簾種類', winData.curtainType);
         content += createParagraph('開法', winData.openingStyle);
         // Include specific fabric/track info if needed (might need dedicated fields per material)
         content += createParagraph('布料/布號', winData.fabricInfo || '(見材質選擇)');
         content += createParagraph('紗料/紗號', winData.sheerInfo || '(見材質選擇)');
         content += createParagraph('軌道', winData.trackInfo);
         content += createParagraph('安裝方式', winData.installMethod);
         if (winData.powerReq) content += createParagraph('電源需求', winData.powerReq);
         if (winData.factoryNotes) content += createParagraph('工廠備註', winData.factoryNotes);
         content += '<br>';
     });

    const factoryContentEl = document.getElementById('factoryContent');
    const factoryOutputEl = document.getElementById('factoryOutput');
    if(factoryContentEl) factoryContentEl.innerHTML = content;
    if(factoryOutputEl) factoryOutputEl.style.display = 'block';
}

function generateInstallOrder(projectData, allWindowsData) {
    let content = `<h2>安裝施工單 - ${projectData.projectName || '專案'}</h2>`;
    content += createParagraph('專案地址', projectData.projectName); // Assuming name includes address for installer
    content += createParagraph('丈量日期', projectData.measureDate);
    content += createParagraph('丈量人員', projectData.measurePersonnel);
    content += '<hr>';

     allWindowsData.forEach(winData => {
         if (!winData) return;
         content += `<h4>安裝位置: 窗戶 ${winData.index} (${winData.floorSpace || '未指定空間'})</h4>`;
         content += createParagraph('現場照片參考', winData.sitePhoto);
         content += createParagraph('窗戶寬度(cm)', winData.windowWidth);
         content += createParagraph('窗戶高度(cm)', winData.windowHeight);
         content += createParagraph('窗簾種類', winData.curtainType);
         content += createParagraph('開法/方向', winData.openingStyle);
         content += createParagraph('安裝方式', winData.installMethod);
         content += createParagraph('軌道', winData.trackInfo);
         content += createParagraph('布料/紗料核對', `${winData.fabricInfo || '依訂單'} / ${winData.sheerInfo || '依訂單'}`);
         if (winData.powerReq) content += createParagraph('電源/測試', winData.powerReq);
         if (winData.remarks) content += createParagraph('現場注意(備註)', winData.remarks);
         if (winData.installReminder) content += createParagraph('施工提醒', winData.installReminder);
          content += '<br>';
     });

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
    document.getElementById('quoteOutput').style.display = 'none';
    document.getElementById('factoryOutput').style.display = 'none';
    document.getElementById('installOutput').style.display = 'none';
    // Clear previous content safely
    const quoteContentEl = document.getElementById('quoteContent');
    const factoryContentEl = document.getElementById('factoryContent');
    const installContentEl = document.getElementById('installContent');
    if(quoteContentEl) quoteContentEl.innerHTML = '';
    if(factoryContentEl) factoryContentEl.innerHTML = '';
    if(installContentEl) installContentEl.innerHTML = '';


    // Gather overall project data
    const projectData = {
         projectName: getStringValue(document.getElementById('projectName')),
         measureDate: getStringValue(document.getElementById('measureDate')),
         measurePersonnel: getStringValue(document.getElementById('measurePersonnel')),
     };

    // Gather data from all window sections
    const allWindowsData = [];
    const windowSections = document.querySelectorAll('#windowsContainer .window-section');
    windowSections.forEach(section => {
        allWindowsData.push(getWindowData(section)); // Gather data for each window
    });

    // Check checkboxes and call generation functions
    if (document.getElementById('generateQuote')?.checked) {
        generateQuote(projectData, allWindowsData);
    }
    if (document.getElementById('generateFactoryOrder')?.checked) {
        generateFactoryOrder(projectData, allWindowsData);
    }
    if (document.getElementById('generateInstallOrder')?.checked) {
        generateInstallOrder(projectData, allWindowsData);
    }
}

// --- Event Listeners Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // Add first window automatically on load
    addWindow();

    // Listener for the "Add Window" button
    const addWindowBtn = document.getElementById('addWindowBtn');
    addWindowBtn?.addEventListener('click', addWindow);

    // Listener for the main "Generate Documents" button
    const generateBtn = document.getElementById('generateBtn');
    generateBtn?.addEventListener('click', handleGenerateDocuments);

    // Note: Listeners for inputs *inside* window sections are added dynamically in addWindow()
});
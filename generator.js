// generator.js
import { getStringValue, getNumberValue, getFileNameFromInput, createParagraph, formatCurrency } from './utils.js';
// Note: generator doesn't directly need calculator, it gets data via getWindowData

/**
 * Gathers data for a single window section.
 * @param {HTMLElement} windowSection
 * @returns {object|null} Object containing data for the window.
 */
function getWindowData(windowSection) {
    if (!windowSection) return null;

    const windowIndex = windowSection.dataset.windowIndex;
    // Read calculated total directly from dataset
    const windowTotal = parseFloat(windowSection.dataset.calculatedTotal || '0');

    // Find selected material info
    const radioName = `materialSelection_${windowIndex}`;
    const selectedMaterialRadio = windowSection.querySelector(`input[name="${radioName}"]:checked`);
    const matIndex = selectedMaterialRadio ? selectedMaterialRadio.value.replace('mat','') : null;
    // Find the label associated with the checked radio button more reliably
    const matLabelElement = selectedMaterialRadio ? selectedMaterialRadio.closest('.material-option')?.querySelector('label:first-of-type') : null;
    const selectedMaterialLabel = matLabelElement ? matLabelElement.textContent.replace(':','').trim() : 'N/A';

    const unitPriceInput = matIndex ? windowSection.querySelector(`.materialUnitPrice[data-mat-index="${matIndex}"]`) : null;
    const selectedUnitPrice = getNumberValue(unitPriceInput); // Use utility function

    // Find install cost (assuming only one applies)
    const installMethod = getStringValue(windowSection.querySelector('.installMethod'));
    let installCost = 0;
    if(installMethod === '牆裝'){
        installCost = getNumberValue(windowSection.querySelector('.installWallCost'));
    } else if (installMethod === '天花板裝') {
        installCost = getNumberValue(windowSection.querySelector('.installCeilingCost'));
    }


    return {
        index: windowIndex,
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
        installMethod: installMethod,
        remarks: getStringValue(windowSection.querySelector('.remarks')),
        installReminder: getStringValue(windowSection.querySelector('.installReminder')),
        factoryNotes: getStringValue(windowSection.querySelector('.factoryNotes')),
        // Read calculated values or get them freshly
        areaTsai: windowSection.querySelector('.calculatedArea')?.textContent || '0.0',
        selectedMaterialLabel: selectedMaterialLabel,
        selectedUnitPrice: selectedUnitPrice,
        installCost: Math.round(installCost),
        windowGrandTotal: windowTotal,
         // Include fabric/sheer info if needed by other generators
        fabricInfo: getStringValue(windowSection.querySelector('.fabricInfo')),
        sheerInfo: getStringValue(windowSection.querySelector('.sheerInfo')),
    };
}

// --- Specific Document Generation Functions ---

function generateQuoteContent(projectData, allWindowsData) {
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
        content += '<br>';
    });
    content += `<div class="total-summary">專案總計金額: $${formatCurrency(overallTotal)}</div>`;
    return content;
}

function generateFactoryOrderContent(projectData, allWindowsData) {
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
        content += createParagraph('布料/布號', winData.fabricInfo || `(依材質 ${winData.selectedMaterialLabel})`); // Refer to selected material
        content += createParagraph('紗料/紗號', winData.sheerInfo || ''); // Add sheer if applicable
        content += createParagraph('軌道', winData.trackInfo);
        content += createParagraph('安裝方式', winData.installMethod);
        if (winData.powerReq) content += createParagraph('電源需求', winData.powerReq);
        if (winData.factoryNotes) content += createParagraph('工廠備註', winData.factoryNotes);
        content += '<br>';
    });
    return content;
}

function generateInstallOrderContent(projectData, allWindowsData) {
   let content = `<h2>安裝施工單 - ${projectData.projectName || '專案'}</h2>`;
   content += createParagraph('專案地址', projectData.projectName); // Assuming name includes address
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
       content += createParagraph('布料/紗料核對', `${winData.fabricInfo || `(依材質 ${winData.selectedMaterialLabel})`} / ${winData.sheerInfo || '無'}`);
       if (winData.powerReq) content += createParagraph('電源/測試', winData.powerReq);
       if (winData.remarks) content += createParagraph('現場注意(備註)', winData.remarks);
       if (winData.installReminder) content += createParagraph('施工提醒', winData.installReminder);
       content += '<br>';
   });
   return content;
}

/**
 * Main handler to generate previews based on selected document types.
 */
export function handleGenerateDocuments() {
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
        allWindowsData.push(getWindowData(section));
    });

    // Check checkboxes and generate content
    if (document.getElementById('generateQuote')?.checked) {
        if(quoteContentEl && quoteOutputEl) {
            quoteContentEl.innerHTML = generateQuoteContent(projectData, allWindowsData);
            quoteOutputEl.style.display = 'block';
        }
    }
    if (document.getElementById('generateFactoryOrder')?.checked) {
         if(factoryContentEl && factoryOutputEl) {
            factoryContentEl.innerHTML = generateFactoryOrderContent(projectData, allWindowsData);
            factoryOutputEl.style.display = 'block';
        }
    }
    if (document.getElementById('generateInstallOrder')?.checked) {
        if(installContentEl && installOutputEl) {
            installContentEl.innerHTML = generateInstallOrderContent(projectData, allWindowsData);
            installOutputEl.style.display = 'block';
        }
    }
}
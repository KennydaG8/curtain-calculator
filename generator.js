// generator.js
import { getStringValue, getFileNameFromInput, createParagraph /*, formatCurrency */ } from './utils.js'; // formatCurrency might not be needed now

/** Gathers data for a single window section (Updated Fields) */
function getWindowData(windowSection) {
    if (!windowSection) return null;

    const windowIndex = windowSection.dataset.windowIndex;
    const curtainBoxRadioName = `curtainBox_${windowIndex}`;
    const curtainBoxSelected = windowSection.querySelector(`input[name="${curtainBoxRadioName}"]:checked`)?.value;
    const curtainBoxDepthValue = curtainBoxSelected === 'yes' ? getStringValue(windowSection.querySelector('.curtainBoxDepth')) : 'N/A';

    const mountTypeRadioName = `mountType_${windowIndex}`;
    const mountTypeSelected = windowSection.querySelector(`input[name="${mountTypeRadioName}"]:checked`)?.value;


    return {
        index: windowIndex,
        floorSpace: getStringValue(windowSection.querySelector('.floorSpace')),
        // sitePhoto: getFileNameFromInput(windowSection.querySelector('.sitePhoto')), // Keep if needed
        windowWidth: getStringValue(windowSection.querySelector('.windowWidth')),
        windowHeight: getStringValue(windowSection.querySelector('.windowHeight')),
        areaTsai: windowSection.querySelector('.calculatedArea')?.textContent || '0.0', // Get displayed area
        curtainBox: curtainBoxSelected === 'yes' ? `有 (深度: ${curtainBoxDepthValue}cm)` : '無',
        mountType: mountTypeSelected === 'inside' ? '框內' : '框外',
        openingStyle: getStringValue(windowSection.querySelector('.openingStyle')),
        trackInfo: getStringValue(windowSection.querySelector('.trackInfo')),
        fabricModel: getStringValue(windowSection.querySelector('.fabricModel')),
        remarks: getStringValue(windowSection.querySelector('.remarks')), // Window specific remarks

        // --- Removed Fields ---
        // installCost: 0,
        // windowGrandTotal: 0,
        // selectedMaterialLabel: 'N/A',
        // selectedUnitPrice: 0,
        // powerReq: getStringValue(windowSection.querySelector('.powerReq')), // Keep if needed?
        // factoryNotes: getStringValue(windowSection.querySelector('.factoryNotes')), // Window specific factory notes?
        // installReminder: getStringValue(windowSection.querySelector('.installReminder')), // Window specific reminder?
    };
}

// --- Specific Document Generation Functions (Updated Content) ---

function generateQuoteContent(projectData, allWindowsData) {
    let content = `<h2>${projectData.projectName || '專案資訊'}</h2>`; // Changed title slightly
    content += createParagraph('丈量日期', projectData.measureDate);
    content += createParagraph('丈量人員', projectData.measurePersonnel);
    content += '<hr>';
    // No overall total calculation needed for quote now

    allWindowsData.forEach(winData => {
        if (!winData) return;
        content += `<h4>窗戶 ${winData.index} (${winData.floorSpace || '未指定空間'})</h4>`;
        content += createParagraph('窗戶寬度', winData.windowWidth, 'cm');
        content += createParagraph('窗戶高度', winData.windowHeight, 'cm');
        content += createParagraph('計算面積', winData.areaTsai, '才');
        content += createParagraph('窗簾盒', winData.curtainBox);
        content += createParagraph('安裝位置', winData.mountType);
        content += createParagraph('開法', winData.openingStyle);
        content += createParagraph('軌道種類', winData.trackInfo);
        content += createParagraph('布料型號', winData.fabricModel);
        if (winData.remarks) content += createParagraph('備註(此窗)', winData.remarks);
        // Pricing removed
        content += '<br>';
    });

     // Add Overall Remarks
     content += '<hr>';
     content += `<h4>整體備註與提醒</h4>`;
     if (projectData.projectRemarks) content += createParagraph('專案備註(現場狀況)', projectData.projectRemarks);
     if (projectData.projectInstallReminder) content += createParagraph('施工提醒', projectData.projectInstallReminder);
     // Factory notes usually not on quote
     // content += createParagraph('工廠備註', projectData.projectFactoryNotes);


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
         content += createParagraph('安裝位置', winData.mountType); // Important for deductions/additions
         content += createParagraph('窗簾盒', winData.curtainBox); // Relevant for track/bracket type
         content += createParagraph('開法', winData.openingStyle);
         content += createParagraph('軌道種類', winData.trackInfo);
         content += createParagraph('布料型號', winData.fabricModel);
         if (winData.remarks) content += createParagraph('備註(此窗)', winData.remarks);
         content += '<br>';
     });
      // Add Overall Factory Notes
      content += '<hr>';
      if (projectData.projectFactoryNotes) content += createParagraph('整體工廠備註', projectData.projectFactoryNotes);

     return content;
}

function generateInstallOrderContent(projectData, allWindowsData) {
    let content = `<h2>安裝施工單 - ${projectData.projectName || '專案'}</h2>`;
    content += createParagraph('專案地址', projectData.projectName);
    content += createParagraph('丈量日期', projectData.measureDate);
    content += createParagraph('丈量人員', projectData.measurePersonnel);
    content += '<hr>';
    allWindowsData.forEach(winData => {
        if (!winData) return;
        content += `<h4>安裝位置: 窗戶 ${winData.index} (${winData.floorSpace || '未指定空間'})</h4>`;
        content += createParagraph('窗戶寬度(cm)', winData.windowWidth);
        content += createParagraph('窗戶高度(cm)', winData.windowHeight);
        content += createParagraph('安裝位置(框)', winData.mountType);
        content += createParagraph('窗簾盒', winData.curtainBox);
        content += createParagraph('開法/方向', winData.openingStyle);
        content += createParagraph('軌道種類', winData.trackInfo);
        content += createParagraph('布料型號核對', winData.fabricModel);
        if (winData.remarks) content += createParagraph('備註(此窗)', winData.remarks);
        content += '<br>';
    });
     // Add Overall Reminders
     content += '<hr>';
     content += `<h4>整體備註與提醒</h4>`;
     if (projectData.projectRemarks) content += createParagraph('專案備註(現場狀況)', projectData.projectRemarks);
     if (projectData.projectInstallReminder) content += createParagraph('施工提醒', projectData.projectInstallReminder);

    return content;
}


/** Main handler to generate previews (Updated) */
export function handleGenerateDocuments() {
    // Hide outputs first (same as before)
    const outputIds = ['quoteOutput', 'factoryOutput', 'installOutput'];
    outputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
        const contentEl = document.getElementById(id.replace('Output', 'Content'));
        if (contentEl) contentEl.innerHTML = '';
    });

    // Gather overall project data (including new overall remarks)
    const projectData = {
        projectName: getStringValue(document.getElementById('projectName')),
        measureDate: getStringValue(document.getElementById('measureDate')),
        measurePersonnel: getStringValue(document.getElementById('measurePersonnel')),
        projectRemarks: getStringValue(document.getElementById('projectRemarks')),
        projectInstallReminder: getStringValue(document.getElementById('projectInstallReminder')),
        projectFactoryNotes: getStringValue(document.getElementById('projectFactoryNotes')),
    };

    // Gather data from all window sections
    const allWindowsData = [];
    const windowSections = document.querySelectorAll('#windowsContainer .window-section');
    windowSections.forEach(section => {
        allWindowsData.push(getWindowData(section));
    });

    // Generate content based on checkboxes
    const generators = {
        quote: generateQuoteContent,
        factory: generateFactoryOrderContent,
        install: generateInstallOrderContent,
    };

    const checkboxes = document.querySelectorAll('.generate-options input[name="generateDoc"]:checked');
    checkboxes.forEach(checkbox => {
        const type = checkbox.value; // 'quote', 'factory', 'install'
        const generatorFn = generators[type];
        if (generatorFn) {
            const outputEl = document.getElementById(`${type}Output`);
            const contentEl = document.getElementById(`${type}Content`);
            if(contentEl && outputEl) {
                contentEl.innerHTML = generatorFn(projectData, allWindowsData);
                outputEl.style.display = 'block';
            }
        }
    });
}
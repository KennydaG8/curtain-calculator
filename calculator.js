// calculator.js
import { CM_SQUARE_TO_TSAI } from './constants.js';
import { getNumberValue, getStringValue, formatCurrency } from './utils.js';

/**
 * Calculates prices for a specific window section based on its inputs.
 * @param {HTMLElement} windowSection - The .window-section element.
 * @returns {object|null} An object containing calculated values for this window, or null if error.
 */
export function calculatePriceForWindow(windowSection) {
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

    // 2. Calculate Material Subtotals
    let selectedMaterialPrice = 0;
    let selectedUnitPrice = 0;
    const materialUnitPrices = windowSection.querySelectorAll('.materialUnitPrice');
    // Ensure selectedMaterialRadio is correctly identified for the specific section
    const radioName = `materialSelection_${windowSection.dataset.windowIndex}`; // Assuming index is set
    const selectedMaterialRadio = windowSection.querySelector(`input[name="${radioName}"]:checked`);
    const selectedMaterialValue = selectedMaterialRadio ? selectedMaterialRadio.value : null;

    materialUnitPrices.forEach(input => {
        const matIndex = input.dataset.matIndex;
        const unitPrice = getNumberValue(input);
        const total = areaTsai * unitPrice;
        const totalDisplay = windowSection.querySelector(`.materialTotal[data-mat-index="${matIndex}"]`);
        if (totalDisplay) totalDisplay.textContent = formatCurrency(total);

        if (selectedMaterialValue === `mat${matIndex}`) {
            selectedMaterialPrice = total;
            selectedUnitPrice = unitPrice;
        }
    });

    // 3. Determine Installation Cost
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

    // Store calculated total on the element for easy aggregation
    windowSection.dataset.calculatedTotal = Math.round(windowGrandTotal).toString();

    return {
        windowIndex: windowSection.dataset.windowIndex,
        areaTsai: areaTsai.toFixed(2),
        selectedUnitPrice: selectedUnitPrice,
        selectedMaterialPrice: Math.round(selectedMaterialPrice),
        installMethod: installMethod,
        installCost: Math.round(installCost),
        windowGrandTotal: Math.round(windowGrandTotal)
    };
}

/**
 * Updates the overall grand total display by summing totals from all window sections.
 */
export function updateOverallTotal() {
    let overallTotal = 0;
    const windowSections = document.querySelectorAll('#windowsContainer .window-section');
    windowSections.forEach(section => {
        const windowTotal = parseFloat(section.dataset.calculatedTotal || '0');
        overallTotal += windowTotal;
    });

    const overallDisplay = document.getElementById('overallGrandTotalDisplay');
    if (overallDisplay) {
        overallDisplay.textContent = '$' + formatCurrency(overallTotal);
    }
}
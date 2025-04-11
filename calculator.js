// calculator.js
import { CM_SQUARE_TO_TSAI } from './constants.js';
import { getNumberValue } from './utils.js';

/**
 * Calculates ONLY the area for a specific window section.
 * Pricing logic is removed for now.
 * @param {HTMLElement} windowSection - The .window-section element.
 */
export function calculateAreaForWindow(windowSection) {
    if (!windowSection) return;

    const widthInput = windowSection.querySelector('.windowWidth');
    const heightInput = windowSection.querySelector('.windowHeight');
    const areaDisplay = windowSection.querySelector('.calculatedArea');

    const width = getNumberValue(widthInput);
    const height = getNumberValue(heightInput);

    const areaCm2 = width * height;
    const areaTsai = areaCm2 > 0 ? (areaCm2 / CM_SQUARE_TO_TSAI) : 0;

    if (areaDisplay) areaDisplay.textContent = areaTsai.toFixed(2);

    // Store area on dataset if needed later
    windowSection.dataset.calculatedArea = areaTsai.toFixed(2);

    // No pricing calculation here anymore
    windowSection.dataset.calculatedTotal = '0'; // Set total to 0
}

/**
 * Updates the overall grand total display.
 * Currently does nothing as pricing is removed.
 */
export function updateOverallTotal() {
    // let overallTotal = 0;
    // const windowSections = document.querySelectorAll('#windowsContainer .window-section');
    // windowSections.forEach(section => {
    //     const windowTotal = parseFloat(section.dataset.calculatedTotal || '0');
    //     overallTotal += windowTotal;
    // });
    const overallDisplay = document.getElementById('overallGrandTotalDisplay');
    if (overallDisplay) {
        overallDisplay.textContent = ''; // Clear overall total for now
        overallDisplay.style.display = 'none'; // Hide it
    }
     const overallTotalSection = document.querySelector('.overall-total-section');
     if(overallTotalSection) overallTotalSection.style.display = 'none'; // Hide the whole section

}
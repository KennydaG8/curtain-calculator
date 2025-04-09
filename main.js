// main.js
import { addWindow } from './ui.js'; // Import only addWindow, ui.js handles internal listeners
import { handleGenerateDocuments } from './generator.js';
import { updateOverallTotal } from './calculator.js'; // Import if needed directly, though maybe not

document.addEventListener('DOMContentLoaded', () => {
    // Add the first window when the page loads
    addWindow();

    // Attach listener for the "Add Window" button
    const addWindowBtn = document.getElementById('addWindowBtn');
    addWindowBtn?.addEventListener('click', addWindow); // Use the imported function

    // Listener for the main "Generate Documents" button
    const generateBtn = document.getElementById('generateBtn');
    generateBtn?.addEventListener('click', handleGenerateDocuments); // Use imported handler

    // Initial update of overall total (might be 0)
    updateOverallTotal();
});
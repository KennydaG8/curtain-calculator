// ui.js
import { calculatePriceForWindow, updateOverallTotal } from './calculator.js';

let windowCounter = 0; // Counter for unique window identifiers, managed within this module

/**
 * Toggles the collapsed state of a window section.
 * @param {Event} event - The click event object.
 */
function toggleWindowCollapse(event) {
    const header = event.target.closest('.window-header');
    if (!header) return;

    const content = header.nextElementSibling;
    const icon = header.querySelector('.toggle-window-btn i');

    if (content && content.classList.contains('window-content')) {
        const isCollapsed = content.classList.toggle('collapsed');
        if (icon) {
            icon.classList.toggle('fa-chevron-up', !isCollapsed);
            icon.classList.toggle('fa-chevron-down', isCollapsed);
        }
    }
}

/**
 * Attaches necessary event listeners to a newly created window section.
 * @param {HTMLElement} windowSection - The window section element.
 */
function attachWindowListeners(windowSection) {
     const inputsToRecalculate = windowSection.querySelectorAll(
         '.windowWidth, .windowHeight, .materialUnitPrice, .installWallCost, .installCeilingCost'
     );
     inputsToRecalculate.forEach(input => {
         input.addEventListener('input', (e) => {
             // Pass the section directly to the calculation function
             calculatePriceForWindow(windowSection);
             updateOverallTotal();
         });
     });

     const selectsToRecalculate = windowSection.querySelectorAll(
         '.installMethod, .materialSelection'
     );
     selectsToRecalculate.forEach(select => {
         select.addEventListener('change', (e) => {
              // Pass the section directly to the calculation function
             calculatePriceForWindow(windowSection);
             updateOverallTotal();
         });
     });

     // Attach listener for collapse/expand to the header
     const header = windowSection.querySelector('.window-header');
     if (header) {
         header.addEventListener('click', toggleWindowCollapse);
     }
 }


/**
 * Creates and adds a new window section to the form.
 */
export function addWindow() {
    windowCounter++;
    const template = document.getElementById('windowTemplate');
    if (!template) {
        console.error("Window template not found!");
        return;
    }

    const newWindowFragment = template.content.cloneNode(true);
    const newWindowSection = newWindowFragment.querySelector('.window-section');
    if (!newWindowSection) return;

    // Set unique index and update title
    newWindowSection.dataset.windowIndex = windowCounter;
    const title = newWindowSection.querySelector('.window-title');
    if (title) title.textContent = `窗戶 ${windowCounter}`;

    // Update radio button group names
    const radioButtons = newWindowSection.querySelectorAll('.materialSelection');
    radioButtons.forEach(radio => {
        radio.name = `materialSelection_${windowCounter}`;
    });

    // Attach listeners
    attachWindowListeners(newWindowSection);

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
         if (icon) { // Ensure first window icon is correct
            icon.classList.add('fa-chevron-up');
            icon.classList.remove('fa-chevron-down');
         }
         newWindowSection.classList.add('first-window');
    }

    // Append to container
    const container = document.getElementById('windowsContainer');
    if (container) {
        container.appendChild(newWindowFragment);
    }

    // Optional: Scroll to new section
    newWindowSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Initial calculation & total update
    calculatePriceForWindow(newWindowSection); // Calculate initial (likely $0) price
    updateOverallTotal();
}
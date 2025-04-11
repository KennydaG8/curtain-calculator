// ui.js
import { calculateAreaForWindow, updateOverallTotal } from './calculator.js'; // Now import calculateAreaForWindow

let windowCounter = 0;

/** Handles showing/hiding the curtain box depth input */
function handleCurtainBoxChange(event) {
    const radio = event.target;
    // Find the depth input within the same group
    const group = radio.closest('.curtain-box-group');
    const depthInput = group ? group.querySelector('.curtainBoxDepth') : null;
    if (depthInput) {
        depthInput.style.display = radio.value === 'yes' && radio.checked ? 'block' : 'none';
    }
}

/** Deletes a window section */
function deleteWindow(event) {
    const button = event.target.closest('.delete-window-btn');
    if (!button) return;

    const windowSection = button.closest('.window-section');
    if (!windowSection) return;

    const sectionsContainer = document.getElementById('windowsContainer');
    const sectionsCount = sectionsContainer ? sectionsContainer.querySelectorAll('.window-section').length : 0;

    if (sectionsCount <= 1) {
        alert('至少需要保留一個窗戶資訊區塊。');
        return;
    }

    if (confirm(`確定要刪除「${windowSection.querySelector('.window-title')?.textContent || '此窗戶'}」嗎？`)) {
        windowSection.remove();
        updateOverallTotal(); // Update total (likely to 0 now)
        // Optional: Renumber remaining windows if desired
    }
}


/** Toggles the collapsed state of a window section */
function toggleWindowCollapse(event) {
    // Prevent delete button click from also toggling collapse
    if (event.target.closest('.delete-window-btn')) {
        return;
    }
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

/** Attaches necessary event listeners to a window section */
function attachWindowListeners(windowSection) {
     // --- Calculation Triggers (Area only now) ---
     const inputsToRecalculate = windowSection.querySelectorAll(
         '.windowWidth, .windowHeight' // Only these affect area now
     );
     inputsToRecalculate.forEach(input => {
         input.addEventListener('input', (e) => {
             calculateAreaForWindow(windowSection);
             // updateOverallTotal(); // No total to update based on area alone
         });
     });

     // --- UI Interaction Listeners ---
     // Curtain Box Radio change
     const curtainBoxRadios = windowSection.querySelectorAll('.curtainBoxOption');
     curtainBoxRadios.forEach(radio => {
         radio.addEventListener('change', handleCurtainBoxChange);
     });

     // Delete button click
     const deleteBtn = windowSection.querySelector('.delete-window-btn');
     if (deleteBtn) {
         deleteBtn.addEventListener('click', deleteWindow);
     }

     // Collapse/Expand click on header
     const header = windowSection.querySelector('.window-header');
     if (header) {
         // Ensure click listener is only on header, not buttons within it (or check event target)
         header.addEventListener('click', toggleWindowCollapse);
     }

     // Note: Listeners for pricing elements are removed
 }


/** Creates and adds a new window section */
export function addWindow() {
    windowCounter++;
    const template = document.getElementById('windowTemplate');
    if (!template) return;

    const newWindowFragment = template.content.cloneNode(true);
    const newWindowSection = newWindowFragment.querySelector('.window-section');
    if (!newWindowSection) return;

    // Set unique index and update title/radio names
    newWindowSection.dataset.windowIndex = windowCounter;
    const title = newWindowSection.querySelector('.window-title');
    if (title) title.textContent = `窗戶 ${windowCounter}`;

    const radioGroups = ['curtainBox', 'mountType', 'materialSelection']; // materialSelection still exists in template but hidden
    radioGroups.forEach(groupName => {
        const radios = newWindowSection.querySelectorAll(`.${groupName}Option, .${groupName}`); // Adjust selector if needed
        if (radios.length > 0 && radios[0].name.includes('_{{index}}')) {
             radios.forEach(radio => {
                radio.name = `${groupName}_${windowCounter}`;
            });
        }
    });


    // Attach listeners
    attachWindowListeners(newWindowSection);

    // Collapse new windows by default (except the first one)
    const content = newWindowSection.querySelector('.window-content');
    const icon = newWindowSection.querySelector('.toggle-window-btn i');
    if (windowCounter > 1 && content) {
        content.classList.add('collapsed');
         if (icon) { icon.classList.replace('fa-chevron-up','fa-chevron-down'); }
    } else {
         if (icon) { icon.classList.replace('fa-chevron-down','fa-chevron-up'); }
         newWindowSection.classList.add('first-window');
    }

    // Append to container
    const container = document.getElementById('windowsContainer');
    if (container) {
        container.appendChild(newWindowFragment);
    }

    // Scroll to new section
    newWindowSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Initial calculation & total update
    calculateAreaForWindow(newWindowSection); // Calculate initial area
    updateOverallTotal(); // Update total display (likely hides it)
}
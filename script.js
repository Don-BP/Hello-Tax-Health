/**
 * Brain Power Employee Guide - Main JavaScript File
 * Contains logic for:
 * 1. Hamburger Navigation Menu (Global)
 * 2. Info Pop-up Modal (Global - for simple pages)
 * 3. ALT Handbook Page (Scoped: Search, Scroll-spy, Accordions, Back-to-Top, Sidebar Toggle)
 * 4. HSP Calculator Page (Scoped: Point Calculation, Help Bubbles)
 * 5. Lesson Architect Page (Scoped: Dropdowns, Time Calculation, Interactive Tooltips, Print)
 * 6. Budgeting Page (Scoped: Interactive Calculator)
 */

// --- Debounce Function (Helper Utility) ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- Main Script Execution (runs after DOM is loaded) ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Hamburger Navigation Menu (Global Logic) ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (hamburgerBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('open');
            mobileNav.classList.toggle('open');
        });
    }

    // --- 2. Info Pop-up Modal (Global Logic) ---
    const modal = document.getElementById('info-modal');
    if (modal) {
        const infoTriggers = document.querySelectorAll('.info-trigger');
        const openModal = (text) => {
            const modalText = document.getElementById('modal-text');
            if (modalText) modalText.innerHTML = text;
            modal.style.display = 'block';
        };
        const closeModal = () => { modal.style.display = 'none'; };
        infoTriggers.forEach(trigger => {
            trigger.addEventListener('click', (event) => {
                const infoText = event.currentTarget.getAttribute('data-info');
                if (infoText) openModal(infoText);
            });
        });
        const closeButton = modal.querySelector('.close-button');
        if (closeButton) closeButton.addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
        window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.style.display === 'block') closeModal(); });
    }

    // --- 3. ALT Handbook Page (Scoped Logic) ---
    const handbookContainer = document.querySelector('.alt-handbook-container');
    if (handbookContainer) {
        console.log("ALT Handbook page detected. Initializing scripts.");

        // CORRECTED: Sidebar Toggle Logic
        const sidebar = document.getElementById('sidebarNav');
        const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
        const mainContentArea = document.getElementById('mainContent');

        if (sidebar && sidebarToggleBtn && mainContentArea) {
            sidebarToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent this click from reaching the main content area
                sidebar.classList.toggle('open');
                sidebarToggleBtn.textContent = sidebar.classList.contains('open') ? '✕ Close' : '☰ Menu';
            });
            
            // This listener closes the sidebar if a click happens anywhere in the main content
            mainContentArea.addEventListener('click', (e) => {
                // We only close it if it's already open AND the click was NOT on the toggle button
                if (sidebar.classList.contains('open') && e.target.id !== 'sidebarToggleBtn') {
                    sidebar.classList.remove('open');
                    sidebarToggleBtn.textContent = '☰ Menu';
                }
            });

            // This prevents a click inside the sidebar from closing it (by stopping propagation)
            sidebar.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        const navLinksContainer = document.getElementById('navLinks');
        const content = document.getElementById('mainContent');
        const searchInput = document.getElementById('searchInput');
        const searchResultsInfo = document.getElementById('searchResults');
        const searchResultCount = document.getElementById('searchResultCount');
        const searchTermDisplay = document.getElementById('searchTerm');
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        const backToTopButton = document.getElementById('backToTopBtn');
        const searchNav = document.getElementById('searchNav');
        const prevResultBtn = document.getElementById('prevResultBtn');
        const nextResultBtn = document.getElementById('nextResultBtn');
        const resultCounter = document.getElementById('resultCounter');
        
        let originalSectionHTML = new Map();
        let highlightedResults = [];
        let currentResultIndex = -1;

        const updateActiveLink = (clickedLink) => {
            if (!navLinksContainer) return;
            navLinksContainer.querySelectorAll('a').forEach(link => link.classList.remove('active'));
            if (clickedLink) clickedLink.classList.add('active');
        };

        const handleScroll = () => {
            let currentSectionId = '';
            const scrollPosition = content.scrollTop + content.offsetTop + 100;
            const sections = content.querySelectorAll('.searchable-section:not(.hidden-by-search)');
            sections.forEach(section => {
                if (section.offsetTop <= scrollPosition) currentSectionId = section.id;
            });
            const activeLink = navLinksContainer.querySelector(`a[href="#${currentSectionId}"]`);
            updateActiveLink(activeLink);
            if (backToTopButton) backToTopButton.classList.toggle('show', content.scrollTop > 300);
        };
        
        if (content) content.addEventListener('scroll', debounce(handleScroll, 150));
        if (backToTopButton) backToTopButton.addEventListener('click', () => content.scrollTo({ top: 0, behavior: 'smooth' }));
        if (navLinksContainer) {
            navLinksContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' && e.target.hash) {
                    e.preventDefault();
                    const targetElement = document.getElementById(e.target.hash.substring(1));
                    if (targetElement) {
                        content.scrollTo({ top: targetElement.offsetTop, behavior: 'smooth' });
                        updateActiveLink(e.target);
                    }
                    // Close sidebar after navigation on mobile
                    if (sidebar && sidebar.classList.contains('open')) {
                        sidebar.classList.remove('open');
                        if(sidebarToggleBtn) sidebarToggleBtn.textContent = '☰ Menu';
                    }
                }
            });
        }
        
        const setupAccordions = () => {
            handbookContainer.querySelectorAll('.accordion-trigger').forEach(trigger => {
                trigger.addEventListener('click', function() {
                    this.classList.toggle('active');
                    const panel = this.nextElementSibling;
                    if (panel && panel.classList.contains('accordion-panel')) {
                        panel.classList.toggle('show');
                        if (panel.style.maxHeight) {
                            panel.style.maxHeight = null;
                        } else {
                            panel.style.maxHeight = panel.scrollHeight + "px";
                        }
                    }
                });
            });
        };

        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const clearHighlights = () => {
            originalSectionHTML.forEach((html, id) => {
                const section = document.getElementById(id);
                if (section) section.innerHTML = html;
            });
            originalSectionHTML.clear();
            setupAccordions();
        };
        const clearSearch = () => {
            clearHighlights();
            if(searchResultsInfo) searchResultsInfo.style.display = 'none';
            if(searchNav) searchNav.style.display = 'none';
            highlightedResults = [];
            currentResultIndex = -1;
            content.querySelectorAll('.searchable-section').forEach(s => s.classList.remove('hidden-by-search'));
            handleScroll();
        };

        const handleSearchInput = () => {
            clearSearch();
            const searchTerm = searchInput.value.trim();
            if (searchTerm.length < 2) return;
            const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
            
            content.querySelectorAll('.searchable-section').forEach(section => {
                if (!originalSectionHTML.has(section.id)) {
                    originalSectionHTML.set(section.id, section.innerHTML);
                }
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = section.innerHTML;
                
                let found = false;
                tempDiv.querySelectorAll('p, li, h2, h3, h4, .accordion-trigger, .accordion-panel, td').forEach(el => {
                    Array.from(el.childNodes).forEach(child => {
                        if (child.nodeType === 3 && regex.test(child.nodeValue)) {
                            found = true;
                            const newFrag = document.createDocumentFragment();
                            let lastIndex = 0;
                            child.nodeValue.replace(regex, (match, p1, offset) => {
                                newFrag.appendChild(document.createTextNode(child.nodeValue.substring(lastIndex, offset)));
                                const mark = document.createElement('mark');
                                mark.className = 'search-highlight';
                                mark.textContent = p1;
                                newFrag.appendChild(mark);
                                lastIndex = offset + match.length;
                            });
                            newFrag.appendChild(document.createTextNode(child.nodeValue.substring(lastIndex)));
                            child.parentNode.replaceChild(newFrag, child);
                        }
                    });
                });
                
                if (found) {
                    section.innerHTML = tempDiv.innerHTML;
                    section.classList.remove('hidden-by-search');
                } else {
                    section.classList.add('hidden-by-search');
                }
            });
            setupAccordions();
            highlightedResults = content.querySelectorAll('.search-highlight');
            if (searchResultCount) searchResultCount.textContent = highlightedResults.length;
            if (searchTermDisplay) searchTermDisplay.textContent = searchTerm;
            if (searchResultsInfo) searchResultsInfo.style.display = 'block';

            if (highlightedResults.length > 0) {
                currentResultIndex = 0;
                jumpToResult(0);
                if (searchNav) searchNav.style.display = 'flex';
            } else {
                if (searchNav) searchNav.style.display = 'none';
            }
             updateSearchNavUI();
        };

        const jumpToResult = (index) => {
            highlightedResults.forEach(el => el.classList.remove('current-highlight'));
            const target = highlightedResults[index];
            if (target) {
                target.classList.add('current-highlight');
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                currentResultIndex = index;
                updateSearchNavUI();
            }
        };

        const updateSearchNavUI = () => {
             if(resultCounter) resultCounter.textContent = highlightedResults.length > 0 ? `${currentResultIndex + 1}/${highlightedResults.length}` : `0/0`;
             if(prevResultBtn) prevResultBtn.disabled = highlightedResults.length <= 1;
             if(nextResultBtn) nextResultBtn.disabled = highlightedResults.length <= 1;
        };

        if (searchInput) searchInput.addEventListener('input', debounce(handleSearchInput, 300));
        if (clearSearchBtn) clearSearchBtn.addEventListener('click', () => { if (searchInput) searchInput.value = ''; clearSearch(); });
        if (prevResultBtn) prevResultBtn.addEventListener('click', () => jumpToResult((currentResultIndex - 1 + highlightedResults.length) % highlightedResults.length));
        if (nextResultBtn) nextResultBtn.addEventListener('click', () => jumpToResult((currentResultIndex + 1) % highlightedResults.length));

        setupAccordions();
        handleScroll();
    }

    // --- 4. HSP Calculator Page (Scoped Logic) ---
    const hspForm = document.getElementById('hspForm');
    if (hspForm) {
        console.log("HSP Calculator page detected. Initializing scripts.");
        const totalScoreDisplay = document.getElementById('totalScore');
        const eligibilityMessageDisplay = document.getElementById('eligibilityMessage');

        hspForm.addEventListener('click', (event) => {
            if (event.target.matches('.help-btn')) {
                const bubble = event.target.nextElementSibling;
                if (bubble && bubble.classList.contains('help-bubble')) {
                    const isShowing = bubble.classList.contains('show');
                    document.querySelectorAll('.help-bubble').forEach(b => b.classList.remove('show'));
                    if (!isShowing) bubble.classList.add('show');
                }
            }
        });
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.criterion')) {
                 document.querySelectorAll('.help-bubble').forEach(b => b.classList.remove('show'));
            }
        });

        const calculateScore = () => {
            let totalPoints = 0;
            const data = new FormData(hspForm);
            for (const [key, value] of data.entries()) {
                const input = hspForm.querySelector(`[name="${key}"][value="${value}"]`);
                if(input && input.checked) {
                    totalPoints += parseInt(input.dataset.points || 0, 10);
                }
            }
            const salarySelect = document.getElementById('annual_salary');
            if (salarySelect) totalPoints += parseInt(salarySelect.options[salarySelect.selectedIndex].dataset.points || 0, 10);

            totalScoreDisplay.textContent = totalPoints;
            updateEligibilityMessage(totalPoints);
        };

        const updateEligibilityMessage = (score) => {
            let message = ""; let scoreColor = "#dc3545";
            if (score >= 80) { message = "80+ Points: Potentially eligible for PR after 1 year."; scoreColor = "#28a745"; }
            else if (score >= 70) { message = "70-79 Points: Potentially eligible for PR after 3 years."; scoreColor = "#fd7e14"; }
            else { message = "Below 70 Points: Does not meet accelerated PR threshold."; }
            eligibilityMessageDisplay.textContent = message;
            totalScoreDisplay.style.color = scoreColor;
        };
        hspForm.addEventListener('change', calculateScore);
        calculateScore();
    }

    // --- 5. Lesson Architect Page (Scoped Logic) ---
    const architectContainer = document.querySelector('.lesson-architect-container');
    if (architectContainer) {
        console.log("Lesson Architect page detected. Initializing scripts.");
        
        const populateDropdowns = () => {
            const gradeSelect = document.getElementById('planGrade');
            const grades = ["ES 1st", "ES 2nd", "ES 3rd", "ES 4th", "ES 5th", "ES 6th", "JHS 1st", "JHS 2nd", "JHS 3rd"];
            if (gradeSelect) {
                gradeSelect.innerHTML = '';
                grades.forEach(grade => gradeSelect.add(new Option(grade, grade)));
            }
        };

        const updateTotalTime = () => {
            let totalMinutes = 0;
            architectContainer.querySelectorAll('.time-input').forEach(input => {
                totalMinutes += parseInt(input.value, 10) || 0;
            });
            const totalTimeEl = document.getElementById('total-time');
            const timeWarningEl = document.getElementById('time-warning');
            if (totalTimeEl) totalTimeEl.textContent = totalMinutes;
            if (timeWarningEl) {
                timeWarningEl.style.display = 'none';
                if (totalMinutes > 50) {
                    timeWarningEl.textContent = `Warning: Total time (${totalMinutes} mins) exceeds typical class length!`;
                    timeWarningEl.style.color = 'red';
                    timeWarningEl.style.display = 'block';
                } else if (totalMinutes > 45) {
                    timeWarningEl.textContent = `Note: Nearing typical class length of 50 mins.`;
                    timeWarningEl.style.color = '#E67E22';
                    timeWarningEl.style.display = 'block';
                }
            }
        };

        const setupTooltips = () => {
            architectContainer.addEventListener('click', function(event) {
                const target = event.target;
                if (target.classList.contains('tooltip-icon')) {
                    const targetId = target.dataset.tooltipTarget;
                    const tooltipTextElement = document.getElementById(targetId);
                    if (tooltipTextElement) {
                        const isChecklistTip = target.classList.contains('checklist-tip');
                        const targetElementToShow = isChecklistTip ? tooltipTextElement.closest('tr.tooltip-row') : tooltipTextElement;
                        
                        if (!targetElementToShow) return;
                        
                        const isShowing = targetElementToShow.classList.contains('show');

                        architectContainer.querySelectorAll('.tooltip-text.show, .tooltip-row.show').forEach(el => {
                            if (el !== targetElementToShow) {
                                el.classList.remove('show');
                            }
                        });
                        targetElementToShow.classList.toggle('show');
                    }
                }
            });
        };
        
        const setupRoleSelectors = () => {
            const altT1 = document.getElementById('altT1');
            const altT2 = document.getElementById('altT2');
            const jteT1 = document.getElementById('jteT1');
            const jteT2 = document.getElementById('jteT2');

            if(altT1 && altT2 && jteT1 && jteT2) {
                altT1.addEventListener('change', () => { if (altT1.checked) jteT2.checked = true; });
                altT2.addEventListener('change', () => { if (altT2.checked) jteT1.checked = true; });
                jteT1.addEventListener('change', () => { if (jteT1.checked) altT2.checked = true; });
                jteT2.addEventListener('change', () => { if (jteT2.checked) altT1.checked = true; });
            }
        };

        const getPlanDataAsString = () => {
            let summary = "Brain Power - Lesson Plan Summary\n===========================\n\n";
            summary += "TEACHER INFORMATION:\n";
            summary += "ALT Name: " + (document.getElementById('altName').value || "N/A") + " (Role: " + (document.getElementById('altT1').checked ? "T1 Lead" : "T2 Assistant") + ")\n";
            summary += "JTE Name: " + (document.getElementById('jteName').value || "N/A") + " (Role: " + (document.getElementById('jteT1').checked ? "T1 Lead" : "T2 Assistant") + ")\n\n";
            summary += "--- PREPARE ---\n";
            summary += "Date: " + (document.getElementById('planDate').value || "N/A") + "\n";
            summary += "School: " + (document.getElementById('planSchool').value || "N/A") + "\n";
            summary += "Grade & Class: " + document.getElementById('planGrade').value + " - " + (document.getElementById('planClass').value || "N/A") + "\n\n";
            summary += "Lesson Goal: " + (document.getElementById('lessonGoal').value || "Not specified") + "\n";
            summary += "Target Language: " + (document.getElementById('targetLanguage').value || "Not specified") + "\n\n";
            summary += "--- LESSON FLOW ("+ document.getElementById('total-time').textContent +" mins) ---\n";
            summary += "Warm-up ("+ document.querySelector('.time-input[data-stage=warmup]').value +" mins): " + document.getElementById('warmupDescALT').value + "\n";
            summary += "Present ("+ document.querySelector('.time-input[data-stage=present]').value +" mins): " + document.getElementById('presentDescALT').value + "\n";
            summary += "Practice ("+ document.querySelector('.time-input[data-stage=practice]').value +" mins): " + document.getElementById('practiceDescALT').value + "\n";
            summary += "Produce ("+ document.querySelector('.time-input[data-stage=produce]').value +" mins): " + document.getElementById('produceDescALT').value + "\n";
            summary += "Wrap-up ("+ document.querySelector('.time-input[data-stage=wrapup]').value +" mins): " + document.getElementById('wrapupDescALT').value + "\n";
            return summary;
        };

        const generatePlanSummaryText = () => {
            const summaryText = getPlanDataAsString();
            const outputArea = document.getElementById('planSummaryOutput');
            const summarySection = document.getElementById('plan-summary-section');
            if (outputArea) outputArea.value = summaryText;
            if (summarySection) {
                summarySection.style.display = 'block';
                outputArea.scrollIntoView({ behavior: 'smooth' });
            }
        };

        const printPlan = () => {
            window.print();
        };

        architectContainer.querySelectorAll('.time-input').forEach(input => input.addEventListener('input', updateTotalTime));
        const genButton = document.getElementById('generatePlanButton');
        if (genButton) genButton.addEventListener('click', generatePlanSummaryText);
        const printButton = document.getElementById('printPlanButton');
        if (printButton) printButton.addEventListener('click', printPlan);
        
        populateDropdowns();
        updateTotalTime();
        setupTooltips();
        setupRoleSelectors();
    }

    // --- 6. Budgeting Page (Scoped Logic) ---
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        console.log("Budget Calculator page detected. Initializing scripts.");

        const calculateBudget = () => {
            const incomeInput = document.getElementById('income');
            const expenseInputs = document.querySelectorAll('.expense');
            const totalExpensesEl = document.getElementById('total-expenses');
            const remainingIncomeEl = document.getElementById('remaining-income');

            let totalExpenses = 0;
            expenseInputs.forEach(input => {
                totalExpenses += parseFloat(input.value) || 0;
            });

            const income = parseFloat(incomeInput.value) || 0;
            const remaining = income - totalExpenses;

            const yenFormatter = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', minimumFractionDigits: 0, maximumFractionDigits: 0 });

            totalExpensesEl.textContent = yenFormatter.format(totalExpenses);
            remainingIncomeEl.textContent = yenFormatter.format(remaining);

            if (remaining < 0) {
                remainingIncomeEl.style.color = 'var(--warning-color)';
            } else {
                remainingIncomeEl.style.color = '#28a745';
            }
        };

        budgetForm.addEventListener('input', calculateBudget);
        calculateBudget(); // Initial calculation on page load
    }
});
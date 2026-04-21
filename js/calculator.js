// Zakat Calculator Core Logic

// Nisab threshold in PKR
const NISAB_THRESHOLD = 187400;

// Helper: Format PKR with Pakistani comma system (e.g., 1,87,400)
function formatPKR(value) {
    if (value === undefined || value === null) return "0";
    let num = Number(value);
    if (isNaN(num)) num = 0;
    let str = Math.floor(num).toString();
    let lastThree = str.slice(-3);
    let otherDigits = str.slice(0, -3);
    if (otherDigits !== "") {
        lastThree = "," + lastThree;
    }
    let result = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    if (result.startsWith(',')) result = result.slice(1);
    return result;
}

// Get all asset values
function getAssetValues() {
    return {
        cash: parseFloat(document.getElementById('cash').value) || 0,
        gold: parseFloat(document.getElementById('gold').value) || 0,
        silver: parseFloat(document.getElementById('silver').value) || 0,
        inventory: parseFloat(document.getElementById('inventory').value) || 0,
        receivables: parseFloat(document.getElementById('receivables').value) || 0
    };
}

// Get liability values
function getLiabilities() {
    return {
        debts: parseFloat(document.getElementById('debts').value) || 0
    };
}

// Main calculation function
function calculateZakat() {
    const assets = getAssetValues();
    const liabilities = getLiabilities();
    
    const totalAssets = assets.cash + assets.gold + assets.silver + assets.inventory + assets.receivables;
    const totalLiabilities = liabilities.debts;
    const netWealth = totalAssets - totalLiabilities;
    const zakatDue = netWealth > 0 ? netWealth * 0.025 : 0;
    const monthlyEquivalent = zakatDue / 12;
    const isBelowNisab = (netWealth < NISAB_THRESHOLD) && netWealth >= 0;
    
    return {
        totalAssets,
        totalLiabilities,
        netWealth,
        zakatDue,
        monthlyEquivalent,
        isBelowNisab,
        assetsBreakdown: assets,
        liabilitiesBreakdown: liabilities,
        nisabThreshold: NISAB_THRESHOLD,
        ratePercent: 2.5
    };
}

// Update UI with calculated values
function updateUI() {
    const data = calculateZakat();
    
    // Update display fields
    document.getElementById('totalAssetsDisplay').innerHTML = `PKR ${formatPKR(data.totalAssets)}`;
    document.getElementById('liabilitiesDisplay').innerHTML = `PKR ${formatPKR(data.totalLiabilities)}`;
    document.getElementById('netWealthDisplay').innerHTML = `PKR ${formatPKR(data.netWealth)}`;
    document.getElementById('zakatDueDisplay').innerHTML = `PKR ${formatPKR(data.zakatDue)}`;
    document.getElementById('monthlyDisplay').innerHTML = `PKR ${formatPKR(data.monthlyEquivalent)}`;
    
    // Show/hide Nisab warning
    const warningDiv = document.getElementById('nisabWarning');
    if (data.isBelowNisab) {
        warningDiv.classList.remove('hidden');
        warningDiv.classList.add('nisab-warning');
        setTimeout(() => warningDiv.classList.remove('nisab-warning'), 1200);
    } else {
        warningDiv.classList.add('hidden');
    }
    
    // Store current data for PDF generation
    window.currentZakatData = data;
    return data;
}

// Format input on blur to ensure valid numbers
function formatInputOnBlur(inputId) {
    const inputEl = document.getElementById(inputId);
    if (inputEl) {
        inputEl.addEventListener('blur', function() {
            let val = parseFloat(this.value);
            if (isNaN(val)) val = 0;
            this.value = val;
            updateUI();
        });
    }
}

// Initialize event listeners
function initCalculator() {
    const inputs = ['cash', 'gold', 'silver', 'inventory', 'receivables', 'debts'];
    
    // Add real-time update on input
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => updateUI());
            formatInputOnBlur(id);
        }
    });
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => updateUI());
    }
    
    // Initial calculation
    updateUI();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
} else {
    initCalculator();
}

// Export functions for use in pdf-generator.js
window.formatPKR = formatPKR;
window.getCurrentZakatData = () => window.currentZakatData || calculateZakat();
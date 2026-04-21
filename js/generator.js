// PDF Generator Module for Zakat Calculator

// Generate PDF report
async function generateZakatPDF() {
    // Get latest data from calculator
    const data = window.getCurrentZakatData ? window.getCurrentZakatData() : window.calculateZakat();
    const assets = data.assetsBreakdown;
    const debtsVal = data.liabilitiesBreakdown.debts;
    
    // Show loading state on button
    const pdfBtn = document.getElementById('pdfBtn');
    const originalBtnText = pdfBtn.innerHTML;
    pdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    pdfBtn.disabled = true;
    
    try {
        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined') {
            throw new Error('jsPDF library not loaded. Please check your internet connection.');
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        
        // Header
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Zakat Calculator Report", 105, 16, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(240, 240, 240);
        doc.text("زکوٰۃ کیلکولیٹر | Islamic Wealth Assessment", 105, 24, { align: "center" });
        
        // Date & Time
        const now = new Date();
        const formattedDateTime = now.toLocaleString('en-PK', { 
            dateStyle: 'full', 
            timeStyle: 'medium' 
        });
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated on: ${formattedDateTime}`, 14, 40);
        
        // Summary Section Title
        doc.setFontSize(14);
        doc.setTextColor(21, 128, 61);
        doc.setFont("helvetica", "bold");
        doc.text("Calculation Summary", 14, 55);
        
        // Draw line
        doc.setDrawColor(34, 197, 94);
        doc.line(14, 58, 196, 58);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        
        // Summary data rows (Y position starting)
        let yPos = 68;
        const lineHeight = 8;
        
        // Helper to add summary row
        function addSummaryRow(label, value, y) {
            doc.setFont("helvetica", "bold");
            doc.text(label, 20, y);
            doc.setFont("helvetica", "normal");
            doc.text(value, 180, y, { align: "right" });
            return y + lineHeight;
        }
        
        yPos = addSummaryRow("Total Assets (PKR):", `PKR ${window.formatPKR(data.totalAssets)}`, yPos);
        yPos = addSummaryRow("Total Liabilities (PKR):", `PKR ${window.formatPKR(data.totalLiabilities)}`, yPos);
        yPos = addSummaryRow("Net Zakatable Wealth (PKR):", `PKR ${window.formatPKR(data.netWealth)}`, yPos);
        yPos = addSummaryRow("", "", yPos + 3);
        
        // Highlight Zakat Due
        doc.setFillColor(220, 250, 220);
        doc.rect(14, yPos - 5, 182, 12, 'F');
        doc.setFont("helvetica", "bold");
        doc.setTextColor(21, 128, 61);
        doc.text("Zakat Due (2.5%):", 20, yPos);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 100, 0);
        doc.text(`PKR ${window.formatPKR(data.zakatDue)}`, 180, yPos, { align: "right" });
        yPos = yPos + lineHeight;
        
        doc.setTextColor(0, 0, 0);
        yPos = addSummaryRow("Monthly Equivalent:", `PKR ${window.formatPKR(data.monthlyEquivalent)}`, yPos);
        yPos = addSummaryRow("Nisab Threshold:", `PKR ${window.formatPKR(data.nisabThreshold)}`, yPos);
        
        // Status
        const statusText = data.netWealth >= data.nisabThreshold ? "✅ Nisab met - Zakat obligatory" : "⚠️ Below Nisab (Zakat not obligatory)";
        doc.setTextColor(data.netWealth >= data.nisabThreshold ? 34 : 194, data.netWealth >= data.nisabThreshold ? 197 : 65, data.netWealth >= data.nisabThreshold ? 94 : 25);
        doc.setFont("helvetica", "bold");
        doc.text("Status:", 20, yPos);
        doc.text(statusText, 180, yPos, { align: "right" });
        
        yPos = yPos + lineHeight + 8;
        
        // Detailed Assets & Liabilities Section
        doc.setTextColor(21, 128, 61);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Detailed Assets & Liabilities", 14, yPos);
        yPos = yPos + 5;
        doc.setDrawColor(34, 197, 94);
        doc.line(14, yPos, 196, yPos);
        yPos = yPos + 8;
        
        // Table headers
        doc.setFillColor(100, 116, 139);
        doc.rect(14, yPos - 5, 120, 10, 'F');
        doc.rect(134, yPos - 5, 62, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("Item", 20, yPos);
        doc.text("Amount (PKR)", 140, yPos, { align: "right" });
        
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        yPos = yPos + 8;
        
        const detailItems = [
            { label: "Cash & Bank Savings", value: assets.cash },
            { label: "Gold Value", value: assets.gold },
            { label: "Silver Value", value: assets.silver },
            { label: "Business Inventory", value: assets.inventory },
            { label: "Receivables / Loans Owed", value: assets.receivables },
            { label: "🔻 Debts / Loans Payable", value: debtsVal }
        ];
        
        for (let i = 0; i < detailItems.length; i++) {
            const item = detailItems[i];
            // Alternate row background
            if (i % 2 === 0) {
                doc.setFillColor(249, 250, 251);
                doc.rect(14, yPos - 4, 182, 7, 'F');
            }
            doc.text(item.label, 20, yPos);
            doc.text(window.formatPKR(item.value), 190, yPos, { align: "right" });
            yPos += 7;
        }
        
        yPos = yPos + 10;
        
        // Islamic quote
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("“And those in whose wealth there is a recognized right for the needy and the deprived.”", 105, yPos, { align: "center" });
        yPos = yPos + 6;
        doc.text("(Quran 70:24-25)", 105, yPos, { align: "center" });
        yPos = yPos + 8;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("This report is computer-generated based on user inputs. Please consult a qualified scholar for verification.", 105, yPos, { align: "center" });
        
        // Footer with page number
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount} | Generated by HSQDigitalHub.com`, 105, 287, { align: "center" });
        }
        
        // Save PDF
        const fileName = `Zakat_Report_${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}-${now.getMinutes().toString().padStart(2,'0')}-${now.getSeconds().toString().padStart(2,'0')}.pdf`;
        doc.save(fileName);
        
        // Show success message
        pdfBtn.innerHTML = '<i class="fas fa-check"></i> PDF Generated!';
        setTimeout(() => {
            pdfBtn.innerHTML = originalBtnText;
        }, 2000);
        
    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert('Error generating PDF: ' + error.message + '\n\nPlease check your internet connection and try again.');
        pdfBtn.innerHTML = originalBtnText;
    } finally {
        pdfBtn.disabled = false;
    }
}

// Attach PDF generation to button
function initPDFGenerator() {
    const pdfBtn = document.getElementById('pdfBtn');
    if (pdfBtn) {
        // Remove any existing listeners
        const newBtn = pdfBtn.cloneNode(true);
        pdfBtn.parentNode.replaceChild(newBtn, pdfBtn);
        newBtn.addEventListener('click', generateZakatPDF);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPDFGenerator);
} else {
    initPDFGenerator();
}
// PDF Generator Module for Zakat Calculator

// Generate PDF report
async function generateZakatPDF() {
    // Get latest data
    const data = window.getCurrentZakatData ? window.getCurrentZakatData() : window.calculateZakat();
    const assets = data.assetsBreakdown;
    const debtsVal = data.liabilitiesBreakdown.debts;
    
    // Show loading state on button
    const pdfBtn = document.getElementById('pdfBtn');
    const originalBtnText = pdfBtn.innerHTML;
    pdfBtn.innerHTML = '<i class="fas fa-spinner pdf-loading"></i> Generating PDF...';
    pdfBtn.disabled = true;
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        
        // Header with gradient effect
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, 210, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Zakat Calculator Report", 105, 16, { align: "center" });
        doc.setFontSize(11);
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
        doc.text(`Generated on: ${formattedDateTime}`, 14, 38);
        
        // Summary Section
        doc.setFontSize(13);
        doc.setTextColor(21, 128, 61);
        doc.setFont("helvetica", "bold");
        doc.text("Calculation Summary", 14, 52);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        
        // Main summary table
        const summaryData = [
            ["Total Assets (PKR)", window.formatPKR(data.totalAssets)],
            ["Total Liabilities (PKR)", window.formatPKR(data.totalLiabilities)],
            ["Net Zakatable Wealth (PKR)", window.formatPKR(data.netWealth)],
            ["Zakat Due (2.5%)", window.formatPKR(data.zakatDue)],
            ["Monthly Equivalent (Zakat ÷ 12)", window.formatPKR(data.monthlyEquivalent)],
            ["Nisab Threshold", `PKR ${window.formatPKR(data.nisabThreshold)}`],
            ["Status", data.netWealth >= data.nisabThreshold ? "✅ Nisab met - Zakat obligatory" : "⚠️ Below Nisab (Zakat not obligatory)"]
        ];
        
        doc.autoTable({
            startY: 56,
            head: [["Description", "Amount / Status"]],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
            alternateRowStyles: { fillColor: [240, 250, 240] },
            margin: { left: 14, right: 14 },
            columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 'auto' } }
        });
        
        let finalY = doc.lastAutoTable.finalY + 10;
        
        // Detailed Assets & Liabilities Table
        doc.setFontSize(12);
        doc.setTextColor(21, 128, 61);
        doc.setFont("helvetica", "bold");
        doc.text("Detailed Assets & Liabilities", 14, finalY);
        finalY += 6;
        
        const assetRows = [
            ["Cash & Bank Savings", window.formatPKR(assets.cash)],
            ["Gold Value", window.formatPKR(assets.gold)],
            ["Silver Value", window.formatPKR(assets.silver)],
            ["Business Inventory", window.formatPKR(assets.inventory)],
            ["Receivables / Loans Owed", window.formatPKR(assets.receivables)],
            ["🔻 Debts / Loans Payable", window.formatPKR(debtsVal)]
        ];
        
        doc.autoTable({
            startY: finalY,
            head: [["Asset / Liability Item", "Amount (PKR)"]],
            body: assetRows,
            theme: 'plain',
            headStyles: { fillColor: [100, 116, 139], textColor: [255, 255, 255], fontSize: 10 },
            margin: { left: 14, right: 14 },
            alternateRowStyles: { fillColor: [249, 250, 251] }
        });
        
        let tableEnd = doc.lastAutoTable.finalY + 8;
        
        // Islamic quote and footer
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "italic");
        doc.text("“And those in whose wealth there is a recognized right for the needy and the deprived.”", 105, tableEnd + 5, { align: "center" });
        doc.text("(Quran 70:24-25)", 105, tableEnd + 10, { align: "center" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("This report is computer-generated based on user inputs. Please consult a qualified scholar for verification.", 105, tableEnd + 18, { align: "center" });
        
        // Add page number
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: "center" });
        }
        
        // Save PDF
        const fileName = `Zakat_Report_${now.toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
        doc.save(fileName);
        
    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert('Error generating PDF. Please try again.');
    } finally {
        // Restore button
        pdfBtn.innerHTML = originalBtnText;
        pdfBtn.disabled = false;
    }
}

// Attach PDF generation to button
function initPDFGenerator() {
    const pdfBtn = document.getElementById('pdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', generateZakatPDF);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPDFGenerator);
} else {
    initPDFGenerator();
}
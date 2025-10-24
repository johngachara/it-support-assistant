import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export class PDFExportService {
    static async exportToPDF(reportData, fileName = 'report') {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            let yPos = margin;

            // Title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(37, 99, 235);
            const title = reportData.title || 'Laptop Technical Report --- Paul Kamau';
            doc.text(title, pageWidth / 2, yPos, { align: 'center' });

            // Line under title
            yPos += 5;
            doc.setDrawColor(37, 99, 235);
            doc.setLineWidth(0.5);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 15;

            // Machine Details Section
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('Machine Details', margin, yPos);
            yPos += 8;

            // Machine Details Table
            const machineData = [
                [
                    reportData.machineDetails?.make && reportData.machineDetails?.model
                        ? `${reportData.machineDetails.make} ${reportData.machineDetails.model}`
                        : 'N/A',
                    reportData.machineDetails?.serialNumber || 'N/A',
                    reportData.machineDetails?.ram || 'N/A',
                    reportData.machineDetails?.storage || 'N/A',
                    reportData.machineDetails?.processor || 'N/A'
                ]
            ];

            autoTable(doc, {
                startY: yPos,
                head: [['Make & Model', 'Serial Number', 'RAM', 'Storage', 'Processor']],
                body: machineData,
                theme: 'grid',
                styles: {
                    fontSize: 9,
                    cellPadding: 4,
                    overflow: 'linebreak',
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: [241, 245, 249],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 35 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 55 }
                },
                margin: { left: margin, right: margin }
            });

            yPos = doc.lastAutoTable.finalY + 15;

            // User Complaint Section
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('User Complaint', margin, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const complaint = reportData.userComplaint || 'No complaint specified';

            // Handle complaint as array or string
            const complaints = Array.isArray(complaint) ? complaint : [complaint];
            complaints.forEach((item) => {
                if (yPos > pageHeight - 40) {
                    doc.addPage();
                    yPos = margin;
                }

                const bulletPoint = `--`;
                const complaintText = typeof item === 'string' ? item : item.text || JSON.stringify(item);
                const complaintLines = doc.splitTextToSize(complaintText, pageWidth - 2 * margin - 10);

                doc.text(bulletPoint, margin + 5, yPos);
                doc.text(complaintLines, margin + 10, yPos);
                yPos += complaintLines.length * 6 + 3;
            });

            yPos += 10;

            // Findings Section
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Findings', margin, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const findings = reportData.findings || [];
            findings.forEach((finding, index) => {
                // Check if we need a new page
                if (yPos > pageHeight - 40) {
                    doc.addPage();
                    yPos = margin;
                }

                const bulletPoint = `--`;
                const findingText = typeof finding === 'string' ? finding : finding.text || JSON.stringify(finding);
                const findingLines = doc.splitTextToSize(findingText, pageWidth - 2 * margin - 10);

                doc.text(bulletPoint, margin + 5, yPos);
                doc.text(findingLines, margin + 10, yPos);
                yPos += findingLines.length * 6 + 3;
            });

            yPos += 10;

            // Recommendations Section
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Recommendations', margin, yPos);
            yPos += 8;

            doc.setFontSize(10);
            const recommendations = reportData.recommendations || [];
            recommendations.forEach((rec, index) => {
                // Check if we need a new page
                if (yPos > pageHeight - 60) {
                    doc.addPage();
                    yPos = margin;
                }

                const bulletPoint = `--`;
                doc.text(bulletPoint, margin + 5, yPos);

                // Title
                if (rec.title) {
                    doc.setFont('helvetica', 'bold');
                    const titleLines = doc.splitTextToSize(rec.title, pageWidth - 2 * margin - 10);
                    doc.text(titleLines, margin + 10, yPos);
                    yPos += titleLines.length * 6 + 2;
                }

                // Description
                if (rec.description) {
                    doc.setFont('helvetica', 'normal');
                    const cleanDesc = rec.description.replace(/<[^>]*>/g, ''); // Remove HTML tags
                    const descLines = doc.splitTextToSize(cleanDesc, pageWidth - 2 * margin - 10);
                    doc.text(descLines, margin + 10, yPos);
                    yPos += descLines.length * 6 + 2;
                }

                // Steps
                if (rec.steps && rec.steps.length > 0) {
                    doc.setFont('helvetica', 'italic');
                    doc.text('Steps:', margin + 10, yPos);
                    yPos += 6;
                    doc.setFont('helvetica', 'normal');
                    rec.steps.forEach((step, i) => {
                        const stepLines = doc.splitTextToSize(`${i + 1}. ${step}`, pageWidth - 2 * margin - 15);
                        doc.text(stepLines, margin + 15, yPos);
                        yPos += stepLines.length * 6 + 1;
                    });
                    yPos += 2;
                }

                // Risks
                if (rec.risks && rec.risks.length > 0) {
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(220, 38, 38); // Red color
                    doc.text('Risks:', margin + 10, yPos);
                    yPos += 6;
                    doc.setFont('helvetica', 'normal');
                    rec.risks.forEach((risk, i) => {
                        const riskLines = doc.splitTextToSize(`• ${risk}`, pageWidth - 2 * margin - 15);
                        doc.text(riskLines, margin + 15, yPos);
                        yPos += riskLines.length * 6 + 1;
                    });
                    doc.setTextColor(0, 0, 0); // Reset to black
                    yPos += 2;
                }

                // Metadata
                if (rec.priority || rec.urgency || rec.category) {
                    doc.setFontSize(8);
                    doc.setTextColor(107, 114, 128); // Gray color
                    const metadata = `Priority: ${rec.priority || 'N/A'} · Urgency: ${rec.urgency || 'N/A'} · Category: ${rec.category || 'N/A'}`;
                    doc.text(metadata, margin + 10, yPos);
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0); // Reset to black
                    yPos += 6;
                }

                yPos += 5; // Space between recommendations
            });

            yPos += 20;

            // Check if signatures fit on current page
            if (yPos > pageHeight - 80) {
                doc.addPage();
                yPos = margin;
            }

            // Signatures Section
            const colWidth = (pageWidth - 3 * margin) / 2;

            // Report Prepared By
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Report Prepared By', margin, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${reportData.preparedBy || 'Alex Mukuria'}`, margin, yPos);
            yPos += 10;
            doc.text('Date: _________________________', margin, yPos);
            yPos += 10;
            doc.text('Sign: _________________________', margin, yPos);

            // Reviewed By
            const col2X = pageWidth / 2 + 10;
            let yPos2 = yPos - 28;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Reviewed By', col2X, yPos2);
            yPos2 += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${reportData.reviewedBy || 'Kelvin Mwantari'}`, col2X, yPos2);
            yPos2 += 10;
            doc.text('Date: _________________________', col2X, yPos2);
            yPos2 += 10;
            doc.text('Sign: _________________________', col2X, yPos2);

            // Save the PDF
            doc.save(`${fileName}.pdf`);
            return true;
        } catch (error) {
            console.error('PDF export failed:', error);
            throw new Error('Failed to export PDF. Please try again.');
        }
    }
}
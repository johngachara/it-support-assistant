import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Register fonts - vfs_fonts directly exports the font files
if (pdfMake.vfs === undefined) {
    pdfMake.vfs = pdfFonts;
}

export class PDFExportService {
    /**
     * Strip HTML tags and convert basic HTML entities to plain text
     */
    static stripHtml(html) {
        if (!html || typeof html !== 'string') return '';

        return html
            // Convert common HTML entities
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            // Remove HTML tags
            .replace(/<[^>]*>/g, '')
            // Clean up extra whitespace
            .replace(/\s+/g, ' ')
            .trim();
    }

    static async exportToPDF(reportData, fileName = 'report') {
        try {
            const docDefinition = {
                content: [
                    // Title
                    {
                        text: reportData.title || 'Laptop Technical Report --- Paul Kamau',
                        style: 'header',
                        alignment: 'center',
                        color: '#2563eb'
                    },
                    {
                        canvas: [
                            {
                                type: 'line',
                                x1: 0,
                                y1: 5,
                                x2: 515,
                                y2: 5,
                                lineWidth: 1,
                                lineColor: '#2563eb'
                            }
                        ],
                        margin: [0, 5, 0, 15]
                    },

                    // Machine Details Section
                    {
                        text: 'Machine Details',
                        style: 'sectionHeader'
                    },
                    {
                        table: {
                            widths: ['*', '*', '*', '*', '*'],
                            body: [
                                [
                                    { text: 'Make & Model', style: 'tableHeader' },
                                    { text: 'Serial Number', style: 'tableHeader' },
                                    { text: 'RAM', style: 'tableHeader' },
                                    { text: 'Storage', style: 'tableHeader' },
                                    { text: 'Processor', style: 'tableHeader' }
                                ],
                                [
                                    reportData.machineDetails?.make && reportData.machineDetails?.model
                                        ? `${reportData.machineDetails.make} ${reportData.machineDetails.model}`
                                        : 'N/A',
                                    reportData.machineDetails?.serialNumber || 'N/A',
                                    reportData.machineDetails?.ram || 'N/A',
                                    reportData.machineDetails?.storage || 'N/A',
                                    reportData.machineDetails?.processor || 'N/A'
                                ]
                            ]
                        },
                        layout: {
                            fillColor: function (rowIndex) {
                                return rowIndex === 0 ? '#f1f5f9' : null;
                            },
                            hLineWidth: function () { return 0.5; },
                            vLineWidth: function () { return 0.5; },
                            hLineColor: function () { return '#e2e8f0'; },
                            vLineColor: function () { return '#e2e8f0'; }
                        },
                        margin: [0, 0, 0, 15]
                    },

                    // User Complaint Section
                    {
                        text: 'User Complaint',
                        style: 'sectionHeader'
                    },
                    ...this.createComplaintList(reportData.userComplaint),

                    // Findings Section
                    {
                        text: 'Findings',
                        style: 'sectionHeader',
                        margin: [0, 15, 0, 10]
                    },
                    ...this.createBulletList(reportData.findings),

                    // Recommendations Section
                    {
                        text: 'Recommendations',
                        style: 'sectionHeader',
                        margin: [0, 15, 0, 10]
                    },
                    ...this.createRecommendationsList(reportData.recommendations),

                    // Signatures Section
                    {
                        columns: [
                            {
                                width: '50%',
                                stack: [
                                    { text: 'Report Prepared By', style: 'signatureHeader', margin: [0, 30, 0, 5] },
                                    { text: `Name: ${reportData.preparedBy || 'Alex Mukuria'}`, style: 'signatureText' },
                                    { text: 'Date: _________________________', style: 'signatureText', margin: [0, 5, 0, 5] },
                                    { text: 'Sign: _________________________', style: 'signatureText' }
                                ]
                            },
                            {
                                width: '50%',
                                stack: [
                                    { text: 'Reviewed By', style: 'signatureHeader', margin: [0, 30, 0, 5] },
                                    { text: `Name: ${reportData.reviewedBy || 'Kelvin Mwantari'}`, style: 'signatureText' },
                                    { text: 'Date: _________________________', style: 'signatureText', margin: [0, 5, 0, 5] },
                                    { text: 'Sign: _________________________', style: 'signatureText' }
                                ]
                            }
                        ]
                    }
                ],
                styles: {
                    header: {
                        fontSize: 16,
                        bold: true,
                        margin: [0, 0, 0, 10]
                    },
                    sectionHeader: {
                        fontSize: 12,
                        bold: true,
                        margin: [0, 0, 0, 8]
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 10,
                        alignment: 'center'
                    },
                    normal: {
                        fontSize: 10
                    },
                    bulletText: {
                        fontSize: 10,
                        margin: [0, 2, 0, 2]
                    },
                    recommendationTitle: {
                        fontSize: 11,
                        bold: true,
                        margin: [0, 2, 0, 2]
                    },
                    recommendationDescription: {
                        fontSize: 10,
                        margin: [15, 2, 0, 2]
                    },
                    subSection: {
                        fontSize: 10,
                        italics: true,
                        margin: [15, 5, 0, 2]
                    },
                    stepText: {
                        fontSize: 10,
                        margin: [20, 2, 0, 2]
                    },
                    riskText: {
                        fontSize: 10,
                        color: '#dc2626',
                        margin: [20, 2, 0, 2]
                    },
                    metadata: {
                        fontSize: 8,
                        color: '#6b7280',
                        margin: [15, 3, 0, 5]
                    },
                    signatureHeader: {
                        fontSize: 11,
                        bold: true
                    },
                    signatureText: {
                        fontSize: 10,
                        margin: [0, 2, 0, 2]
                    }
                },
                defaultStyle: {
                    fontSize: 10,
                    font: 'Roboto'
                },
                pageMargins: [40, 40, 40, 40]
            };

            // Create and download PDF
            return new Promise((resolve, reject) => {
                try {
                    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
                    pdfDocGenerator.download(`${fileName}.pdf`);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            });
        } catch (error) {
            console.error('PDF export failed:', error);
            throw new Error('Failed to export PDF. Please try again.');
        }
    }

    static createComplaintList(complaint) {
        if (!complaint) {
            return [
                {
                    ul: ['No complaint specified'],
                    style: 'bulletText',
                    margin: [0, 0, 0, 10]
                }
            ];
        }

        const complaints = Array.isArray(complaint) ? complaint : [complaint];
        const complaintItems = complaints
            .map(item => {
                const text = typeof item === 'string' ? item : item.text || JSON.stringify(item);
                return this.stripHtml(text);
            })
            .filter(text => text);

        if (complaintItems.length === 0) {
            return [
                {
                    ul: ['No complaint specified'],
                    style: 'bulletText',
                    margin: [0, 0, 0, 10]
                }
            ];
        }

        return [
            {
                ul: complaintItems,
                style: 'bulletText',
                margin: [0, 0, 0, 10]
            }
        ];
    }

    static createBulletList(items) {
        if (!items || items.length === 0) {
            return [
                {
                    ul: ['No items specified'],
                    style: 'bulletText',
                    margin: [0, 0, 0, 10]
                }
            ];
        }

        const listItems = items
            .map(item => {
                const text = typeof item === 'string' ? item : item.text || JSON.stringify(item);
                return this.stripHtml(text);
            })
            .filter(text => text);

        if (listItems.length === 0) {
            return [
                {
                    ul: ['No items specified'],
                    style: 'bulletText',
                    margin: [0, 0, 0, 10]
                }
            ];
        }

        return [
            {
                ul: listItems,
                style: 'bulletText',
                margin: [0, 0, 0, 10]
            }
        ];
    }

    static createRecommendationsList(recommendations) {
        if (!recommendations || recommendations.length === 0) {
            return [
                {
                    ul: ['No items specified'],
                    style: 'bulletText',
                    margin: [0, 0, 0, 10]
                }
            ];
        }

        const recItems = [];

        recommendations.forEach((rec, index) => {
            if (typeof rec === 'string') {
                const cleanText = this.stripHtml(rec);
                if (cleanText) {
                    recItems.push({
                        text: cleanText,
                        style: 'bulletText',
                        margin: [0, 2, 0, 5]
                    });
                }
            } else if (typeof rec === 'object') {
                const recStack = [];

                // Title
                if (rec.title) {
                    const cleanTitle = this.stripHtml(rec.title);
                    recStack.push({
                        text: cleanTitle,
                        style: 'recommendationTitle'
                    });
                }

                // Description
                if (rec.description) {
                    const cleanDesc = this.stripHtml(rec.description);
                    if (cleanDesc) {
                        recStack.push({
                            text: cleanDesc,
                            style: 'recommendationDescription'
                        });
                    }
                }

                // Steps
                if (rec.steps && rec.steps.length > 0) {
                    recStack.push({
                        text: 'Steps:',
                        style: 'subSection'
                    });

                    const stepItems = rec.steps
                        .map(step => this.stripHtml(typeof step === 'string' ? step : String(step)))
                        .filter(step => step);

                    if (stepItems.length > 0) {
                        recStack.push({
                            ol: stepItems,
                            style: 'stepText'
                        });
                    }
                }

                // Risks
                if (rec.risks && rec.risks.length > 0) {
                    recStack.push({
                        text: 'Risks:',
                        style: 'subSection',
                        color: '#dc2626'
                    });

                    const riskItems = rec.risks
                        .map(risk => this.stripHtml(typeof risk === 'string' ? risk : String(risk)))
                        .filter(risk => risk);

                    if (riskItems.length > 0) {
                        recStack.push({
                            ul: riskItems,
                            style: 'riskText'
                        });
                    }
                }

                // Metadata - Only show if not default values
                const hasNonDefaultMetadata =
                    (rec.priority && rec.priority !== 'Medium') ||
                    (rec.urgency && rec.urgency !== 'This Week (1-7 days)') ||
                    (rec.category && rec.category !== 'General');

                if (hasNonDefaultMetadata) {
                    const metadataParts = [];
                    if (rec.priority && rec.priority !== 'Medium') {
                        metadataParts.push(`Priority: ${rec.priority}`);
                    }
                    if (rec.urgency && rec.urgency !== 'This Week (1-7 days)') {
                        metadataParts.push(`Urgency: ${rec.urgency}`);
                    }
                    if (rec.category && rec.category !== 'General') {
                        metadataParts.push(`Category: ${rec.category}`);
                    }

                    if (metadataParts.length > 0) {
                        recStack.push({
                            text: metadataParts.join(' · '),
                            style: 'metadata'
                        });
                    }
                }

                if (recStack.length > 0) {
                    recItems.push({
                        stack: recStack,
                        margin: [0, 0, 0, 8]
                    });
                }
            }
        });

        if (recItems.length === 0) {
            return [
                {
                    ul: ['No items specified'],
                    style: 'bulletText',
                    margin: [0, 0, 0, 10]
                }
            ];
        }

        return [
            {
                ul: recItems,
                margin: [0, 0, 0, 10]
            }
        ];
    }
}

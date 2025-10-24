import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export class DOCXExportService {
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

    static async exportToDOCX(reportData, fileName = 'report') {
        try {
            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 1440,    // 1 inch
                                right: 1440,
                                bottom: 1440,
                                left: 1440
                            }
                        }
                    },
                    children: [
                        // Title
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: reportData.title || 'Laptop Technical Report --- Paul Kamau',
                                    bold: true,
                                    size: 32 // 16pt
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 }
                        }),

                        // Machine Details Header
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Machine Details',
                                    bold: true,
                                    size: 28 // 14pt
                                })
                            ],
                            spacing: { before: 200, after: 200 }
                        }),

                        // Machine Details Table
                        this.createMachineDetailsTable(reportData.machineDetails),

                        // User Complaint Section
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'User Complaint',
                                    bold: true,
                                    size: 28 // 14pt
                                })
                            ],
                            spacing: { before: 400, after: 200 }
                        }),

                        ...this.createComplaintBullets(reportData.userComplaint),

                        // Findings Section
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Findings',
                                    bold: true,
                                    size: 28 // 14pt
                                })
                            ],
                            spacing: { before: 200, after: 200 }
                        }),

                        ...this.createBulletPoints(reportData.findings || []),

                        // Recommendations Section
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Recommendations',
                                    bold: true,
                                    size: 28 // 14pt
                                })
                            ],
                            spacing: { before: 400, after: 200 }
                        }),

                        ...this.createBulletPoints(reportData.recommendations || []),

                        // Signatures Section
                        new Paragraph({
                            text: '',
                            spacing: { before: 800 }
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Report Prepared By',
                                    bold: true,
                                    size: 26 // 13pt
                                })
                            ],
                            spacing: { after: 200 }
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Name: ',
                                    bold: true,
                                    size: 22 // 11pt
                                }),
                                new TextRun({
                                    text: reportData.preparedBy || 'Alex Mukuria',
                                    size: 22 // 11pt
                                })
                            ],
                            spacing: { after: 200 }
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Date: _________________________',
                                    size: 22 // 11pt
                                })
                            ],
                            spacing: { after: 200 }
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Sign: _________________________',
                                    size: 22 // 11pt
                                })
                            ],
                            spacing: { after: 400 }
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Reviewed By',
                                    bold: true,
                                    size: 26 // 13pt
                                })
                            ],
                            spacing: { after: 200 }
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Name: ',
                                    bold: true,
                                    size: 22 // 11pt
                                }),
                                new TextRun({
                                    text: reportData.reviewedBy || 'Kelvin Mwantari',
                                    size: 22 // 11pt
                                })
                            ],
                            spacing: { after: 200 }
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Date: _________________________',
                                    size: 22 // 11pt
                                })
                            ],
                            spacing: { after: 200 }
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Sign: _________________________',
                                    size: 22 // 11pt
                                })
                            ]
                        })
                    ]
                }]
            });

            // Generate and save the document
            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${fileName}.docx`);
            return true;
        } catch (error) {
            console.error('DOCX export failed:', error);
            throw new Error('Failed to export DOCX. Please try again.');
        }
    }

    static createMachineDetailsTable(machineDetails) {
        const headers = ['Make & Model', 'Serial Number', 'RAM', 'Storage', 'Processor'];
        const values = [
            machineDetails?.make && machineDetails?.model
                ? `${machineDetails.make} ${machineDetails.model}`
                : 'N/A',
            machineDetails?.serialNumber || 'N/A',
            machineDetails?.ram || 'N/A',
            machineDetails?.storage || 'N/A',
            machineDetails?.processor || 'N/A'
        ];

        return new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            rows: [
                // Header row
                new TableRow({
                    children: headers.map(header =>
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: header,
                                            bold: true,
                                            size: 22 // 11pt
                                        })
                                    ],
                                    alignment: AlignmentType.CENTER
                                })
                            ],
                            shading: {
                                fill: 'D9E2F3'
                            },
                            margins: {
                                top: 100,
                                bottom: 100,
                                left: 100,
                                right: 100
                            }
                        })
                    ),
                    tableHeader: true
                }),
                // Data row
                new TableRow({
                    children: values.map(value =>
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: value,
                                            size: 22 // 11pt
                                        })
                                    ],
                                    alignment: AlignmentType.CENTER
                                })
                            ],
                            margins: {
                                top: 100,
                                bottom: 100,
                                left: 100,
                                right: 100
                            }
                        })
                    )
                })
            ],
            margins: {
                top: 100,
                bottom: 300
            }
        });
    }

    static createComplaintBullets(complaint) {
        if (!complaint) {
            return [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'No complaint specified',
                            size: 22 // 11pt
                        })
                    ],
                    bullet: {
                        level: 0
                    },
                    spacing: { after: 400 }
                })
            ];
        }

        // Handle complaint as array or string
        const complaints = Array.isArray(complaint) ? complaint : [complaint];

        return complaints.map((item, index) => {
            const text = typeof item === 'string' ? item : item.text || JSON.stringify(item);
            return new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        size: 22 // 11pt
                    })
                ],
                bullet: {
                    level: 0
                },
                spacing: { after: index === complaints.length - 1 ? 400 : 200 }
            });
        });
    }

    static createBulletPoints(items) {
        if (!items || items.length === 0) {
            return [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'No items specified',
                            size: 22 // 11pt
                        })
                    ],
                    bullet: {
                        level: 0
                    },
                    spacing: { after: 200 }
                })
            ];
        }

        const paragraphs = [];

        items.forEach((item, index) => {
            if (typeof item === 'string') {
                // Simple string item
                const cleanText = this.stripHtml(item);
                if (cleanText) {
                    paragraphs.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: cleanText,
                                    size: 22 // 11pt
                                })
                            ],
                            bullet: {
                                level: 0
                            },
                            spacing: { after: 200 }
                        })
                    );
                }
            } else if (typeof item === 'object') {
                // Complex object with title, description, steps, etc.

                // Title
                if (item.title) {
                    const cleanTitle = this.stripHtml(item.title);
                    paragraphs.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: cleanTitle,
                                    bold: true,
                                    size: 24 // 12pt
                                })
                            ],
                            bullet: {
                                level: 0
                            },
                            spacing: { after: 100 }
                        })
                    );
                }

                // Description
                if (item.description) {
                    const cleanDesc = this.stripHtml(item.description);
                    if (cleanDesc) {
                        paragraphs.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: cleanDesc,
                                        size: 22 // 11pt
                                    })
                                ],
                                spacing: { after: 100 },
                                indent: { left: 720 }
                            })
                        );
                    }
                }

                // Steps
                if (item.steps && item.steps.length > 0) {
                    paragraphs.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Steps:',
                                    italic: true,
                                    size: 22 // 11pt
                                })
                            ],
                            spacing: { after: 50 },
                            indent: { left: 720 }
                        })
                    );

                    item.steps.forEach((step, i) => {
                        const cleanStep = this.stripHtml(step);
                        if (cleanStep) {
                            paragraphs.push(
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: cleanStep,
                                            size: 22 // 11pt
                                        })
                                    ],
                                    numbering: {
                                        reference: 'number-styles',
                                        level: 0
                                    },
                                    spacing: { after: 50 },
                                    indent: { left: 1080 }
                                })
                            );
                        }
                    });
                }

                // Risks
                if (item.risks && item.risks.length > 0) {
                    paragraphs.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Risks:',
                                    italic: true,
                                    color: 'DC2626',
                                    size: 22 // 11pt
                                })
                            ],
                            spacing: { after: 50 },
                            indent: { left: 720 }
                        })
                    );

                    item.risks.forEach((risk, i) => {
                        const cleanRisk = this.stripHtml(risk);
                        if (cleanRisk) {
                            paragraphs.push(
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: cleanRisk,
                                            color: 'DC2626',
                                            size: 22 // 11pt
                                        })
                                    ],
                                    bullet: {
                                        level: 1
                                    },
                                    spacing: { after: 50 },
                                    indent: { left: 1080 }
                                })
                            );
                        }
                    });
                }

                // Metadata - Only show if not default values
                const hasNonDefaultMetadata =
                    (item.priority && item.priority !== 'Medium') ||
                    (item.urgency && item.urgency !== 'This Week (1-7 days)') ||
                    (item.category && item.category !== 'General');

                if (hasNonDefaultMetadata) {
                    const metadataParts = [];
                    if (item.priority && item.priority !== 'Medium') {
                        metadataParts.push(`Priority: ${item.priority}`);
                    }
                    if (item.urgency && item.urgency !== 'This Week (1-7 days)') {
                        metadataParts.push(`Urgency: ${item.urgency}`);
                    }
                    if (item.category && item.category !== 'General') {
                        metadataParts.push(`Category: ${item.category}`);
                    }

                    if (metadataParts.length > 0) {
                        const metadata = metadataParts.join(' · ');
                        paragraphs.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: metadata,
                                        size: 20, // 10pt
                                        color: '6B7280'
                                    })
                                ],
                                spacing: { after: 200 },
                                indent: { left: 720 }
                            })
                        );
                    }
                }

                // Add spacing paragraph after each recommendation
                paragraphs.push(
                    new Paragraph({
                        text: '',
                        spacing: { after: 200 }
                    })
                );
            }
        });

        return paragraphs;
    }
}
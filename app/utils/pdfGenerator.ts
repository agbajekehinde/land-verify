import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportFindings } from '../dashboard/components/verificationcontext/VerificationContext';

// Define a custom interface to extend jsPDF with the autoTable properties
interface PDFDocumentWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export const generateVerificationPDF = (
  findings: ReportFindings, 
  address: string,
  verificationDetails: {
    city: string;
    state: string;
    postalCode: string;
    createdAt: string;
  }
) => {
  // Create a new PDF document
  const doc = new jsPDF() as PDFDocumentWithAutoTable;
  
  try {
    const imgData = '/LandVerify-logo.png' ; 
    doc.addImage(imgData, 'PNG', 15, 10, 50, 20);
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
  }
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text('Land Verification Report', 105, 40, { align: 'center' });
  
  // Add verification details
  doc.setFontSize(12);
  doc.setTextColor(52, 73, 94);
  
  const formattedDate = new Date(verificationDetails.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  doc.text(`Address: ${address}`, 20, 55);
  doc.text(`${verificationDetails.city}, ${verificationDetails.state} ${verificationDetails.postalCode}`, 20, 62);
  doc.text(`Verification Date: ${formattedDate}`, 20, 69);
  doc.text(`Report ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`, 20, 76);
  
  // Add verification status - always "Approved" since we only generate PDFs for approved reports
  doc.setFillColor(39, 174, 96);
  doc.setDrawColor(39, 174, 96);
  doc.roundedRect(140, 55, 50, 10, 2, 2, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.text('COMPLETED', 165, 62, { align: 'center' });
  
  // Add divider
  doc.setDrawColor(189, 195, 199);
  doc.setLineWidth(0.5);
  doc.line(20, 85, 190, 85);
  
  // Reset text color
  doc.setTextColor(52, 73, 94);
  
  // Start Y position for findings content
  let yPos = 95;
  
  // Observations section
  if (findings.observations && findings.observations.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Observations', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    yPos += 10;
    
    // Create a table for observations
    const tableRows = findings.observations.map(observation => [observation]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Key Observations']],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 5,
        fontSize: 10
      },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
  }
  
  // Recommendations section
  if (findings.recommendations && findings.recommendations.length > 0) {
    // Check if we need to add a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendations', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    yPos += 10;
    
    // Create a table for recommendations
    const tableRows = findings.recommendations.map(recommendation => [recommendation]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Recommendations']],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 5,
        fontSize: 10
      },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
  }
  
  // Issues section
  if (findings.issues && findings.issues.length > 0) {
    // Check if we need to add a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Issues', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    yPos += 10;
    
    // Create a table for issues
    const tableRows = findings.issues.map(issue => [issue]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Identified Issues']],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [231, 76, 60],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 5,
        fontSize: 10
      },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
  }
  
  // Add any additional fields that might be in the findings
  const additionalFields = Object.entries(findings)
    .filter(([key]) => !['observations', 'recommendations', 'issues'].includes(key));
  
  if (additionalFields.length > 0) {
    // Check if we need to add a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Information', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    yPos += 10;
    
    // Create a table for additional fields
    const tableRows = additionalFields.map(([key, value]) => {
      // Handle different data types for value
      let displayValue = '';
      if (typeof value === 'string') {
        displayValue = value;
      } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        displayValue = JSON.stringify(value);
      } else {
        displayValue = String(value);
      }
      
      return [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), displayValue];
    });
    
    autoTable(doc, {
      startY: yPos,
      body: tableRows,
      theme: 'striped',
      styles: {
        cellPadding: 5,
        fontSize: 10
      },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
  }
  
  // Add footer with disclaimer
  
  const generatedDate = new Date(verificationDetails.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8).setTextColor(180, 180, 180);

    const disclaimer = 
      `Disclaimer: This verification report is based on information available as of ${generatedDate} and is provided for informational purposes only. `+
      `LandVerify does not warrant or guarantee the accuracy, completeness, or reliability of the information contained herein. `+
      `This report does not constitute legal, financial, or professional advice, nor does it serve as a substitute for independent due diligence.\n\n`+
      `LandVerify expressly disclaims liability for errors, omissions, or misrepresentations in the data provided. `+
      `By using this report, the recipient acknowledges that LandVerify shall not be held responsible for any damages arising from reliance on this information.`;
    
   
    doc.text(
      disclaimer,
      20, 
      265, 
      {
        align: 'left',
        maxWidth: 170 
      }
    );
    
    // Add page number with more space from disclaimer
    doc.setFontSize(9).setTextColor(80, 80, 80);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  return doc;
};
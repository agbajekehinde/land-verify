import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportFindings } from '../dashboard/components/verificationcontext/VerificationContext';

// Define a custom interface to extend jsPDF with the autoTable properties
interface PDFDocumentWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

// Helper function to convert a remote image to a data URL
const imageToDataURL = async (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      // Determine MIME type based on file extension
      const mimeType = src.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      resolve(canvas.toDataURL(mimeType));
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

export const generateVerificationPDF = async (
  findings: ReportFindings, 
  address: string,
  verificationDetails: {
    city: string;
    state: string;
    postalCode: string;
    createdAt: string;
  },
  reportFiles?: string[] // Add reportFiles parameter
) => {
  // Create a new PDF document
  const doc = new jsPDF() as PDFDocumentWithAutoTable;
  
  // Convert the logo image to a data URL and then add it to the PDF
  try {
    const logoDataUrl = await imageToDataURL('/LandVerify-logo.png');
    doc.addImage(logoDataUrl, 'PNG', 16, 12, 36, 12);
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
  }
  
  // Add title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text('Land Verification Report', 105, 40, { align: 'center' });
  
  // Add verification details
  doc.setFont('helvetica', 'normal');
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
  
  // Add verification status - always "COMPLETED" since we only generate PDFs for approved reports
  doc.setFillColor(39, 174, 96);
  doc.setDrawColor(39, 174, 96);

  // Increase width for full container coverage
  doc.roundedRect(140, 55, 42, 10, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold'); // Set bold font
  doc.setTextColor(255, 255, 255);

  // Center text properly in the expanded container
  doc.text('COMPLETED', 160, 61.5, { align: 'center' });
  
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
  
  // Add any additional fields that might be in the findings - MOVED UP
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
  
  // Add the report files section - MOVED DOWN
  if (reportFiles && reportFiles.length > 0) {
    // Check if we need to add a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Verification Images', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    yPos += 10;
    
    // Process each image
    for (let i = 0; i < reportFiles.length; i++) {
      // Set fixed dimensions for the image
      const imgWidth = 160; // width in mm
      const imgHeight = 90; // height in mm

      // Calculate the total space needed: title (5mm) + image height + margin (20mm)
      const spaceNeeded = 5 + imgHeight + 20;
      // Ensure adding this image won't overlap with the footer at y = 265
      if (yPos + spaceNeeded > 265) {
        doc.addPage();
        yPos = 20;
      }
      
      try {
        // Convert image to data URL
        const imageDataUrl = await imageToDataURL(reportFiles[i]);
        // Determine image type based on file extension for jsPDF
        const imageType = reportFiles[i].toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';
        
        // Add image title
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Image ${i + 1}`, 20, yPos);
        
        // Add image with fixed dimensions
        doc.addImage(imageDataUrl, imageType, 20, yPos + 5, imgWidth, imgHeight);
        
        // Update yPos for the next image
        yPos += spaceNeeded;
      } catch (error) {
        console.error(`Error processing image ${i + 1}:`, error);
        
        // Add a placeholder text if image fails to load
        doc.setFontSize(10);
        doc.text(`[Image ${i + 1} - Could not be displayed]`, 20, yPos + 5);
        yPos += 15;
      }
    }
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
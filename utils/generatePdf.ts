import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface GeneratePdfOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: string;
  title?: string;
  subtitle?: string;
  dateRange?: {
    from: Date;
    to?: Date;
  };
  summary?: Record<string, string>;
  companyDetails?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website: string;
    logo?: string;
  };
}

export async function generatePdf(
  element: HTMLElement,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const {
    filename = 'report.pdf',
    orientation = 'portrait',
    format = 'a4',
    companyDetails = {
      name: 'SalonBooking.lk',
      website: 'www.salonbooking.lk',
    },
    title = 'Report',
    subtitle = '',
    dateRange,
    summary
  } = options;
  // Create PDF document
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',  
    format
  });
  // Page dimensions
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margins = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  };
  // Convert the element to canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Higher scale for better quality
    logging: false,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  });
  
  const imgData = canvas.toDataURL('image/png');
    // Calculate positioning for A4 size
  const imgWidth = pageWidth - (margins.left + margins.right);
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let yPosition = margins.top; // Start from the top margin since HTML content has its own header
  
  // Add the image to the PDF
  pdf.addImage(imgData, 'PNG', margins.left, yPosition, imgWidth, imgHeight);
  
  // Save the PDF
  pdf.save(filename);
}

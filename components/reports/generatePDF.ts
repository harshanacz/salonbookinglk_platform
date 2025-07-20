import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface ReportData {
  summary: {
    totalRevenue: number;
    totalAppointments: number;
    newClients: number;
  };
  charts: {
    serviceDistribution: Array<{
      name: string;
      value: number;
      revenue: number;
    }>;
  };
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const generatePDF = (data: ReportData) => {
  const doc = new jsPDF();
  let yPos = 20;
  
  // Add header with styling
  doc.setFillColor(51, 65, 85); // slate-700
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
  
  // Title with white color
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Salon Performance Report', 105, 25, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Date Range with styling
  yPos = 50;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Report Period: ${format(data.dateRange.from, 'PP')} - ${format(data.dateRange.to, 'PP')}`,
    105,
    yPos,
    { align: 'center' }
  );
  
  // Summary Section with box
  yPos = 70;
  doc.setDrawColor(51, 65, 85);
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(20, yPos, 170, 40, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Financial Summary', 30, yPos + 15);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Total Revenue: LKR ${data.summary.totalRevenue.toLocaleString()}`, 35, yPos + 25);
  doc.text(`Average Revenue per Appointment: LKR ${(data.summary.totalRevenue / data.summary.totalAppointments).toFixed(2)}`, 35, yPos + 33);
  
  // Appointment Statistics
  yPos = 125;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(20, yPos, 170, 35, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Appointment Statistics', 30, yPos + 15);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Appointments: ${data.summary.totalAppointments}`, 35, yPos + 25);
  doc.text(`New Clients: ${data.summary.newClients}`, 120, yPos + 25);
  
  // Service Distribution Section with table
  yPos = 175;
  doc.setFont('helvetica', 'bold');
  doc.text('Service Distribution', 20, yPos);
  
  // Table headers
  yPos += 10;
  doc.setFillColor(241, 245, 249);
  doc.rect(20, yPos, 170, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Service Type', 25, yPos + 6);
  doc.text('Appointments', 95, yPos + 6);
  doc.text('Revenue (LKR)', 145, yPos + 6);
  
  // Table content
  doc.setFont('helvetica', 'normal');
  yPos += 8;
  data.charts.serviceDistribution.forEach((service) => {
    yPos += 8;
    doc.text(service.name, 25, yPos);
    doc.text(service.value.toString(), 95, yPos);
    doc.text(service.revenue.toLocaleString(), 145, yPos);
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${format(new Date(), 'PPpp')}`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );
  
  // Save the PDF
  const fileName = `salon-report-${format(data.dateRange.from, 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};

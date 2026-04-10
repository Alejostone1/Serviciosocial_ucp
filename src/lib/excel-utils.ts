import ExcelJS from 'exceljs';

/**
 * Utility to create a standardized UCP styled Excel workbook
 */
export async function createUCPExcelReport(
  sheetName: string,
  columns: { header: string; key: string; width: number }[],
  data: any[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Define columns
  worksheet.columns = columns;

  // Header style (UCP Red #8B1E1E)
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B1E1E' }
    };
    cell.font = {
      name: 'Arial',
      color: { argb: 'FFFFFFFF' },
      bold: true,
      size: 11
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  headerRow.height = 25;

  // Add data with basic styling
  data.forEach((item) => {
    const row = worksheet.addRow(item);
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
    row.height = 20;
  });

  // Write to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

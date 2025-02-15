
import { PurchaseOrder, Invoice, ComparisonResult } from "@/types";

export const parsePurchaseOrders = (csvContent: string): PurchaseOrder[] => {
  const lines = csvContent.split('\n').slice(1); // Remove header
  return lines
    .filter(line => line.trim())
    .map(line => {
      const [poNumber, lineNum, dueDate, amount] = line.split(';').map(field => field?.trim() || '');
      
      // Skip invalid lines
      if (!poNumber || !lineNum || !dueDate || !amount) {
        console.warn('Invalid PO line:', line);
        return null;
      }

      // Clean up amount string and convert to number (Brazilian format)
      const cleanAmount = amount
        .replace('R$', '')
        .replace(/\s/g, '')  // Remove any whitespace
        .replace(/\./g, '')  // Remove thousand separators
        .replace(',', '.'); // Replace decimal separator

      return {
        number: poNumber,
        line: parseInt(lineNum),
        dueDate: new Date(dueDate),
        amount: parseFloat(cleanAmount)
      };
    })
    .filter((po): po is PurchaseOrder => po !== null);
};

export const parseInvoices = (csvContent: string): Invoice[] => {
  const lines = csvContent.split('\n').slice(1); // Remove header
  return lines
    .filter(line => line.trim())
    .map(line => {
      const fields = line.split(';').map(field => field?.trim() || '');
      const value = fields[0];
      const poRef = fields[1];
      const invoiceNum = fields[2];
      
      // Skip invalid lines
      if (!value || !invoiceNum) {
        console.warn('Invalid invoice line:', line);
        return null;
      }

      try {
        // If poRef is missing or empty, skip this line
        if (!poRef || poRef.trim() === '') {
          console.warn('Missing PO reference:', line);
          return null;
        }

        // Parse PO reference with format "PO-XXXXXX - Line Y"
        const poMatch = poRef.match(/PO-(\d+)\s*-\s*Line\s*(\d+)/i);
        if (!poMatch) {
          console.warn('Invalid PO reference format:', poRef);
          return null;
        }

        const [, poNumber, lineNum] = poMatch;
        
        // Clean up the value string and convert to number (Brazilian format)
        const cleanValue = value
          .replace(/\s/g, '')   // Remove any whitespace
          .replace(/\./g, '')   // Remove thousand separators (dots)
          .replace(',', '.');   // Replace decimal separator (comma to dot)

        const numericValue = parseFloat(cleanValue);
        if (isNaN(numericValue)) {
          console.warn('Invalid numeric value:', value);
          return null;
        }

        return {
          value: numericValue,
          poReference: poRef.trim(),
          invoiceNumber: invoiceNum.trim(),
          poNumber: `PO-${poNumber}`,
          poLine: parseInt(lineNum)
        };
      } catch (error) {
        console.warn('Error parsing invoice line:', line, error);
        return null;
      }
    })
    .filter((invoice): invoice is Invoice => invoice !== null);
};

export const comparePoWithInvoices = (pos: PurchaseOrder[], invoices: Invoice[]): ComparisonResult[] => {
  return pos.map(po => {
    const poInvoices = invoices.filter(
      inv => inv.poNumber === po.number && inv.poLine === po.line
    );
    
    const totalInvoiced = poInvoices.reduce((sum, inv) => sum + inv.value, 0);
    const difference = totalInvoiced - po.amount;
    
    let status: ComparisonResult['status'] = 'match';
    if (poInvoices.length === 0) status = 'no-invoice';
    else if (difference < 0) status = 'below';
    else if (difference > 0) status = 'above';
    
    return {
      po,
      invoices: poInvoices,
      status,
      difference
    };
  });
};


export interface PurchaseOrder {
  number: string;
  line: number;
  dueDate: Date;
  amount: number;
}

export interface Invoice {
  value: number;
  poReference: string;
  invoiceNumber: string;
  poNumber: string;
  poLine: number;
}

export interface ComparisonResult {
  po: PurchaseOrder;
  invoices: Invoice[];
  status: 'no-invoice' | 'below' | 'above' | 'match';
  difference: number;
}

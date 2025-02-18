export interface PurchaseOrder {
  po: string;
  line: string;
  dueDate: string;
  totalPO: number;
}

export interface Invoice {
  valor: number;
  po: string;
  line: string;
  nfmidia: string;
}

export interface CSVParseResult<T> {
  data: T[];
  skippedLines: number[];
}

export interface POUsage {
  po: string;
  line: string;
  dueDate: string;
  totalPO: number;
  used: number;
  remaining: number;
  percentageUsed: number;
  invoices: string[];
}


interface PurchaseOrder {
  po: string;
  line: string;
  dueDate: string;
  totalPO: number;
}

interface Invoice {
  valor: number;
  po: string;
  line: string;
  nfmidia: string;
}

interface CSVParseResult<T> {
  data: T[];
  skippedLines: number[];
}

export const parsePOsCSV = (content: string): CSVParseResult<PurchaseOrder> => {
  if (!content) {
    throw new Error("Conteúdo do arquivo vazio");
  }

  const lines = content.split('\n');
  const skippedLines: number[] = [];
  const data = lines
    .slice(1) // Skip header
    .map((line, index) => ({ line, index: index + 2 })) // +2 because we skip header and array is 0-based
    .filter(({ line, index }) => {
      if (!line || !line.trim()) {
        skippedLines.push(index);
        return false;
      }
      return true;
    })
    .map(({ line }) => {
      const parts = line.split(';'); // Changed from \t to ;
      if (parts.length !== 4) {
        throw new Error(`Formato inválido na linha: ${line}`);
      }
      const [po, lineNum, dueDate, totalPO] = parts;
      
      if (!po || !lineNum || !dueDate || !totalPO) {
        throw new Error(`Dados incompletos na linha: ${line}`);
      }

      return {
        po: po.trim(),
        line: lineNum.trim(),
        dueDate: dueDate.trim(),
        totalPO: parseFloat(totalPO.replace('.', '').replace(',', '.')),
      };
    });

  return { data, skippedLines };
};

export const parseInvoicesCSV = (content: string): CSVParseResult<Invoice> => {
  if (!content) {
    throw new Error("Conteúdo do arquivo vazio");
  }

  const lines = content.split('\n');
  const skippedLines: number[] = [];
  const data = lines
    .slice(1) // Skip header
    .map((line, index) => ({ line, index: index + 2 })) // +2 because we skip header and array is 0-based
    .filter(({ line, index }) => {
      if (!line || !line.trim()) {
        skippedLines.push(index);
        return false;
      }
      return true;
    })
    .map(({ line }) => {
      const parts = line.split(';'); // Changed from \t to ;
      if (parts.length !== 3) {
        throw new Error(`Formato inválido na linha: ${line}`);
      }
      const [valor, poLine, nfmidia] = parts;
      
      if (!valor || !poLine || !nfmidia) {
        throw new Error(`Dados incompletos na linha: ${line}`);
      }

      const poLineParts = poLine.split(' - Line ');
      if (poLineParts.length !== 2) {
        throw new Error(`Formato inválido do número da PO: ${poLine}`);
      }
      const [po, lineNumber] = poLineParts;

      return {
        valor: parseFloat(valor.replace('.', '').replace(',', '.')),
        po: po.trim(),
        line: lineNumber.trim(),
        nfmidia: nfmidia.trim(),
      };
    });

  return { data, skippedLines };
};

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

export const calculatePOUsage = (pos: PurchaseOrder[], invoices: Invoice[]): POUsage[] => {
  return pos.map((po) => {
    const matchingInvoices = invoices.filter(
      (inv) => inv.po === po.po && inv.line === po.line
    );
    const used = matchingInvoices.reduce((sum, inv) => sum + inv.valor, 0);
    const remaining = po.totalPO - used;
    const percentageUsed = (used / po.totalPO) * 100;

    return {
      po: po.po,
      line: po.line,
      dueDate: po.dueDate,
      totalPO: po.totalPO,
      used,
      remaining,
      percentageUsed,
      invoices: matchingInvoices.map((inv) => inv.nfmidia),
    };
  });
};

import { PurchaseOrder, Invoice, CSVParseResult, POUsage } from "@/types";

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
      const parts = line.split(';');
      if (parts.length < 16) {
        throw new Error(`Formato inválido na linha: ${line}`);
      }
      const [
        , // Company (ignored)
        po,
        , // Source (ignored)
        lineNum,
        , // Line Status (ignored)
        , // Finance Contact (ignored)
        , // PO Line Due Date (ignored)
        totalPO,
        , // Total PO - Billed Amount - Billing Currency (ignored)
        , // Total PO - Request Amount in USD (ignored)
        , // Line Memo (ignored)
        , // Purchase Item (ignored)
        , // Title (ignored)
        lineTotalPO,
        , // Line - Billed Amount in Billing Currency (ignored)
        , // Line - Request Amount in USD (ignored)
        , // Line - Billed Amount in USD (ignored)
      ] = parts;

      if (!po || !lineNum || !totalPO || !lineTotalPO) {
        throw new Error(`Dados incompletos na linha: ${line}`);
      }

      const parseCurrency = (value: string) => {
        const cleanValue = value
          .replace('R$', '')
          .replace(/,/g, '')
          .trim();
      
        const parsedValue = parseFloat(cleanValue);
        return parsedValue;
      };

      return {
        po: po.trim(),
        line: lineNum.trim(),
        totalPO: parseCurrency(totalPO),
        lineTotalPO: parseCurrency(lineTotalPO),
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
      totalPO: po.totalPO,
      lineTotalPO: po.lineTotalPO,
      used,
      remaining,
      percentageUsed,
      invoices: matchingInvoices.map((inv) => inv.nfmidia),
    };
  });
};

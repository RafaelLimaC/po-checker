
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ResultsTable } from "@/components/ResultsTable";
import { ResultsChart } from "@/components/ResultsChart";
import { ComparisonResult, PurchaseOrder, Invoice } from "@/types";
import { parsePurchaseOrders, parseInvoices, comparePoWithInvoices } from "@/utils/csvParser";

const Index = () => {
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const handlePOFileLoaded = (content: string) => {
    const parsedPOs = parsePurchaseOrders(content);
    setPOs(parsedPOs);
    if (invoices.length > 0) {
      setResults(comparePoWithInvoices(parsedPOs, invoices));
    }
  };

  const handleInvoiceFileLoaded = (content: string) => {
    const parsedInvoices = parseInvoices(content);
    setInvoices(parsedInvoices);
    if (pos.length > 0) {
      setResults(comparePoWithInvoices(pos, parsedInvoices));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Comparador de POs e Notas Fiscais
          </h1>
          <p className="text-gray-600">
            Faça upload dos arquivos CSV para comparar POs com suas respectivas notas fiscais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FileUpload
            label="Arquivo de POs (CSV)"
            onFileLoaded={handlePOFileLoaded}
          />
          <FileUpload
            label="Arquivo de Notas Fiscais (CSV)"
            onFileLoaded={handleInvoiceFileLoaded}
          />
        </div>

        {results.length > 0 && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Distribuição dos Resultados</h2>
              <ResultsChart results={results} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Resultados Detalhados</h2>
              <ResultsTable results={results} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

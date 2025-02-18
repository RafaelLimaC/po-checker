import React from 'react';
import { parseInvoicesCSV, parsePOsCSV, calculatePOUsage } from "@/utils/csvUtils";
import { POUsage } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface InvoiceFileUploadProps {
  setPOData: React.Dispatch<React.SetStateAction<POUsage[]>>;
  setSkippedLines: React.Dispatch<React.SetStateAction<{ pos: number[], invoices: number[] }>>;
  poData: POUsage[];
}

const InvoiceFileUpload: React.FC<InvoiceFileUploadProps> = ({ setPOData, setSkippedLines }) => {
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const { data: invoices, skippedLines: invSkipped } = parseInvoicesCSV(content);
      const { data: pos } = parsePOsCSV(await (document.getElementById('poFile') as HTMLInputElement)?.files?.[0]?.text() || '');
      const usage = calculatePOUsage(pos, invoices);
      setPOData(usage);
      setSkippedLines(prev => ({ ...prev, invoices: invSkipped }));
      toast({
        title: "Arquivo de Notas Fiscais processado com sucesso!",
        description: "Os dados foram atualizados na tabela.",
      });
    } catch (error) {
      console.error("Error processing invoice file:", error);
      toast({
        title: "Erro ao processar arquivo de Notas Fiscais",
        description: error instanceof Error ? error.message : "Verifique se o formato do arquivo está correto.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Arquivo de Notas Fiscais</h2>
      <p className="text-sm text-muted-foreground">Faça upload do arquivo CSV contendo os dados das notas fiscais</p>
      <input
        id="invoiceFile"
        type="file"
        accept=".csv,.txt"
        onChange={handleFileUpload}
        className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
      />
    </div>
  );
};

export default InvoiceFileUpload;

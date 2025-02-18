import React from 'react';
import { parsePOsCSV, parseInvoicesCSV, calculatePOUsage } from "@/utils/csvUtils";
import { POUsage } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface POFileUploadProps {
  setPOData: React.Dispatch<React.SetStateAction<POUsage[]>>;
  setSkippedLines: React.Dispatch<React.SetStateAction<{ pos: number[], invoices: number[] }>>;
  poData: POUsage[];
}

const POFileUpload: React.FC<POFileUploadProps> = ({ setPOData, setSkippedLines, poData }) => {
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const { data: pos, skippedLines: posSkipped } = parsePOsCSV(content);
      const invoices = poData.length > 0 
        ? parseInvoicesCSV(await (document.getElementById('invoiceFile') as HTMLInputElement)?.files?.[0]?.text() || '').data 
        : [];
      const usage = calculatePOUsage(pos, invoices);
      setPOData(usage);
      setSkippedLines(prev => ({ ...prev, pos: posSkipped }));
      toast({
        title: "Arquivo de POs processado com sucesso!",
        description: "Os dados foram atualizados na tabela.",
      });
    } catch (error) {
      console.error("Error processing PO file:", error);
      toast({
        title: "Erro ao processar arquivo de POs",
        description: error instanceof Error ? error.message : "Verifique se o formato do arquivo está correto.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Arquivo de POs</h2>
      <p className="text-sm text-muted-foreground">Faça upload do arquivo CSV contendo os dados das POs</p>
      <input
        id="poFile"
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

export default POFileUpload;

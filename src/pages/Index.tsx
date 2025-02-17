
import { useState } from "react";
import { parsePOsCSV, parseInvoicesCSV, calculatePOUsage, type POUsage } from "@/utils/csvProcessor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const Index = () => {
  const [poData, setPOData] = useState<POUsage[]>([]);
  const [skippedLines, setSkippedLines] = useState<{ pos: number[], invoices: number[] }>({
    pos: [],
    invoices: [],
  });
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'po' | 'invoice') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      if (fileType === 'po') {
        const { data: pos, skippedLines: posSkipped } = parsePOsCSV(content);
        const invoices = poData.length > 0 
          ? parseInvoicesCSV(await (document.getElementById('invoiceFile') as HTMLInputElement)?.files?.[0]?.text() || '').data 
          : [];
        const usage = calculatePOUsage(pos, invoices);
        setPOData(usage);
        setSkippedLines(prev => ({ ...prev, pos: posSkipped }));
      } else {
        const { data: invoices, skippedLines: invSkipped } = parseInvoicesCSV(content);
        const { data: pos } = parsePOsCSV(await (document.getElementById('poFile') as HTMLInputElement)?.files?.[0]?.text() || '');
        const usage = calculatePOUsage(pos, invoices);
        setPOData(usage);
        setSkippedLines(prev => ({ ...prev, invoices: invSkipped }));
      }
      toast({
        title: "Arquivo processado com sucesso!",
        description: "Os dados foram atualizados na tabela.",
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Erro ao processar arquivo",
        description: error instanceof Error ? error.message : "Verifique se o formato do arquivo está correto.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-8 animate-fade-up">
      <h1 className="text-4xl font-bold mb-8 text-center">Análise de Consumo de POs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Arquivo de POs</h2>
          <p className="text-sm text-muted-foreground">
            Faça upload do arquivo CSV contendo os dados das POs
          </p>
          <input
            id="poFile"
            type="file"
            accept=".csv,.txt"
            onChange={(e) => handleFileUpload(e, 'po')}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Arquivo de Notas Fiscais</h2>
          <p className="text-sm text-muted-foreground">
            Faça upload do arquivo CSV contendo os dados das notas fiscais
          </p>
          <input
            id="invoiceFile"
            type="file"
            accept=".csv,.txt"
            onChange={(e) => handleFileUpload(e, 'invoice')}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
        </Card>
      </div>

      {poData.length > 0 && (
        <div className="overflow-x-auto animate-fade-up">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="bg-muted">
                <th className="p-4 text-left">PO</th>
                <th className="p-4 text-left">Linha</th>
                <th className="p-4 text-left">Data Vencimento</th>
                <th className="p-4 text-right">Valor Total</th>
                <th className="p-4 text-right">Valor Usado</th>
                <th className="p-4 text-right">Valor Restante</th>
                <th className="p-4 text-right">% Utilizado</th>
                <th className="p-4 text-left">NFs</th>
              </tr>
            </thead>
            <tbody>
              {poData.map((row, index) => (
                <tr key={`${row.po}-${row.line}`} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-4">{row.po}</td>
                  <td className="p-4">{row.line}</td>
                  <td className="p-4">{row.dueDate}</td>
                  <td className="p-4 text-right">{formatCurrency(row.totalPO)}</td>
                  <td className="p-4 text-right">{formatCurrency(row.used)}</td>
                  <td className="p-4 text-right">{formatCurrency(row.remaining)}</td>
                  <td className="p-4 text-right">{row.percentageUsed.toFixed(2)}%</td>
                  <td className="p-4">{row.invoices.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {(skippedLines.pos.length > 0 || skippedLines.invoices.length > 0) && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Linhas Ignoradas</h3>
              {skippedLines.pos.length > 0 && (
                <p className="mb-2">
                  <strong>Arquivo de POs:</strong> Linhas {skippedLines.pos.join(", ")}
                </p>
              )}
              {skippedLines.invoices.length > 0 && (
                <p>
                  <strong>Arquivo de Notas Fiscais:</strong> Linhas {skippedLines.invoices.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;

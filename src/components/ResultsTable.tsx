
import { ComparisonResult } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResultsTableProps {
  results: ComparisonResult[];
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const getStatusColor = (status: ComparisonResult['status']) => {
  switch (status) {
    case 'match': return 'bg-success/10 text-success';
    case 'below': return 'bg-warning/10 text-warning';
    case 'above': return 'bg-error/10 text-error';
    case 'no-invoice': return 'bg-secondary/10 text-secondary';
  }
};

const getStatusText = (status: ComparisonResult['status']) => {
  switch (status) {
    case 'match': return 'Valor Correto';
    case 'below': return 'Abaixo do Valor';
    case 'above': return 'Acima do Valor';
    case 'no-invoice': return 'Sem Nota Fiscal';
  }
};

export const ResultsTable = ({ results }: ResultsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO</TableHead>
            <TableHead>Linha</TableHead>
            <TableHead>Valor PO</TableHead>
            <TableHead>Valor Faturado</TableHead>
            <TableHead>Diferença</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={`${result.po.number}-${result.po.line}`}>
              <TableCell>{result.po.number}</TableCell>
              <TableCell>{result.po.line}</TableCell>
              <TableCell>{formatCurrency(result.po.amount)}</TableCell>
              <TableCell>
                {formatCurrency(result.invoices.reduce((sum, inv) => sum + inv.value, 0))}
              </TableCell>
              <TableCell>{formatCurrency(Math.abs(result.difference))}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                  {getStatusText(result.status)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


import { ComparisonResult } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ResultsChartProps {
  results: ComparisonResult[];
}

export const ResultsChart = ({ results }: ResultsChartProps) => {
  const data = [
    { name: 'Valor Correto', value: results.filter(r => r.status === 'match').length },
    { name: 'Abaixo do Valor', value: results.filter(r => r.status === 'below').length },
    { name: 'Acima do Valor', value: results.filter(r => r.status === 'above').length },
    { name: 'Sem Nota Fiscal', value: results.filter(r => r.status === 'no-invoice').length },
  ].filter(item => item.value > 0);

  const COLORS = ['#22c55e', '#eab308', '#ef4444', '#64748b'];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

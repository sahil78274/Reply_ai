import { Pie, PieChart, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardBody } from '../ui/Card.jsx';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export function LeadStatusChart({ data = [] }) {
  const chartData = data.length ? data : [
    { name: 'New', value: 24 },
    { name: 'Interested', value: 36 },
    { name: 'Converted', value: 18 },
    { name: 'Not Interested', value: 8 },
  ];

  return (
    <Card className="p-0">
      <CardBody className="p-5">
        <div className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          Lead Status Distribution
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Tooltip />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              fill="#888"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Pie
                  key={`pie-${index}`}
                  dataKey="value"
                  data={[entry]}
                  fill={COLORS[index % COLORS.length]}
                  radius={[70, 90]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
          {chartData.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-slate-600 dark:text-slate-400">{entry.name}</span>
              <span className="ml-auto font-medium text-slate-900 dark:text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

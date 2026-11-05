import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardBody } from '../ui/Card.jsx';

export function AIVsHumanChart({ data = [] }) {
  const chartData = data.length ? data : [
    { name: 'Mon', ai: 24, human: 8 },
    { name: 'Tue', ai: 31, human: 12 },
    { name: 'Wed', ai: 28, human: 15 },
    { name: 'Thu', ai: 35, human: 10 },
    { name: 'Fri', ai: 22, human: 18 },
    { name: 'Sat', ai: 14, human: 6 },
    { name: 'Sun', ai: 10, human: 4 },
  ];

  return (
    <Card className="p-0">
      <CardBody className="p-5">
        <div className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          AI vs Human Replies
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize="11" />
            <YAxis stroke="#94a3b8" fontSize="11" />
            <Tooltip />
            <Legend />
            <Bar dataKey="ai" fill="#10b981" radius={[4, 4, 0, 0]} name="AI" />
            <Bar dataKey="human" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Human" />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

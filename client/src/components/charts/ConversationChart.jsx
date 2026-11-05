import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardBody } from '../ui/Card.jsx';

export function ConversationChart({ data = [] }) {
  const chartData = data.length ? data : [
    { name: 'Mon', inbound: 12, outbound: 8 },
    { name: 'Tue', inbound: 19, outbound: 14 },
    { name: 'Wed', inbound: 15, outbound: 10 },
    { name: 'Thu', inbound: 22, outbound: 18 },
    { name: 'Fri', inbound: 17, outbound: 13 },
    { name: 'Sat', inbound: 9, outbound: 6 },
    { name: 'Sun', inbound: 6, outbound: 4 },
  ];

  return (
    <Card className="p-0">
      <CardBody className="p-5">
        <div className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          Conversation Activity (7 Days)
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize="11" />
            <YAxis stroke="#94a3b8" fontSize="11" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Line type="monotone" dataKey="inbound" stroke="#4f46e5" strokeWidth={2} name="Incoming" dot />
            <Line type="monotone" dataKey="outbound" stroke="#818cf8" strokeWidth={2} name="Outgoing" dot />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

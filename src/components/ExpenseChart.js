import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#00c6ff", "#ff4b2b", "#ffd200", "#00f260", "#8e2de2"];

export default function ExpenseChart({ data }) {
  const chartData = Object.keys(data).map(key => ({
    name: key,
    value: data[key]
  }));

  if (chartData.length === 0) return null;

  return (
    <div style={{ height: 280, marginTop: 30 }}>
      <h3 style={{ marginBottom: 10 }}>📊 Category Breakdown</h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={chartData} dataKey="value" outerRadius={100}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Sample data for different date ranges
const generateTicketData = (dateRange) => {
  const data = [];
  const today = new Date();

  switch (dateRange) {
    case "7d":
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString("en-US", { weekday: "short" }),
          tickets: Math.floor(Math.random() * 80) + 20,
          revenue: Math.floor(Math.random() * 7500000) + 3000000, // Convert to NGN
        });
      }
      break;
    case "30d":
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          tickets: Math.floor(Math.random() * 120) + 30,
          revenue: Math.floor(Math.random() * 12000000) + 4500000, // Convert to NGN
        });
      }
      break;
    case "90d":
      for (let i = 89; i >= 0; i -= 3) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          tickets: Math.floor(Math.random() * 200) + 50,
          revenue: Math.floor(Math.random() * 18000000) + 7500000, // Convert to NGN
        });
      }
      break;
    case "12m":
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        data.push({
          date: date.toLocaleDateString("en-US", { month: "short" }),
          tickets: Math.floor(Math.random() * 600) + 200,
          revenue: Math.floor(Math.random() * 75000000) + 30000000, // Convert to NGN
        });
      }
      break;
    default:
      // Default to 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          tickets: Math.floor(Math.random() * 120) + 30,
          revenue: Math.floor(Math.random() * 12000000) + 4500000, // Convert to NGN
        });
      }
  }

  return data;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-cyan-600">
          Tickets: <span className="font-semibold">{payload[0].value}</span>
        </p>
        <p className="text-gray-600">
          Revenue:{" "}
          <span className="font-semibold">
            ₦{payload[1]?.value.toLocaleString()}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function TicketSalesChart({ dateRange = "30d" }) {
  const data = generateTicketData(dateRange);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="tickets"
          fill="#06b6d4"
          radius={[4, 4, 0, 0]}
          opacity={0.8}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

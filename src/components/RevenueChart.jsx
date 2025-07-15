import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// Sample data for different date ranges
const generateRevenueData = (dateRange) => {
  const data = [];
  const today = new Date();

  switch (dateRange) {
    case "7d":
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString("en-US", { weekday: "short" }),
          revenue: Math.floor(Math.random() * 7500000) + 3000000, // Convert to NGN
          tickets: Math.floor(Math.random() * 50) + 20,
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
          revenue: Math.floor(Math.random() * 12000000) + 4500000, // Convert to NGN
          tickets: Math.floor(Math.random() * 100) + 30,
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
          revenue: Math.floor(Math.random() * 18000000) + 7500000, // Convert to NGN
          tickets: Math.floor(Math.random() * 150) + 50,
        });
      }
      break;
    case "12m":
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        data.push({
          date: date.toLocaleDateString("en-US", { month: "short" }),
          revenue: Math.floor(Math.random() * 75000000) + 30000000, // Convert to NGN
          tickets: Math.floor(Math.random() * 500) + 200,
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
          revenue: Math.floor(Math.random() * 12000000) + 4500000, // Convert to NGN
          tickets: Math.floor(Math.random() * 100) + 30,
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
          Revenue:{" "}
          <span className="font-semibold">
            ₦{payload[0].value.toLocaleString()}
          </span>
        </p>
        <p className="text-gray-600">
          Tickets:{" "}
          <span className="font-semibold">{payload[1]?.value || 0}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ dateRange = "30d" }) {
  const data = generateRevenueData(dateRange);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
          </linearGradient>
        </defs>
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
          tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#06b6d4"
          strokeWidth={3}
          fill="url(#revenueGradient)"
          dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: "#06b6d4", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

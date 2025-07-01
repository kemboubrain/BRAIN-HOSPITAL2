import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 4200, consultations: 85 },
  { month: 'Fév', revenue: 4800, consultations: 92 },
  { month: 'Mar', revenue: 5200, consultations: 98 },
  { month: 'Avr', revenue: 4900, consultations: 89 },
  { month: 'Mai', revenue: 5800, consultations: 110 },
  { month: 'Jun', revenue: 6200, consultations: 118 }
];

const RevenueChart: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Évolution des Revenus</h3>
        <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option>6 derniers mois</option>
          <option>12 derniers mois</option>
          <option>Cette année</option>
        </select>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              className="text-sm text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-sm text-gray-600 dark:text-gray-400"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#00669b" 
              strokeWidth={3}
              dot={{ fill: '#00669b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#00669b', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
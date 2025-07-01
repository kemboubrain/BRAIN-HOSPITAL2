import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Lun', appointments: 12, completed: 10 },
  { day: 'Mar', appointments: 15, completed: 14 },
  { day: 'Mer', appointments: 18, completed: 16 },
  { day: 'Jeu', appointments: 14, completed: 12 },
  { day: 'Ven', appointments: 16, completed: 15 },
  { day: 'Sam', appointments: 8, completed: 7 },
  { day: 'Dim', appointments: 4, completed: 4 }
];

const AppointmentsChart: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rendez-vous Cette Semaine</h3>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary-500 dark:bg-primary-600 rounded mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Programmés</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-lime-500 dark:bg-lime-600 rounded mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Terminés</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="day" 
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
            <Bar dataKey="appointments" fill="#00669b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" fill="#7daf00" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AppointmentsChart;
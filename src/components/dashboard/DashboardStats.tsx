import React from 'react';
import { Users, Calendar, DollarSign, Activity, UserCheck, Clock, Package, AlertTriangle } from 'lucide-react';
import { DashboardStats as StatsType } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface DashboardStatsProps {
  stats: StatsType;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Patients Aujourd\'hui',
      value: stats.todayPatients,
      icon: Users,
      color: 'bg-primary-500 dark:bg-primary-600',
      trend: '+12%'
    },
    {
      title: 'Rendez-vous',
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'bg-secondary-500 dark:bg-secondary-600',
      trend: '+8%'
    },
    {
      title: 'Revenus du Jour',
      value: formatCurrency(stats.todayRevenue),
      icon: DollarSign,
      color: 'bg-lime-500 dark:bg-lime-600',
      trend: '+15%'
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Activity,
      color: 'bg-accent-500 dark:bg-accent-600',
      trend: '+5%'
    },
    {
      title: 'Personnel Actif',
      value: stats.activeStaff,
      icon: UserCheck,
      color: 'bg-primary-500 dark:bg-primary-600',
      trend: '100%'
    },
    {
      title: 'RDV en Attente',
      value: stats.pendingAppointments,
      icon: Clock,
      color: 'bg-orange-500 dark:bg-orange-600',
      trend: '-3%'
    },
    {
      title: 'Stock Faible',
      value: stats.lowStockMedications,
      icon: Package,
      color: 'bg-red-500 dark:bg-red-600',
      trend: 'Alert'
    },
    {
      title: 'Factures Impayées',
      value: stats.overdueInvoices,
      icon: AlertTriangle,
      color: 'bg-yellow-500 dark:bg-yellow-600',
      trend: '-1'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between group">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-all duration-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-all duration-300 group-hover:scale-105 origin-left">{stat.value}</p>
                <div className="flex items-center">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trend.includes('+') ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    stat.trend.includes('-') ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className={`${stat.color} rounded-lg p-3 text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                <Icon className="h-6 w-6 transition-all duration-500 group-hover:rotate-12" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
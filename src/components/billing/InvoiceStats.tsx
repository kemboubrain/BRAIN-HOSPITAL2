import React from 'react';
import { DollarSign, Clock, XCircle, FileText, TrendingUp, CreditCard, Calendar, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface InvoiceStatsProps {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  invoiceCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

const InvoiceStats: React.FC<InvoiceStatsProps> = ({
  totalRevenue,
  monthlyRevenue,
  pendingAmount,
  overdueAmount,
  invoiceCount,
  paidCount,
  pendingCount,
  overdueCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus Totaux</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalRevenue, 'XOF')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{paidCount} factures payées</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ce Mois</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(monthlyRevenue, 'XOF')}</p>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12% vs mois dernier</span>
            </div>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(pendingAmount, 'XOF')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pendingCount} factures</p>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-3">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Retard</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(overdueAmount, 'XOF')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{overdueCount} factures</p>
          </div>
          <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-3">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceStats;
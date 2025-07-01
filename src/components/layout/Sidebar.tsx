import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  FileText,
  Heart,
  Building2,
  Pill,
  CreditCard,
  FlaskConical,
  BarChart3,
  Activity,
  Shield
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de Bord', path: '/dashboard' },
  { icon: Users, label: 'Patients', path: '/patients' },
  { icon: Calendar, label: 'Rendez-vous', path: '/appointments' },
  { icon: UserCheck, label: 'Personnel', path: '/staff' },
  { icon: FileText, label: 'Consultations', path: '/consultations' },
  { icon: Heart, label: 'Soins', path: '/care' },
  { icon: Building2, label: 'Hospitalisation', path: '/hospitalization' },
  { icon: Pill, label: 'Pharmacie', path: '/pharmacy' },
  { icon: CreditCard, label: 'Facturation', path: '/billing' },
  { icon: Shield, label: 'Assurances', path: '/insurance' },
  { icon: FlaskConical, label: 'Laboratoire', path: '/laboratory' },
  { icon: BarChart3, label: 'Rapports', path: '/reports' }
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="bg-white dark:bg-gray-800 w-64 shadow-lg flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="bg-primary-500 dark:bg-primary-600 rounded-lg p-3">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BRAIN HOSPITAL</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gestion Santé</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 mt-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-600 dark:border-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
            <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">DR</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Dr. Admin</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Administrateur</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
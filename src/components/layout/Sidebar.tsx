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
  Shield,
  Lock
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { state } = useApp();

  // Vérifier si l'utilisateur a accès à un module spécifique
  const hasAccess = (module: string) => {
    // Si l'utilisateur est admin, il a accès à tout
    if (state.currentUser?.role === 'admin') return true;
    
    // Trouver le rôle de l'utilisateur
    const userRole = state.roles?.find(r => r.name === state.currentUser?.role);
    if (!userRole) return false;
    
    // Vérifier si l'utilisateur a la permission de voir ce module
    const permission = userRole.permissions.find(p => p.module === module);
    return permission?.canView || false;
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de Bord', path: '/dashboard', module: 'dashboard' },
    { icon: Users, label: 'Patients', path: '/patients', module: 'patients' },
    { icon: Calendar, label: 'Rendez-vous', path: '/appointments', module: 'appointments' },
    { icon: UserCheck, label: 'Personnel', path: '/staff', module: 'doctors' },
    { icon: FileText, label: 'Consultations', path: '/consultations', module: 'consultations' },
    { icon: Heart, label: 'Soins', path: '/care', module: 'care' },
    { icon: Building2, label: 'Hospitalisation', path: '/hospitalization', module: 'hospitalization' },
    { icon: Pill, label: 'Pharmacie', path: '/pharmacy', module: 'pharmacy' },
    { icon: CreditCard, label: 'Facturation', path: '/billing', module: 'billing' },
    { icon: Shield, label: 'Assurances', path: '/insurance', module: 'insurance' },
    { icon: FlaskConical, label: 'Laboratoire', path: '/laboratory', module: 'laboratory' },
    { icon: BarChart3, label: 'Rapports', path: '/reports', module: 'reports' },
    { icon: Lock, label: 'Gestion des Accès', path: '/access-management', module: 'accessManagement' }
  ];

  // Filtrer les éléments du menu selon les permissions de l'utilisateur
  const filteredMenuItems = menuItems.filter(item => hasAccess(item.module));

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
          {filteredMenuItems.map((item) => {
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
            <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
              {state.currentUser?.firstName?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {state.currentUser?.firstName} {state.currentUser?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {state.currentUser?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
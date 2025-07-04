import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, FileText, Pill } from 'lucide-react';

const quickActions = [
  {
    title: 'Nouveau Patient',
    description: 'Enregistrer un nouveau patient',
    icon: Plus,
    color: 'bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition-all duration-300 hover:shadow-lg',
    link: '/patients?new=true'
  },
  {
    title: 'Prendre RDV',
    description: 'Programmer un rendez-vous',
    icon: Calendar,
    color: 'bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-700 transition-all duration-300 hover:shadow-lg',
    link: '/appointments?new=true'
  },
  {
    title: 'Voir Patients',
    description: 'Liste des patients',
    icon: Users,
    color: 'bg-lime-500 hover:bg-lime-600 dark:bg-lime-600 dark:hover:bg-lime-700 transition-all duration-300 hover:shadow-lg',
    link: '/patients'
  },
  {
    title: 'Consultation',
    description: 'Nouvelle consultation',
    icon: FileText,
    color: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 transition-all duration-300 hover:shadow-lg',
    link: '/consultations?new=true'
  },
  {
    title: 'Pharmacie',
    description: 'Gestion des médicaments',
    icon: Pill,
    color: 'bg-accent-500 hover:bg-accent-600 dark:bg-accent-600 dark:hover:bg-accent-700 transition-all duration-300 hover:shadow-lg',
    link: '/pharmacy'
  }
];

const QuickActions: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Actions Rapides</h3>
      
      <div className="space-y-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} text-white rounded-lg p-4 block transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl group`}
            >
              <div className="flex items-center space-x-3 relative">
                <div className="relative">
                  <Icon className="h-5 w-5 transition-all duration-300 group-hover:scale-110 animate-pulse-subtle" />
                  <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 scale-0 group-hover:scale-150"></div>
                </div>
                <div>
                  <p className="font-medium transition-all duration-300 group-hover:translate-x-1">{action.title}</p>
                  <p className="text-sm opacity-90 transition-all duration-300 group-hover:opacity-100">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
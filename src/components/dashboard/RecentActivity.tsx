import React from 'react';
import { Clock, User, Calendar, FileText } from 'lucide-react';

const activities = [
  {
    id: '1',
    type: 'appointment',
    title: 'Nouveau rendez-vous programmé',
    description: 'Marie Dubois - Dr. Legrand - 25/01/2024 10:00',
    time: 'Il y a 5 minutes',
    icon: Calendar,
    color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
  },
  {
    id: '2',
    type: 'patient',
    title: 'Nouveau patient enregistré',
    description: 'Jean Dupont - 45 ans - Première consultation',
    time: 'Il y a 15 minutes',
    icon: User,
    color: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/20 dark:text-secondary-400'
  },
  {
    id: '3',
    type: 'consultation',
    title: 'Consultation terminée',
    description: 'Sophie Bernard - Dr. Durand - Vaccination complétée',
    time: 'Il y a 30 minutes',
    icon: FileText,
    color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/20 dark:text-lime-400'
  },
  {
    id: '4',
    type: 'appointment',
    title: 'Rendez-vous confirmé',
    description: 'Pierre Martin - Dr. Rousseau - 26/01/2024 14:30',
    time: 'Il y a 1 heure',
    icon: Calendar,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
  },
  {
    id: '5',
    type: 'patient',
    title: 'Dossier médical mis à jour',
    description: 'Alice Moreau - Nouveaux résultats d\'analyse',
    time: 'Il y a 2 heures',
    icon: FileText,
    color: 'bg-accent-100 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400'
  }
];

const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activité Récente</h3>
        <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          Voir tout
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:-translate-x-1 group">
              <div className={`${activity.color} rounded-lg p-2 flex-shrink-0 transition-all duration-300 group-hover:scale-110`}>
                <Icon className="h-4 w-4 transition-all duration-500 group-hover:rotate-12" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1 transition-all duration-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-300">
                  {activity.description}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 transition-all duration-300">
                  <Clock className="h-3 w-3 mr-1 transition-all duration-300 group-hover:text-primary-500" />
                  {activity.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
import React from 'react';
import { X, User, Clock, Shield, FileText } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { AccessLog } from '../../types';

interface AccessLogDetailsProps {
  log: AccessLog;
  onClose: () => void;
}

const AccessLogDetails: React.FC<AccessLogDetailsProps> = ({ log, onClose }) => {
  const { state } = useApp();
  
  const user = state.users?.find(u => u.id === log.userId);
  const targetRole = log.targetType === 'role' ? state.roles?.find(r => r.id === log.targetId) : null;
  const targetUser = log.targetType === 'user' ? state.users?.find(u => u.id === log.targetId) : null;
  
  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-600 dark:text-green-400';
      case 'update':
        return 'text-blue-600 dark:text-blue-400';
      case 'delete':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'create':
        return 'Création';
      case 'update':
        return 'Modification';
      case 'delete':
        return 'Suppression';
      default:
        return action;
    }
  };

  const getTargetTypeText = (targetType: string) => {
    switch (targetType) {
      case 'role':
        return 'Rôle';
      case 'permission':
        return 'Permission';
      case 'user':
        return 'Utilisateur';
      default:
        return targetType;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Détails du Log
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Utilisateur</h3>
            </div>
            
            {user ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nom complet:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rôle:</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{user.role}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Utilisateur non trouvé</p>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Horodatage</h3>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Date et heure:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(log.timestamp).toLocaleDateString('fr-CI', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Action</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Type d'action:</p>
                <p className={`font-medium ${getActionColor(log.action)}`}>
                  {getActionText(log.action)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cible:</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {getTargetTypeText(log.targetType)}
                  {targetRole && ` - ${targetRole.name}`}
                  {targetUser && ` - ${targetUser.firstName} ${targetUser.lastName}`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Détails</h3>
            </div>
            
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {log.details}
            </p>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessLogDetails;
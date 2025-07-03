import React, { useState } from 'react';
import { X, Save, RefreshCw, Shield } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Role, Permission, Module, AccessLog } from '../../types';

interface RoleModalProps {
  role?: Role | null;
  onClose: () => void;
}

const RoleModal: React.FC<RoleModalProps> = ({ role, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
  });

  const modules: Module[] = [
    'dashboard',
    'patients',
    'doctors',
    'appointments',
    'consultations',
    'care',
    'hospitalization',
    'pharmacy',
    'billing',
    'laboratory',
    'reports',
    'insurance',
    'accessManagement'
  ];

  const getModuleLabel = (module: Module): string => {
    switch (module) {
      case 'dashboard': return 'Tableau de bord';
      case 'patients': return 'Patients';
      case 'doctors': return 'Médecins';
      case 'appointments': return 'Rendez-vous';
      case 'consultations': return 'Consultations';
      case 'care': return 'Soins';
      case 'hospitalization': return 'Hospitalisation';
      case 'pharmacy': return 'Pharmacie';
      case 'billing': return 'Facturation';
      case 'laboratory': return 'Laboratoire';
      case 'reports': return 'Rapports';
      case 'insurance': return 'Assurances';
      case 'accessManagement': return 'Gestion des accès';
      default: return module;
    }
  };

  // Initialiser les permissions
  const [permissions, setPermissions] = useState<Permission[]>(
    role?.permissions || 
    modules.map(module => ({
      id: `perm-${Date.now()}-${module}`,
      module,
      canView: module === 'dashboard', // Par défaut, seul le tableau de bord est visible
      canCreate: false,
      canEdit: false,
      canDelete: false
    }))
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Vérifier si le nom du rôle est unique (sauf pour le rôle en cours d'édition)
      const roleExists = state.roles?.some(r => 
        r.name.toLowerCase() === formData.name.toLowerCase() && r.id !== role?.id
      );

      if (roleExists) {
        alert('Un rôle avec ce nom existe déjà. Veuillez choisir un nom différent.');
        setIsLoading(false);
        return;
      }

      // Créer ou mettre à jour le rôle
      const isNewRole = !role;
      const roleData: Role = {
        id: role?.id || `role-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        permissions,
        createdAt: role?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Créer un log pour cette action
      const logEntry: AccessLog = {
        id: `log-${Date.now()}`,
        userId: state.currentUser?.id || '',
        action: isNewRole ? 'create' : 'update',
        targetType: 'role',
        targetId: roleData.id,
        details: isNewRole 
          ? `Création du rôle ${roleData.name}` 
          : `Modification du rôle ${roleData.name}`,
        timestamp: new Date().toISOString()
      };

      if (isNewRole) {
        dispatch({ type: 'ADD_ROLE', payload: roleData });
      } else {
        dispatch({ type: 'UPDATE_ROLE', payload: roleData });
      }

      dispatch({ type: 'ADD_ACCESS_LOG', payload: logEntry });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du rôle:', error);
      alert('Une erreur est survenue lors de la sauvegarde du rôle.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePermissionChange = (moduleIndex: number, field: keyof Permission, value: boolean) => {
    setPermissions(prev => 
      prev.map((permission, index) => 
        index === moduleIndex 
          ? { ...permission, [field]: value } 
          : permission
      )
    );
  };

  const resetPermissions = () => {
    setPermissions(modules.map(module => ({
      id: `perm-${Date.now()}-${module}`,
      module,
      canView: module === 'dashboard',
      canCreate: false,
      canEdit: false,
      canDelete: false
    })));
  };

  // Vérifier si le rôle est un rôle système (admin ou manager)
  const isSystemRole = role?.name === 'admin' || role?.name === 'manager';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            {role ? 'Modifier le Rôle' : 'Nouveau Rôle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du rôle *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSystemRole}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {isSystemRole && (
                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                  Ce rôle système ne peut pas être renommé.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Description du rôle et de ses responsabilités"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Permissions</h3>
              {!isSystemRole && (
                <button
                  type="button"
                  onClick={resetPermissions}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Voir
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Créer
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Modifier
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Supprimer
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {permissions.map((permission, index) => {
                    // Vérifier si c'est le module de gestion des accès
                    const isAccessManagement = permission.module === 'accessManagement';
                    // Désactiver les modifications pour la gestion des accès si ce n'est pas un rôle admin/manager
                    const disableAccessManagement = isAccessManagement && !['admin', 'manager'].includes(formData.name);
                    
                    return (
                      <tr key={index} className={`${
                        isAccessManagement ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                      }`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getModuleLabel(permission.module)}
                          </div>
                          {isAccessManagement && (
                            <div className="text-xs text-yellow-600 dark:text-yellow-400">
                              Réservé aux gérants
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={permission.canView}
                            onChange={(e) => handlePermissionChange(index, 'canView', e.target.checked)}
                            disabled={isSystemRole || disableAccessManagement}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-60"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={permission.canCreate}
                            onChange={(e) => handlePermissionChange(index, 'canCreate', e.target.checked)}
                            disabled={isSystemRole || disableAccessManagement || !permission.canView}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-60"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={permission.canEdit}
                            onChange={(e) => handlePermissionChange(index, 'canEdit', e.target.checked)}
                            disabled={isSystemRole || disableAccessManagement || !permission.canView}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-60"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={permission.canDelete}
                            onChange={(e) => handlePermissionChange(index, 'canDelete', e.target.checked)}
                            disabled={isSystemRole || disableAccessManagement || !permission.canView}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-60"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || isSystemRole}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;
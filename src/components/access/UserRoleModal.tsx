import React, { useState } from 'react';
import { X, Save, User, Shield } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { User as UserType, Role, AccessLog } from '../../types';

interface UserRoleModalProps {
  user?: UserType | null;
  onClose: () => void;
}

const UserRoleModal: React.FC<UserRoleModalProps> = ({ user, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    userId: user?.id || '',
    roleId: state.roles?.find(r => r.name === user?.role)?.id || '',
    isActive: user?.isActive ?? true
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const selectedRole = state.roles?.find(r => r.id === formData.roleId);
      const selectedUser = state.users?.find(u => u.id === formData.userId);
      
      if (!selectedRole || !selectedUser) {
        alert('Veuillez sélectionner un utilisateur et un rôle valides.');
        setIsLoading(false);
        return;
      }

      // Mettre à jour le rôle de l'utilisateur
      const updatedUser: UserType = {
        ...selectedUser,
        role: selectedRole.name as any,
        isActive: formData.isActive,
        updatedAt: new Date().toISOString()
      };

      // Créer un log pour cette action
      const logEntry: AccessLog = {
        id: `log-${Date.now()}`,
        userId: state.currentUser?.id || '',
        action: 'update',
        targetType: 'user',
        targetId: updatedUser.id,
        details: `Attribution du rôle ${selectedRole.name} à l'utilisateur ${updatedUser.firstName} ${updatedUser.lastName}`,
        timestamp: new Date().toISOString()
      };

      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'ADD_ACCESS_LOG', payload: logEntry });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle utilisateur:', error);
      alert('Une erreur est survenue lors de la mise à jour du rôle utilisateur.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Assigner un Rôle
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Utilisateur *
            </label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              disabled={!!user}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
            >
              <option value="">Sélectionner un utilisateur</option>
              {state.users?.map(u => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rôle *
            </label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Sélectionner un rôle</option>
              {state.roles?.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Compte actif
            </label>
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
              disabled={isLoading}
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

export default UserRoleModal;
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Shield, 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw, 
  Clock, 
  Filter, 
  Download, 
  Eye, 
  CheckSquare, 
  XSquare,
  UserPlus,
  History
} from 'lucide-react';
import { Role, Permission, AccessLog, Module, User } from '../types';
import RoleModal from '../components/access/RoleModal';
import UserRoleModal from '../components/access/UserRoleModal';
import AccessLogDetails from '../components/access/AccessLogDetails';

const AccessManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'roles' | 'users' | 'logs'>('roles');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUserRoleModal, setShowUserRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null);
  const [filterRole, setFilterRole] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  // Vérifier si l'utilisateur actuel est un gérant
  const isManager = state.currentUser?.role === 'admin' || state.currentUser?.role === 'manager';

  // Si l'utilisateur n'est pas un gérant, rediriger ou afficher un message d'erreur
  if (!isManager) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
          <Shield className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Accès non autorisé</h2>
          <p className="text-red-600 dark:text-red-300">
            Vous n'avez pas les droits nécessaires pour accéder à cette page.
            Seuls les gérants peuvent gérer les accès au système.
          </p>
        </div>
      </div>
    );
  }

  // Filtrer les rôles selon la recherche
  const filteredRoles = state.roles?.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Filtrer les utilisateurs selon la recherche et le rôle
  const filteredUsers = state.users?.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  }) || [];

  // Filtrer les logs selon les critères
  const filteredLogs = state.accessLogs?.filter(log => {
    const user = state.users?.find(u => u.id === log.userId);
    const matchesSearch = 
      user && (
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = filterUser === 'all' || log.userId === filterUser;
    
    // Filtrer par date
    let matchesDate = true;
    const logDate = new Date(log.timestamp);
    const today = new Date();
    
    if (filterDateRange === 'today') {
      matchesDate = logDate.toDateString() === today.toDateString();
    } else if (filterDateRange === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      matchesDate = logDate >= weekStart;
    } else if (filterDateRange === 'month') {
      matchesDate = 
        logDate.getMonth() === today.getMonth() && 
        logDate.getFullYear() === today.getFullYear();
    }
    
    return matchesSearch && matchesUser && matchesDate;
  }) || [];

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const handleEditUserRole = (user: User) => {
    setEditingUser(user);
    setShowUserRoleModal(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible.')) {
      // Créer un log pour cette action
      const logEntry: AccessLog = {
        id: `log-${Date.now()}`,
        userId: state.currentUser?.id || '',
        action: 'delete',
        targetType: 'role',
        targetId: roleId,
        details: `Suppression du rôle ${state.roles?.find(r => r.id === roleId)?.name || 'inconnu'}`,
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_ACCESS_LOG', payload: logEntry });
      dispatch({ type: 'DELETE_ROLE', payload: roleId });
    }
  };

  const handleViewLog = (log: AccessLog) => {
    setSelectedLog(log);
  };

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'Utilisateur', 'Action', 'Type', 'Détails'].join(','),
      ...filteredLogs.map(log => {
        const user = state.users?.find(u => u.id === log.userId);
        const userName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur inconnu';
        return [
          new Date(log.timestamp).toLocaleString('fr-CI'),
          userName,
          log.action,
          log.targetType,
          `"${log.details.replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-acces-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const closeModals = () => {
    setShowRoleModal(false);
    setShowUserRoleModal(false);
    setEditingRole(null);
    setEditingUser(null);
    setSelectedLog(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Accès</h1>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('roles')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'roles' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Rôles
            </button>
            <button
              onClick={() => setViewMode('users')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'users' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Utilisateurs
            </button>
            <button
              onClick={() => setViewMode('logs')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'logs' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Historique
            </button>
          </div>
          
          {viewMode === 'roles' && (
            <button 
              onClick={() => {
                setEditingRole(null);
                setShowRoleModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau Rôle</span>
            </button>
          )}
          
          {viewMode === 'users' && (
            <button 
              onClick={() => {
                setEditingUser(null);
                setShowUserRoleModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Assigner Rôle</span>
            </button>
          )}
          
          {viewMode === 'logs' && (
            <button 
              onClick={exportLogs}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exporter CSV</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={
                  viewMode === 'roles' ? "Rechercher un rôle..." :
                  viewMode === 'users' ? "Rechercher un utilisateur..." :
                  "Rechercher dans l'historique..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          {viewMode === 'users' && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tous les rôles</option>
                  {state.roles?.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {viewMode === 'logs' && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tous les utilisateurs</option>
                  {state.users?.map(user => (
                    <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Toutes dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Affichage des rôles */}
        {viewMode === 'roles' && (
          <div className="space-y-6">
            {filteredRoles.map((role) => (
              <div key={role.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-3">
                      <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditRole(role)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </button>
                    {role.name !== 'admin' && role.name !== 'manager' && (
                      <button 
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Supprimer</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {role.permissions.map((permission, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="font-medium text-gray-900 dark:text-white mb-2 capitalize">
                          {permission.module.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-1">
                            {permission.canView ? 
                              <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" /> : 
                              <XSquare className="h-4 w-4 text-red-600 dark:text-red-400" />
                            }
                            <span className="text-gray-600 dark:text-gray-400">Voir</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {permission.canCreate ? 
                              <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" /> : 
                              <XSquare className="h-4 w-4 text-red-600 dark:text-red-400" />
                            }
                            <span className="text-gray-600 dark:text-gray-400">Créer</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {permission.canEdit ? 
                              <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" /> : 
                              <XSquare className="h-4 w-4 text-red-600 dark:text-red-400" />
                            }
                            <span className="text-gray-600 dark:text-gray-400">Modifier</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {permission.canDelete ? 
                              <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" /> : 
                              <XSquare className="h-4 w-4 text-red-600 dark:text-red-400" />
                            }
                            <span className="text-gray-600 dark:text-gray-400">Supprimer</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {filteredRoles.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucun rôle trouvé</p>
              </div>
            )}
          </div>
        )}

        {/* Affichage des utilisateurs */}
        {viewMode === 'users' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                      }`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUserRole(user)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        )}

        {/* Affichage des logs */}
        {viewMode === 'logs' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Détails
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLogs.map((log) => {
                  const user = state.users?.find(u => u.id === log.userId);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(log.timestamp).toLocaleDateString('fr-CI')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString('fr-CI')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur inconnu'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.action === 'create' 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                            : log.action === 'update'
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                        }`}>
                          {log.action === 'create' ? 'Création' : log.action === 'update' ? 'Modification' : 'Suppression'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                          {log.targetType === 'role' ? 'Rôle' : 
                           log.targetType === 'permission' ? 'Permission' : 'Utilisateur'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
                          {log.details}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewLog(log)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucun log d'activité trouvé</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showRoleModal && (
        <RoleModal
          role={editingRole}
          onClose={closeModals}
        />
      )}

      {showUserRoleModal && (
        <UserRoleModal
          user={editingUser}
          onClose={closeModals}
        />
      )}

      {selectedLog && (
        <AccessLogDetails
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

export default AccessManagement;
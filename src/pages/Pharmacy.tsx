import React, { useState, useRef } from 'react';
import { Plus, Search, Package, AlertTriangle, Calendar, FileText, Printer, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import MedicationModal from '../components/pharmacy/MedicationModal';
import MedicationDetails from '../components/pharmacy/MedicationDetails';
import StockMovementModal from '../components/pharmacy/StockMovementModal';
import { formatCurrency } from '../utils/currency';
import type { Medication } from '../types';

const Pharmacy: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showMedicationDetails, setShowMedicationDetails] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const printRef = useRef<HTMLDivElement>(null);

  const medications = state.medications || [];

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || medication.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'low-stock' && medication.stock <= medication.minStock) ||
                         (filterStatus === 'expired' && new Date(medication.expiryDate) < new Date()) ||
                         (filterStatus === 'in-stock' && medication.stock > medication.minStock && new Date(medication.expiryDate) >= new Date());
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(medications.map(med => med.category))];
  const lowStockCount = medications.filter(med => med.stock <= med.minStock).length;
  const expiredCount = medications.filter(med => new Date(med.expiryDate) < new Date()).length;
  const totalValue = medications.reduce((sum, med) => sum + (med.stock * med.unitPrice), 0);

  const handleAddMedication = (medicationData: Omit<Medication, 'id'>) => {
    const newMedication = {
      ...medicationData,
      id: Date.now().toString()
    };
    dispatch({ type: 'ADD_MEDICATION', payload: newMedication });
    setShowMedicationModal(false);
  };

  const handleEditMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowMedicationModal(true);
  };

  const handleUpdateMedication = (medicationData: Omit<Medication, 'id'>) => {
    if (selectedMedication) {
      dispatch({ 
        type: 'UPDATE_MEDICATION', 
        payload: { 
          ...medicationData, 
          id: selectedMedication.id 
        } 
      });
      setSelectedMedication(null);
      setShowMedicationModal(false);
    }
  };

  const handleDeleteMedication = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce médicament ?')) {
      dispatch({ type: 'DELETE_MEDICATION', payload: id });
    }
  };

  const handleViewDetails = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowMedicationDetails(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent = [
      ['Nom', 'Catégorie', 'Fabricant', 'Stock', 'Prix unitaire', 'Date d\'expiration', 'Statut'].join(','),
      ...filteredMedications.map(med => [
        med.name,
        med.category,
        med.manufacturer,
        med.stock,
        med.unitPrice,
        med.expiryDate,
        med.stock <= med.minStock ? 'Stock faible' : 
        new Date(med.expiryDate) < new Date() ? 'Expiré' : 'En stock'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventaire-pharmacie.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pharmacie</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestion des médicaments et de l'inventaire</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
          <button
            onClick={() => {
              setSelectedMedication(null);
              setShowMedicationModal(true);
            }}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un médicament
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Médicaments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{medications.length}</p>
            </div>
            <Package className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Faible</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Produits Expirés</p>
              <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
            </div>
            <Calendar className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valeur Totale</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue, 'XOF')}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un médicament..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex space-x-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Toutes catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="in-stock">En stock</option>
              <option value="low-stock">Stock faible</option>
              <option value="expired">Expiré</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Médicament
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prix Unitaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date d'expiration
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
              {filteredMedications.map((medication) => {
                const isLowStock = medication.stock <= medication.minStock;
                const isExpired = new Date(medication.expiryDate) < new Date();
                const isExpiringSoon = new Date(medication.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                  <tr key={medication.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {medication.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {medication.manufacturer}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                        {medication.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                          {medication.stock}
                        </span>
                        {isLowStock && (
                          <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Min: {medication.minStock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(medication.unitPrice, 'XOF')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>
                        {new Date(medication.expiryDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isExpired ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Expiré
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          Stock faible
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          En stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(medication)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMedication(medication);
                            setShowStockModal(true);
                          }}
                          className="text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-300"
                          title="Gérer le stock"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditMedication(medication)}
                          className="text-lime-600 hover:text-lime-900 dark:text-lime-400 dark:hover:text-lime-300"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedication(medication.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMedications.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun médicament trouvé</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Essayez d\'ajuster votre recherche ou vos filtres.'
                : 'Commencez par ajouter votre premier médicament.'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showMedicationModal && (
        <MedicationModal
          medication={selectedMedication}
          onSave={selectedMedication ? handleUpdateMedication : handleAddMedication}
          onClose={() => {
            setShowMedicationModal(false);
            setSelectedMedication(null);
          }}
        />
      )}

      {showStockModal && selectedMedication && (
        <StockMovementModal
          medication={selectedMedication}
          onClose={() => setShowStockModal(false)}
        />
      )}

      {showMedicationDetails && selectedMedication && (
        <MedicationDetails
          medication={selectedMedication}
          onClose={() => {
            setShowMedicationDetails(false);
            setSelectedMedication(null);
          }}
          onEdit={() => {
            setShowMedicationDetails(false);
            handleEditMedication(selectedMedication);
          }}
        />
      )}
    </div>
  );
};

export default Pharmacy;
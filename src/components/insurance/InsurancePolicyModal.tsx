import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { InsurancePolicy } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface InsurancePolicyModalProps {
  policy?: InsurancePolicy;
  onClose: () => void;
}

const InsurancePolicyModal: React.FC<InsurancePolicyModalProps> = ({ policy, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    providerId: policy?.providerId || '',
    name: policy?.name || '',
    description: policy?.description || '',
    coveragePercentage: policy?.coveragePercentage || 80,
    annualLimit: policy?.annualLimit || 0,
    coverageDetails: policy?.coverageDetails || {
      consultations: true,
      medications: true,
      hospitalizations: true,
      laboratory: true,
      surgery: false,
      emergency: true
    },
    waitingPeriod: policy?.waitingPeriod || 30,
    isActive: policy?.isActive ?? true
  });

  const [exclusions, setExclusions] = useState<string[]>(policy?.exclusions || []);
  const [newExclusion, setNewExclusion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const policyData: InsurancePolicy = {
        id: policy?.id || `policy-${Date.now()}`,
        ...formData,
        exclusions,
        createdAt: policy?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (policy) {
        dispatch({ type: 'UPDATE_INSURANCE_POLICY', payload: policyData });
      } else {
        dispatch({ type: 'ADD_INSURANCE_POLICY', payload: policyData });
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la police d\'assurance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.type === 'number'
        ? Number(e.target.value)
        : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleCoverageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      coverageDetails: {
        ...prev.coverageDetails,
        [name]: checked
      }
    }));
  };

  const addExclusion = () => {
    if (newExclusion.trim() && !exclusions.includes(newExclusion.trim())) {
      setExclusions(prev => [...prev, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const removeExclusion = (index: number) => {
    setExclusions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {policy ? 'Modifier la Police d\'Assurance' : 'Nouvelle Police d\'Assurance'}
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
                Assureur *
              </label>
              <select
                name="providerId"
                value={formData.providerId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner un assureur</option>
                {state.insuranceProviders.filter(p => p.isActive).map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de la police *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pourcentage de couverture (%) *
              </label>
              <input
                type="number"
                name="coveragePercentage"
                value={formData.coveragePercentage}
                onChange={handleChange}
                required
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plafond annuel (XOF)
              </label>
              <input
                type="number"
                name="annualLimit"
                value={formData.annualLimit}
                onChange={handleChange}
                min="0"
                step="10000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0 = illimité"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Laissez 0 pour un plafond illimité
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Délai d'attente (jours)
              </label>
              <input
                type="number"
                name="waitingPeriod"
                value={formData.waitingPeriod}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
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
                Police active
              </label>
            </div>
          </div>

          {/* Services couverts */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Services couverts</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="consultations"
                  name="consultations"
                  checked={formData.coverageDetails.consultations}
                  onChange={handleCoverageChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="consultations" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Consultations
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="medications"
                  name="medications"
                  checked={formData.coverageDetails.medications}
                  onChange={handleCoverageChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="medications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Médicaments
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hospitalizations"
                  name="hospitalizations"
                  checked={formData.coverageDetails.hospitalizations}
                  onChange={handleCoverageChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hospitalizations" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Hospitalisations
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="laboratory"
                  name="laboratory"
                  checked={formData.coverageDetails.laboratory}
                  onChange={handleCoverageChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="laboratory" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Analyses de laboratoire
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="surgery"
                  name="surgery"
                  checked={formData.coverageDetails.surgery}
                  onChange={handleCoverageChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="surgery" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Chirurgie
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emergency"
                  name="emergency"
                  checked={formData.coverageDetails.emergency}
                  onChange={handleCoverageChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emergency" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Urgences
                </label>
              </div>
            </div>
          </div>

          {/* Exclusions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Exclusions</h3>
            
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                placeholder="Ajouter une exclusion..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion())}
              />
              <button
                type="button"
                onClick={addExclusion}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {exclusions.map((exclusion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-900 dark:text-white">{exclusion}</span>
                  <button
                    type="button"
                    onClick={() => removeExclusion(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {exclusions.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  Aucune exclusion ajoutée
                </p>
              )}
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
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : (policy ? 'Mettre à jour' : 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsurancePolicyModal;
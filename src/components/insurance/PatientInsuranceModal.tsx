import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { PatientInsurance } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface PatientInsuranceModalProps {
  patientInsurance?: PatientInsurance;
  onClose: () => void;
}

const PatientInsuranceModal: React.FC<PatientInsuranceModalProps> = ({ patientInsurance, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    patientId: patientInsurance?.patientId || '',
    providerId: patientInsurance?.providerId || '',
    policyId: patientInsurance?.policyId || '',
    policyNumber: patientInsurance?.policyNumber || '',
    cardNumber: patientInsurance?.cardNumber || '',
    startDate: patientInsurance?.startDate || new Date().toISOString().split('T')[0],
    endDate: patientInsurance?.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    status: patientInsurance?.status || 'active',
    coveragePercentage: patientInsurance?.coveragePercentage || 80,
    annualLimit: patientInsurance?.annualLimit || 0,
    usedAmount: patientInsurance?.usedAmount || 0,
    notes: patientInsurance?.notes || ''
  });

  const [dependents, setDependents] = useState<{name: string; relationship: string; dateOfBirth: string}[]>(
    patientInsurance?.dependents || []
  );
  const [newDependent, setNewDependent] = useState({
    name: '',
    relationship: '',
    dateOfBirth: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Si une police est sélectionnée, récupérer ses détails
      const selectedPolicy = state.insurancePolicies.find(p => p.id === formData.policyId);
      
      const patientInsuranceData: PatientInsurance = {
        id: patientInsurance?.id || `patient-insurance-${Date.now()}`,
        ...formData,
        // Utiliser les valeurs de la police si disponibles
        coveragePercentage: selectedPolicy?.coveragePercentage || formData.coveragePercentage,
        annualLimit: selectedPolicy?.annualLimit || formData.annualLimit,
        dependents: dependents.length > 0 ? dependents : undefined,
        createdAt: patientInsurance?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (patientInsurance) {
        dispatch({ type: 'UPDATE_PATIENT_INSURANCE', payload: patientInsuranceData });
      } else {
        dispatch({ type: 'ADD_PATIENT_INSURANCE', payload: patientInsuranceData });
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'assurance patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' 
      ? Number(e.target.value)
      : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));

    // Si l'assureur change, réinitialiser la police
    if (e.target.name === 'providerId') {
      setFormData(prev => ({
        ...prev,
        policyId: ''
      }));
    }

    // Si la police change, mettre à jour les détails de couverture
    if (e.target.name === 'policyId' && e.target.value) {
      const selectedPolicy = state.insurancePolicies.find(p => p.id === e.target.value);
      if (selectedPolicy) {
        setFormData(prev => ({
          ...prev,
          coveragePercentage: selectedPolicy.coveragePercentage,
          annualLimit: selectedPolicy.annualLimit || 0
        }));
      }
    }
  };

  const handleDependentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewDependent(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addDependent = () => {
    if (newDependent.name && newDependent.relationship && newDependent.dateOfBirth) {
      setDependents(prev => [...prev, { ...newDependent }]);
      setNewDependent({
        name: '',
        relationship: '',
        dateOfBirth: ''
      });
    }
  };

  const removeDependent = (index: number) => {
    setDependents(prev => prev.filter((_, i) => i !== index));
  };

  // Filtrer les polices selon l'assureur sélectionné
  const filteredPolicies = state.insurancePolicies.filter(
    policy => policy.providerId === formData.providerId && policy.isActive
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {patientInsurance ? 'Modifier l\'Assurance Patient' : 'Nouvelle Assurance Patient'}
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
                Patient *
              </label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner un patient</option>
                {state.patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>

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
                Police d'assurance *
              </label>
              <select
                name="policyId"
                value={formData.policyId}
                onChange={handleChange}
                required
                disabled={!formData.providerId}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="">Sélectionner une police</option>
                {filteredPolicies.map(policy => (
                  <option key={policy.id} value={policy.id}>{policy.name}</option>
                ))}
              </select>
              {!formData.providerId && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Veuillez d'abord sélectionner un assureur
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de police *
              </label>
              <input
                type="text"
                name="policyNumber"
                value={formData.policyNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de carte
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de fin *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="expired">Expirée</option>
                <option value="cancelled">Annulée</option>
                <option value="pending">En attente</option>
              </select>
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
                Montant déjà utilisé (XOF)
              </label>
              <input
                type="number"
                name="usedAmount"
                value={formData.usedAmount}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Personnes à charge */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personnes à charge</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  value={newDependent.name}
                  onChange={handleDependentChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Relation
                </label>
                <select
                  name="relationship"
                  value={newDependent.relationship}
                  onChange={handleDependentChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Sélectionner</option>
                  <option value="Époux/Épouse">Époux/Épouse</option>
                  <option value="Fils">Fils</option>
                  <option value="Fille">Fille</option>
                  <option value="Père">Père</option>
                  <option value="Mère">Mère</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={newDependent.dateOfBirth}
                    onChange={handleDependentChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={addDependent}
                  disabled={!newDependent.name || !newDependent.relationship || !newDependent.dateOfBirth}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {dependents.map((dependent, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{dependent.name}</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {dependent.relationship} • Né(e) le {new Date(dependent.dateOfBirth).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDependent(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {dependents.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  Aucune personne à charge ajoutée
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Informations complémentaires..."
            />
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
              {isLoading ? 'Enregistrement...' : (patientInsurance ? 'Mettre à jour' : 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientInsuranceModal;
import React, { useState } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { InsuranceClaim } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface InsuranceClaimModalProps {
  claim?: InsuranceClaim;
  onClose: () => void;
}

const InsuranceClaimModal: React.FC<InsuranceClaimModalProps> = ({ claim, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    patientId: claim?.patientId || '',
    patientInsuranceId: claim?.patientInsuranceId || '',
    invoiceId: claim?.invoiceId || '',
    claimNumber: claim?.claimNumber || `CLM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    submissionDate: claim?.submissionDate || new Date().toISOString().split('T')[0],
    totalAmount: claim?.totalAmount || 0,
    coveredAmount: claim?.coveredAmount || 0,
    patientResponsibility: claim?.patientResponsibility || 0,
    status: claim?.status || 'submitted',
    approvalDate: claim?.approvalDate || '',
    paymentDate: claim?.paymentDate || '',
    rejectionReason: claim?.rejectionReason || '',
    notes: claim?.notes || ''
  });

  const [documents, setDocuments] = useState<string[]>(claim?.documents || []);
  const [newDocument, setNewDocument] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const claimData: InsuranceClaim = {
        id: claim?.id || `claim-${Date.now()}`,
        ...formData,
        documents: documents.length > 0 ? documents : undefined,
        createdAt: claim?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (claim) {
        dispatch({ type: 'UPDATE_INSURANCE_CLAIM', payload: claimData });
      } else {
        dispatch({ type: 'ADD_INSURANCE_CLAIM', payload: claimData });
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la demande de remboursement:', error);
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

    // Si le patient change, réinitialiser l'assurance
    if (e.target.name === 'patientId') {
      setFormData(prev => ({
        ...prev,
        patientInsuranceId: ''
      }));
    }

    // Si l'assurance change, mettre à jour les montants selon la facture
    if (e.target.name === 'invoiceId' && e.target.value) {
      const selectedInvoice = state.invoices.find(i => i.id === e.target.value);
      if (selectedInvoice) {
        const patientInsurance = state.patientInsurances.find(pi => pi.id === formData.patientInsuranceId);
        const coveragePercentage = patientInsurance?.coveragePercentage || 0;
        
        const totalAmount = selectedInvoice.total;
        const coveredAmount = Math.round(totalAmount * (coveragePercentage / 100));
        const patientResponsibility = totalAmount - coveredAmount;
        
        setFormData(prev => ({
          ...prev,
          totalAmount,
          coveredAmount,
          patientResponsibility
        }));
      }
    }

    // Si l'assurance patient change, mettre à jour les montants selon la facture
    if (e.target.name === 'patientInsuranceId' && formData.invoiceId) {
      const selectedInvoice = state.invoices.find(i => i.id === formData.invoiceId);
      const patientInsurance = state.patientInsurances.find(pi => pi.id === e.target.value);
      
      if (selectedInvoice && patientInsurance) {
        const coveragePercentage = patientInsurance.coveragePercentage;
        
        const totalAmount = selectedInvoice.total;
        const coveredAmount = Math.round(totalAmount * (coveragePercentage / 100));
        const patientResponsibility = totalAmount - coveredAmount;
        
        setFormData(prev => ({
          ...prev,
          totalAmount,
          coveredAmount,
          patientResponsibility
        }));
      }
    }
  };

  const addDocument = () => {
    if (newDocument.trim() && !documents.includes(newDocument.trim())) {
      setDocuments(prev => [...prev, newDocument.trim()]);
      setNewDocument('');
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Filtrer les assurances selon le patient sélectionné
  const filteredPatientInsurances = state.patientInsurances.filter(
    insurance => insurance.patientId === formData.patientId && insurance.status === 'active'
  );

  // Filtrer les factures selon le patient sélectionné
  const filteredInvoices = state.invoices.filter(
    invoice => invoice.patientId === formData.patientId && 
    (invoice.status === 'paid' || invoice.status === 'pending') &&
    !state.insuranceClaims.some(c => c.invoiceId === invoice.id && c.id !== claim?.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {claim ? 'Modifier la Demande de Remboursement' : 'Nouvelle Demande de Remboursement'}
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
                Assurance du patient *
              </label>
              <select
                name="patientInsuranceId"
                value={formData.patientInsuranceId}
                onChange={handleChange}
                required
                disabled={!formData.patientId}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="">Sélectionner une assurance</option>
                {filteredPatientInsurances.map(insurance => {
                  const provider = state.insuranceProviders.find(p => p.id === insurance.providerId);
                  const policy = state.insurancePolicies.find(p => p.id === insurance.policyId);
                  return (
                    <option key={insurance.id} value={insurance.id}>
                      {provider?.name} - {policy?.name} ({insurance.coveragePercentage}%)
                    </option>
                  );
                })}
              </select>
              {!formData.patientId && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Veuillez d'abord sélectionner un patient
                </p>
              )}
              {formData.patientId && filteredPatientInsurances.length === 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Ce patient n'a pas d'assurance active
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Facture à rembourser *
              </label>
              <select
                name="invoiceId"
                value={formData.invoiceId}
                onChange={handleChange}
                required
                disabled={!formData.patientId}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="">Sélectionner une facture</option>
                {filteredInvoices.map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    #{invoice.id.slice(-8)} - {new Date(invoice.date).toLocaleDateString('fr-FR')} - {formatCurrency(invoice.total, 'XOF')}
                  </option>
                ))}
              </select>
              {formData.patientId && filteredInvoices.length === 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Aucune facture disponible pour ce patient
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de demande *
              </label>
              <input
                type="text"
                name="claimNumber"
                value={formData.claimNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de soumission *
              </label>
              <input
                type="date"
                name="submissionDate"
                value={formData.submissionDate}
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
                <option value="submitted">Soumise</option>
                <option value="in-review">En révision</option>
                <option value="approved">Approuvée</option>
                <option value="partially-approved">Partiellement approuvée</option>
                <option value="rejected">Rejetée</option>
                <option value="paid">Payée</option>
              </select>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Montant total (XOF) *
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Montant couvert (XOF) *
                </label>
                <input
                  type="number"
                  name="coveredAmount"
                  value={formData.coveredAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  max={formData.totalAmount}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reste à charge (XOF) *
                </label>
                <input
                  type="number"
                  name="patientResponsibility"
                  value={formData.patientResponsibility}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {(formData.status === 'approved' || formData.status === 'partially-approved' || formData.status === 'paid') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date d'approbation
                </label>
                <input
                  type="date"
                  name="approvalDate"
                  value={formData.approvalDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {formData.status === 'paid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de paiement
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {formData.status === 'rejected' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motif de rejet
                </label>
                <input
                  type="text"
                  name="rejectionReason"
                  value={formData.rejectionReason}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Documents justificatifs</h3>
            
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newDocument}
                onChange={(e) => setNewDocument(e.target.value)}
                placeholder="Nom du document..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
              />
              <button
                type="button"
                onClick={addDocument}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {documents.map((document, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">{document}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  Aucun document ajouté
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
              {isLoading ? 'Enregistrement...' : (claim ? 'Mettre à jour' : 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsuranceClaimModal;
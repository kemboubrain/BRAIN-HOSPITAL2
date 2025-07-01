import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { patientService } from '../../services/supabaseService';
import { Patient } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface PatientModalProps {
  patient?: Patient;
  onClose: () => void;
}

const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    dateOfBirth: patient?.dateOfBirth || '',
    gender: patient?.gender || 'M',
    phone: patient?.phone || '',
    email: patient?.email || '',
    address: patient?.address || '',
    city: patient?.city || '',
    postalCode: patient?.postalCode || '',
    bloodGroup: patient?.bloodGroup || '',
    allergies: patient?.allergies || '',
    emergencyContactName: patient?.emergencyContact?.name || '',
    emergencyContactPhone: patient?.emergencyContact?.phone || '',
    emergencyContactRelationship: patient?.emergencyContact?.relationship || '',
    insuranceProvider: patient?.insurance?.provider || '',
    insuranceNumber: patient?.insurance?.number || '',
    insuranceCoverage: patient?.insurance?.coverage || 0,
    insuranceExpiryDate: patient?.insurance?.expiryDate || '',
    insurancePolicyType: patient?.insurance?.policyType || ''
  });

  const [selectedCareServices, setSelectedCareServices] = useState<Array<{
    serviceId: string;
    quantity: number;
  }>>([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const patientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'M' | 'F',
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship
        },
        insurance: {
          provider: formData.insuranceProvider,
          number: formData.insuranceNumber,
          coverage: formData.insuranceCoverage,
          expiryDate: formData.insuranceExpiryDate,
          policyType: formData.insurancePolicyType
        }
      };

      let savedPatient: Patient;

      if (patient) {
        savedPatient = await patientService.update(patient.id, patientData);
        dispatch({ type: 'UPDATE_PATIENT', payload: savedPatient });
      } else {
        savedPatient = await patientService.create(patientData);
        dispatch({ type: 'ADD_PATIENT', payload: savedPatient });

        // Créer une fiche de soins si des services sont sélectionnés
        if (selectedCareServices.length > 0) {
          const careItems = selectedCareServices.map((selected, index) => {
            const service = state.careServices.find(s => s.id === selected.serviceId);
            return {
              id: `${Date.now()}-${index}`,
              careRecordId: `care-${Date.now()}`,
              careServiceId: selected.serviceId,
              quantity: selected.quantity,
              unitPrice: service?.unitPrice || 0,
              totalPrice: (service?.unitPrice || 0) * selected.quantity,
              performedBy: '',
              notes: ''
            };
          });

          const totalCost = careItems.reduce((sum, item) => sum + item.totalPrice, 0);

          const careRecord = {
            id: `care-${Date.now()}`,
            patientId: savedPatient.id,
            careDate: new Date().toISOString().split('T')[0],
            status: 'planned' as const,
            totalCost,
            notes: 'Services sélectionnés lors de la création du patient',
            careItems,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          dispatch({ type: 'ADD_CARE_RECORD', payload: careRecord });
        }

        // Créer une assurance patient si des informations d'assurance sont fournies
        if (formData.insuranceProvider && formData.insuranceNumber) {
          // Trouver l'assureur correspondant
          const provider = state.insuranceProviders.find(p => 
            p.name.toLowerCase() === formData.insuranceProvider.toLowerCase()
          );
          
          if (provider) {
            // Trouver une police correspondante
            const policy = state.insurancePolicies.find(p => 
              p.providerId === provider.id && 
              (formData.insurancePolicyType ? p.name.toLowerCase().includes(formData.insurancePolicyType.toLowerCase()) : true)
            );
            
            if (policy) {
              const patientInsurance = {
                id: `patient-insurance-${Date.now()}`,
                patientId: savedPatient.id,
                providerId: provider.id,
                policyId: policy.id,
                policyNumber: formData.insuranceNumber,
                startDate: new Date().toISOString().split('T')[0],
                endDate: formData.insuranceExpiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                status: 'active' as const,
                coveragePercentage: formData.insuranceCoverage || policy.coveragePercentage,
                annualLimit: policy.annualLimit,
                usedAmount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              dispatch({ type: 'ADD_PATIENT_INSURANCE', payload: patientInsurance });
            }
          }
        }
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const addCareService = () => {
    setSelectedCareServices(prev => [...prev, { serviceId: '', quantity: 1 }]);
  };

  const removeCareService = (index: number) => {
    setSelectedCareServices(prev => prev.filter((_, i) => i !== index));
  };

  const updateCareService = (index: number, field: 'serviceId' | 'quantity', value: string | number) => {
    setSelectedCareServices(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const getTotalCareServicesCost = () => {
    return selectedCareServices.reduce((total, selected) => {
      const service = state.careServices.find(s => s.id === selected.serviceId);
      return total + (service?.unitPrice || 0) * selected.quantity;
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {patient ? 'Modifier le Patient' : 'Nouveau Patient'}
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
                Prénom *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de Naissance *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sexe *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+221 77 123 45 67"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ville
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code Postal
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Groupe Sanguin
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Allergies
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Décrivez les allergies connues..."
              />
            </div>
          </div>

          {/* Services de soins (uniquement pour nouveau patient) */}
          {!patient && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Services de Soins à Programmer</h3>
                <button
                  type="button"
                  onClick={addCareService}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {selectedCareServices.length > 0 && (
                <div className="space-y-4 mb-4">
                  {selectedCareServices.map((selected, index) => {
                    const service = state.careServices.find(s => s.id === selected.serviceId);
                    return (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">Service {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeCareService(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Service
                            </label>
                            <select
                              value={selected.serviceId}
                              onChange={(e) => updateCareService(index, 'serviceId', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            >
                              <option value="">Sélectionner un service</option>
                              {state.careServices.filter(s => s.isActive).map(service => (
                                <option key={service.id} value={service.id}>
                                  {service.name} - {formatCurrency(service.unitPrice, 'XOF')}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Quantité
                            </label>
                            <input
                              type="number"
                              value={selected.quantity}
                              onChange={(e) => updateCareService(index, 'quantity', parseInt(e.target.value))}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Total
                            </label>
                            <input
                              type="text"
                              value={service ? formatCurrency(service.unitPrice * selected.quantity, 'XOF') : '0 F CFA'}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-sm font-medium text-green-600 dark:text-green-400"
                            />
                          </div>
                        </div>

                        {service && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{service.category}</span> • 
                            <span className="ml-1">{service.durationMinutes} min</span>
                            {service.requiresDoctor && <span className="ml-1 text-orange-600 dark:text-orange-400">• Médecin requis</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {selectedCareServices.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          Total des services sélectionnés:
                        </span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(getTotalCareServicesCost(), 'XOF')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact d'Urgence</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Relation
                </label>
                <input
                  type="text"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assurance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fournisseur
                </label>
                <select
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Sélectionner</option>
                  {state.insuranceProviders.map(provider => (
                    <option key={provider.id} value={provider.name}>{provider.name}</option>
                  ))}
                  <option value="IPRES">IPRES</option>
                  <option value="CSS">CSS</option>
                  <option value="Mutuelle Santé">Mutuelle Santé</option>
                  <option value="SUNU Assurances">SUNU Assurances</option>
                  <option value="NSIA Assurances">NSIA Assurances</option>
                  <option value="Assurance Privée">Assurance Privée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro
                </label>
                <input
                  type="text"
                  name="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Taux de couverture (%)
                </label>
                <input
                  type="number"
                  name="insuranceCoverage"
                  value={formData.insuranceCoverage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date d'expiration
                </label>
                <input
                  type="date"
                  name="insuranceExpiryDate"
                  value={formData.insuranceExpiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de police
                </label>
                <input
                  type="text"
                  name="insurancePolicyType"
                  value={formData.insurancePolicyType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ex: Standard, Premium, Familiale..."
                />
              </div>
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
              {isLoading ? 'Enregistrement...' : (patient ? 'Mettre à jour' : 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
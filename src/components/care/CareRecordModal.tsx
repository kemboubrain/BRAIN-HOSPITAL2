import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, User, DollarSign } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { PatientCareRecord, CareItem } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface CareRecordModalProps {
  careRecord?: PatientCareRecord;
  onClose: () => void;
}

const CareRecordModal: React.FC<CareRecordModalProps> = ({ careRecord, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    patientId: careRecord?.patientId || '',
    doctorId: careRecord?.doctorId || '',
    careDate: careRecord?.careDate || new Date().toISOString().split('T')[0],
    status: careRecord?.status || 'planned',
    notes: careRecord?.notes || ''
  });

  const [careItems, setCareItems] = useState<Omit<CareItem, 'id' | 'careRecordId'>[]>(
    careRecord?.careItems?.map(item => ({
      careServiceId: item.careServiceId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      performedAt: item.performedAt,
      performedBy: item.performedBy,
      notes: item.notes
    })) || []
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const totalCost = careItems.reduce((sum, item) => sum + item.totalPrice, 0);

      const careRecordData: PatientCareRecord = {
        id: careRecord?.id || Date.now().toString(),
        ...formData,
        status: formData.status as any,
        totalCost,
        careItems: careItems.map((item, index) => ({
          id: careRecord?.careItems?.[index]?.id || `${Date.now()}-${index}`,
          careRecordId: careRecord?.id || Date.now().toString(),
          ...item
        })),
        createdAt: careRecord?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (careRecord) {
        dispatch({ type: 'UPDATE_CARE_RECORD', payload: careRecordData });
      } else {
        dispatch({ type: 'ADD_CARE_RECORD', payload: careRecordData });
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la fiche de soins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addCareItem = () => {
    setCareItems(prev => [...prev, {
      careServiceId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      performedBy: '',
      notes: ''
    }]);
  };

  const removeCareItem = (index: number) => {
    setCareItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateCareItem = (index: number, field: string, value: string | number) => {
    setCareItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculer le prix total si la quantité ou le service change
        if (field === 'careServiceId') {
          const service = state.careServices.find(s => s.id === value);
          if (service) {
            updatedItem.unitPrice = service.unitPrice;
            updatedItem.totalPrice = updatedItem.quantity * service.unitPrice;
          }
        } else if (field === 'quantity') {
          updatedItem.totalPrice = Number(value) * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const totalCost = careItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {careRecord ? 'Modifier la Fiche de Soins' : 'Nouvelle Fiche de Soins'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                Médecin
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner un médecin</option>
                {state.doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                name="careDate"
                value={formData.careDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <option value="planned">Planifié</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Coût total
              </label>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalCost, 'XOF')}
                </span>
              </div>
            </div>
          </div>

          {/* Services de soins */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Services de Soins</h3>
              <button
                type="button"
                onClick={addCareItem}
                className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 hover:bg-green-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter</span>
              </button>
            </div>

            {careItems.length > 0 && (
              <div className="space-y-4">
                {careItems.map((item, index) => {
                  const service = state.careServices.find(s => s.id === item.careServiceId);
                  return (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">Service {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeCareItem(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Service
                          </label>
                          <select
                            value={item.careServiceId}
                            onChange={(e) => updateCareItem(index, 'careServiceId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          >
                            <option value="">Sélectionner</option>
                            {state.careServices.filter(s => s.isActive).map(service => (
                              <option key={service.id} value={service.id}>
                                {service.name}
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
                            value={item.quantity}
                            onChange={(e) => updateCareItem(index, 'quantity', parseInt(e.target.value))}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Prix unitaire
                          </label>
                          <input
                            type="text"
                            value={formatCurrency(item.unitPrice, 'XOF')}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-sm text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Total
                          </label>
                          <input
                            type="text"
                            value={formatCurrency(item.totalPrice, 'XOF')}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-sm font-medium text-green-600 dark:text-green-400"
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Réalisé par
                          </label>
                          <input
                            type="text"
                            value={item.performedBy}
                            onChange={(e) => updateCareItem(index, 'performedBy', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            placeholder="Nom du soignant"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => updateCareItem(index, 'notes', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            placeholder="Notes particulières"
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
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes générales
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Notes sur les soins réalisés..."
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
              {isLoading ? 'Enregistrement...' : (careRecord ? 'Mettre à jour' : 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CareRecordModal;
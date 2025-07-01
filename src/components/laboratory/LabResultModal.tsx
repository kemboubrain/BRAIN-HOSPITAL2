import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { LabResult } from '../../types';

interface LabResultModalProps {
  result?: LabResult;
  onClose: () => void;
}

const LabResultModal: React.FC<LabResultModalProps> = ({ result, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    patientId: result?.patientId || '',
    consultationId: result?.consultationId || '',
    testType: result?.testType || '',
    testDate: result?.testDate || new Date().toISOString().split('T')[0],
    sampleType: result?.sampleType || '',
    sampleCollectionDate: result?.sampleCollectionDate || new Date().toISOString().split('T')[0],
    technician: result?.technician || '',
    validatedBy: result?.validatedBy || '',
    validationDate: result?.validationDate || '',
    status: result?.status || 'pending',
    conclusion: result?.conclusion || '',
    notes: result?.notes || ''
  });

  const [results, setResults] = useState<{
    [key: string]: {
      value: string;
      unit: string;
      referenceRange: string;
      status: 'normal' | 'abnormal' | 'critical';
    };
  }>(result?.results || {});

  const [selectedTest, setSelectedTest] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const resultData: LabResult = {
        id: result?.id || `result-${Date.now()}`,
        ...formData,
        results,
        createdAt: result?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (result) {
        dispatch({ type: 'UPDATE_LAB_RESULT', payload: resultData });
      } else {
        dispatch({ type: 'ADD_LAB_RESULT', payload: resultData });
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du résultat de laboratoire:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const testId = e.target.value;
    setSelectedTest(testId);
    
    if (testId) {
      const test = state.labTests.find(t => t.id === testId);
      if (test) {
        setFormData(prev => ({
          ...prev,
          testType: test.name,
          sampleType: test.sampleType
        }));
        
        // Initialiser les résultats avec les paramètres du test
        const initialResults: any = {};
        test.parameters.forEach(param => {
          let referenceRange = '';
          if (param.referenceRangeText) {
            referenceRange = param.referenceRangeText;
          } else if (param.referenceRangeMin !== undefined && param.referenceRangeMax !== undefined) {
            referenceRange = `${param.referenceRangeMin}-${param.referenceRangeMax} ${param.unit || ''}`;
          }
          
          initialResults[param.name] = {
            value: '',
            unit: param.unit || '',
            referenceRange,
            status: 'normal'
          };
        });
        
        setResults(initialResults);
      }
    }
  };

  const handleResultChange = (paramName: string, field: string, value: string) => {
    setResults(prev => ({
      ...prev,
      [paramName]: {
        ...prev[paramName],
        [field]: value
      }
    }));
  };

  const addCustomParameter = () => {
    const paramName = `Paramètre ${Object.keys(results).length + 1}`;
    setResults(prev => ({
      ...prev,
      [paramName]: {
        value: '',
        unit: '',
        referenceRange: '',
        status: 'normal'
      }
    }));
  };

  const removeParameter = (paramName: string) => {
    setResults(prev => {
      const newResults = { ...prev };
      delete newResults[paramName];
      return newResults;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {result ? 'Modifier le Résultat' : 'Nouveau Résultat de Laboratoire'}
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
                Consultation associée
              </label>
              <select
                name="consultationId"
                value={formData.consultationId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Aucune</option>
                {state.consultations
                  .filter(c => c.patientId === formData.patientId)
                  .map(consultation => (
                    <option key={consultation.id} value={consultation.id}>
                      {new Date(consultation.date).toLocaleDateString('fr-FR')} - {consultation.diagnosis}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test de laboratoire *
              </label>
              <select
                value={selectedTest}
                onChange={handleTestChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner un test</option>
                {state.labTests.filter(t => t.isActive).map(test => (
                  <option key={test.id} value={test.id}>
                    {test.name} - {test.category}
                  </option>
                ))}
              </select>
            </div>

            {!selectedTest && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de test *
                </label>
                <input
                  type="text"
                  name="testType"
                  value={formData.testType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type d'échantillon *
              </label>
              <select
                name="sampleType"
                value={formData.sampleType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner un type</option>
                <option value="Sang">Sang</option>
                <option value="Urine">Urine</option>
                <option value="Selles">Selles</option>
                <option value="LCR">LCR (Liquide céphalo-rachidien)</option>
                <option value="Expectoration">Expectoration</option>
                <option value="Sérum">Sérum</option>
                <option value="Plasma">Plasma</option>
                <option value="Liquide pleural">Liquide pleural</option>
                <option value="Liquide synovial">Liquide synovial</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de prélèvement *
              </label>
              <input
                type="date"
                name="sampleCollectionDate"
                value={formData.sampleCollectionDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date du test *
              </label>
              <input
                type="date"
                name="testDate"
                value={formData.testDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Technicien *
              </label>
              <input
                type="text"
                name="technician"
                value={formData.technician}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Validé par
              </label>
              <input
                type="text"
                name="validatedBy"
                value={formData.validatedBy}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de validation
              </label>
              <input
                type="date"
                name="validationDate"
                value={formData.validationDate}
                onChange={handleChange}
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
                <option value="pending">En attente</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>

          {/* Résultats */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Résultats</h3>
              <button
                type="button"
                onClick={addCustomParameter}
                className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 hover:bg-green-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Paramètre</span>
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(results).map(([paramName, paramData]) => (
                <div key={paramName} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{paramName}</h4>
                      {paramData.unit && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">({paramData.unit})</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParameter(paramName)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valeur
                      </label>
                      <input
                        type="text"
                        value={paramData.value}
                        onChange={(e) => handleResultChange(paramName, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Plage de référence
                      </label>
                      <input
                        type="text"
                        value={paramData.referenceRange}
                        onChange={(e) => handleResultChange(paramName, 'referenceRange', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Statut
                      </label>
                      <select
                        value={paramData.status}
                        onChange={(e) => handleResultChange(paramName, 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      >
                        <option value="normal">Normal</option>
                        <option value="abnormal">Anormal</option>
                        <option value="critical">Critique</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(results).length === 0 && (
                <div className="text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Aucun paramètre ajouté</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conclusion
              </label>
              <textarea
                name="conclusion"
                value={formData.conclusion}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Interprétation globale des résultats..."
              />
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
                placeholder="Notes additionnelles..."
              />
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
              disabled={isLoading || Object.keys(results).length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : (result ? 'Mettre à jour' : 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabResultModal;
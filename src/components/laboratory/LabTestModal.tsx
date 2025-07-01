import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { LabTest, LabParameter } from '../../types';

interface LabTestModalProps {
  test?: LabTest;
  onClose: () => void;
}

const LabTestModal: React.FC<LabTestModalProps> = ({ test, onClose }) => {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: test?.name || '',
    category: test?.category || '',
    description: test?.description || '',
    price: test?.price || 0,
    sampleType: test?.sampleType || '',
    processingTime: test?.processingTime || '',
    isActive: test?.isActive ?? true
  });

  const [parameters, setParameters] = useState<Omit<LabParameter, 'id'>[]>(
    test?.parameters.map(param => ({
      name: param.name,
      unit: param.unit,
      referenceRangeMin: param.referenceRangeMin,
      referenceRangeMax: param.referenceRangeMax,
      referenceRangeText: param.referenceRangeText
    })) || []
  );

  const [newParameter, setNewParameter] = useState({
    name: '',
    unit: '',
    referenceRangeMin: undefined as number | undefined,
    referenceRangeMax: undefined as number | undefined,
    referenceRangeText: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [useRangeText, setUseRangeText] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const testData: LabTest = {
        id: test?.id || `test-${Date.now()}`,
        ...formData,
        parameters: parameters.map((param, index) => ({
          id: test?.parameters[index]?.id || `param-${Date.now()}-${index}`,
          ...param
        })),
        createdAt: test?.createdAt || new Date().toISOString()
      };

      if (test) {
        dispatch({ type: 'UPDATE_LAB_TEST', payload: testData });
      } else {
        dispatch({ type: 'ADD_LAB_TEST', payload: testData });
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du test de laboratoire:', error);
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

  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setNewParameter(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value
    }));
  };

  const addParameter = () => {
    if (newParameter.name && (newParameter.referenceRangeText || (newParameter.referenceRangeMin !== undefined && newParameter.referenceRangeMax !== undefined))) {
      setParameters(prev => [...prev, { ...newParameter }]);
      setNewParameter({
        name: '',
        unit: '',
        referenceRangeMin: undefined,
        referenceRangeMax: undefined,
        referenceRangeText: ''
      });
      setUseRangeText(false);
    }
  };

  const removeParameter = (index: number) => {
    setParameters(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRangeType = () => {
    setUseRangeText(!useRangeText);
    setNewParameter(prev => ({
      ...prev,
      referenceRangeMin: undefined,
      referenceRangeMax: undefined,
      referenceRangeText: ''
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {test ? 'Modifier le Test' : 'Nouveau Test de Laboratoire'}
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
                Nom du test *
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catégorie *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Hématologie">Hématologie</option>
                <option value="Biochimie">Biochimie</option>
                <option value="Immunologie">Immunologie</option>
                <option value="Microbiologie">Microbiologie</option>
                <option value="Parasitologie">Parasitologie</option>
                <option value="Sérologie">Sérologie</option>
                <option value="Hormonologie">Hormonologie</option>
                <option value="Toxicologie">Toxicologie</option>
                <option value="Autre">Autre</option>
              </select>
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
                Prix (XOF) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

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
                Délai de traitement *
              </label>
              <input
                type="text"
                name="processingTime"
                value={formData.processingTime}
                onChange={handleChange}
                required
                placeholder="ex: 1 jour, 2 heures, etc."
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
                Test actif
              </label>
            </div>
          </div>

          {/* Paramètres du test */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Paramètres du Test</h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={toggleRangeType}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {useRangeText ? 'Utiliser plage numérique' : 'Utiliser texte de référence'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du paramètre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newParameter.name}
                  onChange={handleParameterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ex: Hémoglobine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unité
                </label>
                <input
                  type="text"
                  name="unit"
                  value={newParameter.unit}
                  onChange={handleParameterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ex: g/dL"
                />
              </div>
              {useRangeText ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valeur de référence
                  </label>
                  <input
                    type="text"
                    name="referenceRangeText"
                    value={newParameter.referenceRangeText}
                    onChange={handleParameterChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ex: Négatif"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min
                    </label>
                    <input
                      type="number"
                      name="referenceRangeMin"
                      value={newParameter.referenceRangeMin}
                      onChange={handleParameterChange}
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ex: 12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max
                    </label>
                    <input
                      type="number"
                      name="referenceRangeMax"
                      value={newParameter.referenceRangeMax}
                      onChange={handleParameterChange}
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ex: 16"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={addParameter}
                disabled={!newParameter.name || (!newParameter.referenceRangeText && (newParameter.referenceRangeMin === undefined || newParameter.referenceRangeMax === undefined))}
                className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Paramètre</span>
              </button>
            </div>

            <div className="space-y-3">
              {parameters.map((param, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 dark:text-white">{param.name}</span>
                      {param.unit && <span className="ml-2 text-gray-500 dark:text-gray-400">({param.unit})</span>}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Référence: {param.referenceRangeText || 
                        (param.referenceRangeMin !== undefined && param.referenceRangeMax !== undefined ? 
                          `${param.referenceRangeMin}-${param.referenceRangeMax} ${param.unit || ''}` : 
                          'Non spécifiée')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeParameter(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {parameters.length === 0 && (
                <div className="text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Aucun paramètre ajouté</p>
                </div>
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
              disabled={isLoading || parameters.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : (test ? 'Mettre à jour' : 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabTestModal;
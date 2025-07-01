import React, { useState } from 'react';
import { X, AlertCircle, ShoppingCart, ArrowDownCircle, RefreshCw, XCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Medication } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface StockMovementModalProps {
  medication: Medication;
  onClose: () => void;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ medication, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    type: 'entry',
    quantity: 1,
    reason: '',
    reference: '',
    operator: 'Administrateur',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5)
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (formData.quantity <= 0) newErrors.quantity = "La quantité doit être supérieure à 0";
    if (!formData.reason.trim()) newErrors.reason = "Le motif est requis";
    if (!formData.operator.trim()) newErrors.operator = "L'opérateur est requis";
    
    // Vérifier si la quantité est suffisante pour une sortie
    if (formData.type === 'exit' && formData.quantity > medication.stock) {
      newErrors.quantity = "Quantité insuffisante en stock";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      // Créer le mouvement de stock
      const stockMovement = {
        id: Date.now().toString(),
        medicationId: medication.id,
        date: `${formData.date}T${formData.time}:00`,
        type: formData.type,
        quantity: formData.type === 'exit' || formData.type === 'loss' ? -formData.quantity : formData.quantity,
        reason: formData.reason,
        reference: formData.reference,
        operator: formData.operator
      };
      
      dispatch({ type: 'ADD_STOCK_MOVEMENT', payload: stockMovement });
      
      // Mettre à jour le stock du médicament
      let newStock = medication.stock;
      
      if (formData.type === 'entry') {
        newStock += formData.quantity;
      } else if (formData.type === 'exit' || formData.type === 'loss') {
        newStock -= formData.quantity;
      } else if (formData.type === 'adjustment') {
        newStock = formData.quantity; // Remplacement direct pour l'ajustement
      }
      
      const updatedMedication = {
        ...medication,
        stock: newStock
      };
      
      dispatch({ type: 'UPDATE_MEDICATION', payload: updatedMedication });

      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du mouvement de stock:', error);
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
    
    // Effacer l'erreur pour ce champ s'il y en a une
    if (errors[e.target.name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <ArrowDownCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'exit':
        return <ShoppingCart className="h-5 w-5 text-primary-600 dark:text-primary-400" />;
      case 'adjustment':
        return <RefreshCw className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case 'loss':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Mouvement de Stock
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-primary-900 dark:text-primary-100 mb-2">Informations du médicament</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-primary-700 dark:text-primary-300">Nom:</p>
                <p className="font-medium text-primary-900 dark:text-primary-100">{medication.name}</p>
              </div>
              <div>
                <p className="text-sm text-primary-700 dark:text-primary-300">Catégorie:</p>
                <p className="text-primary-900 dark:text-primary-100">{medication.category}</p>
              </div>
              <div>
                <p className="text-sm text-primary-700 dark:text-primary-300">Stock actuel:</p>
                <p className="font-medium text-primary-900 dark:text-primary-100">{medication.stock} unités</p>
              </div>
              <div>
                <p className="text-sm text-primary-700 dark:text-primary-300">Prix unitaire:</p>
                <p className="text-primary-900 dark:text-primary-100">{formatCurrency(medication.unitPrice, 'XOF')}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de mouvement *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="entry">Entrée de stock</option>
                  <option value="exit">Sortie de stock</option>
                  <option value="adjustment">Ajustement</option>
                  <option value="loss">Perte/Destruction</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formData.type === 'adjustment' ? 'Nouveau stock total *' : 'Quantité *'}
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min={formData.type === 'adjustment' ? 0 : 1}
                  className={`w-full px-3 py-2 border ${errors.quantity ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.quantity}
                  </p>
                )}
                {formData.type === 'adjustment' && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Stock actuel: {medication.stock} unités
                  </p>
                )}
                {formData.type === 'exit' && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Stock disponible: {medication.stock} unités
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motif *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={2}
                  placeholder={
                    formData.type === 'entry' ? "Ex: Réapprovisionnement, Don, Transfert" :
                    formData.type === 'exit' ? "Ex: Prescription, Transfert vers un autre service" :
                    formData.type === 'adjustment' ? "Ex: Inventaire, Correction d'erreur" :
                    "Ex: Périmé, Endommagé, Perdu"
                  }
                  className={`w-full px-3 py-2 border ${errors.reason ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.reason}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Référence
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="Ex: N° Facture, N° Bon de commande"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opérateur *
                </label>
                <input
                  type="text"
                  name="operator"
                  value={formData.operator}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.operator ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                {errors.operator && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.operator}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heure
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                {getTypeIcon(formData.type)}
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {formData.type === 'entry' ? 'Entrée de stock' :
                   formData.type === 'exit' ? 'Sortie de stock' :
                   formData.type === 'adjustment' ? 'Ajustement de stock' : 'Perte/Destruction'}
                </h4>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formData.type === 'entry' && (
                  <p>Le stock passera de <span className="font-medium">{medication.stock}</span> à <span className="font-medium text-green-600 dark:text-green-400">{medication.stock + formData.quantity}</span> unités.</p>
                )}
                {formData.type === 'exit' && (
                  <p>Le stock passera de <span className="font-medium">{medication.stock}</span> à <span className="font-medium text-primary-600 dark:text-primary-400">{Math.max(0, medication.stock - formData.quantity)}</span> unités.</p>
                )}
                {formData.type === 'adjustment' && (
                  <p>Le stock sera ajusté de <span className="font-medium">{medication.stock}</span> à <span className="font-medium text-orange-600 dark:text-orange-400">{formData.quantity}</span> unités.</p>
                )}
                {formData.type === 'loss' && (
                  <p>Le stock passera de <span className="font-medium">{medication.stock}</span> à <span className="font-medium text-red-600 dark:text-red-400">{Math.max(0, medication.stock - formData.quantity)}</span> unités.</p>
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
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockMovementModal;
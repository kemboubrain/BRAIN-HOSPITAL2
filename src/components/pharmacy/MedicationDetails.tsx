import React from 'react';
import { X, Pill, Package, Calendar, AlertTriangle, ShoppingCart, ArrowDownCircle, RefreshCw, XCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/currency';
import PrintableDocument from '../common/PrintableDocument';

interface MedicationDetailsProps {
  medication: any;
  onClose: () => void;
  onEdit: () => void;
}

const MedicationDetails: React.FC<MedicationDetailsProps> = ({ medication, onClose, onEdit }) => {
  const { state } = useApp();
  
  const stockMovements = state.stockMovements?.filter(m => m.medicationId === medication.id) || [];
  
  const getStockStatus = (medication: any) => {
    if (medication.stock === 0) return { status: 'out', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', text: 'Rupture' };
    if (medication.stock <= medication.minStock) return { status: 'low', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', text: 'Stock faible' };
    return { status: 'ok', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', text: 'En stock' };
  };

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);
    
    if (expiry < today) {
      return { status: 'expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', text: 'Expiré' };
    } else if (expiry <= oneMonthLater) {
      return { status: 'soon', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', text: 'Expire bientôt' };
    } else if (expiry <= threeMonthsLater) {
      return { status: 'warning', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', text: 'Expiration < 3 mois' };
    } else {
      return { status: 'ok', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', text: 'Valide' };
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <ArrowDownCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'exit':
        return <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'adjustment':
        return <RefreshCw className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'loss':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getMovementTypeText = (type: string) => {
    switch (type) {
      case 'entry':
        return 'Entrée';
      case 'exit':
        return 'Sortie';
      case 'adjustment':
        return 'Ajustement';
      case 'loss':
        return 'Perte';
      default:
        return type;
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'entry':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'exit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'adjustment':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'loss':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const stockStatus = getStockStatus(medication);
  const expiryStatus = getExpiryStatus(medication.expiryDate);

  // Calculer les statistiques d'utilisation
  const totalEntries = stockMovements
    .filter(m => m.type === 'entry')
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
  
  const totalExits = stockMovements
    .filter(m => m.type === 'exit')
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
  
  const totalLosses = stockMovements
    .filter(m => m.type === 'loss')
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

  // Trouver les prescriptions qui utilisent ce médicament
  const prescriptions = state.consultations
    .flatMap(c => c.prescription || [])
    .filter(p => p.medicationId === medication.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Détails du Médicament
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <PrintableDocument title={`Fiche Médicament - ${medication.name}`}>
            <div className="space-y-6">
              {/* En-tête du médicament */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 dark:bg-primary-900/20 rounded-lg p-3">
                    <Pill className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {medication.name}
                    </h2>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        {medication.category}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Expire le: {new Date(medication.expiryDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {expiryStatus.status !== 'ok' && (
                      <div className="flex items-center space-x-2 mt-1">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className={expiryStatus.color}>{expiryStatus.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Informations du médicament */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Informations générales</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fabricant:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{medication.manufacturer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">N° de lot:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{medication.batchNumber || 'Non spécifié'}</span>
                      </div>
                      {medication.dosageForm && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Forme:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{medication.dosageForm}</span>
                        </div>
                      )}
                      {medication.dosageStrength && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Dosage:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{medication.dosageStrength}</span>
                        </div>
                      )}
                      {medication.packSize && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Conditionnement:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{medication.packSize}</span>
                        </div>
                      )}
                      {medication.location && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Emplacement:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{medication.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Informations de stock</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Stock actuel:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{medication.stock} unités</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Stock minimum:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{medication.minStock} unités</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Prix unitaire:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(medication.unitPrice, 'XOF')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Valeur totale:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(medication.stock * medication.unitPrice, 'XOF')}</span>
                      </div>
                    </div>
                  </div>

                  {medication.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">{medication.description}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Statistiques d'utilisation</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total entrées:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">+{totalEntries} unités</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total sorties:</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">-{totalExits} unités</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total pertes:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">-{totalLosses} unités</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Prescriptions:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{prescriptions.length}</span>
                      </div>
                    </div>
                  </div>

                  {prescriptions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dernières prescriptions</h3>
                      <div className="mt-2 space-y-2">
                        {prescriptions.slice(0, 5).map((prescription, index) => {
                          const consultation = state.consultations.find(c => 
                            c.prescription.some(p => p.id === prescription.id)
                          );
                          const patient = consultation ? state.patients.find(p => p.id === consultation.patientId) : null;
                          
                          return (
                            <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {consultation ? new Date(consultation.date).toLocaleDateString('fr-FR') : 'Date inconnue'} • 
                                {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                              </div>
                            </div>
                          );
                        })}
                        {prescriptions.length > 5 && (
                          <div className="text-center text-sm text-primary-600 dark:text-primary-400">
                            +{prescriptions.length - 5} autres prescriptions
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Historique des mouvements */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Historique des mouvements</h3>
                
                {stockMovements.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Quantité
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Motif
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Opérateur
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {stockMovements.slice(0, 10).map((movement) => (
                          <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {new Date(movement.date).toLocaleDateString('fr-FR')}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(movement.date).toLocaleTimeString('fr-FR')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(movement.type)}`}>
                                {getMovementTypeIcon(movement.type)}
                                <span>{getMovementTypeText(movement.type)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${
                                movement.quantity > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {movement.reason}
                              </div>
                              {movement.reference && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Réf: {movement.reference}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {movement.operator}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Aucun mouvement de stock enregistré</p>
                  </div>
                )}
                
                {stockMovements.length > 10 && (
                  <div className="mt-4 text-center">
                    <span className="text-sm text-primary-600 dark:text-primary-400">
                      +{stockMovements.length - 10} autres mouvements
                    </span>
                  </div>
                )}
              </div>
            </div>
          </PrintableDocument>
        </div>
      </div>
    </div>
  );
};

export default MedicationDetails;
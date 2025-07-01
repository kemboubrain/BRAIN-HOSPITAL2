import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { LabResult } from '../../types';
import { X, User, Calendar, FlaskConical, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import PrintableDocument from '../common/PrintableDocument';

interface LabResultDetailsProps {
  result: LabResult;
  onClose: () => void;
}

const LabResultDetails: React.FC<LabResultDetailsProps> = ({ result, onClose }) => {
  const { state } = useApp();
  
  const patient = state.patients.find(p => p.id === result.patientId);
  const consultation = result.consultationId ? state.consultations.find(c => c.id === result.consultationId) : null;
  
  const getResultStatus = (results: any) => {
    const values = Object.values(results);
    const hasAbnormal = values.some((result: any) => result.status === 'abnormal' || result.status === 'critical');
    const hasCritical = values.some((result: any) => result.status === 'critical');
    
    if (hasCritical) return { status: 'critical', color: 'text-red-600 dark:text-red-400', icon: AlertCircle };
    if (hasAbnormal) return { status: 'abnormal', color: 'text-orange-600 dark:text-orange-400', icon: AlertCircle };
    return { status: 'normal', color: 'text-green-600 dark:text-green-400', icon: CheckCircle };
  };

  const resultStatus = getResultStatus(result.results);
  const StatusIcon = resultStatus.icon;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in-progress': return 'En cours';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getParameterStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'border-green-500 bg-green-50 dark:bg-green-900/10';
      case 'abnormal':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Résultat d'Analyse: {result.testType}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          <PrintableDocument title={`Résultat d'Analyse: ${result.testType}`}>
            <div className="space-y-6">
              {/* En-tête du résultat */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
                    <FlaskConical className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {result.testType}
                    </h2>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                        {getStatusText(result.status)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        resultStatus.status === 'normal' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : resultStatus.status === 'abnormal'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {resultStatus.status.charAt(0).toUpperCase() + resultStatus.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date du test: {new Date(result.testDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>Prélèvement: {new Date(result.sampleCollectionDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Informations du patient */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Informations du patient</h3>
                </div>
                
                {patient ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nom complet:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{patient.firstName} {patient.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date de naissance:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sexe:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{patient.gender === 'M' ? 'Homme' : 'Femme'}</p>
                    </div>
                    {patient.bloodGroup && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Groupe sanguin:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{patient.bloodGroup}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Patient non trouvé</p>
                )}
              </div>
              
              {/* Informations du test */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <FlaskConical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Informations du test</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type d'échantillon:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{result.sampleType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Technicien:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{result.technician}</p>
                  </div>
                  {result.validatedBy && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Validé par:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{result.validatedBy}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Résultats détaillés */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Résultats détaillés</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Paramètre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Résultat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Unité
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Valeurs de référence
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {Object.entries(result.results).map(([paramName, paramData]) => (
                        <tr key={paramName} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{paramName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{paramData.value}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{paramData.unit}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{paramData.referenceRange}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              paramData.status === 'normal' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                : paramData.status === 'abnormal'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {paramData.status === 'normal' ? 'Normal' : 
                               paramData.status === 'abnormal' ? 'Anormal' : 'Critique'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Conclusion */}
              {result.conclusion && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Conclusion</h3>
                  <p className="text-blue-800 dark:text-blue-200">{result.conclusion}</p>
                </div>
              )}
              
              {/* Notes */}
              {result.notes && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h3>
                  <p className="text-gray-700 dark:text-gray-300">{result.notes}</p>
                </div>
              )}
              
              {/* Pied de page */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>MediCenter - Système de Gestion de Centre de Santé</p>
                <p>15 Avenue Léopold Sédar Senghor, Dakar, Sénégal</p>
                <p>Tel: +221 33 123 45 67 | Email: labo@medicenter.sn</p>
              </div>
            </div>
          </PrintableDocument>
        </div>
      </div>
    </div>
  );
};

export default LabResultDetails;
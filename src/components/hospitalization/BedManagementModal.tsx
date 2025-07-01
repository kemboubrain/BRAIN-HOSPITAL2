import React, { useState } from 'react';
import { X, Bed as BedIcon, User, Calendar, AlertCircle, CheckCircle, Wrench, Sparkles } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Room, Bed } from '../../types';

interface BedManagementModalProps {
  room: Room;
  onClose: () => void;
}

const BedManagementModal: React.FC<BedManagementModalProps> = ({ room, onClose }) => {
  const { state, dispatch } = useApp();
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [bedAction, setBedAction] = useState<'assign' | 'release' | 'maintenance' | 'clean' | null>(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [notes, setNotes] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'occupied':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-orange-600" />;
      case 'cleaning':
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'occupied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'cleaning':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Occupé';
      case 'maintenance':
        return 'Maintenance';
      case 'cleaning':
        return 'Nettoyage';
      default:
        return status;
    }
  };

  const handleBedAction = () => {
    if (!selectedBed || !bedAction) return;

    const updatedBed: Bed = { ...selectedBed };

    switch (bedAction) {
      case 'assign':
        if (selectedPatient) {
          updatedBed.status = 'occupied';
          updatedBed.isOccupied = true;
          updatedBed.currentPatientId = selectedPatient;
          updatedBed.notes = notes;
        }
        break;
      case 'release':
        updatedBed.status = 'cleaning';
        updatedBed.isOccupied = false;
        updatedBed.currentPatientId = undefined;
        updatedBed.currentHospitalizationId = undefined;
        updatedBed.notes = notes;
        break;
      case 'maintenance':
        updatedBed.status = 'maintenance';
        updatedBed.isOccupied = false;
        updatedBed.notes = notes;
        break;
      case 'clean':
        updatedBed.status = 'available';
        updatedBed.isOccupied = false;
        updatedBed.lastCleaned = new Date().toISOString();
        updatedBed.notes = notes;
        break;
    }

    // Mettre à jour la chambre avec le lit modifié
    const updatedRoom: Room = {
      ...room,
      beds: room.beds.map(bed => bed.id === selectedBed.id ? updatedBed : bed)
    };

    dispatch({ type: 'UPDATE_ROOM', payload: updatedRoom });

    // Réinitialiser
    setSelectedBed(null);
    setBedAction(null);
    setSelectedPatient('');
    setNotes('');
  };

  const getPatientName = (patientId: string) => {
    const patient = state.patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  };

  const availablePatients = state.patients.filter(patient => {
    // Patients qui ne sont pas déjà hospitalisés
    return !state.hospitalizations.some(h => h.patientId === patient.id && h.status === 'active');
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Gestion des lits - Chambre {room.roomNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Informations de la chambre */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                <span className="ml-2 text-gray-900 dark:text-white capitalize">{room.roomType}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Étage:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{room.floorNumber}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Tarif/jour:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{room.dailyRate.toLocaleString()} F CFA</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Lits:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{room.bedCount}</span>
              </div>
            </div>
          </div>

          {/* Grille des lits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {room.beds.map((bed) => (
              <div
                key={bed.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedBed?.id === bed.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => setSelectedBed(bed)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <BedIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{bed.bedNumber}</span>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bed.status)}`}>
                    {getStatusIcon(bed.status)}
                    <span>{getStatusText(bed.status)}</span>
                  </div>
                </div>

                {bed.currentPatientId && (
                  <div className="mb-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-3 w-3" />
                      <span>{getPatientName(bed.currentPatientId)}</span>
                    </div>
                  </div>
                )}

                {bed.lastCleaned && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Nettoyé: {new Date(bed.lastCleaned).toLocaleDateString('fr-FR')}
                  </div>
                )}

                {bed.notes && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 p-2 rounded">
                    {bed.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions sur le lit sélectionné */}
          {selectedBed && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Actions pour le lit {selectedBed.bedNumber}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {selectedBed.status === 'available' && (
                  <button
                    onClick={() => setBedAction('assign')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      bedAction === 'assign'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <User className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Assigner</span>
                  </button>
                )}

                {selectedBed.status === 'occupied' && (
                  <button
                    onClick={() => setBedAction('release')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      bedAction === 'release'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Libérer</span>
                  </button>
                )}

                <button
                  onClick={() => setBedAction('maintenance')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    bedAction === 'maintenance'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                  }`}
                >
                  <Wrench className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Maintenance</span>
                </button>

                {selectedBed.status === 'cleaning' && (
                  <button
                    onClick={() => setBedAction('clean')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      bedAction === 'clean'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
                    }`}
                  >
                    <Sparkles className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Nettoyer</span>
                  </button>
                )}
              </div>

              {bedAction && (
                <div className="space-y-4">
                  {bedAction === 'assign' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sélectionner un patient
                      </label>
                      <select
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Choisir un patient</option>
                        {availablePatients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Notes sur l'action..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleBedAction}
                      disabled={bedAction === 'assign' && !selectedPatient}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => {
                        setBedAction(null);
                        setSelectedPatient('');
                        setNotes('');
                      }}
                      className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BedManagementModal;
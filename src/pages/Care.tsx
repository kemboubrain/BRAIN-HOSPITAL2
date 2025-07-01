import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, Plus, Heart, User, Calendar, DollarSign, Clock, FileText, CheckCircle, AlertCircle, Edit, Trash2, Printer, Eye } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import CareRecordModal from '../components/care/CareRecordModal';

const Care: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [viewMode, setViewMode] = useState<'records' | 'services'>('records');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredRecords = state.patientCareRecords.filter(record => {
    const patient = state.patients.find(p => p.id === record.patientId);
    const matchesSearch = patient && (
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesPatient = !selectedPatient || record.patientId === selectedPatient;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesPatient && matchesStatus;
  });

  const filteredServices = state.careServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'planned':
        return <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in-progress':
        return 'En cours';
      case 'planned':
        return 'Planifié';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setShowModal(true);
  };

  const handleDelete = (recordId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette fiche de soins ?')) {
      dispatch({ type: 'DELETE_CARE_RECORD', payload: recordId });
    }
  };

  const handlePrint = (record: any) => {
    const patient = state.patients.find(p => p.id === record.patientId);
    const doctor = state.doctors.find(d => d.id === record.doctorId);
    
    const printContent = `
      <html>
        <head>
          <title>Fiche de Soins - ${patient?.firstName} ${patient?.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { color: #2563eb; margin: 0; }
            .patient-info { margin-bottom: 25px; background: #f8f9fa; padding: 15px; border-radius: 8px; }
            .services { margin-bottom: 25px; }
            .service-item { border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px; }
            .service-header { font-weight: bold; color: #2563eb; margin-bottom: 8px; }
            .service-details { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; font-size: 18px; text-align: right; background: #e3f2fd; padding: 15px; border-radius: 8px; }
            .notes { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .status.completed { background: #d4edda; color: #155724; }
            .status.in-progress { background: #cce5ff; color: #004085; }
            .status.planned { background: #fff3cd; color: #856404; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 MediCenter - Fiche de Soins</h1>
            <p><strong>Date d'impression:</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
          
          <div class="patient-info">
            <h2>📋 Informations Patient</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p><strong>Nom complet:</strong> ${patient?.firstName} ${patient?.lastName}</p>
                <p><strong>Date des soins:</strong> ${new Date(record.careDate).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p><strong>Médecin responsable:</strong> ${doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Non assigné'}</p>
                <p><strong>Statut:</strong> <span class="status ${record.status}">${getStatusText(record.status)}</span></p>
              </div>
            </div>
          </div>
          
          <div class="services">
            <h2>🩺 Services Réalisés</h2>
            ${record.careItems.map((item: any) => {
              const service = state.careServices.find(s => s.id === item.careServiceId);
              return `
                <div class="service-item">
                  <div class="service-header">${service?.name || 'Service inconnu'}</div>
                  <div class="service-details">
                    <span><strong>Catégorie:</strong> ${service?.category || 'Non spécifiée'}</span>
                    <span><strong>Quantité:</strong> ${item.quantity}</span>
                  </div>
                  <div class="service-details">
                    <span><strong>Prix unitaire:</strong> ${formatCurrency(item.unitPrice, 'XOF')}</span>
                    <span><strong>Total:</strong> ${formatCurrency(item.totalPrice, 'XOF')}</span>
                  </div>
                  <div class="service-details">
                    <span><strong>Réalisé par:</strong> ${item.performedBy || 'Non spécifié'}</span>
                    ${item.performedAt ? `<span><strong>Heure:</strong> ${new Date(item.performedAt).toLocaleTimeString('fr-FR')}</span>` : ''}
                  </div>
                  ${item.notes ? `<div style="margin-top: 8px;"><strong>Notes:</strong> ${item.notes}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
          
          <div class="total">
            <h3>💰 Coût Total: ${formatCurrency(record.totalCost, 'XOF')}</h3>
          </div>
          
          ${record.notes ? `
            <div class="notes">
              <h3>📝 Notes Générales</h3>
              <p>${record.notes}</p>
            </div>
          ` : ''}

          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>Document généré automatiquement par MediCenter</p>
            <p>© ${new Date().getFullYear()} - Système de Gestion de Centre de Santé</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Soins</h1>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('records')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'records' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Fiches de Soins
            </button>
            <button
              onClick={() => setViewMode('services')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'services' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Services
            </button>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{viewMode === 'records' ? 'Nouvelle Fiche' : 'Nouveau Service'}</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Soins Aujourd'hui</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {state.patientCareRecords.filter(r => r.careDate === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
              <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus Soins</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(state.patientCareRecords.reduce((sum, r) => sum + r.totalCost, 0), 'XOF')}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Patients Traités</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {new Set(state.patientCareRecords.map(r => r.patientId)).size}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
              <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Services Actifs</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {state.careServices.filter(s => s.isActive).length}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-3">
              <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={viewMode === 'records' ? "Rechercher par patient..." : "Rechercher un service..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          {viewMode === 'records' && (
            <div className="flex items-center space-x-4">
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Tous les patients</option>
                {state.patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="planned">Planifié</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          )}
        </div>

        {viewMode === 'records' ? (
          <div className="space-y-6">
            {filteredRecords.map((record) => {
              const patient = state.patients.find(p => p.id === record.patientId);
              const doctor = state.doctors.find(d => d.id === record.doctorId);
              
              return (
                <div key={record.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-3">
                        <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Fiche de soins - {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(record.careDate).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(record.totalCost, 'XOF')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{record.careItems.length} service(s)</p>
                      </div>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="text-sm font-medium">{getStatusText(record.status)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Services réalisés</h4>
                    <div className="space-y-2">
                      {record.careItems.map((item: any) => {
                        const service = state.careServices.find(s => s.id === item.careServiceId);
                        return (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{service?.name || 'Service inconnu'}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Quantité: {item.quantity} • {item.performedBy || 'Non assigné'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.totalPrice, 'XOF')}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.unitPrice, 'XOF')} / unité</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button 
                      onClick={() => handleEdit(record)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </button>
                    <button 
                      onClick={() => handlePrint(record)}
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center space-x-1"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Imprimer</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(record.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucune fiche de soins trouvée</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div key={service.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                    <span className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs px-2 py-1 rounded-full mb-3">
                      {service.category}
                    </span>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(service.unitPrice, 'XOF')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{service.durationMinutes} minutes</span>
                      </div>
                      {service.requiresDoctor && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span className="text-orange-600 dark:text-orange-400">Médecin requis</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                    Modifier
                  </button>
                  <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium">
                    Utiliser
                  </button>
                </div>
              </div>
            ))}

            {filteredServices.length === 0 && (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucun service trouvé</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <CareRecordModal
          careRecord={editingRecord}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Care;
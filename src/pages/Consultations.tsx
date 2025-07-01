import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, Plus, FileText, User, Calendar, Stethoscope, Edit, Trash2, Printer } from 'lucide-react';
import ConsultationModal from '../components/consultations/ConsultationModal';
import { formatCurrency } from '../utils/currency';

const Consultations: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<any>(null);

  const filteredConsultations = state.consultations.filter(consultation => {
    const patient = state.patients.find(p => p.id === consultation.patientId);
    const doctor = state.doctors.find(d => d.id === consultation.doctorId);
    
    return patient && (
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
    ) || doctor && (
      doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleEdit = (consultation: any) => {
    setEditingConsultation(consultation);
    setShowModal(true);
  };

  const handleDelete = (consultationId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
      dispatch({ type: 'DELETE_CONSULTATION', payload: consultationId });
    }
  };

  const handlePrint = (consultation: any) => {
    const patient = state.patients.find(p => p.id === consultation.patientId);
    const doctor = state.doctors.find(d => d.id === consultation.doctorId);
    
    const printContent = `
      <html>
        <head>
          <title>Consultation - ${patient?.firstName} ${patient?.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { color: #2563eb; margin: 0; }
            .patient-info { margin-bottom: 25px; background: #f8f9fa; padding: 15px; border-radius: 8px; }
            .consultation-details { margin-bottom: 25px; }
            .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .section h3 { color: #2563eb; margin-top: 0; }
            .prescription { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 15px; }
            .prescription-item { border-bottom: 1px solid #ccc; padding: 10px 0; }
            .prescription-item:last-child { border-bottom: none; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 MediCenter - Consultation Médicale</h1>
            <p><strong>Date d'impression:</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
          
          <div class="patient-info">
            <h2>📋 Informations Patient</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p><strong>Nom complet:</strong> ${patient?.firstName} ${patient?.lastName}</p>
                <p><strong>Date de consultation:</strong> ${new Date(consultation.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p><strong>Médecin:</strong> ${doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Non assigné'}</p>
                <p><strong>Spécialité:</strong> ${doctor?.specialty || 'Non spécifiée'}</p>
              </div>
            </div>
          </div>
          
          <div class="consultation-details">
            <div class="section">
              <h3>🩺 Symptômes</h3>
              <p>${consultation.symptoms}</p>
            </div>
            
            <div class="section">
              <h3>🔍 Diagnostic</h3>
              <p>${consultation.diagnosis}</p>
            </div>
            
            <div class="section">
              <h3>💊 Traitement</h3>
              <p>${consultation.treatment}</p>
            </div>
            
            ${consultation.prescription && consultation.prescription.length > 0 ? `
              <div class="prescription">
                <h3>📝 Ordonnance</h3>
                ${consultation.prescription.map((prescription: any) => {
                  const medication = state.medications.find(m => m.id === prescription.medicationId);
                  return `
                    <div class="prescription-item">
                      <p><strong>${medication?.name || 'Médicament inconnu'}</strong></p>
                      <p>Dosage: ${prescription.dosage} | Fréquence: ${prescription.frequency} | Durée: ${prescription.duration}</p>
                      ${prescription.instructions ? `<p>Instructions: ${prescription.instructions}</p>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
            
            ${consultation.notes ? `
              <div class="section">
                <h3>📝 Notes</h3>
                <p>${consultation.notes}</p>
              </div>
            ` : ''}
            
            ${consultation.followUpDate ? `
              <div class="section">
                <h3>📅 Suivi</h3>
                <p>Prochaine consultation prévue le: ${new Date(consultation.followUpDate).toLocaleDateString('fr-FR')}</p>
              </div>
            ` : ''}
          </div>

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
    setEditingConsultation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consultations</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle Consultation</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par patient, diagnostic, symptômes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredConsultations.map((consultation) => {
            const patient = state.patients.find(p => p.id === consultation.patientId);
            const doctor = state.doctors.find(d => d.id === consultation.doctorId);
            
            return (
              <div key={consultation.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-2">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {patient && `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} ans`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4" />
                        <span>{doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(consultation.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Symptômes</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{consultation.symptoms}</p>
                        
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Diagnostic</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{consultation.diagnosis}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Traitement</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{consultation.treatment}</p>
                        
                        {consultation.prescription && consultation.prescription.length > 0 && (
                          <>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ordonnance</h4>
                            <div className="space-y-2">
                              {consultation.prescription.map((prescription) => {
                                const medication = state.medications.find(m => m.id === prescription.medicationId);
                                return (
                                  <div key={prescription.id} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                    <div className="font-medium">{medication?.name || 'Médicament inconnu'}</div>
                                    <div>{prescription.dosage} - {prescription.frequency} - {prescription.duration}</div>
                                    {prescription.instructions && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{prescription.instructions}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {consultation.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{consultation.notes}</p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(consultation)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Modifier</span>
                      </button>
                      <button 
                        onClick={() => handlePrint(consultation)}
                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center space-x-1"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Imprimer</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(consultation.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredConsultations.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucune consultation trouvée</p>
          </div>
        )}
      </div>

      {showModal && (
        <ConsultationModal
          consultation={editingConsultation}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Consultations;
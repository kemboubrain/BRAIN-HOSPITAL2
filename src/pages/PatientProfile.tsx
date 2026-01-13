import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ArrowLeft, Edit, Phone, Mail, MapPin, User, Calendar, Heart, Shield, AlertTriangle } from 'lucide-react';
import PatientModal from '../components/patients/PatientModal';

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);

  const patient = state.patients.find(p => p.id === id);
  const patientConsultations = state.consultations.filter(c => c.patientId === id);
  const patientAppointments = state.appointments.filter(a => a.patientId === id);

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient non trouvé</p>
        <Link to="/patients" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          Retour à la liste des patients
        </Link>
      </div>
    );
  }

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-4">
          <Link
            to="/patients"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {patient.firstName} {patient.lastName}
          </h1>
          <button
            onClick={() => setShowEditModal(true)}
            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Modifier</span>
          </button>
        </div>
        {patient.patientCode && (
          <div className="flex items-center space-x-2">
            <span className="bg-blue-50 border border-blue-300 text-blue-700 text-sm font-mono px-3 py-1 rounded-lg font-semibold">
              {patient.patientCode}
            </span>
            <span className="text-sm text-gray-500">Code patient</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations Générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Âge / Sexe</p>
                  <p className="font-medium">{age} ans • {patient.gender === 'M' ? 'Homme' : 'Femme'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Date de naissance</p>
                  <p className="font-medium">
                    {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="font-medium">{patient.address}</p>
                  <p className="text-sm text-gray-500">{patient.postalCode} {patient.city}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Groupe sanguin</p>
                  <p className="font-medium">{patient.bloodGroup || 'Non renseigné'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Historique des consultations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique des Consultations</h2>
            {patientConsultations.length > 0 ? (
              <div className="space-y-4">
                {patientConsultations.map((consultation) => {
                  const doctor = state.doctors.find(d => d.id === consultation.doctorId);
                  return (
                    <div key={consultation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu'}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(consultation.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Diagnostic:</strong> {consultation.diagnosis}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Traitement:</strong> {consultation.treatment}
                      </p>
                      {consultation.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Notes:</strong> {consultation.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune consultation enregistrée</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Informations médicales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations Médicales</h2>
            
            {patient.allergies && patient.allergies !== 'Aucune' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Allergies</span>
                </div>
                <p className="text-sm text-red-700">{patient.allergies}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Groupe sanguin</p>
                <p className="font-medium">{patient.bloodGroup || 'Non renseigné'}</p>
              </div>
            </div>
          </div>

          {/* Contact d'urgence */}
          {patient.emergencyContact.name && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact d'Urgence</h2>
              <div className="space-y-2">
                <p className="font-medium">{patient.emergencyContact.name}</p>
                <p className="text-sm text-gray-600">{patient.emergencyContact.relationship}</p>
                <p className="text-sm text-gray-600">{patient.emergencyContact.phone}</p>
              </div>
            </div>
          )}

          {/* Assurance */}
          {patient.insurance.provider && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Assurance</h2>
              </div>
              <div className="space-y-2">
                <p className="font-medium">{patient.insurance.provider}</p>
                <p className="text-sm text-gray-600">{patient.insurance.number}</p>
              </div>
            </div>
          )}

          {/* Prochains rendez-vous */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Prochains Rendez-vous</h2>
            {patientAppointments.filter(a => new Date(a.date) >= new Date() && a.status !== 'cancelled').length > 0 ? (
              <div className="space-y-3">
                {patientAppointments
                  .filter(a => new Date(a.date) >= new Date() && a.status !== 'cancelled')
                  .map((appointment) => {
                    const doctor = state.doctors.find(d => d.id === appointment.doctorId);
                    return (
                      <div key={appointment.id} className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900">
                          {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu'}
                        </p>
                        <p className="text-sm text-blue-700">
                          {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                        </p>
                        <p className="text-sm text-blue-600">{appointment.reason}</p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun rendez-vous programmé</p>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <PatientModal
          patient={patient}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default PatientProfile;
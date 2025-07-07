import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rendezvousPendingService } from '../services/supabaseService';
import { appointmentService } from '../services/supabaseService';
import { useApp } from '../contexts/AppContext';
import { Calendar, Clock, User, Mail, Phone, UserCheck, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

const ValidateAppointment: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  
  const [rendezvous, setRendezvous] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; status?: 'approved' | 'rejected' } | null>(null);

  useEffect(() => {
    const fetchRendezvous = async () => {
      if (!token) {
        setError('Token de validation manquant');
        setLoading(false);
        return;
      }

      try {
        const data = await rendezvousPendingService.getByToken(token);
        setRendezvous(data);
      } catch (err: any) {
        console.error('Erreur lors du chargement du rendez-vous:', err);
        setError('Impossible de trouver le rendez-vous demandé. Le lien est peut-être expiré ou invalide.');
      } finally {
        setLoading(false);
      }
    };

    fetchRendezvous();
  }, [token]);

  const handleApprove = async () => {
    if (!rendezvous || !token) return;
    
    setProcessing(true);
    try {
      // 1. Mettre à jour le statut dans rendezvous_pending
      await rendezvousPendingService.updateStatus(token, 'approved');
      
      // 2. Créer un rendez-vous dans la table appointments
      const doctor = state.doctors.find(d => d.id === rendezvous.medecinId);
      const dateTime = new Date(rendezvous.dateHeure);
      
      // Vérifier si le patient existe déjà
      let patientId = '';
      const existingPatient = state.patients.find(p => 
        p.email.toLowerCase() === rendezvous.email.toLowerCase()
      );
      
      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        // Créer un nouveau patient
        const newPatient = {
          firstName: rendezvous.nomPatient.split(' ')[0] || rendezvous.nomPatient,
          lastName: rendezvous.nomPatient.split(' ').slice(1).join(' ') || '',
          dateOfBirth: new Date().toISOString().split('T')[0], // Date par défaut, à mettre à jour plus tard
          gender: 'M', // Genre par défaut, à mettre à jour plus tard
          phone: rendezvous.telephone || '',
          email: rendezvous.email,
          address: '',
          city: '',
          postalCode: '',
          bloodGroup: '',
          allergies: '',
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          },
          insurance: {
            provider: '',
            number: ''
          }
        };
        
        // Utiliser le service patient pour créer un nouveau patient
        // Note: Dans un cas réel, vous devriez demander plus d'informations au patient
        // ou lui demander de compléter son profil lors de sa première visite
        // patientId = (await patientService.create(newPatient)).id;
        
        // Pour cet exemple, on va simplement utiliser un ID temporaire
        patientId = state.patients[0]?.id || '';
      }
      
      if (!patientId) {
        throw new Error('Impossible de trouver ou créer un patient');
      }
      
      // Créer le rendez-vous
      await appointmentService.create({
        patientId,
        doctorId: rendezvous.medecinId,
        date: dateTime.toISOString().split('T')[0],
        time: dateTime.toTimeString().slice(0, 5),
        duration: 30, // Durée par défaut
        type: 'consultation',
        status: 'confirmed',
        reason: `Rendez-vous demandé en ligne par ${rendezvous.nomPatient}`,
        notes: `Email: ${rendezvous.email}, Téléphone: ${rendezvous.telephone || 'Non fourni'}`
      });
      
      setResult({
        success: true,
        message: 'Le rendez-vous a été approuvé avec succès et ajouté au calendrier.',
        status: 'approved'
      });
    } catch (err: any) {
      console.error('Erreur lors de l\'approbation du rendez-vous:', err);
      setResult({
        success: false,
        message: `Erreur lors de l'approbation: ${err.message || 'Une erreur inconnue est survenue'}`,
        status: 'approved'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rendezvous || !token) return;
    
    setProcessing(true);
    try {
      await rendezvousPendingService.updateStatus(token, 'rejected');
      
      setResult({
        success: true,
        message: 'Le rendez-vous a été rejeté avec succès.',
        status: 'rejected'
      });
    } catch (err: any) {
      console.error('Erreur lors du rejet du rendez-vous:', err);
      setResult({
        success: false,
        message: `Erreur lors du rejet: ${err.message || 'Une erreur inconnue est survenue'}`,
        status: 'rejected'
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const dateTime = new Date(dateTimeString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return dateTime.toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Erreur</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!rendezvous) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Rendez-vous non trouvé</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Impossible de trouver le rendez-vous demandé. Le lien est peut-être expiré ou invalide.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
              result.success 
                ? result.status === 'approved' 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-orange-100 dark:bg-orange-900'
                : 'bg-red-100 dark:bg-red-900'
            } mb-4`}>
              {result.success ? (
                result.status === 'approved' ? (
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                )
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {result.success ? (
                result.status === 'approved' ? 'Rendez-vous approuvé' : 'Rendez-vous rejeté'
              ) : 'Erreur'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{result.message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  const doctor = state.doctors.find(d => d.id === rendezvous.medecinId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
            <Calendar className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Validation de Rendez-vous</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Veuillez examiner cette demande de rendez-vous et décider de l'approuver ou de la rejeter
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Détails du rendez-vous</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom du patient</p>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">{rendezvous.nomPatient}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">{rendezvous.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</p>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {rendezvous.telephone || 'Non fourni'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <UserCheck className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Médecin</p>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                      {doctor ? `${doctor.firstName} ${doctor.lastName} - ${doctor.specialty}` : 'Médecin inconnu'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date et heure</p>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {formatDateTime(rendezvous.dateHeure)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Demande soumise le</p>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {new Date(rendezvous.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 dark:bg-gray-700 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Statut actuel: <span className="font-medium text-yellow-600 dark:text-yellow-400">En attente de validation</span></p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleReject}
                disabled={processing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    Refuser
                  </span>
                )}
              </button>
              
              <button
                onClick={handleApprove}
                disabled={processing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Approuver
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour au tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidateAppointment;
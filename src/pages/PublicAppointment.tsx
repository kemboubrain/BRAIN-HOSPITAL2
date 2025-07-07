import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { rendezvousPendingService } from '../services/supabaseService';
import { Calendar, Clock, User, Mail, Phone, UserCheck, Send, AlertTriangle, CheckCircle } from 'lucide-react';

const PublicAppointment: React.FC = () => {
  const [formData, setFormData] = useState({
    nomPatient: '',
    email: '',
    telephone: '',
    medecinId: '',
    date: '',
    time: ''
  });
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    // Charger la liste des médecins
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('id, first_name, last_name, specialty, schedule')
          .order('last_name', { ascending: true });
        
        if (error) throw error;
        
        setDoctors(data || []);
      } catch (err: any) {
        console.error('Erreur lors du chargement des médecins:', err);
        setError('Impossible de charger la liste des médecins. Veuillez réessayer plus tard.');
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    // Générer les créneaux horaires disponibles en fonction du médecin et de la date sélectionnés
    if (formData.medecinId && formData.date) {
      const selectedDoctor = doctors.find(d => d.id === formData.medecinId);
      if (selectedDoctor) {
        const dayOfWeek = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'lowercase' });
        const schedule = selectedDoctor.schedule[dayOfWeek];
        
        if (schedule && schedule.available) {
          // Générer des créneaux de 30 minutes entre l'heure de début et de fin
          const startTime = schedule.start;
          const endTime = schedule.end;
          
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);
          
          const startDate = new Date();
          startDate.setHours(startHour, startMinute, 0);
          
          const endDate = new Date();
          endDate.setHours(endHour, endMinute, 0);
          
          const times = [];
          let currentTime = new Date(startDate);
          
          while (currentTime < endDate) {
            times.push(
              `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`
            );
            currentTime.setMinutes(currentTime.getMinutes() + 30);
          }
          
          setAvailableTimes(times);
        } else {
          setAvailableTimes([]);
        }
      }
    } else {
      setAvailableTimes([]);
    }
  }, [formData.medecinId, formData.date, doctors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Vérifier que tous les champs obligatoires sont remplis
      if (!formData.nomPatient || !formData.email || !formData.medecinId || !formData.date || !formData.time) {
        throw new Error('Veuillez remplir tous les champs obligatoires.');
      }
      
      // Vérifier que l'email est valide
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Veuillez entrer une adresse email valide.');
      }
      
      // Créer le rendez-vous en attente
      const dateHeure = new Date(`${formData.date}T${formData.time}`);
      
      await rendezvousPendingService.create({
        nomPatient: formData.nomPatient,
        email: formData.email,
        telephone: formData.telephone,
        medecinId: formData.medecinId,
        dateHeure: dateHeure.toISOString()
      });
      
      // Réinitialiser le formulaire et afficher un message de succès
      setFormData({
        nomPatient: '',
        email: '',
        telephone: '',
        medecinId: '',
        date: '',
        time: ''
      });
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Erreur lors de la soumission du formulaire:', err);
      setError(err.message || 'Une erreur est survenue lors de la soumission du formulaire. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = dimanche, 6 = samedi
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
            <Calendar className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prendre Rendez-vous</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Remplissez le formulaire ci-dessous pour demander un rendez-vous avec l'un de nos médecins
          </p>
        </div>

        {success ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Demande envoyée avec succès !</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Votre demande de rendez-vous a été enregistrée. Nous vous contacterons bientôt pour confirmer votre rendez-vous.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Prendre un autre rendez-vous
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
            {error && (
              <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                  <span className="text-red-800 dark:text-red-400">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nomPatient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom complet *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="nomPatient"
                    id="nomPatient"
                    value={formData.nomPatient}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="Prénom et Nom"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adresse e-mail *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="exemple@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Numéro de téléphone
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="telephone"
                    id="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="+225 07 XX XX XX XX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="medecinId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Médecin *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="medecinId"
                    id="medecinId"
                    value={formData.medecinId}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Sélectionner un médecin</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.first_name} {doctor.last_name} - {doctor.specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {formData.date && isWeekend(new Date(formData.date)) && (
                    <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                      Attention : vous avez sélectionné un jour de week-end. Vérifiez la disponibilité du médecin.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Heure *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="time"
                      id="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      disabled={availableTimes.length === 0}
                      className="pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    >
                      <option value="">Sélectionner une heure</option>
                      {availableTimes.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  {formData.medecinId && formData.date && availableTimes.length === 0 && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      Aucun créneau disponible pour cette date. Veuillez sélectionner une autre date.
                    </p>
                  )}
                </div>
              </div>

              {formData.date && formData.medecinId && formData.time && (
                <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">Récapitulatif</h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    Vous demandez un rendez-vous avec{' '}
                    <span className="font-medium">
                      {doctors.find(d => d.id === formData.medecinId)?.first_name} {doctors.find(d => d.id === formData.medecinId)?.last_name}
                    </span>{' '}
                    le{' '}
                    <span className="font-medium">
                      {formatDate(formData.date)}
                    </span>{' '}
                    à{' '}
                    <span className="font-medium">{formData.time}</span>.
                  </p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Traitement en cours...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="h-5 w-5 mr-2" />
                      Soumettre la demande
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vous avez déjà un rendez-vous ? Contactez-nous au <span className="font-medium">+225 07 59 27 88 22</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicAppointment;
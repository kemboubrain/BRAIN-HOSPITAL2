import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Activity, MapPin, Clock, Phone, Mail, Calendar, User, Send, AlertCircle, CheckCircle } from 'lucide-react';

const Home: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nomPatient: '',
    email: '',
    telephone: '',
    medecinId: '',
    date: '',
    time: ''
  });
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
      
      const { data, error } = await supabase
        .from('rendezvous_pending')
        .insert({
          nom_patient: formData.nomPatient,
          email: formData.email,
          telephone: formData.telephone || '',
          medecin_id: formData.medecinId,
          date_heure: dateHeure.toISOString()
        })
        .select();
      
      if (error) throw error;
      
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

  const services = [
    { name: 'Consultations médicales', description: 'Consultations avec nos médecins spécialistes', icon: User },
    { name: 'Urgences 24/7', description: 'Service d\'urgence disponible 24h/24 et 7j/7', icon: AlertCircle },
    { name: 'Imagerie médicale', description: 'Radiographie, échographie, scanner, IRM', icon: Activity },
    { name: 'Laboratoire d\'analyses', description: 'Analyses sanguines et autres examens', icon: Activity },
    { name: 'Pharmacie', description: 'Médicaments et produits de santé', icon: Activity },
    { name: 'Hospitalisation', description: 'Chambres confortables et équipées', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 z-0" 
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)'
          }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent z-10"></div>
        
        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-20">
          <nav className="absolute top-0 left-0 right-0 py-6 px-4 md:px-8 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">BRAIN HOSPITAL</h1>
                <p className="text-sm text-blue-100">Centre Médical d'Excellence</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6 text-white">
              <a href="#services" className="hover:text-blue-300 transition-colors">Services</a>
              <a href="#about" className="hover:text-blue-300 transition-colors">À propos</a>
              <a href="#appointment" className="hover:text-blue-300 transition-colors">Rendez-vous</a>
              <a href="#contact" className="hover:text-blue-300 transition-colors">Contact</a>
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                Connexion
              </Link>
            </div>
            
            <div className="md:hidden">
              <button className="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </nav>
          
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fadeIn">
              Excellence en soins de santé
            </h1>
            <p className="text-xl text-white/90 mb-8 animate-fadeIn">
              Avec une équipe médicale dévouée et des technologies de pointe, nous offrons des soins de qualité supérieure pour votre bien-être.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fadeIn">
              <a 
                href="#appointment" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-center font-medium transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Prendre rendez-vous
              </a>
              <a 
                href="#services" 
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg text-center font-medium transition-all duration-300 transform hover:-translate-y-1"
              >
                Nos services
              </a>
            </div>
          </div>
          
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <a 
              href="#services" 
              className="animate-bounce bg-white/10 backdrop-blur-sm p-2 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nos Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nous offrons une gamme complète de services médicaux pour répondre à tous vos besoins de santé.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group"
                >
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                    <Icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.name}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Équipe médicale" 
                  className="rounded-xl shadow-lg"
                />
                <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-xl shadow-lg">
                  <p className="text-3xl font-bold">15+</p>
                  <p className="text-sm">Années d'expérience</p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">À propos de BRAIN HOSPITAL</h2>
              <p className="text-lg text-gray-600 mb-6">
                Fondé en 2010, BRAIN HOSPITAL est devenu un centre médical de référence en Côte d'Ivoire. Notre mission est de fournir des soins de santé de qualité supérieure, accessibles à tous.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Avec une équipe de médecins spécialistes et un personnel soignant dévoué, nous mettons à votre disposition des équipements médicaux de dernière génération pour assurer votre bien-être.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Équipe qualifiée</h3>
                    <p className="text-gray-600">Médecins spécialistes et personnel soignant expérimenté</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Équipements modernes</h3>
                    <p className="text-gray-600">Technologies médicales de pointe pour des diagnostics précis</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Soins personnalisés</h3>
                    <p className="text-gray-600">Approche centrée sur le patient et ses besoins spécifiques</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Urgences 24/7</h3>
                    <p className="text-gray-600">Service d'urgence disponible en permanence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Appointment Section */}
      <section id="appointment" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Prendre Rendez-vous</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Remplissez le formulaire ci-dessous pour demander un rendez-vous avec l'un de nos médecins spécialistes.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {success ? (
              <div className="bg-white shadow-lg rounded-xl p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Demande envoyée avec succès !</h3>
                <p className="text-gray-600 mb-6">
                  Votre demande de rendez-vous a été enregistrée. Nous vous contacterons bientôt pour confirmer votre rendez-vous.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Prendre un autre rendez-vous
                </button>
              </div>
            ) : (
              <div className="bg-white shadow-lg rounded-xl p-8">
                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                      <span className="text-red-800">{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="nomPatient" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <div className="relative">
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
                        className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-lg"
                        placeholder="Prénom et Nom"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse e-mail *
                    </label>
                    <div className="relative">
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
                        className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-lg"
                        placeholder="exemple@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de téléphone WhatsApp
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="telephone"
                        id="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-lg"
                        placeholder="+225 07 XX XX XX XX"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="medecinId" className="block text-sm font-medium text-gray-700 mb-2">
                      Médecin *
                    </label>
                    <select
                      name="medecinId"
                      id="medecinId"
                      value={formData.medecinId}
                      onChange={handleChange}
                      required
                      className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-lg"
                    >
                      <option value="">Sélectionner un médecin</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.first_name} {doctor.last_name} - {doctor.specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                        Date *
                      </label>
                      <div className="relative">
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
                          className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-lg"
                        />
                      </div>
                      {formData.date && isWeekend(new Date(formData.date)) && (
                        <p className="mt-1 text-sm text-orange-600">
                          Attention : vous avez sélectionné un jour de week-end. Vérifiez la disponibilité du médecin.
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                        Heure *
                      </label>
                      <select
                        name="time"
                        id="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        disabled={availableTimes.length === 0}
                        className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-lg disabled:opacity-50"
                      >
                        <option value="">Sélectionner une heure</option>
                        {availableTimes.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      {formData.medecinId && formData.date && availableTimes.length === 0 && (
                        <p className="mt-1 text-sm text-red-600">
                          Aucun créneau disponible pour cette date. Veuillez sélectionner une autre date.
                        </p>
                      )}
                    </div>
                  </div>

                  {formData.date && formData.medecinId && formData.time && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <h3 className="text-sm font-medium text-blue-800 mb-2">Récapitulatif</h3>
                      <p className="text-blue-700">
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
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Contactez-nous</h2>
              <p className="text-lg text-gray-600 mb-8">
                Vous avez des questions ou besoin d'informations supplémentaires ? N'hésitez pas à nous contacter.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3 mt-1">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-600">Cocody - Vallon, Abidjan, Côte d'Ivoire</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3 mt-1">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                    <p className="text-gray-600">+225 07 59 27 88 22</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3 mt-1">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">braincobusiness@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3 mt-1">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Horaires d'ouverture</h3>
                    <p className="text-gray-600">Lundi - Vendredi: 8h00 - 18h00</p>
                    <p className="text-gray-600">Samedi: 8h00 - 12h00</p>
                    <p className="text-gray-600">Urgences: 24h/24, 7j/7</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="h-96 rounded-xl overflow-hidden shadow-lg">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15887.347576208842!2d-3.9941396!3d5.3493246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc1eb8dd8b96725%3A0x5e4423b2b6ec4b57!2sCocody%20Vallon%2C%20Abidjan!5e0!3m2!1sfr!2sci!4v1688654321098!5m2!1sfr!2sci" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white/10 p-2 rounded-full">
                  <Activity className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">BRAIN HOSPITAL</h3>
                  <p className="text-sm text-gray-400">Centre Médical d'Excellence</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Excellence en soins de santé avec une équipe médicale dévouée et des technologies de pointe.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Accueil</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">À propos</a></li>
                <li><a href="#appointment" className="text-gray-400 hover:text-white transition-colors">Rendez-vous</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Consultations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Urgences</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Imagerie médicale</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Laboratoire</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Hospitalisation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
                  <span className="text-gray-400">Cocody - Vallon, Abidjan, Côte d'Ivoire</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-blue-400 mt-0.5" />
                  <span className="text-gray-400">+225 07 59 27 88 22</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                  <span className="text-gray-400">braincobusiness@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} BRAIN HOSPITAL. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
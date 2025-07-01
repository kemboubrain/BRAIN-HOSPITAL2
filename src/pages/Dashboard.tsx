import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import RevenueChart from '../components/dashboard/RevenueChart';
import AppointmentsChart from '../components/dashboard/AppointmentsChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';
import { Activity, MapPin, Clock, Phone, Calendar, Users, FileText, Heart, Building2, Download, Printer } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  // Format time as HH:MM:SS
  const formattedTime = currentTime.toLocaleTimeString('fr-FR');
  // Format date as Day, DD Month YYYY
  const formattedDate = currentTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-xl shadow-lg overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-secondary-900/80">
          {/* This div serves as a dark overlay on top of the background image */}
        </div>
        
        {/* Background image */}
        <div 
          className="absolute inset-0 z-[-1]" 
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.5)'
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Activity className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">BRAIN HOSPITAL</h1>
                  <p className="text-blue-100">Centre Médical d'Excellence</p>
                </div>
              </div>
              <p className="text-xl font-light mb-2">Bienvenue dans votre système de gestion hospitalière</p>
              <p className="text-blue-100">Développé par BRAIN en Côte d'Ivoire</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-center">
                <p className="text-3xl font-bold">{formattedTime}</p>
                <p className="text-sm capitalize">{formattedDate}</p>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-200" />
                  <span>Cocody - Vallon, Abidjan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-200" />
                  <span>Ouvert 24/7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-200" />
                  <span>+225 07 59 27 88 22</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tableau de bord</h2>
        <div className="flex space-x-2">
          <button className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </button>
          <button className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      <DashboardStats stats={state.dashboardStats} />

      {/* Services Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-lime-100 dark:bg-lime-900/20 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-lime-600 dark:text-lime-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nos Services</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Consultations</span>
              <span className="text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 px-2 py-1 rounded-full">24/7</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Urgences</span>
              <span className="text-sm bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-2 py-1 rounded-full">24/7</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Laboratoire</span>
              <span className="text-sm bg-secondary-100 dark:bg-secondary-900/20 text-secondary-800 dark:text-secondary-400 px-2 py-1 rounded-full">7j/7</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Pharmacie</span>
              <span className="text-sm bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-full">24/7</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Hospitalisation</span>
              <span className="text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 px-2 py-1 rounded-full">Disponible</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-secondary-100 dark:bg-secondary-900/20 p-3 rounded-full">
                <Users className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notre Équipe</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Médecins</h3>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{state.doctors.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Spécialistes qualifiés</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Infirmiers</h3>
                <p className="text-3xl font-bold text-secondary-600 dark:text-secondary-400">15</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Personnel soignant</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Support</h3>
                <p className="text-3xl font-bold text-lime-600 dark:text-lime-400">8</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Personnel administratif</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Spécialités disponibles</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 px-3 py-1 rounded-full text-sm">Médecine Générale</span>
                <span className="bg-secondary-100 dark:bg-secondary-900/20 text-secondary-800 dark:text-secondary-400 px-3 py-1 rounded-full text-sm">Cardiologie</span>
                <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-3 py-1 rounded-full text-sm">Pédiatrie</span>
                <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 px-3 py-1 rounded-full text-sm">Gynécologie</span>
                <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-3 py-1 rounded-full text-sm">Chirurgie</span>
                <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 px-3 py-1 rounded-full text-sm">Dermatologie</span>
                <span className="bg-lime-100 dark:bg-lime-900/20 text-lime-800 dark:text-lime-400 px-3 py-1 rounded-full text-sm">Ophtalmologie</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <AppointmentsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">© 2025 BRAIN HOSPITAL - Tous droits réservés</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Développé par BRAIN en Côte d'Ivoire</p>
      </div>
    </div>
  );
};

export default Dashboard;
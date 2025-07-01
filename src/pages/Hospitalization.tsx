import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, Plus, Building2, User, Calendar, DollarSign, Bed, MapPin, Clock, CheckCircle, AlertCircle, Edit, Trash2, Printer, Settings, Eye } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import HospitalizationModal from '../components/hospitalization/HospitalizationModal';
import RoomModal from '../components/hospitalization/RoomModal';
import BedManagementModal from '../components/hospitalization/BedManagementModal';

const Hospitalization: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'hospitalizations' | 'rooms' | 'beds'>('hospitalizations');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);
  const [editingHospitalization, setEditingHospitalization] = useState<any>(null);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  // Données simulées pour les chambres avec lits
  const rooms = [
    { 
      id: '1', 
      roomNumber: '101', 
      roomType: 'standard', 
      bedCount: 2, 
      dailyRate: 15000, 
      floorNumber: 1, 
      amenities: ['Climatisation', 'Télévision'],
      beds: [
        { id: 'bed-1-1', roomId: '1', bedNumber: '101-1', status: 'available', isOccupied: false, currentPatientId: null },
        { id: 'bed-1-2', roomId: '1', bedNumber: '101-2', status: 'available', isOccupied: false, currentPatientId: null }
      ]
    },
    { 
      id: '2', 
      roomNumber: '102', 
      roomType: 'standard', 
      bedCount: 2, 
      dailyRate: 15000, 
      floorNumber: 1, 
      amenities: ['Climatisation', 'Télévision'],
      beds: [
        { id: 'bed-2-1', roomId: '2', bedNumber: '102-1', status: 'available', isOccupied: false, currentPatientId: null },
        { id: 'bed-2-2', roomId: '2', bedNumber: '102-2', status: 'occupied', isOccupied: true, currentPatientId: '550e8400-e29b-41d4-a716-446655440004' }
      ]
    },
    { 
      id: '3', 
      roomNumber: '103', 
      roomType: 'private', 
      bedCount: 1, 
      dailyRate: 25000, 
      floorNumber: 1, 
      amenities: ['Climatisation', 'Télévision', 'Réfrigérateur', 'Salle de bain privée'],
      beds: [
        { id: 'bed-3-1', roomId: '3', bedNumber: '103-1', status: 'occupied', isOccupied: true, currentPatientId: '550e8400-e29b-41d4-a716-446655440002' }
      ]
    },
    { 
      id: '4', 
      roomNumber: '104', 
      roomType: 'private', 
      bedCount: 1, 
      dailyRate: 25000, 
      floorNumber: 1, 
      amenities: ['Climatisation', 'Télévision', 'Réfrigérateur', 'Salle de bain privée'],
      beds: [
        { id: 'bed-4-1', roomId: '4', bedNumber: '104-1', status: 'available', isOccupied: false, currentPatientId: null }
      ]
    },
    { 
      id: '5', 
      roomNumber: '201', 
      roomType: 'vip', 
      bedCount: 1, 
      dailyRate: 50000, 
      floorNumber: 2, 
      amenities: ['Climatisation', 'Télévision', 'Réfrigérateur', 'Salle de bain privée', 'Canapé', 'WiFi'],
      beds: [
        { id: 'bed-5-1', roomId: '5', bedNumber: '201-1', status: 'available', isOccupied: false, currentPatientId: null }
      ]
    },
    { 
      id: '6', 
      roomNumber: '202', 
      roomType: 'vip', 
      bedCount: 1, 
      dailyRate: 50000, 
      floorNumber: 2, 
      amenities: ['Climatisation', 'Télévision', 'Réfrigérateur', 'Salle de bain privée', 'Canapé', 'WiFi'],
      beds: [
        { id: 'bed-6-1', roomId: '6', bedNumber: '202-1', status: 'available', isOccupied: false, currentPatientId: null }
      ]
    },
    { 
      id: '7', 
      roomNumber: '301', 
      roomType: 'icu', 
      bedCount: 1, 
      dailyRate: 75000, 
      floorNumber: 3, 
      amenities: ['Monitoring cardiaque', 'Ventilateur', 'Défibrillateur'],
      beds: [
        { id: 'bed-7-1', roomId: '7', bedNumber: '301-1', status: 'available', isOccupied: false, currentPatientId: null }
      ]
    },
    { 
      id: '8', 
      roomNumber: '302', 
      roomType: 'icu', 
      bedCount: 1, 
      dailyRate: 75000, 
      floorNumber: 3, 
      amenities: ['Monitoring cardiaque', 'Ventilateur', 'Défibrillateur'],
      beds: [
        { id: 'bed-8-1', roomId: '8', bedNumber: '302-1', status: 'available', isOccupied: false, currentPatientId: null }
      ]
    }
  ];

  // Données simulées pour les hospitalisations
  const hospitalizations = [
    {
      id: '1',
      patientId: '550e8400-e29b-41d4-a716-446655440002',
      doctorId: '660e8400-e29b-41d4-a716-446655440002',
      roomId: '3',
      bedId: 'bed-3-1',
      admissionDate: '2024-02-10T08:30:00',
      admissionReason: 'Surveillance post-infarctus',
      status: 'active',
      dailyCost: 25000,
      totalCost: 125000,
      emergencyAdmission: true,
      services: [
        { serviceName: 'Monitoring cardiaque', quantity: 5, unitPrice: 5000, totalPrice: 25000, performedBy: 'Équipe soins intensifs' },
        { serviceName: 'Électrocardiogramme', quantity: 3, unitPrice: 15000, totalPrice: 45000, performedBy: 'Cardiologue' }
      ]
    },
    {
      id: '2',
      patientId: '550e8400-e29b-41d4-a716-446655440004',
      doctorId: '660e8400-e29b-41d4-a716-446655440001',
      roomId: '2',
      bedId: 'bed-2-2',
      admissionDate: '2024-02-12T14:00:00',
      admissionReason: 'Observation post-opératoire',
      status: 'active',
      dailyCost: 15000,
      totalCost: 45000,
      emergencyAdmission: false,
      services: [
        { serviceName: 'Pansement complexe', quantity: 6, unitPrice: 5000, totalPrice: 30000, performedBy: 'Infirmière chef' },
        { serviceName: 'Injection antalgique', quantity: 8, unitPrice: 2000, totalPrice: 16000, performedBy: 'Équipe soignante' }
      ]
    }
  ];

  const filteredHospitalizations = hospitalizations.filter(hospitalization => {
    const patient = state.patients.find(p => p.id === hospitalization.patientId);
    const matchesSearch = patient && (
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = filterStatus === 'all' || hospitalization.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredRooms = rooms.filter(room =>
    room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.roomType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allBeds = rooms.flatMap(room => 
    room.beds.map(bed => ({
      ...bed,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      dailyRate: room.dailyRate
    }))
  );

  const filteredBeds = allBeds.filter(bed =>
    bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bed.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bed.currentPatientId && state.patients.find(p => p.id === bed.currentPatientId)?.firstName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'standard':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'private':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'vip':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'icu':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'emergency':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoomTypeText = (type: string) => {
    switch (type) {
      case 'standard':
        return 'Standard';
      case 'private':
        return 'Privée';
      case 'vip':
        return 'VIP';
      case 'icu':
        return 'Soins Intensifs';
      case 'emergency':
        return 'Urgence';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'discharged':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'transferred':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'discharged':
        return 'Sorti';
      case 'transferred':
        return 'Transféré';
      default:
        return status;
    }
  };

  const getBedStatusColor = (status: string) => {
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

  const getBedStatusText = (status: string) => {
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

  const calculateStayDuration = (admissionDate: string) => {
    const admission = new Date(admissionDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - admission.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleEdit = (hospitalization: any) => {
    setEditingHospitalization(hospitalization);
    setShowModal(true);
  };

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
    setShowRoomModal(true);
  };

  const handleManageBeds = (room: any) => {
    setSelectedRoom(room);
    setShowBedModal(true);
  };

  const handleDelete = (hospitalizationId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette hospitalisation ?')) {
      dispatch({ type: 'DELETE_HOSPITALIZATION', payload: hospitalizationId });
    }
  };

  const handlePrint = (hospitalization: any) => {
    const patient = state.patients.find(p => p.id === hospitalization.patientId);
    const doctor = state.doctors.find(d => d.id === hospitalization.doctorId);
    const room = rooms.find(r => r.id === hospitalization.roomId);
    const bed = room?.beds.find(b => b.id === hospitalization.bedId);
    
    const printContent = `
      <html>
        <head>
          <title>Dossier Hospitalisation - ${patient?.firstName} ${patient?.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { color: #2563eb; margin: 0; }
            .patient-info { margin-bottom: 25px; background: #f8f9fa; padding: 15px; border-radius: 8px; }
            .hospitalization-details { margin-bottom: 25px; }
            .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .section h3 { color: #2563eb; margin-top: 0; }
            .services { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 15px; }
            .service-item { border-bottom: 1px solid #ccc; padding: 10px 0; }
            .service-item:last-child { border-bottom: none; }
            .total { font-weight: bold; font-size: 18px; text-align: right; background: #e8f5e8; padding: 15px; border-radius: 8px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 MediCenter - Dossier d'Hospitalisation</h1>
            <p><strong>Date d'impression:</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
          
          <div class="patient-info">
            <h2>📋 Informations Patient</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p><strong>Nom complet:</strong> ${patient?.firstName} ${patient?.lastName}</p>
                <p><strong>Date d'admission:</strong> ${new Date(hospitalization.admissionDate).toLocaleDateString('fr-FR')} à ${new Date(hospitalization.admissionDate).toLocaleTimeString('fr-FR')}</p>
                <p><strong>Durée du séjour:</strong> ${calculateStayDuration(hospitalization.admissionDate)} jour(s)</p>
              </div>
              <div>
                <p><strong>Médecin responsable:</strong> ${doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Non assigné'}</p>
                <p><strong>Chambre:</strong> ${room?.roomNumber} - Lit ${bed?.bedNumber} (${room ? getRoomTypeText(room.roomType) : 'Non spécifiée'})</p>
                <p><strong>Statut:</strong> ${getStatusText(hospitalization.status)}</p>
              </div>
            </div>
          </div>
          
          <div class="hospitalization-details">
            <div class="section">
              <h3>🏥 Motif d'admission</h3>
              <p>${hospitalization.admissionReason}</p>
              ${hospitalization.emergencyAdmission ? '<p><strong>⚠️ Admission d\'urgence</strong></p>' : ''}
            </div>
            
            ${hospitalization.services && hospitalization.services.length > 0 ? `
              <div class="services">
                <h3>🩺 Services Réalisés</h3>
                ${hospitalization.services.map((service: any) => `
                  <div class="service-item">
                    <p><strong>${service.serviceName}</strong></p>
                    <p>Quantité: ${service.quantity} | Prix unitaire: ${formatCurrency(service.unitPrice, 'XOF')} | Total: ${formatCurrency(service.totalPrice, 'XOF')}</p>
                    <p>Réalisé par: ${service.performedBy}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          
          <div class="total">
            <h3>💰 Coût Total: ${formatCurrency(hospitalization.totalCost, 'XOF')}</h3>
            <p>Coût journalier: ${formatCurrency(hospitalization.dailyCost, 'XOF')}</p>
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
    setEditingHospitalization(null);
  };

  const closeRoomModal = () => {
    setShowRoomModal(false);
    setEditingRoom(null);
  };

  const closeBedModal = () => {
    setShowBedModal(false);
    setSelectedRoom(null);
  };

  const getPatientName = (patientId: string) => {
    const patient = state.patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  };

  const totalBeds = rooms.reduce((sum, room) => sum + room.bedCount, 0);
  const occupiedBeds = allBeds.filter(bed => bed.isOccupied).length;
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion Hospitalisation</h1>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('hospitalizations')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'hospitalizations' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Hospitalisations
            </button>
            <button
              onClick={() => setViewMode('rooms')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'rooms' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Chambres
            </button>
            <button
              onClick={() => setViewMode('beds')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'beds' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Lits
            </button>
          </div>
          <button 
            onClick={() => {
              if (viewMode === 'hospitalizations') setShowModal(true);
              else if (viewMode === 'rooms') setShowRoomModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>
              {viewMode === 'hospitalizations' ? 'Nouvelle Admission' : 
               viewMode === 'rooms' ? 'Nouvelle Chambre' : 'Gérer Lits'}
            </span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Patients Hospitalisés</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{hospitalizations.filter(h => h.status === 'active').length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lits Disponibles</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{availableBeds}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
              <Bed className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lits Occupés</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{occupiedBeds}</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-3">
              <User className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux d'Occupation</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{occupancyRate}%</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
              <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus Hospitalisation</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(170000, 'XOF')}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                placeholder={
                  viewMode === 'hospitalizations' ? "Rechercher par patient..." :
                  viewMode === 'rooms' ? "Rechercher une chambre..." :
                  "Rechercher un lit..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          {viewMode === 'hospitalizations' && (
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="discharged">Sorti</option>
                <option value="transferred">Transféré</option>
              </select>
            </div>
          )}
        </div>

        {viewMode === 'hospitalizations' && (
          <div className="space-y-6">
            {filteredHospitalizations.map((hospitalization) => {
              const patient = state.patients.find(p => p.id === hospitalization.patientId);
              const doctor = state.doctors.find(d => d.id === hospitalization.doctorId);
              const room = rooms.find(r => r.id === hospitalization.roomId);
              const bed = room?.beds.find(b => b.id === hospitalization.bedId);
              const stayDuration = calculateStayDuration(hospitalization.admissionDate);
              
              return (
                <div key={hospitalization.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-3">
                        <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>Chambre {room?.roomNumber} - Lit {bed?.bedNumber}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(hospitalization.admissionDate).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(hospitalization.totalCost, 'XOF')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stayDuration} jour(s)</p>
                      </div>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(hospitalization.status)}`}>
                        <span className="text-sm font-medium">{getStatusText(hospitalization.status)}</span>
                      </div>
                      {hospitalization.emergencyAdmission && (
                        <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-2 py-1 rounded-full">
                          <span className="text-xs font-medium">URGENCE</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Informations d'admission</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p><strong>Motif:</strong> {hospitalization.admissionReason}</p>
                        <p><strong>Type de chambre:</strong> {room && getRoomTypeText(room.roomType)}</p>
                        <p><strong>Coût journalier:</strong> {formatCurrency(hospitalization.dailyCost, 'XOF')}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Services durant le séjour</h4>
                      <div className="space-y-2">
                        {hospitalization.services.slice(0, 3).map((service, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{service.serviceName} (x{service.quantity})</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(service.totalPrice, 'XOF')}</span>
                          </div>
                        ))}
                        {hospitalization.services.length > 3 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">+{hospitalization.services.length - 3} autres services</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button 
                      onClick={() => handleEdit(hospitalization)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </button>
                    <button 
                      onClick={() => handlePrint(hospitalization)}
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center space-x-1"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Imprimer</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(hospitalization.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Supprimer</span>
                    </button>
                    {hospitalization.status === 'active' && (
                      <button className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium">
                        Sortie
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredHospitalizations.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucune hospitalisation trouvée</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'rooms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const occupiedBedsCount = room.beds.filter(bed => bed.isOccupied).length;
              const isFullyOccupied = occupiedBedsCount === room.bedCount;
              
              return (
                <div key={room.id} className={`border-2 rounded-lg p-6 transition-all ${
                  isFullyOccupied 
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' 
                    : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 hover:shadow-md'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`rounded-full p-2 ${isFullyOccupied ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                        <Building2 className={`h-5 w-5 ${isFullyOccupied ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chambre {room.roomNumber}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Étage {room.floorNumber}</p>
                      </div>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoomTypeColor(room.roomType)}`}>
                      {getRoomTypeText(room.roomType)}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Lits:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {occupiedBedsCount}/{room.bedCount} occupés
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tarif journalier:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(room.dailyRate, 'XOF')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Statut:</span>
                      <span className={`font-medium ${isFullyOccupied ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {isFullyOccupied ? 'Complète' : 'Disponible'}
                      </span>
                    </div>
                  </div>

                  {/* Aperçu des lits */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Lits</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {room.beds.map((bed) => (
                        <div key={bed.id} className={`flex items-center space-x-2 p-2 rounded text-xs ${getBedStatusColor(bed.status)}`}>
                          <Bed className="h-3 w-3" />
                          <span>{bed.bedNumber}</span>
                          {bed.currentPatientId && (
                            <span className="truncate">({getPatientName(bed.currentPatientId)})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Équipements</h4>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">+{room.amenities.length - 3}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => handleEditRoom(room)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Modifier</span>
                    </button>
                    <button 
                      onClick={() => handleManageBeds(room)}
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center space-x-1"
                    >
                      <Settings className="h-3 w-3" />
                      <span>Gérer Lits</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredRooms.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucune chambre trouvée</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'beds' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredBeds.map((bed) => (
              <div key={bed.id} className={`border-2 rounded-lg p-4 transition-all ${
                bed.isOccupied 
                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10' 
                  : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Bed className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{bed.bedNumber}</span>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getBedStatusColor(bed.status)}`}>
                    <span>{getBedStatusText(bed.status)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Chambre:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{bed.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="text-gray-900 dark:text-white">{getRoomTypeText(bed.roomType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tarif/jour:</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(bed.dailyRate, 'XOF')}</span>
                  </div>
                </div>

                {bed.currentPatientId && (
                  <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                    <div className="flex items-center space-x-1 text-sm">
                      <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {getPatientName(bed.currentPatientId)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex justify-center">
                  <button 
                    onClick={() => {
                      const room = rooms.find(r => r.id === bed.roomId);
                      if (room) handleManageBeds(room);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Gérer</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredBeds.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucun lit trouvé</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <HospitalizationModal
          hospitalization={editingHospitalization}
          onClose={closeModal}
        />
      )}

      {showRoomModal && (
        <RoomModal
          room={editingRoom}
          onClose={closeRoomModal}
        />
      )}

      {showBedModal && selectedRoom && (
        <BedManagementModal
          room={selectedRoom}
          onClose={closeBedModal}
        />
      )}
    </div>
  );
};

export default Hospitalization;
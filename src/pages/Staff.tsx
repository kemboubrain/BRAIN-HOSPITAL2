import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, Plus, User, Phone, Mail, Clock, Calendar, Grid3X3, List, Image, Edit, Trash2, UserPlus } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import DoctorModal from '../components/staff/DoctorModal';

const Staff: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'cards'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);

  const filteredDoctors = state.doctors.filter(doctor => {
    const matchesSearch = 
      doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = filterSpecialty === 'all' || doctor.specialty === filterSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  const specialties = [...new Set(state.doctors.map(doctor => doctor.specialty))];

  const getAvailabilityToday = (doctor: any) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const schedule = doctor.schedule[today];
    return schedule?.available ? `${schedule.start} - ${schedule.end}` : 'Non disponible';
  };

  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor);
    setShowModal(true);
  };

  const handleDelete = (doctorId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
      dispatch({ type: 'DELETE_DOCTOR', payload: doctorId });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDoctor(null);
  };

  const DoctorCard = ({ doctor }: { doctor: any }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-600">
      <div className="flex items-start space-x-4">
        <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-3 flex-shrink-0">
          <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {doctor.firstName} {doctor.lastName}
          </h3>
          <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">{doctor.specialty}</p>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{doctor.phone}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{doctor.email}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Aujourd'hui: {getAvailabilityToday(doctor)}</span>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Consultation: {formatCurrency(doctor.consultationFee, 'XOF')}
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleEdit(doctor)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>Modifier</span>
              </button>
              <button 
                onClick={() => handleDelete(doctor.id)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DoctorListItem = ({ doctor }: { doctor: any }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-600">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-2 flex-shrink-0">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{doctor.firstName} {doctor.lastName}</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{doctor.specialty}</p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>{doctor.phone}</p>
            <p>{doctor.email}</p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Aujourd'hui: {getAvailabilityToday(doctor)}</p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(doctor.consultationFee, 'XOF')}</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleEdit(doctor)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs flex items-center space-x-1"
            >
              <Edit className="h-3 w-3" />
              <span>Modifier</span>
            </button>
            <button 
              onClick={() => handleDelete(doctor.id)}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs flex items-center space-x-1"
            >
              <Trash2 className="h-3 w-3" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const DoctorMiniature = ({ doctor }: { doctor: any }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 text-center">
      <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-4 mx-auto mb-3 w-16 h-16 flex items-center justify-center">
        <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
        {doctor.firstName} {doctor.lastName}
      </h3>
      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">{doctor.specialty}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{doctor.phone}</p>
      <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-3">{formatCurrency(doctor.consultationFee, 'XOF')}</p>
      
      <div className="flex justify-center space-x-1">
        <button 
          onClick={() => handleEdit(doctor)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1"
          title="Modifier"
        >
          <Edit className="h-3 w-3" />
        </button>
        <button 
          onClick={() => handleDelete(doctor.id)}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
          title="Supprimer"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion du Personnel</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>Nouveau Médecin</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, spécialité ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Toutes les spécialités</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>

            {/* Options d'affichage */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Affichage en grille"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Affichage en liste"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Affichage en miniatures"
              >
                <Image className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Affichage conditionnel selon le mode */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <DoctorListItem key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        {viewMode === 'cards' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredDoctors.map((doctor) => (
              <DoctorMiniature key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucun médecin trouvé</p>
          </div>
        )}
      </div>

      {/* Planning de la semaine */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Planning de la Semaine</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Médecin</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Lun</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Mar</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Mer</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Jeu</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Ven</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Sam</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Dim</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.doctors.map((doctor) => (
                <tr key={doctor.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {doctor.firstName} {doctor.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</div>
                    </div>
                  </td>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                    const schedule = doctor.schedule[day];
                    return (
                      <td key={day} className="py-4 px-4 text-center">
                        {schedule?.available ? (
                          <div className="text-sm">
                            <div className="text-green-600 dark:text-green-400 font-medium">
                              {schedule.start} - {schedule.end}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleEdit(doctor)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                        title="Modifier le planning"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <DoctorModal
          doctor={editingDoctor}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Staff;
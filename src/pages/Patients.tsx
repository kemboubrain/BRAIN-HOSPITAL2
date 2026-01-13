import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, Plus, Filter, User, Phone, Mail, MapPin, Grid3X3, List, Image, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PatientModal from '../components/patients/PatientModal';

const Patients: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [filterGender, setFilterGender] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'cards'>('grid');

  const filteredPatients = state.patients.filter(patient => {
    const matchesSearch =
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender = filterGender === 'all' || patient.gender === filterGender;

    return matchesSearch && matchesGender;
  });

  const handleEdit = (e: React.MouseEvent, patient: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleDelete = async (e: React.MouseEvent, patientId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ? Toutes les données associées seront également supprimées.')) {
      dispatch({ type: 'DELETE_PATIENT', payload: patientId });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
  };

  const PatientCard = ({ patient }: { patient: any }) => (
    <div className="relative bg-white rounded-lg p-6 hover:shadow-md transition-all border border-gray-200 hover:border-blue-300 group">
      <Link to={`/patients/${patient.id}`} className="block">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            {patient.patientCode && (
              <div className="mb-2">
                <span className="inline-block bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono px-2 py-1 rounded">
                  {patient.patientCode}
                </span>
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {patient.firstName} {patient.lastName}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} ans • {patient.gender === 'M' ? 'Homme' : 'Femme'}
            </p>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-3 w-3 mr-2" />
                {patient.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-3 w-3 mr-2" />
                {patient.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-3 w-3 mr-2" />
                {patient.city}
              </div>
            </div>

            {patient.allergies && patient.allergies !== 'Aucune' && (
              <div className="mt-2">
                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  Allergies: {patient.allergies}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => handleEdit(e, patient)}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          title="Modifier"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => handleDelete(e, patient.id)}
          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const PatientListItem = ({ patient }: { patient: any }) => (
    <div className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300 group">
      <Link to={`/patients/${patient.id}`} className="block">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              {patient.patientCode && (
                <div className="mb-1">
                  <span className="inline-block bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono px-2 py-0.5 rounded">
                    {patient.patientCode}
                  </span>
                </div>
              )}
              <h3 className="font-semibold text-gray-900">{patient.firstName} {patient.lastName}</h3>
              <p className="text-sm text-gray-600">
                {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} ans • {patient.gender === 'M' ? 'Homme' : 'Femme'}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p>{patient.phone}</p>
              <p>{patient.email}</p>
            </div>
            <div className="text-sm text-gray-600">
              <p>{patient.address}</p>
              <p>{patient.city}, {patient.postalCode}</p>
            </div>
            <div className="text-sm">
              {patient.allergies && patient.allergies !== 'Aucune' && (
                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  Allergies
                </span>
              )}
              {patient.bloodGroup && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-1">
                  {patient.bloodGroup}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => handleEdit(e, patient)}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          title="Modifier"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => handleDelete(e, patient.id)}
          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const PatientMiniature = ({ patient }: { patient: any }) => (
    <div className="relative bg-white rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 hover:border-blue-300 text-center group">
      <Link to={`/patients/${patient.id}`} className="block">
        {patient.patientCode && (
          <div className="mb-2">
            <span className="inline-block bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono px-1 py-0.5 rounded">
              {patient.patientCode}
            </span>
          </div>
        )}
        <div className="bg-blue-100 rounded-full p-4 mx-auto mb-3 w-16 h-16 flex items-center justify-center">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1 text-sm">
          {patient.firstName} {patient.lastName}
        </h3>
        <p className="text-xs text-gray-600 mb-2">
          {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} ans
        </p>
        <p className="text-xs text-gray-500">{patient.phone}</p>
        {patient.allergies && patient.allergies !== 'Aucune' && (
          <div className="mt-2">
            <span className="inline-block bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded">
              Allergies
            </span>
          </div>
        )}
      </Link>
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => handleEdit(e, patient)}
          className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          title="Modifier"
        >
          <Edit className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => handleDelete(e, patient.id)}
          className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 transition-colors shadow-md"
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Patients</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau Patient</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                <option value="M">Hommes</option>
                <option value="F">Femmes</option>
              </select>
            </div>

            {/* Options d'affichage */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Affichage en grille"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Affichage en liste"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900 shadow' 
                    : 'text-gray-600 hover:text-gray-900'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <PatientListItem key={patient.id} patient={patient} />
            ))}
          </div>
        )}

        {viewMode === 'cards' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredPatients.map((patient) => (
              <PatientMiniature key={patient.id} patient={patient} />
            ))}
          </div>
        )}

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun patient trouvé</p>
          </div>
        )}
      </div>

      {showModal && (
        <PatientModal
          patient={selectedPatient}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Patients;
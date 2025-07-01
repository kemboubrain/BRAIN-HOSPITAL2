import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const SearchBar: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const searchResults = React.useMemo(() => {
    if (!searchTerm.trim()) return [];

    const results: Array<{
      type: 'patient' | 'appointment' | 'consultation';
      id: string;
      title: string;
      subtitle: string;
      path: string;
    }> = [];

    // Recherche dans les patients
    state.patients
      .filter(patient => 
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5)
      .forEach(patient => {
        results.push({
          type: 'patient',
          id: patient.id,
          title: `${patient.firstName} ${patient.lastName}`,
          subtitle: `${patient.phone} • ${patient.email}`,
          path: `/patients/${patient.id}`
        });
      });

    // Recherche dans les rendez-vous
    state.appointments
      .filter(appointment => {
        const patient = state.patients.find(p => p.id === appointment.patientId);
        const doctor = state.doctors.find(d => d.id === appointment.doctorId);
        return patient && (
          patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        ) || appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor && (
          doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .slice(0, 3)
      .forEach(appointment => {
        const patient = state.patients.find(p => p.id === appointment.patientId);
        results.push({
          type: 'appointment',
          id: appointment.id,
          title: `RDV - ${patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'}`,
          subtitle: `${new Date(appointment.date).toLocaleDateString('fr-FR')} à ${appointment.time}`,
          path: '/appointments'
        });
      });

    return results;
  }, [searchTerm, state]);

  const handleResultClick = (result: any) => {
    navigate(result.path);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1 max-w-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un patient, rendez-vous..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && searchTerm && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}-${index}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        result.type === 'patient' ? 'bg-blue-500' :
                        result.type === 'appointment' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        result.type === 'patient' ? 'bg-blue-100 text-blue-800' :
                        result.type === 'appointment' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {result.type === 'patient' ? 'Patient' :
                         result.type === 'appointment' ? 'RDV' : 'Consultation'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun résultat trouvé</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchBar;
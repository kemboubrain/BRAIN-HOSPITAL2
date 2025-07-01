import React, { useState } from 'react';
import { AlertTriangle, X, Phone } from 'lucide-react';

interface EmergencyAlertProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: {
    type: 'medical' | 'fire' | 'security';
    patient?: string;
    location: string;
    description: string;
    time: string;
  };
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ isOpen, onClose, emergency }) => {
  if (!isOpen) return null;

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'medical': return 'bg-red-50 border-red-200 text-red-800';
      case 'fire': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'security': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getEmergencyNumber = (type: string) => {
    switch (type) {
      case 'medical': return '15'; // SAMU
      case 'fire': return '18'; // Pompiers
      case 'security': return '17'; // Police
      default: return '15';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full rounded-lg border-2 ${getAlertColor(emergency.type)} p-6 animate-pulse`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-bold">ALERTE D'URGENCE</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <span className="font-medium">Type:</span> 
            <span className="ml-2 capitalize">{emergency.type}</span>
          </div>
          {emergency.patient && (
            <div>
              <span className="font-medium">Patient:</span> 
              <span className="ml-2">{emergency.patient}</span>
            </div>
          )}
          <div>
            <span className="font-medium">Lieu:</span> 
            <span className="ml-2">{emergency.location}</span>
          </div>
          <div>
            <span className="font-medium">Heure:</span> 
            <span className="ml-2">{emergency.time}</span>
          </div>
          <div>
            <span className="font-medium">Description:</span>
            <p className="mt-1 text-sm">{emergency.description}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-700 transition-colors">
            <Phone className="h-4 w-4" />
            <span>Appeler {getEmergencyNumber(emergency.type)}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlert;
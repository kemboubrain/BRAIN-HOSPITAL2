import React, { useState } from 'react';
import { X, Plus, Trash2, Bed as BedIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Room, Bed } from '../../types';

interface RoomModalProps {
  room?: Room;
  onClose: () => void;
}

const RoomModal: React.FC<RoomModalProps> = ({ room, onClose }) => {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    roomNumber: room?.roomNumber || '',
    roomType: room?.roomType || 'standard',
    bedCount: room?.bedCount || 1,
    dailyRate: room?.dailyRate || 15000,
    floorNumber: room?.floorNumber || 1,
    description: room?.description || ''
  });

  const [amenities, setAmenities] = useState<string[]>(room?.amenities || []);
  const [beds, setBeds] = useState<Omit<Bed, 'id' | 'roomId'>[]>(
    room?.beds?.map(bed => ({
      bedNumber: bed.bedNumber,
      isOccupied: bed.isOccupied,
      currentPatientId: bed.currentPatientId,
      currentHospitalizationId: bed.currentHospitalizationId,
      lastCleaned: bed.lastCleaned,
      status: bed.status,
      notes: bed.notes
    })) || []
  );

  const [newAmenity, setNewAmenity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Générer automatiquement les lits si le nombre a changé
      const updatedBeds = [];
      for (let i = 1; i <= formData.bedCount; i++) {
        const existingBed = beds.find(b => b.bedNumber === `${formData.roomNumber}-${i}`);
        updatedBeds.push({
          id: existingBed ? `${room?.id || Date.now()}-bed-${i}` : `${Date.now()}-bed-${i}`,
          roomId: room?.id || Date.now().toString(),
          bedNumber: `${formData.roomNumber}-${i}`,
          isOccupied: existingBed?.isOccupied || false,
          currentPatientId: existingBed?.currentPatientId,
          currentHospitalizationId: existingBed?.currentHospitalizationId,
          lastCleaned: existingBed?.lastCleaned,
          status: existingBed?.status || 'available',
          notes: existingBed?.notes || ''
        });
      }

      const roomData: Room = {
        id: room?.id || Date.now().toString(),
        roomNumber: formData.roomNumber,
        roomType: formData.roomType as any,
        bedCount: formData.bedCount,
        dailyRate: formData.dailyRate,
        amenities,
        floorNumber: formData.floorNumber,
        description: formData.description,
        beds: updatedBeds,
        createdAt: room?.createdAt || new Date().toISOString()
      };

      if (room) {
        dispatch({ type: 'UPDATE_ROOM', payload: roomData });
      } else {
        dispatch({ type: 'ADD_ROOM', payload: roomData });
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la chambre:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities(prev => [...prev, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(prev => prev.filter(a => a !== amenity));
  };

  const getRoomTypeText = (type: string) => {
    switch (type) {
      case 'standard': return 'Standard';
      case 'private': return 'Privée';
      case 'vip': return 'VIP';
      case 'icu': return 'Soins Intensifs';
      case 'emergency': return 'Urgence';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {room ? 'Modifier la Chambre' : 'Nouvelle Chambre'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de chambre *
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="ex: 101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de chambre *
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="standard">Standard</option>
                <option value="private">Privée</option>
                <option value="vip">VIP</option>
                <option value="icu">Soins Intensifs</option>
                <option value="emergency">Urgence</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de lits *
              </label>
              <input
                type="number"
                name="bedCount"
                value={formData.bedCount}
                onChange={handleChange}
                required
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tarif journalier (XOF) *
              </label>
              <input
                type="number"
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleChange}
                required
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Étage
              </label>
              <input
                type="number"
                name="floorNumber"
                value={formData.floorNumber}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Aperçu des lits */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Aperçu des lits ({formData.bedCount} lit{formData.bedCount > 1 ? 's' : ''})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: formData.bedCount }, (_, i) => (
                <div key={i} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <BedIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formData.roomNumber}-{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Équipements */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Équipements</h3>
            
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Ajouter un équipement..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              />
              <button
                type="button"
                onClick={addAmenity}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-3 py-1 rounded-full">
                  <span className="text-sm">{amenity}</span>
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Description de la chambre..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : (room ? 'Mettre à jour' : 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;
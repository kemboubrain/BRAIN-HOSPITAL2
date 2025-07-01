import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, User, DollarSign, Building2, Bed as BedIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Hospitalization, HospitalizationService } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface HospitalizationModalProps {
  hospitalization?: Hospitalization;
  onClose: () => void;
}

const HospitalizationModal: React.FC<HospitalizationModalProps> = ({ hospitalization, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    patientId: hospitalization?.patientId || '',
    doctorId: hospitalization?.doctorId || '',
    roomId: hospitalization?.roomId || '',
    bedId: hospitalization?.bedId || '',
    admissionDate: hospitalization?.admissionDate ? hospitalization.admissionDate.split('T')[0] : new Date().toISOString().split('T')[0],
    admissionTime: hospitalization?.admissionDate ? new Date(hospitalization.admissionDate).toTimeString().slice(0, 5) : '08:00',
    dischargeDate: hospitalization?.dischargeDate ? hospitalization.dischargeDate.split('T')[0] : '',
    dischargeTime: hospitalization?.dischargeDate ? new Date(hospitalization.dischargeDate).toTimeString().slice(0, 5) : '',
    admissionReason: hospitalization?.admissionReason || '',
    dischargeSummary: hospitalization?.dischargeSummary || '',
    status: hospitalization?.status || 'active',
    emergencyAdmission: hospitalization?.emergencyAdmission || false,
    insuranceCovered: hospitalization?.insuranceCovered || false
  });

  const [services, setServices] = useState<Omit<HospitalizationService, 'id' | 'hospitalizationId'>[]>(
    hospitalization?.services?.map(service => ({
      careServiceId: service.careServiceId,
      serviceDate: service.serviceDate,
      quantity: service.quantity,
      unitPrice: service.unitPrice,
      totalPrice: service.totalPrice,
      performedBy: service.performedBy,
      notes: service.notes
    })) || []
  );

  const [isLoading, setIsLoading] = useState(false);

  // Données simulées pour les chambres avec lits
  const rooms = [
    { 
      id: '1', 
      roomNumber: '101', 
      roomType: 'standard', 
      dailyRate: 15000, 
      beds: [
        { id: 'bed-1-1', bedNumber: '101-1', status: 'available', isOccupied: false },
        { id: 'bed-1-2', bedNumber: '101-2', status: 'available', isOccupied: false }
      ]
    },
    { 
      id: '2', 
      roomNumber: '102', 
      roomType: 'standard', 
      dailyRate: 15000,
      beds: [
        { id: 'bed-2-1', bedNumber: '102-1', status: 'available', isOccupied: false },
        { id: 'bed-2-2', bedNumber: '102-2', status: 'occupied', isOccupied: true }
      ]
    },
    { 
      id: '3', 
      roomNumber: '103', 
      roomType: 'private', 
      dailyRate: 25000,
      beds: [
        { id: 'bed-3-1', bedNumber: '103-1', status: 'occupied', isOccupied: true }
      ]
    },
    { 
      id: '4', 
      roomNumber: '104', 
      roomType: 'private', 
      dailyRate: 25000,
      beds: [
        { id: 'bed-4-1', bedNumber: '104-1', status: 'available', isOccupied: false }
      ]
    },
    { 
      id: '5', 
      roomNumber: '201', 
      roomType: 'vip', 
      dailyRate: 50000,
      beds: [
        { id: 'bed-5-1', bedNumber: '201-1', status: 'available', isOccupied: false }
      ]
    },
    { 
      id: '6', 
      roomNumber: '202', 
      roomType: 'vip', 
      dailyRate: 50000,
      beds: [
        { id: 'bed-6-1', bedNumber: '202-1', status: 'available', isOccupied: false }
      ]
    },
    { 
      id: '7', 
      roomNumber: '301', 
      roomType: 'icu', 
      dailyRate: 75000,
      beds: [
        { id: 'bed-7-1', bedNumber: '301-1', status: 'available', isOccupied: false }
      ]
    },
    { 
      id: '8', 
      roomNumber: '302', 
      roomType: 'icu', 
      dailyRate: 75000,
      beds: [
        { id: 'bed-8-1', bedNumber: '302-1', status: 'available', isOccupied: false }
      ]
    }
  ];

  // Obtenir tous les lits disponibles avec informations de chambre
  const getAllAvailableBeds = () => {
    const allBeds = [];
    for (const room of rooms) {
      for (const bed of room.beds) {
        if (!bed.isOccupied || bed.id === formData.bedId) {
          allBeds.push({
            ...bed,
            roomId: room.id,
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            dailyRate: room.dailyRate
          });
        }
      }
    }
    return allBeds;
  };

  const availableBeds = getAllAvailableBeds();
  const selectedBed = availableBeds.find(bed => bed.id === formData.bedId);
  const selectedRoom = selectedBed ? rooms.find(r => r.id === selectedBed.roomId) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const admissionDateTime = `${formData.admissionDate}T${formData.admissionTime}:00`;
      const dischargeDateTime = formData.dischargeDate ? `${formData.dischargeDate}T${formData.dischargeTime}:00` : undefined;
      
      // Calculer la durée du séjour
      const admissionDate = new Date(admissionDateTime);
      const dischargeDate = dischargeDateTime ? new Date(dischargeDateTime) : new Date();
      const stayDuration = Math.ceil((dischargeDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const dailyCost = selectedRoom?.dailyRate || 0;
      const roomCost = dailyCost * stayDuration;
      const servicesCost = services.reduce((sum, service) => sum + service.totalPrice, 0);
      const totalCost = roomCost + servicesCost;

      const hospitalizationData: Hospitalization = {
        id: hospitalization?.id || Date.now().toString(),
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        roomId: selectedBed?.roomId || '',
        bedId: formData.bedId,
        admissionDate: admissionDateTime,
        dischargeDate: dischargeDateTime,
        admissionReason: formData.admissionReason,
        dischargeSummary: formData.dischargeSummary,
        status: formData.status as any,
        dailyCost,
        totalCost,
        insuranceCovered: formData.insuranceCovered,
        emergencyAdmission: formData.emergencyAdmission,
        services: services.map((service, index) => ({
          id: hospitalization?.services?.[index]?.id || `${Date.now()}-${index}`,
          hospitalizationId: hospitalization?.id || Date.now().toString(),
          ...service
        })),
        createdAt: hospitalization?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (hospitalization) {
        dispatch({ type: 'UPDATE_HOSPITALIZATION', payload: hospitalizationData });
      } else {
        dispatch({ type: 'ADD_HOSPITALIZATION', payload: hospitalizationData });

        // Créer automatiquement une facture pour l'hospitalisation
        if (formData.patientId) {
          const invoiceItems = [
            {
              id: `item-room-${Date.now()}`,
              description: `Hospitalisation chambre ${selectedRoom?.roomNumber} lit ${selectedBed?.bedNumber} (${stayDuration} jour${stayDuration > 1 ? 's' : ''})`,
              quantity: stayDuration,
              unitPrice: dailyCost,
              total: roomCost
            },
            ...services.map((service, index) => {
              const careService = state.careServices.find(s => s.id === service.careServiceId);
              return {
                id: `item-service-${Date.now()}-${index}`,
                description: careService?.name || 'Service hospitalier',
                quantity: service.quantity,
                unitPrice: service.unitPrice,
                total: service.totalPrice
              };
            })
          ];

          const invoiceData = {
            id: `inv-hosp-${Date.now()}`,
            patientId: formData.patientId,
            consultationId: undefined,
            hospitalizationId: hospitalizationData.id,
            date: formData.admissionDate,
            items: invoiceItems,
            subtotal: totalCost,
            tax: 0,
            total: totalCost,
            status: 'pending' as const,
            paymentMethod: '',
            paymentDate: undefined
          };

          dispatch({ type: 'ADD_INVOICE', payload: invoiceData });
        }
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'hospitalisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleBedSelection = (bedId: string) => {
    setFormData(prev => ({ ...prev, bedId }));
  };

  const addService = () => {
    setServices(prev => [...prev, {
      careServiceId: '',
      serviceDate: new Date().toISOString().split('T')[0],
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      performedBy: '',
      notes: ''
    }]);
  };

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: string, value: string | number) => {
    setServices(prev => prev.map((service, i) => {
      if (i === index) {
        const updatedService = { ...service, [field]: value };
        
        if (field === 'careServiceId') {
          const careService = state.careServices.find(s => s.id === value);
          if (careService) {
            updatedService.unitPrice = careService.unitPrice;
            updatedService.totalPrice = updatedService.quantity * careService.unitPrice;
          }
        } else if (field === 'quantity') {
          updatedService.totalPrice = Number(value) * updatedService.unitPrice;
        }
        
        return updatedService;
      }
      return service;
    }));
  };

  const totalServicesCost = services.reduce((sum, service) => sum + service.totalPrice, 0);

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

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20';
      case 'occupied':
        return 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20';
      case 'maintenance':
        return 'border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20';
      case 'cleaning':
        return 'border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20';
      default:
        return 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {hospitalization ? 'Modifier l\'Hospitalisation' : 'Nouvelle Hospitalisation'}
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
                Patient *
              </label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner un patient</option>
                {state.patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Médecin responsable *
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner un médecin</option>
                {state.doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sélection directe des lits */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-4">
              <BedIcon className="h-5 w-5 inline mr-2 text-blue-600 dark:text-blue-400" />
              Sélectionner un lit *
            </label>
            
            {availableBeds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableBeds.map((bed) => (
                  <div
                    key={bed.id}
                    onClick={() => handleBedSelection(bed.id)}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                      formData.bedId === bed.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                        : getBedStatusColor(bed.status)
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <BedIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {bed.bedNumber}
                        </span>
                      </div>
                      {formData.bedId === bed.id && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm">
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
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(bed.dailyRate, 'XOF')}
                        </span>
                      </div>
                    </div>

                    {bed.isOccupied && bed.id !== formData.bedId && (
                      <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                        Occupé
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <BedIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Aucun lit disponible</p>
              </div>
            )}
          </div>

          {/* Informations du lit sélectionné */}
          {selectedBed && selectedRoom && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Lit sélectionné: {selectedBed.bedNumber}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Chambre:</span>
                  <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">{selectedRoom.roomNumber}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Type:</span>
                  <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">{getRoomTypeText(selectedRoom.roomType)}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Tarif/jour:</span>
                  <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">{formatCurrency(selectedRoom.dailyRate, 'XOF')}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Statut:</span>
                  <span className="ml-2 font-medium text-green-600 dark:text-green-400">Disponible</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date d'admission *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  required
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="time"
                  name="admissionTime"
                  value={formData.admissionTime}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de sortie (optionnel)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  name="dischargeDate"
                  value={formData.dischargeDate}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="time"
                  name="dischargeTime"
                  value={formData.dischargeTime}
                  onChange={handleChange}
                  disabled={!formData.dischargeDate}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motif d'admission *
            </label>
            <textarea
              name="admissionReason"
              value={formData.admissionReason}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Décrivez le motif de l'hospitalisation..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Actif</option>
                <option value="discharged">Sorti</option>
                <option value="transferred">Transféré</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="emergencyAdmission"
                  checked={formData.emergencyAdmission}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Admission d'urgence
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="insuranceCovered"
                  checked={formData.insuranceCovered}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Prise en charge assurance
                </label>
              </div>
            </div>
          </div>

          {/* Services durant l'hospitalisation */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Services Durant le Séjour</h3>
              <button
                type="button"
                onClick={addService}
                className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 hover:bg-green-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter</span>
              </button>
            </div>

            {services.length > 0 && (
              <div className="space-y-4">
                {services.map((service, index) => {
                  const careService = state.careServices.find(s => s.id === service.careServiceId);
                  return (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">Service {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Service
                          </label>
                          <select
                            value={service.careServiceId}
                            onChange={(e) => updateService(index, 'careServiceId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          >
                            <option value="">Sélectionner</option>
                            {state.careServices.filter(s => s.isActive).map(careService => (
                              <option key={careService.id} value={careService.id}>
                                {careService.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={service.serviceDate}
                            onChange={(e) => updateService(index, 'serviceDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Quantité
                          </label>
                          <input
                            type="number"
                            value={service.quantity}
                            onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value))}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Total
                          </label>
                          <input
                            type="text"
                            value={formatCurrency(service.totalPrice, 'XOF')}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-sm font-medium text-green-600 dark:text-green-400"
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Réalisé par
                          </label>
                          <input
                            type="text"
                            value={service.performedBy}
                            onChange={(e) => updateService(index, 'performedBy', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            placeholder="Nom du soignant"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={service.notes}
                            onChange={(e) => updateService(index, 'notes', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            placeholder="Notes particulières"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {formData.status === 'discharged' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Résumé de sortie
              </label>
              <textarea
                name="dischargeSummary"
                value={formData.dischargeSummary}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Résumé de l'hospitalisation et recommandations..."
              />
            </div>
          )}

          {/* Résumé des coûts */}
          {selectedRoom && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Estimation des Coûts</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">
                    Chambre {selectedRoom.roomNumber} - Lit {selectedBed?.bedNumber}:
                  </span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">{formatCurrency(selectedRoom.dailyRate, 'XOF')}/jour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Services:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">{formatCurrency(totalServicesCost, 'XOF')}</span>
                </div>
                <div className="border-t border-blue-200 dark:border-blue-700 pt-2 flex justify-between">
                  <span className="font-medium text-blue-900 dark:text-blue-100">Total estimé:</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(selectedRoom.dailyRate + totalServicesCost, 'XOF')}
                  </span>
                </div>
              </div>
            </div>
          )}

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
              disabled={isLoading || !formData.bedId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : (hospitalization ? 'Mettre à jour' : 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HospitalizationModal;
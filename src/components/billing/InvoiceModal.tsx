import React, { useState } from 'react';
import { X, Plus, Trash2, Calculator, User, Calendar, DollarSign, FileText, Search, Filter, Shield } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Invoice, InvoiceItem } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface InvoiceModalProps {
  invoice?: Invoice;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    patientId: invoice?.patientId || '',
    date: invoice?.date || new Date().toISOString().split('T')[0],
    status: invoice?.status || 'pending',
    paymentMethod: invoice?.paymentMethod || '',
    paymentDate: invoice?.paymentDate || '',
    insuranceProvider: invoice?.insuranceProvider || '',
    insurancePolicyNumber: invoice?.insurancePolicyNumber || '',
    insuranceCoverage: invoice?.insuranceCoverage || 0,
    patientResponsibility: invoice?.patientResponsibility || 0
  });

  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>(
    invoice?.items?.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    })) || []
  );

  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategory, setServiceCategory] = useState('all');
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useInsurance, setUseInsurance] = useState(!!invoice?.insuranceProvider);

  // Récupérer tous les services disponibles
  const getAllServices = () => {
    const services = [];

    // Services de soins
    state.careServices.filter(s => s.isActive).forEach(service => {
      services.push({
        id: service.id,
        type: 'care',
        name: service.name,
        category: service.category,
        price: service.unitPrice,
        duration: service.durationMinutes,
        requiresDoctor: service.requiresDoctor
      });
    });

    // Consultations par médecin
    state.doctors.forEach(doctor => {
      services.push({
        id: `consultation-${doctor.id}`,
        type: 'consultation',
        name: `Consultation ${doctor.specialty}`,
        category: 'Consultations',
        price: doctor.consultationFee,
        duration: 30,
        doctor: `${doctor.firstName} ${doctor.lastName}`
      });
    });

    // Médicaments
    state.medications.filter(m => m.stock > 0).forEach(medication => {
      services.push({
        id: `medication-${medication.id}`,
        type: 'medication',
        name: medication.name,
        category: 'Pharmacie',
        price: medication.unitPrice,
        manufacturer: medication.manufacturer,
        stock: medication.stock
      });
    });

    // Chambres d'hospitalisation (tarifs journaliers)
    const rooms = [
      { id: '1', roomNumber: '101', roomType: 'standard', dailyRate: 15000 },
      { id: '2', roomNumber: '102', roomType: 'standard', dailyRate: 15000 },
      { id: '3', roomNumber: '103', roomType: 'private', dailyRate: 25000 },
      { id: '4', roomNumber: '104', roomType: 'private', dailyRate: 25000 },
      { id: '5', roomNumber: '201', roomType: 'vip', dailyRate: 50000 },
      { id: '6', roomNumber: '202', roomType: 'vip', dailyRate: 50000 },
      { id: '7', roomNumber: '301', roomType: 'icu', dailyRate: 75000 },
      { id: '8', roomNumber: '302', roomType: 'icu', dailyRate: 75000 }
    ];

    rooms.forEach(room => {
      const roomTypeText = {
        'standard': 'Standard',
        'private': 'Privée',
        'vip': 'VIP',
        'icu': 'Soins Intensifs'
      };

      services.push({
        id: `room-${room.id}`,
        type: 'hospitalization',
        name: `Chambre ${room.roomNumber} (${roomTypeText[room.roomType]})`,
        category: 'Hospitalisation',
        price: room.dailyRate,
        roomType: room.roomType
      });
    });

    // Examens de laboratoire
    state.labTests.filter(t => t.isActive).forEach(test => {
      services.push({
        id: `lab-${test.id}`,
        type: 'laboratory',
        name: test.name,
        category: 'Laboratoire',
        price: test.price,
        sampleType: test.sampleType,
        processingTime: test.processingTime
      });
    });

    return services;
  };

  const allServices = getAllServices();

  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                         service.category.toLowerCase().includes(serviceSearch.toLowerCase());
    const matchesCategory = serviceCategory === 'all' || service.category === serviceCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(allServices.map(s => s.category))];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = 0; // Pas de TVA au Sénégal pour les services médicaux
      const total = subtotal + tax;
      
      // Calcul des montants d'assurance si applicable
      let insuranceCoverage = 0;
      let patientResponsibility = total;
      
      if (useInsurance && formData.insuranceCoverage > 0) {
        insuranceCoverage = Math.round(total * (formData.insuranceCoverage / 100));
        patientResponsibility = total - insuranceCoverage;
      }

      const invoiceData: Invoice = {
        id: invoice?.id || `inv-${Date.now()}`,
        patientId: formData.patientId,
        date: formData.date,
        items: items.map((item, index) => ({
          id: invoice?.items?.[index]?.id || `item-${Date.now()}-${index}`,
          ...item
        })),
        subtotal,
        tax,
        total,
        status: formData.status as any,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate || undefined,
        insuranceProvider: useInsurance ? formData.insuranceProvider : undefined,
        insurancePolicyNumber: useInsurance ? formData.insurancePolicyNumber : undefined,
        insuranceCoverage: useInsurance ? insuranceCoverage : undefined,
        patientResponsibility: useInsurance ? patientResponsibility : undefined
      };

      if (invoice) {
        dispatch({ type: 'UPDATE_INVOICE', payload: invoiceData });
      } else {
        dispatch({ type: 'ADD_INVOICE', payload: invoiceData });
        
        // Si l'assurance est utilisée, créer une demande de remboursement
        if (useInsurance && formData.insuranceProvider && formData.insurancePolicyNumber && insuranceCoverage > 0) {
          // Trouver l'assurance du patient
          const patient = state.patients.find(p => p.id === formData.patientId);
          const patientInsurance = state.patientInsurances.find(pi => 
            pi.patientId === formData.patientId && 
            pi.status === 'active' &&
            state.insuranceProviders.find(p => p.id === pi.providerId)?.name === formData.insuranceProvider
          );
          
          if (patientInsurance) {
            const claim = {
              id: `claim-${Date.now()}`,
              patientId: formData.patientId,
              patientInsuranceId: patientInsurance.id,
              invoiceId: invoiceData.id,
              claimNumber: `CLM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
              submissionDate: new Date().toISOString().split('T')[0],
              totalAmount: total,
              coveredAmount: insuranceCoverage,
              patientResponsibility: patientResponsibility,
              status: 'submitted' as const,
              notes: `Demande de remboursement automatique pour la facture #${invoiceData.id.slice(-8)}`,
              createdAt: new Date().toISOString()
            };
            
            dispatch({ type: 'ADD_INSURANCE_CLAIM', payload: claim });
          }
        }
        
        // Mettre à jour le stock des médicaments si des médicaments sont facturés
        items.forEach(item => {
          // Vérifier si l'élément est un médicament
          const medicationMatch = item.description.match(/^(.+) \(Pharmacie\)$/);
          if (medicationMatch) {
            const medicationName = medicationMatch[1];
            const medication = state.medications.find(m => m.name === medicationName);
            
            if (medication && medication.stock >= item.quantity) {
              // Mettre à jour le stock
              const updatedMedication = {
                ...medication,
                stock: medication.stock - item.quantity
              };
              
              dispatch({ type: 'UPDATE_MEDICATION', payload: updatedMedication });
              
              // Créer un mouvement de stock
              const stockMovement = {
                id: `movement-${Date.now()}-${medication.id}`,
                medicationId: medication.id,
                date: new Date().toISOString(),
                type: 'exit',
                quantity: -item.quantity,
                reason: `Facture #${invoiceData.id.slice(-8)}`,
                operator: 'Système',
                reference: invoiceData.id
              };
              
              dispatch({ type: 'ADD_STOCK_MOVEMENT', payload: stockMovement });
            }
          }
        });
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la facture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' 
      ? Number(e.target.value)
      : e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
    
    // Si le patient change, mettre à jour les informations d'assurance
    if (e.target.name === 'patientId' && e.target.value) {
      const patient = state.patients.find(p => p.id === e.target.value);
      const patientInsurance = state.patientInsurances.find(pi => 
        pi.patientId === e.target.value && pi.status === 'active'
      );
      
      if (patient && patientInsurance) {
        const provider = state.insuranceProviders.find(p => p.id === patientInsurance.providerId);
        
        setFormData(prev => ({
          ...prev,
          insuranceProvider: provider?.name || '',
          insurancePolicyNumber: patientInsurance.policyNumber || '',
          insuranceCoverage: patientInsurance.coveragePercentage || 0
        }));
        
        setUseInsurance(true);
      } else if (patient?.insurance?.provider) {
        setFormData(prev => ({
          ...prev,
          insuranceProvider: patient.insurance.provider,
          insurancePolicyNumber: patient.insurance.number,
          insuranceCoverage: patient.insurance.coverage || 0
        }));
        
        setUseInsurance(!!patient.insurance.provider);
      } else {
        setFormData(prev => ({
          ...prev,
          insuranceProvider: '',
          insurancePolicyNumber: '',
          insuranceCoverage: 0
        }));
        
        setUseInsurance(false);
      }
    }
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }]);
  };

  const addServiceToInvoice = (service: any) => {
    let description = service.name;
    
    // Ajouter des informations supplémentaires selon le type de service
    if (service.type === 'medication') {
      description = `${service.name} (Pharmacie)`;
    } else if (service.type === 'consultation') {
      description = `${service.name} - ${service.doctor}`;
    } else if (service.type === 'laboratory') {
      description = `${service.name} (Laboratoire)`;
    } else if (service.type === 'hospitalization') {
      description = `${service.name} (Journée)`;
    }
    
    const newItem = {
      description,
      quantity: 1,
      unitPrice: service.price,
      total: service.price
    };
    setItems(prev => [...prev, newItem]);
    setShowServiceSelector(false);
    setServiceSearch('');
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = 0;
  const total = subtotal + tax;
  
  // Calcul des montants d'assurance
  const insuranceCoverage = useInsurance && formData.insuranceCoverage > 0 
    ? Math.round(total * (formData.insuranceCoverage / 100))
    : 0;
  
  const patientResponsibility = total - insuranceCoverage;

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'care': return '🩺';
      case 'consultation': return '👨‍⚕️';
      case 'medication': return '💊';
      case 'hospitalization': return '🏥';
      case 'laboratory': return '🔬';
      default: return '📋';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {invoice ? 'Modifier la Facture' : 'Nouvelle Facture'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

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
                <option value="pending">En attente</option>
                <option value="paid">Payée</option>
                <option value="overdue">En retard</option>
                <option value="cancelled">Annulée</option>
                {useInsurance && <option value="insurance-pending">En attente d'assurance</option>}
              </select>
            </div>
          </div>

          {/* Assurance */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="useInsurance"
                checked={useInsurance}
                onChange={() => setUseInsurance(!useInsurance)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="useInsurance" className="text-lg font-medium text-gray-900 dark:text-white">
                Utiliser l'assurance
              </label>
            </div>

            {useInsurance && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assureur
                  </label>
                  <select
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Sélectionner un assureur</option>
                    {state.insuranceProviders.map(provider => (
                      <option key={provider.id} value={provider.name}>{provider.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro de police
                  </label>
                  <input
                    type="text"
                    name="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Taux de couverture (%)
                  </label>
                  <input
                    type="number"
                    name="insuranceCoverage"
                    value={formData.insuranceCoverage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Services et éléments de facturation */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Services et Prestations</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowServiceSelector(!showServiceSelector)}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 hover:bg-green-700 transition-colors text-sm"
                >
                  <Search className="h-4 w-4" />
                  <span>Catalogue Services</span>
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ligne personnalisée</span>
                </button>
              </div>
            </div>

            {/* Sélecteur de services */}
            {showServiceSelector && (
              <div className="mb-6 border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un service..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  >
                    <option value="all">Toutes catégories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredServices.map((service, index) => (
                    <div
                      key={`${service.type}-${service.id}-${index}`}
                      onClick={() => addServiceToInvoice(service)}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-gray-200 dark:border-gray-500"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getServiceIcon(service.type)}</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {service.category}
                            {service.doctor && ` • ${service.doctor}`}
                            {service.duration && ` • ${service.duration} min`}
                            {service.stock !== undefined && ` • Stock: ${service.stock}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(service.price, 'XOF')}
                        </p>
                        {service.requiresDoctor && (
                          <p className="text-xs text-orange-600 dark:text-orange-400">Médecin requis</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des éléments de facturation */}
            {items.length > 0 && (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Élément {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          placeholder="Description du service..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Quantité
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Prix unitaire (XOF)
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="mt-4 text-right">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        Total: {formatCurrency(item.total, 'XOF')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations de paiement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Méthode de paiement
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner</option>
                <option value="Espèces">Espèces</option>
                <option value="Carte bancaire">Carte bancaire</option>
                <option value="Chèque">Chèque</option>
                <option value="Virement">Virement</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Assurance">Assurance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de paiement
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Résumé financier */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Résumé de la Facture</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Sous-total:</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">{formatCurrency(subtotal, 'XOF')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">TVA (0%):</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">{formatCurrency(tax, 'XOF')}</span>
              </div>
              <div className="border-t border-blue-200 dark:border-blue-700 pt-2 flex justify-between">
                <span className="font-medium text-blue-900 dark:text-blue-100">Total:</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(total, 'XOF')}
                </span>
              </div>
              
              {useInsurance && (
                <>
                  <div className="flex justify-between mt-4">
                    <span className="text-blue-700 dark:text-blue-300">
                      <Shield className="h-4 w-4 inline mr-1" />
                      Prise en charge assurance ({formData.insuranceCoverage}%):
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(insuranceCoverage, 'XOF')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Reste à charge patient:</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      {formatCurrency(patientResponsibility, 'XOF')}
                    </span>
                  </div>
                </>
              )}
            </div>
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
              disabled={isLoading || items.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : (invoice ? 'Mettre à jour' : 'Créer la facture')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceModal;
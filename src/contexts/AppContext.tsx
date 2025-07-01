import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Patient, Doctor, Appointment, Consultation, Medication, Invoice, LabResult, User, DashboardStats, CareService, PatientCareRecord, Hospitalization, Room, LabTest, InsuranceProvider, InsurancePolicy, PatientInsurance, InsuranceClaim, StockMovement } from '../types';
import { 
  patientService, 
  doctorService, 
  appointmentService, 
  consultationService, 
  medicationService, 
  invoiceService, 
  labResultService 
} from '../services/supabaseService';

interface AppState {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  consultations: Consultation[];
  medications: Medication[];
  stockMovements: StockMovement[];
  invoices: Invoice[];
  labResults: LabResult[];
  labTests: LabTest[];
  careServices: CareService[];
  patientCareRecords: PatientCareRecord[];
  hospitalizations: Hospitalization[];
  rooms: Room[];
  insuranceProviders: InsuranceProvider[];
  insurancePolicies: InsurancePolicy[];
  patientInsurances: PatientInsurance[];
  insuranceClaims: InsuranceClaim[];
  currentUser: User | null;
  dashboardStats: DashboardStats;
  isLoading: boolean;
  theme: 'light' | 'dark';
  currency: 'XOF';
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'DELETE_PATIENT'; payload: string }
  | { type: 'ADD_DOCTOR'; payload: Doctor }
  | { type: 'UPDATE_DOCTOR'; payload: Doctor }
  | { type: 'DELETE_DOCTOR'; payload: string }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: Appointment }
  | { type: 'DELETE_APPOINTMENT'; payload: string }
  | { type: 'ADD_CONSULTATION'; payload: Consultation }
  | { type: 'UPDATE_CONSULTATION'; payload: Consultation }
  | { type: 'DELETE_CONSULTATION'; payload: string }
  | { type: 'ADD_MEDICATION'; payload: Medication }
  | { type: 'UPDATE_MEDICATION'; payload: Medication }
  | { type: 'DELETE_MEDICATION'; payload: string }
  | { type: 'ADD_STOCK_MOVEMENT'; payload: StockMovement }
  | { type: 'UPDATE_STOCK_MOVEMENT'; payload: StockMovement }
  | { type: 'DELETE_STOCK_MOVEMENT'; payload: string }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: Invoice }
  | { type: 'DELETE_INVOICE'; payload: string }
  | { type: 'ADD_LAB_RESULT'; payload: LabResult }
  | { type: 'UPDATE_LAB_RESULT'; payload: LabResult }
  | { type: 'DELETE_LAB_RESULT'; payload: string }
  | { type: 'ADD_LAB_TEST'; payload: LabTest }
  | { type: 'UPDATE_LAB_TEST'; payload: LabTest }
  | { type: 'DELETE_LAB_TEST'; payload: string }
  | { type: 'ADD_CARE_RECORD'; payload: PatientCareRecord }
  | { type: 'UPDATE_CARE_RECORD'; payload: PatientCareRecord }
  | { type: 'DELETE_CARE_RECORD'; payload: string }
  | { type: 'ADD_HOSPITALIZATION'; payload: Hospitalization }
  | { type: 'UPDATE_HOSPITALIZATION'; payload: Hospitalization }
  | { type: 'DELETE_HOSPITALIZATION'; payload: string }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'DELETE_ROOM'; payload: string }
  | { type: 'ADD_INSURANCE_PROVIDER'; payload: InsuranceProvider }
  | { type: 'UPDATE_INSURANCE_PROVIDER'; payload: InsuranceProvider }
  | { type: 'DELETE_INSURANCE_PROVIDER'; payload: string }
  | { type: 'ADD_INSURANCE_POLICY'; payload: InsurancePolicy }
  | { type: 'UPDATE_INSURANCE_POLICY'; payload: InsurancePolicy }
  | { type: 'DELETE_INSURANCE_POLICY'; payload: string }
  | { type: 'ADD_PATIENT_INSURANCE'; payload: PatientInsurance }
  | { type: 'UPDATE_PATIENT_INSURANCE'; payload: PatientInsurance }
  | { type: 'DELETE_PATIENT_INSURANCE'; payload: string }
  | { type: 'ADD_INSURANCE_CLAIM'; payload: InsuranceClaim }
  | { type: 'UPDATE_INSURANCE_CLAIM'; payload: InsuranceClaim }
  | { type: 'DELETE_INSURANCE_CLAIM'; payload: string }
  | { type: 'UPDATE_DASHBOARD_STATS'; payload: DashboardStats };

const initialState: AppState = {
  patients: [],
  doctors: [],
  appointments: [],
  consultations: [],
  medications: [],
  stockMovements: [],
  invoices: [],
  labResults: [],
  labTests: [],
  careServices: [],
  patientCareRecords: [],
  hospitalizations: [],
  rooms: [],
  insuranceProviders: [],
  insurancePolicies: [],
  patientInsurances: [],
  insuranceClaims: [],
  currentUser: null,
  dashboardStats: {
    todayPatients: 0,
    todayAppointments: 0,
    todayRevenue: 0,
    totalPatients: 0,
    activeStaff: 0,
    pendingAppointments: 0,
    lowStockMedications: 0,
    overdueInvoices: 0
  },
  isLoading: true,
  theme: 'light',
  currency: 'XOF'
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    case 'ADD_PATIENT':
      return { ...state, patients: [...state.patients, action.payload] };
    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PATIENT':
      return {
        ...state,
        patients: state.patients.filter(p => p.id !== action.payload)
      };
    case 'ADD_DOCTOR':
      return { ...state, doctors: [...state.doctors, action.payload] };
    case 'UPDATE_DOCTOR':
      return {
        ...state,
        doctors: state.doctors.map(d => d.id === action.payload.id ? action.payload : d)
      };
    case 'DELETE_DOCTOR':
      return {
        ...state,
        doctors: state.doctors.filter(d => d.id !== action.payload)
      };
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(a => a.id === action.payload.id ? action.payload : a)
      };
    case 'DELETE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.filter(a => a.id !== action.payload)
      };
    case 'ADD_CONSULTATION':
      return { ...state, consultations: [...state.consultations, action.payload] };
    case 'UPDATE_CONSULTATION':
      return {
        ...state,
        consultations: state.consultations.map(c => c.id === action.payload.id ? action.payload : c)
      };
    case 'DELETE_CONSULTATION':
      return {
        ...state,
        consultations: state.consultations.filter(c => c.id !== action.payload)
      };
    case 'ADD_MEDICATION':
      return { ...state, medications: [...state.medications, action.payload] };
    case 'UPDATE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map(m => m.id === action.payload.id ? action.payload : m)
      };
    case 'DELETE_MEDICATION':
      return {
        ...state,
        medications: state.medications.filter(m => m.id !== action.payload)
      };
    case 'ADD_STOCK_MOVEMENT':
      return { ...state, stockMovements: [...state.stockMovements, action.payload] };
    case 'UPDATE_STOCK_MOVEMENT':
      return {
        ...state,
        stockMovements: state.stockMovements.map(m => m.id === action.payload.id ? action.payload : m)
      };
    case 'DELETE_STOCK_MOVEMENT':
      return {
        ...state,
        stockMovements: state.stockMovements.filter(m => m.id !== action.payload)
      };
    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.payload] };
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(i => i.id === action.payload.id ? action.payload : i)
      };
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter(i => i.id !== action.payload)
      };
    case 'ADD_LAB_RESULT':
      return { ...state, labResults: [...state.labResults, action.payload] };
    case 'UPDATE_LAB_RESULT':
      return {
        ...state,
        labResults: state.labResults.map(lr => lr.id === action.payload.id ? action.payload : lr)
      };
    case 'DELETE_LAB_RESULT':
      return {
        ...state,
        labResults: state.labResults.filter(lr => lr.id !== action.payload)
      };
    case 'ADD_LAB_TEST':
      return { ...state, labTests: [...state.labTests, action.payload] };
    case 'UPDATE_LAB_TEST':
      return {
        ...state,
        labTests: state.labTests.map(lt => lt.id === action.payload.id ? action.payload : lt)
      };
    case 'DELETE_LAB_TEST':
      return {
        ...state,
        labTests: state.labTests.filter(lt => lt.id !== action.payload)
      };
    case 'ADD_CARE_RECORD':
      return { ...state, patientCareRecords: [...state.patientCareRecords, action.payload] };
    case 'UPDATE_CARE_RECORD':
      return {
        ...state,
        patientCareRecords: state.patientCareRecords.map(c => c.id === action.payload.id ? action.payload : c)
      };
    case 'DELETE_CARE_RECORD':
      return {
        ...state,
        patientCareRecords: state.patientCareRecords.filter(c => c.id !== action.payload)
      };
    case 'ADD_HOSPITALIZATION':
      return { ...state, hospitalizations: [...state.hospitalizations, action.payload] };
    case 'UPDATE_HOSPITALIZATION':
      return {
        ...state,
        hospitalizations: state.hospitalizations.map(h => h.id === action.payload.id ? action.payload : h)
      };
    case 'DELETE_HOSPITALIZATION':
      return {
        ...state,
        hospitalizations: state.hospitalizations.filter(h => h.id !== action.payload)
      };
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(r => r.id === action.payload.id ? action.payload : r)
      };
    case 'DELETE_ROOM':
      return {
        ...state,
        rooms: state.rooms.filter(r => r.id !== action.payload)
      };
    case 'ADD_INSURANCE_PROVIDER':
      return { ...state, insuranceProviders: [...state.insuranceProviders, action.payload] };
    case 'UPDATE_INSURANCE_PROVIDER':
      return {
        ...state,
        insuranceProviders: state.insuranceProviders.map(ip => ip.id === action.payload.id ? action.payload : ip)
      };
    case 'DELETE_INSURANCE_PROVIDER':
      return {
        ...state,
        insuranceProviders: state.insuranceProviders.filter(ip => ip.id !== action.payload)
      };
    case 'ADD_INSURANCE_POLICY':
      return { ...state, insurancePolicies: [...state.insurancePolicies, action.payload] };
    case 'UPDATE_INSURANCE_POLICY':
      return {
        ...state,
        insurancePolicies: state.insurancePolicies.map(ip => ip.id === action.payload.id ? action.payload : ip)
      };
    case 'DELETE_INSURANCE_POLICY':
      return {
        ...state,
        insurancePolicies: state.insurancePolicies.filter(ip => ip.id !== action.payload)
      };
    case 'ADD_PATIENT_INSURANCE':
      return { ...state, patientInsurances: [...state.patientInsurances, action.payload] };
    case 'UPDATE_PATIENT_INSURANCE':
      return {
        ...state,
        patientInsurances: state.patientInsurances.map(pi => pi.id === action.payload.id ? action.payload : pi)
      };
    case 'DELETE_PATIENT_INSURANCE':
      return {
        ...state,
        patientInsurances: state.patientInsurances.filter(pi => pi.id !== action.payload)
      };
    case 'ADD_INSURANCE_CLAIM':
      return { ...state, insuranceClaims: [...state.insuranceClaims, action.payload] };
    case 'UPDATE_INSURANCE_CLAIM':
      return {
        ...state,
        insuranceClaims: state.insuranceClaims.map(ic => ic.id === action.payload.id ? action.payload : ic)
      };
    case 'DELETE_INSURANCE_CLAIM':
      return {
        ...state,
        insuranceClaims: state.insuranceClaims.filter(ic => ic.id !== action.payload)
      };
    case 'UPDATE_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Charger toutes les données depuis Supabase
        const [
          patients,
          doctors,
          appointments,
          consultations,
          medications,
          invoices,
          labResults
        ] = await Promise.all([
          patientService.getAll(),
          doctorService.getAll(),
          appointmentService.getAll(),
          consultationService.getAll(),
          medicationService.getAll(),
          invoiceService.getAll(),
          labResultService.getAll()
        ]);

        // Données simulées pour les mouvements de stock
        const stockMovements: StockMovement[] = [
          {
            id: '1',
            medicationId: '770e8400-e29b-41d4-a716-446655440001',
            date: '2024-02-01T09:30:00',
            type: 'entry',
            quantity: 100,
            reason: 'Approvisionnement initial',
            operator: 'Pharmacien Chef',
            reference: 'BON-2024-001'
          },
          {
            id: '2',
            medicationId: '770e8400-e29b-41d4-a716-446655440001',
            date: '2024-02-05T14:15:00',
            type: 'exit',
            quantity: -20,
            reason: 'Prescription patient',
            operator: 'Pharmacien Assistant',
            reference: 'PRES-2024-123'
          },
          {
            id: '3',
            medicationId: '770e8400-e29b-41d4-a716-446655440002',
            date: '2024-02-02T10:00:00',
            type: 'entry',
            quantity: 50,
            reason: 'Approvisionnement',
            operator: 'Pharmacien Chef',
            reference: 'BON-2024-002'
          },
          {
            id: '4',
            medicationId: '770e8400-e29b-41d4-a716-446655440003',
            date: '2024-02-10T11:30:00',
            type: 'loss',
            quantity: -5,
            reason: 'Produit endommagé',
            operator: 'Pharmacien Assistant',
            reference: 'PERTE-2024-001'
          },
          {
            id: '5',
            medicationId: '770e8400-e29b-41d4-a716-446655440002',
            date: '2024-02-12T16:45:00',
            type: 'exit',
            quantity: -10,
            reason: 'Prescription patient',
            operator: 'Pharmacien Assistant',
            reference: 'PRES-2024-145'
          },
          {
            id: '6',
            medicationId: '770e8400-e29b-41d4-a716-446655440005',
            date: '2024-02-15T09:00:00',
            type: 'adjustment',
            quantity: 5,
            reason: 'Correction après inventaire',
            operator: 'Pharmacien Chef',
            reference: 'INV-2024-001'
          }
        ];

        // Données simulées pour les services de soins
        const careServices: CareService[] = [
          { id: '1', name: 'Pansement simple', category: 'Soins infirmiers', description: 'Pansement pour plaie simple', unitPrice: 2500, durationMinutes: 15, requiresDoctor: false, isActive: true, createdAt: new Date().toISOString() },
          { id: '2', name: 'Pansement complexe', category: 'Soins infirmiers', description: 'Pansement pour plaie complexe ou chirurgicale', unitPrice: 5000, durationMinutes: 30, requiresDoctor: false, isActive: true, createdAt: new Date().toISOString() },
          { id: '3', name: 'Injection intramusculaire', category: 'Soins infirmiers', description: 'Administration de médicament par voie IM', unitPrice: 1500, durationMinutes: 10, requiresDoctor: false, isActive: true, createdAt: new Date().toISOString() },
          { id: '4', name: 'Injection intraveineuse', category: 'Soins infirmiers', description: 'Administration de médicament par voie IV', unitPrice: 2000, durationMinutes: 15, requiresDoctor: false, isActive: true, createdAt: new Date().toISOString() },
          { id: '5', name: 'Perfusion', category: 'Soins infirmiers', description: 'Mise en place et surveillance de perfusion', unitPrice: 8000, durationMinutes: 45, requiresDoctor: false, isActive: true, createdAt: new Date().toISOString() },
          { id: '6', name: 'Électrocardiogramme (ECG)', category: 'Examens', description: 'Enregistrement de l\'activité cardiaque', unitPrice: 15000, durationMinutes: 20, requiresDoctor: true, isActive: true, createdAt: new Date().toISOString() },
          { id: '7', name: 'Radiographie thoracique', category: 'Imagerie', description: 'Radiographie du thorax', unitPrice: 25000, durationMinutes: 15, requiresDoctor: true, isActive: true, createdAt: new Date().toISOString() },
          { id: '8', name: 'Échographie abdominale', category: 'Imagerie', description: 'Échographie de l\'abdomen', unitPrice: 35000, durationMinutes: 30, requiresDoctor: true, isActive: true, createdAt: new Date().toISOString() },
          { id: '9', name: 'Suture simple', category: 'Chirurgie mineure', description: 'Suture de plaie simple', unitPrice: 12000, durationMinutes: 30, requiresDoctor: true, isActive: true, createdAt: new Date().toISOString() },
          { id: '10', name: 'Kinésithérapie', category: 'Rééducation', description: 'Séance de kinésithérapie', unitPrice: 18000, durationMinutes: 60, requiresDoctor: false, isActive: true, createdAt: new Date().toISOString() }
        ];

        // Données simulées pour les fiches de soins
        const patientCareRecords: PatientCareRecord[] = [
          {
            id: '1',
            patientId: '550e8400-e29b-41d4-a716-446655440001',
            doctorId: '660e8400-e29b-41d4-a716-446655440001',
            careDate: '2024-02-15',
            status: 'completed',
            totalCost: 18500,
            notes: 'Soins post-consultation',
            careItems: [
              { id: '1', careRecordId: '1', careServiceId: '6', quantity: 1, unitPrice: 15000, totalPrice: 15000, performedAt: '2024-02-15T10:30:00', performedBy: 'Infirmière Awa', notes: '' },
              { id: '2', careRecordId: '1', careServiceId: '3', quantity: 1, unitPrice: 1500, totalPrice: 1500, performedAt: '2024-02-15T11:00:00', performedBy: 'Infirmière Fatou', notes: '' }
            ],
            createdAt: '2024-02-15T09:00:00',
            updatedAt: '2024-02-15T11:30:00'
          },
          {
            id: '2',
            patientId: '550e8400-e29b-41d4-a716-446655440003',
            doctorId: '660e8400-e29b-41d4-a716-446655440003',
            careDate: '2024-02-14',
            status: 'completed',
            totalCost: 8500,
            notes: 'Soins de vaccination',
            careItems: [
              { id: '3', careRecordId: '2', careServiceId: '1', quantity: 2, unitPrice: 2500, totalPrice: 5000, performedAt: '2024-02-14T16:30:00', performedBy: 'Infirmière Mame', notes: '' },
              { id: '4', careRecordId: '2', careServiceId: '3', quantity: 2, unitPrice: 1500, totalPrice: 3000, performedAt: '2024-02-14T17:00:00', performedBy: 'Infirmière Mame', notes: '' }
            ],
            createdAt: '2024-02-14T16:00:00',
            updatedAt: '2024-02-14T17:30:00'
          },
          {
            id: '3',
            patientId: '550e8400-e29b-41d4-a716-446655440005',
            doctorId: '660e8400-e29b-41d4-a716-446655440004',
            careDate: '2024-02-18',
            status: 'in-progress',
            totalCost: 12000,
            notes: 'Soins dermatologiques',
            careItems: [
              { id: '5', careRecordId: '3', careServiceId: '9', quantity: 1, unitPrice: 12000, totalPrice: 12000, performedBy: '', notes: '' }
            ],
            createdAt: '2024-02-18T09:00:00',
            updatedAt: '2024-02-18T09:00:00'
          }
        ];

        // Données simulées pour les hospitalisations
        const hospitalizations: Hospitalization[] = [
          {
            id: '1',
            patientId: '550e8400-e29b-41d4-a716-446655440002',
            doctorId: '660e8400-e29b-41d4-a716-446655440002',
            roomId: '3',
            bedId: 'bed-3-1',
            admissionDate: '2024-02-10T08:30:00',
            admissionReason: 'Surveillance post-infarctus',
            dischargeSummary: '',
            status: 'active',
            dailyCost: 25000,
            totalCost: 125000,
            insuranceCovered: true,
            emergencyAdmission: true,
            services: [
              { id: '1', hospitalizationId: '1', careServiceId: '6', serviceDate: '2024-02-10', quantity: 5, unitPrice: 5000, totalPrice: 25000, performedBy: 'Équipe soins intensifs', notes: '' },
              { id: '2', hospitalizationId: '1', careServiceId: '6', serviceDate: '2024-02-11', quantity: 3, unitPrice: 15000, totalPrice: 45000, performedBy: 'Cardiologue', notes: '' }
            ],
            createdAt: '2024-02-10T08:30:00',
            updatedAt: '2024-02-10T08:30:00'
          }
        ];

        // Données simulées pour les chambres avec lits
        const rooms: Room[] = [
          { 
            id: '1', 
            roomNumber: '101', 
            roomType: 'standard', 
            bedCount: 2, 
            dailyRate: 15000, 
            amenities: ['Climatisation', 'Télévision'],
            floorNumber: 1,
            description: 'Chambre standard avec deux lits',
            beds: [
              { id: 'bed-1-1', roomId: '1', bedNumber: '101-1', status: 'available', isOccupied: false },
              { id: 'bed-1-2', roomId: '1', bedNumber: '101-2', status: 'available', isOccupied: false }
            ],
            createdAt: new Date().toISOString()
          },
          { 
            id: '2', 
            roomNumber: '102', 
            roomType: 'standard', 
            bedCount: 2, 
            dailyRate: 15000,
            amenities: ['Climatisation', 'Télévision'],
            floorNumber: 1,
            description: 'Chambre standard avec deux lits',
            beds: [
              { id: 'bed-2-1', roomId: '2', bedNumber: '102-1', status: 'available', isOccupied: false },
              { id: 'bed-2-2', roomId: '2', bedNumber: '102-2', status: 'occupied', isOccupied: true, currentPatientId: '550e8400-e29b-41d4-a716-446655440004' }
            ],
            createdAt: new Date().toISOString()
          },
          { 
            id: '3', 
            roomNumber: '103', 
            roomType: 'private', 
            bedCount: 1, 
            dailyRate: 25000,
            amenities: ['Climatisation', 'Télévision', 'Réfrigérateur', 'Salle de bain privée'],
            floorNumber: 1,
            description: 'Chambre privée avec salle de bain',
            beds: [
              { id: 'bed-3-1', roomId: '3', bedNumber: '103-1', status: 'occupied', isOccupied: true, currentPatientId: '550e8400-e29b-41d4-a716-446655440002' }
            ],
            createdAt: new Date().toISOString()
          },
          { 
            id: '4', 
            roomNumber: '104', 
            roomType: 'private', 
            bedCount: 1, 
            dailyRate: 25000,
            amenities: ['Climatisation', 'Télévision', 'Réfrigérateur', 'Salle de bain privée'],
            floorNumber: 1,
            description: 'Chambre privée avec salle de bain',
            beds: [
              { id: 'bed-4-1', roomId: '4', bedNumber: '104-1', status: 'available', isOccupied: false }
            ],
            createdAt: new Date().toISOString()
          },
          { 
            id: '5', 
            roomNumber: '201', 
            roomType: 'vip', 
            bedCount: 1, 
            dailyRate: 50000,
            amenities: ['Climatisation', 'Télévision', 'Réfrigérateur', 'Salle de bain privée', 'Canapé', 'WiFi'],
            floorNumber: 2,
            description: 'Suite VIP avec équipements premium',
            beds: [
              { id: 'bed-5-1', roomId: '5', bedNumber: '201-1', status: 'available', isOccupied: false }
            ],
            createdAt: new Date().toISOString()
          },
          { 
            id: '6', 
            roomNumber: '202', 
            roomType: 'vip', 
            bedCount: 1, 
            dailyRate: 50000,
            amenities: ['Climatisation', 'Télévision', 'Réfrigérateur', 'Salle de bain privée', 'Canapé', 'WiFi'],
            floorNumber: 2,
            description: 'Suite VIP avec équipements premium',
            beds: [
              { id: 'bed-6-1', roomId: '6', bedNumber: '202-1', status: 'available', isOccupied: false }
            ],
            createdAt: new Date().toISOString()
          },
          { 
            id: '7', 
            roomNumber: '301', 
            roomType: 'icu', 
            bedCount: 1, 
            dailyRate: 75000,
            amenities: ['Monitoring cardiaque', 'Ventilateur', 'Défibrillateur'],
            floorNumber: 3,
            description: 'Unité de soins intensifs',
            beds: [
              { id: 'bed-7-1', roomId: '7', bedNumber: '301-1', status: 'available', isOccupied: false }
            ],
            createdAt: new Date().toISOString()
          },
          { 
            id: '8', 
            roomNumber: '302', 
            roomType: 'icu', 
            bedCount: 1, 
            dailyRate: 75000,
            amenities: ['Monitoring cardiaque', 'Ventilateur', 'Défibrillateur'],
            floorNumber: 3,
            description: 'Unité de soins intensifs',
            beds: [
              { id: 'bed-8-1', roomId: '8', bedNumber: '302-1', status: 'available', isOccupied: false }
            ],
            createdAt: new Date().toISOString()
          }
        ];

        // Données simulées pour les tests de laboratoire
        const labTests: LabTest[] = [
          {
            id: '1',
            name: 'Numération Formule Sanguine (NFS)',
            category: 'Hématologie',
            description: 'Analyse complète des cellules sanguines',
            price: 15000,
            sampleType: 'Sang',
            processingTime: '1 jour',
            parameters: [
              { id: '1-1', name: 'Hémoglobine', unit: 'g/dL', referenceRangeMin: 12, referenceRangeMax: 16 },
              { id: '1-2', name: 'Globules rouges', unit: 'millions/mm³', referenceRangeMin: 4.2, referenceRangeMax: 5.4 },
              { id: '1-3', name: 'Globules blancs', unit: 'milliers/mm³', referenceRangeMin: 4, referenceRangeMax: 10 },
              { id: '1-4', name: 'Plaquettes', unit: 'milliers/mm³', referenceRangeMin: 150, referenceRangeMax: 400 }
            ],
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Bilan lipidique complet',
            category: 'Biochimie',
            description: 'Mesure des lipides sanguins',
            price: 20000,
            sampleType: 'Sang',
            processingTime: '1 jour',
            parameters: [
              { id: '2-1', name: 'Cholestérol total', unit: 'mg/dL', referenceRangeMin: 0, referenceRangeMax: 200 },
              { id: '2-2', name: 'HDL', unit: 'mg/dL', referenceRangeMin: 40, referenceRangeMax: 999 },
              { id: '2-3', name: 'LDL', unit: 'mg/dL', referenceRangeMin: 0, referenceRangeMax: 130 },
              { id: '2-4', name: 'Triglycérides', unit: 'mg/dL', referenceRangeMin: 0, referenceRangeMax: 150 }
            ],
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Glycémie à jeun',
            category: 'Biochimie',
            description: 'Mesure du taux de glucose sanguin',
            price: 5000,
            sampleType: 'Sang',
            processingTime: 'Même jour',
            parameters: [
              { id: '3-1', name: 'Glucose', unit: 'mg/dL', referenceRangeMin: 70, referenceRangeMax: 100 }
            ],
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Test de grossesse (β-HCG)',
            category: 'Immunologie',
            description: 'Détection de l\'hormone de grossesse',
            price: 10000,
            sampleType: 'Urine',
            processingTime: 'Même jour',
            parameters: [
              { id: '4-1', name: 'β-HCG', unit: '', referenceRangeText: 'Négatif si non enceinte' }
            ],
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '5',
            name: 'Goutte épaisse (Paludisme)',
            category: 'Parasitologie',
            description: 'Recherche de Plasmodium',
            price: 3000,
            sampleType: 'Sang',
            processingTime: 'Même jour',
            parameters: [
              { id: '5-1', name: 'Plasmodium', unit: '', referenceRangeText: 'Négatif' }
            ],
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ];

        // Données simulées pour les compagnies d'assurance
        const insuranceProviders: InsuranceProvider[] = [
          {
            id: '1',
            name: 'IPRES',
            address: '10 Avenue Léopold Sédar Senghor, Dakar',
            phone: '+221 33 889 12 34',
            email: 'contact@ipres.sn',
            contactPerson: 'Mamadou Diop',
            website: 'www.ipres.sn',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'CSS',
            address: '25 Rue Félix Faure, Dakar',
            phone: '+221 33 823 45 67',
            email: 'info@css.sn',
            contactPerson: 'Fatou Ndiaye',
            website: 'www.css.sn',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Mutuelle Santé',
            address: '5 Avenue Cheikh Anta Diop, Dakar',
            phone: '+221 33 867 89 01',
            email: 'contact@mutuellesante.sn',
            contactPerson: 'Ousmane Sow',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            name: 'SUNU Assurances',
            address: '18 Boulevard de la République, Dakar',
            phone: '+221 33 839 12 34',
            email: 'info@sunuassurances.sn',
            contactPerson: 'Aïssatou Diallo',
            website: 'www.sunuassurances.sn',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '5',
            name: 'NSIA Assurances',
            address: '7 Rue Carnot, Dakar',
            phone: '+221 33 842 56 78',
            email: 'contact@nsia.sn',
            contactPerson: 'Ibrahima Fall',
            website: 'www.nsia.sn',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ];

        // Données simulées pour les polices d'assurance
        const insurancePolicies: InsurancePolicy[] = [
          {
            id: '1',
            providerId: '1',
            name: 'IPRES Standard',
            description: 'Couverture de base pour les fonctionnaires',
            coveragePercentage: 80,
            annualLimit: 1000000,
            coverageDetails: {
              consultations: true,
              medications: true,
              hospitalizations: true,
              laboratory: true,
              surgery: true,
              emergency: true
            },
            exclusions: ['Chirurgie esthétique', 'Soins dentaires cosmétiques'],
            waitingPeriod: 30,
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            providerId: '1',
            name: 'IPRES Premium',
            description: 'Couverture étendue pour les cadres supérieurs',
            coveragePercentage: 90,
            annualLimit: 2000000,
            coverageDetails: {
              consultations: true,
              medications: true,
              hospitalizations: true,
              laboratory: true,
              surgery: true,
              emergency: true
            },
            exclusions: ['Chirurgie esthétique'],
            waitingPeriod: 15,
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            providerId: '2',
            name: 'CSS Basique',
            description: 'Couverture de base pour les employés',
            coveragePercentage: 70,
            annualLimit: 800000,
            coverageDetails: {
              consultations: true,
              medications: true,
              hospitalizations: true,
              laboratory: true,
              surgery: false,
              emergency: true
            },
            exclusions: ['Chirurgie esthétique', 'Soins dentaires', 'Optique'],
            waitingPeriod: 60,
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            providerId: '3',
            name: 'Mutuelle Familiale',
            description: 'Couverture pour toute la famille',
            coveragePercentage: 75,
            annualLimit: 1200000,
            coverageDetails: {
              consultations: true,
              medications: true,
              hospitalizations: true,
              laboratory: true,
              surgery: true,
              emergency: true
            },
            exclusions: ['Chirurgie esthétique', 'Traitements expérimentaux'],
            waitingPeriod: 45,
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '5',
            providerId: '4',
            name: 'SUNU Santé Plus',
            description: 'Couverture complète avec options premium',
            coveragePercentage: 85,
            annualLimit: 1500000,
            coverageDetails: {
              consultations: true,
              medications: true,
              hospitalizations: true,
              laboratory: true,
              surgery: true,
              emergency: true
            },
            exclusions: ['Chirurgie esthétique'],
            waitingPeriod: 30,
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ];

        // Données simulées pour les assurances des patients
        const patientInsurances: PatientInsurance[] = [
          {
            id: '1',
            patientId: '550e8400-e29b-41d4-a716-446655440001',
            providerId: '1',
            policyId: '1',
            policyNumber: '1 85 03 75 123 456 78',
            cardNumber: 'IPRES-123456',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'active',
            coveragePercentage: 80,
            annualLimit: 1000000,
            usedAmount: 45000,
            notes: 'Renouvellement automatique',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            patientId: '550e8400-e29b-41d4-a716-446655440002',
            providerId: '2',
            policyId: '3',
            policyNumber: '1 78 07 69 234 567 89',
            cardNumber: 'CSS-234567',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'active',
            coveragePercentage: 70,
            annualLimit: 800000,
            usedAmount: 120000,
            dependents: [
              { name: 'Fatou Ndiaye', relationship: 'Épouse', dateOfBirth: '1980-05-15' },
              { name: 'Amadou Ndiaye', relationship: 'Fils', dateOfBirth: '2010-08-22' }
            ],
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            patientId: '550e8400-e29b-41d4-a716-446655440003',
            providerId: '3',
            policyId: '4',
            policyNumber: 'MS 92 11 08 345 678',
            startDate: '2024-02-01',
            endDate: '2025-01-31',
            status: 'active',
            coveragePercentage: 75,
            annualLimit: 1200000,
            usedAmount: 30000,
            createdAt: new Date().toISOString()
          }
        ];

        // Données simulées pour les demandes de remboursement
        const insuranceClaims: InsuranceClaim[] = [
          {
            id: '1',
            patientId: '550e8400-e29b-41d4-a716-446655440001',
            patientInsuranceId: '1',
            invoiceId: 'aa0e8400-e29b-41d4-a716-446655440002',
            claimNumber: 'CLM-2024-001',
            submissionDate: '2024-02-16',
            totalAmount: 25000,
            coveredAmount: 20000,
            patientResponsibility: 5000,
            status: 'approved',
            approvalDate: '2024-02-20',
            paymentDate: '2024-02-25',
            notes: 'Remboursement consultation et médicaments',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            patientId: '550e8400-e29b-41d4-a716-446655440002',
            patientInsuranceId: '2',
            invoiceId: 'aa0e8400-e29b-41d4-a716-446655440003',
            claimNumber: 'CLM-2024-002',
            submissionDate: '2024-02-13',
            totalAmount: 25000,
            coveredAmount: 17500,
            patientResponsibility: 7500,
            status: 'in-review',
            notes: 'En attente de validation par l\'assureur',
            createdAt: new Date().toISOString()
          }
        ];

        // Calculer les statistiques du dashboard
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointments.filter(a => a.date === today).length;
        const todayRevenue = invoices
          .filter(i => i.date === today && i.status === 'paid')
          .reduce((sum, invoice) => sum + invoice.total, 0);
        const pendingAppointments = appointments.filter(a => a.status === 'scheduled').length;
        const lowStockMedications = medications.filter(m => m.stock <= m.minStock).length;
        const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

        const dashboardStats: DashboardStats = {
          todayPatients: todayAppointments,
          todayAppointments,
          todayRevenue,
          totalPatients: patients.length,
          activeStaff: doctors.length,
          pendingAppointments,
          lowStockMedications,
          overdueInvoices
        };

        dispatch({
          type: 'LOAD_DATA',
          payload: {
            patients,
            doctors,
            appointments,
            consultations,
            medications,
            stockMovements,
            invoices,
            labResults,
            labTests,
            careServices,
            patientCareRecords,
            hospitalizations,
            rooms,
            insuranceProviders,
            insurancePolicies,
            patientInsurances,
            insuranceClaims,
            dashboardStats
          }
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  // Charger le thème depuis localStorage et appliquer la classe au document
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  // Appliquer le thème au document
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
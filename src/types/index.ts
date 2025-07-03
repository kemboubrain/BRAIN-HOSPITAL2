export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  bloodGroup: string;
  allergies: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: {
    provider: string;
    number: string;
    coverage: number;
    expiryDate?: string;
    policyType?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  phone: string;
  email: string;
  schedule: {
    [key: string]: {
      start: string;
      end: string;
      available: boolean;
    };
  };
  consultationFee: number;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency' | 'surgery';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
  createdAt: string;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  prescription: Prescription[];
  notes: string;
  followUpDate?: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  medicationId: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Medication {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  stock: number;
  unitPrice: number;
  minStock: number;
  description: string;
  location?: string;
  dosageForm?: string;
  dosageStrength?: string;
  packSize?: string;
  isActive?: boolean;
}

export interface StockMovement {
  id: string;
  medicationId: string;
  date: string;
  type: 'entry' | 'exit' | 'adjustment' | 'loss';
  quantity: number;
  reason: string;
  reference?: string;
  operator: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  consultationId?: string;
  hospitalizationId?: string;
  labResultId?: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  insuranceCoverage?: number;
  patientResponsibility?: number;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'insurance-pending';
  paymentMethod?: string;
  paymentDate?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface LabResult {
  id: string;
  patientId: string;
  consultationId?: string;
  testType: string;
  testDate: string;
  sampleType: string;
  sampleCollectionDate: string;
  results: {
    [key: string]: {
      value: string;
      unit: string;
      referenceRange: string;
      status: 'normal' | 'abnormal' | 'critical';
    };
  };
  conclusion: string;
  technician: string;
  validatedBy?: string;
  validationDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  sampleType: string;
  processingTime: string;
  parameters: LabParameter[];
  isActive: boolean;
  createdAt: string;
}

export interface LabParameter {
  id: string;
  name: string;
  unit: string;
  referenceRangeMin?: number;
  referenceRangeMax?: number;
  referenceRangeText?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'manager' | 'accountant';
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  todayPatients: number;
  todayAppointments: number;
  todayRevenue: number;
  totalPatients: number;
  activeStaff: number;
  pendingAppointments: number;
  lowStockMedications: number;
  overdueInvoices: number;
}

// Nouvelles interfaces pour les soins
export interface CareService {
  id: string;
  name: string;
  category: string;
  description: string;
  unitPrice: number;
  durationMinutes: number;
  requiresDoctor: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface PatientCareRecord {
  id: string;
  patientId: string;
  doctorId?: string;
  careDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  totalCost: number;
  notes: string;
  careItems: CareItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CareItem {
  id: string;
  careRecordId: string;
  careServiceId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  performedAt?: string;
  performedBy: string;
  notes: string;
}

// Interfaces améliorées pour l'hospitalisation avec gestion des lits
export interface Room {
  id: string;
  roomNumber: string;
  roomType: 'standard' | 'private' | 'vip' | 'icu' | 'emergency';
  bedCount: number;
  dailyRate: number;
  amenities: string[];
  floorNumber: number;
  description: string;
  beds: Bed[];
  createdAt: string;
}

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  isOccupied: boolean;
  currentPatientId?: string;
  currentHospitalizationId?: string;
  lastCleaned?: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  notes?: string;
}

export interface Hospitalization {
  id: string;
  patientId: string;
  doctorId: string;
  roomId: string;
  bedId: string;
  admissionDate: string;
  dischargeDate?: string;
  admissionReason: string;
  dischargeSummary: string;
  status: 'active' | 'discharged' | 'transferred';
  dailyCost: number;
  totalCost: number;
  insuranceCovered: boolean;
  emergencyAdmission: boolean;
  services: HospitalizationService[];
  createdAt: string;
  updatedAt: string;
}

export interface HospitalizationService {
  id: string;
  hospitalizationId: string;
  careServiceId: string;
  serviceDate: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  performedBy: string;
  notes: string;
}

// Interface pour les services de facturation intégrée
export interface BillingService {
  id: string;
  type: 'care' | 'consultation' | 'medication' | 'hospitalization' | 'laboratory';
  name: string;
  category: string;
  price: number;
  duration?: number;
  requiresDoctor?: boolean;
  doctor?: string;
  manufacturer?: string;
  stock?: number;
  roomType?: string;
}

// Interfaces pour le système d'assurance
export interface InsuranceProvider {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  website?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface InsurancePolicy {
  id: string;
  providerId: string;
  name: string;
  description: string;
  coveragePercentage: number;
  annualLimit?: number;
  coverageDetails: {
    consultations: boolean;
    medications: boolean;
    hospitalizations: boolean;
    laboratory: boolean;
    surgery: boolean;
    emergency: boolean;
  };
  exclusions: string[];
  waitingPeriod?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PatientInsurance {
  id: string;
  patientId: string;
  providerId: string;
  policyId: string;
  policyNumber: string;
  cardNumber?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  coveragePercentage: number;
  annualLimit?: number;
  usedAmount?: number;
  dependents?: {
    name: string;
    relationship: string;
    dateOfBirth: string;
  }[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  patientInsuranceId: string;
  invoiceId: string;
  claimNumber: string;
  submissionDate: string;
  totalAmount: number;
  coveredAmount: number;
  patientResponsibility: number;
  status: 'submitted' | 'in-review' | 'approved' | 'partially-approved' | 'rejected' | 'paid';
  approvalDate?: string;
  paymentDate?: string;
  rejectionReason?: string;
  documents?: string[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Nouvelles interfaces pour la gestion des accès
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt?: string;
}

export interface Permission {
  id: string;
  module: Module;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export type Module = 
  | 'dashboard' 
  | 'patients' 
  | 'doctors' 
  | 'appointments' 
  | 'consultations' 
  | 'care' 
  | 'hospitalization' 
  | 'pharmacy' 
  | 'billing' 
  | 'laboratory' 
  | 'reports' 
  | 'insurance'
  | 'accessManagement';

export interface AccessLog {
  id: string;
  userId: string;
  action: 'create' | 'update' | 'delete';
  targetType: 'role' | 'permission' | 'user';
  targetId: string;
  details: string;
  timestamp: string;
}
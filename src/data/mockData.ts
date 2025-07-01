import { Patient, Doctor, Appointment, Consultation, Medication, Invoice, LabResult, User } from '../types';

// Cette fonction n'est plus utilisée car nous utilisons Supabase
// Conservée pour compatibilité
export function generateMockData() {
  return {
    patients: [],
    doctors: [],
    appointments: [],
    consultations: [],
    medications: [],
    invoices: [],
    labResults: [],
    dashboardStats: {
      todayPatients: 0,
      todayAppointments: 0,
      todayRevenue: 0,
      totalPatients: 0,
      activeStaff: 0,
      pendingAppointments: 0,
      lowStockMedications: 0,
      overdueInvoices: 0
    }
  };
}
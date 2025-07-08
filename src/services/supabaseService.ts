import { supabase } from '../lib/supabase';
import type { 
  Patient, 
  Doctor, 
  Appointment, 
  Consultation, 
  Medication, 
  Prescription,
  Invoice,
  InvoiceItem,
  LabResult,
  CareService,
  PatientCareRecord,
  CareItem,
  Room,
  Hospitalization,
  HospitalizationService
} from '../types';

// Patient Service
export const patientService = {
  async getAll() {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, patient: Partial<Patient>) {
    const { data, error } = await supabase
      .from('patients')
      .update(patient)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Doctor Service
export const doctorService = {
  async getAll() {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(doctor: Omit<Doctor, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('doctors')
      .insert(doctor)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, doctor: Partial<Doctor>) {
    const { data, error } = await supabase
      .from('doctors')
      .update(doctor)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Appointment Service
export const appointmentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*)
      `)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(appointment: Omit<Appointment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, appointment: Partial<Appointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update(appointment)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Consultation Service
export const consultationService = {
  async getAll() {
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*),
        appointment:appointments(*)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*),
        appointment:appointments(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(consultation: Omit<Consultation, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('consultations')
      .insert(consultation)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, consultation: Partial<Consultation>) {
    const { data, error } = await supabase
      .from('consultations')
      .update(consultation)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Medication Service
export const medicationService = {
  async getAll() {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(medication: Omit<Medication, 'id'>) {
    const { data, error } = await supabase
      .from('medications')
      .insert(medication)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, medication: Partial<Medication>) {
    const { data, error } = await supabase
      .from('medications')
      .update(medication)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Prescription Service
export const prescriptionService = {
  async getAll() {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        consultation:consultations(*),
        medication:medications(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getByConsultationId(consultationId: string) {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        medication:medications(*)
      `)
      .eq('consultation_id', consultationId);
    
    if (error) throw error;
    return data;
  },

  async create(prescription: Omit<Prescription, 'id'>) {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert(prescription)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, prescription: Partial<Prescription>) {
    const { data, error } = await supabase
      .from('prescriptions')
      .update(prescription)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Invoice Service
export const invoiceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        patient:patients(*),
        consultation:consultations(*)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        patient:patients(*),
        consultation:consultations(*),
        items:invoice_items(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(invoice: Omit<Invoice, 'id'>) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, invoice: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .update(invoice)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Invoice Item Service
export const invoiceItemService = {
  async getByInvoiceId(invoiceId: string) {
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);
    
    if (error) throw error;
    return data;
  },

  async create(item: Omit<InvoiceItem, 'id'>) {
    const { data, error } = await supabase
      .from('invoice_items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, item: Partial<InvoiceItem>) {
    const { data, error } = await supabase
      .from('invoice_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('invoice_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Lab Result Service
export const labResultService = {
  async getAll() {
    const { data, error } = await supabase
      .from('lab_results')
      .select(`
        *,
        patient:patients(*),
        consultation:consultations(*)
      `)
      .order('test_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('lab_results')
      .select(`
        *,
        patient:patients(*),
        consultation:consultations(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(labResult: Omit<LabResult, 'id'>) {
    const { data, error } = await supabase
      .from('lab_results')
      .insert(labResult)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, labResult: Partial<LabResult>) {
    const { data, error } = await supabase
      .from('lab_results')
      .update(labResult)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('lab_results')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Care Service
export const careService = {
  async getAll() {
    const { data, error } = await supabase
      .from('care_services')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('care_services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(careService: Omit<CareService, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('care_services')
      .insert(careService)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, careService: Partial<CareService>) {
    const { data, error } = await supabase
      .from('care_services')
      .update(careService)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('care_services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Patient Care Record Service
export const patientCareRecordService = {
  async getAll() {
    const { data, error } = await supabase
      .from('patient_care_records')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*)
      `)
      .order('care_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('patient_care_records')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*),
        care_items:care_items(*, care_service:care_services(*))
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(record: Omit<PatientCareRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('patient_care_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, record: Partial<PatientCareRecord>) {
    const { data, error } = await supabase
      .from('patient_care_records')
      .update(record)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('patient_care_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Care Item Service
export const careItemService = {
  async getByCareRecordId(careRecordId: string) {
    const { data, error } = await supabase
      .from('care_items')
      .select(`
        *,
        care_service:care_services(*)
      `)
      .eq('care_record_id', careRecordId);
    
    if (error) throw error;
    return data;
  },

  async create(item: Omit<CareItem, 'id'>) {
    const { data, error } = await supabase
      .from('care_items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, item: Partial<CareItem>) {
    const { data, error } = await supabase
      .from('care_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('care_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Room Service
export const roomService = {
  async getAll() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(room: Omit<Room, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('rooms')
      .insert(room)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, room: Partial<Room>) {
    const { data, error } = await supabase
      .from('rooms')
      .update(room)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Hospitalization Service
export const hospitalizationService = {
  async getAll() {
    const { data, error } = await supabase
      .from('hospitalizations')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*),
        room:rooms(*)
      `)
      .order('admission_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('hospitalizations')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*),
        room:rooms(*),
        services:hospitalization_services(*, care_service:care_services(*))
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(hospitalization: Omit<Hospitalization, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('hospitalizations')
      .insert(hospitalization)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, hospitalization: Partial<Hospitalization>) {
    const { data, error } = await supabase
      .from('hospitalizations')
      .update(hospitalization)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('hospitalizations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Hospitalization Service Items
export const hospitalizationServiceService = {
  async getByHospitalizationId(hospitalizationId: string) {
    const { data, error } = await supabase
      .from('hospitalization_services')
      .select(`
        *,
        care_service:care_services(*)
      `)
      .eq('hospitalization_id', hospitalizationId);
    
    if (error) throw error;
    return data;
  },

  async create(service: Omit<HospitalizationService, 'id'>) {
    const { data, error } = await supabase
      .from('hospitalization_services')
      .insert(service)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, service: Partial<HospitalizationService>) {
    const { data, error } = await supabase
      .from('hospitalization_services')
      .update(service)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('hospitalization_services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
import { supabase } from '../lib/supabase';
import { Patient, Doctor, Appointment, Consultation, Medication, Invoice, LabResult } from '../types';

// Service pour les patients
export const patientService = {
  async getAll(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(patient => ({
      id: patient.id,
      firstName: patient.first_name,
      lastName: patient.last_name,
      dateOfBirth: patient.date_of_birth,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      city: patient.city,
      postalCode: patient.postal_code,
      bloodGroup: patient.blood_group,
      allergies: patient.allergies,
      patientCode: patient.patient_code,
      emergencyContact: {
        name: patient.emergency_contact_name,
        phone: patient.emergency_contact_phone,
        relationship: patient.emergency_contact_relationship
      },
      insurance: {
        provider: patient.insurance_provider,
        number: patient.insurance_number
      },
      createdAt: patient.created_at,
      updatedAt: patient.updated_at
    }));
  },

  async create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert({
        first_name: patient.firstName,
        last_name: patient.lastName,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        city: patient.city,
        postal_code: patient.postalCode,
        blood_group: patient.bloodGroup,
        allergies: patient.allergies,
        emergency_contact_name: patient.emergencyContact.name,
        emergency_contact_phone: patient.emergencyContact.phone,
        emergency_contact_relationship: patient.emergencyContact.relationship,
        insurance_provider: patient.insurance.provider,
        insurance_number: patient.insurance.number
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      postalCode: data.postal_code,
      bloodGroup: data.blood_group,
      allergies: data.allergies,
      patientCode: data.patient_code,
      emergencyContact: {
        name: data.emergency_contact_name,
        phone: data.emergency_contact_phone,
        relationship: data.emergency_contact_relationship
      },
      insurance: {
        provider: data.insurance_provider,
        number: data.insurance_number
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async update(id: string, patient: Partial<Patient>): Promise<Patient> {
    const updateData: any = {};
    
    if (patient.firstName) updateData.first_name = patient.firstName;
    if (patient.lastName) updateData.last_name = patient.lastName;
    if (patient.dateOfBirth) updateData.date_of_birth = patient.dateOfBirth;
    if (patient.gender) updateData.gender = patient.gender;
    if (patient.phone) updateData.phone = patient.phone;
    if (patient.email) updateData.email = patient.email;
    if (patient.address) updateData.address = patient.address;
    if (patient.city) updateData.city = patient.city;
    if (patient.postalCode) updateData.postal_code = patient.postalCode;
    if (patient.bloodGroup) updateData.blood_group = patient.bloodGroup;
    if (patient.allergies) updateData.allergies = patient.allergies;
    if (patient.emergencyContact) {
      updateData.emergency_contact_name = patient.emergencyContact.name;
      updateData.emergency_contact_phone = patient.emergencyContact.phone;
      updateData.emergency_contact_relationship = patient.emergencyContact.relationship;
    }
    if (patient.insurance) {
      updateData.insurance_provider = patient.insurance.provider;
      updateData.insurance_number = patient.insurance.number;
    }

    const { data, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      postalCode: data.postal_code,
      bloodGroup: data.blood_group,
      allergies: data.allergies,
      patientCode: data.patient_code,
      emergencyContact: {
        name: data.emergency_contact_name,
        phone: data.emergency_contact_phone,
        relationship: data.emergency_contact_relationship
      },
      insurance: {
        provider: data.insurance_provider,
        number: data.insurance_number
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Service pour les médecins
export const doctorService = {
  async getAll(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(doctor => ({
      id: doctor.id,
      firstName: doctor.first_name,
      lastName: doctor.last_name,
      specialty: doctor.specialty,
      phone: doctor.phone,
      email: doctor.email,
      schedule: doctor.schedule,
      consultationFee: doctor.consultation_fee,
      createdAt: doctor.created_at
    }));
  }
};

// Service pour les rendez-vous
export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    return data.map(appointment => ({
      id: appointment.id,
      patientId: appointment.patient_id,
      doctorId: appointment.doctor_id,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      type: appointment.type as any,
      status: appointment.status as any,
      reason: appointment.reason,
      notes: appointment.notes,
      createdAt: appointment.created_at
    }));
  },

  async create(appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: appointment.patientId,
        doctor_id: appointment.doctorId,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        type: appointment.type,
        status: appointment.status,
        reason: appointment.reason,
        notes: appointment.notes || ''
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      patientId: data.patient_id,
      doctorId: data.doctor_id,
      date: data.date,
      time: data.time,
      duration: data.duration,
      type: data.type,
      status: data.status,
      reason: data.reason,
      notes: data.notes,
      createdAt: data.created_at
    };
  }
};

// Service pour les médicaments
export const medicationService = {
  async getAll(): Promise<Medication[]> {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(medication => ({
      id: medication.id,
      name: medication.name,
      category: medication.category,
      manufacturer: medication.manufacturer,
      batchNumber: medication.batch_number,
      expiryDate: medication.expiry_date,
      stock: medication.stock,
      unitPrice: medication.unit_price,
      minStock: medication.min_stock,
      description: medication.description
    }));
  }
};

// Service pour les consultations
export const consultationService = {
  async getAll(): Promise<Consultation[]> {
    const { data: consultationsData, error: consultationsError } = await supabase
      .from('consultations')
      .select('*')
      .order('date', { ascending: false });
    
    if (consultationsError) throw consultationsError;

    // Récupérer les prescriptions pour chaque consultation
    const consultations = await Promise.all(
      consultationsData.map(async (consultation) => {
        const { data: prescriptionsData, error: prescriptionsError } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('consultation_id', consultation.id);

        if (prescriptionsError) throw prescriptionsError;

        return {
          id: consultation.id,
          appointmentId: consultation.appointment_id,
          patientId: consultation.patient_id,
          doctorId: consultation.doctor_id,
          date: consultation.date,
          symptoms: consultation.symptoms,
          diagnosis: consultation.diagnosis,
          treatment: consultation.treatment,
          prescription: prescriptionsData.map(p => ({
            id: p.id,
            consultationId: p.consultation_id,
            medicationId: p.medication_id,
            dosage: p.dosage,
            frequency: p.frequency,
            duration: p.duration,
            instructions: p.instructions
          })),
          notes: consultation.notes,
          followUpDate: consultation.follow_up_date,
          createdAt: consultation.created_at
        };
      })
    );

    return consultations;
  }
};

// Service pour les factures
export const invoiceService = {
  async getAll(): Promise<Invoice[]> {
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .order('date', { ascending: false });
    
    if (invoicesError) throw invoicesError;

    // Récupérer les éléments pour chaque facture
    const invoices = await Promise.all(
      invoicesData.map(async (invoice) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', invoice.id);

        if (itemsError) throw itemsError;

        return {
          id: invoice.id,
          patientId: invoice.patient_id,
          consultationId: invoice.consultation_id,
          date: invoice.date,
          items: itemsData.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            total: item.total
          })),
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          total: invoice.total,
          status: invoice.status as any,
          paymentMethod: invoice.payment_method,
          paymentDate: invoice.payment_date
        };
      })
    );

    return invoices;
  }
};

// Service pour les résultats de laboratoire
export const labResultService = {
  async getAll(): Promise<LabResult[]> {
    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .order('test_date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(labResult => ({
      id: labResult.id,
      patientId: labResult.patient_id,
      consultationId: labResult.consultation_id,
      testType: labResult.test_type,
      testDate: labResult.test_date,
      results: labResult.results,
      conclusion: labResult.conclusion,
      technician: labResult.technician
    }));
  }
};
import { supabase } from '../lib/supabase';
import { Appointment } from '../types';

export const appointmentService = {
  async create(appointmentData: Omit<Appointment, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        patient_id: appointmentData.patientId,
        doctor_id: appointmentData.doctorId,
        date: appointmentData.date,
        time: appointmentData.time,
        duration: appointmentData.duration,
        type: appointmentData.type,
        status: appointmentData.status,
        reason: appointmentData.reason,
        notes: appointmentData.notes
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Transform the database response to match our frontend types
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
    } as Appointment;
  }
};
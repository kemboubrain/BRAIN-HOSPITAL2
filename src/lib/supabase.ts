import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour Supabase
export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: 'M' | 'F';
          phone: string;
          email: string;
          address: string;
          city: string;
          postal_code: string;
          blood_group: string;
          allergies: string;
          emergency_contact_name: string;
          emergency_contact_phone: string;
          emergency_contact_relationship: string;
          insurance_provider: string;
          insurance_number: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['patients']['Insert']>;
      };
      doctors: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          specialty: string;
          phone: string;
          email: string;
          schedule: any;
          consultation_fee: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['doctors']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['doctors']['Insert']>;
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          time: string;
          duration: number;
          type: string;
          status: string;
          reason: string;
          notes: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
      };
      consultations: {
        Row: {
          id: string;
          appointment_id: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          symptoms: string;
          diagnosis: string;
          treatment: string;
          notes: string;
          follow_up_date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['consultations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['consultations']['Insert']>;
      };
      medications: {
        Row: {
          id: string;
          name: string;
          category: string;
          manufacturer: string;
          batch_number: string;
          expiry_date: string;
          stock: number;
          unit_price: number;
          min_stock: number;
          description: string;
        };
        Insert: Omit<Database['public']['Tables']['medications']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['medications']['Insert']>;
      };
      prescriptions: {
        Row: {
          id: string;
          consultation_id: string;
          medication_id: string;
          dosage: string;
          frequency: string;
          duration: string;
          instructions: string;
        };
        Insert: Omit<Database['public']['Tables']['prescriptions']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['prescriptions']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          patient_id: string;
          consultation_id: string;
          date: string;
          subtotal: number;
          tax: number;
          total: number;
          status: string;
          payment_method: string;
          payment_date: string;
        };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
        };
        Insert: Omit<Database['public']['Tables']['invoice_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['invoice_items']['Insert']>;
      };
      lab_results: {
        Row: {
          id: string;
          patient_id: string;
          consultation_id: string;
          test_type: string;
          test_date: string;
          results: any;
          conclusion: string;
          technician: string;
        };
        Insert: Omit<Database['public']['Tables']['lab_results']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['lab_results']['Insert']>;
      };
    };
  };
}
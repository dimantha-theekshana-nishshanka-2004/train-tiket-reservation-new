import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Train {
  train_number: string;
  train_name: string;
  source_station: string;
  destination_station: string;
  available_days: string;
}

export interface Passenger {
  passenger_id: string;
  passenger_name: string;
  age: number;
  address: string;
  contact_number: string;
  created_at: string;
}

export interface TrainStatus {
  status_id: string;
  train_number: string;
  journey_date: string;
  total_seats: number;
  booked_seats: number;
  created_at: string;
}

export interface Ticket {
  ticket_id: string;
  passenger_id: string;
  train_number: string;
  journey_date: string;
  ticket_category: 'AC' | 'General';
  ticket_status: 'Confirmed' | 'Waiting' | 'Cancelled';
  fare: number;
  booking_date: string;
}

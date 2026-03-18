/*
  # Train Ticket Reservation System Schema

  1. New Tables
    - `train`
      - `train_number` (text, primary key) - Unique train identifier
      - `train_name` (text) - Name of the train
      - `source_station` (text) - Starting station
      - `destination_station` (text) - End station
      - `available_days` (text) - Days when train operates
      
    - `passenger`
      - `passenger_id` (uuid, primary key) - Auto-generated passenger ID
      - `passenger_name` (text) - Name of the passenger
      - `age` (integer) - Age of the passenger
      - `address` (text) - Address of the passenger
      - `contact_number` (text) - Contact number
      - `created_at` (timestamptz) - When passenger was created
      
    - `train_status`
      - `status_id` (uuid, primary key) - Auto-generated status ID
      - `train_number` (text, foreign key) - References train table
      - `journey_date` (date) - Date of journey
      - `total_seats` (integer) - Total seats available
      - `booked_seats` (integer) - Number of booked seats
      - `created_at` (timestamptz) - When status was created
      
    - `ticket`
      - `ticket_id` (uuid, primary key) - Auto-generated ticket ID
      - `passenger_id` (uuid, foreign key) - References passenger table
      - `train_number` (text, foreign key) - References train table
      - `journey_date` (date) - Date of journey
      - `ticket_category` (text) - AC or General
      - `ticket_status` (text) - Confirmed or Waiting
      - `fare` (numeric) - Ticket fare
      - `booking_date` (timestamptz) - When ticket was booked
      
  2. Security
    - Enable RLS on all tables
    - Add policies for public access (simplified for demo)
*/

-- Create train table
CREATE TABLE IF NOT EXISTS train (
  train_number text PRIMARY KEY,
  train_name text NOT NULL,
  source_station text NOT NULL,
  destination_station text NOT NULL,
  available_days text NOT NULL
);

-- Create passenger table
CREATE TABLE IF NOT EXISTS passenger (
  passenger_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_name text NOT NULL,
  age integer NOT NULL CHECK (age > 0 AND age < 120),
  address text NOT NULL,
  contact_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create train_status table
CREATE TABLE IF NOT EXISTS train_status (
  status_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  train_number text NOT NULL REFERENCES train(train_number) ON DELETE CASCADE,
  journey_date date NOT NULL,
  total_seats integer NOT NULL DEFAULT 20,
  booked_seats integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(train_number, journey_date)
);

-- Create ticket table
CREATE TABLE IF NOT EXISTS ticket (
  ticket_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id uuid NOT NULL REFERENCES passenger(passenger_id) ON DELETE CASCADE,
  train_number text NOT NULL REFERENCES train(train_number) ON DELETE CASCADE,
  journey_date date NOT NULL,
  ticket_category text NOT NULL CHECK (ticket_category IN ('AC', 'General')),
  ticket_status text NOT NULL CHECK (ticket_status IN ('Confirmed', 'Waiting', 'Cancelled')),
  fare numeric(10,2) NOT NULL,
  booking_date timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE train ENABLE ROW LEVEL SECURITY;
ALTER TABLE passenger ENABLE ROW LEVEL SECURITY;
ALTER TABLE train_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket ENABLE ROW LEVEL SECURITY;

-- RLS Policies for train table (public read access)
CREATE POLICY "Anyone can view trains"
  ON train FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert trains"
  ON train FOR INSERT
  WITH CHECK (true);

-- RLS Policies for passenger table
CREATE POLICY "Anyone can view passengers"
  ON passenger FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert passengers"
  ON passenger FOR INSERT
  WITH CHECK (true);

-- RLS Policies for train_status table
CREATE POLICY "Anyone can view train status"
  ON train_status FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert train status"
  ON train_status FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update train status"
  ON train_status FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for ticket table
CREATE POLICY "Anyone can view tickets"
  ON ticket FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tickets"
  ON ticket FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tickets"
  ON ticket FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tickets"
  ON ticket FOR DELETE
  USING (true);

-- Simple schema for dental clinic app (no auth, no RLS)

-- Appointments table
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  work_description TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Transactions table  
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  work_done TEXT NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT NOT NULL,
  is_free BOOLEAN DEFAULT false,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
); 
-- Drop existing tables if they exist
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create stored procedure to confirm users (for development only)
CREATE OR REPLACE FUNCTION confirm_user(target_user_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = CURRENT_TIMESTAMP,
      confirmed_at = CURRENT_TIMESTAMP
  WHERE email = target_user_id;
END;
$$;

-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create departments table
CREATE TABLE departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create members table
CREATE TABLE members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department_id UUID REFERENCES departments(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance table
CREATE TABLE attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    department_id UUID REFERENCES departments(id),
    attendance_records JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create triggers for updated_at
CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Add some initial departments
INSERT INTO departments (id, name) VALUES 
(uuid_generate_v4(), 'Technical'),
(uuid_generate_v4(), 'Event Management'),
(uuid_generate_v4(), 'Marketing'),
(uuid_generate_v4(), 'Documentation'),
(uuid_generate_v4(), 'Creative')
ON CONFLICT DO NOTHING;

-- Store department IDs for reference
DO $$ 
DECLARE 
    tech_dept_id UUID;
    event_dept_id UUID;
    marketing_dept_id UUID;
    doc_dept_id UUID;
    creative_dept_id UUID;
BEGIN
    SELECT id INTO tech_dept_id FROM departments WHERE name = 'Technical' LIMIT 1;
    SELECT id INTO event_dept_id FROM departments WHERE name = 'Event Management' LIMIT 1;
    SELECT id INTO marketing_dept_id FROM departments WHERE name = 'Marketing' LIMIT 1;
    SELECT id INTO doc_dept_id FROM departments WHERE name = 'Documentation' LIMIT 1;
    SELECT id INTO creative_dept_id FROM departments WHERE name = 'Creative' LIMIT 1;

    -- Insert Technical Team Members
    INSERT INTO members (id, name, email, department_id) VALUES 
    (uuid_generate_v4(), 'Vinay Raj Grandhi', 'vinayraj@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Sai Krishna Praneeth', 'saikrishna@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Uddaraju Praneeth Kumar', 'praneethkumar@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Veeranki Praveena', 'praveena@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Ananya Nair', 'ananyanair@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'T Niveditha', 'niveditha@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Hriday Bhushan', 'hriday@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Nagaram Vandana', 'vandana@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'A Nandha Vardhan Reddy', 'nandha@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Sushmita Gadgi', 'sushmita@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Ananya Mahajan', 'ananyam@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Dhatri Tippireddy', 'dhatri@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'K. Vijay', 'vijay@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Arihan Chintu', 'arihan@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Subhransu Padhi', 'subhransu@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Gourav Layek', 'gourav@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Prajesh Kumar', 'prajesh@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Bhagath Veggalam', 'bhagath@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Mahesh Chowdary', 'mahesh@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Samarth Choudhary', 'samarth@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Arihant Dalai', 'arihant@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'Vivek Anand', 'vivek@ifheindia.org', tech_dept_id),
    (uuid_generate_v4(), 'S. Pramodini Reddy', 'pramodini@ifheindia.org', tech_dept_id);

    -- Insert Event Management Members
    INSERT INTO members (id, name, email, department_id) VALUES 
    (uuid_generate_v4(), 'Koka Sahanvika', 'sahanvika@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Shishrutha Marru', 'shishrutha@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Chintham Thanuja', 'thanuja@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Naga Durga Devi Vanamoju', 'nagadurga@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Lakshmi Meghana', 'meghana@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Sandeep Balleda', 'sandeep@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Sankriti Arya Singh', 'sankriti@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Dewanshi Shrivastava', 'dewanshi@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Sufia Mahmood', 'sufia@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'T Eeshritha', 'eeshritha@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Tanay Sharma', 'tanay@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Chanivelly Varshhene Reddy', 'varshhene@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Syed Adnan Aslam', 'adnan@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'G. Abhilash', 'abhilash@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'P Sri Vidya', 'srividya@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'G. Chandrika', 'chandrika@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Divesh Moolya', 'divesh@ifheindia.org', event_dept_id),
    (uuid_generate_v4(), 'Vaishnavi', 'vaishnavi@ifheindia.org', event_dept_id);

    -- Insert Marketing Members
    INSERT INTO members (id, name, email, department_id) VALUES 
    (uuid_generate_v4(), 'Shaimah Nada Syeda', 'shaimah@ifheindia.org', marketing_dept_id),
    (uuid_generate_v4(), 'Syed Abdul Mateen', 'mateen@ifheindia.org', marketing_dept_id),
    (uuid_generate_v4(), 'Nithin V', 'nithin@ifheindia.org', marketing_dept_id),
    (uuid_generate_v4(), 'G Yashasri', 'yashasri@ifheindia.org', marketing_dept_id),
    (uuid_generate_v4(), 'Nikhilesh Valluru', 'nikhilesh@ifheindia.org', marketing_dept_id),
    (uuid_generate_v4(), 'Battula Bhaskar', 'bhaskar@ifheindia.org', marketing_dept_id),
    (uuid_generate_v4(), 'Divyanshu Dev', 'divyanshu@ifheindia.org', marketing_dept_id);

    -- Insert Documentation Members
    INSERT INTO members (id, name, email, department_id) VALUES 
    (uuid_generate_v4(), 'Viha Singuluri', 'viha@ifheindia.org', doc_dept_id),
    (uuid_generate_v4(), 'Kuchi Chaitanya Krishna', 'chaitanya@ifheindia.org', doc_dept_id),
    (uuid_generate_v4(), 'Deepak', 'deepak@ifheindia.org', doc_dept_id),
    (uuid_generate_v4(), 'Nandita Nishanth', 'nandita@ifheindia.org', doc_dept_id),
    (uuid_generate_v4(), 'Abhiram K', 'abhiram@ifheindia.org', doc_dept_id),
    (uuid_generate_v4(), 'Anil Kumar', 'anil@ifheindia.org', doc_dept_id);

    -- Insert Creative Members
    INSERT INTO members (id, name, email, department_id) VALUES 
    (uuid_generate_v4(), 'G. Bala Rithvik Reddy', 'rithvik@ifheindia.org', creative_dept_id),
    (uuid_generate_v4(), 'Kota Sirisha', 'sirisha@ifheindia.org', creative_dept_id),
    (uuid_generate_v4(), 'P.V.A. Sree Veda', 'sreeveda@ifheindia.org', creative_dept_id),
    (uuid_generate_v4(), 'Kothakapu Akshaya', 'akshaya@ifheindia.org', creative_dept_id),
    (uuid_generate_v4(), 'Prateek Yadav', 'prateek@ifheindia.org', creative_dept_id),
    (uuid_generate_v4(), 'Mohammed Sadiya Tabassum', 'sadiya@ifheindia.org', creative_dept_id),
    (uuid_generate_v4(), 'Mahek Jais', 'mahek@ifheindia.org', creative_dept_id),
    (uuid_generate_v4(), 'Sri Lasya', 'lasya@ifheindia.org', creative_dept_id),
    (uuid_generate_v4(), 'M. Anuhya', 'anuhya@ifheindia.org', creative_dept_id),
    (uuid_generate_v4(), 'K Mohana Sri Bhavitha', 'bhavitha@ifheindia.org', creative_dept_id);
END $$;

-- Enable Row Level Security
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for departments
CREATE POLICY "departments_select_policy"
ON departments FOR SELECT
TO authenticated
USING (true);

-- Create policies for members
CREATE POLICY "members_select_policy"
ON members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "members_insert_policy"
ON members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members_update_policy"
ON members FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for attendance
CREATE POLICY "attendance_select_policy"
ON attendance FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "attendance_insert_policy"
ON attendance FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "attendance_update_policy"
ON attendance FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Create policies for users
CREATE POLICY "users_select_policy"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_update_policy"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Recreate attendance_stats view
DROP VIEW IF EXISTS attendance_stats;
CREATE VIEW attendance_stats AS
SELECT 
    d.name as department_name,
    a.event_date,
    a.event_name,
    COUNT(DISTINCT m.id) as total_members,
    COUNT(DISTINCT CASE 
        WHEN (a.attendance_records->>(m.id::text))::boolean = true 
        THEN m.id 
    END) as attended_members,
    ROUND(
        COUNT(DISTINCT CASE 
            WHEN (a.attendance_records->>(m.id::text))::boolean = true 
            THEN m.id 
        END)::numeric * 100.0 / 
        NULLIF(COUNT(DISTINCT m.id), 0)
    , 2) as attendance_rate
FROM 
    attendance a
    JOIN departments d ON a.department_id = d.id
    LEFT JOIN members m ON m.department_id = d.id
GROUP BY 
    d.name,
    a.event_date,
    a.event_name
ORDER BY 
    a.event_date DESC,
    d.name;

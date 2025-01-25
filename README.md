# IFHE Attendance Tracker

A React-based attendance tracking application for IFHE organization with department-wise attendance management and trend analysis.

## Features

- Secure login system for core committee members
- Department-wise member management
- Attendance tracking for events and meetings
- Trend analysis and visualization
- Modern and responsive UI using Material-UI

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Supabase account and project

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Supabase:
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Update the credentials in `src/config/supabaseClient.js`

3. Start the development server:
```bash
npm start
```

## Default Login Credentials

Core Committee Members:
- Event Management Head: nithinreddy3630@gmail.com
- Creative Head: Ramdassarayu22@ifheindia.org
- Lead: ksahithi22@ifheindia.org
- Co-Lead: nidhiiyer22@ifheindia.org
- Technical Lead: Shreya Mehta
- Marketing Lead: Aajinkaya
- Documentation Lead: V.H. Nidhi

Default password for all users: 123456

## Database Schema

The application uses Supabase with the following table structure:

```sql
create table attendance (
  id uuid default uuid_generate_v4() primary key,
  event_name text not null,
  event_date date not null,
  department text not null,
  attendance_records jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

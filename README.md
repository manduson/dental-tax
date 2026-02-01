
# Chan Dental Tax & Management Portal

A professional Dental Tax Management Portal built with React, Ant Design Pro, and Supabase.

## Features

- **Dashboard**: Visualizes annual revenue growth, insurance ratio, and tax readiness.
- **Revenue Management**: Daily revenue tracking with inline editing and highlighted uncollected amounts.
- **Screenshot Upload**: Upload Dentweb screenshots with mock OCR processing to auto-fill revenue forms.
- **Responsive Layout**: Sidebar navigation and mobile-friendly design.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: Ant Design, ProComponents (@ant-design/pro-components)
- **Icons**: Lucide React
- **Data Visualization**: Ant Design Charts
- **Backend**: Supabase (Client configured)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

- `src/components/MainLayout.tsx`: Application shell with sidebar navigation.
- `src/pages/Dashboard.tsx`: Dashboard with charts.
- `src/pages/Revenue.tsx`: Revenue table with editing.
- `src/pages/Upload.tsx`: Upload feature with mock OCR.
- `src/lib/supabase.ts`: Supabase client configuration.

## Requirements Implemented

- [x] Connect to Supabase (Client setup ready)
- [x] Dashboard with Growth Trends & Legacy Comparison
- [x] Revenue Management with ProTable
- [x] Screenshot Upload with Mock OCR
- [x] Manual Entry (Inline & FAB)
- [x] Specific Dental Logic (Revenue Growth, Uncollected Highlight, Tax Readiness)
- [x] Professional Blue/White Theme

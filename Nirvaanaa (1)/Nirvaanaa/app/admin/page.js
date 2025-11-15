
"use client"
import dynamic from 'next/dynamic';

const EnhancedAdminDashboard = dynamic(() => import('@/components/admin/EnhancedAdminDashboard'), { ssr: false });

export default function AdminDashboard() {
  return <EnhancedAdminDashboard />;
}

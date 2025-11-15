"use client"
import React from 'react';
import { Suspense } from 'react';
import EnhancedAdminDashboard from '@/components/admin/EnhancedAdminDashboard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';






export default function AdminDashboard() {

  return (
    <div className="min-h-screen bg-cream-50">
      <Suspense fallback={<LoadingSpinner />}>
        <EnhancedAdminDashboard />
      </Suspense>
      </div>
  );
}

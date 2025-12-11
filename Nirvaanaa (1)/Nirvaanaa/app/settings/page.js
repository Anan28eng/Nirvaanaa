"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave, FiEdit3 } from 'react-icons/fi';
import SafeImage from '@/components/ui/SafeImage';
import toast from 'react-hot-toast';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: '',
    shippingAddress: {
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      phone: '',
    }
  });

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/me');
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setProfile({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          profileImage: data.user.profileImage || '',
          shippingAddress: data.user.shippingAddress || {
            name: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
            phone: '',
          }
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Profile updated successfully');
        setUser(data.user);
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For now, we'll just use a placeholder URL
    // In a real app, you'd upload to Cloudinary or similar
    const imageUrl = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev, profileImage: imageUrl }));
  };

  const handleRemovePhoto = async () => {
    try {
      const res = await fetch('/api/users/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deleteProfileImage' }) });
      const data = await res.json();
      if (res.ok) {
        setProfile(prev => ({ ...prev, profileImage: '' }));
        toast.success('Profile photo removed');
      } else {
        toast.error(data.error || 'Failed to remove photo');
      }
    } catch (e) {
      toast.error('Failed to remove photo');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/users/me', { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Account deleted');
        window.location.href = '/';
      } else {
        toast.error(data.error || 'Failed to delete account');
      }
    } catch (e) {
      toast.error('Failed to delete account');
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-brown mb-4">Please sign in</h1>
          <p className="text-brand-brown">You need to be signed in to view your settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-playfair font-bold text-brand-brown mb-8 text-center"
        >
          Account Settings
        </motion.h1>

        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-brand-brown mb-6 flex items-center gap-2">
              <FiUser className="w-5 h-5" />
              Profile Information
            </h2>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4">
                  {profile.profileImage ? (
                      <SafeImage
                        src={profile.profileImage}
                        alt="Profile"
                        fill
                        className="object-cover"
                        unoptimized={profile.profileImage?.startsWith('http') || profile.profileImage?.startsWith('blob:')}
                      />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiUser className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-brown transition-colors cursor-pointer">
                  <FiCamera className="w-4 h-4" />
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {profile.profileImage && (
                  <button onClick={handleRemovePhoto} className="mt-2 text-sm text-red-600 hover:underline">Remove Photo</button>
                )}
              </div>

              {/* Profile Fields */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-brand-brown mb-6 flex items-center gap-2">
              <FiMapPin className="w-5 h-5" />
              Default Shipping Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={profile.shippingAddress.name}
                onChange={(e) => setProfile({
                  ...profile,
                  shippingAddress: { ...profile.shippingAddress, name: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={profile.shippingAddress.phone}
                onChange={(e) => setProfile({
                  ...profile,
                  shippingAddress: { ...profile.shippingAddress, phone: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Street Address"
                value={profile.shippingAddress.street}
                onChange={(e) => setProfile({
                  ...profile,
                  shippingAddress: { ...profile.shippingAddress, street: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent md:col-span-2"
              />
              <input
                type="text"
                placeholder="City"
                value={profile.shippingAddress.city}
                onChange={(e) => setProfile({
                  ...profile,
                  shippingAddress: { ...profile.shippingAddress, city: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
              <input
                type="text"
                placeholder="State"
                value={profile.shippingAddress.state}
                onChange={(e) => setProfile({
                  ...profile,
                  shippingAddress: { ...profile.shippingAddress, state: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={profile.shippingAddress.zipCode}
                onChange={(e) => setProfile({
                  ...profile,
                  shippingAddress: { ...profile.shippingAddress, zipCode: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Country"
                value={profile.shippingAddress.country}
                onChange={(e) => setProfile({
                  ...profile,
                  shippingAddress: { ...profile.shippingAddress, country: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-brand-gold text-white rounded-lg hover:bg-brand-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </motion.div>
        </form>

        {/* Danger Zone */}
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-red-700 mb-4">Danger Zone</h2>
            <p className="text-sm text-brand-brown mb-4">Delete your account and associated information.</p>
            <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

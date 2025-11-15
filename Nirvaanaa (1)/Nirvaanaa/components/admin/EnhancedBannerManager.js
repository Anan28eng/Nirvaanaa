'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Eye, Edit, Trash2, Save, X } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';

export default function EnhancedBannerManager() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    text: '',
    type: 'announcement',
    isActive: false,
    backgroundColor: '#f59e0b',
    textColor: '#ffffff',
    image: '',
    link: { url: '', text: '' },
    priority: 1,
    startDate: '',
    endDate: ''
  });

  // Fetch banners
  const { data: bannersData, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const [adRes, annRes] = await Promise.all([
        fetch('/api/announcements/adbanner'),
        fetch('/api/announcements/announcement'),
      ]);
      
      const adData = adRes.ok ? await adRes.json() : { banner: null };
      const annData = annRes.ok ? await annRes.json() : { banner: null };
      
      return {
        adBanner: adData.banner,
        announcementBanner: annData.banner
      };
    },
    refetchInterval: 30000,
  });

  // Create/Update banner mutation
  const bannerMutation = useMutation({
    mutationFn: async (bannerData) => {
      const endpoint = bannerData.type === 'adbanner' 
        ? '/api/announcements/adbanner' 
        : '/api/announcements/announcement';
      const isCreate = !bannerData.id;
      const method = isCreate ? 'POST' : 'PUT';
      const payload = { ...bannerData };
      // Enforce: ad banner has no image field
      if (payload.type === 'adbanner') delete payload.image;
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save banner');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['banners']);
      setEditingBanner(null);
      resetForm();
      toast.success('Banner saved successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setBannerForm({
     
      type: 'announcement',
      isActive: false,
      backgroundColor: '#f59e0b',
      textColor: '#ffffff',
      image: '',
      link: { url: '', text: '' },
      priority: 1,
      startDate: '',
      endDate: ''
    });
  };

  const handleEditBanner = (banner, type) => {
    setEditingBanner(banner?._id || 'new');
    setBannerForm({
      text: type === 'adbanner' ? banner?.text || '' : '',
      type: type,
      isActive: type === 'adbanner' ? banner?.isAdBannerActive : banner?.isAnnouncementActive,
      backgroundColor: banner?.backgroundColor || '#f59e0b',
      textColor: banner?.textColor || '#ffffff',
      image: type === 'announcement' ? (banner?.image || '') : '',
      link: banner?.link || { url: '', text: '' },
      priority: banner?.priority || 1,
      startDate: banner?.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner?.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''
    });
  };

  const handleSubmitBanner = (e) => {
    e.preventDefault();
    
    const bannerData = {
      id: editingBanner === 'new' ? undefined : editingBanner,
      text: bannerForm.text,
      type: bannerForm.type,
      backgroundColor: bannerForm.backgroundColor,
      textColor: bannerForm.textColor,
      link: bannerForm.link,
      priority: bannerForm.priority,
      startDate: bannerForm.startDate ? new Date(bannerForm.startDate) : undefined,
      endDate: bannerForm.endDate ? new Date(bannerForm.endDate) : undefined,
      createdBy: session?.user?.id
    };
    if (bannerForm.type === 'announcement' && bannerForm.image) {
      bannerData.image = bannerForm.image;
    }

    if (bannerForm.type === 'adbanner') {
      bannerData.isAdBannerActive = bannerForm.isActive;
    } else {
      bannerData.isAnnouncementActive = bannerForm.isActive;
    }

    bannerMutation.mutate(bannerData);
  };

  if (session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Banner Management</h1>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Ad Banner Section */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Ad Banner</h2>
                  <button
                    onClick={() => handleEditBanner(bannersData?.adBanner, 'adbanner')}
                    className="px-4 py-2 bg-[#bfae9e] text-white rounded-lg hover:bg-[#7c6a58] transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    {bannersData?.adBanner ? 'Edit' : 'Create'} Ad Banner
                  </button>
                </div>
                
                {bannersData?.adBanner ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      {bannersData.adBanner.image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                          <img
                            src={bannersData.adBanner.image}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{bannersData.adBanner.text}</p>
                        <p className="text-sm text-gray-500">
                          Status: {bannersData.adBanner.isAdBannerActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No ad banner configured</p>
                )}
              </div>

              {/* Announcement Banner Section */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Announcement Banner</h2>
                  <button
                    onClick={() => handleEditBanner(bannersData?.announcementBanner, 'announcement')}
                    className="px-4 py-2 bg-[#bfae9e] text-white rounded-lg hover:bg-[#7c6a58] transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    {bannersData?.announcementBanner ? 'Edit' : 'Create'} Announcement
                  </button>
                </div>
                
                {bannersData?.announcementBanner ? (
                  <div className="bg-gray-50 rounded-lg p-4 md:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                    {bannersData.announcementBanner.image && (
                      <div className="w-full max-w-[970px] aspect-[970/250] rounded-lg overflow-hidden bg-gray-200 mx-auto">
                        <img
                          src={bannersData.announcementBanner.image}
                          alt="Banner"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      )}
                      <div className="flex-1">
                        
                        <p className="text-sm text-gray-500">
                          Status: {bannersData.announcementBanner.isAnnouncementActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No announcement banner configured</p>
                )}
              </div>
            </div>
          )}

          {/* Banner Form Modal */}
          {editingBanner && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {editingBanner === 'new' ? 'Create' : 'Edit'} {bannerForm.type === 'adbanner' ? 'Ad Banner' : 'Announcement'}
                    </h3>
                    <button
                      onClick={() => setEditingBanner(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitBanner} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Banner Text (Ad banner only) */}
                      {bannerForm.type==='adbanner' && (<div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Banner Text *
                        </label>
                        <input
                          type="text"
                          value={bannerForm.text}
                          onChange={(e) => setBannerForm({ ...bannerForm, text: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bfae9e] focus:border-transparent"
                          placeholder="Enter banner text"
                          required
                          maxLength="200"
                        />
                      </div>  
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <input
                          type="number"
                          value={bannerForm.priority}
                          onChange={(e) => setBannerForm({ ...bannerForm, priority: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bfae9e] focus:border-transparent"
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>

                    {/* Image Upload (Announcement only) */}
                    {bannerForm.type === 'announcement' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Banner Image 
                        </label>
                        <ImageUpload
                          value={bannerForm.image}
                          onChange={(url) => setBannerForm({ ...bannerForm, image: url })}
                          placeholder="Upload banner image"
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={bannerForm.backgroundColor}
                            onChange={(e) => setBannerForm({ ...bannerForm, backgroundColor: e.target.value })}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={bannerForm.backgroundColor}
                            onChange={(e) => setBannerForm({ ...bannerForm, backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bfae9e] focus:border-transparent"
                            placeholder="#f59e0b"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Text Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={bannerForm.textColor}
                            onChange={(e) => setBannerForm({ ...bannerForm, textColor: e.target.value })}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={bannerForm.textColor}
                            onChange={(e) => setBannerForm({ ...bannerForm, textColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bfae9e] focus:border-transparent"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Link */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Link URL
                        </label>
                        <input
                          type="url"
                          value={bannerForm.link.url}
                          onChange={(e) => setBannerForm({ 
                            ...bannerForm, 
                            link: { ...bannerForm.link, url: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bfae9e] focus:border-transparent"
                          placeholder="https://example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Link Text
                        </label>
                        <input
                          type="text"
                          value={bannerForm.link.text}
                          onChange={(e) => setBannerForm({ 
                            ...bannerForm, 
                            link: { ...bannerForm.link, text: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bfae9e] focus:border-transparent"
                          placeholder="Learn More"
                        />
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={bannerForm.startDate}
                          onChange={(e) => setBannerForm({ ...bannerForm, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bfae9e] focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={bannerForm.endDate}
                          onChange={(e) => setBannerForm({ ...bannerForm, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bfae9e] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={bannerForm.isActive}
                        onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                        className="w-4 h-4 text-[#bfae9e] border-gray-300 rounded focus:ring-[#bfae9e]"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Make this banner active
                      </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={bannerMutation.isPending}
                        className="px-6 py-2 bg-[#bfae9e] text-white rounded-lg hover:bg-[#7c6a58] transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {bannerMutation.isPending ? 'Saving...' : 'Save Banner'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setEditingBanner(null)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ 
  value = '', 
  onChange, 
  placeholder = 'Enter image URL or drag & drop files',
  className = '',
  multiple = false,
  maxFiles = 5
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      alert('Please select only image files');
      return;
    }

    if (validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadPromises = validFiles.map(file => uploadToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      if (multiple) {
        setUploadedFiles(prev => [...prev, ...uploadedUrls]);
        onChange([...uploadedFiles, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls[0]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Determine folder based on file type or use default
      const folder = 'nirvaanaa/products'; // Default folder for product images
      
      const response = await fetch(`/api/upload/cloudinary?folder=${folder}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Return the Cloudinary URL
      return data.url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      // Fallback to base64 if Cloudinary fails
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    if (multiple) {
      const newFiles = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(newFiles);
      onChange(newFiles);
    } else {
      onChange('');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Drag and Drop Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${dragActive 
            ? 'border-[#bfae9e] bg-[#bfae9e]/10' 
            : 'border-gray-300 hover:border-[#bfae9e] hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="text-center">
          <motion.div
            animate={{ scale: dragActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          </motion.div>
          
          <p className="text-lg font-medium text-gray-900 mb-2">
            {dragActive ? 'Drop images here' : 'Upload Images'}
          </p>
          
          <p className="text-sm text-gray-500 mb-4">
            {placeholder}
          </p>
          
          <button
            type="button"
            className="px-4 py-2 bg-[#bfae9e] text-white rounded-lg hover:bg-[#7c6a58] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
          >
            Choose Files
          </button>
        </div>

        {/* URL Input */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or enter image URL:
          </label>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfae9e] focus:border-transparent"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bfae9e] mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Images */}
      <AnimatePresence>
        {(multiple ? uploadedFiles : value ? [value] : []).length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {(multiple ? uploadedFiles : value ? [value] : []).map((url, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });

export default function InvoiceTemplatesSection() {
  const [templates, setTemplates] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/admin/invoice-template');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setTemplates(data.templates || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch templates');
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const onUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a .docx file');
    if (!file.name.toLowerCase().endsWith('.docx')) return toast.error('Only .docx files are allowed');

    try {
      setUploading(true);
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/invoice-template', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      toast.success('Template uploaded');
      setFile(null);
      await loadTemplates();
    } catch (e) {
      console.error(e);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    try {
      const res = await fetch(`/api/admin/invoice-template/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      toast.success('Template deleted');
      await loadTemplates();
    } catch (e) {
      console.error(e);
      toast.error('Delete failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.45 }}
      className="glassmorphism p-6 rounded-xl shadow-lg mb-8"
    >
      <h2 className={`${playfair.className} text-xl mb-4`}>Invoice Templates</h2>

      <form onSubmit={onUpload} className="space-y-4 mb-6">
        <div>
          <input
            type="file"
            accept=".docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#bfae9e] file:text-white hover:file:bg-[#7c6a58]"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-[#bfae9e] text-white rounded-lg hover:bg-[#7c6a58] transition-colors disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload Template'}
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Uploaded Templates</h3>
        {templates.length === 0 ? (
          <div className="text-gray-500">No templates uploaded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Uploaded At</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t._id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{t.originalName || t.filename}</td>
                    <td className="py-2 pr-4">{new Date(t.uploadedAt).toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-3">
                        <a
                          href={`/api/admin/invoice-template/${t._id}`}
                          className="text-[#7c6a58] hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Preview
                        </a>
                        <button
                          onClick={() => onDelete(t._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}



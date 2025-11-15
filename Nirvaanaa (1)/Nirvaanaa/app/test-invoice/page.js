'use client';

import React, { useState } from 'react';
import { FiDownload, FiFileText, FiCheckCircle } from 'react-icons/fi';

export default function TestInvoicePage() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const downloadTestInvoice = async () => {
    setDownloading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/test-invoice');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to download invoice' }));
        throw new Error(errorData.error || 'Failed to download invoice');
      }

      // Get HTML content
      const htmlContent = await response.text();
      
      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // Fallback: download as HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoice-test.html';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Invoice download error:', err);
      setError(err.message || 'Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <FiFileText className="w-16 h-16 text-brand-gold mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-brand-brown mb-2">
              Test Invoice Download
            </h1>
            <p className="text-gray-600">
              Download a sample invoice template with mock checkout data
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-brand-brown mb-4">
              Sample Invoice Details
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">Order Number:</span>
                <span>NV241201001</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>₹1,999</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Shipping:</span>
                <span>₹150</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax (GST 18%):</span>
                <span>₹360</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-bold text-brand-brown">Total:</span>
                <span className="font-bold text-brand-brown">₹2,509</span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  <strong>Note:</strong> This invoice includes shipping cost in the total calculation.
                  The shipping cost (₹150) is properly added to the subtotal and tax to calculate the final total.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={downloadTestInvoice}
              disabled={downloading}
              className="inline-flex items-center gap-2 bg-brand-gold text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <FiDownload className="w-5 h-5" />
                  Download Test Invoice
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="font-medium">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5" />
              <span>Invoice downloaded successfully!</span>
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">About This Test Invoice</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• This is a sample invoice generated with mock data</li>
              <li>• The invoice includes shipping cost in the total calculation</li>
              <li>• All placeholders are automatically populated from the test data</li>
              <li>• The template uses the latest uploaded invoice template or the default template</li>
              <li>• This can be used to test invoice generation without creating a real order</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/checkout"
              className="text-brand-gold hover:text-brand-brown transition-colors text-sm font-medium"
            >
              ← Back to Checkout
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


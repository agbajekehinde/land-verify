'use client';

import { useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Define proper types instead of using 'any'
type FindingValue = string | number | boolean | object;

interface Findings {
  [key: string]: FindingValue;
}

type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED';


interface Report {
  id: string;
  findings: Findings;
  status: ReportStatus;
  reportFiles: string[];
}

export default function EditFindingsForm({ report }: { report: Report }) {
  const router = useRouter();
  
  // Get initial findings from the report with proper typing
  const [findings, setFindings] = useState<Findings>(report.findings || {});
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle field updates with proper typing
  const handleFieldChange = (key: string, value: FindingValue) => {
    setFindings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      // Using the correct format for Pages Router API routes
      const response = await fetch(`/api/verification-reports/${report.id}/update-findings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          findings,
          reportFiles: report.reportFiles // Preserve existing files
        }),
      });

      if (response.ok) {
        setSuccessMessage('Findings updated successfully');
        router.refresh();
        // Show success message before redirecting
        setTimeout(() => {
          router.push(`/admin/verification-reports/${report.id}`);
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update findings');
      }
    } catch (err) {
      setError('An error occurred while updating the findings');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine the field type and render appropriate input
  const renderFieldInput = (key: string, value: FindingValue) => {
    // Handle boolean values
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={key}
            checked={findings[key] as boolean}
            onChange={(e) => handleFieldChange(key, e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={key} className="ml-2 block text-sm text-gray-700">
            {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
          </label>
        </div>
      );
    }

    // Handle string/text values
    if (typeof value === 'string') {
      // If it's a longer text field (more than 100 chars), use textarea
      if (value.length > 100) {
        return (
          <div>
            <label htmlFor={key} className="block text-sm font-medium text-gray-700">
              {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </label>
            <textarea
              id={key}
              rows={4}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={findings[key] as string}
              onChange={(e) => handleFieldChange(key, e.target.value)}
            />
          </div>
        );
      }
      
      // For shorter text, use a text input
      return (
        <div>
          <label htmlFor={key} className="block text-sm font-medium text-gray-700">
            {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <input
            type="text"
            id={key}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={findings[key] as string}
            onChange={(e) => handleFieldChange(key, e.target.value)}
          />
        </div>
      );
    }

    // Handle numeric values
    if (typeof value === 'number') {
      return (
        <div>
          <label htmlFor={key} className="block text-sm font-medium text-gray-700">
            {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <input
            type="number"
            id={key}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={findings[key] as number}
            onChange={(e) => handleFieldChange(key, Number(e.target.value))}
          />
        </div>
      );
    }

    // Fallback for other types
    return (
      <div>
        <label htmlFor={key} className="block text-sm font-medium text-gray-700">
          {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
        </label>
        <div className="text-gray-500 mt-1">
          Cannot edit this field type directly: {typeof value}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Link href={`/admin/dashboard/verificationreports`} className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Report
        </Link>
        <h1 className="text-xl font-semibold ml-4">Edit Findings</h1>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Report Status */}
      <div className="bg-white p-4 rounded-md shadow">
        <h2 className="text-lg font-medium mb-3">Report Status</h2>
        <div className="mt-1">
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ReportStatus)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Findings Fields */}
      <div className="bg-white p-4 rounded-md shadow">
        <h2 className="text-lg font-medium mb-4">Edit Findings</h2>
        
        {Object.keys(findings).length === 0 ? (
          <p className="text-gray-500">No findings data available to edit.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(findings).map(([key, value]) => (
              <div key={key} className="pb-4 border-b border-gray-200">
                {renderFieldInput(key, value)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Link
          href={`/admin/dashboard/verificationreports`}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Findings'}
        </button>
      </div>
    </form>
  );
}
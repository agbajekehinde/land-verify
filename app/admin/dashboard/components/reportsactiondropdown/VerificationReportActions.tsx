'use client';
import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Edit, CheckCircle, Eye } from 'lucide-react';
import toast, { Toaster } from "react-hot-toast";

type ActionDropdownProps = {
  reportId: string;
  isApproved?: boolean; // Prop to track approval status
};

export default function ActionDropdown({ reportId, isApproved = false }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle view report action
  const handleViewReport = () => {
    router.push(`/admin/verification-reports/${reportId}`);
    setIsOpen(false);
  };

  // Handle edit report action
  const handleEditReport = () => {
    router.push(`/admin/verification-reports/${reportId}/edit`);
    setIsOpen(false);
  };

  // Show confirmation modal before approving
  const showApproveConfirmation = () => {
    setIsOpen(false);
    setShowConfirmModal(true);
  };

  // Handle approve and release to user action
  const handleApproveReport = async () => {
    try {
      const response = await fetch(`/api/verification-reports/${reportId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        setShowConfirmModal(false);
        // Show success toast notification
        toast.success("Verification report approved successfully");
        router.refresh();
      } else {
        console.error('Failed to approve report');
        // Show error toast
        toast.error("Failed to approve report");
      }
    } catch (error) {
      console.error('Error approving report:', error);
      // Show error toast
      toast.error("An error occurred while approving the report");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toast container */}
      <Toaster position="top-right" />
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-500"
      >
        Actions <ChevronDown className="ml-1 h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white z-10">
          <div className="py-1 rounded-md bg-white shadow-xs">
            <button
              onClick={handleViewReport}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </div>
            </button>
            <button
              onClick={handleEditReport}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Edit Report
              </div>
            </button>
            {/* Only show Approve button if the report is not already approved */}
            {!isApproved && (
              <button
                onClick={showApproveConfirmation}
                className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Release
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Are you sure you want to approve this report?</h1>
            <p className="text-lg font-medium text-gray-600 mb-6">
              Approving this report will make this report available to the customer, this action is irreversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                No, Cancel
              </button>
              <button
                onClick={handleApproveReport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Yes, Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
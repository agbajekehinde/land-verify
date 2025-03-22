// app/admin/components/actiondropdown/VerificationReportActions.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Edit, CheckCircle, Eye } from 'lucide-react';

type ActionDropdownProps = {
  reportId: string;
};

export default function ActionDropdown({ reportId }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
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
        router.refresh();
        setIsOpen(false);
      } else {
        console.error('Failed to approve report');
        // Handle error (you could add a toast notification here)
      }
    } catch (error) {
      console.error('Error approving report:', error);
    }
  };

  // Handle reject report action
  /*const handleRejectReport = async () => {
    try {
      const response = await fetch(`/api/verification-reports/${reportId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        router.refresh();
        setIsOpen(false);
      } else {
        console.error('Failed to reject report');
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
    }
  };*/

  return (
    <div className="relative" ref={dropdownRef}>
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
            
            {/* Show the Approve option for any status - removing the condition to always make it available */}
            <button
              onClick={handleApproveReport}
              className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
            >
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve & Release
              </div>
            </button>
            
             {/*<button
              onClick={handleRejectReport}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <div className="flex items-center">
                <X className="mr-2 h-4 w-4" />
                Reject Report 
              </div>
            </button> */}

          </div>
        </div>
      )}
    </div>
  );
}
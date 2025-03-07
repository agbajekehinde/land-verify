"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Partner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface VerificationRequest {
  id: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

interface PartnerAssignmentModalProps {
  verificationId: string;
  onClose: () => void;
}

const PartnerAssignmentModal: React.FC<PartnerAssignmentModalProps> = ({
  verificationId,
  onClose,
}) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verificationDetails, setVerificationDetails] = useState<VerificationRequest | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch the list of partners
    const fetchPartners = async () => {
      try {
        const response = await fetch('/api/partners');
        if (!response.ok) throw new Error('Failed to fetch partners');
        const data = await response.json();
        setPartners(data);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch verification details
    const fetchVerificationDetails = async () => {
      try {
        const response = await fetch(`/api/verification-requests/${verificationId}/requests`);
        if (!response.ok) throw new Error('Failed to fetch verification details');
        const data = await response.json();
        setVerificationDetails(data);
      } catch (error) {
        console.error('Error fetching verification details:', error);
      }
    };

    fetchPartners();
    fetchVerificationDetails();
  }, [verificationId]);

  const handleAssignment = async () => {
    if (!selectedPartnerId) return;
    
    try {
      setSubmitting(true);
      const response = await fetch(`/api/verification-requests/${verificationId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: selectedPartnerId,
        }),
      });

      if (!response.ok) throw new Error('Failed to assign partner');
      
      // Success handling
      router.refresh(); // Refresh the page to update the UI
      onClose();
    } catch (error) {
      console.error('Error assigning partner:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Assign to Partner</h3>
        
        {verificationDetails && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="font-medium text-gray-700">Verification Address:</p>
            <p className="text-gray-600">
              {verificationDetails.address}, {verificationDetails.city}, {verificationDetails.state} {verificationDetails.postalCode}
            </p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Select Partner
          </label>
          {loading ? (
            <p className="text-gray-500">Loading partners...</p>
          ) : (
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPartnerId || ""}
              onChange={(e) => setSelectedPartnerId(Number(e.target.value))}
            >
              <option value="">Select a partner</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.firstName} {partner.lastName} ({partner.email})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleAssignment}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={!selectedPartnerId || submitting}
          >
            {submitting ? "Assigning..." : "Assign to Partner"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerAssignmentModal;
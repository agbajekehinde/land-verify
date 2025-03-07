"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useVerification } from "../verificationcontext/VerificationContext";

interface VerificationRequest {
  id: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  status: string;
  createdAt: string;
  files?: string[];
}

const VerificationHistory: React.FC = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { verifications, setVerifications } = useVerification();
  
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchVerifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}/verificationHistory`);
        if (!response.ok) throw new Error("Failed to fetch verifications");
        const data = await response.json();
        setVerifications(data);
      } catch (error) {
        console.error("Error fetching verifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifications();
  }, [userId, setVerifications]);

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    // Convert from database format (e.g., IN_PROGRESS) to display format (e.g., In Progress)
    const words = status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    return words.join(' ');
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-100 px-2 py-1 rounded';
      case 'COMPLETED':
        return 'text-green-600 bg-green-100 px-2 py-1 rounded';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading verification history...</div>;
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-md mt-6">
      <h2 className="text-lg font-bold mb-2">Verification History</h2>
      {verifications.length === 0 ? (
        <p className="text-gray-500">No verification requests made yet.</p>
      ) : (
        <div className="space-y-4">
          {verifications.map((verification) => (
            <div key={verification.id} className="p-4 border rounded-lg shadow-sm bg-gray-50 relative flex items-start justify-between">
              <div>
                <p className="font-medium">{verification.address}, {verification.city}, {verification.state} {verification.postalCode}</p>
                <p className="text-sm mt-1">
                  Status: <span className={getStatusColor(verification.status)}>{formatStatus(verification.status)}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Date: {new Date(verification.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                className="border border-gray-400 text-gray-600 px-3 py-1 rounded self-center hover:bg-gray-200 transition"
                onClick={() => setSelectedVerification(verification)}
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedVerification && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-200 transition"
              onClick={() => setSelectedVerification(null)}
            >
              ✖️
            </button>

            <h3 className="text-lg font-bold">Verification Details</h3>
            <p className="mt-2"><strong>Address:</strong> {selectedVerification.address}</p>
            <p><strong>City:</strong> {selectedVerification.city}</p>
            <p><strong>State:</strong> {selectedVerification.state}</p>
            <p><strong>Postal Code:</strong> {selectedVerification.postalCode}</p>
            <p><strong>Status:</strong> <span className={getStatusColor(selectedVerification.status)}>{formatStatus(selectedVerification.status)}</span></p>
            <p><strong>Date:</strong> {new Date(selectedVerification.createdAt).toLocaleDateString()}</p>
            
            {selectedVerification.files && selectedVerification.files.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">Uploaded Files:</h4>
                <div className="mt-2 space-y-2">
                  {selectedVerification.files.map((file, index) => (
                    <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline">
                      View File {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationHistory;
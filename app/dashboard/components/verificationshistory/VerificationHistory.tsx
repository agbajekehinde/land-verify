"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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

  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchVerifications = async () => {
      try {
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
  }, [userId]);

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
                <p className="text-sm text-gray-600">Status: {verification.status}</p>
                <p className="text-sm text-gray-500">Date: {new Date(verification.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                className="border border-gray-400 text-gray-600 px-3 py-1 rounded self-center"
                onClick={() => setSelectedVerification(verification)}
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedVerification && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold">Verification Details</h3>
            <p className="mt-2"><strong>Address:</strong> {selectedVerification.address}</p>
            <p><strong>City:</strong> {selectedVerification.city}</p>
            <p><strong>State:</strong> {selectedVerification.state}</p>
            <p><strong>Postal Code:</strong> {selectedVerification.postalCode}</p>
            <p><strong>Status:</strong> {selectedVerification.status}</p>
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
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setSelectedVerification(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationHistory;

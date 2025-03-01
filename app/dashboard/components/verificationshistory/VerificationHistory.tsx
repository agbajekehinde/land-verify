"use client";
import React, { useEffect, useState } from "react";
import StatusCard from "../verificationstatus/verificationstatus";

interface VerificationRequest {
  id: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  status: string;
  createdAt: string;
}

interface VerificationHistoryProps {
  userId: string | undefined;
}

const VerificationHistory: React.FC<VerificationHistoryProps> = ({ userId }) => {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchVerifications = async () => {
      try {
        const response = await fetch(`/api/verifications/verifications?userId=${userId}`);
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
            <StatusCard 
              key={verification.id}
              lastUpdated="N/A"
              status={verification.status}
              address={`${verification.address}, ${verification.city}, ${verification.state} ${verification.postalCode}`}
              date={new Date(verification.createdAt).toLocaleDateString()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VerificationHistory;
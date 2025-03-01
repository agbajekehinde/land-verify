"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // ✅ Get user session

interface VerificationRequest {
  id: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  status: string;
  createdAt: string;
}

const VerificationHistory: React.FC = () => {
  const { data: session } = useSession(); // ✅ Extract session data
  const userId = session?.user?.id; // Get user ID

  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

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
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Address</th>
              <th className="border p-2">City</th>
              <th className="border p-2">State</th>
              <th className="border p-2">Postal Code</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {verifications.map((verification) => (
              <tr key={verification.id} className="text-center border-b">
                <td className="border p-2">{verification.address}</td>
                <td className="border p-2">{verification.city}</td>
                <td className="border p-2">{verification.state}</td>
                <td className="border p-2">{verification.postalCode}</td>
                <td className="border p-2">{verification.status}</td>
                <td className="border p-2">{new Date(verification.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VerificationHistory;

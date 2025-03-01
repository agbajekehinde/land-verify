"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const AccountDetails: React.FC = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name || "N/A",
        email: session.user.email || "N/A",
      });
    }
  }, [session]);

  if (status === "loading") {
    return <p className="text-gray-500">Loading account details...</p>;
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Account Details</h2>
      {user ? (
        <div>
          <p className="text-gray-700"><strong>Name:</strong> {user.name}</p>
          <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
          <p className="text-gray-700"><strong>User ID:</strong> {user.id}</p>
        </div>
      ) : (
        <p className="text-gray-500">No user details available.</p>
      )}
    </div>
  );
};

export default AccountDetails;

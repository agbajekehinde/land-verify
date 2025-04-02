"use client";
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";

interface VerificationRequest {
  id: string;
  address: string;
  city: string;
  state: string;
  lga: string;
  postalCode: string;
  status: string;
  createdAt: string;
  files?: string[];
  userId: number;
}

interface VerificationContextType {
  verifications: VerificationRequest[];
  setVerifications: React.Dispatch<React.SetStateAction<VerificationRequest[]>>;
  refreshVerifications: () => void;
  loading: boolean;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error("useVerification must be used within a VerificationProvider");
  }
  return context;
};

interface VerificationProviderProps {
  children: ReactNode;
}

export const VerificationProvider: React.FC<VerificationProviderProps> = ({ children }) => {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const partnerId = session?.user?.id;

  // Function to fetch partner verifications
  const fetchVerifications = async () => {
    if (!partnerId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/partners/${partnerId}/verificationRequests`);
      if (!response.ok) throw new Error("Failed to fetch verification requests");
      const data = await response.json();
      setVerifications(data);
    } catch (error) {
      console.error("Error fetching partner verification requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to trigger a refresh
  const refreshVerifications = () => {
    fetchVerifications();
  };

  // Initial fetch when partnerId is available
  useEffect(() => {
    if (partnerId) {
      fetchVerifications();
    }
  }, [partnerId]);

  return (
    <VerificationContext.Provider value={{ 
      verifications, 
      setVerifications, 
      refreshVerifications,
      loading
    }}>
      {children}
    </VerificationContext.Provider>
  );
};
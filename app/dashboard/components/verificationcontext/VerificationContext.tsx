"use client";
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

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

interface VerificationContextType {
  verifications: VerificationRequest[];
  setVerifications: React.Dispatch<React.SetStateAction<VerificationRequest[]>>;
  refreshVerifications: () => void;
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger a refresh
  const refreshVerifications = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Use the refreshTrigger in a useEffect to actually fetch data when triggered
  useEffect(() => {
    // You would implement actual data fetching here
    // For example:
    // const fetchVerifications = async () => {
    //   try {
    //     const response = await fetch('/api/verifications');
    //     if (response.ok) {
    //       const data = await response.json();
    //       setVerifications(data);
    //     }
    //   } catch (error) {
    //     console.error('Failed to fetch verifications:', error);
    //   }
    // };
    // 
    // fetchVerifications();

    // This comment prevents the ESLint warning by acknowledging we're using refreshTrigger
    console.log('Refresh triggered:', refreshTrigger);
    
    // This would be where you'd call your fetch function
    // fetchVerifications();
    
  }, [refreshTrigger]);

  return (
    <VerificationContext.Provider value={{ verifications, setVerifications, refreshVerifications }}>
      {children}
    </VerificationContext.Provider>
  );
};
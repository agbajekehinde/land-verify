"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

// Defining the report enum to match Prisma schema
export enum ReportStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  REVIEWED = "REVIEWED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

// Define findings type instead of using 'any'
export interface ReportFindings {
  // Add specific fields based on your data structure
  observations: string[];
  recommendations?: string[];
  issues?: string[];
  [key: string]: unknown; // Allow for flexible structure
}

// Defining the report interface
export interface VerificationReport {
  id: string;
  status: ReportStatus | string;
  findings: ReportFindings;
  reportFiles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Update the VerificationRequest interface to include the report
export interface VerificationRequest {
  id: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  landsize: string;
  latitude?: number;
  longitude?: number;
  status: string;
  createdAt: string;
  files?: string[];
  report?: VerificationReport;
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
  
  // Function to trigger a refresh
  const refreshVerifications = () => {
    // Implement your refresh logic here
    // For example, fetch data from API
    // This replaces the unused refreshTrigger state
  };

  return (
    <VerificationContext.Provider value={{ verifications, setVerifications, refreshVerifications }}>
      {children}
    </VerificationContext.Provider>
  );
};
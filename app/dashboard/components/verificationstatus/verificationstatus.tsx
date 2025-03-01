"use client";
import React from "react";

interface StatusCardProps {
  address: string;
  date: string;
  status: string;
  lastUpdated: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ status, lastUpdated }) => {
  return (
    <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md mt-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Application status:</span>
        <span className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm">{status}</span>
      </div>
      <span className="text-gray-500 text-sm">Last updated: {lastUpdated}</span>
    </div>
  );
};

export default StatusCard;

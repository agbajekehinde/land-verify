"use client";

import React from "react";

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "verifications", label: "Verification History" },
    { id: "account", label: "Account Details" },
  ];

  return (
    <div className="flex space-x-4 mb-4 border-b pb-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-2 py-1 sm:px-4 sm:py-2 text-lg sm:text-xl font-medium ${
            activeTab === tab.id
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;

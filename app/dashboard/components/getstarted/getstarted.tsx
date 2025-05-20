"use client";
import React from "react";

const GetStarted: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg mt-6">
      <h3 className="text-lg font-bold">Get Started</h3>
      <p className="text-gray-600">
        Kickstart your land verification process by clicking on the <strong> Start New Verification
          </strong> button
      </p>

      <div className="mt-4">
        <p className="text-sm">
          <strong>Regular</strong> - Evaluation could take up to <strong>5-7 working days</strong>
        </p>
        <p className="text-sm">
          <strong>Priority</strong> - Evaluation process could take up to <strong>24hrs</strong>
        </p>
      </div>
    </div>
  );
};

export default GetStarted;

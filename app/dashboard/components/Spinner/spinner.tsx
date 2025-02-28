"use client";

import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <AiOutlineLoading3Quarters className="animate-spin text-green-600 text-4xl" />
    </div>
  );
};

export default Spinner;
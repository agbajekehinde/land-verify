"use client";

import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaSpinner } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import toast from "react-hot-toast";

interface NewVerificationProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function NewVerification({ isOpen, setIsOpen }: NewVerificationProps) {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    files: [] as File[],
  });

  const [loading, setLoading] = useState(false);

  const closeModal = () => setIsOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, files: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error("User session not found. Please log in.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("userId", session.user.id);
      formData.append("address", form.address);
      formData.append("city", form.city);
      formData.append("state", form.state);
      formData.append("postalCode", form.postalCode);
      formData.append("latitude", form.latitude);
      formData.append("longitude", form.longitude);
      form.files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/verifications", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success("Verification submitted successfully!");
        setForm({
          address: "",
          city: "",
          state: "",
          postalCode: "",
          latitude: "",
          longitude: "",
          files: [],
        });
        closeModal();
      } else {
        toast.error(data.message || "Failed to submit verification.");
      }
    } catch (error) {
      setLoading(false);
      toast.error("An error occurred while submitting.");
    }
  };

  if (!isOpen) return null; // Prevents modal from rendering if not open

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-md z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">New Verification Request</h2>
          <button onClick={closeModal} className="text-gray-600 hover:text-red-500">
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              required
              value={form.address}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:border-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:border-gray-500"
              />
            </div>

            <div className="relative">
            <label className="block text-sm font-medium text-gray-700">State</label>
              <div className="relative">
                 <select
                      name="state"
                      required
                      value={form.state}
                      onChange={handleChange}
                      className="w-full p-2 border rounded bg-white text-gray-700 focus:border-gray-500 appearance-none pr-10"
                    >
                    <option value="" className="text-gray-400">Select a state</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Ogun">Ogun</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                </div>
              </div>
              </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                required
                value={form.postalCode}
                onChange={handleChange}
                inputMode="numeric"
                pattern="\d*"
                className="w-full p-2 border rounded focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude(Optional)</label>
              <input
                type="text"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                inputMode="numeric"
                pattern="\d*"
                className="w-full p-2 border rounded focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude (Optional)</label>
              <input
                type="text"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                inputMode="decimal"
                pattern="\d*"
                className="w-full p-2 border rounded focus:border-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Files</label>
            <input
              type="file"
              name="files"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border rounded focus:border-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex justify-center"
            disabled={loading}
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Submit Verification"}
          </button>
        </form>
      </div>
    </div>
  );
}

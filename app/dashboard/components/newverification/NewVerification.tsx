"use client";

import React, { useState, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { FaSpinner } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { FaFileAlt, FaFilePdf, FaFileImage, FaUpload } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useVerification } from "../verificationcontext/VerificationContext";

interface NewVerificationProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface VerificationFormState {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  landsize: string;
  files: File[];
}

export default function NewVerification({ isOpen, setIsOpen }: NewVerificationProps) {
  const { data: session } = useSession();
  const { setVerifications } = useVerification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState<VerificationFormState>({
    address: "",
    city: "",
    state: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    landsize: "",
    files: [],
  });

  const [loading, setLoading] = useState(false);

  const closeModal = () => setIsOpen(false);

  // Format coordinates to decimal format
  const formatCoordinate = (value: string): string => {
    const numericValue = value.replace(/[^\d.]/g, '');
    if (!numericValue) return '';
    if (numericValue.includes('.')) {
      return numericValue;
    }
    if (numericValue.length >= 2) {
      return numericValue.slice(0, 2) + '.' + numericValue.slice(2);
    }
    return numericValue;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      const formattedValue = formatCoordinate(value);
      setForm({ ...form, [name]: formattedValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = [...e.target.files];
      setForm(prevForm => ({
        ...prevForm,
        files: [...prevForm.files, ...selectedFiles]
      }));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    setForm(prevForm => ({
      ...prevForm,
      files: prevForm.files.filter((_, i) => i !== index)
    }));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className="text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return <FaFileImage className="text-blue-500" />;
    return <FaFileAlt className="text-gray-500" />;
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
      formData.append("landsize", form.landsize);

      if (form.latitude.trim() !== "") 
        formData.append("latitude", form.latitude);
      if (form.longitude.trim() !== "") 
        formData.append("longitude", form.longitude);

      // Append each file individually
      form.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/verifications/verifications", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Verification submitted successfully!");
        
        if (data.verification) {
          setVerifications(prev => [data.verification, ...prev]);
        } else {
          try {
            const userId = session.user.id;
            const historyResponse = await fetch(`/api/users/${userId}/verificationHistory`);
            if (historyResponse.ok) {
              const historyData = await historyResponse.json();
              setVerifications(historyData);
            }
          } catch (fetchError) {
            console.error("Error fetching updated verification history:", fetchError);
          }
        }
        
        setForm({
          address: "",
          city: "",
          state: "",
          postalCode: "",
          latitude: "",
          longitude: "",
          landsize: "",
          files: [],
        });
        
        setTimeout(() => {
          closeModal();
        }, 600);
      } else {
        toast.error(data.message || "Failed to submit verification.");
      }
    } catch (error) {
      console.error("An error occurred while submitting:", error);
      toast.error("An error occurred while submitting.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-md z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">New Verification Request</h2>
          <button 
            onClick={closeModal} 
            className="text-gray-600 hover:text-red-500"
            type="button"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input
              id="address"
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
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                id="city"
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:border-gray-500"
              />
            </div>

            <div className="relative">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
              <div className="relative">
                <select
                  id="state"
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

            <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
            <input
              id="postalCode"
              type="text"
              name="postalCode"
              required
              value={form.postalCode}
              onChange={handleChange}
              inputMode="numeric"
              className="w-full p-2 border rounded focus:border-gray-500"
            />
          </div>

          <div className="relative">
              <label htmlFor="landsize" className="block text-sm font-medium text-gray-700">Select land size</label>
              <div className="relative">
                <select
                  id="landsize"
                  name="landsize"
                  required
                  value={form.landsize}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white text-gray-700 focus:border-gray-500 appearance-none pr-10"
                >
                  <option value="" className="text-gray-400">Select land size</option>
                  <option value="Zero"> Zero to 1 plot</option>
                  <option value="1 to 3">2 plot to 5 plots </option>
                  <option value="5 to 10">5 plot to 10 plots </option>
                  <option value="others">Others </option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
              </div>
            </div>


          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                id="latitude"
                type="text"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="e.g., 22.44000"
                className="w-full p-2 border rounded focus:border-gray-500"
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                id="longitude"
                type="text"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="e.g., 13.50000"
                className="w-full p-2 border rounded focus:border-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Files</label>
            <div className="bg-gray-50 p-3 rounded border border-dashed border-gray-300">
              <div className="mb-2 text-sm text-gray-500">
                Please upload any relevant documents, such as:
              </div>
              <ul className="mb-3 text-xs text-gray-600 pl-5 list-disc">
                <li>Survey Report</li>
                <li>Property Deed</li>
                <li>Land Receipt</li>
              </ul>
              
              <div className="flex flex-col items-center justify-center">
                <input
                  ref={fileInputRef}
                  id="files"
                  type="file"
                  name="files"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center"
                >
                  <FaUpload className="mr-2" /> Choose Files
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  {form.files.length === 0 ? "No files selected" : `${form.files.length} file(s) selected`}
                </p>
              </div>
              
              {form.files.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Selected files:</p>
                  <ul className="space-y-1 max-h-32 overflow-y-auto pl-2">
                    {form.files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between text-sm bg-white p-1 rounded">
                        <span className="flex items-center">
                          <span className="mr-2">{getFileIcon(file.name)}</span>
                          <span className="truncate max-w-xs">{file.name}</span>
                        </span>
                        <button 
                          type="button" 
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <IoMdClose />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : "Submit Verification"}
          </button>
        </form>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </div>
    </div>
  );
}

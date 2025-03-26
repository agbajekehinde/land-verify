"use client";

import React, { useState, useRef, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FaSpinner } from "react-icons/fa"; // Removed unused FaCheck import
import { useSession } from "next-auth/react";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { FaFileAlt, FaFilePdf, FaFileImage, FaUpload } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useVerification } from "../verificationcontext/VerificationContext";
import dynamic from "next/dynamic";

const PaystackButton = dynamic(
  () => import('react-paystack').then(mod => mod.PaystackButton),
  { ssr: false }
);

interface NewVerificationProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface VerificationFormState {
  address: string;
  lga: string;
  state: string;
  latitude: string;
  longitude: string;
  landsize: string;
  files: File[];
}

interface FormErrors {
  address?: string;
  lga?: string;
  state?: string;
  landsize?: string;
}

interface PaymentPlan {
  type: "regular" | "priority";
  amount: number;
  label: string;
}

const BASE_PAYMENT_PLANS: PaymentPlan[] = [
  { type: "regular", amount: 1000000, label: "Regular Service (₦10,000)" },
  { type: "priority", amount: 1500000, label: "Priority Service (₦15,000)" }
];

// LGA pricing multipliers for custom logic
const LGA_PRICING_MULTIPLIERS = {
  Lagos: {
    default: 0.5,
    "Ibeju-Lekki": 2,      // Very premium area
    "Lagos Island": 1.5,   // Premium area
    "Eti-Osa": 1.75,       // Another premium area
    "Badagry": 0.25        // Less expensive area
  },
  Ogun: {
    default: 0.5,
    "Obafemi Owode": 1.25,
    "Abeokuta South": 1,
    "Ewekoro": 0.25        // Less expensive area
  }
};

// LGA options for the dropdown
const lagosLgas = [
  "Agege",
  "Ajeromi-Ifelodun",
  "Alimosho",
  "Amuwo-Odofin",
  "Apapa",
  "Badagry",
  "Epe",
  "Eti-Osa",
  "Ibeju-Lekki",
  "Ifako-Ijaye",
  "Ikeja",
  "Ikorodu",
  "Kosofe",
  "Lagos Island",
  "Lagos Mainland",
  "Mushin",
  "Ojo",
  "Oshodi-Isolo",
  "Shomolu",
  "Surulere"
];

const ogunLgas = [
  "Abeokuta North",
  "Abeokuta South",
  "Ado-Odo/Ota",
  "Ewekoro",
  "Ifo",
  "Ijebu East",
  "Ijebu North",
  "Ijebu North-East",
  "Ijebu Ode",
  "Ikenne",
  "Imeko Afon",
  "Ipokia",
  "Obafemi Owode",
  "Odogbolu",
  "Odeda",
  "Ogun Waterside",
  "Remo North",
  "Sagamu",
  "Yewa North",
  "Yewa South"
];

export default function NewVerification({ isOpen, setIsOpen }: NewVerificationProps) {
  const { data: session } = useSession();
  const { setVerifications } = useVerification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<number>(1);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<PaymentPlan | null>(null);
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>(BASE_PAYMENT_PLANS);
  const [form, setForm] = useState<VerificationFormState>({
    address: "",
    lga: "",
    state: "Lagos", // default to Lagos
    latitude: "",
    longitude: "",
    landsize: "",
    files: [],
  });
  const [loading, setLoading] = useState(false);
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ""; 

  // Update payment plans when landsize, state, or lga changes
  useEffect(() => {
    if (!form.landsize) {
      setPaymentPlans(BASE_PAYMENT_PLANS);
      setSelectedPaymentPlan(null);
      return;
    }
    
    let landsizeMultiplier = 1;
    switch (form.landsize) {
      case "Zero to 2":
        landsizeMultiplier = 1;
        break;
      case "3 to 5":
        landsizeMultiplier = 2;
        break;
      case "6 to 10":
        landsizeMultiplier = 3;
        break;
      case "others":
        landsizeMultiplier = 4;
        break;
      default:
        landsizeMultiplier = 1;
    }
    
    let lgaMultiplier = 0;
    if (
      form.state &&
      form.lga &&
      LGA_PRICING_MULTIPLIERS[form.state as keyof typeof LGA_PRICING_MULTIPLIERS]
    ) {
      const stateMultipliers = LGA_PRICING_MULTIPLIERS[form.state as keyof typeof LGA_PRICING_MULTIPLIERS];
      lgaMultiplier = stateMultipliers[form.lga as keyof typeof stateMultipliers] ?? stateMultipliers.default;
    }
    
    const effectiveMultiplier = landsizeMultiplier + lgaMultiplier;
    
    const adjustedPlans = BASE_PAYMENT_PLANS.map(plan => ({
      ...plan,
      amount: plan.amount * effectiveMultiplier,
      label: `${plan.type === "regular" ? "Regular" : "Priority"} Service (₦${(plan.amount * effectiveMultiplier / 100000).toFixed(0)},000)`
    }));
    
    setPaymentPlans(adjustedPlans);
    setSelectedPaymentPlan(null);
  }, [form.landsize, form.state, form.lga]);

  const closeModal = () => {
    setIsOpen(false);
    setStep(1);
    setSelectedPaymentPlan(null);
    setPaymentComplete(false);
    setErrors({});
  };

  const formatCoordinate = (value: string): string => {
    const numericValue = value.replace(/[^\d.]/g, '');
    if (!numericValue) return '';
    if (numericValue.includes('.')) {
      return numericValue;
    }
    if (numericValue.length >= 6) {
      return numericValue.slice(0, 6) + '.' + numericValue.slice(6);
    }
    return numericValue;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (name === 'latitude' || name === 'longitude') {
      const formattedValue = formatCoordinate(value);
      setForm({ ...form, [name]: formattedValue });
    } else {
      // Reset lga if state changes
      if(name === 'state') {
        setForm({ ...form, [name]: value, lga: "" });
      } else {
        setForm({ ...form, [name]: value });
      }
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.address.trim()) {
      newErrors.address = "This field is required";
    }
    if (!form.state) {  // Change this line to validate state explicitly
      newErrors.state = "This field is required";
    }
    if (!form.lga.trim()) {
      newErrors.lga = "This field is required";
    }
    if (!form.landsize) {
      newErrors.landsize = "This field is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateForm()) {
      return;
    }
    if (session?.user) {
      if (session.user.email) setEmail(session.user.email);
      if (session.user.name) setName(session.user.name);
    }
    setStep(2);
  };

  const handleSelectPaymentPlan = (plan: PaymentPlan) => {
    setSelectedPaymentPlan(plan);
  };

  const submitVerification = async () => {
    if (!session?.user?.id) {
      toast.error("User session not found. Please log in.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", session.user.id);
      formData.append("address", form.address);
      formData.append("lga", form.lga); 
      formData.append("state", form.state);
      formData.append("landsize", form.landsize);
      formData.append("paymentStatus", "success"); 
      formData.append("paymentAmount", selectedPaymentPlan?.amount.toString() || "0");
      formData.append("paymentType", selectedPaymentPlan?.type || "regular");

      if (form.latitude.trim() !== "") 
        formData.append("latitude", form.latitude);
      if (form.longitude.trim() !== "") 
        formData.append("longitude", form.longitude);

      // Append each file individually
      form.files.forEach((file) => {
        formData.append("files", file);
      });
      
      const response = await fetch("/api/newverification/new-verification", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Verification submitted successfully!");
        if (data.verification) {
          setVerifications(prev => [data.verification, ...prev]);
          try {
            const emailResponse = await fetch('/api/email/verification-request-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                recipientEmail: email,
                recipientName: name,
                verificationId: data.verification.id,
                address: form.address,
                paymentType: selectedPaymentPlan?.type || "regular"
              }),
            });
            if (emailResponse.ok) {
              console.log('Confirmation email sent');
            } else {
              console.error('Failed to send confirmation email');
            }
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
          }
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
          lga: "",
          state: "",
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

  const handlePaymentSuccess = (): void => { 
    toast.success("Payment successful!");
    setPaymentComplete(true);
    submitVerification();
  };

  const handlePaymentClose = () => {
    toast.error("Payment window closed");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-md z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {step === 1 ? "New Verification Request" : "Payment Options"}
          </h2>
          <button 
            onClick={closeModal} 
            className="text-gray-600 hover:text-red-500"
            type="button"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {step === 1 && (
          <form className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address <span className="text-gray-500 text-xs">Required</span>
              </label>
              <input
                id="address"
                type="text"
                name="address"
                required
                value={form.address}
                onChange={handleChange}
                className={`w-full p-2 border rounded focus:border-gray-500 ${errors.address ? 'border-red-500' : ''}`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State <span className="text-gray-500 text-xs">Required</span>
                </label>
                <div className="relative">
                  <select
                    id="state"
                    name="state"
                    required
                    value={form.state}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded bg-white text-gray-700 focus:border-gray-500 appearance-none pr-10 ${errors.state ? 'border-red-500' : ''}`}
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Ogun">Ogun</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                </div>
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="lga" className="block text-sm font-medium text-gray-700">
                  LGA <span className="text-gray-500 text-xs">Required</span>
                </label>
                {form.state === "Lagos" || form.state === "Ogun" ? (
                  <div className="relative">
                    <select
                      id="lga"
                      name="lga"
                      required
                      value={form.lga}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded bg-white text-gray-700 focus:border-gray-500 appearance-none pr-10 ${errors.lga ? 'border-red-500' : ''}`}
                    >
                      <option value="" className="text-gray-400">Select an LGA</option>
                      {(form.state === "Lagos" ? lagosLgas : ogunLgas).map(lga => (
                        <option key={lga} value={lga}>{lga}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                  </div>
                ) : (
                  <select
                    id="lga"
                    name="lga"
                    disabled
                    className="w-full p-2 border rounded bg-gray-100 text-gray-500"
                  >
                    <option>Select state first</option>
                  </select>
                )}
                {errors.lga && (
                  <p className="text-red-500 text-xs mt-1">{errors.lga}</p>
                )}
              </div>
            </div>

            <div className="relative">
              <label htmlFor="landsize" className="block text-sm font-medium text-gray-700">
                Land Size <span className="text-gray-500 text-xs">Required</span>
              </label>
              <div className="relative">
                <select
                  id="landsize"
                  name="landsize"
                  required
                  value={form.landsize}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded bg-white text-gray-700 focus:border-gray-500 appearance-none pr-10 ${errors.landsize ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Land Size</option>
                  <option value="Zero to 2">Zero to 2plots</option>
                  <option value="3 to 5">3 plots to 5 plots</option>
                  <option value="6 to 10">6 to 10</option>
                  <option value="others">Others</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
              </div>
              {errors.landsize && (
                <p className="text-red-500 text-xs mt-1">{errors.landsize}</p>
              )}
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
                  placeholder="e.g., 224403.212"
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
                  placeholder="e.g., 130500.059"
                  className="w-full p-2 border rounded focus:border-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Files <span className="text-gray-500 text-xs">Recommended</span>
              </label>
              <div className="bg-gray-50 p-3 rounded border border-dashed border-gray-300">
                <ul className="mb-3 text-xs text-gray-600 pl-5 list-disc">
                  <li>Please upload any relevant documents, such as Survey Plan Document</li>
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

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center justify-center"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Please select a service option:</p>
              <div className="grid grid-cols-1 gap-4">
                {paymentPlans.map((plan) => (
                  <div 
                    key={plan.type}
                    onClick={() => handleSelectPaymentPlan(plan)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPaymentPlan?.type === plan.type 
                        ? "border-green-500 bg-green-50" 
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{plan.label}</h3>
                        <p className="text-sm text-gray-500">
                          {plan.type === "regular" 
                            ? "Standard processing time: 5-7 working days" 
                            : "Expedited processing: 48 hours"}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentPlan?.type === plan.type 
                          ? "border-green-500 bg-green-500" 
                          : "border-gray-300"
                      }`}>
                        {selectedPaymentPlan?.type === plan.type && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPaymentPlan && !paymentComplete && !loading && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Please provide your payment details:</p>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-4">
                <FaSpinner className="animate-spin text-green-600 text-2xl mb-2" />
                <p className="text-gray-600">Processing your verification request...</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Back
              </button>
              
              {selectedPaymentPlan && !paymentComplete && !loading ? (
                <div className="w-full sm:max-w-xs">
                  {(name && email) ? (
                    <PaystackButton
                      text="Make Payment & Submit"
                      className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center"
                      email={email}
                      amount={selectedPaymentPlan.amount}
                      publicKey={publicKey}
                      metadata={{
                        custom_fields: [
                          {
                            display_name: "Name",
                            variable_name: "name",
                            value: name,
                          },
                          {
                            display_name: "Phone",
                            variable_name: "phone",
                            value: phone,
                          },
                        ],
                      }}
                      onSuccess={handlePaymentSuccess}
                      onClose={handlePaymentClose}
                    />
                  ) : (
                    <button 
                      disabled 
                      className="w-full py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                    >
                      Fill required fields
                    </button>
                  )}
                </div>
              ) : !loading && (
                <button 
                  disabled 
                  className="w-full sm:w-auto px-6 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                >
                  {paymentComplete ? "Processing..." : "Select payment option"}
                </button>
              )}
            </div>
          </div>
        )}
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </div>
    </div>
  );
}
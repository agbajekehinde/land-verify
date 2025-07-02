"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useVerification } from "@/app/partner/dashboard/components/VerificationContext/VerificationContext";

interface VerificationRequest {
  id: string;
  address: string;
  state: string;
  status: string;
  createdAt: string;
  lga: string;
  latitude?: number;
  longitude?: number;
  landsize?: string;
  files?: string[];
  userId: number;
}

interface ReportFormData {
  DoesAddressMatchSurvey: string;
  isPropertyFreeOfAcquisition: string;
  locatedInResidentialArea: string;
  locatedInCommercialZone: string;
  locatedInMixedArea: string;
  identifiedInExpansionPlans: string;
  erosionOrFloodRisk: string;
  closeToIndustrialOrWaste: string;
  nearHighVoltageLines: string;
  nearRoadExpansionZone: string;
  accessibleByRegisteredRoad: string;
  withinDrainageOrWetlands: string;
  legalAccessRightOfWay: string;
  suitableSoilProfile: string;
  suitableTopography: string;
  suitableProximityToUtilities: string;
  suitableProximityToServices: string;
  suitableProximityToTransport: string;
  suitableProximityToHazards: string;
  suitableProximityToMarket: string;
  suitableProximityToEducation: string;
  suitableProximityToHealthcare: string;
  suitableProximityToRecreation: string;
  comments: string;
  reportFiles: File[];
}

const VerificationHistory: React.FC = () => {
  const { data: session } = useSession();
  const partnerId = session?.user?.id;
  const { verifications, setVerifications } = useVerification();
  
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [reportData, setReportData] = useState<ReportFormData>({
    DoesAddressMatchSurvey: "",
    isPropertyFreeOfAcquisition: "",
    locatedInResidentialArea: "",
    locatedInCommercialZone: "",
    locatedInMixedArea: "",
    identifiedInExpansionPlans: "",
    erosionOrFloodRisk: "",
    closeToIndustrialOrWaste: "",
    nearHighVoltageLines: "",
    nearRoadExpansionZone: "",
    accessibleByRegisteredRoad: "",
    withinDrainageOrWetlands: "",
    legalAccessRightOfWay: "",
    suitableSoilProfile: "",
    suitableTopography: "",
    suitableProximityToUtilities: "",
    suitableProximityToServices: "",
    suitableProximityToTransport: "",
    suitableProximityToHazards: "",
    suitableProximityToMarket: "",
    suitableProximityToEducation: "",
    suitableProximityToHealthcare: "",
    suitableProximityToRecreation: "",
    comments: "",
    reportFiles: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!partnerId) return;

    const fetchPartnerVerifications = async () => {
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

    fetchPartnerVerifications();
  }, [partnerId, setVerifications]);

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    const words = status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    return words.join(' ');
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-100 px-2 py-1 rounded';
      case 'COMPLETED':
        return 'text-green-600 bg-green-100 px-2 py-1 rounded';
      default:
        return 'text-gray-600';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReportData({
      ...reportData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setReportData({
        ...reportData,
        reportFiles: [...reportData.reportFiles, ...newFiles]
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...reportData.reportFiles];
    updatedFiles.splice(index, 1);
    setReportData({
      ...reportData,
      reportFiles: updatedFiles
    });
  };

  const openReportModal = (verification: VerificationRequest) => {
    setSelectedVerification(verification);
    setIsReportModalOpen(true);
    setError(null);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    if (!showSubmitConfirmModal) {
      setSelectedVerification(null);
    }
    setReportData({
      DoesAddressMatchSurvey: "",
      isPropertyFreeOfAcquisition: "",
      locatedInResidentialArea: "",
      locatedInCommercialZone: "",
      locatedInMixedArea: "",
      identifiedInExpansionPlans: "",
      erosionOrFloodRisk: "",
      closeToIndustrialOrWaste: "",
      nearHighVoltageLines: "",
      nearRoadExpansionZone: "",
      accessibleByRegisteredRoad: "",
      withinDrainageOrWetlands: "",
      legalAccessRightOfWay: "",
      suitableSoilProfile: "",
      suitableTopography: "",
      suitableProximityToUtilities: "",
      suitableProximityToServices: "",
      suitableProximityToTransport: "",
      suitableProximityToHazards: "",
      suitableProximityToMarket: "",
      suitableProximityToEducation: "",
      suitableProximityToHealthcare: "",
      suitableProximityToRecreation: "",
      comments: "",
      reportFiles: []
    });
    setError(null);
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVerification || !partnerId) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      // First, upload files if any
      let uploadedFileUrls: string[] = [];
      
      if (reportData.reportFiles.length > 0) {
        const formData = new FormData();
        reportData.reportFiles.forEach(file => {
          formData.append('files', file);
        });
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload files');
        }
        
        const uploadResult = await uploadResponse.json();
        uploadedFileUrls = uploadResult.fileUrls;
      }
      
      // Fixed: Correct logic for determining if report is complete
      const isComplete = (
        reportData.DoesAddressMatchSurvey !== "" &&
        reportData.accessibleByRegisteredRoad !== "" &&
        reportData.closeToIndustrialOrWaste !== "" &&
        reportData.comments !== "" &&
        reportData.erosionOrFloodRisk !== "" &&
        reportData.identifiedInExpansionPlans !== "" &&
        reportData.isPropertyFreeOfAcquisition !== "" &&
        reportData.legalAccessRightOfWay !== "" &&
        reportData.locatedInCommercialZone !== "" &&
        reportData.locatedInMixedArea !== "" &&
        reportData.locatedInResidentialArea !== "" &&
        reportData.nearHighVoltageLines !== "" &&
        reportData.nearRoadExpansionZone !== "" &&
        reportData.suitableProximityToEducation !== "" &&
        reportData.suitableProximityToHazards !== "" &&
        reportData.suitableProximityToHealthcare !== "" &&
        reportData.suitableProximityToMarket !== "" &&
        reportData.suitableProximityToRecreation !== "" &&
        reportData.suitableProximityToServices !== "" &&
        reportData.suitableProximityToTransport !== "" &&
        reportData.suitableProximityToUtilities !== "" &&
        reportData.suitableSoilProfile !== "" &&
        reportData.suitableTopography !== "" &&
        reportData.withinDrainageOrWetlands !== ""
      );
                         
      const newStatus = isComplete ? 'COMPLETED' : 'IN_PROGRESS';
      
      const reportPayload = {
        verificationRequestId: selectedVerification.id,
        partnerId: Number(partnerId),
        reportFiles: uploadedFileUrls,
        findings: {
          DoesAddressMatchSurvey: reportData.DoesAddressMatchSurvey === "yes",
          isPropertyFreeOfAcquisition: reportData.isPropertyFreeOfAcquisition === "yes",
          locatedInResidentialArea: reportData.locatedInResidentialArea === "yes",
          locatedInCommercialZone: reportData.locatedInCommercialZone === "yes",
          locatedInMixedArea: reportData.locatedInMixedArea === "yes",
          identifiedInExpansionPlans: reportData.identifiedInExpansionPlans === "yes",
          erosionOrFloodRisk: reportData.erosionOrFloodRisk === "yes",
          closeToIndustrialOrWaste: reportData.closeToIndustrialOrWaste === "yes",
          nearHighVoltageLines: reportData.nearHighVoltageLines === "yes",
          nearRoadExpansionZone: reportData.nearRoadExpansionZone === "yes",
          accessibleByRegisteredRoad: reportData.accessibleByRegisteredRoad === "yes",
          withinDrainageOrWetlands: reportData.withinDrainageOrWetlands === "yes",
          legalAccessRightOfWay: reportData.legalAccessRightOfWay === "yes",
          suitableSoilProfile: reportData.suitableSoilProfile === "yes",
          suitableTopography: reportData.suitableTopography === "yes",
          suitableProximityToUtilities: reportData.suitableProximityToUtilities === "yes",
          suitableProximityToServices: reportData.suitableProximityToServices === "yes",
          suitableProximityToTransport: reportData.suitableProximityToTransport === "yes",
          suitableProximityToHazards: reportData.suitableProximityToHazards === "yes",
          suitableProximityToMarket: reportData.suitableProximityToMarket === "yes",
          suitableProximityToEducation: reportData.suitableProximityToEducation === "yes",
          suitableProximityToHealthcare: reportData.suitableProximityToHealthcare === "yes",
          suitableProximityToRecreation: reportData.suitableProximityToRecreation === "yes",
          comments: reportData.comments
        },
        status: 'DRAFT'
      };

      console.log("Submitting report payload:", reportPayload);
      
      const response = await fetch('/api/verificationReports/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportPayload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create verification report');
      }
      
      const statusResponse = await fetch(`/api/verification-requests/${selectedVerification.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!statusResponse.ok) {
        throw new Error('Failed to update verification status');
      }
      
      const updatedVerifications = verifications.map(v => 
        v.id === selectedVerification.id ? { ...v, status: newStatus } : v
      );
      setVerifications(updatedVerifications);
      
      setShowSubmitConfirmModal(false);
      setIsReportModalOpen(false);
      setSelectedVerification(null);
      alert('Verification report created successfully');
    } catch (error) {
      console.error('Error creating verification report:', error);
      setError(error instanceof Error ? error.message : 'Failed to create verification report. Please try again.');
      setShowSubmitConfirmModal(false);
      setIsReportModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading verification requests...</div>;
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-md mt-6 mx-auto max-w-3xl">
      <h2 className="text-lg font-bold mb-2">Assigned Verification Requests</h2>
      {verifications.length === 0 ? (
        <p className="text-gray-500">No verification requests assigned yet.</p>
      ) : (
        <div className="space-y-4">
          {verifications.map((verification) => (
            <div key={verification.id} className="p-4 border rounded-lg shadow-sm bg-gray-50 relative flex items-start justify-between">
              <div>
                <p className="font-medium">{verification.address},{verification.lga}, {verification.state}</p>
                <p className="text-sm mt-1">
                  Status: <span className={getStatusColor(verification.status)}>{formatStatus(verification.status)}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Date: {new Date(verification.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="border border-gray-400 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 transition"
                  onClick={() => setSelectedVerification(verification)}
                >
                  View
                </button>
                {verification.status !== 'COMPLETED' && (
                  <button
                    className="border border-green-500 bg-green-100 text-green-600 px-3 py-1 rounded hover:bg-green-200 transition"
                    onClick={() => openReportModal(verification)}
                  >
                    Create Report
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Details Modal */}
      {selectedVerification && !isReportModalOpen && !showSubmitConfirmModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-200 transition"
              onClick={() => setSelectedVerification(null)}
            >
              ✖️
            </button>

            <h1 className="text-2xl font-bold">Verification Details</h1>
            <p className="mt-2"><strong>Address:</strong> {selectedVerification.address}</p>
            <p><strong>LGA:</strong> {selectedVerification.lga}</p> 
            <p><strong>State:</strong> {selectedVerification.state}</p>
            
            {selectedVerification.landsize && (
              <p><strong>Land Size:</strong> {selectedVerification.landsize}</p>
            )}
            
            <p><strong>Status:</strong> <span className={getStatusColor(selectedVerification.status)}>{formatStatus(selectedVerification.status)}</span></p>
            <p><strong>Date:</strong> {new Date(selectedVerification.createdAt).toLocaleDateString()}</p>
            
            {selectedVerification.latitude !== undefined && selectedVerification.longitude !== undefined && (
              <div className="mt-2">
                <p><strong>Latitude:</strong> {selectedVerification.latitude}</p>
                <p><strong>Longitude:</strong> {selectedVerification.longitude}</p>
              </div>
            )}
            
            {selectedVerification.address && selectedVerification.lga && selectedVerification.state && (
              <div className="mt-4">
                <h4 className="font-semibold">Location Map:</h4>
                <div className="mt-2 bg-gray-100 h-48 rounded flex items-center justify-center">
                  <a 
                    href={`https://www.google.com/maps?q=${selectedVerification.address},${selectedVerification.lga},${selectedVerification.state}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
            )}
            
            {selectedVerification.files && selectedVerification.files.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">Uploaded Files:</h4>
                <div className="mt-2 space-y-2">
                  {selectedVerification.files.map((file, index) => (
                    <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline">
                      View File {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedVerification.status !== 'COMPLETED' && (
              <div className="mt-4 flex justify-center">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                  onClick={() => {
                    setSelectedVerification(null);
                    openReportModal(selectedVerification);
                  }}
                >
                  Create Verification Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Creation Modal */}
      {isReportModalOpen && selectedVerification && (
         <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative max-h-screen overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-200 transition"
              onClick={closeReportModal}
              disabled={submitting}
            >
              ✖️
            </button>

            <h1 className="text-2xl font-bold mb-4">Create Verification Report</h1>
            <p className="mb-4">
              <strong>Land/Property Address: </strong> 
              {selectedVerification.address}, {selectedVerification.lga || ""}, {selectedVerification.state}
            </p>
            
            {selectedVerification.landsize && (
              <p className="mb-4"><strong>Land Size: </strong> {selectedVerification.landsize}</p>
            )}

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded border border-red-300">
                {error}
              </div>
            )}

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setIsReportModalOpen(false);
                setShowSubmitConfirmModal(true);
              }} 
              className="space-y-4"
            >
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Does the address above match survey records?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="DoesAddressMatchSurvey"
                        value="yes"
                        checked={reportData.DoesAddressMatchSurvey === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="DoesAddressMatchSurvey"
                        value="no"
                        checked={reportData.DoesAddressMatchSurvey === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Is the property located in a residential area?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="locatedInResidentialArea"
                        value="yes"
                        checked={reportData.locatedInResidentialArea === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="locatedInResidentialArea"
                        value="no"
                        checked={reportData.locatedInResidentialArea === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Is this land/property free of acquisition?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPropertyFreeOfAcquisition"
                        value="yes"
                        checked={reportData.isPropertyFreeOfAcquisition === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPropertyFreeOfAcquisition"
                        value="no"
                        checked={reportData.isPropertyFreeOfAcquisition === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Is the property located in a commercial zone?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="locatedInCommercialZone"
                        value="yes"
                        checked={reportData.locatedInCommercialZone === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="locatedInCommercialZone"
                        value="no"
                        checked={reportData.locatedInCommercialZone === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Located in Mixed Residential/Commercial Area?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="locatedInMixedArea"
                        value="yes"
                        checked={reportData.locatedInMixedArea === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="locatedInMixedArea"
                        value="no"
                        checked={reportData.locatedInMixedArea === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Identified in Future Government Expansion Plans?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="identifiedInExpansionPlans"
                        value="yes"
                        checked={reportData.identifiedInExpansionPlans === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="identifiedInExpansionPlans"
                        value="no"
                        checked={reportData.identifiedInExpansionPlans === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Erosion-Prone or Flood-Risk Area?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="erosionOrFloodRisk"
                        value="yes"
                        checked={reportData.erosionOrFloodRisk === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="erosionOrFloodRisk"
                        value="no"
                        checked={reportData.erosionOrFloodRisk === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Close to Industrial Facilities or Waste Disposal Sites?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="closeToIndustrialOrWaste"
                        value="yes"
                        checked={reportData.closeToIndustrialOrWaste === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="closeToIndustrialOrWaste"
                        value="no"
                        checked={reportData.closeToIndustrialOrWaste === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Near or Under High-Voltage Transmission Lines?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="nearHighVoltageLines"
                        value="yes"
                        checked={reportData.nearHighVoltageLines === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="nearHighVoltageLines"
                        value="no"
                        checked={reportData.nearHighVoltageLines === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Near Likely Road Expansion or Realignment Zone?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="nearRoadExpansionZone"
                        value="yes"
                        checked={reportData.nearRoadExpansionZone === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="nearRoadExpansionZone"
                        value="no"
                        checked={reportData.nearRoadExpansionZone === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Accessible by Registered/Government Approved Road?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="accessibleByRegisteredRoad"
                        value="yes"
                        checked={reportData.accessibleByRegisteredRoad === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="accessibleByRegisteredRoad"
                        value="no"
                        checked={reportData.accessibleByRegisteredRoad === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Within Drainage or Wetlands?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="withinDrainageOrWetlands"
                        value="yes"
                        checked={reportData.withinDrainageOrWetlands === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="withinDrainageOrWetlands"
                        value="no"
                        checked={reportData.withinDrainageOrWetlands === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Legal Access or Right of Way Available?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="legalAccessRightOfWay"
                        value="yes"
                        checked={reportData.legalAccessRightOfWay === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="legalAccessRightOfWay"
                        value="no"
                        checked={reportData.legalAccessRightOfWay === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Suitable Soil Profile for Construction?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableSoilProfile"
                        value="yes"
                        checked={reportData.suitableSoilProfile === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableSoilProfile"
                        value="no"
                        checked={reportData.suitableSoilProfile === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Suitable Topography?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableTopography"
                        value="yes"
                        checked={reportData.suitableTopography === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableTopography"
                        value="no"
                        checked={reportData.suitableTopography === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Suitable Proximity to Utilities (Water, Power, Gas)?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToUtilities"
                        value="yes"
                        checked={reportData.suitableProximityToUtilities === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToUtilities"
                        value="no"
                        checked={reportData.suitableProximityToUtilities === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Suitable Proximity to Basic Services?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToServices"
                        value="yes"
                        checked={reportData.suitableProximityToServices === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToServices"
                        value="no"
                        checked={reportData.suitableProximityToServices === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Suitable Proximity to Transportation?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToTransport"
                        value="yes"
                        checked={reportData.suitableProximityToTransport === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToTransport"
                        value="no"
                        checked={reportData.suitableProximityToTransport === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Safe Distance from Environmental Hazards?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToHazards"
                        value="yes"
                        checked={reportData.suitableProximityToHazards === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToHazards"
                        value="no"
                        checked={reportData.suitableProximityToHazards === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Suitable Proximity to Market/Commercial Areas?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToMarket"
                        value="yes"
                        checked={reportData.suitableProximityToMarket === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToMarket"
                        value="no"
                        checked={reportData.suitableProximityToMarket === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Suitable Proximity to Educational Institutions?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToEducation"
                        value="yes"
                        checked={reportData.suitableProximityToEducation === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToEducation"
                        value="no"
                        checked={reportData.suitableProximityToEducation === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Suitable Proximity to Healthcare Facilities?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToHealthcare"
                        value="yes"
                        checked={reportData.suitableProximityToHealthcare === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToHealthcare"
                        value="no"
                        checked={reportData.suitableProximityToHealthcare === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Suitable Proximity to Recreation Facilities?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToRecreation"
                        value="yes"
                        checked={reportData.suitableProximityToRecreation === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="suitableProximityToRecreation"
                        value="no"
                        checked={reportData.suitableProximityToRecreation === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
                        required
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Comments/Observations
                  </label>
                  <textarea
                    name="comments"
                    value={reportData.comments}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Provide any additional observations or comments about the verification..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Verification File (Required)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    required
                    name="reportFiles"
                    id="reportFiles"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {reportData.reportFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Selected files:</p>
                      <div className="space-y-1">
                        {reportData.reportFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                            <span className="text-sm">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={submitting}
                >
                  Continue to Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <h2 className="text-xl font-bold mb-4">Confirm Report Submission</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to submit this verification report? Once submitted, you will not be able to edit it.
            </p>
            
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Property:</strong> {selectedVerification?.address}, {selectedVerification?.lga}, {selectedVerification?.state}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Verification ID:</strong> {selectedVerification?.id}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded border border-red-300">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSubmitConfirmModal(false);
                  setIsReportModalOpen(true);
                }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Back to Edit
              </button>
              <button
                onClick={submitReport}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationHistory;
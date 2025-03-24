"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useVerification } from "@/app/partner/dashboard/components/VerificationContext/VerificationContext";

interface VerificationRequest {
  id: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  status: string;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  landsize?: string; // Added landsize property
  files?: string[];
  userId: number;
}

interface ReportFormData {
  isAddressMatchSurvey: string;
  isPropertyFreeOfAcquisition: string;
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
  const [reportData, setReportData] = useState<ReportFormData>({
    isAddressMatchSurvey: "",
    isPropertyFreeOfAcquisition: "",
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
    // Convert from database format (e.g., IN_PROGRESS) to display format (e.g., In Progress)
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
    // Reset error state when opening modal
    setError(null);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    // Also clear the selected verification to fully go back to the main screen
    setSelectedVerification(null);
    setReportData({
      isAddressMatchSurvey: "",
      isPropertyFreeOfAcquisition: "",
      comments: "",
      reportFiles: []
    });
    // Clear any error messages
    setError(null);
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVerification || !partnerId) return;
    
    // Start submitting process
    setSubmitting(true);
    setError(null); // Clear any previous errors
    
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
      
      // Determine if report is complete based on both radio questions being answered
      const isComplete = reportData.isAddressMatchSurvey !== "" && 
                        reportData.isPropertyFreeOfAcquisition !== "";
                         
      // Set appropriate status
      const newStatus = isComplete ? 'COMPLETED' : 'IN_PROGRESS';
      
      // Create report data
      const reportPayload = {
        verificationRequestId: selectedVerification.id,
        partnerId: Number(partnerId),
        reportFiles: uploadedFileUrls,
        findings: {
          isAddressMatchSurvey: reportData.isAddressMatchSurvey === "yes",
          isPropertyFreeOfAcquisition: reportData.isPropertyFreeOfAcquisition === "yes",
          comments: reportData.comments
        },
        status: 'DRAFT'
      };

      // Debug log the payload
      console.log("Submitting report payload:", reportPayload);
      
      // Submit report - using a properly formatted endpoint
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
      
      // Update verification status to the appropriate status (IN_PROGRESS or COMPLETED)
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
      
      // Update local state
      const updatedVerifications = verifications.map(v => 
        v.id === selectedVerification.id ? { ...v, status: newStatus } : v
      );
      setVerifications(updatedVerifications);
      
      // Close modal and reset form
      closeReportModal();
      alert('Verification report created successfully');
    } catch (error) {
      console.error('Error creating verification report:', error);
      setError(error instanceof Error ? error.message : 'Failed to create verification report. Please try again.');
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
                <p className="font-medium">{verification.address}, {verification.city}, {verification.state} {verification.postalCode}</p>
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
      {selectedVerification && !isReportModalOpen && (
          <div className="fixed inset-0 bg-gray bg-opacity-10 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-200 transition"
              onClick={() => setSelectedVerification(null)}
            >
              ✖️
            </button>

            <h3 className="text-lg font-bold">Verification Details</h3>
            <p className="mt-2"><strong>Address:</strong> {selectedVerification.address}</p>
            <p><strong>City:</strong> {selectedVerification.city}</p>
            <p><strong>State:</strong> {selectedVerification.state}</p>
            <p><strong>Postal Code:</strong> {selectedVerification.postalCode}</p>
            
            {/* Display landsize if available */}
            {selectedVerification.landsize && (
              <p><strong>Land Size:</strong> {selectedVerification.landsize}</p>
            )}
            
            <p><strong>Status:</strong> <span className={getStatusColor(selectedVerification.status)}>{formatStatus(selectedVerification.status)}</span></p>
            <p><strong>Date:</strong> {new Date(selectedVerification.createdAt).toLocaleDateString()}</p>
            
            {/* Display latitude and longitude if available */}
            {selectedVerification.latitude !== undefined && selectedVerification.longitude !== undefined && (
              <div className="mt-2">
                <p><strong>Latitude:</strong> {selectedVerification.latitude}</p>
                <p><strong>Longitude:</strong> {selectedVerification.longitude}</p>
              </div>
            )}
            
            {/* Map view if address are available */}
            {selectedVerification.address !== undefined && selectedVerification.city !== undefined && selectedVerification.state !== undefined && (
              <div className="mt-4">
                <h4 className="font-semibold">Location Map:</h4>
                <div className="mt-2 bg-gray-100 h-48 rounded flex items-center justify-center">
                  <a 
                    href={`https://www.google.com/maps?q=${selectedVerification.address},${selectedVerification.city},${selectedVerification.state}`} 
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
          <div className="fixed inset-0 bg-gray bg-opacity-10 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative max-h-90vh overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 cursor-pointer p-2 rounded-full hover:bg-gray-200 transition"
              onClick={closeReportModal}
              disabled={submitting}
            >
              ✖️
            </button>

            <h1 className="text-2xl font-bold mb-4">Create Verification Report</h1>
            <p className="mb-4">
              <strong>Land: </strong> 
              {selectedVerification.address}, {selectedVerification.city}, {selectedVerification.state} {selectedVerification.postalCode}
            </p>
            
            {/* Display land size in the report modal as well */}
            {selectedVerification.landsize && (
              <p className="mb-4"><strong>Land Size: </strong> {selectedVerification.landsize}</p>
            )}

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded border border-red-300">
                {error}
              </div>
            )}

            <form onSubmit={submitReport} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Does the address above match survey records?</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isAddressMatchSurvey"
                        value="yes"
                        checked={reportData.isAddressMatchSurvey === "yes"}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isAddressMatchSurvey"
                        value="no"
                        checked={reportData.isAddressMatchSurvey === "no"}
                        onChange={handleInputChange}
                        className="mr-2"
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
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="comments" className="block mb-1 font-medium">Comments</label>
                <textarea
                  id="comments"
                  name="comments"
                  value={reportData.comments}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md h-28"
                  placeholder="Enter any additional comments or observations..."
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="reportFiles" className="block mb-1 font-medium">Upload Files</label>
                <input
                  type="file"
                  id="reportFiles"
                  multiple
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">Upload images or documents related to the verification</p>
                
                {reportData.reportFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-sm mb-2">Selected Files:</p>
                    <ul className="space-y-2">
                      {reportData.reportFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm truncate max-w-xs">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-100"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationHistory;
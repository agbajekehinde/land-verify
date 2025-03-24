"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  useVerification, 
  ReportStatus, 
  VerificationRequest,
  ReportFindings
} from "../verificationcontext/VerificationContext";
import { generateVerificationPDF } from "@/app/utils/pdfGenerator";

const VerificationHistory: React.FC = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { verifications, setVerifications} = useVerification();
  
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchVerifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}/verificationHistory`);
        if (!response.ok) throw new Error("Failed to fetch verifications");
        const data = await response.json();
        setVerifications(data);
      } catch (error) {
        console.error("Error fetching verifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifications();
  }, [userId, setVerifications]);

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
  
  // Function to check if a download button should be shown
  const shouldShowDownload = (verification: VerificationRequest) => {
    return (
      verification.report && 
      verification.report.status === ReportStatus.APPROVED && 
      verification.report.findings
    );
  };

  // Updated function to download findings as PDF
  const downloadFindings = async (findings: unknown | undefined, verification: VerificationRequest) => {
    if (!findings) {
      console.error("No findings available to download");
      return;
    }
    
    try {
      setGeneratingPDF(true);
      const reportFindings = findings as ReportFindings;
      
      const reportFiles = verification.report?.reportFiles || [];
      
      const doc = await generateVerificationPDF(
        reportFindings, 
        verification.address,
        {
          city: verification.city,
          state: verification.state,
          postalCode: verification.postalCode,
          createdAt: verification.createdAt
        },
        reportFiles
      );
      
      const fileName = `verification_report_${verification.address.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      
      doc.save(fileName);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again later.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading verification history...</div>;
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-md mt-6">
      <h2 className="text-lg font-bold mb-2">Verification History</h2>
      {verifications.length === 0 ? (
        <p className="text-gray-500">No verification requests made yet.</p>
      ) : (
        <div className="space-y-4">
          {verifications.map((verification) => (
            <div key={verification.id} className="p-4 border rounded-lg shadow-sm bg-gray-50 relative flex flex-col sm:flex-row items-start justify-between">
              <div className="flex-grow">
                <p className="font-medium">{verification.address}, {verification.city}, {verification.state} {verification.postalCode}</p>
                <p className="text-sm mt-1">
                  Status: <span className={getStatusColor(verification.status)}>{formatStatus(verification.status)}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Date: {new Date(verification.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                <button
                  className="border border-gray-400 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 transition w-full sm:w-auto"
                  onClick={() => setSelectedVerification(verification)}
                >
                  View
                </button>
                
                {/* Download button - only show when report is approved */}
                {shouldShowDownload(verification) && (
                  <button
                    className={`border border-green-500 bg-green-50 text-green-700 px-3 py-1 rounded hover:bg-green-100 transition flex items-center justify-center w-full sm:w-auto ${generatingPDF ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => downloadFindings(verification.report?.findings, verification)}
                    disabled={generatingPDF}
                  >
                    {generatingPDF ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rest of the component remains the same */}
      {/* Modal for viewing verification details */}
      {selectedVerification && (
          <div className="fixed inset-0 bg-gray bg-opacity-10 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative max-h-[90vh] overflow-y-auto">
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
            <p><strong>Land Size:</strong> {selectedVerification.landsize}</p>
            <p><strong>Latitude:</strong> {selectedVerification.latitude}</p>
            <p><strong>Longitude:</strong> {selectedVerification.longitude}</p>
            <p><strong>Status:</strong> <span className={getStatusColor(selectedVerification.status)}>{formatStatus(selectedVerification.status)}</span></p>
            <p><strong>Date:</strong> {new Date(selectedVerification.createdAt).toLocaleDateString()}</p>
            
            {selectedVerification.report && (
              <div className="mt-4 pt-4 border-t border-gray-200">            
                {/* Display report files if available */}
                {selectedVerification.report.reportFiles && selectedVerification.report.reportFiles.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-semibold">Verification Images:</h4>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {selectedVerification.report.reportFiles.map((file: string, index: number) => (
                        <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="block">
                          <img 
                            src={file} 
                            alt={`Verification image ${index + 1}`}
                            className="w-full h-24 object-cover rounded border border-gray-200 hover:border-blue-400 transition" 
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Download button in modal - only shown when report is approved */}
                {shouldShowDownload(selectedVerification) && (
                  <button
                    className={`mt-4 border border-green-500 bg-green-50 text-green-700 px-3 py-1 rounded hover:bg-green-100 transition w-full flex items-center justify-center ${generatingPDF ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => downloadFindings(selectedVerification.report?.findings, selectedVerification)}
                    disabled={generatingPDF}
                  >
                    {generatingPDF ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF Report
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            
            {/* Display uploaded files if available */}
            {selectedVerification.files && selectedVerification.files.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold">Customer Uploaded Files:</h4>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {selectedVerification.files.map((file: string, index: number) => (
                    <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="block">
                      <img 
                        src={file} 
                        alt={`User file ${index + 1}`}
                        className="w-full h-24 object-cover rounded border border-gray-200 hover:border-blue-400 transition" 
                        onError={(e) => {
                          // If image fails to load, show a file icon instead
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/document-icon.svg"; // Fallback image
                          target.classList.add("p-2");
                          target.classList.remove("object-cover");
                          target.classList.add("object-contain");
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationHistory;
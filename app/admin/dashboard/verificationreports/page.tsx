// app/admin/verification-reports/page.tsx
import { PrismaClient } from "@prisma/client";
import React from "react";
import ActionDropdown from "../components/reportsactiondropdown/VerificationReportActions";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function VerificationReportsPage() {
  // Fetch all verification reports with partner and verification request details
  const reports = await prisma.verificationReport.findMany({
    include: { 
      partner: true,
      verificationRequest: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="p-4 lg:pl-72">
      <h1 className="text-2xl font-bold mb-6">Verification Reports</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-3 px-4 font-medium">Report ID</th>
              <th className="py-3 px-4 font-medium">Request ID</th>
              <th className="py-3 px-4 font-medium">Partner</th>
              <th className="py-3 px-4 font-medium">User Email</th>
              <th className="py-3 px-4 font-medium">Property Address</th>
              <th className="py-3 px-4 font-medium">Report Status</th>
              <th className="py-3 px-4 font-medium">Created</th>
              <th className="py-3 px-4 font-medium">Last Updated</th>
              <th className="py-3 px-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <React.Fragment key={report.id}>
                <tr className="hover:bg-gray-100 transition">
                  <td className="py-3 px-4">{report.id}</td>
                  <td className="py-3 px-4">{report.verificationRequestId}</td>
                  <td className="py-3 px-4">
                    {report.partner ? `${report.partner.firstName} ${report.partner.lastName}` : "N/A"}
                  </td>
                  <td className="py-3 px-4">{report.verificationRequest.user?.email || "N/A"}</td>
                  <td className="py-3 px-4">
                    {`${report.verificationRequest.address}, ${report.verificationRequest.city}, ${report.verificationRequest.state} ${report.verificationRequest.postalCode}`}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{formatDate(report.createdAt)}</td>
                  <td className="py-3 px-4">{formatDate(report.updatedAt)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="text-xl font-bold p-2 hover:bg-gray-200">
                      <ActionDropdown reportId={report.id}/>
                    </div>
                  </td>
                </tr>
                {index < reports.length - 1 && (
                  <tr>
                    <td colSpan={9} className="border-t border-gray-300"></td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function to format dates
function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Helper function to get appropriate badge color based on status
function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'DRAFT':
      return 'bg-yellow-100 text-yellow-800';
    case 'SUBMITTED':
      return 'bg-blue-100 text-blue-800';
    case 'REVIEWED':
      return 'bg-purple-100 text-purple-800';
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
// app/admin/verification-reports/[id]/page.tsx
import React from "react";
import { PrismaClient, VerificationReport, Partner, VerificationRequest, User } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Edit } from "lucide-react";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type ReportWithRelations = VerificationReport & {
  partner: Partner;
  verificationRequest: VerificationRequest & {
    user: User;
    // files is a scalar array so it's available on the verificationRequest
    files: string[];
  };
};

export default async function ReportDetailsPage({ params }: { params: { id: string } }) {
  // Await params to extract id
  const { id } = await params;

  // Fetch the verification report with all related data (remove files: true from include)
  const report = await prisma.verificationReport.findUnique({
    where: { id },
    include: {
      partner: true,
      verificationRequest: {
        include: {
          user: true
        }
      }
    }
  }) as ReportWithRelations | null;

  // If report doesn't exist, return 404
  if (!report) {
    return notFound();
  }

  // Parse the findings JSON for display
  const findings = report.findings ? JSON.parse(JSON.stringify(report.findings)) : null;

  return (
    <div className="p-4 lg:pl-72 max-w-5xl">
      <div className="flex items-center mb-6">
        <Link href="/admin/dashboard/verificationreports" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Reports
        </Link>
        <h1 className="text-2xl font-bold flex-grow">Verification Report Details</h1>
        <Link 
          href={`/admin/verification-reports/${id}/edit`}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Report
        </Link>
      </div>

      {/* Report Status Badge */}
      <div className="mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(report.status)}`}>
          {report.status}
        </span>
      </div>

      {/* Report and Request Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Report Information</h2>
          <dl className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-600">Report ID:</dt>
              <dd className="col-span-2">{report.id}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-600">Created:</dt>
              <dd className="col-span-2">{formatDate(report.createdAt)}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-600">Last Updated:</dt>
              <dd className="col-span-2">{formatDate(report.updatedAt)}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-600">Partner:</dt>
              <dd className="col-span-2">{`${report.partner.firstName} ${report.partner.lastName}`}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-600">Partner Email:</dt>
              <dd className="col-span-2">{report.partner.email}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Property Information</h2>
          <dl className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-600">Request ID:</dt>
              <dd className="col-span-2">{report.verificationRequestId}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-600">Property Owner:</dt>
              <dd className="col-span-2">{`${report.verificationRequest.user.firstName} ${report.verificationRequest.user.lastName}`}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-600">Email:</dt>
              <dd className="col-span-2">{report.verificationRequest.user.email}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-600">Address:</dt>
              <dd className="col-span-2">
                {`${report.verificationRequest.address}, ${report.verificationRequest.lga}, ${report.verificationRequest.state}`}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-600">Land Size:</dt>
              <dd className="col-span-2">{report.verificationRequest.landsize}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Findings Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Findings and Assessment</h2>
        {findings ? (
          <div className="space-y-4">
            {Object.entries(findings).map(([key, value]) => (
              <div key={key} className="border-b pb-2">
                <h3 className="font-medium text-gray-800 capitalize">{key.replace(/_/g, " ")}</h3>
                <p className="text-gray-600">{String(value)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No detailed findings available.</p>
        )}
      </div>

      {/* Report Files */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Report Files</h2>
        {report.reportFiles && report.reportFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.reportFiles.map((fileUrl, index) => (
              <div key={index} className="border rounded-md p-3 flex items-center justify-between">
                <span className="text-sm truncate">Document {index + 1}</span>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-5 w-5" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No report files uploaded.</p>
        )}
      </div>

      {/* Original Verification Files */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Original Verification Files</h2>
        {report.verificationRequest.files && report.verificationRequest.files.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.verificationRequest.files.map((fileUrl, index) => (
              <div key={index} className="border rounded-md p-3 flex items-center justify-between">
                <span className="text-sm truncate">Document {index + 1}</span>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-5 w-5" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No verification request files available.</p>
        )}
      </div>
    </div>
  );
}

// Helper function to format dates
function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Helper function to get appropriate badge color based on status
function getStatusBadgeColor(status: string) {
  switch (status) {
    case "DRAFT":
      return "bg-yellow-100 text-yellow-800";
    case "SUBMITTED":
      return "bg-blue-100 text-blue-800";
    case "REVIEWED":
      return "bg-purple-100 text-purple-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

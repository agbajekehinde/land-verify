import { PrismaClient } from "@prisma/client";
import React from "react";
import { notFound } from "next/navigation";
import EditReportForm from "./EditReportForm";

interface Findings {
 [key: string]: string | number | boolean | object;
}

type ReportStatus = "DRAFT" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "REJECTED";

interface FormattedReport {
  id: string;
  findings: Findings;
  status: ReportStatus;
  reportFiles: string[];
}

// Initialize PrismaClient globally
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

type Props = {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function EditReportPage({ params }: Props) {
  const { id } = params;
  try {
    const report = await prisma.verificationReport.findUnique({
      where: { id },
      include: {
        partner: true,
        verificationRequest: {
          include: {
            user: true,
          },
        },
      },
    });
    
    if (!report) {
      return notFound();
    }
    
    const formattedReport: FormattedReport = {
      id: report.id,
      findings: (report.findings as Findings) || {},
      status: report.status as ReportStatus,
      reportFiles: Array.isArray(report.reportFiles) ? report.reportFiles : [],
    };
    
    return (
      <div className="p-4 lg:pl-72 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Edit Verification Report</h1>

        {/* @ts-expect-error Server Component passing props to Client Component */}
        
        <EditReportForm report={formattedReport} />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch report:", error);
    return notFound();
  }
}
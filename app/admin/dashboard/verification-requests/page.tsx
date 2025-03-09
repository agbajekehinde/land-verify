// app/admin/verification-requests/page.tsx
import { PrismaClient } from "@prisma/client";
import React from "react";
import ActionDropdown from "../components/actiondropdown/ActionDropdown";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function VerificationRequestsPage() {
  const requests = await prisma.verificationRequest.findMany({
    include: { user: true },
  });

  return (
    <div className="p-4 lg:pl-72">
      <h1 className="text-2xl font-bold mb-6">Verification Requests</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-3 px-4 font-medium">ID</th>
              <th className="py-3 px-4 font-medium">User Email</th>
              <th className="py-3 px-4 font-medium">Address</th>
              <th className="py-3 px-4 font-medium">City</th>
              <th className="py-3 px-4 font-medium">State</th>
              <th className="py-3 px-4 font-medium">Postal Code</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Land Size</th>
              <th className="py-3 px-4 font-medium">Latitude</th>
              <th className="py-3 px-4 font-medium">Longitude</th>
              <th className="py-3 px-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
                {requests.map((req, index) => (
                  <React.Fragment key={req.id}>
                    <tr className="hover:bg-gray-100 transition">
                      <td className="py-3 px-4">{req.id}</td>
                      <td className="py-3 px-4">{req.user?.email || "N/A"}</td>
                      <td className="py-3 px-4">{req.address}</td>
                      <td className="py-3 px-4">{req.city}</td>
                      <td className="py-3 px-4">{req.state}</td>
                      <td className="py-3 px-4">{req.postalCode}</td>
                      <td className="py-3 px-4">{req.status}</td>
                      <td className="py-3 px-4">{req.landsize}</td>
                      <td className="py-3 px-4">{req.latitude}</td>
                      <td className="py-3 px-4">{req.longitude}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-xl font-bold p-2 hover:bg-gray-200">
                          <ActionDropdown id={req.id} />
                        </div>
                      </td>
                    </tr>
                    {index < requests.length - 1 && (
                      <tr>
                        <td colSpan={11} className="border-t border-gray-300"></td>
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

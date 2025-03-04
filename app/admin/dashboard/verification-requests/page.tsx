// app/admin/verification-requests/page.tsx
import { PrismaClient } from "@prisma/client";
import React from "react";
import ActionDropdown from "../components/actiondropdown/ActionDropdown";

const prisma = new PrismaClient();

export default async function VerificationRequestsPage() {
  // Fetch all verification requests from the database.
  const requests = await prisma.verificationRequest.findMany({
    include: { user: true },
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Verification Requests</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">ID</th>
              <th className="py-2 px-4 border">User Email</th>
              <th className="py-2 px-4 border">Address</th>
              <th className="py-2 px-4 border">City</th>
              <th className="py-2 px-4 border">State</th>
              <th className="py-2 px-4 border">Postal Code</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Land Size</th>
              <th className="py-2 px-4 border">Latitude</th>
              <th className="py-2 px-4 border">Longitude</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{req.id}</td>
                <td className="py-2 px-4 border">{req.user?.email || "N/A"}</td>
                <td className="py-2 px-4 border">{req.address}</td>
                <td className="py-2 px-4 border">{req.city}</td>
                <td className="py-2 px-4 border">{req.state}</td>
                <td className="py-2 px-4 border">{req.postalCode}</td>
                <td className="py-2 px-4 border">{req.status}</td>
                <td className="py-2 px-4 border"> {req.landsize}</td>
                <td className="py-2 px-4 border">{req.latitude}</td>
                <td className="py-2 px-4 border">{req.longitude}</td>
                <td className="py-2 px-4 border">
                  <ActionDropdown id={req.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { PrismaClient } from "@prisma/client";
import React from "react";

const prisma = new PrismaClient();

export default async function CustomersPage() {
  const requests = await prisma.user.findMany();

  return (
    <div className="p-4 lg:pl-72">
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-3 px-4 font-medium">ID</th>
              <th className="py-3 px-4 font-medium">First Name</th>
              <th className="py-3 px-4 font-medium">Last Name</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Created At</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, index) => (
              <React.Fragment key={req.id}>
                <tr className="hover:bg-gray-100 transition">
                  <td className="py-3 px-4">{req.id}</td>
                  <td className="py-3 px-4">{req.firstName}</td>
                  <td className="py-3 px-4">{req.lastName}</td>
                  <td className="py-3 px-4">{req.email}</td>
                  <td className="py-3 px-4">{new Date(req.createdAt).toLocaleDateString()}</td>
                </tr>
                {index < requests.length - 1 && (
                  <tr>
                    <td colSpan={5} className="border-t border-gray-300"></td>
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

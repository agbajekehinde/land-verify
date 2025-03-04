"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface ActionDropdownProps {
  id: string;
}

export default function ActionDropdown({ id }: ActionDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded hover:bg-gray-200"
      >
        &#x22EE;
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded shadow-lg z-10">
          <div className="py-1">
            <Link
              href={`/admin/verification-requests/${id}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              View full details
            </Link>
            <Link
              href={`/admin/verification-requests/${id}/assign`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Assign to partner
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

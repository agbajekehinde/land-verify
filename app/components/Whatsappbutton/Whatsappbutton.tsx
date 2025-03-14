// app/components/WhatsAppButton.tsx
"use client";
import React from 'react';

export default function WhatsAppButton() {
  return (
    <a 
      href="https://wa.me/message/2M46JKYVDQRVM1" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-[32px] right-[12px] z-50 block p-3"
    >
      <img
        src="/Whatsapp-Business-Icon2.png"
        alt="WhatsApp Business Button"
        width={140}
        height={42}
      />
    </a>
  );
}
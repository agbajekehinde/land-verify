// app/components/WhatsAppButton.tsx
"use client";
import React from 'react';

const Typeform = ()=>{
  return (
    <>
      <div data-tf-live="01JPYPF0K6KHNEDVBTQRZEX1JX"></div>
      <img src='whatsapp.png' alt='WhatsApp' className='fixed bottom-4 right-4 w-42 h-14 z-50 cursor-pointer' onClick={() => window.open('https://wa.me/message/2M46JKYVDQRVM1', '_blank')} />
    </>
  );
}
export default Typeform;
"use client";
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const FAQs: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto flex flex-col md:flex-row p-5 pt-24 py-24">
      <div className="md:w-1/4 p-5">
        <h2 className="text-2xl font-bold text-gray-800 md:text-4xl">Frequently Asked Questions (FAQ)</h2>
      </div>
      <div className="md:w-3/4 p-5">
        {faqData.map((faq, index) => (
          <div key={index} className="mb-4 border-b border-gray-200">
            <div
              className="flex justify-between items-center cursor-pointer py-2"
              onClick={() => toggleAccordion(index)}
            >
              <h3 className="text-lg font-medium">{faq.question}</h3>
              {activeIndex === index ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </div>
            {activeIndex === index && <p className="mt-2 text-gray-600">{faq.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

const faqData = [
  {
    question: 'What is LandVerify?',
    answer: 'LandVerify is a land verification/authentication tech platform that helps prospective land/properties buyers verify the authenticity of land or properties using a team of certified town planners, surveyors, and legal professionals.',
  },
  {
    question: 'How long does the verification process take?',
    answer: 'The process takes between 48 hours or 5 working days, depending on the service chosen.',
  },
  {
    question: 'What documents do I need for verification?',
    answer: 'You will need to provide key details like the full address or the property deed, survey plan, and any related legal paperwork.',
  },
  {
    question: 'How much does it cost to verify a property?',
    answer: 'Pricing depends on the type of verification service selected',
  },
  {
    question: 'Is LandVerify available in all states?',
    answer: 'Currently, our services are available in Lagos, Ogun, Oyo, and the FCT, with plans to expand soon.',
  },
  {
    question: 'What happens if a property fails verification?',
    answer: 'If a property is found to not be free to purchase or not verified, we will provide a detailed report outlining the issues we discovered and advice on the next steps.',
  },
  {
    question: 'How do I get started?',
    answer: "Simply click on 'Start Verification' button, submit your property details, and let our experts handle the rest.",
  },
];

export default FAQs;
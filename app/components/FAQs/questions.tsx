"use client";
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const FAQs: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto flex flex-col md:flex-row p-5">
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
    question: 'Q1: What is LandVerify?',
    answer: 'LandVerify is a digital platform that helps prospective property buyers verify the authenticity of land or landed property using a team of certified town planners and legal professionals.',
  },
  {
    question: 'Q2: How long does the verification process take?',
    answer: 'The process takes between 48 hours and 7 working days, depending on the complexity of the case.',
  },
  {
    question: 'Q3: What documents do I need for verification?',
    answer: 'You will need to provide key documents such as the property deed, survey plan, and any related legal paperwork.',
  },
  {
    question: 'Q4: How much does it cost to verify a property?',
    answer: 'Pricing depends on the type of property and the depth of verification required. Contact us for a custom quote.',
  },
  {
    question: 'Q5: Is LandVerify available in all states?',
    answer: 'Currently, our services are available in Lagos and Ogun states, with plans to expand soon.',
  },
  {
    question: 'Q6: What happens if a property fails verification?',
    answer: 'If a property is found to be fraudulent or legally disputed, we will provide a detailed report outlining the issues and guidance on the next steps.',
  },
  {
    question: 'Q7: How do I get started?',
    answer: 'Simply click <a href="#">Verify a Property Now</a>, submit your property details, and let our experts handle the rest.',
  },
];

export default FAQs;
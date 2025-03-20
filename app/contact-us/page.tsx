import React from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

const Contact: React.FC = () => {
  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Contact Us</h1>
        <p className="text-gray-500 text-center mb-4">We are here here to assist you with your land verification needs.</p>

        <div className="space-y-6">
          <Section title="Email">
            <ul className="list-disc pl-6">
              <li>General Inquiries: <a href="mailto:hello@landverify.ng" className="text-gray-600 underline">hello@landverify.ng</a></li>
              <li>Support: <a href="mailto:support@landverify.ng" className="text-gray-600 underline">support@landverify.ng</a></li>
            </ul>
          </Section>

          <Section title="Phone">
            <p>Customer Support: <span className="font-medium">+234 902 962 8530</span></p>
            <p>WhatsApp: <span className="font-medium">+234 902 962 8530</span></p>
          </Section>

          <Section title="Follow Us">
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-gray-700 hover:underline">Facebook</a>
              <a href="#" className="text-gray-700 hover:underline">Twitter/X</a>
              <a href="#" className="text-gray-700 hover:underline">Instagram</a>
              <a href="#" className="text-gray-700 hover:underline">LinkedIn</a>
            </div>
          </Section>
        </div>
      </div>
      <div className="py-12"></div>
      <Footer />
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="text-gray-700">{children}</div>
    </div>
  );
};

export default Contact;

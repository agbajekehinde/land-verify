import React from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

const TermsAndConditions: React.FC = () => {
  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Terms and Conditions for LandVerify</h1>
        <p className="text-gray-500 text-center mb-4">Effective Date: March 14, 2025</p>
        
        <div className="space-y-6">
          <Section title="1. Introduction">
            <p>These Terms and Conditions (&quot;Terms&quot;) govern your use of the LandVerify platform and services (collectively, the &quot;Service&quot;). By accessing or using our Service, you agree to be bound by these Terms.</p>
          </Section>

          <Section title="2. Service Description">
            <p>LandVerify provides a digital platform that connects prospective land and property owners with licensed experts in verifying authenticity/genuinety of a land/property within the accordance of the established laws.</p>
          </Section>

          <Section title="3. User Registration">
            <ul className="list-disc pl-6 space-y-2">
              <li>You may be required to register for an account and provide accurate information.</li>
              <li>You are responsible for safeguarding your account credentials.</li>
              <li>Notify us immediately of any unauthorized account usage.</li>
            </ul>
          </Section>

          <Section title="4. Service Process and Timeframes">
            <p>Verification is expected to complete within 48 hours to 7 working days, but timeframes may vary.</p>
          </Section>

          <Section title="5. User Obligations">
            <p>You agree to provide accurate information and not use our service for illegal activities.</p>
          </Section>

          <Section title="6. Fees and Payment">
            <p>Fees are displayed before submission and must be paid in advance unless otherwise stated.</p>
          </Section>

          <Section title="7. Verification Results and Limitations">
            <p>LandVerify provides expert opinions based on available documentation but does not guarantee absolute legal status.</p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>All content and reports remain the exclusive property of LandVerify.</p>
          </Section>

          <Section title="9. Privacy Policy">
            <p>Your use of our Service is governed by our <a href="/privacy-policy" className="text-green-600 underline">Privacy Policy.</a>  </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>LandVerify provides services &quot;as is&quot; and is not liable for any indirect damages.</p>
          </Section>

          <Section title="11. Indemnification">
            <p>You agree to indemnify LandVerify against claims related to your use of the Service.</p>
          </Section>

          <Section title="12. Termination">
            <p>We may terminate your account for any reason without prior notice.</p>
          </Section>

          <Section title="13. Governing Law">
            <p>These Terms are governed by the laws of the Federal Republic of Nigeria.</p>
          </Section>

          <Section title="14. Changes to Terms">
            <p>We may modify these Terms at any time, and it is your responsibility to review them periodically.</p>
          </Section>

          <Section title="15. Contact Information">
            <p>For questions, contact us at: <a href="mailto:legal@landverify.ng" className="text-green-600 underline">legal@landverify.ng</a> </p>
           
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

export default TermsAndConditions;

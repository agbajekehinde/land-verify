import React from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

const PrivacyPolicy: React.FC = () => {
  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Privacy Policy for LandVerify</h1>
        <p className="text-gray-500 text-center mb-4">Effective Date: March 14, 2025</p>
        
        <p className="mb-6">
          This Privacy Policy governs the collection, use, sharing, and protection of your personal information by LandVerify ("we," "us," or "our"). 
          By accessing our website or using our services, you consent to the practices described herein and agree to be bound by this Privacy Policy and our Terms and Conditions.
        </p>
        
        <div className="space-y-6">
          <Section title="1. Introduction">
            <p>LandVerify is committed to protecting your privacy and ensuring the confidentiality of your personal information. This Policy explains how we collect, use, disclose, and safeguard your personal data in connection with your engagement with our digital platform, which connects prospective homeowners and property managers with verified real estate experts. Should you have any questions or concerns about our data practices, please refer to the "Contact Information" section below.</p>
          </Section>

          <Section title="2. Definitions">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Consent:</strong> A freely given, specific, informed, and unambiguous indication of your agreement to the processing of your personal data.</li>
              <li><strong>Data Controller:</strong> LandVerify, which determines the purposes and means of processing your personal data.</li>
              <li><strong>Data Processor:</strong> Any person or entity that processes personal data on behalf of LandVerify, including our employees and third-party service providers.</li>
              <li><strong>Data Protection Legislation:</strong> Laws governing data protection, including relevant Nigerian data protection laws such as the Nigeria Data Protection Act 2023 (NDPA) and the Nigeria Data Protection Regulation 2019 (NDPR).</li>
              <li><strong>Data Subject:</strong> Any identifiable individual whose personal data is processed by LandVerify.</li>
              <li><strong>Personal Data:</strong> Any information that relates to an identified or identifiable individual, including names, contact details, and other identifiers.</li>
              <li><strong>Processing:</strong> Any operation performed on personal data, including collection, storage, use, disclosure, or deletion.</li>
              <li><strong>Platform:</strong> The LandVerify website, mobile applications, and other digital services provided by us.</li>
            </ul>
          </Section>

          <Section title="3. Consent">
            <p>In compliance with applicable Nigerian Data Protection Legislation, LandVerify processes your personal data only upon receiving your clear and informed consent. By using our platform or services, you acknowledge and agree to the processing of your personal data as described in this Policy. You may withdraw your consent at any time; however, such withdrawal will not affect the lawfulness of any processing carried out prior to its withdrawal.</p>
          </Section>

          <Section title="4. Age Restriction">
            <p>Our services are intended solely for individuals aged 18 years and above. By accessing our platform, you confirm that you are at least 18 years old. If we become aware that data has been collected from an individual under the age of 18, we will take prompt steps to delete such information.</p>
          </Section>

          <Section title="5. Data Protection Principles">
            <p>LandVerify is committed to ensuring that your personal data is:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Processed Lawfully, Fairly, and Transparently:</strong> We adhere to all applicable data protection laws.</li>
              <li><strong>Collected for Specified, Legitimate Purposes:</strong> Your data is collected only for purposes clearly communicated to you and will not be further processed in a manner that is incompatible with those purposes.</li>
              <li><strong>Adequate, Relevant, and Limited:</strong> We only collect the personal data necessary for providing and improving our services.</li>
              <li><strong>Accurate and Up-to-Date:</strong> We take reasonable steps to ensure the accuracy and currency of your personal data.</li>
              <li><strong>Retained No Longer Than Necessary:</strong> Your personal data is kept only for as long as needed to fulfill the purposes for which it was collected or to comply with legal obligations.</li>
              <li><strong>Secured Appropriately:</strong> We implement robust technical and organizational measures to protect your personal data against unauthorized access, disclosure, or misuse.</li>
            </ul>
          </Section>

          <Section title="6. Data Collection and Usage">
            <h3 className="font-semibold mb-2">Information Collected</h3>
            <p>We may collect personal data through various methods, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2 mb-4">
              <li><strong>Direct Interactions:</strong> When you register for an account, submit inquiries, or communicate with us.</li>
              <li><strong>Automated Technologies:</strong> Through cookies and similar technologies that help us gather non-personal information such as IP addresses, device information, and browsing behaviors.</li>
            </ul>
            
            <h3 className="font-semibold mb-2">Purpose of Data Collection</h3>
            <p>Your personal data is used to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide and enhance our services.</li>
              <li>Verify your identity and perform due diligence checks.</li>
              <li>Communicate important updates and respond to inquiries.</li>
              <li>Manage your account, including billing and customer support.</li>
              <li>Comply with legal and regulatory obligations.</li>
              <li>Detect and prevent fraud or unauthorized access.</li>
            </ul>
          </Section>

          <Section title="7. Data Sharing and Third Parties">
            <p>LandVerify may share your personal data with:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Authorized Representatives and Service Providers:</strong> Partners who assist in delivering our services under strict confidentiality and data protection agreements.</li>
              <li><strong>Regulatory Authorities:</strong> When required by law, to comply with legal obligations.</li>
              <li><strong>Business Transactions:</strong> In the event of mergers, acquisitions, or business restructuring, provided that your data protection rights continue to be safeguarded.</li>
            </ul>
            <p className="mt-4">All third parties processing your personal data on our behalf are contractually bound to adhere to applicable data protection laws.</p>
          </Section>

          <Section title="8. Your Rights as a Data Subject">
            <p>Under the applicable Data Protection Legislation, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification:</strong> Request correction of any inaccurate or incomplete data.</li>
              <li><strong>Erasure:</strong> Request the deletion of your personal data when it is no longer necessary for the purposes it was collected.</li>
              <li><strong>Restrict Processing:</strong> Request limitation on how your data is processed under certain circumstances.</li>
              <li><strong>Data Portability:</strong> Request that your personal data be provided in a structured, commonly used, and machine-readable format.</li>
              <li><strong>Withdraw Consent:</strong> Revoke your consent for future processing of your data.</li>
            </ul>
            <p className="mt-4">To exercise any of these rights, please contact us using the information provided below. We will respond to your request within the timeframe required by law.</p>
          </Section>

          <Section title="9. Data Security">
            <p>LandVerify takes the security of your personal data seriously. We have implemented comprehensive security measures, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Encryption (e.g., Secure Sockets Layer (SSL)) to protect data during transmission.</li>
              <li>Firewalls and secure servers to safeguard stored data.</li>
              <li>Access controls and multi-factor authentication to prevent unauthorized access.</li>
              <li>Regular security assessments to identify and mitigate potential vulnerabilities.</li>
            </ul>
          </Section>

          <Section title="10. Data Retention">
            <p>We retain your personal data only for as long as necessary to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Fulfill the purposes for which the data was collected.</li>
              <li>Comply with our legal obligations.</li>
              <li>Resolve disputes and enforce our agreements.</li>
            </ul>
            <p className="mt-4">In certain circumstances, data may be retained for longer periods in accordance with applicable legal requirements.</p>
          </Section>

          <Section title="11. Data Breach Management">
            <p>In the unlikely event of a data breach, LandVerify will:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Immediately initiate an investigation to assess the scope and impact.</li>
              <li>Notify affected individuals and relevant regulatory authorities as required by law.</li>
              <li>Implement remedial measures to mitigate the effects of the breach and prevent future occurrences.</li>
            </ul>
          </Section>

          <Section title="12. Third-Party Links">
            <p>Our website and services may contain links to third-party websites. This Privacy Policy does not apply to the privacy practices of such external sites. We encourage you to review the privacy policies of any third-party websites you visit.</p>
          </Section>

          <Section title="13. Changes to This Privacy Policy">
            <p>LandVerify reserves the right to update this Privacy Policy at any time to reflect changes in our practices or legal requirements. Any changes will be effective immediately upon posting on our website. We encourage you to review this Policy periodically to stay informed about how we are protecting your information.</p>
          </Section>

          <Section title="14. Contact Information">
            <p>For questions or concerns regarding this Privacy Policy or our data practices, please contact us at:</p>
            <ul className="list-none mt-2">
              <li><strong>Email:</strong> <a href="mailto:legal@landverify.ng" className="text-green-600 underline">legal@landverify.ng</a></li>
            </ul>
            <p className="mt-4">By using our platform, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.</p>
          </Section>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-gray-600 text-sm italic">
          <p>This Privacy Policy is designed to ensure transparency and compliance with applicable data protection laws, safeguarding your personal data while providing you with a secure and reliable service experience.</p>
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

export default PrivacyPolicy;
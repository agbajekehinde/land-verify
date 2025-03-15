import React from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

const About: React.FC = () => {
  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6">About LandVerify</h1>
        <p className="text-gray-500 text-center mb-4">Building Trust in Every Land Transaction</p>

        <div className="space-y-6">
          <Section title="1. Who We Are">
            <p><span className="font-medium">LandVerify</span> is a trusted digital platform that helps individuals and businesses verify the authenticity of land before making a purchase. By leveraging licensed surveyors, legal professionals, and smart technology, we ensure <span className="font-medium">secure, fraud-free</span> land transactions.</p>
          </Section>

          <Section title="2. Our Mission">
            <p>Our mission is to <span className="font-medium">eliminate land fraud</span> and provide every Nigerian, whether at home or in the diaspora, with <span className="font-medium">clarity and confidence</span> in their property investments.</p>
          </Section>

          <Section title="3. Our Vision">
            <p>We envision a Nigeria where <span className="font-medium">every land transaction is verified, transparent, and secure</span>—allowing individuals and businesses to invest in real estate with complete peace of mind.</p>
          </Section>

          <Section title="4. Why Choose LandVerify?">
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-medium">Fast & Reliable:</span> Get results within <span className="font-medium">48 hours to 7 working days</span>.</li>
              <li><span className="font-medium">Expert-Backed:</span> Work with <span className="font-medium">certified professionals</span> in real estate and law.</li>
              <li><span className="font-medium">Seamless Tracking:</span> Monitor verification status in <span className="font-medium">real time</span>.</li>
              <li><span className="font-medium">Complete Transparency:</span> No hidden fees, no surprises—just <span className="font-medium">verified results</span>.</li>
            </ul>
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

export default About;

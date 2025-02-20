import Header from '@/app/components/header/header';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import '@/app/ui/global.css';
import Image from 'next/image';
import KeyFeatures from './components/features/keyfeatures';
import Hero from './components/hero/hero';
import Steps from './components/steps/steps';
import FAQs from './components/FAQs/questions';
import Testimonials from './components/testimonials/testimonials';
import Footer from './components/footer/footer';

export default function Page() {
  return (
    <main>
      <Header />
      <Hero />
      <KeyFeatures />
      <Steps/> 
      <Testimonials />
      <FAQs />
      <Footer />
    </main>
  );
}

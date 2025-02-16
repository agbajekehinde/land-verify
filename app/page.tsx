import Header from '@/app/components/header/header';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import '@/app/ui/global.css';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';
import KeyFeatures from './components/features/keyfeatures';
import Hero from './components/hero/hero';
import Steps from './components/steps/steps';

export default function Page() {
  return (
    <main>
      <Header />
      <Hero />
      <KeyFeatures />
      <Steps/> 
    </main>
  );
}

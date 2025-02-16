import Header from '@/app/components/header/header';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import '@/app/ui/global.css';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <Header />
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <h1 className="text-xl text-gray-800 md:text-3xl md:leading-normal">
            <strong>Secure Your Property Investment with Confidence</strong>
          </h1>
          <p>Avoid land scams and fraudulent property deals with LandVerify. Our expert-backed verification service ensures you buy only genuine, legally documented land and homes. Get your property verified within 48 hours to 7 days.</p>
          <div className="flex gap-4">
            <Link
              href="/learn-more"
              className="flex items-center gap-5 self-start rounded-lg border border-[#479101] px-6 py-3 text-sm font-medium text-[#479101] transition-colors hover:bg-[#e6f4e1] md:text-base"
            >
              <span>Learn More</span>
            </Link>
            <Link
              href="/verify"
              className="flex items-center gap-5 self-start rounded-lg bg-[#3a7a01] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3a7a01] md:text-base"
            >
              <span>Start Verification</span> <ArrowRightIcon className="w-5 md:w-6" />
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          {/* Add Hero Images Here */}
          <Image
            src="/hero-desktop.png"
            width={1200}
            height={1200}
            className="hidden md:block"
            alt="Screenshots of the dashboard project showing desktop version"
          />
          <Image
            src="/hero-mobile.png"
            width={560}
            height={620}
            className="block md:hidden"
            alt="Screenshot of the dashboard project showing mobile version"
          />
        </div>
      </div>
    </main>
  );
}

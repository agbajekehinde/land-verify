'use client'

import React, { useRef, useState } from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

const styles = {
  codeBlock: "relative rounded-lg bg-slate-900 text-slate-100 p-6 text-sm font-mono overflow-x-auto my-6 border border-slate-700 shadow-lg",
  sectionTitle: "text-2xl font-bold mt-12 mb-4 text-slate-900 border-b border-slate-200 pb-2",
  subTitle: "text-lg font-semibold mt-8 mb-3 text-slate-800",
  label: "inline-block font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded-md text-sm mb-3",
  paragraph: "text-slate-700 leading-relaxed mb-4",
  listItem: "text-slate-700 leading-relaxed mb-2",
  warning: "text-amber-700 font-semibold bg-amber-50 px-3 py-2 rounded-md inline-block",
  code: "font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-800"
} as const;

interface CopyButtonProps {
  code: string;
}

function CopyButton({ code }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy code to clipboard"
      className={`absolute top-4 right-4 px-3 py-2 rounded-md text-xs font-medium shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
        copied
          ? "bg-emerald-600 text-white cursor-default transform scale-95"
          : "bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 hover:border-emerald-300"
      }`}
      disabled={copied}
    >
      {copied ? "✓ Copied!" : "Copy"}
    </button>
  );
}

interface CodeBlockProps {
  code: string;
}

function CodeBlock({ code }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  
  return (
    <div className={styles.codeBlock}>
      <CopyButton code={code} />
      <pre 
        ref={preRef} 
        className="whitespace-pre-wrap break-words pr-20 leading-relaxed"
      >
        <code className="text-slate-100">{code}</code>
      </pre>
    </div>
  );
}

export default function APIDocs() {
  // Frontend code samples
  const jsPolling = `// JavaScript (React) polling for findings
import { useEffect, useState } from "react";

function useFindingsPolling(verificationId, apiKey, pollInterval = 30000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!verificationId || !apiKey) return;
    
    let isMounted = true;
    let intervalId;
    
    const fetchFindings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(
          \`/api/verification-requests/\${verificationId}/findings\`,
          {
            headers: { "x-api-key": apiKey },
          }
        );
        
        if (!res.ok) throw new Error(\`Error: \${res.status}\`);
        
        const result = await res.json();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err.message || "Unknown error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFindings();
    intervalId = setInterval(fetchFindings, pollInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [verificationId, apiKey, pollInterval]);

  return { ...data, loading, error };
}`;

  const tsxPolling = `// TypeScript (React) polling for findings
import { useEffect, useState } from "react";

interface FindingsResponse {
  findings: any;
  status: string;
  updatedAt: string;
}

function useFindingsPolling(
  verificationId: string,
  apiKey: string,
  pollInterval: number = 30000
): FindingsResponse & { loading: boolean; error: string | null } {
  const [data, setData] = useState<FindingsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!verificationId || !apiKey) return;
    
    let isMounted = true;
    let intervalId: NodeJS.Timeout;
    
    const fetchFindings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(
          \`/api/verification-requests/\${verificationId}/findings\`,
          {
            headers: { "x-api-key": apiKey },
          }
        );
        
        if (!res.ok) throw new Error(\`Error: \${res.status}\`);
        
        const result: FindingsResponse = await res.json();
        if (isMounted) setData(result);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Unknown error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFindings();
    intervalId = setInterval(fetchFindings, pollInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [verificationId, apiKey, pollInterval]);

  return { ...data, loading, error };
}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
            LandVerify API Documentation
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
            Securely submit and track land verification requests via our REST API.
            All endpoints require authentication via an API key for enhanced security.
          </p>
        </div>

        {/* Authentication Section */}
        <section className="mb-12">
          <h2 className={styles.sectionTitle}>Authentication</h2>
          <p className={styles.paragraph}>
            Include your API key in the request header for all authenticated endpoints:
          </p>
          <CodeBlock code="x-api-key: YOUR_API_KEY" />
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800 text-sm">
              <strong>Security Note:</strong> Never expose your API key in public repositories or client-side code.
            </p>
          </div>
        </section>

        {/* Submit Verification Request */}
        <section className="mb-12">
          <h2 className={styles.sectionTitle}>1. Submit a Verification Request</h2>
          <div className={styles.label}>POST /api/verification/submit</div>
          <p className={styles.paragraph}>
            Submit a new land verification request. Requires a valid user ID, address, 
            and at least one file (Cloudinary URL).
          </p>

          <h3 className={styles.subTitle}>Request Headers</h3>
          <CodeBlock code="Content-Type: application/json\nx-api-key: YOUR_API_KEY" />

          <h3 className={styles.subTitle}>Request Body</h3>
          <CodeBlock code={`{
  "address": "123 Main St, Lagos",
  "files": ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
  "userId": 32344386,
  "lga": "Ikeja",         // optional
  "state": "Lagos",       // optional
  "landsize": "500sqm",   // optional
  "latitude": 6.5244,     // optional
  "longitude": 3.3792     // optional
}`} />

          <h3 className={styles.subTitle}>Success Response (200)</h3>
          <CodeBlock code={`{
  "status": "SUBMITTED",
  "findings": null,
  "verificationId": "2e5ab633-ea41-4d99-809c-efbf1e1e6925",
  "partnerId": 19
}`} />

          <h3 className={styles.subTitle}>Example cURL</h3>
          <CodeBlock code={`curl -X POST "https://app.landverify.ng/api/verification/submit" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "address": "123 Main St, Lagos",
    "files": ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
    "userId": 3386
  }'`} />
        </section>

        {/* Get Verification Request Details */}
        <section className="mb-12">
          <h2 className={styles.sectionTitle}>2. Get Verification Request Details</h2>
          <div className={styles.label}>GET /api/verification-requests/{"{id}"}/requests</div>
          <p className={styles.paragraph}>
            Fetches the details of a specific verification request by its ID.
          </p>

          <h3 className={styles.subTitle}>Success Response (200)</h3>
          <CodeBlock code={`{
  "id": "2e5ab633-ea41-4d99-809c-efbf1e1e6925",
  "address": "123 Main St, Lagos",
  "landsize": "500sqm",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "lga": "Ikeja",
  "state": "Lagos",
  "status": "SUBMITTED"
}`} />

          <h3 className={styles.subTitle}>Example cURL</h3>
          <CodeBlock code={`curl "https://app.landverify.ng/api/verification-requests/2e5ab633-ea41-4d99-809c-efbf1e1e6925/requests" \\
  -H "x-api-key: YOUR_API_KEY"`} />
        </section>

        {/* Get Verification Findings */}
        <section className="mb-12">
          <h2 className={styles.sectionTitle}>3. Get Verification Findings (Polling Endpoint)</h2>
          <div className={styles.label}>GET /api/verification-requests/{"{id}"}/findings</div>
          <p className={styles.paragraph}>
            Fetches the current findings and status for a specific verification request.
          </p>
          <div className={styles.warning}>
            ⚠️ Requires API key and is rate-limited (30 requests per minute)
          </div>

          <h3 className={styles.subTitle}>Success Response (200)</h3>
          <CodeBlock code={`{
  "findings": null, // or findings object when available
  "status": "SUBMITTED",
  "updatedAt": "2025-06-26T12:00:00.000Z"
}`} />

          <h3 className={styles.subTitle}>Example cURL</h3>
          <CodeBlock code={`curl "https://app.landverify.ng/api/verification-requests/2e5ab633-ea41-4d99-809c-efbf1e1e6925/findings" \\
  -H "x-api-key: YOUR_API_KEY"`} />
        </section>

        {/* Rate Limiting */}
        <section className="mb-12">
          <h2 className={styles.sectionTitle}>4. Rate Limiting</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <p className={styles.paragraph}>
              The <code className={styles.code}>/findings</code> endpoint is rate-limited to{" "}
              <strong>30 requests per minute per API key</strong>.
            </p>
            <p className="text-amber-800 text-sm mb-0">
              Exceeding this limit will return a <code className={styles.code}>429 Too Many Requests</code> error.
            </p>
          </div>
        </section>

        {/* Error Handling */}
        <section className="mb-12">
          <h2 className={styles.sectionTitle}>5. Error Handling</h2>
          <p className={styles.paragraph}>
            All endpoints return appropriate HTTP status codes and JSON error messages:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Client Errors (4xx)</h4>
              <ul className="text-red-700 text-sm space-y-1">
                <li><code>400</code> - Bad Request</li>
                <li><code>404</code> - Not Found</li>
                <li><code>405</code> - Method Not Allowed</li>
                <li><code>429</code> - Too Many Requests</li>
              </ul>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">Server Errors (5xx)</h4>
              <ul className="text-orange-700 text-sm space-y-1">
                <li><code>500</code> - Internal Server Error</li>
              </ul>
            </div>
          </div>
          <CodeBlock code={`{
  "message": "Findings not found for this verification request"
}`} />
        </section>

        {/* Polling Recommendations */}
        <section className="mb-12">
          <h2 className={styles.sectionTitle}>6. Polling Recommendations</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-800 mb-4">Best Practices</h3>
            <ul className="space-y-3">
              <li className={styles.listItem}>
                <strong>Polling Interval:</strong> Poll the <code className={styles.code}>/findings</code> endpoint every 30–60 seconds to check for updates.
              </li>
              <li className={styles.listItem}>
                <strong>Stop Condition:</strong> Stop polling when <code className={styles.code}>status</code> changes from{" "}
                <code className={styles.code}>&quot;SUBMITTED&quot;</code> or when <code className={styles.code}>findings</code> is no longer{" "}
                <code className={styles.code}>null</code>.
              </li>
              <li className={styles.listItem}>
                <strong>Error Handling:</strong> Implement exponential backoff for failed requests to avoid hitting rate limits.
              </li>
            </ul>
          </div>
        </section>

        {/* Frontend Code Samples */}
        <section className="mb-12">
          <h2 className={styles.sectionTitle}>7. Frontend Integration Examples</h2>
          
          <h3 className={styles.subTitle}>JavaScript (React Hook)</h3>
          <CodeBlock code={jsPolling} />
          
          <h3 className={styles.subTitle}>TypeScript (React Hook with Types)</h3>
          <CodeBlock code={tsxPolling} />
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mt-6">
            <p className="text-blue-800 text-sm">
              <strong>Usage Tip:</strong> These hooks automatically handle polling, cleanup, and error states. 
              Simply pass your verification ID and API key to start monitoring for results.
            </p>
          </div>
        </section>

               {/* API Key Notice Section */}
        <section className="mb-12">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <p className="text-yellow-800 text-base">
              <strong>Need an API Key?</strong> You will need both a <span className="font-semibold">test</span> and <span className="font-semibold">live</span> API key to use the LandVerify API.<br />
              Please reach out to <a href="mailto:support@landverify.ng" className="underline text-yellow-900">support@landverify.ng </a> or <a> +234 902 962 8530 </a> to request your keys.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
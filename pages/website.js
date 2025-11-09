import Head from 'next/head';
import { useEffect } from 'react';

export default function WebsitePage() {
  useEffect(() => {
    // Redirect to the actual website HTML file
    if (typeof window !== 'undefined') {
      window.location.href = '/website/index.html';
    }
  }, []);

  return (
    <>
      <Head>
        <title>GRiD - Official Website</title>
        <meta name="description" content="GRiD Game Official Website" />
      </Head>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#000',
        color: '#00ffff',
        fontFamily: 'monospace'
      }}>
        <p>Redirecting to website...</p>
      </div>
    </>
  );
}


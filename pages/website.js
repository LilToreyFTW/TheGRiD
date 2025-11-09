import Head from 'next/head';

export default function WebsitePage() {
  return (
    <>
      <Head>
        <title>GRiD - Official Website</title>
        <meta name="description" content="GRiD Game Official Website" />
      </Head>
      <iframe 
        src="/website/index.html" 
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          position: 'fixed',
          top: 0,
          left: 0
        }}
        title="GRiD Website"
      />
    </>
  );
}


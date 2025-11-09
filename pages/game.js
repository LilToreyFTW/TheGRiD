import Head from 'next/head';

export default function GamePage() {
  return (
    <>
      <Head>
        <title>GRiD - Play Game</title>
        <meta name="description" content="Play GRiD - 3D Video Game" />
      </Head>
      <iframe 
        src="/game/index.html" 
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          position: 'fixed',
          top: 0,
          left: 0
        }}
        title="GRiD Game"
      />
    </>
  );
}


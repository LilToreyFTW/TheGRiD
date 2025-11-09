import Head from 'next/head';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.gg/vxt64amrgt';

  return (
    <>
      <Head>
        <title>GRiD - 3D Video Game</title>
        <meta name="description" content="GRiD - An immersive 3D open-world video game with 10,000 unique bikes, intergalactic travel, and endless exploration!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="game, 3d, threejs, open world, bikes, planets, discord" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 100%)',
        color: '#00ffff',
        fontFamily: 'monospace',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '1200px', width: '100%' }}>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 6rem)', 
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
            fontWeight: '900'
          }}>
            GRiD
          </h1>
          <p style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', marginBottom: '3rem', color: '#888' }}>
            3D Video Game
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link 
              href="/game/index.html"
              style={{
                padding: '1rem 2rem',
                background: '#00ffff',
                color: '#000',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                display: 'inline-block'
              }}
            >
              🎮 Play Game
            </Link>
            
            <Link 
              href="/website/index.html"
              style={{
                padding: '1rem 2rem',
                background: '#5865F2',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                boxShadow: '0 0 20px rgba(88, 101, 242, 0.5)',
                display: 'inline-block'
              }}
            >
              🌐 Website
            </Link>
            
            <a 
              href={discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '1rem 2rem',
                background: '#5865F2',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                boxShadow: '0 0 20px rgba(88, 101, 242, 0.5)',
                display: 'inline-block'
              }}
            >
              💬 Discord
            </a>
          </div>

          <div style={{ 
            marginTop: '3rem', 
            padding: '2rem', 
            background: 'rgba(0, 255, 255, 0.1)', 
            borderRadius: '10px',
            border: '2px solid rgba(0, 255, 255, 0.3)'
          }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Features</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              textAlign: 'left',
              fontSize: '1.1rem'
            }}>
              <div>🌍 Fully Open World</div>
              <div>🚲 10,000 Unique Bikes</div>
              <div>🌌 51 Planets</div>
              <div>⚔️ Combat System</div>
              <div>🏆 Achievements</div>
              <div>📦 Mod Support</div>
              <div>🎯 Missions</div>
              <div>💾 Save System</div>
              <div>🎵 Sound System</div>
              <div>📊 Leaderboard</div>
              <div>🗺️ Minimap</div>
              <div>🤖 Discord Bot</div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', color: '#888', fontSize: '0.9rem' }}>
            <p>Built with Three.js • Next.js • Discord.js</p>
            <p style={{ marginTop: '0.5rem' }}>
              <a href="https://github.com/YOUR_USERNAME/CoresNewGame" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none' }}>
                View on GitHub
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}



import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract data from URL
    const homeName = searchParams.get('home') || 'NORTHSIDE';
    const awayName = searchParams.get('away') || 'EASTSIDE';
    const homeScore = searchParams.get('hScore') || '0';
    const awayScore = searchParams.get('aScore') || '0';
    const leagueName = searchParams.get('league') || 'BARANGAY LEAGUE';
    const pogName = searchParams.get('pog') || 'Player Name';
    const pogStats = searchParams.get('stats') || '0 PTS';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 50%, #FF6B1A20 0%, #050505 100%)',
            color: 'white',
            fontFamily: 'sans-serif',
            padding: '40px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF6B1A', letterSpacing: '8px', opacity: 0.8 }}>{leagueName}</span>
            <span style={{ fontSize: '14px', fontWeight: '900', color: 'white', opacity: 0.3, marginTop: '5px' }}>OFFICIAL MATCH RESULT</span>
          </div>

          {/* Scoreboard */}
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
               <span style={{ fontSize: '120px', fontWeight: '900', color: 'white', lineHeight: 1 }}>{homeScore}</span>
               <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF6B1A', marginTop: '10px' }}>{homeName}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: '40px', height: '2px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
               <span style={{ fontSize: '40px', fontWeight: '900', color: 'rgba(255,255,255,0.05)', fontStyle: 'italic', margin: '20px 0' }}>VS</span>
               <div style={{ width: '40px', height: '2px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
               <span style={{ fontSize: '120px', fontWeight: '900', color: 'white', lineHeight: 1 }}>{awayScore}</span>
               <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4A90D9', marginTop: '10px' }}>{awayName}</span>
            </div>
          </div>

          {/* POG Section */}
          <div 
            style={{ 
              marginTop: '40px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              padding: '20px 40px', 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              borderRadius: '20px', 
              border: '1px solid rgba(255,255,255,0.05)' 
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 'black', color: '#FF6B1A', letterSpacing: '4px' }}>PLAYER OF THE GAME</span>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginTop: '5px' }}>{pogName}</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{pogStats}</span>
          </div>

          {/* Footer */}
          <div style={{ position: 'absolute', bottom: '20px', right: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <span style={{ fontSize: '10px', color: 'rgba(255,107,26,0.3)', fontWeight: 'bold', letterSpacing: '2px' }}>POWERED BY NORTHSIDE TECH</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

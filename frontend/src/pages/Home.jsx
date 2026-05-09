import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../LanguageContext';

/* ─────────────────────────────────────────────
   CSS Animations
───────────────────────────────────────────── */
const GlobalStyles = () => (
    <style>{`
        @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        @keyframes fadePop {
            0%   { opacity: 0; transform: translateY(28px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes statPop {
            from { opacity: 0; transform: scale(0.75); }
            to   { opacity: 1; transform: scale(1); }
        }
        .marquee-track {
            display: flex;
            align-items: center;
            gap: 40px;
            animation: marquee 28s linear infinite;
            width: max-content;
        }
        .marquee-track:hover { animation-play-state: paused; }
        .ad-ticker {
            display: flex;
            align-items: center;
            animation: marquee 20s linear infinite;
            width: max-content;
            white-space: nowrap;
        }
        .hero-anim  { animation: fadePop 0.85s ease both; }
        .stat-anim  { animation: statPop 0.65s ease both; }
        .partner-card {
            background: white;
            border-radius: 16px;
            padding: 18px 32px;
            box-shadow: 0 2px 14px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 200px;
            height: 80px;
            transition: box-shadow 0.2s, transform 0.2s;
        }
        .partner-card:hover {
            box-shadow: 0 6px 24px rgba(0,0,0,0.13);
            transform: translateY(-3px);
        }
    `}</style>
);

/* ─────────────────────────────────────────────
   Accurate SVG Logos
───────────────────────────────────────────── */

/* Mobilis — green square, red Arabic, white latin */
const MobilisLogo = () => (
    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" style={{ height: '52px', width: 'auto' }}>
        <rect x="0" y="0" width="200" height="80" rx="10" fill="#4db848"/>
        {/* Arabic موبيليس — red */}
        <text x="100" y="28" textAnchor="middle"
              fontFamily="'Segoe UI', Arial, sans-serif" fontSize="16"
              fontWeight="700" fill="#e32119" direction="rtl">
            موبيليس
        </text>
        {/* Latin mobilis — white */}
        <text x="100" y="62" textAnchor="middle"
              fontFamily="'Arial Rounded MT Bold', Arial, sans-serif" fontSize="26"
              fontWeight="900" fill="white" letterSpacing="1">
            mobilis
        </text>
    </svg>
);

/* Ooredoo — white bg, bold red ring + small dot top-right */
const OoredooLogo = () => (
    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" style={{ height: '52px', width: 'auto' }}>
        {/* Big ring */}
        <circle cx="60" cy="44" r="28" fill="none" stroke="#e2001a" strokeWidth="14"/>
        {/* Small filled dot */}
        <circle cx="102" cy="20" r="10" fill="#e2001a"/>
        {/* Ooredoo text */}
        <text x="120" y="52" textAnchor="middle"
              fontFamily="Arial, sans-serif" fontSize="19"
              fontWeight="700" fill="#e2001a" letterSpacing="0.5">
            Ooredoo
        </text>
    </svg>
);

/* Sonatrach — orange square, white S-shape emblem, text */
const SonatrachLogo = () => (
    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" style={{ height: '52px', width: 'auto' }}>
        {/* Orange square */}
        <rect x="2" y="2" width="76" height="76" rx="6" fill="#f7941d"/>
        {/* White S-shape: top bar + middle bar + bottom bar forming an S */}
        <rect x="16" y="14" width="48" height="14" rx="3" fill="white"/>
        <rect x="16" y="33" width="48" height="14" rx="3" fill="white"/>
        <rect x="16" y="52" width="48" height="14" rx="3" fill="white"/>
        {/* Arabic سوناطراك */}
        <text x="146" y="28" textAnchor="middle"
              fontFamily="'Segoe UI', Arial, sans-serif" fontSize="14"
              fontWeight="700" fill="#333" direction="rtl">
            سوناطراك
        </text>
        {/* Latin sonatrach */}
        <text x="146" y="56" textAnchor="middle"
              fontFamily="Arial, sans-serif" fontSize="16"
              fontWeight="700" fill="#1a1a1a" letterSpacing="0.5">
            sonatrach
        </text>
    </svg>
);

/* Djezzy — red play-button triangle, white DJEZZY + جازي */
const DjezzyLogo = () => (
    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" style={{ height: '52px', width: 'auto' }}>
        {/* Red triangle / play button */}
        <polygon points="8,4 72,40 8,76" fill="#e2001a"/>
        {/* DJEZZY */}
        <text x="82" y="36" textAnchor="start"
              fontFamily="Arial Black, sans-serif" fontSize="22"
              fontWeight="900" fill="#e2001a" letterSpacing="1">
            DJEZZY
        </text>
        {/* Arabic جازي */}
        <text x="82" y="58" textAnchor="start"
              fontFamily="'Segoe UI', Arial, sans-serif" fontSize="16"
              fontWeight="700" fill="#555" direction="rtl">
            جازي
        </text>
    </svg>
);

/* ─────────────────────────────────────────────
   Map Section
───────────────────────────────────────────── */
const MapSection = ({ t, isRtl }) => (
    <section style={{
        padding: '64px 24px',
        background: '#f8fafc',
        borderBottom: '1px solid #e5e7eb',
    }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }} dir={isRtl ? 'rtl' : 'ltr'}>
                <span style={{
                    display: 'inline-block',
                    background: 'linear-gradient(90deg,#1a3a6b,#1e5caa)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    padding: '5px 16px',
                    borderRadius: '999px',
                    marginBottom: '16px',
                }}>
                    📍 {isRtl ? 'موقعنا' : 'Our Location'}
                </span>
                <h2 style={{
                    fontSize: 'clamp(1.4rem,3vw,2rem)',
                    fontWeight: '800',
                    color: '#0f172a',
                    margin: '0 0 8px',
                }}>
                    {isRtl ? 'سيدي بلعباس — الجزائر' : 'Sidi Bel Abbès — Algeria'}
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    {isRtl
                        ? 'تجدنا في قلب ولاية سيدي بلعباس'
                        : 'Find us in the heart of Sidi Bel Abbès province'}
                </p>
            </div>

            {/* Map card */}
            <div style={{
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
                border: '3px solid white',
                position: 'relative',
            }}>
                <iframe
                    title="PRZ Location - Sidi Bel Abbès"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26468.19!2d-0.63119!3d35.18972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd787949578a6be3%3A0xe3df9cf3e23b0985!2sSidi%20Bel%20Abb%C3%A8s%2C%20Algeria!5e0!3m2!1sen!2sdz!4v1715000000000"
                    width="100%"
                    height="420"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
                {/* Info overlay badge */}
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: isRtl ? 'auto' : '16px',
                    right: isRtl ? '16px' : 'auto',
                    background: 'white',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}>
                    <span style={{ fontSize: '24px' }}>🏢</span>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '14px', color: '#1a3a6b' }}>
                            PRZ Consulting
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {isRtl ? 'سيدي بلعباس، الجزائر' : 'Sidi Bel Abbès, Algeria'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const Home = () => {
    const { t, lang } = useContext(LanguageContext);
    const isRtl = lang === 'ar';

    const partners = [
        { id: 1, logo: <SonatrachLogo /> },
        { id: 2, logo: <MobilisLogo /> },
        { id: 3, logo: <OoredooLogo /> },
        { id: 4, logo: <DjezzyLogo /> },
    ];

    const stats = [
        { value: t('statsClients'),  label: t('statsClientsLabel')  },
        { value: t('statsProjects'), label: t('statsProjectsLabel') },
        { value: t('statsYears'),    label: t('statsYearsLabel')    },
    ];

    return (
        <>
            <GlobalStyles />

            {/* ── HERO ───────────────────────────────────── */}
            <section
                style={{
                    background: 'linear-gradient(135deg, #0a1628 0%, #1a3a6b 60%, #1e5caa 100%)',
                    minHeight: '88vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative blobs */}
                {[{top:'-100px',right:'-100px',size:'400px'},{bottom:'-80px',left:'-80px',size:'300px'}].map((s,i)=>(
                    <div key={i} style={{
                        position:'absolute', borderRadius:'50%',
                        background:'rgba(255,255,255,0.04)', pointerEvents:'none',
                        top:s.top, right:s.right, bottom:s.bottom, left:s.left,
                        width:s.size, height:s.size,
                    }}/>
                ))}

                <div className="hero-anim" style={{ maxWidth:'780px', textAlign:'center', padding:'40px 24px', zIndex:1 }}
                     dir={isRtl ? 'rtl' : 'ltr'}>

                    <span style={{
                        display:'inline-block', background:'rgba(255,255,255,0.12)',
                        color:'#93c5fd', fontSize:'13px', fontWeight:'600',
                        letterSpacing:'2px', textTransform:'uppercase',
                        padding:'6px 20px', borderRadius:'999px',
                        border:'1px solid rgba(147,197,253,0.3)', marginBottom:'24px',
                    }}>
                        PRZ Consulting
                    </span>

                    <h1 style={{
                        fontSize:'clamp(2rem,5vw,3.4rem)', fontWeight:'900',
                        color:'white', lineHeight:'1.25', marginBottom:'22px',
                        textShadow:'0 2px 20px rgba(0,0,0,0.3)',
                    }}>
                        {t('welcomeTitle')}
                    </h1>

                    <p style={{
                        fontSize:'clamp(1rem,2.2vw,1.2rem)', color:'#bfdbfe',
                        lineHeight:'1.9', maxWidth:'640px', margin:'0 auto 40px',
                    }}>
                        {t('welcomeText')}
                    </p>

                    <div style={{ display:'flex', justifyContent:'center', gap:'16px', flexWrap:'wrap' }}>
                        <Link to="/services" style={{
                            background:'linear-gradient(90deg,#2563eb,#1d4ed8)',
                            color:'white', fontWeight:'700', padding:'14px 34px',
                            borderRadius:'12px', fontSize:'1rem', textDecoration:'none',
                            boxShadow:'0 4px 24px rgba(37,99,235,0.45)',
                        }}>
                            {t('browseServices')}
                        </Link>
                        <Link to="/register" style={{
                            background:'rgba(255,255,255,0.1)', color:'white',
                            fontWeight:'700', padding:'14px 34px', borderRadius:'12px',
                            fontSize:'1rem', textDecoration:'none',
                            border:'2px solid rgba(255,255,255,0.3)',
                        }}>
                            {t('joinAsExpert')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── STATS ──────────────────────────────────── */}
            <section style={{
                background:'white', padding:'60px 24px',
                borderBottom:'1px solid #e5e7eb',
            }}>
                <div style={{
                    maxWidth:'680px', margin:'0 auto',
                    display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px',
                    textAlign:'center',
                }} dir={isRtl ? 'rtl' : 'ltr'}>
                    {stats.map((s,i)=>(
                        <div key={i} className="stat-anim" style={{
                            animationDelay:`${i*0.15}s`,
                            padding:'28px 12px', borderRadius:'16px',
                            background:'linear-gradient(135deg,#f0f6ff,#e8f0fe)',
                            boxShadow:'0 2px 16px rgba(37,99,235,0.08)',
                        }}>
                            <div style={{
                                fontSize:'clamp(2rem,5vw,3rem)', fontWeight:'900',
                                color:'#1a3a6b', lineHeight:'1', marginBottom:'8px',
                            }}>{s.value}</div>
                            <div style={{ fontSize:'0.9rem', color:'#64748b', fontWeight:'600' }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── PARTNERS LOGO STRIP ────────────────────── */}
            <section style={{
                background:'#f9fafb', padding:'52px 0',
                overflow:'hidden', borderBottom:'1px solid #e5e7eb',
            }}>
                <p style={{
                    textAlign:'center', fontSize:'0.75rem', fontWeight:'700',
                    letterSpacing:'3px', textTransform:'uppercase',
                    color:'#94a3b8', marginBottom:'36px',
                }}>
                    {t('partnersTitle')}
                </p>

                <div style={{ overflow:'hidden', width:'100%' }}>
                    <div className="marquee-track">
                        {/* Duplicated for seamless infinite loop */}
                        {[...partners, ...partners, ...partners].map((p,i)=>(
                            <div key={i} className="partner-card">
                                {p.logo}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── MAP ────────────────────────────────────── */}
            <MapSection t={t} isRtl={isRtl} />

            {/* ── BOTTOM ADVERTISING TICKER ──────────────── */}
            <div style={{
                position:'fixed', bottom:0, left:0, right:0, zIndex:50,
                background:'linear-gradient(90deg,#0a1628 0%,#1a3a6b 50%,#0a1628 100%)',
                borderTop:'2px solid #2563eb',
                overflow:'hidden', height:'42px',
                display:'flex', alignItems:'center',
            }}>
                {/* Label badge */}
                <div style={{
                    background:'#f7a800', color:'#0a1628',
                    fontWeight:'900', fontSize:'12px',
                    padding:'0 16px', height:'100%',
                    display:'flex', alignItems:'center',
                    letterSpacing:'1px', whiteSpace:'nowrap',
                    flexShrink:0, boxShadow:'4px 0 12px rgba(0,0,0,0.35)',
                }}>
                    📢 PRZ
                </div>

                {/* Scrolling text */}
                <div style={{ overflow:'hidden', flex:1 }}>
                    <div className="ad-ticker">
                        {[1,2].map(n=>(
                            <span key={n} style={{
                                color:'white', fontSize:'13px',
                                fontWeight:'500', padding:'0 56px',
                                letterSpacing:'0.3px', opacity:0.93,
                            }}>
                                {t('adBannerText')}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Push content above fixed ticker */}
            <div style={{ height:'42px' }}/>
        </>
    );
};

export default Home;

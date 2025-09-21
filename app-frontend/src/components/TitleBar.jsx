import React, { useEffect } from 'react';

// --- MOCK ROUTING COMPONENT ---
// This component mimics react-router-dom's Link for this standalone demo.
const Link = ({ to, children, className }) => (
  <a 
    href={to} 
    className={className} 
    onClick={e => {
        e.preventDefault();
        console.log(`[Router] Navigating to '${to}'`);
        alert(`Navigating to the homepage.`);
    }}
  >
    {children}
  </a>
);

// --- SVG LOGO COMPONENT ---
// Using an inline SVG for the logo makes the component self-contained.
const Logo = () => (
    <svg 
        className="h-10 w-10 text-cyan-400" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        strokeWidth="2" 
        stroke="currentColor" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 12h1" />
        <path d="M12 4v1" />
        <path d="M11.5 11.5l-1.5 1.5" />
        <path d="M12.5 11.5l1.5 1.5" />
        <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" />
    </svg>
);


// --- MAIN TITLEBAR COMPONENT ---

function Titlebar() {
  // ----------------------------------------------------
  // 1. CONTEXT & STATE (None as per pseudocode)
  // ----------------------------------------------------
  // This is a stateless presentational component.

  // ----------------------------------------------------
  // 2. LIFECYCLE HOOKS
  // ----------------------------------------------------
  useEffect(() => {
    console.log("[Health] App loaded successfully");
  }, []); // Empty dependency array ensures this runs only once on mount.

  // ----------------------------------------------------
  // 3. UI RENDERING
  // ----------------------------------------------------
  return (
    <header className="bg-gray-800 p-4 shadow-md">
      <div className="max-w-7xl mx-auto">
        <Link 
          to="/" 
          className="flex items-center space-x-4 text-white no-underline transition-opacity duration-300 hover:opacity-80"
        >
          <Logo />
          <h1 className="text-2xl font-bold tracking-wider">
            AI Learning Agent
          </h1>
        </Link>
      </div>
    </header>
  );
}

// --- DEMO APP WRAPPER ---
// This wrapper component provides context for how the Titlebar would look in an application.
export default function App() {
  return (
    <div className="bg-gray-900 min-h-screen font-sans">
      <Titlebar />
      <div className="p-10 text-center text-gray-300">
        <p>This is a demonstration of the Titlebar component.</p>
        <p>Clicking the title bar above will trigger a simulated navigation event.</p>
      </div>
    </div>
  );
}
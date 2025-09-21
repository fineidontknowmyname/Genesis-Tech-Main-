import React, { useState, useEffect } from 'react';

// --- MOCK AUTHENTICATION CONTEXT ---
// This section simulates the behavior of a real `useAuth` hook.

const mockUser = {
  displayName: 'Alex',
  email: 'alex@example.com',
};

// Custom hook to simulate authentication
const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(mockUser); // Start logged in for demo

  const login = () => {
    console.log('[Auth Sim] Logging in...');
    setCurrentUser(mockUser);
  };

  const logout = () => {
    console.log('[Auth Sim] Logging out...');
    setCurrentUser(null);
  };
  
  // Expose a toggle function for the demo App
  const toggleAuth = () => {
      if(currentUser) logout();
      else login();
  }

  return { currentUser, logout, toggleAuth };
};


// --- MOCK ROUTING COMPONENTS ---
// These components mimic react-router-dom's Link and NavLink for this standalone demo.

const Link = ({ to, children, className }) => (
  <a href={to} className={className} onClick={e => e.preventDefault()}>
    {children}
  </a>
);

const NavLink = ({ to, children }) => {
    // In a real app, you'd use a hook like `useLocation` to determine if the link is active.
    // Here, we'll just simulate the 'Dashboard' link being active.
    const isActive = window.location.pathname.startsWith(to) || (to === "/dashboard"); 
    
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300";
    const activeClasses = "bg-cyan-600/30 text-cyan-300";
    const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

    return (
        <a href={to} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} onClick={e => e.preventDefault()}>
            {children}
        </a>
    )
};


// --- UI HELPER COMPONENTS ---

const Logo = () => (
    <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.378 1.18 17.748 0 17.001 0H7a2 2 0 00-1.99 1.454l-1.6 6.4A1 1 0 005.436 9h1.225L7 13.317l-2.57.734A1 1 0 003.436 15l1.43 1.43a1 1 0 001.414 0l.283-.282m1.832 3.434a4 4 0 105.656 0" />
    </svg>
);


// --- MAIN NAVBAR COMPONENT ---

function Navbar() {
  // ----------------------------------------------------
  // 1. CONTEXT & SETUP
  // ----------------------------------------------------
  console.log("[Health] Navbar component initializing.");
  const { currentUser, logout } = useAuth();

  // ----------------------------------------------------
  // 2. LIFECYCLE HOOKS
  // ----------------------------------------------------
  useEffect(() => {
    console.log("[Health] App loaded successfully");
  }, []);

  // ----------------------------------------------------
  // 3. EVENT HANDLERS
  // ----------------------------------------------------
  const handleLogout = () => {
    console.log("[Health] User initiated logout.");
    logout();
  };

  // ----------------------------------------------------
  // 4. UI RENDERING
  // ----------------------------------------------------
  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo and main navigation links */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <Logo />
              <span className="text-white text-xl font-bold">MindMeld</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/upload">Create New</NavLink>
              </div>
            </div>
          </div>

          {/* Right side: Authentication status and actions */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm">Welcome, {currentUser.displayName}!</span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <NavLink to="/login">Login</NavLink>
                  <NavLink to="/signup" className="bg-cyan-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-cyan-500">
                    Sign Up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button (optional, for smaller screens) */}
          <div className="-mr-2 flex md:hidden">
            <button className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}


// --- DEMO APP WRAPPER ---
// This wrapper component allows you to see the Navbar in both logged-in and logged-out states.

export default function App() {
    const { currentUser, toggleAuth } = useAuth();

    return (
        <div className="bg-gray-900 min-h-screen">
            {/* We pass the auth state into Navbar through our custom hook */}
            <Navbar />
            
            <div className="p-10 text-center text-white">
                <h1 className="text-2xl mb-4">Demo Content Area</h1>
                <p className="mb-6">The Navbar above is currently showing the <span className="font-bold text-cyan-400">{currentUser ? 'LOGGED IN' : 'LOGGED OUT'}</span> state.</p>
                <button 
                    onClick={toggleAuth}
                    className="bg-cyan-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-cyan-500 transition-all"
                >
                    {currentUser ? 'Click to Log Out' : 'Click to Log In'}
                </button>
            </div>
        </div>
    )
}
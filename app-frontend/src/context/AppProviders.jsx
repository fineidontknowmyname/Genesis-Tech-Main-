import React, { useState, useEffect, createContext, useContext } from 'react';

// --- MOCK CONTEXT 1: Authentication ---
// This simulates an AuthProvider that would handle user login status.
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // For this demo, we'll just provide a static user object.
  const mockUser = { id: 'user-123', name: 'Alex' };
  return (
    <AuthContext.Provider value={{ currentUser: mockUser }}>
      {children}
    </AuthContext.Provider>
  );
};
// Custom hook for easy access to auth context
const useAuth = () => useContext(AuthContext);


// --- MOCK CONTEXT 2: Content ---
// This simulates a ContentProvider that might manage app-wide data.
const ContentContext = createContext();

const ContentProvider = ({ children }) => {
  const [content, setContent] = useState({ title: 'Global Content Title' });
  return (
    <ContentContext.Provider value={{ content, setContent }}>
      {children}
    </ContentContext.Provider>
  );
};
// Custom hook for easy access to content context
const useContent = () => useContext(ContentContext);


// --- MOCK CONTEXT 3: Theme ---
// This simulates a ThemeProvider for managing UI themes (e.g., dark/light mode).
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // The value includes both the current theme and a function to change it.
  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
// Custom hook for easy access to theme context
const useTheme = () => useContext(ThemeContext);


// --- MAIN COMPONENT: AppProviders ---
// As per the pseudocode, this component wraps the entire application
// in all necessary context providers.

function AppProviders({ children }) {
  // ----------------------------------------------------
  // 1. CONTEXT & STATE (None)
  // ----------------------------------------------------
  // This component is stateless and only serves to compose providers.

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
    <AuthProvider>
      <ContentProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </ContentProvider>
    </AuthProvider>
  );
}


// --- DEMO APP & USAGE EXAMPLE ---
// This demonstrates how AppProviders is used to wrap the main application content.

// A sample component that consumes data from all the contexts.
const DemoComponent = () => {
    const { currentUser } = useAuth();
    const { content } = useContent();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={`
            max-w-md mx-auto p-6 rounded-lg shadow-xl border
            ${theme === 'dark' 
                ? 'bg-gray-800 text-white border-gray-700' 
                : 'bg-white text-gray-800 border-gray-200'
            }
        `}>
            <h2 className="text-2xl font-bold mb-4">Child Component</h2>
            <p className="mb-2">This component is nested inside all the providers.</p>
            <div className="space-y-3 text-sm font-mono p-4 rounded-md bg-opacity-50
                 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}
            ">
                <p><span className="font-bold text-cyan-400">useAuth():</span> {currentUser ? `Logged in as ${currentUser.name}` : 'Not logged in'}</p>
                <p><span className="font-bold text-cyan-400">useContent():</span> Title is "{content.title}"</p>
                <p><span className="font-bold text-cyan-400">useTheme():</span> Current theme is "{theme}"</p>
            </div>
             <button
                onClick={toggleTheme}
                className={`w-full mt-6 font-bold py-2 px-4 rounded transition-colors
                    ${theme === 'dark' 
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }
                `}
            >
                Toggle Theme
            </button>
        </div>
    )
}

// The main App component.
export default function App() {
  return (
    // AppProviders wraps the entire UI, making contexts available everywhere inside.
    <AppProviders>
        <div className="bg-gray-900 min-h-screen flex items-center justify-center font-sans p-4">
           <DemoComponent />
        </div>
    </AppProviders>
  );
}
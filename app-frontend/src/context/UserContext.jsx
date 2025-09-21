import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

// --- MOCK FIREBASE AUTH SERVICE ---
// This section simulates the Firebase SDK to make the context fully testable.
let authStateListener = null;
let mockCurrentUser = null;

const mockAuth = {
  getAuth: () => ({}), // Returns a dummy auth object
  
  onAuthStateChanged: (auth, callback) => {
    console.log('[Auth Sim] Attaching auth state listener.');
    authStateListener = callback;
    // Immediately invoke with the current state to simulate initial check
    setTimeout(() => callback(mockCurrentUser), 500); // Simulate network delay for initial check
    
    // Return an unsubscribe function
    return () => {
      console.log('[Auth Sim] Detaching auth state listener.');
      authStateListener = null;
    };
  },

  createUserWithEmailAndPassword: (auth, email, password) => {
    console.log(`[Auth Sim] Signing up ${email}...`);
    return new Promise(resolve => {
        setTimeout(() => {
            mockCurrentUser = { uid: `uid-${Date.now()}`, email: email };
            if (authStateListener) authStateListener(mockCurrentUser);
            resolve({ user: mockCurrentUser });
        }, 1000);
    });
  },

  signInWithEmailAndPassword: (auth, email, password) => {
     console.log(`[Auth Sim] Logging in ${email}...`);
     return new Promise(resolve => {
        setTimeout(() => {
            mockCurrentUser = { uid: `uid-${Date.now()}`, email: email };
            if (authStateListener) authStateListener(mockCurrentUser);
            resolve({ user: mockCurrentUser });
        }, 800);
    });
  },

  signOut: (auth) => {
    console.log('[Auth Sim] Signing out...');
    return new Promise(resolve => {
        setTimeout(() => {
            mockCurrentUser = null;
            if (authStateListener) authStateListener(null);
            resolve();
        }, 400);
    });
  }
};

// Destructure the mock functions to use them as if they were real imports
const { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = mockAuth;
const app = {}; // Dummy app object for getAuth()


// ----------------------------------------------------
// 1. CONTEXT CREATION
// ----------------------------------------------------
console.log("[Health] UserContext initializing.");
const UserContext = createContext(null);


// ----------------------------------------------------
// 2. THE PROVIDER COMPONENT
// ----------------------------------------------------
export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    console.log("[Health] App loaded successfully");

    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("[Health] Firebase auth state changed.", user);
      setCurrentUser(user);
      setIsLoading(false); // Initial auth check is complete
    });

    // Cleanup the subscription on component unmount
    return () => unsubscribe();
  }, [auth]); // Dependency array is empty, so this runs once on mount

  // --- AUTHENTICATION FUNCTIONS ---
  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  const contextValue = useMemo(() => ({
    currentUser,
    isLoading,
    signup,
    login,
    logout
  }), [currentUser, isLoading]);

  return (
    <UserContext.Provider value={contextValue}>
      {/* Only render children after the initial loading is complete */}
      {!isLoading && children}
    </User-context.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};


// ----------------------------------------------------
// 3. CUSTOM HOOK
// ----------------------------------------------------
export function useUser() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}


// --- DEMO APP & USAGE EXAMPLE ---
// This shows how the provider and hook work together.

function AuthControls() {
    const { currentUser, login, logout, signup } = useUser();

    if (currentUser) {
        return (
            <div className="text-center">
                <p className="text-green-400">Logged in as: {currentUser.email}</p>
                <button onClick={logout} className="mt-2 w-full bg-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-500">
                    Log Out
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
             <h2 className="text-xl font-bold text-center text-cyan-400">User is Logged Out</h2>
             <div className="flex space-x-4">
                <button onClick={() => login('test@example.com', 'password')} className="w-1/2 bg-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-500">
                    Login
                </button>
                <button onClick={() => signup('new@example.com', 'password')} className="w-1/2 bg-green-600 font-semibold py-2 px-4 rounded-lg hover:bg-green-500">
                    Sign Up
                </button>
            </div>
        </div>
    );
}

// The main App component wraps everything in the UserProvider.
export default function App() {
  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center font-sans p-4">
      <UserProvider>
         <div className="w-full max-w-sm bg-gray-800 rounded-2xl shadow-xl p-6 text-white">
            <AuthControls />
         </div>
      </UserProvider>
    </div>
  );
}
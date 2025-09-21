import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

// --- MOCK DATA ---
const mockMindMap = {
    id: 'mindmap-123',
    title: 'The Solar System',
    nodes: [{ id: 'n1', data: { label: 'Sun' } }, { id: 'n2', data: { label: 'Earth' } }],
    edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
};


// ----------------------------------------------------
// 1. CONTEXT CREATION
// ----------------------------------------------------
console.log("[Health] ContentContext initializing.");
const ContentContext = createContext(null);


// ----------------------------------------------------
// 2. THE PROVIDER COMPONENT
// ----------------------------------------------------
export function ContentProvider({ children }) {
    // --- STATE MANAGEMENT ---
    const [currentMindMap, setCurrentMindMap] = useState(null);
    const [activeModule, setActiveModule] = useState(null); // Not used in demo, but included per pseudocode

    // --- LIFECYCLE HOOKS ---
    useEffect(() => {
        console.log("[Health] App loaded successfully");
    }, []);

    // --- CONTEXT VALUE & FUNCTIONS ---
    const selectMindMap = (mindMapData) => {
        console.log("[Health] Setting new mind map in context.");
        setCurrentMindMap(mindMapData);
    };

    const clearMindMap = () => {
        console.log("[Health] Clearing mind map from context.");
        setCurrentMindMap(null);
    };

    // useMemo optimizes performance, preventing consumers from re-rendering
    // if the context value's reference hasn't changed.
    const contextValue = useMemo(() => ({
        currentMindMap,
        activeModule,
        selectMindMap,
        clearMindMap,
    }), [currentMindMap, activeModule]);

    // --- UI RENDERING (PROVIDER WRAPPER) ---
    return (
        <ContentContext.Provider value={contextValue}>
            {children}
        </ContentContext.Provider>
    );
}

// Prop validation for the provider
ContentProvider.propTypes = {
    children: PropTypes.node.isRequired,
};


// ----------------------------------------------------
// 3. CUSTOM HOOK
// ----------------------------------------------------
export function useContent() {
    const context = useContext(ContentContext);
    if (context === null) {
        throw new Error("useContent must be used within a ContentProvider");
    }
    return context;
}


// --- DEMO APP & USAGE EXAMPLE ---
// This demonstrates how the context is used in a real component.

function MindMapDisplay() {
    // Use the custom hook to easily access the context's state and functions.
    const { currentMindMap, selectMindMap, clearMindMap } = useContent();

    return (
        <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-xl p-6 text-white space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Context Consumer Component</h2>
            <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm">
                <p className="text-gray-400">// currentMindMap state:</p>
                {currentMindMap ? (
                    <pre className="text-green-400">{JSON.stringify(currentMindMap, null, 2)}</pre>
                ) : (
                    <p className="text-red-400">null</p>
                )}
            </div>
            <div className="flex space-x-4">
                <button
                    onClick={() => selectMindMap(mockMindMap)}
                    className="w-1/2 bg-cyan-600 font-semibold py-2 px-4 rounded-lg hover:bg-cyan-500 transition-colors"
                >
                    Load Mind Map
                </button>
                <button
                    onClick={clearMindMap}
                    className="w-1/2 bg-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                >
                    Clear Mind Map
                </button>
            </div>
        </div>
    );
}

// The main App component wraps the consumer in the provider.
export default function App() {
    return (
        <ContentProvider>
            <div className="bg-gray-900 min-h-screen flex items-center justify-center font-sans p-4">
                <MindMapDisplay />
            </div>
        </ContentProvider>
    );
}
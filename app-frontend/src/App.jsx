import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
// In a real project, these would be npm installs. For this environment, we use CDN links.
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MiniMap,
} from 'https://cdn.jsdelivr.net/npm/reactflow@11.11.3/+esm';


// --- MOCK FIREBASE & GLOBAL INITIALIZATION ---
// This simulates the firebaseConfig import and initialization from your main.jsx
const initializeMockFirebase = () => {
    // This is where you would normally call initializeApp(firebaseConfig)
    console.log("✅ Firebase Initialized");
};

// --- MOCK DATA & API SERVICES ---
// This section simulates backend calls for a realistic frontend experience.
const mockApi = {
    // Simulates GET /api/v1/progress
    getProgressData: () => new Promise(res => setTimeout(() => res({
        chartData: {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [{
                data: [5, 2, 10],
                backgroundColor: ['#10B981', '#F59E0B', '#6B7280'],
            }]
        }
    }), 800)),
    // Simulates GET /api/v1/sources
    getMindmapList: () => new Promise(res => setTimeout(() => res([
        { sourceId: 'a1b2-c3d4-e5f6', title: 'The Solar System', updatedAt: '2 days ago' },
        { sourceId: 'g7h8-i9j0-k1l2', title: 'Intro to Photosynthesis', updatedAt: '5 days ago' },
    ]), 800)),
     // Simulates POST /api/v1/sources
    uploadContentSource: (payload) => new Promise(res => setTimeout(() => {
        const file = payload instanceof FormData ? payload.get('file') : null;
        console.log(`[API Sim] Uploading:`, file ? file.name : payload.url);
        res({ sourceId: `mindmap-${Date.now()}` })
    }, 2000)),
    // Simulates GET /api/v1/mindmaps?sourceId=...
    getMindmapData: (sourceId) => new Promise(res => setTimeout(() => res({
        nodes: [{ id: '1', data: { label: 'The Solar System' } }, { id: '2', data: { label: 'Sun' } }, { id: '3', data: { label: 'Inner Planets' } }, { id: '4', data: { label: 'Mercury' } }],
        edges: [{ id: 'e1-2', source: '1', target: '2' }, { id: 'e1-3', source: '1', target: '3' }, { id: 'e3-4', source: '3', target: '4' }]
    }), 1200)),
    // Simulates GET /api/v1/mindmaps/nodes/:nodeId/flashcards
    getFlashcardsForNode: (nodeId) => new Promise(res => setTimeout(() => res({
        nodeTitle: `Node ${nodeId}`,
        cards: [{ question: 'What is the sun?', answer: 'A star.' }, { question: 'What is Mercury?', answer: 'A planet.' }]
    }), 900)),
};


// --- MOCK ROUTING & AUTH CONTEXT ---
// Simulates react-router and a basic authentication context.

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [route, setRoute] = useState({ path: '/dashboard', params: {} });
    const [currentUser, setCurrentUser] = useState({ displayName: 'Alex' });

    const navigate = (path) => {
        const [url, param] = path.split('/').filter(Boolean);
        setRoute({ path: `/${url}`, params: { id: param } });
        window.scrollTo(0, 0); // Scroll to top on page change
    };
    
    const logout = () => setCurrentUser(null);
    const login = () => setCurrentUser({ displayName: 'Alex' });

    const value = { route, navigate, currentUser, logout, login };
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useApp = () => useContext(AppContext);


// --- SHARED UI COMPONENTS ---

const Spinner = ({ text = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center h-full w-full space-y-4 text-gray-400">
      <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p>{text}</p>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full bg-red-900/20 border border-red-700 rounded-lg p-6 space-y-3"><p className="text-red-400 font-semibold text-center">{message}</p></div>
);

const Logo = () => (<svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.378 1.18 17.748 0 17.001 0H7a2 2 0 00-1.99 1.454l-1.6 6.4A1 1 0 005.436 9h1.225L7 13.317l-2.57.734A1 1 0 003.436 15l1.43 1.43a1 1 0 001.414 0l.283-.282m1.832 3.434a4 4 0 105.656 0" /></svg>);


// --- LAYOUT COMPONENTS ---

function Navbar() {
    const { navigate, currentUser, logout, route } = useApp();
    const NavLink = ({ to, children }) => {
        const isActive = route.path === to;
        const base = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
        const active = "bg-gray-900 text-white";
        const inactive = "text-gray-300 hover:bg-gray-700 hover:text-white";
        return <button onClick={() => navigate(to)} className={`${base} ${isActive ? active : inactive}`}>{children}</button>;
    };

    return (
        <nav className="bg-gray-800 shadow-md sticky top-0 z-50"><div className="max-w-7xl mx-auto px-4"><div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-2"><Logo /><span className="text-white text-xl font-bold">MindMeld</span></button>
                <div className="hidden md:flex items-baseline space-x-4">
                    {currentUser && <><NavLink to="/dashboard">Dashboard</NavLink><NavLink to="/upload">Create New</NavLink></>}
                </div>
            </div>
            <div className="hidden md:block">
                {currentUser ? (
                    <div className="flex items-center space-x-4"><span className="text-gray-300 text-sm">Welcome, {currentUser.displayName}!</span><button onClick={logout} className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-600">Logout</button></div>
                ) : (
                    <div className="flex items-center space-x-2"><NavLink to="/login">Login</NavLink><button className="bg-cyan-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-cyan-500">Sign Up</button></div>
                )}
            </div>
        </div></div></nav>
    );
}


// --- PAGE COMPONENTS ---

function Dashboard() {
    const { navigate } = useApp();
    const [mindmaps, setMindmaps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("[Health] App loaded successfully");
        const fetchData = async () => {
            const maps = await mockApi.getMindmapList();
            setMindmaps(maps);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) return <Spinner text="Loading Dashboard..." />;

    return (<div className="space-y-8">
        <div><h1 className="text-3xl font-bold text-white">Dashboard</h1><p className="text-gray-400">Welcome back! Here are your recent mind maps.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mindmaps.map(map => (
                <button key={map.sourceId} onClick={() => navigate(`/mindmap/${map.sourceId}`)} className="bg-gray-800 p-6 rounded-lg text-left hover:bg-gray-700/50 hover:ring-2 ring-cyan-500 transition-all space-y-2">
                    <h3 className="font-bold text-lg text-cyan-400">{map.title}</h3><p className="text-sm text-gray-400">Last updated: {map.updatedAt}</p>
                </button>
            ))}
             <button onClick={() => navigate('/upload')} className="bg-gray-800/50 border-2 border-dashed border-gray-600 p-6 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700/50 hover:border-cyan-500 transition-all">
                <span className="text-2xl">+</span><span>Create New Mind Map</span>
            </button>
        </div>
    </div>);
}

function UploadPage() {
    const { navigate } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await mockApi.uploadContentSource({url: 'mock-url'});
        navigate(`/mindmap/${response.sourceId}`);
    };

    return (<div className="max-w-2xl mx-auto"><div className="bg-gray-800 p-8 rounded-lg space-y-6">
        <div className="text-center"><h1 className="text-3xl font-bold text-cyan-400">Create New Mind Map</h1><p className="text-gray-400 mt-2">Upload a document or paste a link to get started.</p></div>
        <form onSubmit={handleSubmit} className="space-y-6">
             <label htmlFor="file-upload" className="w-full h-32 flex flex-col items-center justify-center p-4 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-cyan-500 transition-colors"><span className="font-semibold text-gray-300">Select a file or paste a link</span><input id="file-upload" type="file" className="hidden" /></label>
            <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 font-bold p-4 rounded-lg flex items-center justify-center hover:bg-cyan-500 disabled:bg-cyan-800/50">{isLoading ? 'Processing...' : 'Generate Mind Map'}</button>
        </form>
    </div></div>);
}

function MindMapViewer({ nodeId }) {
    const { navigate } = useApp();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await mockApi.getMindmapData(nodeId);
            const formattedNodes = data.nodes.map((n, i) => ({...n, position: {x: i * 200, y: (i%2) * 100}}));
            setNodes(formattedNodes);
            setEdges(data.edges);
            setIsLoading(false);
        };
        fetchData();
    }, [nodeId, setNodes, setEdges]);
    
    const onNodeClick = (_, node) => navigate(`/flashcards/${node.id}`);

    if (isLoading) return <Spinner text="Building Mind Map..." />;
    
    return (<div className="w-full h-[calc(100vh-128px)]">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={onNodeClick} fitView><Controls /><Background /></ReactFlow>
    </div>);
}

function FlashcardsPage({ nodeId }) {
    const { navigate } = useApp();
    const [card, setCard] = useState(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await mockApi.getFlashcardsForNode(nodeId);
            setCard(data.cards[0]);
            setIsLoading(false);
        };
        fetchData();
    }, [nodeId]);

    if (isLoading) return <Spinner text="Loading Flashcards..." />;
    
    return (<div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => navigate('/dashboard')} className="text-cyan-400">&larr; Back to Dashboard</button>
        <div className="h-80 [perspective:1000px]"><div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
            <div className="absolute w-full h-full bg-gray-700 rounded-2xl p-6 flex items-center justify-center text-center [backface-visibility:hidden]"><p className="text-2xl text-white">{card?.question}</p></div>
            <div className="absolute w-full h-full bg-cyan-800 rounded-2xl p-6 flex items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]"><p className="text-xl text-white">{card?.answer}</p></div>
        </div></div>
    </div>);
}


// --- MAIN APP ROUTER ---

export default function App() {
    useEffect(() => {
        initializeMockFirebase(); // From your main.jsx
        console.log("[Health] App loaded successfully");
    }, []);

    const PageRouter = () => {
        const { route } = useApp();
        switch (route.path) {
            case '/dashboard': return <Dashboard />;
            case '/upload': return <UploadPage />;
            case '/mindmap': return <MindMapViewer nodeId={route.params.id} />;
            case '/flashcards': return <FlashcardsPage nodeId={route.params.id} />;
            default: return <Dashboard />;
        }
    };
    
    return (
        <AppProvider>
            <div className="bg-gray-900 text-white min-h-screen font-sans">
                <Navbar />
                <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <PageRouter />
                </main>
            </div>
        </AppProvider>
    );
}
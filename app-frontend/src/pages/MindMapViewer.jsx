import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';

// --- MOCK DATA & API ---
// This section simulates a backend API response for a specific mind map.

const mockSourceId = 'a1b2-c3d4-e5f6';

const mockApiResponse = {
  title: 'The Solar System',
  // Note: The API response doesn't include positions. We'll calculate them.
  nodes: [
    { id: '1', data: { label: 'The Solar System' } },
    { id: '2', data: { label: 'Sun' } },
    { id: '3', data: { label: 'Inner Planets' } },
    { id: '4', data: { label: 'Outer Planets' } },
    { id: '5', data: { label: 'Mercury' } },
    { id: '6', data: { label: 'Venus' } },
    { id: '7', data: { label: 'Earth' } },
    { id: '8', data: { label: 'Mars' } },
    { id: '9', data: { label: 'Jupiter' } },
    { id: '10', data: { label: 'Saturn' } },
    { id: '11', data: { label: 'Uranus' } },
    { id: '12', data: { label: 'Neptune' } },
    { id: '13', data: { label: 'Dwarf Planets' } },
    { id: '14', data: { label: 'Pluto' } },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e1-3', source: '1', target: '3' },
    { id: 'e1-4', source: '1', target: '4' },
    { id: 'e1-13', source: '1', target: '13' },
    { id: 'e3-5', source: '3', target: '5' },
    { id: 'e3-6', source: '3', target: '6' },
    { id: 'e3-7', source: '3', target: '7' },
    { id: 'e3-8', source: '3', target: '8' },
    { id: 'e4-9', source: '4', target: '9' },
    { id: 'e4-10', source: '4', target: '10' },
    { id: 'e4-11', source: '4', target: '11' },
    { id: 'e4-12', source: '4', target: '12' },
    { id: 'e13-14', source: '13', target: '14' },
  ],
};

// Simulates GET /api/v1/mindmaps?sourceId=...
const getMindmapData = (sourceId) => {
  console.log(`[API Sim] Requesting mind map for sourceId: ${sourceId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (sourceId === mockSourceId) {
        resolve(mockApiResponse);
      } else {
        reject(new Error('Mind map not found.'));
      }
    }, 1500);
  });
};

// --- LAYOUT HELPER FUNCTION ---
/**
 * Formats API data for React Flow and calculates node positions using a tree layout.
 * @param {object} apiData - The raw data from the API.
 * @returns {{formattedNodes: Array, formattedEdges: Array}}
 */
const formatMindmapData = (apiData) => {
  const { nodes: rawNodes, edges: rawEdges } = apiData;
  const formattedEdges = rawEdges.map(edge => ({
    ...edge,
    type: 'smoothstep', // Nicer edge style
    animated: true,
  }));

  // Create an adjacency list to represent the tree structure
  const childrenMap = new Map();
  rawNodes.forEach(node => childrenMap.set(node.id, []));
  rawEdges.forEach(edge => {
    if (childrenMap.has(edge.source)) {
      childrenMap.get(edge.source).push(edge.target);
    }
  });

  // Find the root node (a node that is never a target)
  const targetNodes = new Set(rawEdges.map(e => e.target));
  const rootNode = rawNodes.find(n => !targetNodes.has(n.id));

  if (!rootNode) {
     console.error("No root node found!");
     // Fallback: just return unpositioned nodes
     return { formattedNodes: rawNodes.map(n => ({...n, position: {x: 0, y: 0}})), formattedEdges };
  }
  
  const positionedNodes = new Map();
  
  // Recursive function to position nodes
  function positionNodes(nodeId, x, y, level = 0, parentAngle = 0) {
    if (positionedNodes.has(nodeId)) return;
    
    const node = rawNodes.find(n => n.id === nodeId);
    positionedNodes.set(nodeId, {
      ...node,
      position: { x, y },
      style: { 
        background: level === 0 ? '#0891B2' : level === 1 ? '#0D9488' : '#64748B',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 15px',
        width: 170
      },
    });

    const children = childrenMap.get(nodeId) || [];
    const radius = 250 + level * 50;
    const isBranch = level > 0;
    
    // Spread children in an arc to avoid overlaps
    const totalAngle = isBranch ? Math.PI : 2 * Math.PI;
    const startAngle = isBranch ? parentAngle - totalAngle / 2 : 0;
    const angleStep = children.length > 1 ? totalAngle / (children.length) : 0;

    children.forEach((childId, i) => {
      const angle = startAngle + i * angleStep + (isBranch ? angleStep/2 : 0);
      const childX = x + radius * Math.cos(angle);
      const childY = y + radius * Math.sin(angle);
      positionNodes(childId, childX, childY, level + 1, angle);
    });
  }

  positionNodes(rootNode.id, 0, 0);

  return { formattedNodes: Array.from(positionedNodes.values()), formattedEdges };
};


// --- UI HELPER COMPONENTS ---
const Spinner = () => (
    <div className="flex flex-col items-center justify-center h-full w-full space-y-4">
      <svg className="animate-spin h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-gray-400 text-lg">Building Mind Map...</p>
    </div>
);
  
const ErrorDisplay = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full w-full bg-red-900/20 border-2 border-dashed border-red-700 rounded-lg p-6 space-y-3">
       <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-red-400 font-semibold text-center text-lg">{message}</p>
    </div>
);


// --- MAIN MINDMAP COMPONENT ---

function MindMapViewer() {
  // ----------------------------------------------------
  // 1. STATE MANAGEMENT & SETUP
  // ----------------------------------------------------
  console.log("[Health] MindMapViewer component initializing state.");
  
  // Simulating react-router-dom hooks
  const { sourceId } = { sourceId: mockSourceId }; 
  const navigate = (path) => console.log(`[Router] Navigating to ${path}`);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // ----------------------------------------------------
  // 2. DATA FETCHING ON COMPONENT MOUNT
  // ----------------------------------------------------
  useEffect(() => {
    console.log("[Health] App loaded successfully");

    if (!sourceId) {
      setErrorMessage("No Mind Map ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchMindmap = async () => {
      try {
        console.log(`[Health] Fetching mind map data for sourceId: ${sourceId}.`);
        const data = await getMindmapData(sourceId);
        
        const { formattedNodes, formattedEdges } = formatMindmapData(data);
        
        setNodes(formattedNodes);
        setEdges(formattedEdges);
      } catch (error) {
        console.error("Error fetching mind map data:", error.message);
        setErrorMessage("Could not load the mind map.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMindmap();
  }, [sourceId, setNodes, setEdges]);

  // ----------------------------------------------------
  // 3. EVENT HANDLERS
  // ----------------------------------------------------
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onNodeClick = (event, node) => {
    console.log(`[Health] Node clicked: ${node.id} - ${node.data.label}`);
    navigate(`/flashcards/${node.id}`);
  };

  // ----------------------------------------------------
  // 4. UI RENDERING
  // ----------------------------------------------------
  return (
    <div className="w-full h-screen bg-gray-900">
      {isLoading && <Spinner />}
      {!isLoading && errorMessage && <ErrorDisplay message={errorMessage} />}
      {!isLoading && !errorMessage && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
          className="bg-gray-800"
        >
          <Controls />
          <MiniMap nodeColor={(n) => n.style?.background || '#ddd'} nodeStrokeWidth={3} zoomable pannable />
          <Background variant="dots" gap={16} size={1} color="#4B5563" />
        </ReactFlow>
      )}
    </div>
  );
}

// App Wrapper
export default function App() {
  return <MindMapViewer />;
}
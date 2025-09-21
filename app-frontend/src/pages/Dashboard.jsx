import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// --- MOCK DATA & API ---
// This section simulates fetching data from a backend.

// Mock user data (simulating useAuth())
const mockCurrentUser = {
  displayName: "Alex",
};

const useAuth = () => ({ currentUser: mockCurrentUser });

// Mock progress data for the chart
const mockProgressData = {
  // Data structure for recharts
  chartData: [
    { name: 'Completed', value: 5, color: '#10B981' }, // Emerald-500
    { name: 'In Progress', value: 2, color: '#F59E0B' }, // Amber-500
    { name: 'Not Started', value: 10, color: '#6B7280' }, // Gray-500
  ],
};

// Mock list of mind maps
const mockMindmaps = [
  { sourceId: 'a1b2c3d4', title: 'Quantum Computing Fundamentals', updatedAt: '2025-09-18' },
  { sourceId: 'e5f6g7h8', title: 'The History of Ancient Rome', updatedAt: '2025-09-15' },
  { sourceId: 'i9j0k1l2', title: 'Advanced JavaScript Concepts', updatedAt: '2025-09-12' },
  { sourceId: 'm3n4o5p6', title: 'Marketing Strategies for 2026', updatedAt: '2025-09-05' },
];

// Simulates GET /api/v1/progress
const getProgressData = () => new Promise(resolve => setTimeout(() => resolve(mockProgressData), 800));

// Simulates GET /api/v1/sources
const getMindmapList = () => new Promise(resolve => setTimeout(() => resolve(mockMindmaps), 1200));


// --- UI COMPONENTS ---

const Spinner = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-4">
    <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-gray-400">Loading Dashboard...</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="flex items-center justify-center h-full bg-red-900/20 border border-red-700 rounded-lg p-6">
    <p className="text-red-400 font-semibold">{message}</p>
  </div>
);

// A placeholder DoughnutChart component using Recharts
const DoughnutChart = ({ data }) => (
  <div style={{ width: '100%', height: 300 }}>
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
            contentStyle={{
                backgroundColor: '#1F2937', // bg-gray-800
                borderColor: '#374151', // border-gray-700
                color: '#D1D5DB' // text-gray-300
            }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// --- MAIN DASHBOARD COMPONENT ---

function Dashboard() {
  // ----------------------------------------------------
  // 1. STATE MANAGEMENT
  // ----------------------------------------------------
  console.log("[Health] Dashboard component initializing state.");

  const [progressData, setProgressData] = useState(null);
  const [mindmaps, setMindmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const { currentUser } = useAuth();

  // ----------------------------------------------------
  // 2. DATA FETCHING ON COMPONENT MOUNT
  // ----------------------------------------------------
  useEffect(() => {
    console.log("[Health] App loaded successfully");

    const fetchDashboardData = async () => {
      try {
        console.log("[Health] Fetching progress and mindmap data from backend.");
        const [progressResponse, mindmapsResponse] = await Promise.all([
          getProgressData(),
          getMindmapList()
        ]);
        
        setProgressData(progressResponse);
        setMindmaps(mindmapsResponse);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setErrorMessage("Could not load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // ----------------------------------------------------
  // 3. UI RENDERING
  // ----------------------------------------------------
  if (isLoading) {
    return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center"><Spinner /></div>;
  }

  if (errorMessage) {
    return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4"><ErrorDisplay message={errorMessage} /></div>;
  }
  
  return (
    <div className="dashboard-container bg-gray-900 text-white min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">Welcome back, {currentUser.displayName}!</h1>
          <p className="text-gray-400 mt-2">Here's a snapshot of your learning journey.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Progress Tracker Section (Left Column) */}
          <section className="progress-tracker lg:col-span-1 bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-white">Your Progress</h2>
            {progressData ? <DoughnutChart data={progressData.chartData} /> : <p>No progress data available.</p>}
          </section>

          {/* Saved Mind Maps Section (Right Column) */}
          <section className="mindmap-list lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-white">My Mind Maps</h2>
            {mindmaps.length === 0 ? (
              <p className="text-gray-400 text-center py-10">You haven't created any mind maps yet. Upload some content to get started!</p>
            ) : (
              <div className="space-y-4">
                {mindmaps.map((mindmap) => (
                  // Each card is a link to the detailed mind map view
                  <a 
                    key={mindmap.sourceId}
                    href={`/mindmap/${mindmap.sourceId}`} 
                    onClick={(e) => e.preventDefault()} // Prevent navigation for this demo
                    className="block p-5 bg-gray-700 rounded-lg hover:bg-gray-600 hover:ring-2 hover:ring-cyan-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <h3 className="font-bold text-lg text-cyan-400">{mindmap.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">Last updated: {new Date(mindmap.updatedAt).toLocaleDateString()}</p>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// App Wrapper to render the Dashboard
export default function App() {
  return (
    <>
      {/* Recharts is a client-side library, so we need to ensure it's available. */}
      <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
      <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/recharts/umd/Recharts.min.js"></script>
      <Dashboard />
    </>
  );
}
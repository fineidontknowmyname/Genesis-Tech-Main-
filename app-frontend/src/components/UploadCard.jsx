import React, { useState, useEffect } from 'react';

// --- MOCK API & HELPERS ---
// This section simulates backend calls, routing, and notifications for a standalone demo.

// Mock for react-router-dom's useNavigate hook
const useNavigate = () => {
  return (path) => {
    console.log(`[Router] Navigating to: ${path}`);
    alert(`Upload successful! Redirecting to: ${path}`);
  };
};

// Mock for a toast notification library like react-toastify
const toast = {
  success: (message) => {
    console.log(`[Toast Success] ${message}`);
  },
  error: (message) => {
    console.error(`[Toast Error] ${message}`);
    alert(`Error: ${message}`);
  },
};

// Mock API call for POST /api/v1/sources
const uploadContentSource = (apiPayload) => {
  if (apiPayload instanceof FormData) {
      const file = apiPayload.get("file");
      console.log(`[API Sim] Uploading file: ${file.name}`);
  } else {
      console.log(`[API Sim] Submitting URL: ${apiPayload.url}`);
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate a random failure to test error handling
      if (Math.random() > 0.9) {
          reject(new Error("A random processing error occurred."));
      } else {
          const newSourceId = `mindmap-${Date.now()}`;
          resolve({ sourceId: newSourceId });
      }
    }, 2000); // Simulate a 2-second network delay
  });
};


// --- UI HELPER COMPONENTS ---

const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const Tabs = ({ tabs, activeTab, onTabChange }) => (
    <div className="flex w-full bg-gray-700/50 rounded-lg p-1">
        {tabs.map(tab => {
            const value = tab.toLowerCase();
            const isActive = activeTab === value;
            return (
                <button
                    key={tab}
                    type="button"
                    onClick={() => onTabChange(value)}
                    className={`w-1/2 p-2 text-sm font-semibold rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                        isActive ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600/50'
                    }`}
                >
                    {tab}
                </button>
            )
        })}
    </div>
);


// --- MAIN UPLOAD CARD COMPONENT ---

function UploadCard() {
    // ----------------------------------------------------
    // 1. STATE MANAGEMENT
    // ----------------------------------------------------
    console.log("[Health] UploadCard component initializing state.");

    const [activeTab, setActiveTab] = useState('file');
    const [selectedFile, setSelectedFile] = useState(null);
    const [contentUrl, setContentUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    // ----------------------------------------------------
    // 2. LIFECYCLE HOOKS
    // ----------------------------------------------------
    useEffect(() => {
        console.log("[Health] App loaded successfully");
    }, []);

    // ----------------------------------------------------
    // 3. EVENT HANDLERS
    // ----------------------------------------------------
    const handleSubmit = async () => {
        console.log("[Health] Upload submission initiated.");

        if (activeTab === 'file' && !selectedFile) {
            toast.error("Please select a file.");
            return;
        }
        if (activeTab === 'url' && !contentUrl.trim()) {
            toast.error("Please enter a URL.");
            return;
        }

        setIsLoading(true);

        const apiPayload = activeTab === 'file' ? new FormData() : { url: contentUrl };
        if (activeTab === 'file') {
            apiPayload.append("file", selectedFile);
        }

        try {
            const response = await uploadContentSource(apiPayload);
            toast.success("Content processing started!");
            navigate(`/mindmap/${response.sourceId}`);
        } catch (error) {
            console.error("Error during upload:", error);
            toast.error("Upload failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // ----------------------------------------------------
    // 4. UI RENDERING
    // ----------------------------------------------------
    return (
        <div className="w-full max-w-sm bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-cyan-400">Create New Mind Map</h3>
            
            <Tabs
                tabs={['File', 'Link']}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="h-20 flex items-center justify-center">
                {activeTab === 'file' ? (
                    <label htmlFor="file-upload-card" className="w-full h-full flex items-center justify-center text-center p-2 bg-gray-700/50 text-gray-400 rounded-lg border-2 border-dashed border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-cyan-500 transition-colors">
                       <span className="text-sm font-medium truncate">{selectedFile ? selectedFile.name : 'Click to select a file'}</span>
                       <input id="file-upload-card" type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                    </label>
                ) : (
                    <input
                        type="url"
                        value={contentUrl}
                        onChange={e => setContentUrl(e.target.value)}
                        placeholder="Paste a YouTube, article, or PDF link..."
                        className="w-full p-3 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none transition-colors"
                    />
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-cyan-500 disabled:bg-cyan-800/50 disabled:cursor-not-allowed transition-all"
            >
                {isLoading ? (
                    <>
                        <Spinner />
                        Processing...
                    </>
                ) : (
                    'Generate'
                )}
            </button>
        </div>
    );
}

// --- DEMO APP WRAPPER ---
// This wrapper component provides context for the UploadCard.
export default function App() {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans p-4">
      <UploadCard />
    </div>
  );
}
import React, 'useState', 'useEffect' } from 'react';

// --- MOCK DATA & API ---
// This section simulates fetching data for a specific node from a backend.

const mockNodeId = 'a1b2-c3d4-e5f6-g7h8'; // Simulating useParams()

const mockFlashcardsData = {
  nodeTitle: 'The Core Concepts of Photosynthesis',
  cards: [
    { question: 'What is the primary purpose of photosynthesis?', answer: 'To convert light energy into chemical energy in the form of glucose (sugar).' },
    { question: 'What are the two main stages of photosynthesis?', answer: 'The light-dependent reactions and the Calvin cycle (light-independent reactions).' },
    { question: 'Where in the plant cell does photosynthesis occur?', answer: 'Inside the chloroplasts.' },
    { question: 'What are the main inputs (reactants) for photosynthesis?', answer: 'Carbon dioxide (CO2), water (H2O), and sunlight.' },
    { question: 'What are the main outputs (products) of photosynthesis?', answer: 'Glucose (C6H12O6) and oxygen (O2).' },
    { question: 'What pigment is responsible for absorbing light energy?', answer: 'Chlorophyll, which gives plants their green color.' }
  ]
};

// Simulates GET /api/v1/mindmaps/nodes/:nodeId/flashcards
const getFlashcardsForNode = (nodeId) => {
  console.log(`[API Sim] Requesting flashcards for node: ${nodeId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (nodeId === mockNodeId) {
        resolve(mockFlashcardsData);
      } else {
        reject(new Error('Node not found.'));
      }
    }, 1000); // Simulate 1-second network delay
  });
};


// --- UI HELPER COMPONENTS ---

const Spinner = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-gray-400">Loading Flashcards...</p>
    </div>
);
  
const ErrorDisplay = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full bg-red-900/20 border border-red-700 rounded-lg p-6 space-y-3">
       <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-red-400 font-semibold text-center">{message}</p>
    </div>
);


// --- MAIN FLASHCARDS COMPONENT ---

function FlashcardsPage() {
  // ----------------------------------------------------
  // 1. STATE MANAGEMENT
  // ----------------------------------------------------
  console.log("[Health] FlashcardsPage component initializing state.");

  const [flashcards, setFlashcards] = useState([]);
  const [nodeTitle, setNodeTitle] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Simulating react-router-dom's useParams()
  const { nodeId } = { nodeId: mockNodeId };

  // ----------------------------------------------------
  // 2. DATA FETCHING ON COMPONENT MOUNT
  // ----------------------------------------------------
  useEffect(() => {
    console.log("[Health] App loaded successfully");

    if (!nodeId) {
      setErrorMessage("No node ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchFlashcards = async () => {
      try {
        console.log(`[Health] Fetching flashcards for nodeId: ${nodeId}.`);
        const data = await getFlashcardsForNode(nodeId);
        
        if (data && data.cards && data.cards.length > 0) {
            setFlashcards(data.cards);
            setNodeTitle(data.nodeTitle);
        } else {
            setErrorMessage("No flashcards found for this topic.");
        }

      } catch (error) {
        console.error("Error fetching flashcards:", error.message);
        setErrorMessage("Could not load flashcards. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [nodeId]); // Dependency array ensures this runs if nodeId changes

  // ----------------------------------------------------
  // 3. EVENT HANDLERS
  // ----------------------------------------------------
  const handleFlipCard = () => {
    console.log("[Health] Flipping card.");
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    console.log("[Health] Moving to next card.");
    setIsFlipped(false); // Always show the question first
    // Use a timeout to allow the flip-back animation to be seen before content changes
    setTimeout(() => {
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }, 150);
  };

  // --- RENDER LOGIC ---

  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }

    if (errorMessage) {
      return <ErrorDisplay message={errorMessage} />;
    }

    if (flashcards.length === 0) {
      return <p className="text-gray-400">No flashcards available.</p>
    }

    const currentCard = flashcards[currentCardIndex];

    return (
        <>
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-cyan-400">{nodeTitle}</h1>
                <p className="text-gray-400 mt-2">Card {currentCardIndex + 1} of {flashcards.length}</p>
            </div>
            
            {/* Flashcard */}
            <div className="w-full h-80 [perspective:1000px]">
                <div 
                    className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                    onClick={handleFlipCard}
                >
                    {/* Front of Card (Question) */}
                    <div className="absolute w-full h-full bg-gray-700 rounded-2xl p-6 flex items-center justify-center text-center [backface-visibility:hidden]">
                        <p className="text-2xl text-white">{currentCard.question}</p>
                    </div>
                    {/* Back of Card (Answer) */}
                    <div className="absolute w-full h-full bg-cyan-800 rounded-2xl p-6 flex items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        <p className="text-xl text-white">{currentCard.answer}</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="w-full flex justify-center items-center space-x-4 mt-8">
                <button 
                    onClick={handleFlipCard}
                    className="w-1/2 bg-gray-600 font-bold p-4 rounded-lg hover:bg-gray-500 transition-all duration-300"
                >
                    Flip Card
                </button>
                <button 
                    onClick={handleNextCard}
                    className="w-1/2 bg-cyan-600 font-bold p-4 rounded-lg hover:bg-cyan-500 transition-all duration-300"
                >
                    Next Card
                </button>
            </div>
        </>
    );
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans p-4">
        <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8">
            {renderContent()}
        </div>
    </div>
  );
}

// App Wrapper
export default function App() {
  return <FlashcardsPage />;
}
import React, 'useState';

// COMPONENT: UploadPage
// PURPOSE: To provide a UI for users to upload content (file or YouTube URL)
// which is then sent to the backend for processing and storage.

export default function App() {
  // ----------------------------------------------------
  // 1. STATE MANAGEMENT
  // ----------------------------------------------------
  console.log("[Health] UploadPage component mounted.");

  // State to hold the user's selected file object
  const [selectedFile, setSelectedFile] = useState(null);

  // State to hold the YouTube URL string from the input field
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // State to manage the UI loading indicator (e.g., a spinner)
  const [isLoading, setIsLoading] = useState(false);

  // State to display any errors to the user
  const [errorMessage, setErrorMessage] = useState("");
  
  // State to display a success message to the user
  const [successMessage, setSuccessMessage] = useState("");

  // State to toggle between 'file' and 'url' upload UI
  const [uploadType, setUploadType] = useState("file");

  // ----------------------------------------------------
  // 3. EVENT HANDLERS & LOGIC
  // ----------------------------------------------------

  /**
   * Updates state when a user selects a file from their computer.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event.
   */
  const handleFileChange = (event) => {
    console.log("[Health] File selected by user.");
    if (event.target.files && event.target.files.length > 0) {
        setSelectedFile(event.target.files[0]);
        setYoutubeUrl(""); // Clear the other input
        setErrorMessage(""); // Clear any previous errors
        setSuccessMessage("");
    }
  };

  /**
   * Updates state as the user types a URL.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The text input change event.
   */
  const handleUrlChange = (event) => {
    setYoutubeUrl(event.target.value);
    setSelectedFile(null); // Clear the other input
    setErrorMessage(""); // Clear any previous errors
    setSuccessMessage("");
  };

  /**
   * The core function that orchestrates the content ingestion process.
   */
  const handleSubmit = async () => {
    console.log("[Health] handleSubmit function initiated.");
    
    // --- DATA FLOW STEP 1: User Input Captured by Frontend ---
    if (!selectedFile && !youtubeUrl.trim()) {
      setErrorMessage("Please select a file or enter a URL.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Prepare data for the API call
    let apiPayload;
    let headers = {};

    if (selectedFile) {
      // Use FormData for file uploads, the standard for multipart/form-data
      apiPayload = new FormData();
      apiPayload.append("content", selectedFile);
    } else {
      // For a URL, send a simple JSON object
      apiPayload = JSON.stringify({ type: "url", content: youtubeUrl });
      headers['Content-Type'] = 'application/json';
    }

    // --- DATA FLOW STEP 2: Frontend Makes API Call to Backend ---
    console.log("[Health] Making POST request to /api/v1/sources.");
    
    try {
      // NOTE: This is a MOCK API call. Replace with your actual backend endpoint.
      // We simulate a network delay to show the loading state.
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response simulating a successful upload
      const mockResponse = {
          ok: true,
          status: 200,
          json: async () => ({ sourceId: `src_${Date.now()}`, message: "Content processed successfully." })
      };
      
      if (!mockResponse.ok) {
          throw new Error(`HTTP error! status: ${mockResponse.status}`);
      }

      const result = await mockResponse.json();

      // --- DATA FLOW STEP 4: Frontend Handles Successful Response ---
      console.log("[Health] API call successful. Backend processing complete.", result);
      setSuccessMessage(`Success! Your content has been processed. Source ID: ${result.sourceId}`);
      setSelectedFile(null);
      setYoutubeUrl("");

    } catch (error) {
      console.error("[Health] API call failed.", error);
      setErrorMessage("There was an error processing your content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // 2. UI RENDERING
  // ----------------------------------------------------
  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-cyan-400">Ingest New Content</h1>
            <p className="text-gray-400 mt-2">Upload a file or provide a YouTube URL to begin.</p>
        </div>

        {/* Tabs to switch between upload methods */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button 
            onClick={() => { setUploadType('file'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`w-1/2 p-3 rounded-md font-semibold transition-colors duration-300 ${uploadType === 'file' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
          >
            Upload File
          </button>
          <button 
            onClick={() => { setUploadType('url'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`w-1/2 p-3 rounded-md font-semibold transition-colors duration-300 ${uploadType === 'url' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
          >
            YouTube URL
          </button>
        </div>

        {/* Conditional UI for Upload Types */}
        <div className="h-24 flex items-center justify-center">
          {uploadType === 'file' && (
            <div className="w-full">
              <label htmlFor="file-upload" className="cursor-pointer bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-lg w-full text-center block border-2 border-dashed border-gray-600 hover:border-cyan-400 hover:text-cyan-400 transition-all">
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose a file...'}
              </label>
              <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {uploadType === 'url' && (
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={handleUrlChange}
              className="w-full bg-gray-700 text-white p-4 rounded-lg border-2 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none transition-all"
            />
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="w-full bg-cyan-600 text-white font-bold p-4 rounded-lg hover:bg-cyan-700 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : "Process Content"}
          </button>
        </div>
        
        {/* Status Messages */}
        <div className="h-6 text-center">
             {errorMessage && <p className="text-red-400 font-semibold">{errorMessage}</p>}
             {successMessage && <p className="text-green-400 font-semibold">{successMessage}</p>}
        </div>
      </div>
    </div>
  );
}
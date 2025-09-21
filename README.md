AI Learning Agent


  The AI Learning Agent is a full-stack web application designed to transform any unstructured content (like
   articles, documents, or YouTube videos) into a structured, interactive, and personalized learning
  experience. It uses AI to build a conceptual mind map from your content, allowing you to visually explore
  topics and generate dynamic study aids on demand.

  ## Features


   * Content Ingestion: Provide a URL or upload a document to get started.
  Architecture Diagram
  `mermaid
  graph TD
      subgraph "User's Browser"
          A[User] --> B[React Web App];
          B --> C{firebaseApi.js};
      end

      subgraph "Backend Server (Node.js)"
          D[Express.js API] --> E[Auth Middleware];
          E --> F[API Routes];
          F --> G[Controllers];
          G --> H[Services];
      end

      subgraph "External Services"
          I[OpenAI API <br>(gpt-4o-mini)];
          J[Firebase Firestore <br>(Database)];
      end

      C -- HTTPS REST API Call --> D;
      H -- Reads/Writes --> J;
      H -- HTTPS API Call --> I;
      I -- AI-Generated Content --> H;
      J -- Fetched Data --> H;
      D -- JSON Response --> C;
  `

  ## Tech Stack


  | Area | Technology |
  | :--- | :--- |
  | Frontend | React, Vite, Tailwind CSS, Axios |
  | Backend | Node.js, Express.js |
  | AI Model | OpenAI API (gpt-4o-mini) |
  | Database | Firebase Firestore |
  | Authentication| Firebase Authentication (via JWTs) |
  | Deployment | (e.g., Vercel for Frontend, Render/Heroku for Backend) |

  ## Getting Started

  Follow these instructions to get the project running on your local machine for development and testing
  purposes.

  ### Prerequisites


   * Node.js (v18 or later)
  `sh
      git clone https://github.com/your-username/ai-learning-agent.git
      cd ai-learning-agent
      `

  2.  Configure Backend:
      *   Navigate to the backend directory: cd app-backend
      *   Install dependencies: npm install
      *   Create a .env file in this directory and add your environment variables:

  `env
          # Server Configuration
          PORT=5001
          CORS_ORIGIN=http://localhost:3000

          # Firebase Configuration
          # (Your full Firebase service account JSON, as a single line string)
          FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "...", ...}'

          # OpenAI API Key
          OPENAI_API_KEY="your_sk-..."
          `


   3. Configure Frontend:
  `env
          VITE_FIREBASE_API_KEY="your_api_key"
          VITE_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
          VITE_FIREBASE_PROJECT_ID="your_project_id"
          VITE_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
          VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
          VITE_FIREBASE_APP_ID="your_app_id"
          `

  ### Running the Application


   1. Start the Backend Server:
   3. Open your browser and navigate to http://localhost:3000.
  | Endpoint | Method | Description | Protected |
  | :--- | :--- | :--- | :--- |
  | /auth/register | POST | Registers a new user. | No |
  | /auth/me | GET | Retrieves the current user's profile. | Yes |
  | /sources | POST | Submits a new content source for processing. | Yes |
  | /mindmaps | GET | Retrieves the mind map for a given source. | Yes |
  | /aids | POST | Generates a learning aid (summary, flashcards, etc.). | Yes |
  | /progress | GET | Retrieves the user's aggregated progress. | Yes |
  | /modules/:nodeId| GET | Retrieves a detailed learning module for a node. | Yes |

  ## Contributing

  Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss any
  changes.

  ## License


  This project is licensed under the MIT License - see the LICENSE file for details.

import { useState } from "react";
import ListingTable from "./components/ListingTable";
import Analytics from "./components/Analytics";

function App() {
  const [currentView, setCurrentView] = useState("listings");

  return (
    <div>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-16">
            <button
              onClick={() => setCurrentView("listings")}
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                currentView === "listings"
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Listings
            </button>
            <button
              onClick={() => setCurrentView("analytics")}
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                currentView === "analytics"
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </nav>

      {currentView === "listings" ? <ListingTable /> : <Analytics />}
    </div>
  );
}

export default App;

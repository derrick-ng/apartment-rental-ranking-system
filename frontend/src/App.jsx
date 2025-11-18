import { useEffect, useState } from "react";
import ListingTable from "./components/ListingTable";
import Analytics from "./components/Analytics";

function App() {
  const [currentView, setCurrentView] = useState("listings");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="
            fixed bottom-6 right-6
            h-12 w-12
            flex items-center justify-center
            p-3 rounded-full
          text-white text-xl
          bg-black/20 hover:bg-black/40
            shadow-lg
            opacity-40 hover:opacity-70
            transition
            focus:outline-none
            "
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default App;

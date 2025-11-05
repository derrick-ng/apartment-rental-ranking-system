import { useState, useEffect } from "react";
import api from "../api/client";

function ListingTable() {
  const [listings, setListings] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("-scraped_at");

  const activeFilters = [minPrice, maxPrice, location].filter(Boolean).length;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchListings();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [minPrice, maxPrice, location, sortBy]);

  const fetchListings = async () => {
    setError(null);
    setInitialLoading(false);

    try {
      const params = {};

      if (minPrice) params.price__gte = minPrice;
      if (maxPrice) params.price__lte = maxPrice;
      if (location) params.location__icontains = location;
      if (sortBy) params.ordering = sortBy;

      const response = await api.get("/listings/", { params });
      setListings(response.data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching listings:", err);
    }
  };

  const handleClearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setLocation("");
    setSortBy("-scraped_at");
  };

  if (initialLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading listings...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">SF Bay Area Rental Listings</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                placeholder="e.g. 2000"
                value={minPrice}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  setMinPrice(e.target.value);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                placeholder="e.g. 3000"
                value={maxPrice}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="Mission"
                value={location}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  setLocation(e.target.value);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  setSortBy(e.target.value);
                }}
              >
                <option value="-scraped_at">Newest First</option>
                <option value="scraped_at">Oldest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={activeFilters === 0}
          >
            Clear Filters {activeFilters > 0 && `(${activeFilters})`}
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">Found {listings.length} listings</p>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No listings found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{listing.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">${listing.price?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{listing.location}</td>
                    <td className="px-6 py-4 text-sm">
                      <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListingTable;

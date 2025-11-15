import { useState, useEffect } from "react";
import api from "../api/client";

function ListingTable() {
  const [listings, setListings] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("-scraped_at");

  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [petsAllowed, setPetsAllowed] = useState("any");
  const [laundryType, setLaundryType] = useState("");
  const [parkingType, setParkingType] = useState("");

  const activeFilters = [minPrice, maxPrice, location, bedrooms, bathrooms, petsAllowed !== "any", laundryType, parkingType].filter(Boolean).length;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchListings();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [minPrice, maxPrice, location, sortBy, bedrooms, bathrooms, petsAllowed, laundryType, parkingType]);

  const fetchListings = async () => {
    setError(null);
    setInitialLoading(false);
    try {
      const params = {};
      if (minPrice) params.price__gte = minPrice;
      if (maxPrice) params.price__lte = maxPrice;
      if (location) params.location__icontains = location;
      if (sortBy) params.ordering = sortBy;

      if (bedrooms) params.bedrooms__gte = bedrooms;
      if (bathrooms) params.bathrooms__gte = bathrooms;
      if (petsAllowed === "cats") params.cats_allowed = true;
      if (petsAllowed === "dogs") params.dogs_allowed = true;
      if (petsAllowed === "both") {
        params.cats_allowed = true;
        params.dogs_allowed = true;
      }
      if (laundryType) params.laundry_type = laundryType;
      if (parkingType) params.parking = parkingType;

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

    setBedrooms("");
    setBathrooms("");
    setPetsAllowed("any");
    setLaundryType("");
    setParkingType("");
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                placeholder="e.g. 2000"
                value={minPrice}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                placeholder="e.g. 3000"
                value={maxPrice}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="Mission"
                value={location}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="-scraped_at">Newest First</option>
                <option value="scraped_at">Oldest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Bedrooms</label>
              <select
                value={bedrooms}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setBedrooms(e.target.value)}
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Bathrooms</label>
              <select
                value={bathrooms}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setBathrooms(e.target.value)}
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="1.5">1.5+</option>
                <option value="2">2+</option>
                <option value="2.5">2.5+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pets</label>
              <select
                value={petsAllowed}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setPetsAllowed(e.target.value)}
              >
                <option value="any">Any</option>
                <option value="cats">Cats OK</option>
                <option value="dogs">Dogs OK</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Laundry</label>
              <select
                value={laundryType}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setLaundryType(e.target.value)}
              >
                <option value="">Any</option>
                <option value="in_unit">In Unit</option>
                <option value="on_site">On Site</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
              <select
                value={parkingType}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setParkingType(e.target.value)}
              >
                <option value="">Any</option>
                <option value="garage">Garage</option>
                <option value="off_street">Off Street</option>
                <option value="carport">Carport</option>
                <option value="street">Street</option>
                <option value="none">None</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listings.map((listing) => (
                  <>
                    <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{listing.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">${listing.price?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{listing.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {listing.bedrooms !== null ? (
                          <div className="flex items-center gap-2">
                            <span>
                              {listing.bedrooms}BR / {listing.bathrooms}BA
                              {listing.sqft && ` • ${listing.sqft}sqft`}
                            </span>
                            <button
                              onClick={() => toggleExpand(listing.id)}
                              className="text-blue-600 hover:text-blue-800 font-bold text-lg leading-none"
                            >
                              {expandedId === listing.id ? "▼" : "▶"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No details</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
                          View →
                        </a>
                      </td>
                    </tr>

                    {expandedId === listing.id && (
                      <tr key={`${listing.id}-details`}>
                        <td colSpan="5" className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                          <div className="space-y-3">
                            {listing.address && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Address:</span>
                                <span className="text-gray-600"> {listing.address}</span>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-6 text-sm">
                              <div>
                                <span className="font-semibold text-gray-700">Pets Allowed:</span>
                                {listing.cats_allowed && listing.dogs_allowed && <span className="ml-2">Cats & Dogs</span>}
                                {listing.cats_allowed && !listing.dogs_allowed && <span className="ml-2">Cats</span>}
                                {!listing.cats_allowed && listing.dogs_allowed && <span className="ml-2">Dogs</span>}
                                {!listing.cats_allowed && !listing.dogs_allowed && <span className="ml-2">None</span>}
                              </div>
                              {listing.laundry_type && (
                                <div>
                                  <span className="font-semibold text-gray-700">Laundry:</span>
                                  <span className="text-gray-600 capitalize"> {listing.laundry_type.replace("_", " ")}</span>
                                </div>
                              )}

                              {listing.parking && (
                                <div>
                                  <span className="font-semibold text-gray-700">Parking:</span>
                                  <span className="text-gray-600 capitalize"> {listing.parking.replace("_", " ")}</span>
                                </div>
                              )}
                            </div>

                            {listing.extra_amenities && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Amenities:</span>
                                <span className="text-gray-600"> {listing.extra_amenities}</span>
                              </div>
                            )}

                            {listing.data_quality && (
                              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">Data Quality Score: {listing.data_quality}</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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

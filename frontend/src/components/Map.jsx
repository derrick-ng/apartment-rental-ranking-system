import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import api from "../api/client";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Map() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [listings, minPrice, maxPrice, bedrooms]);

  const fetchListings = async () => {
    try {
      const response = await api.get("/listings/", {
        params: {
          active: true,
          latitude__isnull: false,
        },
      });
      setListings(response.data);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];

    if (minPrice) {
      filtered = filtered.filter((l) => l.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((l) => l.price <= parseInt(maxPrice));
    }
    if (bedrooms) {
      filtered = filtered.filter((l) => l.bedrooms >= parseInt(bedrooms));
    }

    setFilteredListings(filtered);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">No listings with location data available yet.</div>
      </div>
    );
  }

  const sfCenter = [37.7749, -122.4194];
  const activeFilters = [minPrice, maxPrice, bedrooms].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Map View</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                placeholder="e.g. 2000"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                placeholder="e.g. 4000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                disabled={activeFilters === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Filters {activeFilters > 0 && `(${activeFilters})`}
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredListings.length} of {listings.length} listings
        </p>

        {/* Leaflet Map */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: "600px" }}>
          <MapContainer center={sfCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={(cluster) => {
                const count = cluster.getChildCount();
                let size = "small";
                let sizeClass = "w-10 h-10 text-sm";

                if (count > 50) {
                  size = "large";
                  sizeClass = "w-14 h-14 text-base";
                } else if (count > 10) {
                  size = "medium";
                  sizeClass = "w-12 h-12 text-sm";
                }

                return L.divIcon({
                  html: `
                    <div class="flex items-center justify-center ${sizeClass} bg-blue-600 text-white rounded-full border-4 border-white shadow-lg font-bold cursor-pointer hover:bg-blue-700 transition-colors">
                        ${count}
                    </div>`,
                  className: "custom-cluster-icon",
                  iconSize: L.point(40, 40, true),
                });
              }}
            >
              {filteredListings.map((listing) => {
                if (!listing.latitude || !listing.longitude) return null;

                return (
                  <Marker key={listing.id} position={[parseFloat(listing.latitude), parseFloat(listing.longitude)]}>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900 mb-1">{listing.title}</div>
                        <div className="text-lg font-bold text-blue-600 mb-1">${listing.price.toLocaleString()}</div>
                        {listing.bedrooms && (
                          <div className="text-gray-600 text-xs mb-1">
                            {listing.bedrooms}BR / {listing.bathrooms}BA
                            {listing.sqft && ` • ${listing.sqft} sqft`}
                          </div>
                        )}
                        <div className="text-gray-500 text-xs mb-2">{listing.location}</div>
                        <a
                          href={listing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          View Listing →
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

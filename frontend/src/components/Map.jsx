import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Map View ({filteredListings.length} of {listings.length} listings)
          </h1>

          {/* Filters */}
          <div className="border-t border-gray-200 px-0 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder="e.g. 4000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  disabled={!minPrice && !maxPrice && !bedrooms}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="flex-1 relative">
        <MapContainer center={sfCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

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
                    <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                      View Listing →
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

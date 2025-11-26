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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await api.get("/listings/", {
        params: {
          active: true,
          latitude__isnull: false,
        },
      });
      setListings(response.data);
    } catch (error) {
      console.error("Error fetching listings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
    <div className="h-screen bg-gray-50">
      <div className="h-full flex flex-col">
        <div className="bg-white shadow-sm px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Map View ({listings.length} listings)</h1>
        </div>

        <div className="flex-1 relative">
          <MapContainer center={sfCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy;<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {listings.map((listing) => {
              if (!listing.latitude || !listing.longitude) {
                return null;
              }

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
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

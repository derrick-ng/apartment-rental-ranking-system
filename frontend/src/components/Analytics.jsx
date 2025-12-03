import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/client";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [showPriceDistribution, setShowPriceDistribution] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/listings/analytics/");
      setData(response.data);
    } catch (err) {
      console.error("Error fetching analytics", err);
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error ? `Error: ${error}` : "No analytics data available."}</div>
      </div>
    );
  }

  const totalListings = data.overall?.total_listings || 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Market Analytics</h1>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 uppercase">Total Listings</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{data.overall.total_listings}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 uppercase">Avg Price</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">${data.overall.avg_price.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 uppercase">Neighborhoods</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{data.overall.locations_count}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 uppercase">With Full Amenities</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{data.overall.with_details}</div>
          </div>
        </div>

        {/* Neighborhood Stats */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <button
            type="button"
            onClick={() => setShowNeighborhoods((prev) => !prev)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="text-xl font-bold text-gray-900">Neighborhood Comparison</span>
            <span className="text-gray-500 text-sm">{showNeighborhoods ? "Hide" : "Show"}</span>
          </button>

          {showNeighborhoods && (
            <div className="border-t border-gray-200 p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Range</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Sqft</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.neighborhoods.map((neighborhood) => (
                      <tr key={neighborhood.location} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{neighborhood.location}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{neighborhood.listing_count}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          $
                          {Number(neighborhood.avg_price ?? 0)
                            .toFixed(0)
                            .toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          ${neighborhood.min_price?.toLocaleString()} - ${neighborhood.max_price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {neighborhood.avg_sqft ? `${neighborhood.avg_sqft.toFixed(0)} sqft` : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Price Distribution */}
        <div className="bg-white rounded-lg shadow-sm">
          <button
            type="button"
            onClick={() => setShowPriceDistribution((prev) => !prev)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="text-xl font-bold text-gray-900">Price Distribution</span>
            <span className="text-gray-500 text-sm">{showPriceDistribution ? "Hide" : "Show"}</span>
          </button>

          {showPriceDistribution && (
            <div className="border-t border-gray-200 p-6">
              <div className="space-y-3">
                {data.price_distribution.map((bucket, index) => (
                  <div key={bucket.range ?? index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{bucket.range}</span>
                      <span className="text-gray-500">{bucket.count} listings</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{
                          width: `${(bucket.count / totalListings) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm mt-6">
          <button
            type="button"
            onClick={() => setShowCharts((prev) => !prev)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="text-xl font-bold text-gray-900">Visual Charts</span>
            <span className="text-gray-500 text-sm">{showCharts ? "Hide" : "Show"}</span>
          </button>

          {showCharts && (
            <div className="border-t border-gray-200 p-6 space-y-8">
              {/* Price by Neighborhood Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Price by Neighborhood</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.neighborhoods.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" angle={-45} textAnchor="end" height={100} />
                    <YAxis label={{ value: "Price ($)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="avg_price" fill="#3b82f6" name="Avg Price" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Listing Count by Neighborhood */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Listing Count by Neighborhood</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.neighborhoods.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" angle={-45} textAnchor="end" height={100} />
                    <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="listing_count" fill="#10b981" name="Listings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Price Distribution Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Distribution</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.price_distribution} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                    <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" name="Listings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

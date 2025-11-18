import { useState, useEffect } from "react";
import api from "../api/client";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/listings/analytics/");
      setData(response.data);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading analytics...</div>
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

        {/* Good Deals */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Best Deals (Below Market)</h2>
          {data.good_deals.length === 0 ? (
            <p className="text-gray-500">No deals found yet. Check back after more data is collected!</p>
          ) : (
            <div className="space-y-3">
              {data.good_deals.slice(0, 10).map((deal) => (
                <a href={deal.url} target="_blank">
                  <div key={deal.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{deal.title}</div>
                        <div className="text-sm text-gray-500">{deal.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">${deal.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Avg: ${deal.avg_price.toLocaleString()}</div>
                        <div className="text-xs font-medium text-green-600">
                          Save ${deal.savings.toLocaleString()} ({deal.savings_percent}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Neighborhood Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Neighborhood Comparison</h2>
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
                {data.neighborhoods.map((neighborhood, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{neighborhood.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{neighborhood.listing_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${neighborhood.avg_price?.toFixed(0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      ${neighborhood.min_price?.toLocaleString()} - ${neighborhood.max_price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{neighborhood.avg_sqft ? `${neighborhood.avg_sqft.toFixed(0)} sqft` : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Price Distribution</h2>
          <div className="space-y-3">
            {data.price_distribution.map((bucket, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{bucket.range}</span>
                  <span className="text-gray-500">{bucket.count} listings</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{
                      width: `${(bucket.count / data.overall.total_listings) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

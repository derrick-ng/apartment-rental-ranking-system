import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../api/client";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("/listings/analytics");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard analytics", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error ? `Error: ${error}` : "No data available."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Summary Stats */}
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

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Price by Neighborhood */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Price by Neighborhood</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.neighborhoods.slice(0, 10)} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar dataKey="avg_price" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Listing Count by Neighborhood */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Listing Count by Neighborhood</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.neighborhoods.slice(0, 10)} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="listing_count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Price Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.price_distribution} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bedroom Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bedroom Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(() => {
                    const bedroomCounts = {};
                    data.neighborhoods.forEach((neighborhood) => {
                      const br = Math.round(neighborhood.median_bedrooms || 0);
                      bedroomCounts[br] = (bedroomCounts[br] || 0) + neighborhood.listing_count;
                    });

                    return Object.entries(bedroomCounts).map(([bedrooms, count]) => ({
                      name: `${bedrooms} BR`,
                      value: count,
                    }));
                  })()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Cell key={`cell-${index}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"][index % 6]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Price vs Sqft Scatter */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price vs Square</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="avg_sqft"
                  name="Sqft"
                  label={{
                    value: "Square Feet",
                    position: "insideBottom",
                    offset: -5,
                  }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="avg_price"
                  name="Price"
                  label={{
                    value: "Price ($)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;

                    const p = payload[0].payload;

                    return (
                      <div style={{ background: "white", padding: "8px", borderRadius: "4px" }}>
                        <div style={{ fontWeight: "600", marginBottom: "4px" }}>{p.location}</div>
                        <div>Price: ${p.avg_price.toLocaleString()}</div>
                        <div>Sqft: {p.avg_sqft.toLocaleString()} sqft</div>
                      </div>
                    );
                  }}
                />
                <Scatter name="Neighborhoods" data={data.neighborhoods.filter((n) => n.avg_sqft && n.avg_price)} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Price Range Comparison */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range by Neighborhood</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.neighborhoods.slice(0, 8)} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="min_price" fill="#10b981" name="Min" />
                <Bar dataKey="max_price" fill="#ef4444" name="Max" />
                <Bar dataKey="avg_price" fill="#3b82f6" name="Avg" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import api from "../api/client";

function ListingTable() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("-scraped_at");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchListings();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [minPrice, maxPrice, location, sortBy]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setLocation("");
    setSortBy("-scraped_at");
  };

  if (loading) return <div>Loading listings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>SF Bay Area Rental Listings</h1>
      <div>
        <div>
          <label>Min Price</label>
          <input
            type="number"
            placeholder="e.g. 2000"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
            }}
          />
        </div>

        <div>
          <label>Max Price</label>
          <input
            type="number"
            placeholder="e.g. 3000"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
            }}
          />
        </div>

        <div>
          <label>Location</label>
          <input
            type="text"
            placeholder="Mission"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
            }}
          />
        </div>

        <div>
          <label>Sort By</label>
          <select
            value={sortBy}
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

        <button onClick={handleClearFilters}>Clear Filters</button>
      </div>

      <p>Found {listings.length} listings</p>

      <div>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Location</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td>{listing.title}</td>
                <td>${listing.price}</td>
                <td>{listing.location}</td>
                <td>
                  <a href={listing.url} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListingTable;

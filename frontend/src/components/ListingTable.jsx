import { useState, useEffect } from "react";
import api from "../api/client";

function ListingTable() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/listings/");
      setListings(response.data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading listings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1> SF Bay Area Rental Listings</h1>
      <p>Found {listings.length} listings</p>

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
  );
}

export default ListingTable;

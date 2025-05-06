import React, { useState, useEffect } from 'react';

export default function OrganizerRSVPReport() {
  const [screenings, setScreenings] = useState([]);
  const [selectedScreening, setSelectedScreening] = useState('');
  const [rsvpData, setRsvpData] = useState([]);
  const [error, setError] = useState('');

  // Fetch all screenings on mount to populate the dropdown
  useEffect(() => {
    async function fetchScreenings() {
      try {
        const res = await fetch('/screenings');
        if (res.ok) {
          const data = await res.json();
          setScreenings(data);
        } else {
          console.error('Failed to fetch screenings.');
        }
      } catch (err) {
        console.error('Error fetching screenings:', err);
      }
    }
    fetchScreenings();
  }, []);

  // Function to fetch RSVP data for a selected screening
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScreening) {
      setError("Please select a screening.");
      return;
    }
    setError('');
    try {
      const res = await fetch(`/screenings/${selectedScreening}/rsvps`);
      if (res.ok) {
        const data = await res.json();
        setRsvpData(data);
      } else {
        setError("Failed to fetch RSVP data.");
      }
    } catch (err) {
      console.error("Error fetching RSVP data:", err);
      setError("An error occurred while fetching RSVP data.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Screening RSVP Report</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <label htmlFor="screening">Select Screening: </label>
        <select
          id="screening"
          value={selectedScreening}
          onChange={(e) => setSelectedScreening(e.target.value)}
          required
          style={{ marginLeft: 10 }}
        >
          <option value="">-- Select a screening --</option>
          {screenings.map((screening) => {
            // Format screening_date (assuming it's an ISO string)
            const formattedDate = new Date(screening.screening_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });
            return (
              <option key={screening.id} value={screening.id}>
                {screening.movie_title} at {screening.venue_name} on {formattedDate} at {screening.screening_time}
              </option>
            );
          })}
        </select>
        <button type="submit" style={{ marginLeft: 10 }}>Submit</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {rsvpData.length > 0 ? (
        <div>
          <h3>RSVP Details:</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>User Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {rsvpData.map((rsvp) => (
                <tr key={`${rsvp.screening_id}-${rsvp.user_id}`}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rsvp.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rsvp.email}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(rsvp.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No RSVP records found for the selected screening.</p>
      )}
    </div>
  );
}

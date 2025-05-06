import React, { useState, useEffect } from 'react';

export default function ScreeningReport() {
  const [venues, setVenues]       = useState([]);
  const [genres, setGenres]       = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [venueId, setVenueId]     = useState('');
  const [genre, setGenre]         = useState('');
  const [report, setReport]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Fetch venues + genres on mount
  useEffect(() => {
    fetch('/venues')
      .then(r => r.json())
      .then(setVenues)
      .catch(() => {/* ignore */});

    fetch('/movies')
      .then(r => r.json())
      .then(data => {
        const uniq = [...new Set(data.map(m => m.genre))];
        setGenres(uniq);
      })
      .catch(() => {/* ignore */});
  }, []);

  const generateReport = () => {
    setLoading(true);
    setError('');
    setReport([]);

    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate)   params.append('end_date', endDate);
    if (venueId)   params.append('venue_id', venueId);
    if (genre)     params.append('genre', genre);

    fetch(`/reports/screenings?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => setReport(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="filter-container">
      <h2>Screening Report</h2>

      <label>
        Start Date
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
      </label>

      <label>
        End Date
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
      </label>

      <label>
        Venue
        <select
          value={venueId}
          onChange={e => setVenueId(e.target.value)}
        >
          <option value="">All Venues</option>
          {venues.map(v => (
            <option key={v.venue_id} value={v.venue_id}>
              {v.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Genre
        <select
          value={genre}
          onChange={e => setGenre(e.target.value)}
        >
          <option value="">All Genres</option>
          {genres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>

      <button onClick={generateReport}>
        Generate Report
      </button>

      {/* status messages */}
      {loading && <p>Loading report…</p>}
      {error   && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* no results */}
      {!loading && !error && report.length === 0 && (
        <p>No screenings match those criteria.</p>
      )}

      {/* results table */}
      {report.length > 0 && (
        <table style={{ marginTop: 20, width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Venue</th>
              <th>Movie</th>
              <th>Genre</th>
            </tr>
          </thead>
          <tbody>
            {report.map((r, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{r.screening_date}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{r.screening_time}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{r.venue_name}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{r.movie_title}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{r.genre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


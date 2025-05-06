
import React, { useState, useEffect } from 'react';

export default function DetailedScreeningReport() {
  const [venues,    setVenues]    = useState([]);
  const [genres,    setGenres]    = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [venueId,   setVenueId]   = useState('');
  const [genre,     setGenre]     = useState('');
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  // Load venues + genres for filters
  useEffect(() => {
    fetch('/venues').then(r=>r.json()).then(setVenues).catch(console.error);
    fetch('/movies')
      .then(r=>r.json())
      .then(data => setGenres([...new Set(data.map(m=>m.genre))]))
      .catch(console.error);
  }, []);

  const generateReport = () => {
    setLoading(true);
    setError('');
    setStats(null);

    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate)   params.append('end_date',   endDate);
    if (venueId)   params.append('venue_id',   venueId);
    if (genre)     params.append('genre',      genre);

    fetch(`/reports/detailedscreeningreport?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server ${res.status}`);
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="filter-container">
      <h2>Detailed Screening Report</h2>

      {/* filter inputs */}
      <label>Start Date<br/>
        <input type="date" value={startDate}
               onChange={e=>setStartDate(e.target.value)}/>
      </label>

      <label>End Date<br/>
        <input type="date" value={endDate}
               onChange={e=>setEndDate(e.target.value)}/>
      </label>

      <label>Venue<br/>
        <select value={venueId}
                onChange={e=>setVenueId(e.target.value)}>
          <option value="">All Venues</option>
          {venues.map(v=>(
            <option key={v.venue_id} value={v.venue_id}>{v.name}</option>
          ))}
        </select>
      </label>

      <label>Genre<br/>
        <select value={genre}
                onChange={e=>setGenre(e.target.value)}>
          <option value="">All Genres</option>
          {genres.map(g=>(
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>

      <button onClick={generateReport}>Generate Report</button>

      {/* status */}
      {loading && <p>Loading…</p>}
      {error   && <p style={{color:'red'}}>Error: {error}</p>}

      {/* render stats object */}
      {stats && !loading && !error && (
        <div style={{marginTop:20}}>
          <h3>Statistics</h3>
          <p><strong>Total Screenings:</strong> {stats.total_screenings}</p>
          <p><strong>Total RSVPs:</strong>      {stats.total_rsvps}</p>
          <p><strong>Avg. Duration:</strong>   {stats.avg_duration} minutes</p>
          <p><strong>Occupancy Rate:</strong>   {stats.occupancy_rate}%</p>
        </div>
      )}
    </div>
  );
}

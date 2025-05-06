import React, { useState, useEffect } from 'react';

export default function PopularityGenreReport() {
  const [genres,    setGenres]    = useState([]);
  const [filter,    setFilter]    = useState('');
  const [popularity, setPopularity] = useState([]);
  const [genreAnalysis, setGenreAnalysis] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  // Load all genres for the dropdown
  useEffect(() => {
    fetch('/movies')
      .then(r => r.json())
      .then(data => {
        const uniq = [...new Set(data.map(m => m.genre))];
        setGenres(uniq);
      })
      .catch(console.error);
  }, []);

  const generateReport = () => {
    setLoading(true);
    setError('');
    setPopularity([]);
    setGenreAnalysis([]);

    const params = new URLSearchParams();
    if (filter) params.append('genre', filter);

    fetch(`/reports/popularity-genre?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server ${res.status}`);
        return res.json();
      })
      .then(data => {
        setPopularity(data.popularity);
        setGenreAnalysis(data.genre_analysis);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="filter-container">
      <h2>Film Popularity and Genre Breakdown Report</h2>

      <label>
        Film Genre<br/>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All Genres</option>
          {genres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>

      <button onClick={generateReport}>Generate Report</button>

      {loading && <p>Loading report…</p>}
      {error   && <p style={{color:'red'}}>Error: {error}</p>}

      <h3>Film Popularity Report</h3>
      {popularity.length === 0 ? (
        <p>No data available for Film Popularity Report.</p>
      ) : (
        <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:20 }}>
          <thead>
            <tr>
              <th style={th}>Movie Title</th>
              <th style={th}>Director</th>
              <th style={th}>Genre</th>
              <th style={th}>Screenings Count</th>
              <th style={th}>Average Attendance</th>
            </tr>
          </thead>
          <tbody>
            {popularity.map((r,i) => (
              <tr key={i}>
                <td style={td}>{r.movie_title}</td>
                <td style={td}>{r.director}</td>
                <td style={td}>{r.genre}</td>
                <td style={td}>{r.screenings_count}</td>
                <td style={td}> {(r.average_attendance ?? 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Genre Analysis</h3>
      {genreAnalysis.length === 0 ? (
        <p>No data available for Genre Analysis.</p>
      ) : (
        <table style={{ width:'60%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Genre</th>
              <th style={th}>Total Screenings</th>
              <th style={th}>Average Attendance</th>
            </tr>
          </thead>
          <tbody>
            {genreAnalysis.map((r,i) => (
              <tr key={i}>
                <td style={td}>{r.genre}</td>
                <td style={td}>{r.total_screenings}</td>
                <td style={td}>{(r.average_attendance ?? 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Table cell styles
const th = {
  border: '1px solid #333', padding: '8px', background: '#eee'
};
const td = {
  border: '1px solid #333', padding: '8px'
};


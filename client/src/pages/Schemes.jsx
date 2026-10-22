import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Schemes() {
  const [schemes, setSchemes] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/schemes', {
          params: { search: search || undefined, category: category || undefined, limit: 50 },
        });
        setSchemes(data.schemes);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load schemes');
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Browse schemes</h1>
        <p className="muted">Explore available government welfare schemes by category or keyword.</p>
      </header>

      <div className="filters-bar">
        <label className="grow">
          Search
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="PM-KISAN, housing, scholarship…"
          />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            <option value="education">Education</option>
            <option value="employment">Employment</option>
            <option value="health">Health</option>
            <option value="agriculture">Agriculture</option>
            <option value="housing">Housing</option>
            <option value="women">Women</option>
            <option value="senior-citizen">Senior citizen</option>
            <option value="financial">Financial</option>
            <option value="social-welfare">Social welfare</option>
            <option value="skill-development">Skill development</option>
          </select>
        </label>
      </div>

      {loading && <div className="page-loader">Loading schemes…</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="scheme-grid">
        {schemes.map((scheme) => (
          <Link key={scheme._id} to={`/schemes/${scheme._id}`} className="scheme-tile">
            <span className="tile-cat">{scheme.category.replace('-', ' ')}</span>
            <h2>{scheme.shortName || scheme.name}</h2>
            <p>{scheme.description.slice(0, 140)}…</p>
            <span className="tile-dept">{scheme.department}</span>
          </Link>
        ))}
      </div>

      {!loading && schemes.length === 0 && (
        <p className="muted">No schemes found. Try a different search.</p>
      )}
    </div>
  );
}

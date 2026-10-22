import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

const statusLabel = {
  highly_eligible: 'Highly eligible',
  eligible: 'Eligible',
  partially_eligible: 'Partial match',
  incomplete_profile: 'Needs more info',
  not_eligible: 'Not eligible',
};

export default function Recommendations() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [includeIneligible, setIncludeIneligible] = useState(false);
  const [category, setCategory] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { includeIneligible: String(includeIneligible) };
      if (category) params.category = category;
      const res = await api.get('/recommend', { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recommendations');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.profileComplete) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, includeIneligible, category]);

  if (!user?.profileComplete) {
    return (
      <div className="page narrow">
        <h1>Recommendations</h1>
        <div className="alert alert-warn">
          Complete your citizen profile first so we can check eligibility.
        </div>
        <Link to="/profile" className="btn btn-primary">
          Complete profile
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Your scheme matches</h1>
        <p className="muted">
          Ranked by AI eligibility scoring against your profile — highest relevance first.
        </p>
      </header>

      <div className="filters-bar">
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
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
        <label className="check">
          <input
            type="checkbox"
            checked={includeIneligible}
            onChange={(e) => setIncludeIneligible(e.target.checked)}
          />
          Include not eligible
        </label>
        <button type="button" className="btn btn-secondary btn-sm" onClick={load}>
          Refresh
        </button>
      </div>

      {loading && <div className="page-loader">Analyzing eligibility…</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {data && (
        <>
          <div className="summary-strip">
            <div>
              <span className="stat-num">{data.summary.totalSchemesChecked}</span>
              <span className="stat-label">Schemes checked</span>
            </div>
            <div>
              <span className="stat-num">{data.summary.highlyEligible}</span>
              <span className="stat-label">Highly eligible</span>
            </div>
            <div>
              <span className="stat-num">{data.summary.eligible}</span>
              <span className="stat-label">Eligible</span>
            </div>
            <div>
              <span className="stat-num">{data.summary.partiallyEligible}</span>
              <span className="stat-label">Partial</span>
            </div>
          </div>

          <div className="rec-list">
            {data.recommendations.length === 0 && (
              <p className="muted">No matching schemes for the current filters.</p>
            )}
            {data.recommendations.map((item) => (
              <article key={item.scheme._id} className="rec-item">
                <div className="rec-rank">#{item.rank}</div>
                <div className="rec-body">
                  <div className="rec-top">
                    <h2>
                      <Link to={`/schemes/${item.scheme._id}`}>
                        {item.scheme.shortName || item.scheme.name}
                      </Link>
                    </h2>
                    <span className={`badge status-${item.eligibilityStatus}`}>
                      {statusLabel[item.eligibilityStatus]}
                    </span>
                  </div>
                  <p className="rec-name">{item.scheme.name}</p>
                  <div className="score-row">
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${item.matchScore}%` }} />
                    </div>
                    <span className="score-text">{item.matchScore}% match</span>
                  </div>
                  <p className="ai-summary">{item.aiSummary}</p>
                  {item.matchedCriteria?.length > 0 && (
                    <ul className="reason-list positive">
                      {item.matchedCriteria.slice(0, 3).map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  )}
                  {item.failedCriteria?.length > 0 && (
                    <ul className="reason-list negative">
                      {item.failedCriteria.slice(0, 2).map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  )}
                  <Link to={`/schemes/${item.scheme._id}`} className="text-link">
                    View scheme details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

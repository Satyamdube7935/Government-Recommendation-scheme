import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function SchemeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [scheme, setScheme] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/schemes/${id}`);
        setScheme(data.scheme);
        setError('');

        if (user) {
          try {
            const check = await api.get(`/recommend/check/${id}`);
            setEligibility(check.data.result);
          } catch {
            setEligibility(null);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Scheme not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  if (loading) return <div className="page-loader">Loading…</div>;
  if (error) {
    return (
      <div className="page narrow">
        <div className="alert alert-error">{error}</div>
        <Link to="/schemes">← Back to schemes</Link>
      </div>
    );
  }

  const e = scheme.eligibility || {};

  return (
    <div className="page narrow">
      <Link to="/schemes" className="back-link">
        ← All schemes
      </Link>
      <header className="page-header">
        <span className="tile-cat">{scheme.category.replace('-', ' ')}</span>
        <h1>{scheme.name}</h1>
        {scheme.shortName && <p className="muted">{scheme.shortName}</p>}
        <p className="tile-dept">{scheme.department}</p>
      </header>

      {eligibility && (
        <section className="elig-box">
          <h2>Your eligibility</h2>
          <div className="score-row">
            <div className="score-bar">
              <div className="score-fill" style={{ width: `${eligibility.matchScore}%` }} />
            </div>
            <span className="score-text">{eligibility.matchScore}% · {eligibility.eligibilityStatus.replace(/_/g, ' ')}</span>
          </div>
          <p className="ai-summary">{eligibility.aiSummary}</p>
        </section>
      )}

      {!user && (
        <div className="alert alert-warn">
          <Link to="/login">Sign in</Link> and complete your profile to check personal eligibility.
        </div>
      )}

      <section className="detail-block">
        <h2>About</h2>
        <p>{scheme.description}</p>
      </section>

      <section className="detail-block">
        <h2>Benefits</h2>
        <p>{scheme.benefits}</p>
      </section>

      <section className="detail-block">
        <h2>Eligibility criteria</h2>
        <ul className="criteria-list">
          {(e.minAge != null || e.maxAge != null) && (
            <li>
              Age: {e.minAge ?? 0} – {e.maxAge ?? 'any'}
            </li>
          )}
          {e.genders?.length > 0 && <li>Gender: {e.genders.join(', ')}</li>}
          {e.categories?.length > 0 && <li>Category: {e.categories.join(', ')}</li>}
          {e.maxAnnualIncome != null && (
            <li>Max annual income: ₹{e.maxAnnualIncome.toLocaleString('en-IN')}</li>
          )}
          {e.occupations?.length > 0 && <li>Occupation: {e.occupations.join(', ')}</li>}
          {e.educationLevels?.length > 0 && <li>Education: {e.educationLevels.join(', ')}</li>}
          {e.areaTypes?.length > 0 && <li>Area: {e.areaTypes.join(', ')}</li>}
          {e.maritalStatuses?.length > 0 && <li>Marital status: {e.maritalStatuses.join(', ')}</li>}
          {e.requiresBPL && <li>Requires BPL status</li>}
          {e.requiresDisability && <li>Requires disability certificate</li>}
          {e.requiresBankAccount && <li>Bank account required</li>}
          {e.requiresAadhaar && <li>Aadhaar required</li>}
        </ul>
      </section>

      <section className="detail-block">
        <h2>Documents required</h2>
        <ul>
          {scheme.documentsRequired?.map((doc) => (
            <li key={doc}>{doc}</li>
          ))}
        </ul>
      </section>

      <section className="detail-block">
        <h2>How to apply</h2>
        <p>{scheme.applicationProcess}</p>
        {scheme.officialLink && (
          <a href={scheme.officialLink} target="_blank" rel="noreferrer" className="btn btn-secondary">
            Official website
          </a>
        )}
      </section>
    </div>
  );
}

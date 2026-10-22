import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">AI-powered welfare discovery</p>
          <h1 className="brand-hero">SchemeFind</h1>
          <p className="hero-lead">
            Match your profile against government scheme eligibility criteria and get ranked
            recommendations — clearly explained.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/recommendations" className="btn btn-primary">
                  View My Matches
                </Link>
                <Link to="/profile" className="btn btn-secondary">
                  Update Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Check Eligibility
                </Link>
                <Link to="/schemes" className="btn btn-secondary">
                  Browse Schemes
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section how-it-works">
        <h2>How it works</h2>
        <p className="section-lead">Three steps from profile to ranked scheme matches.</p>
        <ol className="steps">
          <li>
            <strong>Create your profile</strong>
            <span>Share age, income, category, occupation, and location details.</span>
          </li>
          <li>
            <strong>AI eligibility check</strong>
            <span>Your profile is scored against each scheme’s criteria with weighted matching.</span>
          </li>
          <li>
            <strong>Ranked recommendations</strong>
            <span>See highly eligible schemes first, with clear reasons for each match.</span>
          </li>
        </ol>
      </section>
    </div>
  );
}

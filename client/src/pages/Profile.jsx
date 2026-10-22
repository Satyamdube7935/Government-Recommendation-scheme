import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
  'Other',
];

const emptyProfile = {
  fullName: '',
  age: '',
  gender: '',
  category: '',
  annualIncome: '',
  occupation: '',
  education: '',
  state: '',
  areaType: '',
  maritalStatus: '',
  disability: false,
  isBPL: false,
  hasBankAccount: true,
  aadhaarLinked: true,
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState(emptyProfile);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setForm({
        ...emptyProfile,
        ...user.profile,
        age: user.profile.age ?? '',
        annualIncome: user.profile.annualIncome ?? '',
      });
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        annualIncome: Number(form.annualIncome),
      };
      const { data } = await api.put('/users/profile', payload);
      setUser(data.user);
      setMessage(data.message || 'Profile saved');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page narrow">
      <header className="page-header">
        <h1>Citizen profile</h1>
        <p className="muted">
          Complete this form so the AI engine can check eligibility and rank schemes for you.
        </p>
        {user?.profileComplete ? (
          <span className="badge badge-success">Profile complete</span>
        ) : (
          <span className="badge badge-warn">Profile incomplete</span>
        )}
      </header>

      <form className="profile-form" onSubmit={onSubmit}>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-grid">
          <label>
            Full name
            <input name="fullName" value={form.fullName} onChange={onChange} required />
          </label>
          <label>
            Age
            <input
              type="number"
              name="age"
              min="0"
              max="120"
              value={form.age}
              onChange={onChange}
              required
            />
          </label>
          <label>
            Gender
            <select name="gender" value={form.gender} onChange={onChange} required>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Social category
            <select name="category" value={form.category} onChange={onChange} required>
              <option value="">Select</option>
              <option value="general">General</option>
              <option value="obc">OBC</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
              <option value="ews">EWS</option>
            </select>
          </label>
          <label>
            Annual income (₹)
            <input
              type="number"
              name="annualIncome"
              min="0"
              value={form.annualIncome}
              onChange={onChange}
              required
            />
          </label>
          <label>
            Occupation
            <select name="occupation" value={form.occupation} onChange={onChange} required>
              <option value="">Select</option>
              <option value="student">Student</option>
              <option value="farmer">Farmer</option>
              <option value="unemployed">Unemployed</option>
              <option value="salaried">Salaried</option>
              <option value="self-employed">Self-employed</option>
              <option value="homemaker">Homemaker</option>
              <option value="retired">Retired</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Education
            <select name="education" value={form.education} onChange={onChange} required>
              <option value="">Select</option>
              <option value="none">None / Illiterate</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="higher-secondary">Higher secondary</option>
              <option value="diploma">Diploma</option>
              <option value="graduate">Graduate</option>
              <option value="postgraduate">Postgraduate</option>
            </select>
          </label>
          <label>
            State
            <select name="state" value={form.state} onChange={onChange} required>
              <option value="">Select</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Area type
            <select name="areaType" value={form.areaType} onChange={onChange} required>
              <option value="">Select</option>
              <option value="rural">Rural</option>
              <option value="urban">Urban</option>
            </select>
          </label>
          <label>
            Marital status
            <select name="maritalStatus" value={form.maritalStatus} onChange={onChange}>
              <option value="">Select</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="widowed">Widowed</option>
              <option value="divorced">Divorced</option>
            </select>
          </label>
        </div>

        <div className="checkbox-row">
          <label className="check">
            <input type="checkbox" name="isBPL" checked={form.isBPL} onChange={onChange} />
            BPL card holder
          </label>
          <label className="check">
            <input type="checkbox" name="disability" checked={form.disability} onChange={onChange} />
            Person with disability
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="hasBankAccount"
              checked={form.hasBankAccount}
              onChange={onChange}
            />
            Has bank account
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="aadhaarLinked"
              checked={form.aadhaarLinked}
              onChange={onChange}
            />
            Aadhaar linked
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          {user?.profileComplete && (
            <Link to="/recommendations" className="btn btn-secondary">
              Get recommendations
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}

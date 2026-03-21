import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, User, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Settings.css';

export default function Settings() {
  const { state, addToast } = useApp();

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Settings saved successfully', 'success');
  };

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <div className="settings-page__title-wrap">
          <SettingsIcon size={24} className="settings-page__icon" />
          <h1 className="settings-page__title">Account Settings</h1>
        </div>
      </header>

      <div className="settings-page__content">
        <div className="settings-page__layout">
          {/* Sidebar Nav */}
          <div className="settings-nav">
            <button className="settings-nav__item settings-nav__item--active">
              <User size={18} /> Profile
            </button>
            <button className="settings-nav__item">
              <Bell size={18} /> Notifications
            </button>
            <button className="settings-nav__item">
              <CreditCard size={18} /> Billing
            </button>
            <button className="settings-nav__item">
              <Shield size={18} /> Security
            </button>
          </div>

          {/* Form Area */}
          <motion.div
            className="settings-form-container glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="settings-form__title">Profile Information</h2>
            <p className="settings-form__desc">Update your account details and preferences.</p>

            <form className="settings-form" onSubmit={handleSave}>
              <div className="settings-form__row">
                <div className="settings-form__group">
                  <label>Full Name</label>
                  <input type="text" defaultValue={state.user?.name || ''} />
                </div>
                <div className="settings-form__group">
                  <label>Email Address</label>
                  <input type="email" defaultValue={state.user?.email || ''} />
                </div>
              </div>

              <div className="settings-form__group">
                <label>Company Name</label>
                <input type="text" defaultValue="Demo Construction Co." />
              </div>

              <div className="settings-form__divider" />

              <h3 className="settings-form__subtitle">Default Preferences</h3>

              <div className="settings-form__row">
                <div className="settings-form__group">
                  <label>Primary City</label>
                  <select defaultValue={state.selectedCity}>
                    <option value="san-francisco">San Francisco</option>
                    <option value="san-jose">San Jose</option>
                  </select>
                </div>
                <div className="settings-form__group">
                  <label>Primary Trade</label>
                  <select defaultValue={state.selectedContractorType || 'all'}>
                    <option value="all">All</option>
                    <option value="general">General Contractor</option>
                    <option value="electrician">Electrician</option>
                    <option value="plumber">Plumber</option>
                    <option value="hvac">HVAC</option>
                  </select>
                </div>
              </div>

              <div className="settings-form__actions">
                <button type="submit" className="btn btn-primary btn-lg">
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

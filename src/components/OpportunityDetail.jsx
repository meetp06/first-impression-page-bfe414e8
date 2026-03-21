import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Calendar, Link2, FileText, Shield, AlertTriangle,
  Bookmark, BookmarkCheck, Clock, ArrowRight, Building2,
  DollarSign, Search, Map, FileSearch
} from 'lucide-react';
import ConfidenceBadge from './ConfidenceBadge';
import VerificationBadge from './VerificationBadge';
import BidIntelligence from './BidIntelligence';
import ContactIntelligence from './ContactIntelligence';
import SiteMapView from './SiteMapView';
import { useApp } from '../context/AppContext';
import { CONTRACTOR_TYPES } from '../data/mockOpportunities';
import './OpportunityDetail.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'bid',      label: 'Bid Intel', icon: DollarSign },
  { id: 'contact',  label: 'Contacts',  icon: Search },
  { id: 'map',      label: 'Site View', icon: Map },
  { id: 'source',   label: 'Source',    icon: FileSearch },
];

export default function OpportunityDetail({ opportunity, isOpen, onClose }) {
  const { dispatch, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  if (!opportunity) return null;

  const handleSave = () => {
    dispatch({ type: 'TOGGLE_SAVE', payload: opportunity.id });
    addToast(
      opportunity.saved ? 'Removed from watchlist' : 'Saved to watchlist',
      opportunity.saved ? 'info' : 'success'
    );
  };

  const relevantTypes = CONTRACTOR_TYPES.filter((t) =>
    (opportunity.contractor_personas_relevant || []).includes(t.id)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="detail-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="detail-panel__header">
              <div className="detail-panel__header-badges">
                <ConfidenceBadge score={opportunity.confidence_score} size="lg" />
                <VerificationBadge status={opportunity.verification_status} size="lg" />
              </div>
              <button className="detail-panel__close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="detail-tabs">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`detail-tabs__tab ${activeTab === tab.id ? 'detail-tabs__tab--active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        className="detail-tabs__indicator"
                        layoutId="tab-indicator"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="detail-panel__body">
              {/* Title always visible */}
              <h2 className="detail-panel__title">{opportunity.title}</h2>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="detail-panel__tab-content"
                >
                  {activeTab === 'overview' && (
                    <OverviewTab opportunity={opportunity} relevantTypes={relevantTypes} />
                  )}
                  {activeTab === 'bid' && (
                    <BidIntelligence opportunity={opportunity} />
                  )}
                  {activeTab === 'contact' && (
                    <ContactIntelligence opportunity={opportunity} />
                  )}
                  {activeTab === 'map' && (
                    <SiteMapView opportunity={opportunity} />
                  )}
                  {activeTab === 'source' && (
                    <SourceTab opportunity={opportunity} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="detail-panel__footer">
              <button
                className={`btn ${opportunity.saved ? 'btn-secondary' : 'btn-primary'} btn-lg`}
                onClick={handleSave}
                style={{ flex: 1 }}
              >
                {opportunity.saved ? (
                  <><BookmarkCheck size={18} /> Saved to Watchlist</>
                ) : (
                  <><Bookmark size={18} /> Save to Watchlist</>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Overview Tab ── */
function OverviewTab({ opportunity, relevantTypes }) {
  return (
    <>
      <div className="detail-panel__meta-grid">
        <div className="detail-panel__meta-card">
          <MapPin size={16} />
          <div>
            <span className="detail-panel__meta-label">Address</span>
            <span className="detail-panel__meta-value">{opportunity.address}</span>
          </div>
        </div>
        <div className="detail-panel__meta-card">
          <Calendar size={16} />
          <div>
            <span className="detail-panel__meta-label">Timeline</span>
            <span className="detail-panel__meta-value">{opportunity.estimated_timeline}</span>
          </div>
        </div>
        <div className="detail-panel__meta-card">
          <FileText size={16} />
          <div>
            <span className="detail-panel__meta-label">Permit Type</span>
            <span className="detail-panel__meta-value">{opportunity.permit_type}</span>
          </div>
        </div>
        <div className="detail-panel__meta-card">
          <Clock size={16} />
          <div>
            <span className="detail-panel__meta-label">Project Stage</span>
            <span className="detail-panel__meta-value">{opportunity.project_stage}</span>
          </div>
        </div>
      </div>

      <div className="detail-panel__section">
        <h3 className="detail-panel__section-title">Project Summary</h3>
        <p className="detail-panel__text">{opportunity.project_summary}</p>
      </div>

      <div className="detail-panel__section">
        <h3 className="detail-panel__section-title">Relevant Contractor Types</h3>
        <div className="detail-panel__contractors">
          {relevantTypes.map((t) => (
            <div
              key={t.id}
              className="detail-panel__contractor-chip"
              style={{ '--chip-color': t.color }}
            >
              <Building2 size={14} />
              <span>{t.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-panel__section">
        <h3 className="detail-panel__section-title">
          <Shield size={16} />
          Verification Details
        </h3>
        <div className="detail-panel__verification-card">
          <VerificationBadge status={opportunity.verification_status} size="lg" />
          <p className="detail-panel__text">{opportunity.verification_notes}</p>
        </div>
      </div>

      <div className="detail-panel__section">
        <h3 className="detail-panel__section-title">Confidence Analysis</h3>
        <div className="detail-panel__confidence-bar">
          <div className="detail-panel__confidence-track">
            <motion.div
              className="detail-panel__confidence-fill"
              initial={{ width: 0 }}
              animate={{ width: `${opportunity.confidence_score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                background: opportunity.confidence_score >= 85 ? '#10b981'
                  : opportunity.confidence_score >= 70 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
          <span className="detail-panel__confidence-value">{opportunity.confidence_score}%</span>
        </div>
        <div className="detail-panel__confidence-reasons">
          <div className="detail-panel__reason">
            <ArrowRight size={12} />
            <span>Permit source verified: {opportunity.source_name}</span>
          </div>
          <div className="detail-panel__reason">
            <ArrowRight size={12} />
            <span>Project stage: {opportunity.project_stage}</span>
          </div>
          <div className="detail-panel__reason">
            <ArrowRight size={12} />
            <span>Extracted on: {opportunity.extracted_date}</span>
          </div>
        </div>
      </div>

      {(opportunity.risk_flags || []).length > 0 && (
        <div className="detail-panel__section">
          <h3 className="detail-panel__section-title detail-panel__section-title--warning">
            <AlertTriangle size={16} />
            Risk Flags
          </h3>
          <div className="detail-panel__risks">
            {opportunity.risk_flags.map((flag, i) => (
              <div key={i} className="detail-panel__risk-item">
                <AlertTriangle size={14} />
                <span>{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ── Source Tab ── */
function SourceTab({ opportunity }) {
  return (
    <div className="detail-panel__section">
      <h3 className="detail-panel__section-title">Source Documents</h3>
      <a
        href={opportunity.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="detail-panel__source-link"
      >
        <Link2 size={14} />
        <span>{opportunity.source_name}</span>
        <span className="detail-panel__source-type">{(opportunity.source_type || '').replace('_', ' ')}</span>
      </a>
      <div className="detail-panel__meta-card" style={{ marginTop: 'var(--space-3)' }}>
        <FileText size={16} />
        <div>
          <span className="detail-panel__meta-label">Permit Number</span>
          <span className="detail-panel__meta-value">{opportunity.permit_number || opportunity.id}</span>
        </div>
      </div>
      <div className="detail-panel__meta-card">
        <Calendar size={16} />
        <div>
          <span className="detail-panel__meta-label">Extracted Date</span>
          <span className="detail-panel__meta-value">{opportunity.extracted_date || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

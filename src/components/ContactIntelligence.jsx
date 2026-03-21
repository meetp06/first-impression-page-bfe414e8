import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Building2, Mail, Phone, Globe, MapPin, Shield, Linkedin,
  AlertTriangle, ArrowRight, Loader2, Sparkles, Search, CheckCircle2,
  PenTool, Copy, Check
} from 'lucide-react';
import { discoverContacts, draftContactEmail } from '../services/contactIntelligenceService';
import './ContactIntelligence.css';

export default function ContactIntelligence({ opportunity }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Email Drafter State
  const [emailDraft, setEmailDraft] = useState(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDiscover = async () => {
    setLoading(true);
    setError(null);
    setEmailDraft(null);
    try {
      const result = await discoverContacts(opportunity);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftEmail = async () => {
    setIsDrafting(true);
    try {
      const text = await draftContactEmail(opportunity, data.best_contact);
      setEmailDraft(text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrafting(false);
    }
  };

  const copyToClipboard = () => {
    if (emailDraft) {
      navigator.clipboard.writeText(emailDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!data && !loading && !error) {
    return (
      <div className="contact-intel__empty">
        <div className="contact-intel__empty-icon">
          <Search size={32} />
        </div>
        <h4>Contact Intelligence</h4>
        <p>Discover the best reachable contact for this project using public permit records and business databases.</p>
        <button className="btn btn-primary" onClick={handleDiscover}>
          <Sparkles size={16} />
          Find Contact
        </button>
        <span className="contact-intel__powered">Powered by Apify Actor Chain</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="contact-intel__loading">
        <Loader2 size={24} className="contact-intel__spinner" />
        <p>Discovering project contacts...</p>
        <div className="contact-intel__loading-steps">
          <span>→ Running compass/crawler-google-places actor</span>
          <span>→ Running lukaskrivka/contact-details-scraper act...</span>
          <span>→ Gemini AI ranking best contacts</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contact-intel__error">
        <AlertTriangle size={20} />
        <p>{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={handleDiscover}>Retry</button>
      </div>
    );
  }

  const { best_contact: contact, confidence_score, verification_status, source_notes, why_relevant, alternative_contacts } = data;

  const statusConfig = {
    verified: { label: 'Verified', icon: CheckCircle2, color: '#10b981' },
    verified_with_warnings: { label: 'Verified with Warnings', icon: Shield, color: '#f59e0b' },
    needs_review: { label: 'Needs Review', icon: AlertTriangle, color: '#ef4444' },
  };
  const status = statusConfig[verification_status] || statusConfig.needs_review;
  const StatusIcon = status.icon;

  return (
    <motion.div
      className="contact-intel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Verification Badge */}
      <div className="contact-intel__status-badge" style={{ '--status-color': status.color }}>
        <StatusIcon size={14} />
        <span>{status.label}</span>
        <span className="contact-intel__conf-score">{confidence_score}%</span>
      </div>

      {/* Primary Contact Card */}
      <div className="contact-intel__card">
        <div className="contact-intel__avatar">
          <User size={24} />
        </div>
        <div className="contact-intel__card-body">
          <h4 className="contact-intel__name">{contact?.name || 'Unknown'}</h4>
          <span className="contact-intel__role">{contact?.role || 'Contact'}</span>
        </div>
      </div>

      {/* Contact Details */}
      <div className="contact-intel__details">
        {contact?.company && (
          <div className="contact-intel__detail-row">
            <Building2 size={14} />
            <span>{contact.company}</span>
          </div>
        )}
        {contact?.email && (
          <a href={`mailto:${contact.email}`} className="contact-intel__detail-row contact-intel__detail-row--link">
            <Mail size={14} />
            <span>{contact.email}</span>
          </a>
        )}
        {contact?.phone && (
          <a href={`tel:${contact.phone}`} className="contact-intel__detail-row contact-intel__detail-row--link">
            <Phone size={14} />
            <span>{contact.phone}</span>
          </a>
        )}
        {contact?.website && (
          <a href={contact.website} target="_blank" rel="noopener noreferrer" className="contact-intel__detail-row contact-intel__detail-row--link">
            <Globe size={14} />
            <span>{contact.website}</span>
          </a>
        )}
        {contact?.linkedin && (
          <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="contact-intel__detail-row contact-intel__detail-row--link" style={{ color: '#0a66c2' }}>
            <Linkedin size={14} />
            <span>LinkedIn Profile</span>
          </a>
        )}
        {contact?.address && (
          <div className="contact-intel__detail-row">
            <MapPin size={14} />
            <span>{contact.address}</span>
          </div>
        )}
      </div>

      {/* Why Relevant */}
      {why_relevant && (
        <div className="contact-intel__relevance">
          <Sparkles size={14} />
          <span>{why_relevant}</span>
        </div>
      )}

      {/* Source Notes */}
      {source_notes?.length > 0 && (
        <div className="contact-intel__section">
          <h4 className="contact-intel__section-title"><Shield size={14} /> Source Notes</h4>
          {source_notes.map((note, i) => (
            <div key={i} className="contact-intel__source-note">
              <ArrowRight size={12} />
              <span>{note}</span>
            </div>
          ))}
        </div>
      )}

      {/* Alternative Contacts */}
      {alternative_contacts?.length > 0 && (
        <div className="contact-intel__section">
          <h4 className="contact-intel__section-title">Alternative Contacts</h4>
          {alternative_contacts.map((alt, i) => (
            <div key={i} className="contact-intel__alt-contact">
              <div className="contact-intel__alt-info">
                <span className="contact-intel__alt-name">{alt.name}</span>
                <span className="contact-intel__alt-role">{alt.company} · {alt.role}</span>
              </div>
              <span className="contact-intel__alt-conf">{alt.confidence}%</span>
            </div>
          ))}
        </div>
      )}

      {/* AI Email Drafter */}
      <div className="contact-intel__drafter">
        {!emailDraft && !isDrafting ? (
          <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={handleDraftEmail}>
            <PenTool size={16} /> Draft Outreach Email with AI
          </button>
        ) : isDrafting ? (
          <div className="contact-intel__draft-loading">
            <Loader2 size={16} className="contact-intel__spinner" />
            <span>AI is writing your email...</span>
          </div>
        ) : (
          <div className="contact-intel__draft-box">
            <div className="contact-intel__draft-header">
              <span className="contact-intel__draft-title"><Sparkles size={14} /> AI Drafted Email</span>
              <button className="contact-intel__draft-copy" onClick={copyToClipboard} title="Copy to clipboard">
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              className="contact-intel__draft-textarea"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              rows={8}
            />
          </div>
        )}
      </div>

      {/* Data Source */}
      {data.source && (
        <div className="contact-intel__source-badge" style={{ marginTop: 'var(--space-4)', fontSize: '11px', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
          {data.source === 'apify+gemini' ? '🟢 Powered by Apify + Gemini AI' : data.source === 'apify-direct' ? '🟢 Powered by Apify' : data.source === 'gemini-ai' ? '🔵 Powered by Gemini AI' : '⚪ Demo Data'}
          {data.apify_results_used > 0 && ` · ${data.apify_results_used} Google Maps places analyzed`}
        </div>
      )}

      <button className="btn btn-secondary btn-sm contact-intel__refresh" onClick={handleDiscover}>
        <Search size={14} /> Search Again
      </button>
    </motion.div>
  );
}

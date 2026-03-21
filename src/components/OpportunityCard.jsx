import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, MapPin, Calendar, Shield, AlertTriangle } from 'lucide-react';
import ConfidenceBadge from './ConfidenceBadge';
import VerificationBadge from './VerificationBadge';
import { useApp } from '../context/AppContext';
import { CONTRACTOR_TYPES } from '../data/mockOpportunities';
import './OpportunityCard.css';

export default function OpportunityCard({ opportunity, index = 0, onClick }) {
  const { dispatch, addToast } = useApp();

  const handleSave = (e) => {
    e.stopPropagation();
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
    <motion.div
      className="opp-card glass-card"
      onClick={() => onClick?.(opportunity)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 1, 0.5, 1] }}
      layout
      whileHover={{ y: -3 }}
    >
      <div className="opp-card__header">
        <div className="opp-card__badges">
          <ConfidenceBadge score={opportunity.confidence_score} />
          <VerificationBadge status={opportunity.verification_status} />
        </div>
        <button
          className={`opp-card__save ${opportunity.saved ? 'opp-card__save--active' : ''}`}
          onClick={handleSave}
          title={opportunity.saved ? 'Remove from watchlist' : 'Save to watchlist'}
        >
          {opportunity.saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      <h3 className="opp-card__title">{opportunity.title}</h3>

      <div className="opp-card__meta">
        <div className="opp-card__meta-item">
          <MapPin size={14} />
          <span>{opportunity.address}</span>
        </div>
        <div className="opp-card__meta-item">
          <Calendar size={14} />
          <span>{opportunity.estimated_timeline}</span>
        </div>
      </div>

      <p className="opp-card__summary">{(opportunity.project_summary || '').substring(0, 120)}{(opportunity.project_summary || '').length > 120 ? '...' : ''}</p>

      <div className="opp-card__footer">
        <div className="opp-card__tags">
          <span className="opp-card__tag opp-card__tag--permit">{opportunity.permit_type}</span>
          <span className="opp-card__tag opp-card__tag--stage">{opportunity.project_stage}</span>
        </div>
      </div>

      <div className="opp-card__contractors">
        {relevantTypes.map((t) => (
          <span
            key={t.id}
            className="opp-card__contractor-chip"
            style={{ '--chip-color': t.color }}
          >
            {t.name.replace(' Contractors', '').replace('s', '')}
          </span>
        ))}
      </div>

      {(opportunity.risk_flags || []).length > 0 && (
        <div className="opp-card__risks">
          <AlertTriangle size={12} />
          <span>{opportunity.risk_flags.length} risk flag{opportunity.risk_flags.length > 1 ? 's' : ''}</span>
        </div>
      )}
    </motion.div>
  );
}

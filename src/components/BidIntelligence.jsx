import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, Zap,
  AlertTriangle, ArrowRight, Loader2, Sparkles, Target
} from 'lucide-react';
import { generateBidIntelligence } from '../services/bidIntelligenceService';
import './BidIntelligence.css';

export default function BidIntelligence({ opportunity }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateBidIntelligence(opportunity);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!data && !loading && !error) {
    return (
      <div className="bid-intel__empty">
        <div className="bid-intel__empty-icon">
          <DollarSign size={32} />
        </div>
        <h4>Bid Intelligence</h4>
        <p>Generate an AI-powered bid recommendation based on comparable projects, location data, and market conditions.</p>
        <button className="btn btn-primary" onClick={handleGenerate}>
          <Sparkles size={16} />
          Generate Bid Insight
        </button>
        <span className="bid-intel__powered">Powered by Apify Actor Chain</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bid-intel__loading">
        <Loader2 size={24} className="bid-intel__spinner" />
        <p>Analyzing comparable projects & market data...</p>
        <div className="bid-intel__loading-steps">
          <span>→ Running apify/google-search-scraper actor</span>
          <span>→ Fetching construction cost data from Google</span>
          <span>→ Gemini AI computing optimal bid range</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bid-intel__error">
        <AlertTriangle size={20} />
        <p>{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={handleGenerate}>Retry</button>
      </div>
    );
  }

  const { recommended_bid_range: bid, confidence_score, pricing_factors, comparable_projects, neighborhood_budget_insights, risk_notes, explanation, strategy } = data;
  const fmt = (n) => '$' + (n || 0).toLocaleString();

  return (
    <motion.div
      className="bid-intel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Bid Range Cards */}
      <div className="bid-intel__range-grid">
        <div className="bid-intel__range-card bid-intel__range-card--low">
          <TrendingDown size={16} />
          <span className="bid-intel__range-label">Conservative</span>
          <span className="bid-intel__range-value">{fmt(bid?.low)}</span>
        </div>
        <div className="bid-intel__range-card bid-intel__range-card--mid">
          <Target size={16} />
          <span className="bid-intel__range-label">Recommended</span>
          <span className="bid-intel__range-value bid-intel__range-value--primary">{fmt(bid?.mid)}</span>
        </div>
        <div className="bid-intel__range-card bid-intel__range-card--high">
          <TrendingUp size={16} />
          <span className="bid-intel__range-label">Aggressive</span>
          <span className="bid-intel__range-value">{fmt(bid?.high)}</span>
        </div>
      </div>

      {/* Confidence */}
      <div className="bid-intel__confidence">
        <div className="bid-intel__confidence-header">
          <BarChart3 size={14} />
          <span>Confidence</span>
          <span className="bid-intel__confidence-score">{confidence_score}%</span>
        </div>
        <div className="bid-intel__confidence-track">
          <motion.div
            className="bid-intel__confidence-fill"
            initial={{ width: 0 }}
            animate={{ width: `${confidence_score}%` }}
            transition={{ duration: 0.8 }}
            style={{ background: confidence_score >= 80 ? '#10b981' : confidence_score >= 60 ? '#f59e0b' : '#ef4444' }}
          />
        </div>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="bid-intel__section">
          <p className="bid-intel__explanation">{explanation}</p>
        </div>
      )}

      {/* Strategy */}
      {strategy && (
        <div className="bid-intel__section">
          <h4 className="bid-intel__section-title"><Zap size={14} /> Bid Strategy</h4>
          <div className="bid-intel__strategy-list">
            {Object.entries(strategy).map(([key, val]) => (
              <div key={key} className="bid-intel__strategy-item">
                <span className={`bid-intel__strategy-tag bid-intel__strategy-tag--${key}`}>{key}</span>
                <span>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparable Projects */}
      {comparable_projects?.length > 0 && (
        <div className="bid-intel__section">
          <h4 className="bid-intel__section-title"><BarChart3 size={14} /> Comparable Projects</h4>
          {comparable_projects.map((comp, i) => (
            <div key={i} className="bid-intel__comp-item">
              <span className="bid-intel__comp-name">{comp.name}</span>
              <span className="bid-intel__comp-cost">{comp.cost}</span>
              <span className="bid-intel__comp-match">{comp.similarity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pricing Factors */}
      {pricing_factors?.length > 0 && (
        <div className="bid-intel__section">
          <h4 className="bid-intel__section-title">Pricing Factors</h4>
          {pricing_factors.map((f, i) => (
            <div key={i} className="bid-intel__factor">
              <ArrowRight size={12} />
              <span>{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* Neighborhood Insight */}
      {neighborhood_budget_insights && (
        <div className="bid-intel__insight-card">
          <MapPin size={14} />
          <span>{neighborhood_budget_insights}</span>
        </div>
      )}

      {/* Risk Notes */}
      {risk_notes?.length > 0 && (
        <div className="bid-intel__section">
          <h4 className="bid-intel__section-title bid-intel__section-title--warning"><AlertTriangle size={14} /> Risk Notes</h4>
          {risk_notes.map((r, i) => (
            <div key={i} className="bid-intel__risk">
              <AlertTriangle size={12} />
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* Data Source */}
      {data.source && (
        <div className="bid-intel__source-badge">
          {data.source === 'apify+gemini' ? '🟢 Powered by Apify + Gemini AI' : data.source === 'gemini-ai' ? '🔵 Powered by Gemini AI' : '⚪ Demo Data'}
          {data.apify_results_used > 0 && ` · ${data.apify_results_used} Google results analyzed`}
        </div>
      )}

      <button className="btn btn-secondary btn-sm bid-intel__refresh" onClick={handleGenerate}>
        <Sparkles size={14} /> Regenerate
      </button>
    </motion.div>
  );
}

function MapPin({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

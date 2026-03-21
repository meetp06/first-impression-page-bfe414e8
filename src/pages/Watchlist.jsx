import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import OpportunityCard from '../components/OpportunityCard';
import OpportunityDetail from '../components/OpportunityDetail';
import './Watchlist.css';

export default function Watchlist() {
  const { state, dispatch } = useApp();
  const { watchlist, selectedOpportunity, isDetailOpen } = state;

  const handleSelectOpportunity = (opp) => {
    dispatch({ type: 'SET_SELECTED_OPPORTUNITY', payload: opp });
  };

  return (
    <div className="watchlist-page">
      <header className="watchlist-page__header">
        <div className="watchlist-page__title-wrap">
          <Bookmark size={24} className="watchlist-page__icon" />
          <h1 className="watchlist-page__title">Saved Opportunities</h1>
        </div>
        <p className="watchlist-page__subtitle">
          Track and manage your high-priority projects across all cities.
        </p>
      </header>

      <div className="watchlist-page__content">
        {watchlist.length === 0 ? (
          <motion.div
            className="watchlist-page__empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="watchlist-page__empty-icon">
              <Bookmark size={40} />
            </div>
            <h2>Your watchlist is empty</h2>
            <p>Save opportunities from the dashboard to track them here.</p>
            <button
              className="btn btn-primary"
              onClick={() => dispatch({ type: 'SET_SELECTED_OPPORTUNITY', payload: null })} // just clearing for safe nav
              onClickCapture={() => window.location.href = '/dashboard'}
            >
              Back to Dashboard
            </button>
          </motion.div>
        ) : (
          <div className="watchlist-page__grid">
            <AnimatePresence mode="popLayout">
              {watchlist.map((opp, i) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  index={i}
                  onClick={handleSelectOpportunity}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <OpportunityDetail
        opportunity={selectedOpportunity}
        isOpen={isDetailOpen}
        onClose={() => dispatch({ type: 'CLOSE_DETAIL' })}
      />
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, MapPin, ChevronDown, Bell,
  RefreshCw, Sparkles, Bookmark, TrendingUp, Building2, Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchOpportunities, refreshOpportunities, getPipelineStatus } from '../services/api';
import { CITIES, CONTRACTOR_TYPES, PERMIT_TYPES, PROJECT_STAGES } from '../data/mockOpportunities';
import OpportunityCard from '../components/OpportunityCard';
import OpportunityDetail from '../components/OpportunityDetail';
import MapView from '../components/MapView';
import KPICard from '../components/KPICard';
import { SkeletonCard, SkeletonKPI } from '../components/LoadingSkeleton';
import './Dashboard.css';

export default function Dashboard() {
  const { state, dispatch, addToast } = useApp();
  const { selectedCity, selectedContractorType, filters, opportunities, isLoading, selectedOpportunity, isDetailOpen } = state;
  const [showFilters, setShowFilters] = useState(false);
  const pipelineStatus = getPipelineStatus();

  // Auto-login for demo
  useEffect(() => {
    if (!state.isAuthenticated) {
      dispatch({
        type: 'SET_USER',
        payload: { id: 'user-001', name: 'Demo User', email: 'demo@permitwatch.ai', plan: 'pro' },
      });
    }
  }, []);

  // Load opportunities
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const res = await fetchOpportunities(selectedCity, selectedContractorType, filters);
        if (!cancelled) {
          dispatch({ type: 'SET_OPPORTUNITIES', payload: res.data });
        }
      } catch (e) {
        addToast('Failed to load opportunities', 'error');
      } finally {
        if (!cancelled) dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedCity, selectedContractorType, filters]);

  const kpis = useMemo(() => {
    const total = opportunities.length;
    const highConf = opportunities.filter((o) => o.confidence_score >= 85).length;
    const saved = opportunities.filter((o) => o.saved).length;
    const cityLabel = CITIES.find((c) => c.id === selectedCity)?.name || selectedCity;
    return { total, highConf, saved, cityLabel };
  }, [opportunities, selectedCity]);

  const handleRefresh = async () => {
    addToast('Starting Apify scraping pipeline...', 'info');
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const res = await refreshOpportunities(selectedCity, {
        onProgress: (progress) => {
          // Show toasts for major pipeline stages
          if (progress.percent === 10) addToast('Apify: Scraping permit sources...', 'info');
          if (progress.percent === 50) addToast(`Transforming raw data...`, 'info');
          if (progress.percent === 70) addToast('Running AI verification analysis...', 'info');
          if (progress.percent === 100) addToast(`Pipeline complete: ${progress.message}`, 'success');
        }
      });
      
      if (res.data && res.data.length > 0) {
        dispatch({ type: 'SET_OPPORTUNITIES', payload: res.data });
        addToast(`Found ${res.data.length} real opportunities from ${res.meta?.source || 'pipeline'}`, 'success');
      } else {
        addToast('Pipeline finished but no new opportunities found.', 'warning');
      }
    } catch (e) {
      console.error('[Dashboard] Refresh failed:', e);
      addToast('Pipeline failed. Using fallback data.', 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleSelectOpportunity = (opp) => {
    dispatch({ type: 'SET_SELECTED_OPPORTUNITY', payload: opp });
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <div className="dashboard__selectors">
            <div className="dashboard__selector">
              <MapPin size={16} />
              <select
                value={selectedCity}
                onChange={(e) => dispatch({ type: 'SET_CITY', payload: e.target.value })}
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={14} />
            </div>

            <div className="dashboard__selector">
              <Building2 size={16} />
              <select
                value={selectedContractorType}
                onChange={(e) => dispatch({ type: 'SET_CONTRACTOR_TYPE', payload: e.target.value })}
              >
                <option value="all">All Contractors</option>
                {CONTRACTOR_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="dashboard__search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={filters.searchQuery}
              onChange={(e) => dispatch({ type: 'SET_FILTER', key: 'searchQuery', value: e.target.value })}
            />
          </div>
        </div>

        <div className="dashboard__header-right">
          <button className="btn btn-ghost btn-icon" onClick={handleRefresh} title="Refresh data">
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Notifications">
            <Bell size={18} />
          </button>
          <button
            className={`btn btn-ghost ${showFilters ? 'btn-ghost--active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="dashboard__filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="dashboard__filters-inner">
              <div className="filter-group">
                <label className="filter-group__label">Confidence ≥ {filters.confidenceThreshold}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.confidenceThreshold}
                  onChange={(e) => dispatch({ type: 'SET_FILTER', key: 'confidenceThreshold', value: Number(e.target.value) })}
                  className="filter-slider"
                />
              </div>

              <div className="filter-group">
                <label className="filter-group__label">Permit Type</label>
                <select
                  value={filters.permitType}
                  onChange={(e) => dispatch({ type: 'SET_FILTER', key: 'permitType', value: e.target.value })}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  {PERMIT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-group__label">Project Stage</label>
                <select
                  value={filters.projectStage}
                  onChange={(e) => dispatch({ type: 'SET_FILTER', key: 'projectStage', value: e.target.value })}
                  className="filter-select"
                >
                  <option value="all">All Stages</option>
                  {PROJECT_STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => dispatch({ type: 'RESET_FILTERS' })}
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPIs */}
      <div className="dashboard__kpis">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
        ) : (
          <>
            <KPICard icon={Sparkles} label="New Opportunities" value={kpis.total} trend="up" trendValue="+3 this week" index={0} />
            <KPICard icon={TrendingUp} label="High Confidence" value={kpis.highConf} trend="up" trendValue={`${Math.round(kpis.highConf / (kpis.total || 1) * 100)}%`} index={1} />
            <KPICard icon={Bookmark} label="Saved" value={kpis.saved} index={2} />
            <KPICard icon={MapPin} label="City Coverage" value={kpis.cityLabel} index={3} />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="dashboard__content">
        {/* Map */}
        <div className="dashboard__map">
          <MapView
            opportunities={opportunities}
            selectedCity={selectedCity}
            onSelectOpportunity={handleSelectOpportunity}
            selectedOpportunity={selectedOpportunity}
          />
        </div>

        {/* Feed */}
        <div className="dashboard__feed">
          <div className="dashboard__feed-header">
            <h2 className="dashboard__feed-title">
              Opportunities
              <span className="dashboard__feed-count">{opportunities.length}</span>
            </h2>
            {pipelineStatus.apifyConfigured && (
              <div className="dashboard__feed-source">
                <Database size={12} className="text-apify" />
                <span>Live Apify Feed</span>
              </div>
            )}
          </div>

          <div className="dashboard__feed-list">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : opportunities.length === 0 ? (
              <motion.div
                className="dashboard__empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Search size={48} strokeWidth={1} />
                <h3>No opportunities found</h3>
                <p>Try adjusting your filters or selecting a different city.</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {opportunities.map((opp, i) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    index={i}
                    onClick={handleSelectOpportunity}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <OpportunityDetail
        opportunity={selectedOpportunity}
        isOpen={isDetailOpen}
        onClose={() => dispatch({ type: 'CLOSE_DETAIL' })}
      />
    </div>
  );
}

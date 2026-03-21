import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import './Landing.css'; // Re-using the landing page pricing classes

export default function Pricing() {
  return (
    <>
      <Navbar />
      <div className="pricing-page-wrapper">
        <section className="section pricing-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
          <div className="section__inner" style={{ width: '100%' }}>
            <div className="section__header">
              <span className="section__overline">Pricing</span>
              <h2 className="section__title">Simple, Transparent Pricing</h2>
              <p className="section__subtitle">Start exploring opportunities for free, upgrade when you're ready.</p>
            </div>
            <motion.div
              className="pricing-grid"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
            >
              <div className="pricing-card">
                <h3 className="pricing-card__name">Starter</h3>
                <div className="pricing-card__price">
                  <span className="pricing-card__amount">$0</span>
                  <span className="pricing-card__period">/month</span>
                </div>
                <p className="pricing-card__desc">Perfect for exploring opportunities</p>
                <ul className="pricing-card__features">
                  <li><CheckCircle size={16} /> 1 city</li>
                  <li><CheckCircle size={16} /> 1 contractor type</li>
                  <li><CheckCircle size={16} /> 10 opportunities/month</li>
                  <li><CheckCircle size={16} /> Basic confidence scores</li>
                  <li><CheckCircle size={16} /> Email alerts</li>
                </ul>
                <Link to="/login" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
                  Get Started Free
                </Link>
              </div>

              <div className="pricing-card pricing-card--featured">
                <div className="pricing-card__popular">Most Popular</div>
                <h3 className="pricing-card__name">Professional</h3>
                <div className="pricing-card__price">
                  <span className="pricing-card__amount">$79</span>
                  <span className="pricing-card__period">/month</span>
                </div>
                <p className="pricing-card__desc">For serious contractors ready to grow</p>
                <ul className="pricing-card__features">
                  <li><CheckCircle size={16} /> All cities</li>
                  <li><CheckCircle size={16} /> All contractor types</li>
                  <li><CheckCircle size={16} /> Unlimited opportunities</li>
                  <li><CheckCircle size={16} /> AI verification details</li>
                  <li><CheckCircle size={16} /> Confidence threshold filtering</li>
                  <li><CheckCircle size={16} /> Watchlist & saved searches</li>
                  <li><CheckCircle size={16} /> Priority alerts (Email + In-app)</li>
                </ul>
                <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Start 14-Day Free Trial
                </Link>
              </div>

              <div className="pricing-card">
                <h3 className="pricing-card__name">Enterprise</h3>
                <div className="pricing-card__price">
                  <span className="pricing-card__amount">Custom</span>
                </div>
                <p className="pricing-card__desc">For teams and large operations</p>
                <ul className="pricing-card__features">
                  <li><CheckCircle size={16} /> Everything in Pro</li>
                  <li><CheckCircle size={16} /> Custom city addition requests</li>
                  <li><CheckCircle size={16} /> REST API access</li>
                  <li><CheckCircle size={16} /> Team management features</li>
                  <li><CheckCircle size={16} /> Custom CRM integrations</li>
                  <li><CheckCircle size={16} /> Dedicated support</li>
                </ul>
                <a href="mailto:sales@permitwatch.ai" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
                  Contact Sales
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}

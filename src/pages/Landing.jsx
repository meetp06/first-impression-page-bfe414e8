import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Building2, Search, Shield, MapPin, Zap, TrendingUp,
  CheckCircle, ArrowRight, Hammer, Wrench, Wind, Home,
  Paintbrush, Star, ChevronRight, Eye, BarChart3, Bell
} from 'lucide-react';
import './Landing.css';

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
    >
      {children}
    </motion.section>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } },
};

const personas = [
  { icon: Hammer, name: 'General Contractors', desc: 'Full project scopes, new construction, renovations', color: '#2563eb' },
  { icon: Wrench, name: 'Plumbers', desc: 'Repiping, fixture installs, commercial plumbing', color: '#0891b2' },
  { icon: Zap, name: 'Electricians', desc: 'Panel upgrades, rewiring, EV infrastructure', color: '#d97706' },
  { icon: Wind, name: 'HVAC Contractors', desc: 'System installs, modernization, ductwork', color: '#059669' },
  { icon: Home, name: 'Roofers', desc: 'Re-roofing, repairs, skylight installs', color: '#7c3aed' },
  { icon: Paintbrush, name: 'Painters', desc: 'Interior/exterior, decorative, commercial', color: '#e11d48' },
];

const steps = [
  { icon: Search, title: 'Monitor Permits', desc: 'We scan city planning portals, building departments, and public notices daily across supported cities.' },
  { icon: Eye, title: 'AI Extraction', desc: 'Our AI reads permit filings and public notice PDFs, extracting project details, scope, and timeline data.' },
  { icon: BarChart3, title: 'Score & Verify', desc: 'Each opportunity gets a confidence score and verification status so you know exactly how reliable the lead is.' },
  { icon: Bell, title: 'Get Notified', desc: 'Set your filters — city, contractor type, confidence threshold — and get notified when new matches appear.' },
];

const benefits = [
  { title: 'Find Jobs Before Competitors', desc: 'Get alerted to new construction opportunities the moment permits are filed — days before they hit job boards.' },
  { title: 'Stop Wasting Time', desc: 'No more manually scrolling through city portals. We do the monitoring so you can focus on bidding and building.' },
  { title: 'Qualify Opportunities Fast', desc: 'AI-powered confidence scores and verification help you quickly focus on the best-fit, highest-probability projects.' },
  { title: 'Win More Bids', desc: 'Know about opportunities early, understand the full scope, and submit stronger bids with better preparation.' },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__gradient-orb hero__gradient-orb--1" />
          <div className="hero__gradient-orb hero__gradient-orb--2" />
          <div className="hero__gradient-orb hero__gradient-orb--3" />
        </div>
        <motion.div
          className="hero__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
        >
          <motion.div
            className="hero__badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Shield size={14} />
            <span>AI-Powered Permit Intelligence</span>
          </motion.div>

          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Discover Construction
            <br />
            <span className="hero__title-accent">Opportunities First</span>
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
          >
            PermitWatch AI monitors city planning portals and public notices, extracts project
            details, and scores every opportunity — so you can win more bids with less effort.
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            <Link to="/login" className="btn btn-primary btn-lg hero__cta">
              Start Free Trial
              <ArrowRight size={18} />
            </Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg">
              View Live Demo
            </Link>
          </motion.div>

          <motion.div
            className="hero__stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7 }}
          >
            <div className="hero__stat">
              <span className="hero__stat-value">2</span>
              <span className="hero__stat-label">Cities Covered</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">1,200+</span>
              <span className="hero__stat-label">Permits Tracked</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">94%</span>
              <span className="hero__stat-label">Accuracy Rate</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <AnimatedSection className="section how-it-works">
        <div className="section__inner">
          <div className="section__header">
            <span className="section__overline">How It Works</span>
            <h2 className="section__title">From Permit Filing to Your Dashboard</h2>
            <p className="section__subtitle">
              Four steps between a new construction permit and an opportunity on your screen.
            </p>
          </div>
          <motion.div
            className="steps-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {steps.map((step, i) => (
              <motion.div key={i} className="step-card glass-card" variants={itemVariants}>
                <div className="step-card__number">{i + 1}</div>
                <div className="step-card__icon">
                  <step.icon size={24} />
                </div>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Benefits */}
      <AnimatedSection className="section benefits-section">
        <div className="section__inner">
          <div className="section__header">
            <span className="section__overline">Why PermitWatch AI</span>
            <h2 className="section__title">Win More Contracts, Spend Less Time Searching</h2>
          </div>
          <motion.div
            className="benefits-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {benefits.map((b, i) => (
              <motion.div key={i} className="benefit-card" variants={itemVariants}>
                <div className="benefit-card__check">
                  <CheckCircle size={20} />
                </div>
                <h3 className="benefit-card__title">{b.title}</h3>
                <p className="benefit-card__desc">{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Cities */}
      <AnimatedSection className="section cities-section">
        <div className="section__inner">
          <div className="section__header">
            <span className="section__overline">Coverage</span>
            <h2 className="section__title">Currently Monitoring</h2>
            <p className="section__subtitle">
              We're live in the Bay Area and expanding. More cities coming soon.
            </p>
          </div>
          <div className="cities-grid">
            <motion.div
              className="city-card glass-card"
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
            >
              <MapPin size={28} className="city-card__icon" />
              <h3 className="city-card__name">San Francisco</h3>
              <p className="city-card__detail">SF DBI, Planning Dept, Public Notices</p>
              <span className="city-card__badge">Live</span>
            </motion.div>
            <motion.div
              className="city-card glass-card"
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
            >
              <MapPin size={28} className="city-card__icon" />
              <h3 className="city-card__name">San Jose</h3>
              <p className="city-card__detail">SJ Permit Center, School Districts</p>
              <span className="city-card__badge">Live</span>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Personas */}
      <AnimatedSection className="section personas-section">
        <div className="section__inner">
          <div className="section__header">
            <span className="section__overline">Built For You</span>
            <h2 className="section__title">Tailored for Every Trade</h2>
            <p className="section__subtitle">
              PermitWatch AI understands different contractor specialties and scores relevance accordingly.
            </p>
          </div>
          <motion.div
            className="personas-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {personas.map((p, i) => (
              <motion.div
                key={i}
                className="persona-card glass-card"
                variants={itemVariants}
                whileHover={{ y: -3 }}
              >
                <div className="persona-card__icon" style={{ '--persona-color': p.color }}>
                  <p.icon size={24} />
                </div>
                <h3 className="persona-card__name">{p.name}</h3>
                <p className="persona-card__desc">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* AI Verification Explainer */}
      <AnimatedSection className="section ai-section">
        <div className="section__inner">
          <div className="ai-explainer">
            <div className="ai-explainer__content">
              <span className="section__overline">AI-Powered</span>
              <h2 className="section__title">Confidence Scoring & Verification</h2>
              <p className="ai-explainer__text">
                Not all permit filings turn into real opportunities. Our AI analyzes multiple signals — permit status,
                funding availability, project stage, and historical patterns — to assign a confidence score
                from 0 to 100.
              </p>
              <div className="ai-explainer__features">
                <div className="ai-feature">
                  <div className="ai-feature__dot ai-feature__dot--green" />
                  <div>
                    <strong>Verified</strong> — Source confirmed, project moving forward
                  </div>
                </div>
                <div className="ai-feature">
                  <div className="ai-feature__dot ai-feature__dot--yellow" />
                  <div>
                    <strong>Verified with Warnings</strong> — Confirmed but has risk factors
                  </div>
                </div>
                <div className="ai-feature">
                  <div className="ai-feature__dot ai-feature__dot--gray" />
                  <div>
                    <strong>Needs Review</strong> — Not yet confirmed, early stage
                  </div>
                </div>
              </div>
            </div>
            <div className="ai-explainer__visual">
              <div className="ai-score-demo">
                <div className="ai-score-demo__ring">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                    <motion.circle
                      cx="60" cy="60" r="52" fill="none" stroke="#34d399" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${52 * 2 * Math.PI}`}
                      strokeDashoffset={`${52 * 2 * Math.PI * (1 - 0.92)}`}
                      initial={{ strokeDashoffset: 52 * 2 * Math.PI }}
                      whileInView={{ strokeDashoffset: 52 * 2 * Math.PI * (1 - 0.92) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      viewport={{ once: true }}
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="ai-score-demo__value">92</div>
                </div>
                <span className="ai-score-demo__label">High Confidence</span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Pricing */}
      <AnimatedSection className="section pricing-section" id="pricing">
        <div className="section__inner">
          <div className="section__header">
            <span className="section__overline">Pricing</span>
            <h2 className="section__title">Simple, Transparent Pricing</h2>
            <p className="section__subtitle">Start free, upgrade when you're ready.</p>
          </div>
          <motion.div
            className="pricing-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div className="pricing-card" variants={itemVariants}>
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
            </motion.div>

            <motion.div className="pricing-card pricing-card--featured" variants={itemVariants}>
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
                <li><CheckCircle size={16} /> Priority email + in-app alerts</li>
              </ul>
              <button 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%' }}
                onClick={() => {
                  // In a real app, this redirects to the Stripe Checkout session URL
                  const stripeUrl = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
                    ? 'https://checkout.stripe.com/c/pay/cs_test_placeholder'
                    : '/login';
                  window.location.href = stripeUrl;
                }}
              >
                Start 14-Day Free Trial
              </button>
            </motion.div>

            <motion.div className="pricing-card" variants={itemVariants}>
              <h3 className="pricing-card__name">Enterprise</h3>
              <div className="pricing-card__price">
                <span className="pricing-card__amount">Custom</span>
              </div>
              <p className="pricing-card__desc">For teams and large operations</p>
              <ul className="pricing-card__features">
                <li><CheckCircle size={16} /> Everything in Pro</li>
                <li><CheckCircle size={16} /> Custom city coverage</li>
                <li><CheckCircle size={16} /> API access</li>
                <li><CheckCircle size={16} /> Team management</li>
                <li><CheckCircle size={16} /> Custom integrations</li>
                <li><CheckCircle size={16} /> Dedicated support</li>
              </ul>
              <a href="mailto:sales@permitwatch.ai" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
                Contact Sales
              </a>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Final CTA */}
      <AnimatedSection className="section cta-section">
        <div className="section__inner">
          <div className="cta-block">
            <h2 className="cta-block__title">Ready to Find Your Next Project?</h2>
            <p className="cta-block__subtitle">
              Join contractors already using PermitWatch AI to discover opportunities before the competition.
            </p>
            <div className="cta-block__actions">
              <Link to="/login" className="btn btn-primary btn-lg hero__cta">
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard" className="btn btn-secondary btn-lg">
                View Live Demo
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__logo">
            <Building2 size={20} />
            <span>PermitWatch AI</span>
          </div>
          <p className="landing-footer__text">
            © 2026 PermitWatch AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

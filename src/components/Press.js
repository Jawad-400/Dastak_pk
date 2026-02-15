import React from 'react';
import { FaNewspaper, FaTrophy, FaCalendar, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';

const Press = () => {
  const pressReleases = [
    {
      id: 1,
      title: 'DASTAK Raises $1.2M to Expand Service Marketplace in Pakistan',
      date: 'March 10, 2025',
      summary: 'Investment will fuel growth in Lahore, Karachi, and Islamabad.',
      source: 'TechJuice',
      link: '#',
      image: '📰'
    },
    {
      id: 2,
      title: 'DASTAK Named Among Top 10 Startups to Watch in 2025',
      date: 'February 28, 2025',
      summary: 'Recognized for innovation in the service sector.',
      source: 'Propakistani',
      link: '#',
      image: '🏆'
    },
    {
      id: 3,
      title: 'How DASTAK is Creating Jobs for 10,+ Professionals',
      date: 'February 15, 2025',
      summary: 'Feature story on the platform\'s impact on employment.',
      source: 'Express Tribune',
      link: '#',
      image: '💼'
    },
    {
      id: 4,
      title: 'DASTAK Launches New Safety Features for Users',
      date: 'January 20, 2025',
      summary: 'Enhanced verification and escrow payments introduced.',
      source: 'Dawn',
      link: '#',
      image: '🛡️'
    }
  ];

  const mediaKit = [
    { name: 'Brand Guidelines', size: '2.4 MB', icon: '📄' },
    { name: 'Logo Package', size: '5.1 MB', icon: '🎨' },
    { name: 'Press Photos', size: '8.3 MB', icon: '📸' },
    { name: 'Fact Sheet', size: '1.2 MB', icon: '📊' }
  ];

  const awards = [
    { year: '2025', title: 'Best Startup - P@SHA ICT Awards', icon: '🏆' },
    { year: '2024', title: 'Innovation in Service Technology', icon: '🌟' },
    { year: '2024', title: 'Top 50 Most Promising Startups', icon: '🚀' }
  ];

  return (
    <div className="press-page">
      {/* Hero Section */}
      <div className="press-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <h1>Press & Media</h1>
          <p className="hero-subtitle">
            Latest news, announcements, and media resources about DASTAK
          </p>
          <button className="contact-press-btn">
            Contact Press Team
          </button>
        </div>
      </div>

      {/* Press Releases */}
      <div className="press-releases">
        <div className="container">
          <h2>Press Releases</h2>
          <div className="releases-list">
            {pressReleases.map(release => (
              <div key={release.id} className="release-card">
                <div className="release-image">{release.image}</div>
                <div className="release-content">
                  <div className="release-meta">
                    <span className="release-source">{release.source}</span>
                    <span className="release-date"><FaCalendar /> {release.date}</span>
                  </div>
                  <h3>{release.title}</h3>
                  <p>{release.summary}</p>
                  <a href={release.link} className="read-more" target="_blank" rel="noopener noreferrer">
                    Read Full Article <FaExternalLinkAlt />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media Kit */}
      <div className="media-kit-section">
        <div className="container">
          <h2>Media Kit</h2>
          <p className="section-subtitle">Download our logos, brand guidelines, and press photos</p>
          
          <div className="media-grid">
            {mediaKit.map((item, index) => (
              <div key={index} className="media-card">
                <span className="media-icon">{item.icon}</span>
                <div className="media-info">
                  <h4>{item.name}</h4>
                  <span className="media-size">{item.size}</span>
                </div>
                <button className="download-btn">
                  <FaDownload />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Awards */}
      <div className="awards-section">
        <div className="container">
          <h2>Awards & Recognition</h2>
          <div className="awards-grid">
            {awards.map((award, index) => (
              <div key={index} className="award-card">
                <span className="award-icon">{award.icon}</span>
                <span className="award-year">{award.year}</span>
                <h4>{award.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Press Contact */}
      <div className="press-contact">
        <div className="container">
          <div className="contact-card">
            <FaNewspaper className="contact-icon" />
            <h3>Media Inquiries</h3>
            <p>For press-related questions, interview requests, or more information:</p>
            <a href="mailto:press@dastak.pk" className="press-email">press@dastak.pk</a>
            <p className="phone">+92 329 5493781</p>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .press-page {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .press-hero {
          position: relative;
          background: linear-gradient(145deg, #0f172a, #1e293b);
          padding: 80px 0;
          overflow: hidden;
          text-align: center;
        }

        .hero-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(#3b82f6 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.2;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 2;
        }

        .press-hero h1 {
          color: white;
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 20px;
        }

        .hero-subtitle {
          color: #94a3b8;
          font-size: 18px;
          max-width: 600px;
          margin: 0 auto 30px;
        }

        .contact-press-btn {
          padding: 14px 32px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .contact-press-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        .press-releases {
          padding: 80px 0;
          background: white;
        }

        .press-releases h2 {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .releases-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .release-card {
          display: flex;
          gap: 24px;
          padding: 24px;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .release-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(59,130,246,0.1);
          border-color: #3b82f6;
        }

        .release-image {
          width: 80px;
          height: 80px;
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          flex-shrink: 0;
        }

        .release-content {
          flex: 1;
        }

        .release-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;
        }

        .release-source {
          padding: 2px 10px;
          background: #3b82f610;
          color: #3b82f6;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .release-date {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #94a3b8;
          font-size: 12px;
        }

        .release-content h3 {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .release-content p {
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .read-more {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #3b82f6;
          font-weight: 600;
          text-decoration: none;
        }

        .media-kit-section {
          padding: 80px 0;
        }

        .media-kit-section h2 {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px;
          text-align: center;
        }

        .section-subtitle {
          text-align: center;
          color: #64748b;
          margin-bottom: 40px;
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .media-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .media-icon {
          font-size: 32px;
        }

        .media-info {
          flex: 1;
        }

        .media-info h4 {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .media-size {
          font-size: 12px;
          color: #94a3b8;
        }

        .download-btn {
          padding: 8px;
          background: #3b82f610;
          color: #3b82f6;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .download-btn:hover {
          background: #3b82f6;
          color: white;
        }

        .awards-section {
          padding: 80px 0;
          background: white;
        }

        .awards-section h2 {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
          text-align: center;
        }

        .awards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          max-width: 900px;
          margin: 0 auto;
        }

        .award-card {
          text-align: center;
          padding: 30px;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        .award-icon {
          font-size: 40px;
          color: #3b82f6;
          margin-bottom: 16px;
          display: block;
        }

        .award-year {
          display: inline-block;
          padding: 4px 12px;
          background: #3b82f610;
          color: #3b82f6;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .award-card h4 {
          font-size: 16px;
          color: #0f172a;
          margin: 0;
          line-height: 1.5;
        }

        .press-contact {
          padding: 80px 0;
          background: linear-gradient(145deg, #0f172a, #1e293b);
        }

        .contact-card {
          max-width: 500px;
          margin: 0 auto;
          text-align: center;
          padding: 40px;
          background: rgba(255,255,255,0.05);
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .contact-icon {
          font-size: 48px;
          color: #3b82f6;
          margin-bottom: 20px;
        }

        .contact-card h3 {
          color: white;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 16px;
        }

        .contact-card p {
          color: #94a3b8;
          margin-bottom: 20px;
        }

        .press-email {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          text-decoration: none;
          border-radius: 30px;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .phone {
          color: #94a3b8;
          font-size: 16px;
        }

        @media (max-width: 1024px) {
          .awards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .release-card {
            flex-direction: column;
          }
          
          .media-grid {
            grid-template-columns: 1fr;
          }
          
          .awards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Press;
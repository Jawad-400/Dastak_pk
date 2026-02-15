import React, { useState } from 'react';
import { 
  FaSearch, FaClock, FaUser, FaTag, FaHeart, 
  FaComment, FaShare, FaArrowRight, FaCalendar
} from 'react-icons/fa';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'All',
    'Home Improvement',
    'Provider Stories',
    'Tips & Tricks',
    'Company News',
    'Safety Guides'
  ];

  const featuredPosts = [
    {
      id: 1,
      title: '10 Essential Plumbing Tips Every Homeowner Should Know',
      excerpt: 'From fixing a leaky faucet to preventing pipe bursts, learn the basics of home plumbing.',
      author: 'Ahmed Raza',
      authorRole: 'Master Plumber',
      date: 'March 15, 2025',
      readTime: '8 min read',
      category: 'Home Improvement',
      image: '🚰',
      comments: 24,
      likes: 156
    },
    {
      id: 2,
      title: 'How This Electrician Earned Rs. 85,000 in His First Month',
      excerpt: 'Read how Kamran went from unemployed to top earner on DASTAK.',
      author: 'Kamran Ali',
      authorRole: 'Electrician',
      date: 'March 12, 2025',
      readTime: '6 min read',
      category: 'Provider Stories',
      image: '⚡',
      comments: 42,
      likes: 312
    },
    {
      id: 3,
      title: 'Complete Guide to AC Maintenance Before Summer',
      excerpt: 'Save money on repairs with these simple AC maintenance tips.',
      author: 'Sara Khan',
      authorRole: 'AC Technician',
      date: 'March 10, 2025',
      readTime: '10 min read',
      category: 'Tips & Tricks',
      image: '❄️',
      comments: 18,
      likes: 203
    }
  ];

  const recentPosts = [
    {
      id: 4,
      title: 'New Feature: Instant Chat With Providers',
      excerpt: 'Communicate faster with our new real-time chat system.',
      date: 'March 8, 2025',
      category: 'Company News',
      image: '💬'
    },
    {
      id: 5,
      title: 'Safety First: How We Verify All Providers',
      excerpt: 'Behind the scenes of our verification process.',
      date: 'March 5, 2025',
      category: 'Safety Guides',
      image: '🛡️'
    },
    {
      id: 6,
      title: '5 Signs You Need to Call an Electrician',
      excerpt: 'Do not ignore these warning signs in your home.',
      date: 'March 3, 2025',
      category: 'Tips & Tricks',
      image: '⚠️'
    },
    {
      id: 7,
      title: 'Customer Story: "They Fixed My AC in 2 Hours!"',
      excerpt: 'Read about Saras experience with our AC repair service.',
      date: 'March 1, 2025',
      category: 'Customer Stories',
      image: '🌟'
    },
    {
      id: 8,
      title: 'Understanding Our Escrow Payment System',
      excerpt: 'How we ensure safe payments for both parties.',
      date: 'February 28, 2025',
      category: 'Company News',
      image: '💰'
    },
    {
      id: 9,
      title: 'Painting Tips: Choosing the Right Colors for Small Rooms',
      excerpt: 'Make your small space look bigger with these tips.',
      date: 'February 25, 2025',
      category: 'Home Improvement',
      image: '🎨'
    }
  ];

  const filteredPosts = recentPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <div className="blog-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <h1>DASTAK Blog</h1>
          <p className="hero-subtitle">
            Insights, stories, and tips from Pakistan's service community
          </p>
          
          {/* Search Bar */}
          <div className="hero-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="categories-section">
        <div className="container">
          <div className="categories-list">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`category-btn ${selectedCategory === category.toLowerCase() ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.toLowerCase())}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Posts */}
      <div className="featured-section">
        <div className="container">
          <h2>Featured Articles</h2>
          <div className="featured-grid">
            {featuredPosts.map(post => (
              <div key={post.id} className="featured-card">
                <div className="featured-image">{post.image}</div>
                <div className="featured-content">
                  <div className="post-meta">
                    <span className="post-category">{post.category}</span>
                    <span className="post-date"><FaCalendar /> {post.date}</span>
                    <span className="post-read"><FaClock /> {post.readTime}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="post-author">
                    <div className="author-info">
                      <strong>{post.author}</strong>
                      <span>{post.authorRole}</span>
                    </div>
                  </div>
                  <div className="post-stats">
                    <span><FaHeart /> {post.likes}</span>
                    <span><FaComment /> {post.comments}</span>
                    <button className="read-more">Read Article <FaArrowRight /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="recent-section">
        <div className="container">
          <h2>Recent Articles</h2>
          <div className="recent-grid">
            {filteredPosts.map(post => (
              <div key={post.id} className="recent-card">
                <div className="recent-image">{post.image}</div>
                <div className="recent-content">
                  <span className="recent-category">{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="recent-footer">
                    <span className="recent-date"><FaCalendar /> {post.date}</span>
                    <button className="recent-read">Read →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="no-results">
              <p>No articles found matching your search.</p>
            </div>
          )}

          {/* Load More */}
          <div className="load-more">
            <button className="load-more-btn">
              Load More Articles
            </button>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="blog-newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h3>Never Miss an Update</h3>
            <p>Subscribe to our newsletter for the latest tips and stories.</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button className="newsletter-btn">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .blog-page {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .blog-hero {
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

        .blog-hero h1 {
          color: white;
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 20px;
        }

        .hero-subtitle {
          color: #94a3b8;
          font-size: 18px;
          max-width: 600px;
          margin: 0 auto 40px;
        }

        .hero-search {
          max-width: 500px;
          margin: 0 auto;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .hero-search input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          border: none;
          border-radius: 40px;
          font-size: 16px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .hero-search input::placeholder {
          color: #64748b;
        }

        .hero-search input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(255,255,255,0.15);
        }

        .categories-section {
          padding: 30px 0;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .categories-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }

        .category-btn {
          padding: 8px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 30px;
          background: white;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .category-btn:hover,
        .category-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .featured-section {
          padding: 60px 0;
        }

        .featured-section h2 {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .featured-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .featured-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(59,130,246,0.1);
          border-color: #3b82f6;
        }

        .featured-image {
          height: 160px;
          background: linear-gradient(145deg, #1e293b, #0f172a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }

        .featured-content {
          padding: 24px;
        }

        .post-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
        }

        .post-category {
          padding: 4px 12px;
          background: #3b82f610;
          color: #3b82f6;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .post-date,
        .post-read {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #94a3b8;
          font-size: 12px;
        }

        .featured-content h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 12px;
          line-height: 1.4;
        }

        .featured-content p {
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .post-author {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .author-info {
          display: flex;
          flex-direction: column;
        }

        .author-info strong {
          color: #0f172a;
          font-size: 14px;
        }

        .author-info span {
          color: #64748b;
          font-size: 12px;
        }

        .post-stats {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .post-stats span {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #64748b;
          font-size: 13px;
        }

        .read-more {
          margin-left: auto;
          background: none;
          border: none;
          color: #3b82f6;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .recent-section {
          padding: 60px 0;
          background: white;
        }

        .recent-section h2 {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .recent-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .recent-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .recent-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.1);
          border-color: #3b82f6;
        }

        .recent-image {
          width: 60px;
          height: 60px;
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .recent-content {
          flex: 1;
        }

        .recent-category {
          display: inline-block;
          padding: 2px 8px;
          background: #3b82f610;
          color: #3b82f6;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .recent-content h3 {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 6px;
        }

        .recent-content p {
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .recent-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .recent-date {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #94a3b8;
          font-size: 11px;
        }

        .recent-read {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .no-results {
          text-align: center;
          padding: 60px;
          color: #64748b;
        }

        .load-more {
          text-align: center;
          margin-top: 40px;
        }

        .load-more-btn {
          padding: 12px 32px;
          background: white;
          color: #3b82f6;
          border: 2px solid #e2e8f0;
          border-radius: 30px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .load-more-btn:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .blog-newsletter {
          padding: 60px 0;
          background: linear-gradient(145deg, #0f172a, #1e293b);
          text-align: center;
        }

        .newsletter-content h3 {
          color: white;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 12px;
        }

        .newsletter-content p {
          color: #94a3b8;
          margin-bottom: 24px;
        }

        .newsletter-form {
          display: flex;
          gap: 12px;
          max-width: 500px;
          margin: 0 auto;
        }

        .newsletter-input {
          flex: 1;
          padding: 14px 20px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
        }

        .newsletter-input:focus {
          outline: 2px solid #3b82f6;
        }

        .newsletter-btn {
          padding: 14px 32px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .newsletter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        @media (max-width: 1024px) {
          .featured-grid,
          .recent-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .featured-grid,
          .recent-grid {
            grid-template-columns: 1fr;
          }
          
          .newsletter-form {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Blog;
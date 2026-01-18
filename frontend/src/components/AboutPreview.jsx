import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileImage from '../assets/nbn - Edited.png';

export default function AboutPreview() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        // Use relative path to take advantage of Vite's proxy during dev
        const response = await fetch('/api/about/');
        
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setAboutData(data[0]);
        } else if (data && !Array.isArray(data)) {
          setAboutData(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching about data:', error);
        // Use fallback data
        setAboutData({
          name: 'Ndimih Boclair Nghochu',
          title: 'Software Engineer · Cloud & DevOps Specialist',
          bio: 'I build smart, scalable, and secure digital solutions. With expertise in Cloud Architecture, DevOps automation, IAM, and full-stack development, I deliver end-to-end solutions that drive real business impact.',
          location: 'Bamenda, Cameroon',
          email: 'ndimihboclair4@gmail.com',
          linkedin_url: 'https://www.linkedin.com/in/ndimih-boclair-05b2a9347',
          github_url: 'https://github.com/Ndimih-Boclair-Nghochu',
          twitter_url: 'https://x.com/ndimih40828?s=21',
          profile_image: null
        });
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-900/50">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          Loading about section...
        </div>
      </section>
    );
  }
  
  if (!aboutData) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-900/50">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          About section not available
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-56 h-56 bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex justify-center md:col-span-1 animate-pop-scale" style={{ animationDelay: '0.1s' }}>
            <div className="relative group">
              {/* Animated gradient border glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
              
              {/* Image container with minimal styling */}
              <div className="relative overflow-hidden rounded-3xl transform group-hover:scale-110 transition-transform duration-500">
                {/* Image */}
                {aboutData.profile_image ? (
                  <img src={aboutData.profile_image} alt={aboutData.name} className="w-full max-w-sm h-auto object-cover rounded-3xl" />
                ) : (
                  <img src={profileImage} alt={aboutData.name} className="w-full max-w-sm h-auto object-cover rounded-3xl" />
                )}
              </div>

              {/* Professional info badge on hover */}
              <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg whitespace-nowrap">
                  Available for Projects
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 animate-pop-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{aboutData.name}</span>
              </h3>
              <p className="text-lg font-semibold text-blue-300">{aboutData.title}</p>
              <p className="text-sm text-gray-400 flex items-center gap-2">📍 {aboutData.location}</p>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">{aboutData.bio}</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {aboutData.linkedin_url && (
                <a href={aboutData.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg">💼 LinkedIn</a>
              )}
              {aboutData.github_url && (
                <a href={aboutData.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg">💻 GitHub</a>
              )}
              {aboutData.twitter_url && (
                <a href={aboutData.twitter_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg">𝕏 Twitter</a>
              )}
              {aboutData.email && (
                <a href={`mailto:${aboutData.email}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg">✉️ Email</a>
              )}
              <button onClick={() => navigate('/about')} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg">📖 Know More</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

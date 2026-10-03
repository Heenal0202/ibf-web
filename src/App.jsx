import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import JoinClubModal from './components/JoinClubModal.jsx';
import Toast from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import Sponsors from './pages/Sponsors.jsx';
import Events from './pages/Events.jsx';
import Leads from './pages/Leads.jsx';
import Admin from './pages/Admin.jsx';
import { initGlobalWebGL, resizeScrollRenderer } from './webgl/ScrollRendererManager.js';

export default function App() {
  const validRoutes = ['home', 'sponsors', 'events', 'leads', 'admin'];

  const getHashRoute = () => {
    const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
    return validRoutes.includes(raw) ? raw : 'home';
  };

  const [route, setRoute] = useState(getHashRoute());
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const navigateTo = useCallback((targetRoute) => {
    window.location.hash = `#/${targetRoute}`;
  }, []);

  useEffect(() => {
    // Expose open modal globally for any external triggers
    window.openJoinModal = () => setIsJoinModalOpen(true);

    // Initialize global WebGL canvas
    initGlobalWebGL();

    const onHashChange = () => {
      const newRoute = getHashRoute();
      setRoute(newRoute);
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(resizeScrollRenderer, 50);
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div className="react-app-wrapper">
      <Navbar
        currentRoute={route}
        onNavigate={navigateTo}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
      />

      <main className="content">
        {route === 'home' && <Home onNavigate={navigateTo} />}
        {route === 'sponsors' && <Sponsors onNavigate={navigateTo} />}
        {route === 'events' && <Events />}
        {route === 'leads' && <Leads onOpenJoinModal={() => setIsJoinModalOpen(true)} />}
        {route === 'admin' && <Admin onNavigate={navigateTo} />}
      </main>

      <Footer onNavigate={navigateTo} />
      <Toast />
      <JoinClubModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
    </div>
  );
}

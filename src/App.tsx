import { useState, useEffect, useCallback } from 'react';
import { PageRoute, AppStoreData } from './types';
import { fetchStoreData, mutateStoreData, blankData } from './services/store';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Banner } from './components/Banner';
import { HomePage } from './pages/HomePage';
import { TreatmentsPage } from './pages/TreatmentsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { GalleryPage } from './pages/GalleryPage';
import { BlogPage } from './pages/BlogPage';
import { ArticlePage } from './pages/ArticlePage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [storeData, setStoreData] = useState<AppStoreData>(blankData());
  const [, setIsLoading] = useState(true);

  // Sync hash with route
  const parseRouteFromLocation = useCallback((): PageRoute => {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (!hash || hash === 'home') return 'home';
    if (hash === 'treatments' || hash === 'services') return 'services';
    if (hash === 'doctors' || hash === 'team') return 'doctors';
    if (hash === 'gallery') return 'gallery';
    if (hash === 'blog') return 'blog';
    if (hash === 'contact' || hash === 'book') return 'contact';
    if (hash === 'faq' || hash === 'faqs') return 'faq';
    if (hash === 'privacy') return 'privacy';
    if (hash === 'admin') return 'admin';
    if (hash.startsWith('article-') || hash.startsWith('article/')) {
      const slug = hash.replace('article/', '');
      return { type: 'article', slug };
    }
    return 'home';
  }, []);

  useEffect(() => {
    const initialRoute = parseRouteFromLocation();
    setCurrentPage(initialRoute);

    const handleHashChange = () => {
      const route = parseRouteFromLocation();
      setCurrentPage(route);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [parseRouteFromLocation]);

  // Load store data
  const loadData = useCallback(async (force = false) => {
    try {
      const data = await fetchStoreData(force);
      setStoreData(data);
    } catch (err) {
      console.error('Failed to load store data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Polling every 60s for updates
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData(true);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleNavigate = (page: PageRoute) => {
    setCurrentPage(page);
    if (typeof page === 'string') {
      window.location.hash = page === 'home' ? '' : page;
    } else if (page.type === 'article') {
      window.location.hash = page.slug;
    }
  };

  const handleSaveStoreData = async (mutator: (d: AppStoreData) => void): Promise<boolean> => {
    const res = await mutateStoreData(mutator);
    setStoreData({ ...res.data });
    return res.success;
  };

  const isAdmin = currentPage === 'admin';

  return (
    <div className="app-container">
      {/* Top Header */}
      {!isAdmin && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          settings={storeData.settings}
        />
      )}

      {/* Offer Banner */}
      {!isAdmin && typeof currentPage === 'string' && (
        <Banner banners={storeData.banners} onBookClick={handleNavigate} />
      )}

      {/* Main Pages */}
      <main>
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} settings={storeData.settings} />
        )}
        {currentPage === 'services' && <TreatmentsPage onNavigate={handleNavigate} />}
        {currentPage === 'doctors' && <DoctorsPage onNavigate={handleNavigate} />}
        {currentPage === 'gallery' && <GalleryPage onNavigate={handleNavigate} />}
        {currentPage === 'blog' && (
          <BlogPage onNavigate={handleNavigate} clinicPosts={storeData.posts} />
        )}
        {typeof currentPage === 'object' && currentPage.type === 'article' && (
          <ArticlePage slug={currentPage.slug} onNavigate={handleNavigate} />
        )}
        {currentPage === 'contact' && <ContactPage settings={storeData.settings} />}
        {currentPage === 'faq' && <FaqPage onNavigate={handleNavigate} />}
        {currentPage === 'privacy' && <PrivacyPage onNavigate={handleNavigate} />}
        {currentPage === 'admin' && (
          <AdminPage
            storeData={storeData}
            onRefreshData={() => loadData(true)}
            onSaveData={handleSaveStoreData}
          />
        )}
      </main>

      {/* Footer */}
      {!isAdmin && <Footer onNavigate={handleNavigate} settings={storeData.settings} />}
    </div>
  );
}

export default App;

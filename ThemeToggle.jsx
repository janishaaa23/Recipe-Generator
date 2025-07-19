import React from 'react';

function useDarkMode() {
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // Sync with DOM and localStorage on mount and when storage changes
  React.useEffect(() => {
    const updateMode = () => {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      } else if (saved === 'light') {
        document.documentElement.classList.remove('dark');
        setIsDark(false);
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
          setIsDark(true);
        } else {
          document.documentElement.classList.remove('dark');
          setIsDark(false);
        }
      }
    };
    updateMode();
    window.addEventListener('storage', updateMode);
    return () => window.removeEventListener('storage', updateMode);
  }, []);

  // Listen for class changes (in case something else changes the DOM)
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return [isDark, toggle];
}

const ThemeToggle = ({ small }) => {
  const [isDark, toggle] = useDarkMode();

  return (
    <button
      onClick={toggle}
      className={
        small
          ? 'p-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-base'
          : 'fixed top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 z-50'
      }
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      style={small ? { position: 'static', fontSize: '1.1rem' } : {}}
    >
      <span className="sr-only">Toggle dark mode</span>
      {isDark ? (
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;

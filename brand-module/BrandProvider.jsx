import React, { createContext, useContext, useState, useEffect } from 'react';

const BrandContext = createContext();

export const useBrand = () => useContext(BrandContext);

export const BrandProvider = ({ children, initialTheme = 'glassmorphism' }) => {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'glassmorphism' ? 'premium' : 'glassmorphism'));
  };

  return (
    <BrandContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div className={`brand-root theme-${theme}`}>
        {children}
      </div>
    </BrandContext.Provider>
  );
};

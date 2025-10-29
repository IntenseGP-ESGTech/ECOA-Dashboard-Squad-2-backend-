import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token válido no localStorage
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  // Escutar mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Escutar mudanças diretas no localStorage (mesmo tab)
    const interval = setInterval(() => {
      const token = localStorage.getItem('authToken');
      if (!token && isAuthenticated) {
        setIsAuthenticated(false);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

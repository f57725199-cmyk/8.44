import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const SecurityContext = createContext();

export const useSecurity = () => useContext(SecurityContext);

export const SecurityProvider = ({ children }) => {
  const { currentUser } = useAuth();
  // Initialize from sessionStorage to prevent lock on refresh
  const [isLocked, setIsLocked] = useState(() => {
      return sessionStorage.getItem("isUnlocked") !== "true";
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App went to background or tab switched -> Lock it
        setIsLocked(true);
        sessionStorage.removeItem("isUnlocked");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
     // If user logs out, reset lock logic
     if (!currentUser) {
         // When logged out, we technically aren't locked in the "app lock" sense, we are just logged out.
         // But ensuring state is clean is good.
         setIsLocked(false); 
         sessionStorage.removeItem("isUnlocked");
     }
  }, [currentUser]);

  const unlock = () => {
     // This function is called after successful password verification
     setIsLocked(false);
     sessionStorage.setItem("isUnlocked", "true");
  };
  
  const setLocked = (locked) => {
      setIsLocked(locked);
      if (locked) {
          sessionStorage.removeItem("isUnlocked");
      } else {
          sessionStorage.setItem("isUnlocked", "true");
      }
  }

  const value = {
    isLocked,
    setLocked,
    unlock
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

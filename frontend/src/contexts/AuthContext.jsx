/**
 * AuthContext.jsx
 * 
 * Context voor het beheren van authenticatie in de applicatie.
 * Biedt functionaliteit voor inloggen, uitloggen en gebruikersbeheer.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../utils/supabaseClient';

// Creëer de context
const AuthContext = createContext();

/**
 * Hook om de AuthContext te gebruiken
 * @returns {Object} AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth moet worden gebruikt binnen een AuthProvider');
  }
  return context;
};

/**
 * AuthProvider component
 * @component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Haal de huidige sessie op
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (err) {
        console.error('Error getting session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Luister naar auth veranderingen
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false);
      }
    );

    // Cleanup functie
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  /**
   * Logt een gebruiker in met email en wachtwoord
   * @param {string} email - Email van de gebruiker
   * @param {string} password - Wachtwoord van de gebruiker
   */
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setSession(data.session);
      setUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registreert een nieuwe gebruiker
   * @param {string} email - Email van de gebruiker
   * @param {string} password - Wachtwoord van de gebruiker
   * @param {Object} metadata - Optionele metadata voor de gebruiker
   */
  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logt de huidige gebruiker uit
   */
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Stuurt een wachtwoord reset link naar de opgegeven email
   * @param {string} email - Email van de gebruiker
   */
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update het gebruikersprofiel
   * @param {Object} updates - Updates voor het profiel
   */
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) {
        throw error;
      }
      
      setUser(data.user);
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context waarde
  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  /**
   * Children componenten
   */
  children: PropTypes.node.isRequired
};

export default AuthContext;

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthListener() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAndRedirect = (session) => {
      // 1. If we have a user...
      if (session) {
        // 2. AND we are currently on a "Public" page (aka NOT inside /app)
        // This handles '/', '/login', '/pricing', etc.
        if (!location.pathname.startsWith('/app')) {
          console.log("User detected on public page. Redirecting to Dashboard...");
          navigate('/app', { replace: true });
        }
      }
    };

    // Check immediately on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAndRedirect(session);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAndRedirect(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  return null;
}
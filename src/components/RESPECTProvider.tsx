'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface RESPECTContextType {
  isRespectLaunch: boolean;
  isAuthenticating: boolean;
  localUser: any | null;
  launchInfo: {
    auth: string | null;
    endpoint: string | null;
    givenName: string | null;
    activityId: string | null;
    version: string | null;
  };
}

const RESPECTContext = createContext<RESPECTContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export function RESPECTProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [isRespectLaunch, setIsRespectLaunch] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);
  const [launchInfo, setLaunchInfo] = useState<RESPECTContextType['launchInfo']>({
    auth: null,
    endpoint: null,
    givenName: null,
    activityId: null,
    version: null,
  });

  const performSSO = async (auth: string, endpoint: string) => {
    try {
      setIsAuthenticating(true);
      const res = await fetch(`${API_BASE_URL}/auth/respect-sso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: auth, endpoint }),
      });

      if (res.ok) {
        const json = await res.json();
        const { token, user } = json.data || json;
        
        // Store token in cookie if possible (or localStorage)
        localStorage.setItem('auth_token', token);
        document.cookie = `lc_access_token=${token}; path=/; max-age=3600; SameSite=Lax`;
        
        setLocalUser(user);
        console.log('RESPECT SSO Succeeded:', user.name);
      } else {
        console.error('RESPECT SSO Failed:', res.statusText);
      }
    } catch (err) {
      console.error('RESPECT SSO Error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    const version = searchParams.get('respectLaunchVersion');
    if (version === '1') {
      const auth = searchParams.get('auth');
      const endpoint = searchParams.get('endpoint');

      setIsRespectLaunch(true);
      setLaunchInfo({
        version,
        auth,
        endpoint,
        givenName: searchParams.get('given_name'),
        activityId: searchParams.get('activity_id'),
      });
      
      if (auth && endpoint) {
        performSSO(auth, endpoint);
      }
      
      console.log('RESPECT Launch Detected:', {
        auth: auth ? '***' : null,
        endpoint,
        activityId: searchParams.get('activity_id'),
      });
    }
  }, [searchParams]);

  return (
    <RESPECTContext.Provider value={{ isRespectLaunch, isAuthenticating, localUser, launchInfo }}>
      {children}
    </RESPECTContext.Provider>
  );
}

export function useRESPECT() {
  const context = useContext(RESPECTContext);
  if (context === undefined) {
    throw new Error('useRESPECT must be used within a RESPECTProvider');
  }
  return context;
}

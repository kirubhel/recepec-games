'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface RESPECTContextType {
  isRespectLaunch: boolean;
  launchInfo: {
    auth: string | null;
    endpoint: string | null;
    givenName: string | null;
    activityId: string | null;
    version: string | null;
  };
}

const RESPECTContext = createContext<RESPECTContextType | undefined>(undefined);

export function RESPECTProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [isRespectLaunch, setIsRespectLaunch] = useState(false);
  const [launchInfo, setLaunchInfo] = useState<RESPECTContextType['launchInfo']>({
    auth: null,
    endpoint: null,
    givenName: null,
    activityId: null,
    version: null,
  });

  useEffect(() => {
    const version = searchParams.get('respectLaunchVersion');
    if (version === '1') {
      setIsRespectLaunch(true);
      setLaunchInfo({
        version,
        auth: searchParams.get('auth'),
        endpoint: searchParams.get('endpoint'),
        givenName: searchParams.get('given_name'),
        activityId: searchParams.get('activity_id'),
      });
      
      console.log('RESPECT Launch Detected:', {
        auth: searchParams.get('auth') ? '***' : null,
        endpoint: searchParams.get('endpoint'),
        activityId: searchParams.get('activity_id'),
      });
    }
  }, [searchParams]);

  return (
    <RESPECTContext.Provider value={{ isRespectLaunch, launchInfo }}>
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

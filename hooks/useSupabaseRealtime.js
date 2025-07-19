'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useSupabaseRealtime(table, callback) {
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);
} 
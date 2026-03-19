'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (!data.session) {
          router.replace('/admin/login');
          return;
        }

        setReady(true);
      } catch {
        router.replace('/admin/login');
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (cancelled) return;
        if (!session) {
          setReady(false);
          router.replace('/admin/login');
        } else {
          setReady(true);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando sesión...</p>
      </div>
    );
  }

  return <>{children}</>;
}


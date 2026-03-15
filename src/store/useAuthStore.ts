import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { Profile } from '@/types';
import { supabase } from '@/services/supabase';
import { authService } from '@/services/auth';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  loadProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),

  loadProfile: async () => {
    const session = get().session;
    if (!session) {
      set({ isLoading: false });
      return;
    }
    try {
      const profile = await authService.getProfile(session.user.id);
      set({ profile, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await authService.signOut();
    set({ session: null, profile: null });
  },
}));

// Supabase 세션 변화 감지
supabase.auth.onAuthStateChange((_, session) => {
  useAuthStore.getState().setSession(session);
  if (session) {
    useAuthStore.getState().loadProfile();
  } else {
    useAuthStore.getState().setProfile(null);
  }
});

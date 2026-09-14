import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  signUp: (email: string, password: string, username: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (dataOrUsername: Partial<UserProfile> | string, avatarUrl?: string) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  loginAsDemo: (role?: 'user' | 'admin') => void;
  demoLogin: (role?: 'user' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_USER: UserProfile = {
  id: 'usr-spotibai-demo',
  email: 'creator@spotibai.io',
  username: 'Audio ni Bai',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z',
};

const LOCAL_USER_KEY = 'spotibai_active_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser({
                id: profile.id,
                email: session.user.email || profile.email || '',
                username: profile.username || 'MusicLover',
                avatar_url: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                role: profile.role || 'user',
                created_at: profile.created_at || new Date().toISOString(),
              });
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                username: session.user.user_metadata?.username || 'MusicLover',
                avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                role: 'user',
                created_at: new Date().toISOString(),
              });
            }
          }

          // Listen to auth changes
          const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              const { data: profile } = await supabase!
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              setUser({
                id: session.user.id,
                email: session.user.email || '',
                username: profile?.username || session.user.user_metadata?.username || 'MusicLover',
                avatar_url: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                role: profile?.role || 'user',
                created_at: profile?.created_at || new Date().toISOString(),
              });
            } else {
              setUser(null);
            }
          });

          setIsLoading(false);
          return () => {
            listener.subscription.unsubscribe();
          };
        } catch (err) {
          console.error('Error in Supabase auth setup:', err);
        }
      }

      // Fallback: Check local storage for persistent session
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && (parsed.username === 'AudioVibe' || parsed.username === 'AudioWave')) {
            parsed.username = 'Audio ni Bai';
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(parsed));
          }
          setUser(parsed);
        } catch {
          localStorage.removeItem(LOCAL_USER_KEY);
        }
      } else {
        // Provide a default active guest/user so the app is instantly usable and delightful
        const defaultUser: UserProfile = {
          id: 'usr-spotibai-demo',
          email: 'creator@spotibai.io',
          username: 'Audio ni Bai',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          role: 'admin',
          created_at: '2024-01-01T00:00:00Z',
        };
        setUser(defaultUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultUser));
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) {
          showToast(error.message, 'error');
          return false;
        }
        showToast('Welcome back to SPOTIBAI!', 'success');
        return true;
      } catch (err: any) {
        showToast(err.message || 'Login failed', 'error');
        return false;
      }
    }

    // Local / Offline authentication simulation
    const mockUser: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      email,
      username: email.split('@')[0],
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
      created_at: new Date().toISOString(),
    };
    setUser(mockUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    showToast(`Logged in as ${mockUser.username}!`, 'success');
    return true;
  };

  const register = async (email: string, pass: string, username: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { username },
          },
        });
        if (error) {
          showToast(error.message, 'error');
          return false;
        }

        // Insert to profiles table if user is created
        if (data.user) {
          await supabase.from('profiles').insert([
            {
              id: data.user.id,
              username,
              email,
              avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
              role: 'user',
            },
          ]);
        }

        showToast('Account created successfully! Welcome to SPOTIBAI.', 'success');
        return true;
      } catch (err: any) {
        showToast(err.message || 'Registration failed', 'error');
        return false;
      }
    }

    // Local registration
    const newUser: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      email,
      username: username || email.split('@')[0],
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role: 'user',
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
    showToast(`Welcome to SPOTIBAI, ${newUser.username}!`, 'success');
    return true;
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error logging out of Supabase:', err);
      }
    }
    setUser(DEFAULT_USER);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(DEFAULT_USER));
  };

  const signIn = async (email: string, pass: string): Promise<{ error?: string }> => {
    const success = await login(email, pass);
    return success ? {} : { error: 'Failed to sign in. Please verify your credentials.' };
  };

  const signUp = async (email: string, pass: string, uname: string): Promise<{ error?: string }> => {
    const success = await register(email, pass, uname);
    return success ? {} : { error: 'Failed to sign up. Please try another email or username.' };
  };

  const updateProfile = async (
    dataOrUsername: Partial<UserProfile> | string,
    avatarUrl?: string
  ): Promise<boolean> => {
    if (!user) return false;

    let updatedUsername = user.username;
    let updatedAvatar = user.avatar_url;
    let updatedRole = user.role;

    if (typeof dataOrUsername === 'string') {
      updatedUsername = dataOrUsername;
      if (avatarUrl) updatedAvatar = avatarUrl;
    } else {
      if (dataOrUsername.username) updatedUsername = dataOrUsername.username;
      if (dataOrUsername.avatar_url) updatedAvatar = dataOrUsername.avatar_url;
      if (dataOrUsername.role) updatedRole = dataOrUsername.role;
    }

    const updated: UserProfile = {
      ...user,
      username: updatedUsername,
      avatar_url: updatedAvatar,
      role: updatedRole,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            username: updated.username,
            avatar_url: updated.avatar_url,
            role: updated.role,
          })
          .eq('id', user.id);

        if (error) {
          showToast(error.message, 'error');
          return false;
        }
      } catch (err: any) {
        showToast('Failed to update Supabase profile: ' + err.message, 'error');
        return false;
      }
    }

    setUser(updated);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
    showToast('Profile updated successfully!', 'success');
    return true;
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          showToast(error.message, 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err.message, 'error');
        return false;
      }
    }
    showToast('Password updated successfully!', 'success');
    return true;
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
          showToast(error.message, 'error');
          return false;
        }
      } catch (err: any) {
        showToast(err.message, 'error');
        return false;
      }
    }
    showToast(`Password reset link sent to ${email}`, 'info');
    return true;
  };

  const loginAsDemo = (role: 'user' | 'admin' = 'user') => {
    const demoUser: UserProfile = {
      id: role === 'admin' ? 'usr-admin-demo' : 'usr-spotibai-demo',
      email: role === 'admin' ? 'admin@spotibai.io' : 'listener@spotibai.io',
      username: role === 'admin' ? 'AdminSoundMaster' : 'Audio ni Bai',
      avatar_url: role === 'admin'
        ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      role,
      created_at: '2024-01-01T00:00:00Z',
    };
    setUser(demoUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
    showToast(`Switched session to ${role.toUpperCase()} mode!`, 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured: isSupabaseConfigured,
        login,
        signIn,
        register,
        signUp,
        logout,
        signOut: logout,
        updateProfile,
        changePassword,
        sendPasswordReset,
        loginAsDemo,
        demoLogin: loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

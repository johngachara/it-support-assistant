import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create stub or real client based on environment variables
let supabaseClient;

// If environment variables are missing, create a minimal stub client that
// provides the auth/mfa interfaces used by the app. This prevents the app
// from crashing on import during development when env vars aren't set.
if (!supabaseUrl || !supabaseKey) {
    console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Supabase client will use a stub for local development.');

    supabaseClient = {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
            signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
            signOut: async () => ({ error: new Error('Supabase not configured') }),
            resetPasswordForEmail: async () => ({ data: null, error: new Error('Supabase not configured') }),
            updateUser: async () => ({ data: null, error: new Error('Supabase not configured') }),
            mfa: {
                enroll: async () => ({ data: null, error: new Error('Supabase not configured') }),
                challenge: async () => ({ data: null, error: new Error('Supabase not configured') }),
                verify: async () => ({ data: null, error: new Error('Supabase not configured') }),
                listFactors: async () => ({ data: { totp: [], all: [] }, error: null }),
                getAuthenticatorAssuranceLevel: async () => ({ 
                    data: { currentLevel: null, nextLevel: null }, 
                    error: null 
                })
            }
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: null, error: new Error('Supabase not configured') })
                }),
                order: () => ({
                    limit: async () => ({ data: [], error: new Error('Supabase not configured') })
                })
            }),
            insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
            update: async () => ({ data: null, error: new Error('Supabase not configured') }),
            delete: async () => ({ data: null, error: new Error('Supabase not configured') })
        }),
        functions: {
            invoke: async () => ({ data: null, error: new Error('Supabase not configured') })
        }
    };
} else {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
}

export const supabase = supabaseClient;

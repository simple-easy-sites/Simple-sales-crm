import { createClient, SupabaseClient, PostgrestResponse, PostgrestSingleResponse, AuthResponse, AuthError, User, Session } from '@supabase/supabase-js';
import { User as AppUser } from '../types'; // Import your app's User type

// IMPORTANT: Replace with your Supabase project's URL and Anon Key
const supabaseUrlFromEnv: string = 'YOUR_SUPABASE_URL'; // e.g., 'https://your-project-id.supabase.co'
const supabaseAnonKeyFromEnv: string = 'YOUR_SUPABASE_ANON_KEY'; // e.g., 'eyJh....'

let supabaseExport: SupabaseClient;

const isConfigInvalid = supabaseUrlFromEnv === 'YOUR_SUPABASE_URL' || 
                        supabaseAnonKeyFromEnv === 'YOUR_SUPABASE_ANON_KEY' || 
                        !supabaseUrlFromEnv || 
                        !supabaseAnonKeyFromEnv || 
                        !supabaseUrlFromEnv.startsWith('http');

if (isConfigInvalid) {
  console.error(
    `CRITICAL: Supabase URL or Anon Key is not configured or is invalid. 
    URL must start with http/https. Current URL: '${supabaseUrlFromEnv}'.
    Please update these values in lib/supabaseClient.ts. 
    The application will NOT function correctly with Supabase until these are set.
    A non-functional Supabase client will be used to prevent immediate app crash.`
  );

  const configError = { name: 'ConfigError', message: 'Supabase not configured' };
  
  const dummyAuth = {
    getSession: async (): Promise<{ data: { session: Session | null }, error: AuthError | null }> => ({ data: { session: null }, error: configError as AuthError }),
    onAuthStateChange: (_callback: (event: string, session: Session | null) => void): { data: { subscription: { unsubscribe: () => void } } } => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async (_credentials: any): Promise<AuthResponse> => ({ data: { user: null, session: null }, error: configError as AuthError }),
    signOut: async (): Promise<{ error: AuthError | null }> => ({ error: null }), // signOut should ideally not error if called when not configured for user experience
  };

  const dummyQueryBuilder = {
    select: function(_query?: string) { return this._errorPromise(); },
    insert: function(_values: any) { return this._errorPromise(); },
    update: function(_values: any) { return this._errorPromise(); },
    delete: function() { return this._errorPromise(); },
    eq: function(_column: string, _value: any) { return this; },
    order: function(_column: string, _options?: any) { return this; },
    // Generic error promise for PostgrestResponse (multi-row)
    _errorPromise: function<T = any>(): Promise<PostgrestResponse<T>> {
        return Promise.resolve({ data: null, error: configError, count: null, status: 0, statusText: 'Configuration Error' } as PostgrestResponse<T>);
    },
    // Generic error promise for PostgrestSingleResponse (single-row)
    _errorSinglePromise: function<T = any>(): Promise<PostgrestSingleResponse<T>> {
        return Promise.resolve({ data: null, error: configError, count: null, status: 0, statusText: 'Configuration Error' } as PostgrestSingleResponse<T>);
    }
  };
  
  const dummyFrom = (_table: string) => {
    const builderInstance = { ...dummyQueryBuilder };
    
    // Override methods that might return a single response or have specific chaining for .select()
    builderInstance.select = function(query?: string) {
      // This select can be chained (eq, order) or can be terminal (e.g. after insert/update)
      const chainableSelect = { ...this }; // 'this' refers to builderInstance
      (chainableSelect as any).then = (onfulfilled: any, onrejected: any) => {
        return this._errorPromise().then(onfulfilled, onrejected);
      };
       // If .select() is called after insert/update
      if (this.hasOwnProperty('_isMutationResult')) {
         return this._errorPromise();
      }
      return chainableSelect;
    };

    builderInstance.insert = function(values: any) {
      const self = this;
      return {
        select: function() { return self._errorPromise(); },
        then: function(onfulfilled: any, onrejected: any) {
            return self._errorPromise().then(onfulfilled, onrejected);
        },
        _isMutationResult: true // Mark that this was an insert
      };
    };
     builderInstance.update = function(values: any) {
      const self = this;
      const chainableUpdate = { 
        ...this,
        eq: function(_c:string, _v:any) { return this;},
        select: function() { return self._errorPromise(); } 
      };
      (chainableUpdate as any).then = (onfulfilled: any, onrejected: any) => {
            return self._errorPromise().then(onfulfilled, onrejected);
      };
      (chainableUpdate as any)._isMutationResult = true;
      return chainableUpdate;
    };
    builderInstance.delete = function() {
      const self = this;
      const chainableDelete = { 
        ...this,
        eq: function(_c:string, _v:any) { return this;} 
      };
       (chainableDelete as any).then = (onfulfilled: any, onrejected: any) => {
            return self._errorPromise().then(onfulfilled, onrejected);
      };
      return chainableDelete;
    };
    return builderInstance;
  };

  supabaseExport = {
    auth: dummyAuth,
    from: dummyFrom,
    // Add any other top-level Supabase client methods your app uses, pointing to dummy versions
  } as any as SupabaseClient; // Cast to SupabaseClient, acknowledging it's a minimal mock

} else {
  supabaseExport = createClient(supabaseUrlFromEnv, supabaseAnonKeyFromEnv);
}

export const supabase = supabaseExport;

export const mapSupabaseUserToAppUser = (supabaseUser: User | null): AppUser | null => {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    username: supabaseUser.email || '', // Using email as username
  };
};
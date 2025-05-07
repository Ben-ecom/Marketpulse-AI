// Mock Supabase client
// Deze mock versie vervangt de echte Supabase client om database-fouten te voorkomen
// wanneer de 'projects' tabel niet bestaat in de database

// Helper functie om een succesvolle response te simuleren
const createSuccessResponse = (data = null) => ({
  data,
  error: null
});

// Helper functie om een error response te simuleren
const createErrorResponse = (message) => ({
  data: null,
  error: { message }
});

// Mock Supabase client met alle benodigde methoden
export const supabase = {
  // Auth methoden
  auth: {
    getSession: async () => createSuccessResponse({ session: { user: { id: 'mock-user-id', email: 'mock@example.com' } } }),
    signIn: async () => createSuccessResponse({ user: { id: 'mock-user-id', email: 'mock@example.com' } }),
    signUp: async () => createSuccessResponse({ user: { id: 'mock-user-id', email: 'mock@example.com' } }),
    signOut: async () => createSuccessResponse(),
    onAuthStateChange: (callback) => {
      // Roep de callback direct aan met een mock sessie
      // Dit simuleert het gedrag van de echte Supabase client
      setTimeout(() => {
        callback('SIGNED_IN', { 
          user: { 
            id: 'mock-user-id', 
            email: 'mock@example.com',
            user_metadata: {
              full_name: 'Mock User'
            },
            is_admin: true
          } 
        });
      }, 0);
      
      // Simuleer een subscription object met een unsubscribe methode
      const subscription = {
        unsubscribe: () => {}
      };
      
      // Geef een mock data object terug met de subscription
      return { data: { subscription } };
    }
  },
  
  // Database methoden
  from: (table) => ({
    select: (columns = '*') => ({
      eq: (column, value) => ({
        order: (column, { ascending }) => ({
          single: async () => {
            if (table === 'projects') {
              return createSuccessResponse({
                id: 'mock-project-id',
                name: 'Mock Project',
                category: 'Mock Category',
                user_id: 'mock-user-id',
                created_at: new Date().toISOString()
              });
            }
            return createSuccessResponse(null);
          },
          limit: (limit) => ({
            range: (start, end) => ({
              then: (callback) => callback(createSuccessResponse([]))
            }),
            then: (callback) => callback(createSuccessResponse([]))
          }),
          then: (callback) => callback(createSuccessResponse([]))
        }),
        then: (callback) => callback(createSuccessResponse([]))
      }),
      then: (callback) => callback(createSuccessResponse([]))
    }),
    insert: (data) => ({
      select: () => ({
        single: async () => createSuccessResponse({ id: 'mock-id', ...data[0] })
      })
    }),
    update: (data) => ({
      eq: (column, value) => ({
        then: (callback) => callback(createSuccessResponse({ id: value, ...data }))
      })
    }),
    delete: () => ({
      eq: (column, value) => ({
        then: (callback) => callback(createSuccessResponse())
      })
    })
  }),
  
  // Storage methoden
  storage: {
    from: (bucket) => ({
      upload: async (path, file) => createSuccessResponse({ path }),
      getPublicUrl: (path) => ({ data: { publicUrl: `https://mock-storage.com/${bucket}/${path}` } })
    })
  }
};

export default supabase;

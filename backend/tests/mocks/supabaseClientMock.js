/**
 * Mock Supabase Client voor tests
 * 
 * Deze module biedt een mock implementatie van de Supabase client voor testdoeleinden.
 * Hiermee kunnen we tests uitvoeren zonder afhankelijk te zijn van een echte Supabase verbinding.
 */

// Mock Supabase client
const supabase = {
  from: (table) => ({
    select: () => ({
      eq: () => ({
        data: [],
        error: null
      }),
      data: [],
      error: null
    }),
    insert: () => ({
      data: { id: 'mock-id' },
      error: null
    }),
    update: () => ({
      data: { id: 'mock-id' },
      error: null
    }),
    delete: () => ({
      data: null,
      error: null
    })
  }),
  auth: {
    getUser: () => ({
      data: { user: { id: 'mock-user-id' } },
      error: null
    })
  },
  storage: {
    from: (bucket) => ({
      upload: () => ({
        data: { path: 'mock-path' },
        error: null
      }),
      getPublicUrl: () => ({
        data: { publicUrl: 'https://mock-url.com/mock-file' }
      })
    })
  }
};

export { supabase };

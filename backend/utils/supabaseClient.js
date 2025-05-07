/**
 * Mock Supabase Client
 * 
 * Deze module biedt een mock implementatie van de Supabase client voor ontwikkelingsdoeleinden.
 * In een productieomgeving zou dit vervangen worden door een echte Supabase client.
 */

import dotenv from 'dotenv';

dotenv.config();

// Mock Supabase client
const supabase = {
  from: (table) => ({
    select: (columns) => ({
      eq: (column, value) => ({
        data: table === 'projects' ? [
          {
            id: 'mock-project-1',
            name: 'Mock Project 1',
            description: 'Dit is een mock project',
            category: 'Elektronica',
            subcategory: 'Smart Home',
            user_id: 'mock-user-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'active'
          }
        ] : [],
        error: null
      }),
      single: () => ({
        data: table === 'projects' ? {
          id: 'mock-project-1',
          name: 'Mock Project 1',
          description: 'Dit is een mock project',
          category: 'Elektronica',
          subcategory: 'Smart Home',
          user_id: 'mock-user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'active'
        } : null,
        error: null
      }),
      order: (column, options) => ({
        data: table === 'projects' ? [
          {
            id: 'mock-project-1',
            name: 'Mock Project 1',
            description: 'Dit is een mock project',
            category: 'Elektronica',
            subcategory: 'Smart Home',
            user_id: 'mock-user-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'active'
          }
        ] : [],
        error: null
      })
    }),
    insert: (data) => ({
      select: () => ({
        single: () => ({
          data: { ...data, id: 'mock-id-' + Date.now() },
          error: null
        })
      })
    }),
    update: (data) => ({
      eq: () => ({
        select: () => ({
          single: () => ({
            data: { ...data, id: 'mock-id-1', updated_at: new Date().toISOString() },
            error: null
          })
        })
      })
    }),
    delete: () => ({
      eq: () => ({
        data: null,
        error: null
      })
    })
  }),
  auth: {
    getUser: (token) => ({
      data: {
        user: {
          id: 'mock-user-1',
          email: 'user@example.com',
          user_metadata: {
            name: 'Test User'
          },
          app_metadata: {
            roles: ['user']
          }
        }
      },
      error: null
    })
  },
  storage: {
    from: (bucket) => ({
      upload: (path, file) => ({
        data: { path },
        error: null
      }),
      getPublicUrl: (path) => ({
        data: { publicUrl: `https://mock-storage.com/${bucket}/${path}` }
      })
    })
  }
};

export { supabase };

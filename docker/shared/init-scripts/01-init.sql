-- Initialisatie script voor MarketPulse AI database

-- Schema's aanmaken
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS storage;

-- Extensies activeren
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Gebruikerstabel
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    role VARCHAR(50) DEFAULT 'user'
);

-- Platformtabellen
CREATE TABLE IF NOT EXISTS public.platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analyses tabel
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Platform data tabellen
CREATE TABLE IF NOT EXISTS public.reddit_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    subreddit VARCHAR(255),
    post_id VARCHAR(255),
    title TEXT,
    content TEXT,
    author VARCHAR(255),
    upvotes INTEGER,
    comments_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.amazon_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    product_id VARCHAR(255),
    product_name TEXT,
    review_id VARCHAR(255),
    review_title TEXT,
    review_content TEXT,
    rating DECIMAL(2,1),
    reviewer_name VARCHAR(255),
    verified_purchase BOOLEAN,
    review_date TIMESTAMP WITH TIME ZONE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.instagram_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    post_id VARCHAR(255),
    caption TEXT,
    image_url TEXT,
    likes_count INTEGER,
    comments_count INTEGER,
    author VARCHAR(255),
    post_date TIMESTAMP WITH TIME ZONE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tiktok_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    video_id VARCHAR(255),
    description TEXT,
    video_url TEXT,
    likes_count INTEGER,
    comments_count INTEGER,
    shares_count INTEGER,
    author VARCHAR(255),
    video_date TIMESTAMP WITH TIME ZONE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analyse resultaten tabellen
CREATE TABLE IF NOT EXISTS public.sentiment_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    platform VARCHAR(50) REFERENCES public.platforms(name),
    data_id UUID,
    positive_score DECIMAL(5,4),
    neutral_score DECIMAL(5,4),
    negative_score DECIMAL(5,4),
    compound_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    platform VARCHAR(50) REFERENCES public.platforms(name),
    keyword VARCHAR(255),
    frequency INTEGER,
    relevance_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Standaard platforms invoegen
INSERT INTO public.platforms (name, description) 
VALUES 
    ('reddit', 'Reddit discussion platform'),
    ('amazon', 'Amazon product reviews'),
    ('instagram', 'Instagram social media platform'),
    ('tiktok', 'TikTok video sharing platform')
ON CONFLICT (name) DO NOTHING;

-- Indexen aanmaken voor betere performance
CREATE INDEX IF NOT EXISTS idx_reddit_data_analysis_id ON public.reddit_data(analysis_id);
CREATE INDEX IF NOT EXISTS idx_amazon_data_analysis_id ON public.amazon_data(analysis_id);
CREATE INDEX IF NOT EXISTS idx_instagram_data_analysis_id ON public.instagram_data(analysis_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_data_analysis_id ON public.tiktok_data(analysis_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_analysis_id ON public.sentiment_analysis(analysis_id);
CREATE INDEX IF NOT EXISTS idx_keywords_analysis_id ON public.keywords(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);

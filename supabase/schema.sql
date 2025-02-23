-- Create song_lines table
CREATE TABLE IF NOT EXISTS lyrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lyric TEXT NOT NULL,
    is_question BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create full_songs table
CREATE TABLE IF NOT EXISTS songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_lyric_id UUID REFERENCES lyrics(id),
    song_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS lyrics_lyric_idx ON lyrics(lyric);
CREATE INDEX IF NOT EXISTS songs_original_lyric_id_idx ON songs(original_lyric_id);

-- Enable Row Level Security (RLS)
ALTER TABLE lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Create simple policies that allow all operations
CREATE POLICY "Allow all operations on lyrics" ON lyrics FOR ALL USING (true);
CREATE POLICY "Allow all operations on songs" ON songs FOR ALL USING (true); 
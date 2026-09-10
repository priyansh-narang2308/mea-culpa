CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    content TEXT NOT NULL
        CHECK (char_length(content) <= 280),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    reaction_heart INT NOT NULL DEFAULT 0,
    reaction_laugh INT NOT NULL DEFAULT 0,
    reaction_shock INT NOT NULL DEFAULT 0,
    reaction_sad INT NOT NULL DEFAULT 0
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts"
ON posts
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert posts"
ON posts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update reactions"
ON posts
FOR UPDATE
USING (true);

ALTER TABLE posts
ADD COLUMN category TEXT NOT NULL DEFAULT 'confession'
CHECK (
    category IN ('confession', 'rant', 'funny', 'advice')
);

ALTER TABLE posts
ADD COLUMN campus TEXT NOT NULL DEFAULT 'general';

CREATE INDEX idx_posts_campus
ON posts (campus);

CREATE TABLE replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    post_id UUID NOT NULL
        REFERENCES posts(id)
        ON DELETE CASCADE,

    content TEXT NOT NULL
        CHECK (char_length(content) <= 200),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


ALTER TABLE replies
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read replies"
ON replies
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert replies"
ON replies
FOR INSERT
WITH CHECK (true);
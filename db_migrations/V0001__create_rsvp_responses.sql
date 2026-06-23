CREATE TABLE rsvp_responses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    attend TEXT NOT NULL,
    guests INTEGER DEFAULT 1,
    wishes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Enable RLS on all tables
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_block_drills ENABLE ROW LEVEL SECURITY;

-- Single-user policy: only Ryan
CREATE POLICY ryan_only ON source_documents FOR ALL
  USING (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com');

CREATE POLICY ryan_only ON teams FOR ALL
  USING (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com');

CREATE POLICY ryan_only ON drills FOR ALL
  USING (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com');

CREATE POLICY ryan_only ON events FOR ALL
  USING (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com');

CREATE POLICY ryan_only ON plans FOR ALL
  USING (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com');

CREATE POLICY ryan_only ON plan_blocks FOR ALL
  USING (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com');

CREATE POLICY ryan_only ON plan_block_drills FOR ALL
  USING (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'ryan.mchaffie@gmail.com');

-- Fix: Add INSERT policies for scans, scan_results, takedown_requests
-- Previously only SELECT policies existed, causing all writes to be silently blocked

-- scans: users can insert scans for their own protected persons
CREATE POLICY "Users can insert own scans" ON scans FOR INSERT
WITH CHECK (
  person_id IN (SELECT id FROM protected_persons WHERE profile_id = auth.uid())
);

-- scan_results: users can insert results for their own scans
CREATE POLICY "Users can insert own scan results" ON scan_results FOR INSERT
WITH CHECK (
  scan_id IN (
    SELECT s.id FROM scans s
    JOIN protected_persons p ON s.person_id = p.id
    WHERE p.profile_id = auth.uid()
  )
);

-- takedown_requests: users can insert takedowns for their own persons
CREATE POLICY "Users can insert own takedown requests" ON takedown_requests FOR INSERT
WITH CHECK (
  person_id IN (SELECT id FROM protected_persons WHERE profile_id = auth.uid())
);

-- scans: users can update their own scans (needed for status updates)
CREATE POLICY "Users can update own scans" ON scans FOR UPDATE
USING (
  person_id IN (SELECT id FROM protected_persons WHERE profile_id = auth.uid())
);

-- takedown_requests: users can update their own takedowns
CREATE POLICY "Users can update own takedown requests" ON takedown_requests FOR UPDATE
USING (
  person_id IN (SELECT id FROM protected_persons WHERE profile_id = auth.uid())
);

-- profiles: users can insert their own profile (needed for trigger)
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Add exposed_fields column to scan_results
ALTER TABLE scan_results ADD COLUMN IF NOT EXISTS exposed_fields JSONB DEFAULT '[]'::jsonb;

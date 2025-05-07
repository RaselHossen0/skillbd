-- Add a 'time' column to mentorship_sessions for API compatibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mentorship_sessions' AND column_name = 'time'
  ) THEN
    ALTER TABLE mentorship_sessions ADD COLUMN "time" TIME;
    -- Backfill with the time part of start_time if available
    UPDATE mentorship_sessions SET "time" = start_time::time WHERE start_time IS NOT NULL;
  END IF;
END $$;

-- Optionally, create a trigger to keep 'time' in sync with 'start_time'
CREATE OR REPLACE FUNCTION sync_session_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_time IS NOT NULL THEN
    NEW."time" := NEW.start_time::time;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'mentorship_sessions'
  ) THEN
    DROP TRIGGER IF EXISTS sync_session_time_trigger ON mentorship_sessions;
    CREATE TRIGGER sync_session_time_trigger
    BEFORE INSERT OR UPDATE ON mentorship_sessions
    FOR EACH ROW
    EXECUTE FUNCTION sync_session_time();
  END IF;
END $$; 
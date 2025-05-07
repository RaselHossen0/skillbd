-- Add a 'zoom_link' column for API compatibility if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mentorship_sessions' AND column_name = 'zoom_link'
  ) THEN
    ALTER TABLE mentorship_sessions ADD COLUMN zoom_link TEXT;
    -- Backfill with existing zoom_meeting_link values
    UPDATE mentorship_sessions SET zoom_link = zoom_meeting_link WHERE zoom_meeting_link IS NOT NULL;
  END IF;
END $$;

-- Keep zoom_link and zoom_meeting_link in sync
CREATE OR REPLACE FUNCTION sync_zoom_link()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.zoom_meeting_link IS NOT NULL THEN
    NEW.zoom_link := NEW.zoom_meeting_link;
  ELSIF NEW.zoom_link IS NOT NULL THEN
    NEW.zoom_meeting_link := NEW.zoom_link;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'mentorship_sessions'
  ) THEN
    DROP TRIGGER IF EXISTS sync_zoom_link_trigger ON mentorship_sessions;
    CREATE TRIGGER sync_zoom_link_trigger
    BEFORE INSERT OR UPDATE ON mentorship_sessions
    FOR EACH ROW
    EXECUTE FUNCTION sync_zoom_link();
  END IF;
END $$;

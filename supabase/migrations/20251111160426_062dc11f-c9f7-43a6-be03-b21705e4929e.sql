-- Ensure trigger is attached to sessions table for auto-generating session codes
-- Drop trigger if it exists to avoid duplicates
DROP TRIGGER IF EXISTS set_session_code_trigger ON public.sessions;

-- Create trigger to auto-generate session code before insert
CREATE TRIGGER set_session_code_trigger
BEFORE INSERT ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_session_code();
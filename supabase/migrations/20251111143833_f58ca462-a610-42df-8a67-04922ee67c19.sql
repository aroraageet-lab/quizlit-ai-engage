-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  theme_color TEXT DEFAULT '#8B5CF6',
  background_style TEXT DEFAULT 'gradient',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Quizzes policies
CREATE POLICY "Users can view their own quizzes"
  ON public.quizzes FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create quizzes"
  ON public.quizzes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own quizzes"
  ON public.quizzes FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own quizzes"
  ON public.quizzes FOR DELETE
  USING (auth.uid() = created_by);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Questions policies (allow access to quiz owner)
CREATE POLICY "Users can view questions for their quizzes"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = questions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create questions for their quizzes"
  ON public.questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = questions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update questions for their quizzes"
  ON public.questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = questions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions for their quizzes"
  ON public.questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = questions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

-- Create sessions table for live quiz sessions
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  session_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  current_question_id UUID REFERENCES public.questions(id),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Sessions policies (presenter can manage, audience can view active sessions)
CREATE POLICY "Users can view their own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view active sessions by code"
  ON public.sessions FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = created_by);

-- Create responses table for audience answers
CREATE TABLE public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  participant_name TEXT,
  selected_answer TEXT NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on responses
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Responses policies (allow public insert, presenter can view)
CREATE POLICY "Anyone can submit responses"
  ON public.responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Session owners can view responses"
  ON public.responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = responses.session_id
      AND sessions.created_by = auth.uid()
    )
  );

-- Function to generate 6-digit session code
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM public.sessions WHERE session_code = code AND status != 'ended') INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate session codes
CREATE OR REPLACE FUNCTION set_session_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.session_code IS NULL THEN
    NEW.session_code := generate_session_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_code_trigger
  BEFORE INSERT ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_session_code();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable realtime for sessions and responses
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
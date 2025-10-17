-- Create table for therapist assignments and recommendations
CREATE TABLE public.therapist_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.therapist_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own assignments"
ON public.therapist_assignments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own assignments"
ON public.therapist_assignments
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_therapist_assignments_user_id ON public.therapist_assignments(user_id);
CREATE INDEX idx_therapist_assignments_due_date ON public.therapist_assignments(due_date);
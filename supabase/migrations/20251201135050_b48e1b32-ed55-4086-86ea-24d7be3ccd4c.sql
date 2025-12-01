-- Create storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'conversions',
  'conversions',
  true,
  20971520,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'application/zip']
);

-- Create uploads tracking table
CREATE TABLE public.uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_filename TEXT NOT NULL,
  original_path TEXT NOT NULL,
  svg_filename TEXT,
  svg_path TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  mode TEXT NOT NULL DEFAULT 'blackwhite',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour')
);

-- Enable RLS on uploads table (public access for this tool)
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view uploads
CREATE POLICY "Anyone can view uploads"
ON public.uploads
FOR SELECT
USING (true);

-- Allow anyone to insert uploads
CREATE POLICY "Anyone can insert uploads"
ON public.uploads
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update uploads
CREATE POLICY "Anyone can update uploads"
ON public.uploads
FOR UPDATE
USING (true);

-- Storage policies for conversions bucket
CREATE POLICY "Anyone can upload to conversions bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'conversions');

CREATE POLICY "Anyone can view conversions bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'conversions');

CREATE POLICY "Anyone can delete from conversions bucket"
ON storage.objects
FOR DELETE
USING (bucket_id = 'conversions');

-- Function to automatically delete expired uploads
CREATE OR REPLACE FUNCTION public.delete_expired_uploads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.uploads
  WHERE expires_at < now();
END;
$$;

-- Create index for faster expiration queries
CREATE INDEX idx_uploads_expires_at ON public.uploads(expires_at);
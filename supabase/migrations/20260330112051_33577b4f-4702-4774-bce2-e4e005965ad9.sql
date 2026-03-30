-- Create storage bucket for violation snapshots
INSERT INTO storage.buckets (id, name, public) VALUES ('violation-snapshots', 'violation-snapshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload violation snapshots
CREATE POLICY "Users can upload violation snapshots" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'violation-snapshots');

-- Allow admins to view all violation snapshots
CREATE POLICY "Anyone can view violation snapshots" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'violation-snapshots');
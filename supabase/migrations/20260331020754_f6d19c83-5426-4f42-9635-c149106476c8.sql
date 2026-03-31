ALTER TABLE public.profiles ADD COLUMN is_blocked boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN blocked_reason text;

-- Allow admins to update any profile (for blocking)
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
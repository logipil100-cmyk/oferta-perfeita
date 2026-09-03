-- Hardening: prevent role self-assignment and remove broad mutation grants.
-- Safe, non-destructive migration.

REVOKE INSERT, DELETE ON public.user_roles FROM authenticated;

DROP POLICY IF EXISTS "user_roles_insert_superadmin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_superadmin" ON public.user_roles;

CREATE POLICY "user_roles_insert_superadmin" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_superadmin((select auth.uid())));

CREATE POLICY "user_roles_delete_superadmin" ON public.user_roles
  FOR DELETE TO authenticated
  USING (
    public.is_superadmin((select auth.uid()))
    AND role <> 'superadmin'
    AND user_id <> (select auth.uid())
  );

-- Keep privileged helpers isolated from caller-controlled search_path.
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','superadmin'));
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'superadmin');
$$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_length CHECK (display_name IS NULL OR char_length(display_name) <= 120);

ALTER TABLE public.stores
  ADD CONSTRAINT stores_text_lengths CHECK (
    char_length(name) BETWEEN 1 AND 160
    AND char_length(slug) BETWEEN 1 AND 160
    AND (description IS NULL OR char_length(description) <= 4000)
  );

ALTER TABLE public.products
  ADD CONSTRAINT products_text_lengths CHECK (
    char_length(title) BETWEEN 1 AND 240
    AND (description IS NULL OR char_length(description) <= 4000)
    AND char_length(affiliate_url) <= 2048
  );

ALTER TABLE public.coupons
  ADD CONSTRAINT coupons_text_lengths CHECK (
    char_length(code) BETWEEN 1 AND 100
    AND char_length(title) BETWEEN 1 AND 240
    AND (description IS NULL OR char_length(description) <= 4000)
  );

CREATE OR REPLACE FUNCTION public.validate_affiliate_url()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.affiliate_url IS NOT NULL AND NEW.affiliate_url !~* '^https://' THEN
    RAISE EXCEPTION 'affiliate_url tem de comecar por https://';
  END IF;
  RETURN NEW;
END; $$; 

REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_superadmin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_superadmin(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';

-- Note: this migration intentionally does not change or delete existing rows.
-- The Supabase MCP should be used to apply and verify it in the connected project.

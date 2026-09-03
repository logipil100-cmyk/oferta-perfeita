-- ENUM
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'superadmin');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  country TEXT DEFAULT 'PT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','superadmin'));
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'superadmin');
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "user_roles_insert_superadmin" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_superadmin(auth.uid()));
CREATE POLICY "user_roles_delete_superadmin" ON public.user_roles FOR DELETE TO authenticated USING (public.is_superadmin(auth.uid()) AND NOT (role = 'superadmin'));

-- new user handler: profile + role (first user becomes superadmin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE has_super BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'superadmin') INTO has_super;
  IF has_super THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'superadmin') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin(auth.uid()));
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- STORES
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  country TEXT NOT NULL DEFAULT 'PT',
  shipping_note TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stores TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores_public_read" ON public.stores FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin(auth.uid()));
CREATE POLICY "stores_admin_write" ON public.stores FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  category_slug TEXT REFERENCES public.categories(slug) ON DELETE SET NULL,
  price NUMERIC(12,2) NOT NULL,
  old_price NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  affiliate_url TEXT NOT NULL,
  coupon_code TEXT,
  shipping_info TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin(auth.uid()));
CREATE POLICY "products_admin_write" ON public.products FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX products_store_idx ON public.products(store_id);
CREATE INDEX products_category_idx ON public.products(category_slug);

CREATE OR REPLACE FUNCTION public.validate_affiliate_url()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.affiliate_url IS NOT NULL AND NEW.affiliate_url !~* '^https://' THEN
    RAISE EXCEPTION 'affiliate_url tem de comecar por https://';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER products_validate_url BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.validate_affiliate_url();

-- COUPONS
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_label TEXT,
  terms TEXT,
  affiliate_url TEXT,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons_public_read" ON public.coupons FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin(auth.uid()));
CREATE POLICY "coupons_admin_write" ON public.coupons FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FAVORITES
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_own" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- PRICE ALERTS
CREATE TABLE public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  target_price NUMERIC(12,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_alerts TO authenticated;
GRANT ALL ON public.price_alerts TO service_role;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_alerts_own" ON public.price_alerts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- SITE SETTINGS
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  label TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT TO anon, authenticated USING (is_public OR public.is_admin(auth.uid()));
CREATE POLICY "site_settings_admin_write" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- REALTIME
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.coupons REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;

-- SEED
INSERT INTO public.categories (slug, name, icon, sort_order) VALUES
  ('tecnologia','Tecnologia','laptop',1),
  ('casa','Casa & Cozinha','house',2),
  ('moda','Moda','shirt',3),
  ('viagens','Viagens','plane',4),
  ('desporto','Desporto','dumbbell',5),
  ('beleza','Beleza','sparkles',6);

INSERT INTO public.stores (slug, name, description, website_url, logo_url, country, shipping_note, is_featured, sort_order) VALUES
  ('techglobal','TechGlobal','Loja demonstrativa de eletrónica e informática com envios para toda a Europa.','https://example.com/techglobal',NULL,'PT','Envio gratuito acima de 50 €',true,1),
  ('casaviva','CasaViva','Loja demonstrativa de artigos para casa, cozinha e decoração.','https://example.com/casaviva',NULL,'PT','Entrega em 2-4 dias úteis',true,2),
  ('modaline','ModaLine','Loja demonstrativa de moda e acessórios para todas as estações.','https://example.com/modaline',NULL,'ES','Devoluções gratuitas em 30 dias',false,3),
  ('viajaja','ViajaJá','Agência demonstrativa de viagens e experiências.','https://example.com/viajaja',NULL,'PT','Reserva flexível',false,4),
  ('fitzone','FitZone','Loja demonstrativa de desporto e nutrição.','https://example.com/fitzone',NULL,'PT','Envio em 24h',false,5);

INSERT INTO public.products (slug, title, description, image_url, store_id, category_slug, price, old_price, currency, affiliate_url, coupon_code, shipping_info, is_featured, expires_at)
SELECT v.slug, v.title, v.description, NULL, s.id, v.cat, v.price, v.old_price, 'EUR', v.url, v.code, v.ship, v.feat, v.exp
FROM (VALUES
  ('portatil-ultrafino-14','Portátil ultrafino 14"','Portátil demonstrativo de 14 polegadas, 16 GB de RAM e SSD de 512 GB.','techglobal','tecnologia',699.00,899.00,'https://example.com/techglobal/portatil-ultrafino-14?aff=globalofertas',NULL,'Envio gratuito',true, now() + interval '20 days'),
  ('auscultadores-anc','Auscultadores com cancelamento de ruído','Auscultadores demonstrativos over-ear com 30h de autonomia.','techglobal','tecnologia',129.90,199.90,'https://example.com/techglobal/auscultadores-anc?aff=globalofertas','SOM20','Envio gratuito',true, now() + interval '10 days'),
  ('monitor-27-qhd','Monitor 27" QHD','Monitor demonstrativo QHD 165 Hz para trabalho e jogos.','techglobal','tecnologia',239.00,309.00,'https://example.com/techglobal/monitor-27-qhd?aff=globalofertas',NULL,'Entrega em 3 dias',false, NULL),
  ('robot-aspirador','Robot aspirador inteligente','Robot demonstrativo com mapeamento e app dedicada.','casaviva','casa',219.00,349.00,'https://example.com/casaviva/robot-aspirador?aff=globalofertas','CASA15','Entrega em 2-4 dias',true, now() + interval '15 days'),
  ('conjunto-panelas','Conjunto de panelas antiaderente','Conjunto demonstrativo de 5 peças em aço inoxidável.','casaviva','casa',89.90,129.90,'https://example.com/casaviva/conjunto-panelas?aff=globalofertas',NULL,'Entrega em 2-4 dias',false, NULL),
  ('cafeteira-espresso','Cafeteira espresso compacta','Cafeteira demonstrativa com pressão de 20 bar.','casaviva','casa',149.00,199.00,'https://example.com/casaviva/cafeteira-espresso?aff=globalofertas',NULL,NULL,false, now() + interval '30 days'),
  ('casaco-impermeavel','Casaco impermeável leve','Casaco demonstrativo corta-vento, unissexo.','modaline','moda',59.90,89.90,'https://example.com/modaline/casaco-impermeavel?aff=globalofertas','MODA10','Devolução gratuita',true, NULL),
  ('sapatilhas-urbanas','Sapatilhas urbanas','Sapatilhas demonstrativas para uso diário.','modaline','moda',44.90,69.90,'https://example.com/modaline/sapatilhas-urbanas?aff=globalofertas',NULL,NULL,false, NULL),
  ('mala-cabine','Mala de cabine rígida','Mala demonstrativa de cabine 55x40x20 cm.','viajaja','viagens',79.00,109.00,'https://example.com/viajaja/mala-cabine?aff=globalofertas',NULL,'Envio em 48h',false, now() + interval '25 days'),
  ('city-break-lisboa','City break 2 noites','Pacote demonstrativo de 2 noites com pequeno-almoço.','viajaja','viagens',159.00,219.00,'https://example.com/viajaja/city-break?aff=globalofertas','VIAJA25',NULL,true, now() + interval '12 days'),
  ('halteres-ajustaveis','Halteres ajustáveis 2x20 kg','Par demonstrativo de halteres ajustáveis.','fitzone','desporto',179.00,249.00,'https://example.com/fitzone/halteres?aff=globalofertas',NULL,'Envio em 24h',false, NULL),
  ('smartwatch-desporto','Smartwatch de desporto','Smartwatch demonstrativo com GPS e medição de sono.','fitzone','desporto',99.90,149.90,'https://example.com/fitzone/smartwatch?aff=globalofertas','FIT10','Envio em 24h',true, now() + interval '18 days')
) AS v(slug,title,description,store,cat,price,old_price,url,code,ship,feat,exp)
JOIN public.stores s ON s.slug = v.store;

INSERT INTO public.coupons (store_id, code, title, description, discount_label, terms, affiliate_url, expires_at)
SELECT s.id, v.code, v.title, v.description, v.label, v.terms, v.url, v.exp
FROM (VALUES
  ('techglobal','SOM20','20 € de desconto em áudio','Aplicável a auscultadores e colunas selecionados.','20 €','Válido em artigos assinalados. Não acumulável.','https://example.com/techglobal?aff=globalofertas', now() + interval '10 days'),
  ('techglobal','TECH5','5% em toda a loja','Desconto demonstrativo sobre o valor do carrinho.','5%','Compra mínima de 100 €.','https://example.com/techglobal?aff=globalofertas', now() + interval '45 days'),
  ('casaviva','CASA15','15% em pequenos eletrodomésticos','Desconto demonstrativo em artigos de cozinha.','15%','Não acumulável com outras promoções.','https://example.com/casaviva?aff=globalofertas', now() + interval '20 days'),
  ('modaline','MODA10','10% na primeira compra','Desconto demonstrativo para novos clientes.','10%','Apenas na primeira encomenda.','https://example.com/modaline?aff=globalofertas', now() + interval '60 days'),
  ('viajaja','VIAJA25','25 € em reservas acima de 150 €','Desconto demonstrativo em pacotes de viagem.','25 €','Sujeito a disponibilidade.','https://example.com/viajaja?aff=globalofertas', now() + interval '12 days'),
  ('fitzone','FIT10','10% em nutrição desportiva','Desconto demonstrativo em suplementos.','10%','Exclui artigos já em promoção.','https://example.com/fitzone?aff=globalofertas', now() + interval '30 days')
) AS v(store,code,title,description,label,terms,url,exp)
JOIN public.stores s ON s.slug = v.store;

INSERT INTO public.site_settings (key, value, label, is_public) VALUES
  ('site_name', '"GlobalOfertas"'::jsonb, 'Nome do site', true),
  ('site_tagline', '"Ofertas curadas das melhores lojas online"'::jsonb, 'Slogan', true),
  ('contact_email', '"ola@globalofertas.com"'::jsonb, 'Email de contacto', true),
  ('affiliate_disclosure', '"O GlobalOfertas pode receber uma comissão pelas compras efetuadas através dos links assinalados, sem custo adicional para si."'::jsonb, 'Divulgação de afiliação', true),
  ('default_currency', '"EUR"'::jsonb, 'Moeda predefinida', true),
  ('featured_limit', '8'::jsonb, 'Nº de destaques na home', true);
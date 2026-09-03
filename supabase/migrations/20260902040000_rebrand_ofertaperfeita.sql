-- Reverte o rebrand temporário "GlobalOfertas" para o nome definitivo "OfertaPerfeita".
-- Não altera a migração original (já pode ter sido aplicada); apenas atualiza os
-- valores gravados na tabela site_settings e os parâmetros de tracking de demonstração.

UPDATE public.site_settings
SET value = '"OfertaPerfeita"'::jsonb
WHERE key = 'site_name';

UPDATE public.site_settings
SET value = '"ola@ofertaperfeita.com"'::jsonb
WHERE key = 'contact_email';

UPDATE public.site_settings
SET value = '"O OfertaPerfeita pode receber uma comissão pelas compras efetuadas através dos links assinalados, sem custo adicional para si."'::jsonb
WHERE key = 'affiliate_disclosure';

-- Dados de demonstração: o parâmetro de tracking "?aff=globalofertas" nos URLs
-- de exemplo passa a "?aff=ofertaperfeita".
UPDATE public.products
SET affiliate_url = REPLACE(affiliate_url, 'aff=globalofertas', 'aff=ofertaperfeita')
WHERE affiliate_url LIKE '%aff=globalofertas%';

UPDATE public.coupons
SET affiliate_url = REPLACE(affiliate_url, 'aff=globalofertas', 'aff=ofertaperfeita')
WHERE affiliate_url LIKE '%aff=globalofertas%';

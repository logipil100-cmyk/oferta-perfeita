-- Remove only the original demonstration records. Historical migrations remain immutable.
-- The filters are intentionally narrow to avoid deleting real administrator content.
DELETE FROM public.coupons
WHERE affiliate_url LIKE 'https://example.com/%'
  AND code IN ('SOM20', 'TECH5', 'CASA15', 'MODA10', 'VIAJA25', 'FIT10');

DELETE FROM public.products
WHERE affiliate_url LIKE 'https://example.com/%'
  AND slug IN (
    'portatil-ultrafino-14', 'auscultadores-anc', 'monitor-27-qhd',
    'robot-aspirador', 'conjunto-panelas', 'cafeteira-espresso',
    'casaco-impermeavel', 'sapatilhas-urbanas', 'mala-cabine',
    'city-break-lisboa', 'halteres-ajustaveis', 'smartwatch-desporto'
  );

DELETE FROM public.stores
WHERE website_url LIKE 'https://example.com/%'
  AND slug IN ('techglobal', 'casaviva', 'modaline', 'viajaja', 'fitzone');

NOTIFY pgrst, 'reload schema';

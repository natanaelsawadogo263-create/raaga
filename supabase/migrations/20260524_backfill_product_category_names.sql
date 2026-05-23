-- Réaligne products.category avec le nom de la catégorie liée (filtres catalogue / accueil).

update public.products p
set category = c.name
from public.categories c
where p.category_id = c.id
  and (p.category is null or btrim(p.category) = '' or p.category is distinct from c.name);

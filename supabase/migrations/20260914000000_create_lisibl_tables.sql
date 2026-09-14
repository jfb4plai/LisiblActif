create table lisibl_textes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titre text not null default 'Sans titre',
  texte_original text not null,
  niveau_cible text not null,
  score_lisibilite integer,
  created_at timestamptz not null default now()
);

alter table lisibl_textes enable row level security;

create policy "lisibl_textes_owner_select" on lisibl_textes
  for select using (auth.uid() = user_id);
create policy "lisibl_textes_owner_insert" on lisibl_textes
  for insert with check (auth.uid() = user_id);
create policy "lisibl_textes_owner_update" on lisibl_textes
  for update using (auth.uid() = user_id);
create policy "lisibl_textes_owner_delete" on lisibl_textes
  for delete using (auth.uid() = user_id);

create table lisibl_reecritures (
  id uuid primary key default gen_random_uuid(),
  texte_id uuid not null references lisibl_textes(id) on delete cascade,
  texte_reecrit text not null,
  edite_par_enseignant boolean not null default false,
  created_at timestamptz not null default now()
);

alter table lisibl_reecritures enable row level security;

create policy "lisibl_reecritures_owner_select" on lisibl_reecritures
  for select using (
    exists (select 1 from lisibl_textes t where t.id = texte_id and t.user_id = auth.uid())
  );
create policy "lisibl_reecritures_owner_insert" on lisibl_reecritures
  for insert with check (
    exists (select 1 from lisibl_textes t where t.id = texte_id and t.user_id = auth.uid())
  );


-- Enums
create type public.app_role as enum ('admin', 'candidate', 'recruiter');
create type public.skill_level as enum ('beginner', 'intermediate', 'expert');
create type public.test_status as enum ('not_started', 'in_progress', 'completed', 'auto_submitted');
create type public.cheat_status as enum ('clean', 'suspicious', 'cheated');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text,
  location text,
  experience_years integer default 0,
  github_url text,
  portfolio_url text,
  previous_companies text[],
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'candidate',
  unique (user_id, role)
);

-- User skills
create table public.user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  skill_name text not null,
  skill_category text not null,
  skill_level skill_level not null default 'beginner',
  created_at timestamptz default now()
);

-- Test sessions
create table public.test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  status test_status default 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  total_score numeric(5,2) default 0,
  trust_score numeric(5,2) default 100,
  cheat_probability numeric(5,2) default 0,
  cheat_status cheat_status default 'clean',
  ai_verdict jsonb,
  current_difficulty text default 'easy',
  created_at timestamptz default now()
);

-- MCQ questions
create table public.mcq_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null,
  correct_answer integer not null,
  difficulty text not null default 'easy',
  category text not null,
  negative_marks numeric(3,1) default 0.25,
  created_at timestamptz default now()
);

-- Coding challenges
create table public.coding_challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  difficulty text not null default 'easy',
  category text not null,
  starter_code jsonb,
  test_cases jsonb not null,
  hidden_test_cases jsonb,
  time_limit_seconds integer default 300,
  created_at timestamptz default now()
);

-- Test answers
create table public.test_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.test_sessions(id) on delete cascade not null,
  question_id uuid,
  question_type text not null,
  user_answer text,
  code_submission text,
  is_correct boolean,
  score numeric(5,2) default 0,
  time_spent_seconds integer default 0,
  created_at timestamptz default now()
);

-- Violations
create table public.violations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.test_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  violation_type text not null,
  details jsonb,
  severity text default 'low',
  created_at timestamptz default now()
);

-- Certificates
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id uuid references public.test_sessions(id) on delete cascade not null,
  certificate_id text unique not null,
  final_score numeric(5,2) not null,
  trust_score numeric(5,2) not null,
  rank integer,
  skills text[],
  issued_at timestamptz default now(),
  is_valid boolean default true
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_skills enable row level security;
alter table public.test_sessions enable row level security;
alter table public.mcq_questions enable row level security;
alter table public.coding_challenges enable row level security;
alter table public.test_answers enable row level security;
alter table public.violations enable row level security;
alter table public.certificates enable row level security;

-- Security definer function for role checks
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- Profiles RLS
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.has_role(auth.uid(), 'admin'));

-- User roles RLS
create policy "Users can view own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "Admins can view all roles" on public.user_roles for select using (public.has_role(auth.uid(), 'admin'));

-- User skills RLS
create policy "Users can insert own skills" on public.user_skills for insert with check (auth.uid() = user_id);
create policy "Users can view own skills" on public.user_skills for select using (auth.uid() = user_id);
create policy "Users can delete own skills" on public.user_skills for delete using (auth.uid() = user_id);
create policy "Admins can view all skills" on public.user_skills for select using (public.has_role(auth.uid(), 'admin'));

-- Test sessions RLS
create policy "Users can view own sessions" on public.test_sessions for select using (auth.uid() = user_id);
create policy "Users can create sessions" on public.test_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on public.test_sessions for update using (auth.uid() = user_id);
create policy "Admins can view all sessions" on public.test_sessions for select using (public.has_role(auth.uid(), 'admin'));

-- MCQ questions RLS
create policy "Authenticated can read questions" on public.mcq_questions for select to authenticated using (true);
create policy "Admins can insert questions" on public.mcq_questions for insert with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update questions" on public.mcq_questions for update using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete questions" on public.mcq_questions for delete using (public.has_role(auth.uid(), 'admin'));

-- Coding challenges RLS
create policy "Authenticated can read challenges" on public.coding_challenges for select to authenticated using (true);
create policy "Admins can insert challenges" on public.coding_challenges for insert with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update challenges" on public.coding_challenges for update using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete challenges" on public.coding_challenges for delete using (public.has_role(auth.uid(), 'admin'));

-- Test answers RLS
create policy "Users can insert own answers" on public.test_answers for insert with check (
  exists (select 1 from public.test_sessions where id = test_answers.session_id and user_id = auth.uid())
);
create policy "Users can view own answers" on public.test_answers for select using (
  exists (select 1 from public.test_sessions where id = test_answers.session_id and user_id = auth.uid())
);
create policy "Admins can view all answers" on public.test_answers for select using (public.has_role(auth.uid(), 'admin'));

-- Violations RLS
create policy "Users can insert own violations" on public.violations for insert with check (auth.uid() = user_id);
create policy "Users can view own violations" on public.violations for select using (auth.uid() = user_id);
create policy "Admins can view all violations" on public.violations for select using (public.has_role(auth.uid(), 'admin'));

-- Certificates RLS
create policy "Anyone can view valid certificates" on public.certificates for select using (is_valid = true);
create policy "Users can view own certificates" on public.certificates for select using (auth.uid() = user_id);
create policy "Admins can manage certificates" on public.certificates for all using (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-create profile and role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  
  insert into public.user_roles (user_id, role)
  values (new.id, 'candidate');
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

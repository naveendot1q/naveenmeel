-- ============================================================
-- NAVEEN BLOG — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  excerpt     TEXT,
  content     TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT 'tech',
  tags        TEXT[] DEFAULT '{}',
  published   BOOLEAN NOT NULL DEFAULT true,
  cover_emoji TEXT DEFAULT '📝',
  word_count  INTEGER DEFAULT 0,
  read_time   INTEGER DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. AUTO-UPDATE updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS posts_slug_idx      ON public.posts(slug);
CREATE INDEX IF NOT EXISTS posts_category_idx  ON public.posts(category);
CREATE INDEX IF NOT EXISTS posts_published_idx ON public.posts(published);
CREATE INDEX IF NOT EXISTS posts_created_idx   ON public.posts(created_at DESC);

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
DROP POLICY IF EXISTS "Public can read published posts" ON public.posts;
CREATE POLICY "Public can read published posts"
  ON public.posts FOR SELECT
  USING (published = true);

-- Authenticated users (admin) can do everything
DROP POLICY IF EXISTS "Auth users full access" ON public.posts;
CREATE POLICY "Auth users full access"
  ON public.posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. FULL TEXT SEARCH (optional performance boost)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,''))
  ) STORED;

CREATE INDEX IF NOT EXISTS posts_fts_idx ON public.posts USING gin(fts);

-- 6. SEED SAMPLE POSTS (optional — remove if you want a clean start)
INSERT INTO public.posts (title, slug, excerpt, content, category, tags, cover_emoji, word_count, read_time)
VALUES
(
  'How MPLS Works: A Practical Guide',
  'how-mpls-works-practical-guide',
  'Breaking down MPLS label switching — how packets move through a backbone without looking up routing tables at every hop.',
  E'# How MPLS Works: A Practical Guide\n\n## What is MPLS?\n\n**Multi-Protocol Label Switching (MPLS)** is one of the most elegant solutions in networking. Instead of making routing decisions at every hop based on IP destination, MPLS assigns a **label** to packets at the ingress router and forwards them purely based on that label.\n\n> "MPLS is the backbone of modern enterprise WAN and telco networks — including what we use at Airtel daily."\n\n## How Label Switching Works\n\nWhen a packet enters an MPLS network:\n\n1. The **ingress Label Edge Router (LER)** examines the IP header\n2. It assigns a **label** based on FEC (Forwarding Equivalence Class)\n3. Subsequent **Label Switching Routers (LSR)** swap labels and forward — no IP lookup needed\n4. The **egress LER** pops the label and delivers the original IP packet\n\n## Label Stack\n\n```\n┌────────────────────────────────────┐\n│  Label (20 bits)                   │\n│  Traffic Class / EXP (3 bits)      │\n│  Bottom of Stack bit (1 bit)       │\n│  TTL (8 bits)                      │\n└────────────────────────────────────┘\n```\n\n## Why MPLS Matters for Banking Clients\n\nAt Airtel, we design MPLS networks for banking customers who need:\n\n- **Low latency** — sub-10ms RTT across sites\n- **Traffic engineering** — predictable paths regardless of IGP\n- **QoS guarantees** — voice, data, and video in separate queues\n- **Fast reroute** — sub-50ms failover via RSVP-TE\n\n## Key Protocols\n\n| Protocol | Purpose |\n|---|---|\n| LDP | Label distribution |\n| RSVP-TE | Traffic engineering LSPs |\n| BGP-LU | Inter-AS label exchange |\n| Segment Routing | Modern MPLS without LDP |\n\n## Conclusion\n\nMPLS remains foundational to enterprise connectivity. Understanding it at depth is what separates a good network engineer from a great one.',
  'networking',
  ARRAY['mpls', 'bgp', 'wan', 'airtel', 'networking'],
  '🌐', 320, 2
),
(
  'Building a CI/CD Pipeline: Jenkins + Docker + Kubernetes',
  'cicd-pipeline-jenkins-docker-kubernetes',
  'Step-by-step walkthrough of a production CI/CD pipeline from code commit to container running in Kubernetes.',
  E'# Building a CI/CD Pipeline: Jenkins + Docker + Kubernetes\n\n## The Goal\n\nAutomate the journey from a `git push` to a running container in Kubernetes — with security gates in between.\n\n## Architecture\n\n```\nDeveloper → GitHub → Jenkins → SonarQube → Docker Build → TRIVY Scan → Nexus → K8s Deploy\n```\n\n## Step 1: Jenkinsfile\n\n```groovy\npipeline {\n  agent any\n  stages {\n    stage(''Checkout'') {\n      steps { git ''https://github.com/yourrepo/app.git'' }\n    }\n    stage(''Build'') {\n      steps { sh ''mvn clean package'' }\n    }\n    stage(''Docker Build'') {\n      steps { sh ''docker build -t myapp:${BUILD_NUMBER} .'' }\n    }\n    stage(''TRIVY Scan'') {\n      steps { sh ''trivy image myapp:${BUILD_NUMBER}'' }\n    }\n    stage(''Deploy to K8s'') {\n      steps { sh ''kubectl apply -f k8s/deployment.yaml'' }\n    }\n  }\n}\n```\n\n## Step 2: Dockerfile\n\n```dockerfile\nFROM eclipse-temurin:17-jre-alpine\nWORKDIR /app\nCOPY target/*.jar app.jar\nEXPOSE 8080\nENTRYPOINT ["java", "-jar", "app.jar"]\n```\n\n## Result\n\nZero-touch deployments with security scanning at every stage. Rollback in seconds via `kubectl rollout undo`.',
  'cicd',
  ARRAY['jenkins', 'docker', 'kubernetes', 'cicd', 'devops'],
  '🔄', 280, 2
),
(
  'Why Basketball Makes Me a Better Engineer',
  'basketball-makes-better-engineer',
  'The mental models I''ve built on the court — reading the game, adapting in real-time, trusting teammates — apply directly to engineering.',
  E'# Why Basketball Makes Me a Better Engineer\n\n## The Connection Nobody Talks About\n\nBasketball has made me a fundamentally better network engineer. Here is why.\n\n## 1. Reading the Game = Reading the Network\n\nA point guard reads the defense *before* the ball leaves their hands. You anticipate where the pressure is coming from, identify the open lane, and make a decision in under a second.\n\nThis is **exactly** what happens during a network incident.\n\n> The best players and the best engineers both see the whole board, not just the immediate play.\n\n## 2. Tempo Control = Change Management\n\nIn basketball, the point guard controls tempo. In engineering, **change management is tempo control**. You do not always go fast.\n\n## 3. Trust Your Teammates\n\nYou cannot win 5v5 alone. The best engineering teams work the same way — communicate constantly, cover for each other, make each other better.\n\n## Conclusion\n\nNext time someone asks why you play basketball, tell them it is part of the job.\n\n*Now if you will excuse me, I have a pickup game in an hour. 🏀*',
  'basketball',
  ARRAY['basketball', 'engineering', 'mindset', 'life'],
  '🏀', 220, 1
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- DONE. Your posts table is ready.
-- Next step: Create an admin user in Supabase Auth dashboard.
-- ============================================================

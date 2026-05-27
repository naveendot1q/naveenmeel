import { Switch, Route, Router as WouterRouter } from "wouter";
import { ThemeProvider } from "@/lib/theme";
import HomePage from "@/pages/HomePage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import LoginPage from "@/pages/LoginPage";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="text-center">
        <div className="text-7xl font-bold mb-4" style={{ color: 'var(--accent)' }}>404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="mb-6" style={{ color: 'var(--muted)' }}>The page you're looking for doesn't exist.</p>
        <a href="/" style={{ background: 'var(--accent)', color: '#fff', padding: '10px 24px', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>← Go Home</a>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/login" component={LoginPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </ThemeProvider>
  );
}

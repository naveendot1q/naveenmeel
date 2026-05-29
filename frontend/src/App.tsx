import { Switch, Route } from "wouter";
import { ThemeProvider } from "@/lib/theme";
import HomePage from "@/pages/HomePage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import LoginPage from "@/pages/LoginPage";

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        color: "var(--fg)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: "5rem",
            color: "var(--accent)",
            marginBottom: 16,
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
          Page not found
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          The page you're looking for doesn't exist.
        </p>
        <a href="/" className="btn btn-primary">
          ← Go Home
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/login" component={LoginPage} />
        <Route component={NotFound} />
      </Switch>
    </ThemeProvider>
  );
}

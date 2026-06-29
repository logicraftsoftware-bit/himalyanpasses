import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, "public");

const cleanPageRoutes = new Map([
  ["aboutus", "aboutus.html"],
  ["accounts", "accounts.html"],
  ["article", "article.html"],
  ["blog", "blog.html"],
  ["booking", "booking.html"],
  ["categorice-blog", "categorice-blog.html"],
  ["contact", "contact.html"],
  ["forgetpass", "forgetpass.html"],
  ["invoice", "invoice.html"],
  ["listing", "listing.html"],
  ["newpackage", "newpackage.html"],
  ["otp-verification", "otp-verification.html"],
  ["package", "package.html"],
  ["privecy", "privecy.html"],
  ["privacy", "privecy.html"],
  ["refund", "refund.html"],
  ["reset-password", "reset-password.html"],
  ["seo", "seo.html"],
  ["signin", "signin.html"],
  ["single-tour", "single-tour.html"],
  ["stories", "stories.html"],
  ["termmndcondition", "termmndcondition.html"],
  ["terms-condition", "termmndcondition.html"],
  ["thank-you", "thank-you.html"],
  ["tour", "tour.html"],
  ["tour2406", "tour2406.html"],
  ["trek", "trek.html"],
  ["whychoose", "whychoose.html"],
  ["adventure-tour-list", "listing.html"]
]);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"]
]);

const publicAssetDirs = new Set([
  "config",
  "controllers",
  "favicon",
  "images",
  "includes",
  "style"
]);

function safePath(relativePath) {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\\|\/|$))+/, "");
  const fullPath = path.join(publicRoot, normalized);

  if (!fullPath.startsWith(publicRoot)) {
    return null;
  }

  return fullPath;
}

function legacySafePath(relativePath) {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\\|\/|$))+/, "");
  const fullPath = path.join(projectRoot, normalized);

  if (!fullPath.startsWith(projectRoot)) {
    return null;
  }

  return fullPath;
}

function getAssetHeaders(ext) {
  const headers = {
    "Content-Type": contentTypes.get(ext) || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };

  if (ext === ".html") {
    headers["Cache-Control"] = "public, max-age=600, must-revalidate";
  } else {
    headers["Cache-Control"] = "public, max-age=31536000, immutable";
  }

  return headers;
}

function withBaseTag(html) {
  if (/<base\s/i.test(html)) {
    return html;
  }

  return html.replace(/<head([^>]*)>/i, '<head$1><base href="/">');
}

async function resolveFilePath(relativePath) {
  const candidates = [
    safePath(relativePath),
    legacySafePath(relativePath)
  ].filter(Boolean);

  for (const fullPath of candidates) {
    try {
      const fileStat = await stat(fullPath);
      if (fileStat.isFile()) {
        return fullPath;
      }
    } catch {
      // Try the next safe location.
    }
  }

  return null;
}

async function fileExists(relativePath) {
  return Boolean(await resolveFilePath(relativePath));
}

async function serveFile(relativePath) {
  const fullPath = await resolveFilePath(relativePath);
  if (!fullPath) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(relativePath).toLowerCase();
  const file = await readFile(fullPath);

  if (ext !== ".html") {
    return new Response(file, {
      headers: getAssetHeaders(ext)
    });
  }

  return new Response(withBaseTag(file.toString("utf8")), {
    headers: getAssetHeaders(ext)
  });
}

function resolveHtmlRoute(pathname) {
  const routePath = pathname.replace(/^\/+|\/+$/g, "");

  if (!routePath) {
    return "index.html";
  }

  if (routePath === "blog" || routePath === "category" || routePath === "package") {
    return cleanPageRoutes.get(routePath);
  }

  const parts = routePath.split("/");

  if (parts[0] === "blog" && parts[1]) {
    return "blog.html";
  }

  if (parts[0] === "category" && parts[1]) {
    return "categorice-blog.html";
  }

  if (parts[0] === "package" && parts[1]) {
    return "package.html";
  }

  if (parts.length === 1 && cleanPageRoutes.has(parts[0])) {
    return cleanPageRoutes.get(parts[0]);
  }

  if (parts.length === 1 && !parts[0].includes(".")) {
    return "route.html";
  }

  return null;
}

function isPublicFile(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const ext = path.extname(normalized).toLowerCase();

  if (parts.length === 1 && ext === ".html") {
    return true;
  }

  return publicAssetDirs.has(parts[0]);
}

export async function GET(request) {
  const url = new URL(request.url);
  let pathname;

  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const requestedFile = pathname.replace(/^\/+/, "");

  if (
    requestedFile &&
    path.extname(requestedFile) &&
    isPublicFile(requestedFile) &&
    await fileExists(requestedFile)
  ) {
    return serveFile(requestedFile);
  }

  const htmlRoute = resolveHtmlRoute(pathname);

  if (htmlRoute && await fileExists(htmlRoute)) {
    return serveFile(htmlRoute);
  }

  return new Response("Not found", { status: 404 });
}

const ENDPOINT = "/api/contact";
const ACTION = "talk";
const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TOKEN = "cf-turnstile-response";

const REQUIRED = ["first-name", "last-name", "email", "message"];
const HIDDEN = new Set([TOKEN, "project", "message"]);
const MAX_BODY = 64 * 1024;
const MAX_FIELDS = 30;
const MAX_NAME = 64;
const MAX_VALUE = 5000;
const EMAIL = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

interface Siteverify {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
  metadata?: { result_with_testing_key?: boolean };
}

interface Message {
  subject: string;
  text: string;
  replyTo: { email: string; name: string };
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== ENDPOINT) return reply(404, "Not found");
    if (request.method !== "POST") {
      return reply(405, "Method not allowed", { Allow: "POST" });
    }
    if (Number(request.headers.get("content-length")) > MAX_BODY) {
      return reply(413, "Too large");
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return reply(400, "Unreadable form");
    }

    if (!(await verify(form.get(TOKEN), request, url.hostname, env))) {
      return reply(403, "Verification failed");
    }

    const fields = collect(form);
    if (!fields) return reply(400, "Missing or invalid fields");

    try {
      await sendEmail(env, compose(fields));
    } catch (error) {
      const { code, message } = error as { code?: string; message?: string };
      console.error("Email failed", code, message);
      return reply(502, "Email failed");
    }

    return Response.json({ ok: true });
  },
} satisfies ExportedHandler<Env>;

async function verify(
  token: File | string | null,
  request: Request,
  hostname: string,
  env: Env,
): Promise<boolean> {
  if (typeof token !== "string" || !token || token.length > 2048) return false;

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) body.set("remoteip", ip);

  let result: Siteverify;
  try {
    const answer = await fetch(SITEVERIFY, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!answer.ok) throw new Error(`siteverify ${answer.status}`);
    result = await answer.json<Siteverify>();
  } catch (error) {
    console.error("Turnstile unreachable", String(error));
    return false;
  }

  if (!result.success) {
    console.warn("Turnstile rejected", result["error-codes"]);
    return false;
  }
  if (result.metadata?.result_with_testing_key) return true;
  if (result.action !== ACTION || result.hostname !== hostname) {
    console.warn("Turnstile mismatch", result.action, result.hostname);
    return false;
  }
  return true;
}

function collect(form: FormData): Map<string, string> | null {
  const fields = new Map<string, string>();

  for (const name of new Set(form.keys())) {
    if (name === TOKEN) continue;
    const value = form
      .getAll(name)
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .join(", ");
    if (!value) continue;
    if (
      fields.size >= MAX_FIELDS ||
      name.length > MAX_NAME ||
      value.length > MAX_VALUE
    ) {
      return null;
    }
    fields.set(name, value);
  }

  if (REQUIRED.some((name) => !fields.has(name))) return null;
  if (!EMAIL.test(fields.get("email") ?? "")) return null;
  return fields;
}

function compose(fields: Map<string, string>): Message {
  const name = oneLine(
    `${fields.get("first-name")} ${fields.get("last-name")}`,
  );
  const subject = fields.has("project")
    ? `New project inquiry from ${name}`
    : `New message from ${name}`;

  const lines = [...fields]
    .filter(([field]) => !HIDDEN.has(field))
    .map(([field, value]) => `${label(field)}: ${value}`);

  return {
    subject,
    text: `${lines.join("\n")}\n\nMessage:\n${fields.get("message")}\n`,
    replyTo: { email: fields.get("email")!, name },
  };
}

async function sendEmail(env: Env, message: Message): Promise<void> {
  await env.EMAIL.send({
    to: env.CONTACT_TO,
    from: { email: env.CONTACT_FROM, name: "Portfolio" },
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
  });
}

function label(field: string): string {
  const words = field.replace(/[-_]+/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 200);
}

function reply(status: number, error: string, headers?: HeadersInit) {
  return Response.json({ ok: false, error }, { status, headers });
}

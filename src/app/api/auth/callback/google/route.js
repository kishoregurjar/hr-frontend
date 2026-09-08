import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Return HTML script to close popup and notify parent window
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Google Account Connected</title>
      </head>
      <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
        <div style="text-align: center; padding: 24px; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 360px;">
          <div style="font-size: 32px; margin-bottom: 12px;">✅</div>
          <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 18px;">Google Account Connected!</h2>
          <p style="margin: 0; color: #64748b; font-size: 13px;">Auto-syncing candidate applications. Closing this window...</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', code: ${JSON.stringify(code || "")} }, window.location.origin);
          }
          setTimeout(() => {
            window.close();
          }, 1200);
        </script>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

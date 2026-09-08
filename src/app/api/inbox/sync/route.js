import { NextResponse } from "next/server";
import tls from "tls";

/**
 * Lightweight native Node.js TLS IMAP Client to fetch & parse emails from Gmail
 */
function fetchGmailInbox({ email, password, limit = 10, keywords = [] }) {
  return new Promise((resolve, reject) => {
    const cleanPassword = String(password || "").replace(/\s+/g, "");
    const client = tls.connect(
      {
        host: "imap.gmail.com",
        port: 993,
        rejectUnauthorized: false,
      },
      () => {
        // Connected to Gmail IMAP
      }
    );

    client.setEncoding("utf8");

    let buffer = "";
    let step = 0;
    const emails = [];
    let timeoutId = setTimeout(() => {
      client.end();
      resolve(emails);
    }, 30000);

    const sendCmd = (cmd) => {
      client.write(cmd + "\r\n");
    };

    client.on("data", (chunk) => {
      buffer += chunk;

      // 1. Initial Greeting -> LOGIN
      if (step === 0 && buffer.includes("* OK")) {
        step = 1;
        buffer = "";
        sendCmd(`A01 LOGIN ${email} ${cleanPassword}`);
      }

      // 2. Logged in -> SELECT INBOX
      else if (step === 1 && buffer.includes("A01 OK")) {
        step = 2;
        buffer = "";
        sendCmd("A02 SELECT INBOX");
      } else if (step === 1 && (buffer.includes("A01 NO") || buffer.includes("A01 BAD"))) {
        client.end();
        clearTimeout(timeoutId);
        reject(new Error("Invalid Gmail address or 16-digit Google App Password. Please check credentials."));
      }

      // 3. Inbox Selected -> SEARCH
      else if (step === 2 && buffer.includes("A02 OK")) {
        step = 3;
        buffer = "";
        // Search last 15 emails
        sendCmd("A03 SEARCH ALL");
      }

      // 4. Search Results -> Fetch Headers & Snippets
      else if (step === 3 && buffer.includes("A03 OK")) {
        step = 4;
        const searchMatch = buffer.match(/\* SEARCH ([\d\s]+)/);
        const ids = searchMatch ? searchMatch[1].trim().split(/\s+/).filter(Boolean) : [];
        buffer = "";

        if (ids.length === 0) {
          sendCmd("A05 LOGOUT");
          return;
        }

        // Pick the latest 'limit' emails
        const recentIds = ids.slice(-limit).reverse();
        const idSequence = recentIds.join(",");
        sendCmd(`A04 FETCH ${idSequence} (BODY[HEADER.FIELDS (FROM TO SUBJECT DATE)] BODY[TEXT]<0.1500>)`);
      }

      // 5. Fetch Completed -> Parse Data
      else if (step === 4 && buffer.includes("A04 OK")) {
        step = 5;
        const rawBlocks = buffer.split(/\* \d+ FETCH/);
        for (const block of rawBlocks) {
          if (!block.trim()) continue;

          // Subject
          const subjMatch = block.match(/Subject:\s*([^\r\n]+)/i);
          const subject = subjMatch ? subjMatch[1].trim() : "No Subject";

          // From
          const fromMatch = block.match(/From:\s*([^\r\n]+)/i);
          const fromRaw = fromMatch ? fromMatch[1].trim() : "";
          const emailMatch = fromRaw.match(/<([^>]+)>/) || fromRaw.match(/([\w.-]+@[\w.-]+\.\w+)/);
          const fromEmail = emailMatch ? emailMatch[1] : fromRaw;
          const fromNameMatch = fromRaw.match(/^"?([^"<]+)"?\s*</);
          const fromName = fromNameMatch ? fromNameMatch[1].trim() : fromEmail.split("@")[0];

          // Date
          const dateMatch = block.match(/Date:\s*([^\r\n]+)/i);
          const date = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

          // Body Snippet
          const bodyParts = block.split(/\r?\n\r?\n/);
          const snippet = bodyParts.length > 1 ? bodyParts.slice(1).join(" ").slice(0, 1000) : "";

          // Filter keywords if requested
          if (keywords.length > 0) {
            const combinedText = `${subject} ${fromRaw} ${snippet}`.toLowerCase();
            const hasKeyword = keywords.some((kw) => combinedText.includes(kw.toLowerCase().trim()));
            if (!hasKeyword) continue;
          }

          emails.push({
            id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: fromName || "Applicant",
            email: fromEmail || "applicant@example.com",
            subject,
            snippet,
            date,
            source: "Email Ingestion",
          });
        }

        sendCmd("A05 LOGOUT");
      }

      // 6. Logout Completed
      else if (step === 5 && (buffer.includes("A05 OK") || buffer.includes("* BYE"))) {
        client.end();
        clearTimeout(timeoutId);
        resolve(emails);
      }
    });

    client.on("error", (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });

    client.on("end", () => {
      clearTimeout(timeoutId);
      resolve(emails);
    });
  });
}

/**
 * POST /api/inbox/sync
 * Connects directly to Gmail IMAP via SSL and extracts candidate applications
 */
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || "rohitpanchal958466@gmail.com";
    const password = body.appPassword || body.password;
    const keywords = body.keywords
      ? body.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "16-digit Google App Password is required.",
        },
        { status: 400 }
      );
    }

    const limitCount = Number(body.limit) || 150;

    const extractedEmails = await fetchGmailInbox({
      email,
      password,
      limit: limitCount,
      keywords,
    });

    // Transform extracted emails into candidates
    const candidates = extractedEmails.map((em, idx) => ({
      id: `cand-inbox-${Date.now() + idx}`,
      name: em.name,
      email: em.email,
      phone: "+91 98765 43210",
      role: em.subject.includes("Frontend")
        ? "Frontend Engineer"
        : em.subject.includes("Backend")
        ? "Backend Engineer"
        : "Software Engineer",
      skills: ["JavaScript", "React", "Node.js"],
      experience: "2+ Years",
      source: "Email Ingestion",
      emailSubject: em.subject,
      emailBody: em.snippet,
      status: "NEW",
      appliedAt: em.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      message: `Successfully connected to Gmail! Extracted ${candidates.length} application(s).`,
      newCandidatesCount: candidates.length,
      candidates,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to connect to Gmail IMAP.",
      },
      { status: 500 }
    );
  }
}

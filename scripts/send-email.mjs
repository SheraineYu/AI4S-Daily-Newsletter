import net from "node:net";
import tls from "node:tls";
import {
  buildDigest,
  renderHtmlDigest,
  renderPlaintextDigest
} from "../src/lib/digest.js";

const DRY_RUN = process.argv.includes("--dry-run") || process.env.DIGEST_DRY_RUN === "1";

function readEnv(name, { required = false, fallback } = {}) {
  const raw = process.env[name];
  const value = typeof raw === "string" ? raw.trim() : raw;
  const finalValue = value ? value : fallback;

  if (required && (!finalValue || !String(finalValue).trim())) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return finalValue;
}

async function buildDigestPayload() {
  const digest = await buildDigest({ force: true });
  return {
    generatedAt: digest.generatedAt,
    subject: `AI4S Daily Digest - ${digest.generatedAt.slice(0, 10)}`,
    plainText: renderPlaintextDigest(digest),
    html: renderHtmlDigest(digest)
  };
}

function buildMessage({ from, to, subject, text, html }) {
  const boundary = `----=_AI4S_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary=\"${boundary}\"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`,
    ""
  ].join("\r\n");
}

function createSmtpClient({ host, port, secure }) {
  return new Promise((resolve, reject) => {
    const onConnect = () => resolve(socket);
    const onError = (error) => reject(error);
    const socket = secure
      ? tls.connect({ host, port, servername: host }, onConnect)
      : net.connect({ host, port }, onConnect);

    socket.setEncoding("utf8");
    socket.once("error", onError);
  });
}

async function readResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const onData = (chunk) => {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      if (!lines.length) return;
      const last = lines[lines.length - 1];
      if (/^\d{3}\s/.test(last)) {
        socket.off("data", onData);
        resolve(lines);
      }
    };

    const onError = (error) => {
      socket.off("data", onData);
      reject(error);
    };

    socket.on("data", onData);
    socket.once("error", onError);
  });
}

async function sendCommand(socket, command, expectedCodes) {
  if (command) {
    socket.write(`${command}\r\n`);
  }

  const lines = await readResponse(socket);
  const code = Number(lines[lines.length - 1].slice(0, 3));

  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP command failed (${command || "<initial>"}): ${lines.join(" | ")}`);
  }

  return lines;
}

async function sendViaSmtp({ host, port, secure, user, pass, from, to, message }) {
  const socket = await createSmtpClient({ host, port, secure });

  try {
    await sendCommand(socket, null, [220]);
    await sendCommand(socket, `EHLO ${host}`, [250]);
    await sendCommand(socket, "AUTH LOGIN", [334]);
    await sendCommand(socket, Buffer.from(user).toString("base64"), [334]);
    await sendCommand(socket, Buffer.from(pass).toString("base64"), [235]);
    await sendCommand(socket, `MAIL FROM:<${from}>`, [250]);
    await sendCommand(socket, `RCPT TO:<${to}>`, [250, 251]);
    await sendCommand(socket, "DATA", [354]);
    socket.write(`${message}\r\n.\r\n`);
    await sendCommand(socket, null, [250]);
    await sendCommand(socket, "QUIT", [221]);
  } finally {
    socket.end();
  }
}

const smtpHost = readEnv("GMAIL_SMTP_HOST", { fallback: "smtp.gmail.com" });
const smtpPortRaw = readEnv("GMAIL_SMTP_PORT", { fallback: "465" });
const smtpUser = readEnv("GMAIL_SMTP_USER", { required: true });
const smtpPass = readEnv("GMAIL_SMTP_PASS", { required: true });
const toEmail = readEnv("DIGEST_TO_EMAIL", { required: true });
const fromEmail = readEnv("DIGEST_FROM_EMAIL", { fallback: smtpUser });

const smtpPort = Number(smtpPortRaw);
if (!Number.isInteger(smtpPort) || smtpPort <= 0) {
  throw new Error(`Invalid GMAIL_SMTP_PORT: ${smtpPortRaw}`);
}

const digestPayload = await buildDigestPayload();
if (!digestPayload?.subject || !digestPayload?.plainText || !digestPayload?.html) {
  throw new Error("Digest payload is missing one of required fields: subject, plainText, html");
}

if (DRY_RUN) {
  console.log(
    JSON.stringify(
      {
        dryRun: true,
        to: toEmail,
        from: fromEmail,
        subject: digestPayload.subject,
        plainTextLength: digestPayload.plainText.length,
        htmlLength: digestPayload.html.length
      },
      null,
      2
    )
  );
  process.exit(0);
}

const message = buildMessage({
  from: fromEmail,
  to: toEmail,
  subject: digestPayload.subject,
  text: digestPayload.plainText,
  html: digestPayload.html
});

await sendViaSmtp({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  user: smtpUser,
  pass: smtpPass,
  from: fromEmail,
  to: toEmail,
  message
});

console.log(
  JSON.stringify(
    {
      sent: true,
      to: toEmail,
      subject: digestPayload.subject,
      plainTextLength: digestPayload.plainText.length,
      htmlLength: digestPayload.html.length
    },
    null,
    2
  )
);

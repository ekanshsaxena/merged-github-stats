export default function handler(req: any, res: any) {
  res.setHeader("Content-Type", "text/plain");
  res.statusCode = 200;
  res.end("Hello from Vercel! Node version: " + process.version);
}

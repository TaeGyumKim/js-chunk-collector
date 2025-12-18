import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3457;

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, "external.js");
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*"
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`External server at http://localhost:${PORT}`);
});

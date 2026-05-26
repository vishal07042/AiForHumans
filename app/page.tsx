import fs from "node:fs/promises";
import path from "node:path";

export const metadata = {
  title: "Ai For Humans",
  description:
    "Interactive neural network walkthrough rendered from the original vanilla HTML.",
};

export default async function Home() {
  const htmlPath = path.join(process.cwd(), "Home.html");
  const html = await fs.readFile(htmlPath, "utf8");

  return (
    <iframe
      title="Home"
      srcDoc={html}
      sandbox="allow-scripts allow-same-origin allow-forms"
      style={{
        display: "block",
        width: "100%",
        height: "100dvh",
        border: 0,
        background: "#0b0b0d",
      }}
    />
  );
}

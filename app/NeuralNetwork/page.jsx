import fs from "node:fs/promises";
import path from "node:path";

export const metadata = {
  title: "How Neural Networks Work - For Humans",
  description:
    "Interactive neural network walkthrough rendered from the original vanilla HTML.",
};

export default async function NeuralNetworkPage() {
  const htmlPath = path.join(process.cwd(), "app",  "NeuralNetwork", "Neuorns.html");
  const html = await fs.readFile(htmlPath, "utf8");

  return (
    <iframe
      title="How Neural Networks Work"
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

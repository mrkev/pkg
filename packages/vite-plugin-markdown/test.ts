import markdownPlugin from "./vitePluginMarkdown.ts";

const plugin = markdownPlugin();

async function test(description: string, id: string, input: string) {
  console.log(`\n[${description}]`);
  const result = await plugin.transform(input, id);
  if (result == null) {
    console.log("  (skipped)");
    return;
  }
  const data = JSON.parse(result.code.replace(/^export default /, ""));
  console.log("  html:    ", data.html);
  console.log("  metadata:", data.metadata);
  console.log("  filename:", data.filename);
}

await test("basic markdown", "README.md", "# Hello\n\nThis is a paragraph.");
await test(
  "frontmatter",
  "post.md",
  "---\ntitle: My Post\ndate: 2024-01-01\n---\n\n# Body\n\nSome content.",
);
await test(
  "code block with syntax highlighting",
  "guide.md",
  "```ts\nconst x: number = 42;\n```",
);
await test("non-md file is ignored", "README.txt", "# Hello");

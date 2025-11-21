import { exists } from "jsr:@std/fs/exists";
import { parse, toText } from "../markdown.ts";
import { loadTextFile } from "../link.ts";
import * as path from "jsr:@std/path";
import { Root, RootContent } from "npm:@types/mdast@4";
import { sanitize } from "npm:sanitize-filename-ts";
import crypto from "node:crypto";
import { stringify } from "jsr:@std/yaml";
import { globSync } from "node:fs";

async function checkContextDir(stepsPath: string) {
  const contextDirExists = await exists(stepsPath, { isFile: false });
  if (!contextDirExists) {
    await Deno.mkdir(stepsPath, { recursive: true });
  }
}

function headingPrefix(step: Root) {
  const first = step.children[0];
  if (first.type === "heading") {
    const headingChild = first.children[0];
    if (headingChild.type === "text") {
      const heading = headingChild.value;
      const headingParts = heading.split(":");
      const prefix = headingParts.length > 1 ? headingParts[0].trim() : "_";
      return [prefix, heading];
    }
  }
  throw new Error("Missing heading.");
}

function hash(text: string) {
  return crypto.hash("sha256", text, "hex");
}

function newTimestamp(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  // const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  // Example: YYYYMMDD_HHMMSS_mmm
  // return `${year}${month}${day}_${hours}${minutes}${seconds}_${milliseconds}`;
  // Example: YYYY-MM-DD_HH-MM-SS
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  // return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

function existingHash(base: string, handle: string) {
  // Skip if matching content ID
  // TODO: add deeper compare to avoid collisions
  const pattern = path.join(base, `*.${handle}.md`);
  return globSync(pattern).length > 0;
}

function stringifyFrontmatter(metadata: unknown) {
  return "---\n" + stringify(metadata) + "---\n\n";
}

async function saveStep(step: Root, properties: object, stepsPath: string) {
  const [prefix, heading] = headingPrefix(step);
  const sanitized = sanitize(prefix, { replacement: "_" });
  const full = toText(step);
  const id = hash(full);
  const handle = id.slice(0, 8);
  const metadata = { ...properties, "content_id": id };
  const frontmatter = stringifyFrontmatter(metadata);
  const fileName = `${sanitized}.${handle}.md`;
  const newStepPath = path.join(stepsPath, fileName);
  if (existingHash(stepsPath, handle)) {
    return fileName;
  }
  try {
    const _ = await Deno.lstat(newStepPath);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
    await Deno.writeTextFile(newStepPath, frontmatter + full);
  }
  return fileName;
}

function timestampHandle(content: string) {
  const id = hash(content);
  const handle = id.slice(0, 8);
  const curDate = new Date();
  const timestamp = newTimestamp(curDate);
  return [id, handle, curDate, timestamp] as [string, string, Date, string];
}

export function languageFromExt(file: string) {
  switch (path.extname(file)) {
    case ".ts":
      return "typescript";
    case ".json":
      return "json";
    default:
      return "";
  }
}

export function textFileDoc(content: string, file: string) {
  return `# file: ${file}

\`\`\`${languageFromExt(file)}
${content}
\`\`\`
`;
}

export async function saveTextFile(content: string, file: string) {
  const doc = textFileDoc(content, file);
  const [id, handle, curDate, timestamp] = timestampHandle(doc);

  const filePath = path.join("./context", file);
  const handleFile = `${timestamp}.${handle}.md`;
  const fullPath = path.join(filePath, handleFile);

  if (existingHash(filePath, handle)) {
    return doc;
  }
  await checkContextDir(filePath);
  const metadata = {
    "timestamp": curDate.toString(),
    "content_id": id,
  };
  const frontmatter = stringifyFrontmatter(metadata);
  await Deno.writeTextFile(fullPath, frontmatter + doc);
  return doc;
}

export async function saveDoc(doc: string, file: string, properties = {}) {
  const [id, handle, curDate, timestamp] = timestampHandle(doc);

  // Relevant paths and context + steps directory
  const stepsPath = path.join("./context", file, "steps");
  const filePath = path.join("./context", file);
  const handleFile = `${timestamp}.${handle}.md`;
  const fullPath = path.join(filePath, handleFile);
  const parent = path.join("..", handleFile);

  // Parse file
  const [_, steps, body, linkedFiles] = parse(doc, file);

  for (const [c, f] of linkedFiles) {
    await saveTextFile(c, f);
  }
  if (existingHash(filePath, handle)) {
    return toText(body);
  }
  await checkContextDir(stepsPath);
  const metadata = {
    "timestamp": curDate.toString(),
    "parent": `[[${parent}]]`,
    "content_id": id,
  };
  const links = [];
  for (const step of steps) {
    const fileName = await saveStep(step, metadata, stepsPath);
    const link = `steps/${encodeURIComponent(fileName)}`;
    links.push(link);
  }
  const fullDoc = links.map((link) => `![@](${link})`).join("\n\n");
  let withMeta = fullDoc;
  if (Object.entries(properties).length !== 0) {
    const metaString = stringifyFrontmatter(properties);
    withMeta = metaString + withMeta;
  }
  await Deno.writeTextFile(fullPath, withMeta);

  return toText(body);
}

export async function save(file: string) {
  const doc = loadTextFile(file);
  if (path.extname(file) !== ".md") {
    // throw new Error(`File ${file} is not in Markdown.`);
    return await saveTextFile(doc, file);
  }
  return await saveDoc(doc, file);
}

import { Root } from "npm:@types/mdast@4";
import { extractFrontmatter, parseMarkdown, toText } from "./markdown.ts";
import { SKIP, visit } from "https://esm.sh/unist-util-visit@5";
import * as path from "jsr:@std/path";
import { languageFromExt, textFileDoc } from "./commands/save.ts";

export function loadTextFile(file: string) {
    try {
        const content = Deno.readTextFileSync(file);
        return content;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            throw new Error(`File not found: ${file}`);
        }
        if (error instanceof Error) {
            console.error(
                `An unexpected error occurred while reading the file: ${file}`,
            );
        }
        throw error;
    }
}

function parseFile(file: string, linkedFiles: [string, string][]) {
    const content = loadTextFile(file);
    if (file.endsWith(".md")) {
        const parsed = parseMarkdown(content);
        const [_, children] = extractFrontmatter(parsed);
        const body: Root = { type: "root", children };
        expandLinks(body, file, linkedFiles);
        // console.log("body", body);
        return body;
    } else {
        const doc = textFileDoc(content, file);
        linkedFiles.push([content, file]);
        return parseMarkdown(doc);
    }
}

function resolveRelativeAbsolute(from: string, url: string) {
    if (url.startsWith("/")) {
        return url.slice(1);
    } else {
        return path.join(path.dirname(from), url);
    }
}

export function expandLinks(
    tree: Root,
    from: string,
    linkedFiles: [string, string][] = [],
) {
    visit(tree, "paragraph", (node, index, parent) => {
        const link = node.children[0];
        let url = "";
        if (link.type === "link") {
            const linkText = link.children[0];
            if (linkText.type === "text") {
                if (linkText.value.startsWith("@")) {
                    url = link.url;
                }
            }
        }
        if (link.type === "image") {
            if (link.alt?.startsWith("@")) {
                url = link.url;
            }
        }
        if (url) {
            const resolved = resolveRelativeAbsolute(from, url);
            const linked = parseFile(resolved, linkedFiles);
            // console.log("resolved", resolved, from, url);
            if (linked !== undefined && index !== undefined) {
                parent?.children.splice(index, 1, ...linked.children);
                return [SKIP, index + linked.children.length];
            }
        }
        return SKIP;
    });
    return linkedFiles;
}

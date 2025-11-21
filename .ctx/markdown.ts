import {
    frontmatterFromMarkdown,
    frontmatterToMarkdown,
} from "npm:mdast-util-frontmatter@2";
import { fromMarkdown } from "npm:mdast-util-from-markdown@2";
import { frontmatter } from "npm:micromark-extension-frontmatter@2";
import { toMarkdown } from "npm:mdast-util-to-markdown@2";
import { Nodes, Root, RootContent } from "npm:@types/mdast@4";
import { parse as parseYAML } from "jsr:@std/yaml";
import { expandLinks } from "./link.ts";

export function parseMarkdown(doc: string) {
    const tree = fromMarkdown(doc, {
        extensions: [frontmatter(["yaml"])],
        mdastExtensions: [frontmatterFromMarkdown(["yaml"])],
    });
    return tree;
}

function isH1(child: RootContent) {
    return (child.type === "heading" && child.depth === 1);
}

function validateStartsWithH1(children: RootContent[]) {
    if (!isH1(children[0])) {
        throw new Error(
            "Your document does not start with a heading 1: check that linked documents use an '@' prefix.",
        );
    }
}

export function extractFrontmatter(tree: Root) {
    let metadata, children;
    if (tree.children[0].type === "yaml") {
        children = tree.children.slice(1);
        metadata = tree.children[0].value;
    } else {
        children = tree.children;
    }
    return [metadata, children] as [string | undefined, RootContent[]];
}

function groupByH1(children: RootContent[]): Root[] {
    validateStartsWithH1(children);
    const groups = [];
    let i = -1;
    for (const child of children) {
        if (isH1(child)) {
            i++;
            groups[i] = [child];
        } else {
            groups[i].push(child);
        }
    }
    return groups.map((group) => ({ type: "root", children: group }));
}

export function toText(step: Root) {
    return toMarkdown(step, { extensions: [frontmatterToMarkdown(["yaml"])] });
}

export function parse(doc: string, file: string) {
    const tree = parseMarkdown(doc);
    const [metadata, children] = extractFrontmatter(tree);
    const body: Root = { type: "root", children };
    const linkedFiles = expandLinks(body, file);
    const steps = groupByH1(body.children);
    return [metadata, steps, body, linkedFiles] as [
        string | undefined,
        Root[],
        Root,
        [string, string][],
    ];
}

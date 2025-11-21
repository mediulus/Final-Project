import { parseArgs } from "jsr:@std/cli/parse-args";
import { save } from "./commands/save.ts";
import { promptLLM } from "./commands/prompt.ts";

const args = parseArgs(Deno.args, {
    alias: {
        help: "h",
    },
});

const helpMessage = `
usage: context <command> <doc.md>
commands:
    save
        saves a document to .context/
    prompt
        prompts an LLM using the document as context
        additionally saves the before/after versions
`;

if (args.help) {
    console.log(helpMessage);
    Deno.exit();
}

const command = args._[0];
const inputFile = args._[1];
if (typeof inputFile !== "string") {
    throw new Error("Missing or malformed file name.");
}

switch (command) {
    case "save":
        await save(inputFile);
        break;
    case "prompt": {
        const doc = await save(inputFile);
        if (doc === undefined) {
            throw new Error(`Document ${inputFile} could not be processed.`);
        }
        await promptLLM(doc, inputFile);
        break;
    }
    default:
        console.log(
            "Unknown command. Use options -h or --help for valid options.",
        );
}

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

const apiKey = process.env.NEOCITIES_API_KEY;

if (!apiKey) {
    console.error("api key is missing");
    process.exit(1);
}

const excluded = new Set([
    ".git",
    ".github",
    ".zed",
    "node_modules",
    ".env",
    ".gitignore",
    "package.json",
    "package-lock.json",
    "deploy.js",
]);

async function getFiles(directory) {
    const entries = await fs.readdir(directory, {
        withFileTypes: true,
    });

    const files = [];

    for (const entry of entries) {
        if (excluded.has(entry.name)) {
            continue;
        }

        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...await getFiles(fullPath));
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

const files = await getFiles(ROOT);

const form = new FormData();

for (const file of files) {
    const relativePath = path
        .relative(ROOT, file)
        .split(path.sep)
        .join("/");

    const data = await fs.readFile(file);

    form.append(
        relativePath,
        new Blob([data]),
        path.basename(file),
    );

    console.log(`Uploading: ${relativePath}`);
}

console.log(`\nUploading ${files.length} files...`);

const response = await fetch("https://neocities.org/api/upload", {
    method: "POST",
    headers: {
        Authorization: `Bearer ${apiKey}`,
    },
    body: form,
});

const text = await response.text();

if (!response.ok) {
    console.error("\nNeocities upload failed:");
    console.error(text);
    process.exit(1);
}

console.log("\nNeocities response:");
console.log(text);

console.log("\nDeployment complete.");

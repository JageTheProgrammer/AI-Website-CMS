"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentGenerationError = void 0;
exports.extractJson = extractJson;
exports.buildUserPrompt = buildUserPrompt;
exports.generateDocument = generateDocument;
const catalog_1 = require("./catalog");
const document_1 = require("./document");
class DocumentGenerationError extends Error {
    code;
    issues;
    raw;
    constructor(code, message, issues = [], raw = "") {
        super(message);
        this.code = code;
        this.issues = issues;
        this.raw = raw;
        this.name = "DocumentGenerationError";
    }
}
exports.DocumentGenerationError = DocumentGenerationError;
/** Extract the first balanced JSON object from model output (handles fences and chatter). */
function extractJson(text) {
    const s = String(text ?? "").trim();
    if (!s)
        return null;
    const candidates = [];
    for (const m of s.matchAll(/```(?:json)?\s*\n?([\s\S]*?)```/gi))
        candidates.push(m[1]);
    candidates.push(s);
    for (const cand of candidates) {
        const start = cand.indexOf("{");
        if (start < 0)
            continue;
        let depth = 0;
        let inStr = false;
        let esc = false;
        for (let i = start; i < cand.length; i++) {
            const ch = cand[i];
            if (inStr) {
                if (esc)
                    esc = false;
                else if (ch === "\\")
                    esc = true;
                else if (ch === '"')
                    inStr = false;
                continue;
            }
            if (ch === '"')
                inStr = true;
            else if (ch === "{")
                depth++;
            else if (ch === "}" && --depth === 0) {
                try {
                    return JSON.parse(cand.slice(start, i + 1));
                }
                catch {
                    break;
                }
            }
        }
    }
    return null;
}
function buildUserPrompt(prompt, current) {
    if (current) {
        return `CURRENT SITE DOCUMENT:\n${(0, catalog_1.describeDocumentForAI)(current)}\n\nCHANGE REQUEST:\n${prompt}\n\nReturn the complete updated JSON document.`;
    }
    return `Create a website for this request:\n\n${prompt}\n\nReturn the JSON document.`;
}
async function generateDocument(opts) {
    const max = Math.max(1, opts.maxAttempts ?? 3);
    const system = (0, catalog_1.buildSystemPrompt)(opts.catalog);
    const history = [];
    let prompt = buildUserPrompt(opts.prompt, opts.current);
    let lastIssues = [];
    let raw = "";
    for (let attempt = 1; attempt <= max; attempt++) {
        opts.onAttempt?.(attempt, attempt > 1 ? lastIssues : undefined);
        raw = await opts.complete({ system, prompt, history: [...history] });
        const json = extractJson(raw);
        let problem;
        if (json === null) {
            lastIssues = [{ path: "", message: "reply was not valid JSON" }];
            problem = "Your reply was not a single valid JSON object. Reply with the JSON document only, no markdown, no text before or after.";
        }
        else {
            const res = (0, document_1.validateDocument)(json);
            if (res.ok && res.document)
                return { document: res.document, warnings: res.warnings, attempts: attempt, raw };
            lastIssues = res.errors;
            problem = `The document was rejected. Fix these problems and return the COMPLETE corrected JSON document:\n${(0, document_1.issuesToText)(res.errors)}`;
        }
        history.push({ role: "user", content: prompt }, { role: "assistant", content: raw });
        prompt = problem;
    }
    const isJson = lastIssues.length === 1 && lastIssues[0].message.startsWith("reply was not valid JSON");
    throw new DocumentGenerationError(isJson ? "INVALID_JSON" : "INVALID_DOCUMENT", `The AI did not produce a valid site after ${max} attempts.\n${(0, document_1.issuesToText)(lastIssues, 8)}`, lastIssues, raw);
}

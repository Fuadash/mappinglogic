import { enrichFields, writeEnrichedData } from "./enricher.js";
import { tagFields, writeTaggedData } from "./tagger.js";
import { matchFields, printMatches, writeMatches } from "./matcher.js";
import fsp from "fs/promises";

async function loadExtraction() {
    const jsonString = await fsp.readFile("./data/extracted_data.json", "utf8");
    return JSON.parse(jsonString);
}

async function main() {
    const EXTRACTION_VALUES = await loadExtraction();
    console.log("INITIAL EXTRACTION----------------------------------------")
    console.log(EXTRACTION_VALUES)
    console.log("----------------------------------------")

    // 1. Enrich Fields
    const enriched = enrichFields(EXTRACTION_VALUES);
    writeEnrichedData(enriched);

    // 2. AI Tagging
    const tagged = await tagFields(enriched);
    writeTaggedData(tagged);

    // 3. Matching Algorithm
    const matches = matchFields(tagged);
    writeMatches(matches)
    
    console.log("FINAL CONFIDENCE SCORE----------------------------------------")
    printMatches(matches);
    console.log("----------------------------------------")
}

main().catch(console.error);
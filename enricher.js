import fs from "fs";

function normalizeFieldName(name) {
  return name
    .replace(/[_\-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .trim();
}

function isStrictDate(value) {
  // YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(value)) return true;

  // DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(value)) return true;

  return false;
}

function detectSemanticType(value) {
  const raw = value === null || value === undefined
    ? ""
    : String(value).trim();

  const lower = raw.toLowerCase();

  // boolean-like
  const booleanValues = ["yes", "no", "true", "false", "y", "n"];
  if (booleanValues.includes(lower)) return "boolean";

  // strict date (BEFORE numbers)
  if (isStrictDate(raw)) return "date";

  // pure number
  if (/^[0-9]+(\.[0-9]+)?$/.test(raw)) return "number";

  // alphanumeric
  if (/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9 ]+$/.test(raw))
    return "numbers_and_letters";

  // letters only
  if (/^[a-zA-Z ]+$/.test(raw)) return "letters";

  return "unknown";
}

function detectObservedType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}


function extractFields(obj, result = {}, path = []) {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...path, key];

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      extractFields(value, result, currentPath);
    } else {
      const rawValue = value === null || value === undefined
        ? ""
        : String(value);

      result[key] = {
        raw_field_name: key,
        normalized_field_name: normalizeFieldName(key),
        value: rawValue,
        length: rawValue.length,
        observed_type: detectObservedType(value),
        semantic_type: detectSemanticType(value),
        path: currentPath.join(".")
      };
    }
  }

  return result;
}

export function enrichFields(extractionValues) {
    const normalizedFields = extractFields(extractionValues);
    return normalizedFields;
}

// optional helper
export function writeEnrichedData(data, path = "data/enriched_data.json") {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

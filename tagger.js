import fs from "fs/promises";

const AVAILABLE_TAGS = [
  "identity",
  "personal_details",
  "personal_name",
  "title",
  "date_of_birth",
  "age",
  "gender",
  "nationality",
  "citizenship",
  "marital_status",
  "dependents",
  "household",
  "language",
  "residency_status",

  "contact_information",
  "email",
  "phone_number",
  "mobile",
  "landline",
  "preferred_contact_method",
  "communication_consent",

  "address",
  "current_address",
  "previous_address",
  "address_history",
  "residency_duration",
  "postcode",
  "country",
  "region",
  "local_authority",

  "employment",
  "employment_status",
  "employer",
  "job_title",
  "occupation",
  "employment_type",
  "employment_duration",

  "income",
  "primary_income",
  "secondary_income",
  "annual_income",
  "monthly_income",
  "income_source",
  "bonus",
  "overtime",
  "commission",
  "self_employed",

  "financial",
  "banking",
  "bank_account",
  "account_number",
  "sort_code",
  "payment_details",
  "outgoings",
  "expenses",
  "assets",
  "liabilities",
  "savings",
  "investments",
  "net_worth",

  "credit",
  "credit_history",
  "credit_score",
  "credit_commitments",
  "loans",
  "existing_mortgage",
  "arrears",
  "defaults",
  "bankruptcy",

  "mortgage",
  "mortgage_application",
  "mortgage_type",
  "loan_amount",
  "deposit",
  "loan_to_value",
  "interest_rate",
  "term_length",
  "repayment_type",

  "property_details",
  "property_type",
  "property_value",
  "purchase_price",
  "tenure",
  "new_build",
  "buy_to_let",
  "first_time_buyer",

  "legal",
  "consent",
  "terms_acceptance",
  "data_protection",
  "privacy",
  "identity_verification",
  "kyc",
  "aml",
  "right_to_work",
  "regulatory",

  "current",
  "previous",
  "historical",
  "declared",
  "calculated",
  "derived",
  "optional",
  "required"
];

function stripJsonFences(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

async function tagFieldsBatchWithAI(fieldsObj, allowedTags, llmCall) {
    const compactFields = {};

    for (const [key, field] of Object.entries(fieldsObj)) {
        compactFields[key] = {
        normalized_field_name: field.normalized_field_name,
        semantic_type: field.semantic_type,
        path: field.path,
        };
    }

    const prompt = {
        instruction: [
            "You must return a SINGLE JSON object.",
            "Do NOT wrap the response in ```json or ```.",
            "Do NOT include markdown, comments, or explanations.",
            "The first character of your response MUST be '{'.",
            "The last character of your response MUST be '}'.",
            "If you violate these rules, the response is invalid."
        ].join(" "),
        example_output: {
            first_name: ["personal_name", "personal_details", "identity"],
            last_name: ["personal_name", "personal_details", "identity"],
            date_of_birth: ["date_of_birth", "personal_details", "identity"]
        },
        rules: [
            "Each value must be an array",
            "Tags must come only from allowed_tags",
            "Unknown fields must still appear with empty array"
        ],
        allowed_tags: allowedTags,
        fields: compactFields
    };


    const response = await llmCall({
        system: "You are a strict structured data classifier.",
        user: JSON.stringify(prompt),
        response_format: { type: "json_object" }
    });

    try {
        console.log("LLM RAW RESPONSE:", response);
        const raw = stripJsonFences(response);
        const parsed = JSON.parse(raw);

        // sanitize output
        const cleaned = {};

        for (const key of Object.keys(compactFields)) {
            const tags = Array.isArray(parsed[key]) ? parsed[key] : [];
            cleaned[key] = tags.filter(t => allowedTags.includes(t));
        }

        return cleaned;

    } catch (err) {
        console.error("Batch tag parse failed:", err);
        return {};
    }
}

async function tagAllFields(importedFields, tagVocabulary, llmCall) {
  const results = {};
  const chunks = chunkObject(importedFields, 40); // safe batch size

  for (const chunk of chunks) {
    const aiResults = await tagFieldsBatchWithAI(
      chunk,
      tagVocabulary,
      llmCall
    );

    for (const [key, tags] of Object.entries(aiResults)) {
      if (!results[key]) results[key] = new Set();
      tags.forEach(t => results[key].add(t));
    }
  }

  for (const key of Object.keys(importedFields)) {
    importedFields[key].tags = results[key]
      ? [...results[key]]
      : [];
  }

  return importedFields;
}

function chunkObject(obj, size) {
  const entries = Object.entries(obj);
  const chunks = [];

  for (let i = 0; i < entries.length; i += size) {
    chunks.push(Object.fromEntries(entries.slice(i, i + size)));
  }

  return chunks;
}

async function loadFields() {
  const jsonString = await fs.readFile("./data/enriched_data.json", "utf8");
  return JSON.parse(jsonString);
}

// async function llmCall({ user }) {
//   const prompt = JSON.parse(user);

//   const result = {};

//   for (const key of Object.keys(prompt.fields)) {
//     result[key] = ["personal_details"]; // dummy tag
//   }

//   return JSON.stringify(result);
// }

async function llmCallDummy({ user }) {
  const prompt = JSON.parse(user);
  const result = {};

  for (const [key, field] of Object.entries(prompt.fields)) {
    const text = (
      field.normalized_field_name + " " +
      field.path + " " +
      field.semantic_type
    ).toLowerCase();

    const tags = [];

    if (text.includes("name")) tags.push("personal_name", "identity");
    if (text.includes("address") || text.includes("postcode")) tags.push("address");
    if (text.includes("email") || text.includes("phone")) tags.push("contact");
    if (text.includes("income") || text.includes("salary")) tags.push("income", "financial");
    if (text.includes("credit")) tags.push("credit", "financial");
    if (text.includes("mortgage") || text.includes("loan")) tags.push("mortgage", "financial");
    if (text.includes("employment") || text.includes("job")) tags.push("employment");
    if (text.includes("consent") || text.includes("agree")) tags.push("consent", "legal");
    if (text.includes("previous")) tags.push("previous");
    if (text.includes("current")) tags.push("current");

    result[key] = tags.filter(t => prompt.allowed_tags.includes(t));
  }

  return JSON.stringify(result);
}

async function llmCallOllama({ system, user }) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "glm-4.6:cloud",
      prompt: system + "\n" + user,
      stream: false
    })
  });

  const data = await res.json();
  return data.response;
}

export async function tagFields(fields, llmFn) {
    await tagAllFields(fields, AVAILABLE_TAGS, llmCallOllama);
    return fields;
}

export function writeTaggedData(fields, path = "data/tagged_data.json") {
    fs.writeFile(path, JSON.stringify(fields, null, 2));
}

const fs = require("fs");

EXTRACTION_VALUES = {
  "applicant": {
    "first_name": "John",
    "last_name": "Smith",
    "date_of_birth": "1988-06-15",
    "nationality": "British",
    "marital_status": "Married",
    "number_of_dependants": 2,
    "national_insurance_number": "AB123456C"
  },
  "contact_information": {
    "email_address": "john.smith@email.com",
    "mobile_phone_number": "07123456789"
  },
  "address_details": {
    "current_address": "12 High Street, London",
    "postcode": "SW1A 1AA",
    "residential_status": "Owner Occupier",
    "time_at_current_address_years": 5
  },
  "employment_income": {
    "employment_status": "Employed",
    "employer_name": "ABC Ltd",
    "job_title": "Software Engineer",
    "annual_income": 65000,
    "other_income": 5000
  },
  "mortgage_details": {
    "mortgage_type": "Purchase",
    "application_type": "Residential",
    "property_value": 350000,
    "purchase_price": 345000,
    "loan_amount_requested": 300000,
    "deposit_amount": 45000,
    "term_years": 25,
    "repayment_type": "Repayment"
  },
  "credit_declarations": {
    "credit_commitments_monthly": 750,
    "adverse_credit_history": false,
    "source_of_deposit": "Savings",
    "consent_to_credit_check": true
  }
}

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

const normalizedFields = extractFields(EXTRACTION_VALUES);
console.log(normalizedFields);

const jsonData = JSON.stringify(normalizedFields);

fs.writeFile("data/enriched_data.json", jsonData, function(err) {
    if (err) {
        console.log(err);
    }
});
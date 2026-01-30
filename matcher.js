import fs from "fs";

const INTERNAL_FIELDS = [
    {
        key: "first_name",
        type: "letters",
        expected_length: [2, 30],
        tags: ["identity", "personal_details", "personal_name"],
        synonyms: ["first name", "forename", "given name", "fname", "first"]
    },
    {
        key: "last_name",
        type: "letters",
        expected_length: [2, 30],
        tags: ["identity", "personal_details", "personal_name"],
        synonyms: ["last name", "surname", "family name", "lname", "last"]
    },
    {
        key: "date_of_birth",
        type: "date",
        expected_length: [10, 10],
        tags: ["identity", "personal_details", "date_of_birth"],
        synonyms: ["date of birth", "dob", "birth date", "birthdate"]
    },
    {
        key: "nationality",
        type: "letters",
        expected_length: [3, 30],
        tags: ["identity", "personal_details", "nationality"],
        synonyms: ["nationality", "citizenship", "country of nationality", "national origin"]
    },
    {
        key: "marital_status",
        type: "letters",
        expected_length: [6, 20],
        tags: ["personal_details", "marital_status"],
        synonyms: ["marital status", "married", "relationship status", "civil status"]
    },
    {
        key: "number_of_dependants",
        type: "number",
        expected_length: [1, 2],
        tags: ["personal_details", "dependents", "household"],
        synonyms: ["dependants", "dependents", "number of dependants", "children", "no of dependants"]
    },
    {
        key: "national_insurance_number",
        type: "numbers_and_letters",
        expected_length: [9, 9],
        tags: [
        "identity",
        "personal_details",
        "employment",
        "legal",
        "identity_verification"
        ],
        synonyms: ["national insurance number", "ni number", "nino", "insurance number"]
    },
    {
        key: "uk_citizen",
        type: "boolean",
        expected_length: [1, 5],
        tags: ["identity", "personal_details", "citizenship", "country"],
        synonyms: ["uk citizen", "british citizen", "citizenship uk", "is uk citizen"]
    },
    {
        key: "email_address",
        type: "email",
        expected_length: [5, 254],
        tags: ["contact_information", "email"],
        synonyms: ["email", "email address", "e-mail"]
    },
    {
        key: "mobile_phone_number",
        type: "number",
        expected_length: [10, 15],
        tags: ["contact_information", "phone_number", "mobile"],
        synonyms: ["mobile phone", "mobile number", "cell phone", "phone number"]
    },
    {
        key: "current_address",
        type: "string",
        expected_length: [10, 200],
        tags: ["address", "current_address"],
        synonyms: ["current address", "home address", "present address"]
    },
    {
        key: "postcode",
        type: "string",
        expected_length: [5, 8],
        tags: ["address", "postcode"],
        synonyms: ["postcode", "zip code", "postal code"]
    },
    {
        key: "residential_status",
        type: "letters",
        expected_length: [5, 30],
        tags: ["address", "residency_status"],
        synonyms: ["residential status", "tenure", "owner occupier", "renting"]
    },
    {
        key: "time_at_current_address_years",
        type: "number",
        expected_length: [1, 2],
        tags: ["address", "residency_duration", "current"],
        synonyms: ["time at address", "years at address", "address duration"]
    },
    {
        key: "previous_address",
        type: "string",
        expected_length: [10, 200],
        tags: ["address", "previous_address"],
        synonyms: ["previous address", "last address"]
    },
    {
        key: "previous_address_postcode",
        type: "string",
        expected_length: [5, 8],
        tags: ["address", "postcode", "previous"],
        synonyms: ["previous postcode", "last postcode"]
    },
    {
        key: "employment_status",
        type: "letters",
        expected_length: [5, 30],
        tags: ["employment", "employment_status"],
        synonyms: ["employment status", "employed", "self employed", "contractor"]
    },
    {
        key: "employer_name",
        type: "string",
        expected_length: [2, 100],
        tags: ["employment", "employer"],
        synonyms: ["employer", "company name", "employer name"]
    },
    {
        key: "job_title",
        type: "letters",
        expected_length: [2, 50],
        tags: ["employment", "job_title", "occupation"],
        synonyms: ["job title", "role", "position"]
    },
    {
        key: "annual_income",
        type: "number",
        expected_length: [4, 7],
        tags: ["income", "annual_income", "primary_income"],
        synonyms: ["annual income", "salary", "yearly income"]
    },
    {
        key: "other_income",
        type: "number",
        expected_length: [1, 7],
        tags: ["income", "secondary_income"],
        synonyms: ["other income", "additional income", "secondary income"]
    },
    {
        key: "mortgage_type",
        type: "letters",
        expected_length: [5, 30],
        tags: ["mortgage", "mortgage_type"],
        synonyms: ["mortgage type", "purchase", "remortgage"]
    },
    {
        key: "application_type",
        type: "letters",
        expected_length: [5, 30],
        tags: ["mortgage_application"],
        synonyms: ["application type", "residential", "buy to let"]
    },
    {
        key: "property_value",
        type: "number",
        expected_length: [5, 7],
        tags: ["property_details", "property_value"],
        synonyms: ["property value", "estimated value"]
    },
    {
        key: "purchase_price",
        type: "number",
        expected_length: [5, 7],
        tags: ["property_details", "purchase_price"],
        synonyms: ["purchase price", "buy price"]
    },
    {
        key: "loan_amount_requested",
        type: "number",
        expected_length: [5, 7],
        tags: ["mortgage", "loan_amount"],
        synonyms: ["loan amount", "mortgage amount", "amount requested"]
    },
    {
        key: "deposit_amount",
        type: "number",
        expected_length: [4, 7],
        tags: ["mortgage", "deposit"],
        synonyms: ["deposit", "down payment"]
    },
    {
        key: "term_years",
        type: "number",
        expected_length: [1, 2],
        tags: ["mortgage", "term_length"],
        synonyms: ["term", "mortgage term", "years"]
    },
    {
        key: "repayment_type",
        type: "letters",
        expected_length: [5, 20],
        tags: ["mortgage", "repayment_type"],
        synonyms: ["repayment type", "repayment", "interest only"]
    },
    {
        key: "property_is_new_build",
        type: "boolean",
        expected_length: [1, 5],
        tags: ["property_details", "new_build"],
        synonyms: ["new build", "is new build"]
    },
    {
        key: "credit_commitments_monthly",
        type: "number",
        expected_length: [1, 6],
        tags: ["credit", "credit_commitments", "outgoings"],
        synonyms: ["credit commitments", "monthly credit", "debt payments"]
    },
    {
        key: "adverse_credit_history",
        type: "boolean",
        expected_length: [1, 5],
        tags: ["credit", "credit_history"],
        synonyms: ["adverse credit", "bad credit history"]
    },
    {
        key: "source_of_deposit",
        type: "letters",
        expected_length: [5, 50],
        tags: ["mortgage", "deposit", "financial"],
        synonyms: ["source of deposit", "deposit source"]
    },
    {
        key: "consent_to_credit_check",
        type: "boolean",
        expected_length: [1, 5],
        tags: ["consent", "credit", "legal"],
        synonyms: ["credit check consent", "permission for credit check"]
    },
    {
        key: "country_of_birth",
        type: "letters",
        expected_length: [3, 30],
        tags: ["identity", "personal_details", "country"],
        synonyms: ["country of birth", "birth country"]
    },
    {
        key: "do_you_have_dual_nationality",
        type: "boolean",
        expected_length: [1, 5],
        tags: ["identity", "nationality"],
        synonyms: ["dual nationality", "multiple citizenships"]
    },
    {
        key: "school_fees",
        type: "number",
        expected_length: [1, 6],
        tags: ["expenses", "outgoings", "household"],
        synonyms: ["school fees", "education costs", "tuition fees"]
    }
];

function tagScore(xTags = [], yTags = []) {
    if (!xTags.length || !yTags.length) return 0;

    const xSet = new Set(xTags);
    const ySet = new Set(yTags);

    const intersection = [...ySet].filter(t => xSet.has(t));
    if (intersection.length === 0) return 0;

    const coverage = intersection.length / ySet.size;   // how much of y is explained
    const precision = intersection.length / xSet.size;  // how specific x is

    // skepticism for small Y
    const sizeBoost = coverage < 1 
        ? Math.min(1, Math.log2(ySet.size + 1) / Math.log2(10))
        : 1;


    const score =
        coverage *
        (0.6 + 0.4 * precision) *
        sizeBoost;

    return Number(score.toFixed(4));
}

function typeScore(xType, yType) {
    return xType === yType ? 1 : 0;
}

function lengthScore(actual, [min, max]) {
  if (actual >= min && actual <= max) return 1;

  const range = Math.max(1, max - min);

  // asymmetric tolerances
  const lowTolerance = Math.max(1, Math.floor(range * 0.3));
  const highTolerance = Math.max(1, Math.floor(range * 0.8));

  // ---------- BELOW MIN ----------
  if (actual < min) {
    if (actual >= min - lowTolerance) {
      const dist = min - actual;
      return Math.max(0.15, 1 - dist / (lowTolerance + 0.5));
    }
    return 0.02; // strong fail
  }

  // ---------- ABOVE MAX ----------
  if (actual > max) {
    if (actual <= max + highTolerance) {
      const dist = actual - max;
      return Math.max(0.35, 1 - dist / (highTolerance + 1));
    }
    return 0.05;
  }

  return 0.01;
}

function nameScore(observedName, field) {
    const WEAK_TOKENS = new Set([
        "status",
        "number",
        "date",
        "type",
        "amount",
        "value",
        "code",
        "id",
        "identifier",
        "details",
        "info",
        "information"
    ]);

    const obs = normalize(observedName);
    const key = normalize(field.key);
    const synonyms = field.synonyms.map(normalize);

    // ---------- exact matches ----------
    if (obs === key) return 1.0;
    if (synonyms.includes(obs)) return 1.0;

    const obsTokens = obs.split(" ");
    const synTokens = synonyms.flatMap(s => s.split(" "));

    let strongOverlap = 0;
    let weakOverlap = 0;

    for (const t of synTokens) {
        if (!obsTokens.includes(t)) continue;
        if (WEAK_TOKENS.has(t)) weakOverlap++;
        else strongOverlap++;
    }

    // ---------- scoring ----------
    if (strongOverlap >= 2) return 0.9;
    if (strongOverlap === 1) return 0.7;

    // only weak overlap (e.g. "status")
    if (weakOverlap >= 1) return 0.25;

    // ---------- partial containment ----------
    if (
        synonyms.some(s =>
        obs.includes(s) || s.includes(obs)
        )
    ) {
        return 0.45;
    }

    return 0;
}

function confidenceBreakdown(observedField, internalField) {
    const name = nameScore(
        observedField.normalized_field_name || observedField.raw_field_name,
        internalField
    );

    if (name < 0.6) {
        return { total: 0, rejected: "name" };
    }

    const length = lengthScore(
        observedField.length,
        internalField.expected_length
    );

    const type = typeScore(
        observedField.semantic_type,
        internalField.type
    );

    if (type === 0) {
        return { total: 0, rejected: "type" };
    }

    const tags = tagScore(
        observedField.tags,
        internalField.tags
    );

    const weights = {
        name: 0.60,
        tags: 0.25,
        length: 0.15
    };

    let total =
        name   * weights.name +
        tags   * weights.tags +
        length * weights.length;

    return {
        total: Number(total.toFixed(4)),
        components: {
        name:   Number(name.toFixed(3)),
        tags:   Number(tags.toFixed(3)),
        length: Number(length.toFixed(3))
        },
        weighted: {
        name:   Number((name   * weights.name).toFixed(3)),
        tags:   Number((tags   * weights.tags).toFixed(3)),
        length: Number((length * weights.length).toFixed(3))
        }
    };
}

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[_\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchFields(taggedData) {
    const matches = {};

    for (const [xKey, xField] of Object.entries(taggedData)) {
        const results = INTERNAL_FIELDS
        .map(yField => {
            const breakdown = confidenceBreakdown(xField, yField);
            return {
            internal_key: yField.key,
            ...breakdown
            };
        })
        .filter(r => r.total > 0)
        .sort((a, b) => b.total - a.total);

        matches[xKey] = results;
    }

    return matches;
}

export function printMatches(matches) {
    for (const [key, results] of Object.entries(matches)) {
        console.log(`\n External field: ${key}`);
        results.forEach(r => {
        console.log(
            `  -> ${r.internal_key}: ${r.total}\n` +
            `     name:   ${r.components.name} (${r.weighted.name})\n` +
            `     tags:   ${r.components.tags} (${r.weighted.tags})\n` +
            `     length: ${r.components.length} (${r.weighted.length})\n`
        );
        });
    }
}

export function writeMatches(
    matches,
    {
        path = "data/matches.json",
        topN = null,      // e.g. 2 to keep only top 2
        minScore = 0      // e.g. 0.7 to filter low junk
    } = {}
    ) {
    const output = {};

    for (const [externalKey, results] of Object.entries(matches)) {
        const simplified = {};

        results
        .filter(r => r.total >= minScore)
        .slice(0, topN ?? results.length)
        .forEach(r => {
            simplified[r.internal_key] = Number(r.total.toFixed(4));
        });

        if (Object.keys(simplified).length > 0) {
        output[externalKey] = simplified;
        }
    }

    fs.writeFileSync(path, JSON.stringify(output, null, 2));
}


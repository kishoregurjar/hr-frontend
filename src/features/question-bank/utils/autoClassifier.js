/**
 * Auto-Classification Engine for HireQuest Bulk Question Ingestion
 * Infers Category, Difficulty, Tags, and Correct Option dynamically.
 */

const CATEGORY_KEYWORDS = {
  "Frontend": [
    "react", "vue", "angular", "html", "css", "jsx", "tsx", "hook", "dom",
    "tailwind", "flexbox", "grid", "usestate", "useeffect", "usememo", "redux",
    "browser", "javascript", "typescript", "frontend", "ui", "ux", "component",
    "webpack", "vite", "props", "virtual dom", "spa", "responsive"
  ],
  "Backend": [
    "node", "express", "nest", "django", "flask", "spring", "springboot", "api",
    "rest", "restful", "graphql", "microservice", "middleware", "jwt", "auth",
    "session", "oauth", "route", "controller", "server", "backend", "fastapi"
  ],
  "Database": [
    "sql", "mysql", "postgres", "postgresql", "mongodb", "database", "query",
    "nosql", "redis", "schema", "table", "index", "acid", "join", "foreign key",
    "primary key", "normalization", "relational", "orm", "prisma", "sequelize"
  ],
  "DevOps": [
    "docker", "kubernetes", "k8s", "aws", "azure", "gcp", "ci/cd", "pipeline",
    "nginx", "linux", "container", "devops", "deploy", "serverless", "jenkins",
    "terraform", "ansible", "cloud"
  ],
  "DSA & Algorithms": [
    "algorithm", "complexity", "big o", "array", "linked list", "binary tree",
    "tree", "graph", "stack", "queue", "sorting", "search", "dp", "dynamic programming",
    "recursion", "hash", "heap", "dfs", "bfs", "greedy", "space complexity", "time complexity"
  ],
  "System Design": [
    "scalability", "load balancer", "caching", "sharding", "system design",
    "latency", "throughput", "message queue", "kafka", "rabbitmq", "cap theorem",
    "microservices", "cdn", "fault tolerance"
  ],
  "General Programming": [
    "function", "variable", "class", "object", "oop", "inheritance", "polymorphism",
    "loop", "conditional", "promise", "async", "await", "exception", "pointer"
  ],
};

const COMMON_TECH_TAGS = [
  "React", "JavaScript", "TypeScript", "Node.js", "Express", "Python", "Java",
  "C++", "SQL", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS",
  "Git", "REST API", "GraphQL", "HTML", "CSS", "Tailwind CSS", "Redux", "Next.js",
  "Algorithms", "Data Structures", "System Design", "Security", "Testing", "Linux",
  "Hooks", "OOP", "Async", "Database"
];

/**
 * Auto-detects category from question content and options
 */
export const autoDetectCategory = (text = "", options = [], existingCategories = []) => {
  const fullText = (text + " " + options.join(" ")).toLowerCase();

  // 1. Try to match with existing database categories first
  if (Array.isArray(existingCategories) && existingCategories.length > 0) {
    for (const cat of existingCategories) {
      const catNameLower = String(cat.name || "").toLowerCase().trim();
      if (!catNameLower) continue;

      // Exact word in text
      const regex = new RegExp(`\\b${catNameLower}\\b`, "i");
      if (regex.test(fullText)) {
        return { name: cat.name, id: cat.id };
      }
    }
  }

  // 2. Keyword heuristic matching
  let bestCategory = "General";
  let maxMatches = 0;

  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let matchCount = 0;
    for (const kw of keywords) {
      if (fullText.includes(kw)) {
        matchCount++;
      }
    }
    if (matchCount > maxMatches) {
      maxMatches = matchCount;
      bestCategory = categoryName;
    }
  }

  // If we found a category name, check if it exists in db categories to pass its ID
  const matchedExisting = (existingCategories || []).find(
    (c) =>
      c.name.toLowerCase().trim() === bestCategory.toLowerCase().trim() ||
      c.name.toLowerCase().includes(bestCategory.toLowerCase()) ||
      bestCategory.toLowerCase().includes(c.name.toLowerCase())
  );

  return {
    name: matchedExisting ? matchedExisting.name : bestCategory,
    id: matchedExisting ? matchedExisting.id : null,
  };
};

/**
 * Auto-calculates difficulty based on word count, code syntax, and advanced terms
 */
export const autoDetectDifficulty = (text = "", options = []) => {
  const fullText = text + " " + options.join(" ");
  const wordCount = text.trim().split(/\s+/).length;

  let complexityScore = 0;

  // Length factors
  if (wordCount < 10) complexityScore += 0;
  else if (wordCount <= 22) complexityScore += 1;
  else complexityScore += 2;

  // Technical code syntax
  if (/[{}()=>;]|const |function |SELECT |FROM |WHERE |O\([n1]\)/i.test(fullText)) {
    complexityScore += 1;
  }

  // Advanced keywords
  const advancedKeywords = [
    "deadlock", "concurrency", "distributed", "thread", "mutex",
    "closure", "prototype", "btree", "sharding", "asynchronous",
    "dynamic programming", "bit manipulation", "normalization", "acid"
  ];

  for (const kw of advancedKeywords) {
    if (fullText.toLowerCase().includes(kw)) {
      complexityScore += 1;
      break;
    }
  }

  if (complexityScore <= 1) return "Easy";
  if (complexityScore === 2) return "Medium";
  return "Hard";
};

/**
 * Auto-extracts skill tags from question content
 */
export const autoExtractTags = (text = "", options = [], existingTags = []) => {
  const fullText = (text + " " + options.join(" ")).toLowerCase();
  const extractedTags = new Set();

  // Match common technical tags
  for (const tag of COMMON_TECH_TAGS) {
    const escaped = tag.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, "i");
    if (regex.test(fullText)) {
      extractedTags.add(tag);
    }
  }

  // Also check existing database tags
  if (Array.isArray(existingTags)) {
    for (const tag of existingTags) {
      const tagName = String(tag.name || "").trim();
      if (!tagName) continue;
      const escaped = tagName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, "i");
      if (regex.test(fullText)) {
        extractedTags.add(tagName);
      }
    }
  }

  return Array.from(extractedTags).slice(0, 5); // Limit to top 5 tags
};

/**
 * Detects the correct answer key (optionA, optionB, optionC, optionD)
 */
export const detectCorrectOptionKey = (correctAnswerInput, options = {}) => {
  if (!correctAnswerInput) return null;

  const raw = String(correctAnswerInput).trim();
  const lower = raw.toLowerCase();

  // 1. Direct letter matching
  if (lower === "a" || lower === "optiona" || lower === "option a" || lower === "1") return "optionA";
  if (lower === "b" || lower === "optionb" || lower === "option b" || lower === "2") return "optionB";
  if (lower === "c" || lower === "optionc" || lower === "option c" || lower === "3") return "optionC";
  if (lower === "d" || lower === "optiond" || lower === "option d" || lower === "4") return "optionD";

  // 2. Exact or close text match against option values
  for (const [key, val] of Object.entries(options)) {
    if (val && String(val).trim().toLowerCase() === lower) {
      return key;
    }
  }

  return null;
};

/**
 * Standard CSV Template Content Generator
 */
export const getSampleCsvContent = () => {
  return [
    `question,optionA,optionB,optionC,optionD,correctAnswer,category,difficulty,tags`,
    `"What is useState in React?","A React hook for local state","A CSS styling class","A database query helper","A server routing engine","A","Frontend","Easy","React,Hooks,JavaScript"`,
    `"What does SQL JOIN do?","Combines rows from two or more tables","Deletes duplicate records","Creates a new database table","Sorts records descending","A","Database","Medium","SQL,Database,Joins"`,
    `"What is Big O(1) time complexity?","Constant execution time","Linear time complexity","Quadratic time complexity","Logarithmic time complexity","Constant execution time","DSA & Algorithms","Easy","Algorithms,Complexity"`,
    `"Which HTTP status code represents 'Internal Server Error'?","200","404","500","401","C","Backend","Easy","HTTP,API,Web"`,
    `"What is Docker used for?","Containerizing applications and dependencies","Writing styling sheets","Managing relational database schemas","Hosting video files","A","DevOps","Medium","Docker,Containers,DevOps"`
  ].join("\n");
};

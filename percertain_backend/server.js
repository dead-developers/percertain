import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {
  createRepo,
  uploadFiles,
  whoAmI,
  spaceInfo,
  fileExists,
} from "@huggingface/hub";
import { InferenceClient } from "@huggingface/inference";
import bodyParser from "body-parser";
import yaml from 'js-yaml'; // Added for DSL parsing
import fs from 'fs'; // Added for reading DSL files
import cors from 'cors'; // Added for CORS

import checkUser from "./middlewares/checkUser.js";
import { PROVIDERS } from "./utils/providers.js";
import { COLORS } from "./utils/colors.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

const ipAddresses = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.APP_PORT || 3000;
const REDIRECT_URI =
  process.env.REDIRECT_URI || "http://localhost:" + PORT + "/auth/login";

// Define Model IDs
const UI_MODEL_ID = "deepseek-ai/DeepSeek-V3-0324"; // For UI Generation
const LOGIC_MODEL_ID = "deepseek-ai/deepseek-coder-6.7b-instruct"; // Placeholder for Logic/Reasoning (e.g., DeepSeek-R1 or similar)

const MAX_REQUESTS_PER_IP = 2;

// CORS Configuration - Allow requests from frontend origin
// TODO: Replace '*' or add specific frontend origin in production
app.use(cors({ 
  origin: process.env.FRONTEND_URL || '*', // Allow specific origin or all for now
  credentials: true 
}));

app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for potentially larger DSL inputs
app.use(express.static(path.join(__dirname, "dist"))); // Serve original DeepSite frontend if needed

// --- Helper Functions ---
const getPTag = (repoId) => {
  return '<p style="border-radius: 8px; text-align: center; font-size: 12px; color: #fff; margin-top: 16px;position: fixed; left: 8px; bottom: 8px; z-index: 10; background: rgba(0, 0, 0, 0.8); padding: 4px 8px;">Made with <img src="https://enzostvs-deepsite.hf.space/logo.svg" alt="DeepSite Logo" style="width: 16px; height: 16px; vertical-align: middle;display:inline-block;margin-right:3px;filter:brightness(0) invert(1);"><a href="https://enzostvs-deepsite.hf.space" style="color: #fff;text-decoration: underline;" target="_blank" >DeepSite</a> - 🧬 <a href="https://enzostvs-deepsite.hf.space?remix=' + repoId + '" style="color: #fff;text-decoration: underline;" target="_blank" >Remix</a></p>';
};

// --- Auth Endpoints (from DeepSite) ---
app.get("/api/login", (_req, res) => {
  const redirectUrl = "https://huggingface.co/oauth/authorize?client_id=" + process.env.OAUTH_CLIENT_ID + "&redirect_uri=" + REDIRECT_URI + "&response_type=code&scope=openid%20profile%20write-repos%20manage-repos%20inference-api&prompt=consent&state=1234567890";
  res.status(200).send({
    ok: true,
    redirectUrl,
  });
});

app.get("/auth/login", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(302, "/");
  }
  const Authorization = "Basic " + Buffer.from(
    process.env.OAUTH_CLIENT_ID + ":" + process.env.OAUTH_CLIENT_SECRET
  ).toString("base64");

  try {
    const request_auth = await fetch("https://huggingface.co/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const response = await request_auth.json();

    if (!response.access_token) {
      console.error("OAuth Error: No access token received.", response);
      return res.redirect(302, "/"); // Redirect on error
    }

    res.cookie("hf_token", response.access_token, {
      httpOnly: false, // Set to true if frontend doesn't need to read it directly
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: "none", // Required for cross-site cookies
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.redirect(302, "/"); // Redirect to frontend home after login
  } catch (error) {
    console.error("Error during /auth/login:", error);
    return res.redirect(302, "/"); // Redirect on exception
  }
});

app.get("/auth/logout", (req, res) => {
  res.clearCookie("hf_token", {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "none",
  });
  return res.redirect(302, "/");
});

app.get("/api/@me", checkUser, async (req, res) => {
  let { hf_token } = req.cookies;

  // Allow local use without login if HF_TOKEN is set in backend .env
  if (process.env.HF_TOKEN && process.env.HF_TOKEN !== "") {
    return res.send({
      preferred_username: "local-use",
      isLocalUse: true,
    });
  }

  // If no backend HF_TOKEN, check user's cookie
  if (!hf_token) {
    return res.status(401).send({ ok: false, message: "Not logged in" });
  }

  try {
    const request_user = await fetch("https://huggingface.co/oauth/userinfo", {
      headers: {
        Authorization: "Bearer " + hf_token,
      },
    });

    if (!request_user.ok) {
        const errorData = await request_user.text();
        console.error("Failed to fetch user info:", request_user.status, errorData);
        res.clearCookie("hf_token", { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: "none" });
        return res.status(request_user.status).send({ ok: false, message: "Failed to verify token" });
    }

    const user = await request_user.json();
    res.send(user);
  } catch (err) {
    console.error("Error fetching user info:", err);
    res.clearCookie("hf_token", { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: "none" });
    res.status(500).send({
      ok: false,
      message: "Error fetching user info: " + err.message,
    });
  }
});

// --- Modified /api/deploy (Placeholder - needs update for DSL files) ---
app.post("/api/deploy", checkUser, async (req, res) => {
  // TODO: Update this to handle deployment based on generated code from DSL, not just HTML
  const { generatedCode, title, path, dslFiles } = req.body; // Expecting generatedCode as { "main.py": "...", "requirements.txt": "..." }
  
  // Basic validation
  if (!generatedCode || typeof generatedCode !== 'object' || !generatedCode['main.py'] || (!path && !title)) {
    return res.status(400).send({
      ok: false,
      message: "Missing required fields for deployment (generatedCode object with main.py, title/path, dslFiles)",
    });
  }

  let { hf_token } = req.cookies;
  if (process.env.HF_TOKEN && process.env.HF_TOKEN !== "") {
    hf_token = process.env.HF_TOKEN;
  }
  if (!hf_token) {
      return res.status(401).send({ ok: false, message: "Authentication required for deployment." });
  }

  try {
    const repo = {
      type: "space",
      name: path ?? "", // If path is provided, use it (for updating existing space)
    };

    let readmeContent;
    let repoId = repo.name; // Will be updated if creating a new repo

    // Create new repo if path is not provided
    if (!path || path === "") {
      const { name: username } = await whoAmI({ accessToken: hf_token });
      const newTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .split("-")
        .filter(Boolean)
        .join("-")
        .slice(0, 96);

      repoId = username + "/" + newTitle;
      repo.name = repoId;

      await createRepo({
        repo,
        accessToken: hf_token,
        spaceSdk: "docker", // Using Docker for more flexibility with Python/FastHTML
        // spaceHardware: "cpu-basic", // Or other hardware
        private: false, // Or true based on user preference/plan
      });
      
      const colorFrom = COLORS[Math.floor(Math.random() * COLORS.length)];
      const colorTo = COLORS[Math.floor(Math.random() * COLORS.length)];
      readmeContent = `---
title: ${title || newTitle}
emoji: 🐳
colorFrom: ${colorFrom}
colorTo: ${colorTo}
sdk: docker
pinned: false
tags:
  - percertain
  - fasthtml
---

# ${title || newTitle}

Generated with Percertain.

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference`;
    }

    // Prepare files for upload
    const filesToUpload = [];

    // 1. Add generated code files (main.py, requirements.txt, etc.)
    for (const [fileName, content] of Object.entries(generatedCode)) {
        if (typeof content === 'string') { // Basic check
            const blob = new Blob([content], { type: "text/plain" });
            blob.name = fileName;
            filesToUpload.push(blob);
        }
    }

    // 2. Add DSL source files
    if (dslFiles && typeof dslFiles === 'object') {
      for (const [fileName, content] of Object.entries(dslFiles)) {
        if (typeof content === 'string') { // Basic check
            const blob = new Blob([content], { type: "text/plain" });
            blob.name = fileName; // e.g., app.pc, app.sc
            filesToUpload.push(blob);
        }
      }
    }

    // 3. Add README.md if creating a new repo
    if (readmeContent) {
      const readmeFile = new Blob([readmeContent], { type: "text/markdown" });
      readmeFile.name = "README.md";
      filesToUpload.push(readmeFile);
    }
    
    // 4. Add Dockerfile for FastHTML/FastAPI
    // Ensure requirements.txt is included in generatedCode or added separately
    if (!generatedCode['requirements.txt']) {
        const defaultRequirements = "fastapi\nuvicorn[standard]\npython-dotenv\nfasthtml>=0.0.6"; // Add fasthtml
        const reqBlob = new Blob([defaultRequirements], { type: "text/plain" });
        reqBlob.name = "requirements.txt";
        filesToUpload.push(reqBlob);
    }
    
    const dockerfileContent = `
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . .

# Expose port 8000 (standard for FastAPI/Uvicorn)
EXPOSE 8000

# Command to run the application using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`;
    const dockerfileBlob = new Blob([dockerfileContent], { type: "text/plain" });
    dockerfileBlob.name = "Dockerfile";
    filesToUpload.push(dockerfileBlob);

    // Upload all files
    await uploadFiles({
      repo,
      files: filesToUpload,
      accessToken: hf_token,
      commitMessage: "Deploy Percertain App",
      // createPullRequest: false, // Set to true if PR is desired
    });
    
    return res.status(200).send({ ok: true, path: repoId }); // Return the full repo ID

  } catch (err) {
    console.error("Deployment Error:", err);
    // Provide more specific error messages if possible
    let errorMessage = err.message;
    if (err.response && typeof err.response.text === 'function') {
        try {
            const errorText = await err.response.text();
            errorMessage += ` | Server Response: ${errorText}`;
        } catch {}
    }
    return res.status(500).send({
      ok: false,
      message: errorMessage,
    });
  }
});

// --- Refactored /api/ask-ai for DSL and Multi-Model --- 
app.post("/api/ask-ai", async (req, res) => {
  // Expecting DSL content: { dsl: { pc: "...", sc: "...", features: "...", styles: "..." } }
  const { dsl } = req.body;

  if (!dsl || !dsl.pc) {
    return res.status(400).send({
      ok: false,
      message: "Missing Percertain DSL content (app.pc is required)",
    });
  }

  let { hf_token } = req.cookies;
  let token = hf_token;

  // --- IP Limiting & Token Handling ---
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket.remoteAddress ||
    req.ip ||
    "0.0.0.0";

  if (!token) {
    ipAddresses.set(ip, (ipAddresses.get(ip) || 0) + 1);
    if (ipAddresses.get(ip) > MAX_REQUESTS_PER_IP) {
      return res.status(429).send({
        ok: false,
        openLogin: true,
        message: "Log In to continue using the service",
      });
    }
    token = process.env.DEFAULT_HF_TOKEN;
    if (!token) {
        return res.status(500).send({ ok: false, message: "Service token not configured." });
    }
  }
  // --- End Token Handling ---

  // Set up response headers for streaming status updates
  res.setHeader("Content-Type", "text/plain"); 
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // 1. Parse DSL files (using js-yaml) and perform basic validation
    let parsedPc, parsedSc, parsedFeatures, parsedStyles;
    const requiredPcSections = ['@app', '@description', '@data', '@ui_layout', '@ui_theme', '@ui_components', '@logic_flow', '@ai_tasks']; // Based on v3 final design

    try {
      // Parse app.pc
      if (!dsl.pc) throw new Error("app.pc content is missing.");
      parsedPc = yaml.load(dsl.pc);
      if (!parsedPc || typeof parsedPc !== 'object') throw new Error("Invalid app.pc structure: Must be a valid YAML object.");
      for (const section of requiredPcSections) {
        if (!(section in parsedPc)) {
          console.warn(`Missing section in app.pc: ${section}. Proceeding anyway.`);
        }
      }

      // Parse optional files
      if (dsl.sc) {
          parsedSc = yaml.load(dsl.sc);
          if (!parsedSc || typeof parsedSc !== 'object') throw new Error("Invalid app.sc structure.");
      }
      if (dsl.features) {
          parsedFeatures = yaml.load(dsl.features);
          if (!parsedFeatures || typeof parsedFeatures !== 'object') throw new Error("Invalid app.features structure.");
      }
      if (dsl.styles) {
          parsedStyles = yaml.load(dsl.styles);
          if (!parsedStyles || typeof parsedStyles !== 'object') throw new Error("Invalid app.styles structure.");
      }

    } catch (e) {
      console.error("DSL Parsing/Validation Error:", e.message);
      if (!res.headersSent) {
        return res.status(400).send({ ok: false, message: "DSL Parsing/Validation Error: " + e.message });
      } else {
        try { res.write("\nDSL PARSING/VALIDATION ERROR: " + e.message + "\n"); } catch {}
        return res.end();
      }
    }

    console.log("DSL Parsing and Basic Validation Successful.");
    res.write("STATUS: DSL Parsing Complete.\n"); // Status update

    // 2. Construct Prompts
    // --- UI Preview Prompt (DeepSeek-V3) ---
    const uiPromptContext = `# Task: Generate UI Preview (HTML/CSS Mockup)

## Goal & Audience
Goal: ${parsedSc?.goal || 'Generate UI Mockup'}
Target Audience: ${parsedSc?.target_audience || 'General users'}

## Core UI Definition (from app.pc)
UI Layout Description: ${parsedPc?.ui_layout?.description || 'Not specified'}
UI Theme Description: ${parsedPc?.ui_theme?.description || 'Not specified'}
UI Components Definition:
${yaml.dump(parsedPc?.ui_components || {}, { indent: 2 })}

## Styling Details (from app.styles)
Style Guide:
${yaml.dump(parsedStyles?.style_guide || {}, { indent: 2 })}

## Optional UI Features (from app.features)
Optional Features related to UI:
${yaml.dump(parsedFeatures?.optional || {}, { indent: 2 })}

# Instruction:
Generate ONLY the HTML code (using Tailwind CSS classes if possible, otherwise inline styles or a <style> block) for a visual mockup based strictly on the UI Layout, Theme, Components, and Styling details provided above. This is for preview purposes only and does not need to be functional JavaScript/backend code. Focus on visual representation.`;

    // --- Main Application Logic & Code Prompt (DeepSeek-Coder) ---
    const logicPromptContext = `# Task: Generate Complete FastHTML Python Application

## Overall Goal & Success Criteria (from app.sc)
Goal: ${parsedSc?.goal || 'Implement the application as described.'}
Target Audience: ${parsedSc?.target_audience || 'General users'}
Success Criteria:
${yaml.dump(parsedSc?.success_criteria || [], { indent: 2 })}

## Core Application Definition (from app.pc)
App Name: ${parsedPc?.['@app'] || 'MyApp'}
Description: ${parsedPc?.['@description'] || 'No description'}
Data Structure / Initial State:
${yaml.dump(parsedPc?.data || {}, { indent: 2 })}
UI Components (for event handling reference):
${yaml.dump(parsedPc?.ui_components || {}, { indent: 2 })}
Logic Flow (Actions to implement):
${yaml.dump(parsedPc?.logic_flow || {}, { indent: 2 })}
AI Tasks (Integrations needed):
${yaml.dump(parsedPc?.ai_tasks || {}, { indent: 2 })}

## Optional Features & Brainstorming (from app.features)
Optional Features related to logic/functionality:
${yaml.dump(parsedFeatures?.optional || {}, { indent: 2 })}
Brainstorming Ideas (Consider if relevant and feasible):
${yaml.dump(parsedFeatures?.brainstorm || {}, { indent: 2 })}

# Instruction:
Generate a complete, functional Python application using the FastAPI framework and the FastHTML library (assume it's available via 'from fasthtml.common import *', etc.).
Your response MUST be a valid JSON object containing the file contents for a deployable application. The JSON object should have filenames as keys (e.g., "main.py", "requirements.txt") and values are the corresponding file content as strings. Ensure the Python code is syntactically correct and follows best practices. Include necessary imports and setup for FastAPI and FastHTML. Implement the logic described in the '@logic_flow' section, referencing '@data' for state and '@ui_components' for interactions. If '@ai_tasks' are defined, include placeholder functions or comments indicating where AI model calls would be integrated.`;

    res.write("STATUS: Prompts Constructed.\n"); // Status update

    // 3. Call Inference API for UI Generation (DeepSeek-V3)
    const client = new InferenceClient(token);
    let uiCode = '';
    const uiSystemPrompt = "You are an expert UI developer. Generate clean HTML code (using Tailwind CSS classes if possible, otherwise inline styles or a <style> block) based on the user's specifications. Focus ONLY on the UI structure, components, and styling.";

    res.write("STATUS: Generating UI Code...\n"); // Status update

    try {
        const uiCompletion = await client.chatCompletion({
            model: UI_MODEL_ID,
            messages: [
                { role: "system", content: uiSystemPrompt },
                { role: "user", content: uiPromptContext },
            ],
            max_tokens: 2048, // Adjust as needed
        });
        uiCode = uiCompletion.choices[0]?.message?.content || '';
        res.write("STATUS: UI Code Generation Complete.\n");
        // Send UI code wrapped in markers for frontend parsing
        res.write("UI_CODE_START>>>" + uiCode + "<<<UI_CODE_END\n"); 
    } catch(uiError) {
        console.error("UI Generation Error:", uiError);
        try { res.write("\nERROR generating UI: " + uiError.message + "\n"); } catch {}
        res.write("STATUS: Attempting to generate logic code despite UI error...\n");
    }

    // 4. Call Inference API for Main Application Logic (DeepSeek-Coder)
    let logicCodeFiles = {}; 
    const logicSystemPrompt = "You are an expert Python developer specializing in FastAPI and FastHTML. Generate a complete, functional application based on the user's specifications. Your output MUST be a valid JSON object where keys are filenames (e.g., 'main.py', 'requirements.txt') and values are the corresponding file content as strings.";

    res.write("STATUS: Generating Main Application Code...\n"); // Status update

    try {
        const logicCompletion = await client.chatCompletion({
            model: LOGIC_MODEL_ID,
            messages: [
                { role: "system", content: logicSystemPrompt },
                { role: "user", content: logicPromptContext },
            ],
            max_tokens: 4096, // Adjust as needed
            response_format: { type: "json_object" }, // Request JSON output
        });

        const rawLogicResponse = logicCompletion.choices[0]?.message?.content || '{}';
        res.write("STATUS: Raw Logic Response Received.\n");

        try {
            logicCodeFiles = JSON.parse(rawLogicResponse);
            if (typeof logicCodeFiles !== 'object' || logicCodeFiles === null) {
                throw new Error("Generated logic code is not a valid JSON object.");
            }
            res.write("STATUS: Logic Code Generation and Parsing Complete.\n");
            // Send logic code files wrapped in markers
            res.write("LOGIC_CODE_JSON_START>>>" + JSON.stringify(logicCodeFiles) + "<<<LOGIC_CODE_JSON_END\n");

        } catch (parseError) {
             console.error("Logic Code JSON Parsing Error:", parseError);
             try { res.write("\nERROR parsing generated logic code JSON: " + parseError.message + "\n"); } catch {}
             try { res.write("Raw response was: " + rawLogicResponse + "\n"); } catch {}
        }

    } catch(logicError) {
        console.error("Logic Generation Error:", logicError);
        try { res.write("\nERROR generating Logic: " + logicError.message + "\n"); } catch {}
        // End the request here if logic generation fails critically
        return res.end(); 
    }

    // 5. End Stream
    res.write("STATUS: Generation Process Complete.\n");
    res.end(); // End the streaming response

  } catch (error) {
    // Catch any unexpected errors in the main try block
    console.error("Fatal Error in /api/ask-ai:", error);
    if (!res.headersSent) {
      return res.status(500).send({ ok: false, message: "An unexpected error occurred: " + error.message });
    } else {
      try { res.write("\nFATAL ERROR: " + error.message + "\n"); } catch {}
      res.end();
    }
  }
}); // End of /api/ask-ai

// --- Remix Endpoint (Modified from DeepSite) ---
app.get("/api/remix", async (req, res) => {
  const { username, repo } = req.query;
  if (!username || !repo) {
    return res.status(400).send({ ok: false, message: "Missing username or repo" });
  }

  let { hf_token } = req.cookies;
  let token = hf_token;
  if (process.env.HF_TOKEN && process.env.HF_TOKEN !== "") {
    token = process.env.HF_TOKEN;
  }
  // No public remix if no token available
  if (!token) {
      return res.status(401).send({ ok: false, message: "Authentication required to remix." });
  }

  const repoId = username + "/" + repo;
  
  // Attempt to fetch DSL files instead of index.html for Percertain remix
  const dslFileNames = ['app.pc', 'app.sc', 'app.features', 'app.styles'];
  const dslFilesContent = {};
  let filesFound = 0;

  try {
    // Check space exists first
    const space = await spaceInfo({ name: repoId, accessToken: token });
    if (!space) throw new Error("Space not found or access denied.");

    for (const fileName of dslFileNames) {
        const fileUrl = `https://huggingface.co/spaces/${repoId}/raw/main/${fileName}`;
        try {
            const request = await fetch(fileUrl, { headers: { Authorization: `Bearer ${token}` } }); // Use token for private repos
            if (request.ok) {
                dslFilesContent[fileName] = await request.text();
                filesFound++;
            } else {
                console.warn(`Remix: Could not fetch ${fileName} from ${repoId}. Status: ${request.status}`);
            }
        } catch (fetchErr) {
            console.warn(`Remix: Error fetching ${fileName} from ${repoId}:`, fetchErr.message);
        }
    }

    if (filesFound === 0) {
        return res.status(404).send({ ok: false, message: "No Percertain DSL files found in the specified space." });
    }

    res.status(200).send({ ok: true, dsl: dslFilesContent }); // Send back the fetched DSL files

  } catch (err) {
    console.error("Remix Error:", err);
    let userLoggedIn = false; // Check login status again for error message context
    if (hf_token) {
        try {
            const userInfoReq = await fetch("https://huggingface.co/oauth/userinfo", { headers: { Authorization: "Bearer " + hf_token } });
            if (userInfoReq.ok) userLoggedIn = true;
        } catch {}
    }
    res.status(500).send({
      ok: false,
      message: err.message,
      openLogin: !userLoggedIn, // Suggest login only if not logged in
    });
  }
}); // End of /api/remix

// Catch-all for serving frontend (if backend serves frontend too - unlikely with Vercel)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});



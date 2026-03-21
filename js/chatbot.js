import { loadPortfolioData, projectSearchText } from "./data-service.js";

function bestLocalAnswer(question, data) {
  const normalized = question.toLowerCase();

  if (normalized.includes("experience") || normalized.includes("work")) {
    const items = (data.profile?.experience || []).slice(0, 3).map((item) => `${item.role} at ${item.company}`);
    return `Recent experience includes ${items.join(", ")}. Open the Experience page for the full timeline.`;
  }

  if (normalized.includes("skill") || normalized.includes("stack")) {
    return `Core stack: ${(data.site?.skills || []).slice(0, 8).join(", ")}.`;
  }

  const scoredProjects = (data.projects || [])
    .map((project) => {
      let score = 0;
      const haystack = projectSearchText(project);
      const terms = normalized.split(/\s+/).filter(Boolean);
      for (const term of terms) {
        if (haystack.includes(term)) {
          score += 1;
        }
      }
      return { project, score };
    })
    .sort((left, right) => right.score - left.score);

  if (scoredProjects[0] && scoredProjects[0].score > 0) {
    const project = scoredProjects[0].project;
    const highlights = (project.highlights || []).slice(0, 2).join(" ");
    return `${project.title}: ${project.summary} ${highlights}`.trim();
  }

  return "I can answer about projects, experience, tech stack, and case studies. Try asking about a specific project like Houston Crime or CivicQuest.";
}

async function remoteAnswer(question) {
  const slug = new URL(window.location.href).searchParams.get("slug");
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: question,
      slug,
      pageUrl: window.location.href
    })
  });

  if (!response.ok) {
    throw new Error("Chat API unavailable");
  }

  const data = await response.json();
  return data.reply || "No reply returned.";
}

async function initChatbot() {
  const root = document.getElementById("chatbotRoot");
  if (!root) {
    return;
  }

  const data = await loadPortfolioData();

  root.innerHTML = `
    <button class="chatbot-btn" id="cbOpen" aria-label="Open portfolio assistant">
      <span class="chatbot-trigger">
        <span class="robot-core">
          <span class="robot-ring robot-ring--outer"></span>
          <span class="robot-ring robot-ring--inner"></span>
          <span class="robot-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
              <defs>
                <linearGradient id="robotGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#9be7c4"></stop>
                  <stop offset="100%" stop-color="#7bb7ff"></stop>
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="28" fill="rgba(8,17,31,0.86)" stroke="url(#robotGlow)" stroke-width="2"></circle>
              <path d="M24 22h16a6 6 0 0 1 6 6v10a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8V28a6 6 0 0 1 6-6Z" fill="url(#robotGlow)" opacity="0.95"></path>
              <path d="M32 14v8" stroke="#9be7c4" stroke-width="3" stroke-linecap="round"></path>
              <circle cx="32" cy="11" r="3" fill="#9be7c4"></circle>
              <circle cx="27" cy="33" r="3.2" fill="#08111f"></circle>
              <circle cx="37" cy="33" r="3.2" fill="#08111f"></circle>
              <path d="M26 40c2.2 2 9.8 2 12 0" stroke="#08111f" stroke-width="2.6" stroke-linecap="round"></path>
              <path d="M19 29h-3" stroke="#7bb7ff" stroke-width="2.6" stroke-linecap="round"></path>
              <path d="M48 29h-3" stroke="#7bb7ff" stroke-width="2.6" stroke-linecap="round"></path>
            </svg>
          </span>
        </span>
        <span class="chatbot-btn-label">
          <span class="chatbot-btn-title">Portfolio Assistant</span>
          <span class="chatbot-btn-subtitle">Ask about projects or experience</span>
        </span>
      </span>
    </button>
    <div class="chatbot-panel" id="cbPanel" aria-hidden="true">
      <div class="chatbot-header">
        <div>
          <div class="fw-semibold">Portfolio Assistant</div>
          <div class="small text-white-50">Configured with OpenAI</div>
        </div>
        <button class="btn btn-sm btn-outline-light" id="cbClose">Close</button>
      </div>
      <div class="chatbot-messages" id="cbMsgs">
        <div class="msg bot"><div class="bubble">Ask about projects, stack, or experience. Example: What did you build in the Houston crime project?</div></div>
      </div>
      <div class="chatbot-input">
        <input class="form-control" id="cbInput" placeholder="Type your question..." />
        <button class="btn btn-light" id="cbSend">Send</button>
      </div>
    </div>
  `;

  const panel = document.getElementById("cbPanel");
  const msgs = document.getElementById("cbMsgs");
  const input = document.getElementById("cbInput");

  function add(role, text) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.innerHTML = `<div class="bubble"></div>`;
    div.querySelector(".bubble").textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  async function send() {
    const question = input.value.trim();
    if (!question) {
      return;
    }

    input.value = "";
    add("user", question);
    add("bot", "Thinking...");
    const pending = msgs.lastElementChild;

    try {
      const answer = await remoteAnswer(question);
      pending.querySelector(".bubble").textContent = answer;
    } catch (error) {
      pending.querySelector(".bubble").textContent = bestLocalAnswer(question, data);
      console.error(error);
    }
  }

  document.getElementById("cbOpen").addEventListener("click", () => {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    input.focus();
  });

  document.getElementById("cbClose").addEventListener("click", () => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  });

  document.getElementById("cbSend").addEventListener("click", send);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      send();
    }
  });
}

initChatbot().catch((error) => console.error(error));

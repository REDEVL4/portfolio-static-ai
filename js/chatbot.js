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
    <button class="btn btn-light chatbot-btn shadow-lg" id="cbOpen">Ask the portfolio</button>
    <div class="chatbot-panel" id="cbPanel" aria-hidden="true">
      <div class="chatbot-header">
        <div>
          <div class="fw-semibold">Portfolio Assistant</div>
          <div class="small text-white-50">Configured with OpenAPI</div>
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

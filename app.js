(function(){
"use strict";

/* ============================================================
   STATE  (in-memory only — see note at bottom of file)
   ============================================================ */

/* KYRO V33 — Demo Mode self-knowledge */
var KYRO_DEMO_KNOWLEDGE = {
  identity: "मैं KYRO हूँ — इस ऐप का offline/demo assistant. मैं live AI का दावा नहीं करता जब तक कोई connection सच में connected न हो।",
  creator: "मुझे इस ऐप के founder MR. NITIN KUSHWAHA ने बनाया/विकसित कराया है।",
  capabilities: "मैं Demo Mode में basic बातचीत, greetings, app-help, KYRO के features की जानकारी, settings/navigation guidance और कुछ सामान्य सवालों के scripted/local जवाब दे सकता हूँ।",
  limits: "Demo Mode के जवाब local/scripted हैं। Live web research, live AI reasoning या external service का वास्तविक परिणाम connection के बिना नहीं देता।",
  features: "KYRO में chat, model switching, Web Search setting, profile photo, themes including Pure Black, file/photo attachments, microphone/voice input, sidebar navigation, Settings, About और Help & Support जैसे features हैं।",
  models: "उपलब्ध model choices में KYRO, KYRO 1, KYRO 2 और KYRO Vision हैं। Web Search को Settings से manage किया जा सकता है।",
  privacy: "इस demo में basic app data/session state local device/browser में रखा जा सकता है; sensitive information share करने से पहले अपनी deployment की privacy policy जांचें।",
  founder: "Founder: MR. NITIN KUSHWAHA.",
  version: "Version 1.0.0. Build information About section में दिखाई जाती है।",
  howto: "मॉडल बदलने के लिए ऊपर model name पर tap करें। Menu खोलने के लिए hamburger button दबाएँ या supported swipe gesture इस्तेमाल करें। Profile photo पर tap करके profile/theme options इस्तेमाल करें। Plus से attachments चुनें। Mic से voice input शुरू करें। Settings में app preferences और Web Search manage करें।",
  basics: "मैं Hello/Hi जैसे greetings का जवाब दे सकता हूँ और KYRO के बारे में basic questions का जवाब Demo Mode में दे सकता हूँ।"
};

function kyroDemoKnowledgeAnswer(raw) {
  var q = String(raw || "").toLowerCase().trim();
  if (!q) return null;

  var asksWhoMade = /(किसने.*बन|किसने.*बनाया|किसने.*बनाई|किसने.*develop|creator|founder|who.*made|who.*created|who.*built|who.*develop)/i.test(q);
  var asksWhat = /(क्या.*कर|क्या.*काम|what.*can|what.*do|capabilit|features|फीचर|feature)/i.test(q);
  var asksHow = /(कैसे.*चल|कैसे.*use|कैसे.*काम|how.*use|how.*work|guide|मदद|help)/i.test(q);
  var asksModel = /(model|मोड|gemini|flash|pro)/i.test(q);
  var asksWeb = /(web|वेब|search|सर्च|internet|इंटरनेट)/i.test(q);
  var asksDemo = /(demo|डेमो|offline|ऑफलाइन)/i.test(q);
  var asksAbout = /(kyro|cairo|about|अपने बारे|अपने बारे में|ऐप.*बारे|app.*about)/i.test(q);
  var asksVersion = /(version|build|वर्जन|बिल्ड)/i.test(q);
  var asksPrivacy = /(privacy|प्राइवेसी|गोपनीयता|data|डेटा)/i.test(q);
  var greeting = /^(hi|hello|hey|नमस्ते|हेलो|हाय|सलाम|good morning|good evening)\b/i.test(q);

  if (asksWhoMade) return "KYRO के Founder MR. NITIN KUSHWAHA हैं। उन्होंने इसका concept अपनी जरूरत और vision से शुरू किया और इसे लगातार सीखते और develop करते हुए आगे बढ़ाया।";
  if (asksWhat) return "मैं KYRO हूँ। मैं basic बातचीत और KYRO app-help दे सकता हूँ—models, chat, attachments, voice, themes, profile, Settings, sidebar और Web Search के बारे में जानकारी दे सकता हूँ। Demo Mode local/scripted है।";
  if (asksHow) return "मॉडल बदलने के लिए ऊपर model name पर tap करें। Menu के लिए hamburger दबाएँ। Plus से फोटो/फाइल attach करें, Mic से voice input लें, Profile से photo/theme options खोलें और Settings से app preferences/Web Search manage करें।";
  if (asksModel) return "इस build में KYRO, KYRO 1 और KYRO 1.2 model choices हैं। Web Search को Settings से manage किया जाता है।";
  if (asksWeb) return "Web Search एक अलग setting है। इसे Settings में जाकर on/off किया जा सकता है। Demo Mode खुद live web result का दावा नहीं करता जब तक Web Search वास्तव में connected न हो।";
  if (asksDemo) return "Demo Mode offline/local scripted mode है। Basic conversation और KYRO app-help उपलब्ध है; live AI response के लिए connection चाहिए।";
  if (asksVersion) return "KYRO Version 1.0.0 है। Build number About section में दिखाया गया है।";
  if (asksPrivacy) return "Demo में basic state/browser data local session/device पर रखा जा सकता है। अपनी deployment की Privacy Policy को final source of truth मानें।";
  if (asksAbout) return "KYRO एक AI assistant-style app interface है जिसमें chat, model switching, attachments, voice, themes, profile, Settings, Web Search और Help & Support जैसे features हैं। Founder: MR. NITIN KUSHWAHA.";
  if (greeting) return "नमस्ते! मैं KYRO हूँ। मैं basic बातचीत और इस ऐप के features/use के बारे में आपकी मदद कर सकता हूँ।";

  return null;
}

var state = {
  themePref: 'dark',
  userName: '',
  userPhoto: localStorage.getItem('kyroUserPhoto') || '',
  chats: [],
  activeChatId: null,
  isGenerating: false,
  webSearch: false,
  ttsAuto: false,
  fontScale: false,
  highContrast: false,
  appLock: false,
  apiKeys: (function(){
    try{
      var raw=localStorage.getItem('kyroGeminiApiKeyV2');
      if(!raw) return [];
      var key=String(raw).trim();
      if(!key) return [];
      return [{key:key,provider:'gemini',endpoint:'https://generativelanguage.googleapis.com/v1beta/models'}];
    }catch(e){ return []; }
  })(),
  activeModel: (function(){
    try{
      var savedKey=String(localStorage.getItem('kyroGeminiApiKeyV2')||'').trim();
      if(savedKey && /^(AIza[A-Za-z0-9_-]+|AQ\.[A-Za-z0-9_-]+)$/.test(savedKey)){
        return {id:'kyro-1', label:'KYRO 1', provider:'KYRO', desc:'Fast · multimodal', rawId:'gemini-3.5-flash-lite'};
      }
      var savedSarvamKey=String(localStorage.getItem('kyroSarvamApiKeyV1')||'').trim();
      if(savedSarvamKey && /^sk_[A-Za-z0-9._-]{8,}$/.test(savedSarvamKey)){
        return {id:'kyro-1', label:'KYRO 1', provider:'KYRO', desc:'Fast · multimodal', rawId:'gemini-3.5-flash-lite'};
      }
    }catch(e){}
    return {id:'kyro-demo', label:'KYRO', provider:'Demo'};
  })(),
  favModels: ['kyro-demo'],
  recentModels: ['kyro-demo'],
  projects: [],
  library: [],
  libraryFolders: [],
  libraryDeleted: [],
  libraryView: 'list',
  libraryFilter: 'all',
  librarySearch: '',
  librarySelectMode: false,
  librarySelected: [],
  pendingAttachments: [],
  recognizing: false
};
window.kyroAppState = state;


var LANGUAGES = ["Auto Detect","English","Hindi","Hinglish","Urdu","Bengali","Tamil","Telugu","Gujarati","Punjabi","Marathi","Kannada","Malayalam","Odia","Assamese","Nepali","Arabic","French","German","Spanish","Portuguese","Russian","Japanese","Korean","Chinese"];
var uiLang = "English", chatLang = "Auto Detect";

// Built-in model catalog. The API key remains external/user-supplied.
// UI ids are stable; rawId is the real Gemini API model id.
/* ============================================================
   KYRO BUILT-IN CONNECTION KEY
   Paste your own API key between the quotes below.
   API Manager remains available and an externally entered key
   overrides this built-in key for the current session.
   ============================================================ */
var KYRO_BUILTIN_GEMINI_API_KEY = "";

var KYRO_FINAL_PUBLIC_KNOWLEDGE = `
KYRO — OFFICIAL PUBLIC KNOWLEDGE

IDENTITY
- Official brand name: KYRO.
- KYRO has no full-form expansion. Do not invent or expand the name.
- Official tagline: KYRO — AI, Simplified.
- KYRO is an AI Assistant / AI chat application.
- Visible model identities are KYRO, KYRO 1, and KYRO 1.2.
- Never introduce KYRO as ChatGPT, OpenAI, Claude, or another AI brand.
- If asked what powers KYRO, explain the configured underlying technology only when relevant, but keep the assistant identity as KYRO.
- User-facing model names must remain KYRO, KYRO 1, and KYRO 1.2.

FOUNDER
- Founder: MR. NITIN KUSHWAHA.
- Founder role: Founder of KYRO.
- Founder nationality: Indian.
- Founder location: Kanpur, Uttar Pradesh, India.
- Founder public bio: MR. NITIN KUSHWAHA is the Founder of KYRO. He developed the KYRO concept from his own ideas, needs and vision for a simpler AI experience.
- The founder is a self-taught developer/creator. His coding skills were developed independently through hands-on learning and practice; he is not presented as someone from a large college/university development program or as a formally certified software engineer.
- He has also independently developed practical skills in AI engineering, prompt engineering, photo editing, video editing, social media management and related digital work. He learned and practiced these skills largely from home using a phone, online courses and hands-on experimentation.
- KYRO was shaped over roughly one and a half years of planning and learning, followed by around three months of focused, sustained effort to bring the current product together.
- Do not say that the founder does not know coding. Do not claim that he personally wrote every line of the product or that he is a professionally certified programmer. Describe him accurately as a self-taught coder/developer and creator whose skills were developed independently.

KYRO / SYNAPSE
- Main brand: KYRO.
- Powered by: Synapse.
- Synapse is the future/parent-brand direction associated with KYRO. Do not describe Synapse as a large established corporation or make legal/registration claims unless explicitly provided.
- KYRO location: Kanpur, Uttar Pradesh, India.
- KYRO established: 2026.
- Current version: 1.0.0.
- Current build: KYRO-2026.08.07.

MISSION AND VISION
- Mission: make advanced AI simple, intuitive, accessible and useful for everyone, while helping users handle everyday complexities more easily.
- Vision: make intelligent technology simple, accessible and useful for everyone.
- KYRO was created with a people-first goal: to build a useful AI experience and make it public so more people can benefit from it.
- Brand direction focuses on useful innovation, design, branding, personalization and an easy AI experience.

KYRO FEATURES
- AI chat and conversation.
- Demo Mode with offline/local demo responses and no API key required.
- KYRO model switching.
- Photo/file attachments from the composer.
- Local Library for attached items.
- Voice input and optional read-replies-aloud.
- Themes and personalization.
- Profile controls.
- Web Search controls.
- API Manager.
- Model Manager.
- Backup/Restore.
- Security controls.
- Sidebar/navigation.
- About and Help & Support.
- KYRO logo/status indicator during generation/search.
- Help topics include Chat & Messages, Files & Photos, Voice & Microphone, Models, Web Search, Themes, Profile, Settings and About.

MODELS
- KYRO — Demo/offline mode.
- KYRO 1 — user-facing KYRO model name.
- KYRO 1.2 — user-facing KYRO model name.
- Never show provider names as the visible model name in the model switcher.
- If asked about the underlying model, answer truthfully only when necessary, while keeping the visible assistant identity as KYRO.

HOW TO USE
- To chat: choose the desired KYRO model and send a message from the composer.
- To attach a photo/file: use the Plus/attachment control in the composer.
- To manage language, API, models, voice, Web Search, backup/restore or security: open Settings and choose the relevant option.
- To change the model: use the model switcher.
- To use Web Search: enable/disable it from Settings.
- To use voice: use the microphone/voice controls where available.
- To manage profile: use the profile controls.
- To get help: use Help & Support.
- When explaining a feature, give only the steps supported by the app; do not invent controls.

AI IMAGE GENERATION

- AI Image Generation: KYRO Image Gen can generate images from text prompts using the connected image-generation API. It supports 1:1, 9:16, 16:9, 4:3 and 3:4 aspect ratios and 1K/2K/4K quality choices where the selected model/API supports them. Users can open Image Gen from the home quick actions or the + attachment sheet. Generated images appear directly in the chat and can be saved.

FUTURE / COMING SOON
- KYRO is intended to keep evolving.
- Future plans include a mobile experience, new AI modes, additional features and services.
- Future items must be described as Coming Soon / planned unless they are already present in the current app.
- Do not claim future features are already released.

STORY
- KYRO began from the founder's own idea and need for a useful AI assistant.
- The goal was to make a strong, helpful and accessible AI experience for people.
- The product was later made public so other people could use it.
- The brand emphasizes innovation, design, branding, themes, personalization and useful AI functionality.

SOCIAL / OFFICIAL CONTACT
- Official Instagram: @synapsebykyro
- Official Instagram URL: https://www.instagram.com/synapsebykyro?igsh=YnJsdXFwN3h1M3dx
- Official YouTube: @synapsebykyro
- Official YouTube URL: https://www.youtube.com/@synapsebykyro
- Official website: currently none.
- If a user wants more information about KYRO, the Founder or Synapse beyond the public knowledge available in the app, direct them to the Founder/KYRO official Instagram: @synapsebykyro.
- If a user asks for the Instagram or YouTube, provide the official clickable link.
- If a user reports a problem and asks how to contact support, direct them to the Founder/KYRO official Instagram.

RESPONSE STYLE
- Talk naturally, like a real helpful conversation. Do not sound like a generic AI support bot.
- Do not use long profile-style answers for ordinary questions.
- Avoid unnecessary headings, numbered lists, repeated disclaimers, and phrases such as "How can I help you today?" after every exchange.
- For a short question, give a short answer. For a complex question, explain clearly in a few natural paragraphs.
- Match the user's language and tone. Hinglish should feel like normal Indian chat language, not translated Hindi.

RESPONSE BEHAVIOR
- Answer in the same language the user uses. If the user uses natural Hinglish, reply in natural Hinglish; if they use Hindi, reply naturally in Hindi; if they use English, reply naturally in English.
- Sound like a helpful person having a real conversation, not like a documentation bot, marketing page or scripted AI demo.
- Start with the direct answer. Do not begin every reply with greetings, introductions or phrases like "Namaste!", "Here is the information", or "Below are the details" unless they actually fit the conversation.
- Keep simple questions simple. Do not turn a one-line question into a long article. Give more detail only when the user asks for it or the question genuinely needs it.
- Use short paragraphs and natural wording. Avoid unnecessary headings, numbered lists, repeated summaries, excessive emojis, and heavy markdown.
- Do not dump the entire KYRO profile unless the user asks for a complete/about-everything explanation.
- Answer only the relevant part of the KYRO knowledge when the user asks a specific question.
- If the user is casually chatting, respond casually and naturally. If the user is asking for help, be practical and direct.
- Do not repeatedly mention that you are in Demo Mode or that you are an AI unless that fact matters to the answer.
- Never fabricate details. If a requested fact is not in the source-of-truth knowledge, say briefly that the current KYRO information does not specify it.
- For official names and brands, preserve exact spelling: KYRO, Synapse, MR. NITIN KUSHWAHA.
- For company/ownership questions, do not invent legal ownership or registration details.
`;

var KYRO_COMPLETE_KNOWLEDGE = `You are KYRO, the AI assistant inside the KYRO application.

IDENTITY AND SELF-KNOWLEDGE — ALWAYS FOLLOW:
1. Your name is KYRO. If asked your name, identity, who you are, or what you are called, answer that your name is KYRO.
2. Never introduce yourself as ChatGPT, OpenAI, Claude, or another AI assistant/brand. Your visible model identity is KYRO, KYRO 1, or KYRO 1.2 depending on the selected switch. If asked what model powers you, you may truthfully say the configured model, but your assistant identity is KYRO.
3. If asked about KYRO, its founder, company, version, build, models, features, settings, or how to use the app, use the source-of-truth facts below.
4. If asked who founded KYRO, answer: MR. NITIN KUSHWAHA.
5. If asked who owns KYRO, what company is behind KYRO, or what company KYRO is powered by, only state an explicit company/Powered-by fact present below. Do not guess. If it is not specified, say the current app information does not specify it.
6. Never invent team members, company ownership, funding, addresses, contacts, products, policies, or features.
7. If a requested fact is not in the source-of-truth facts below, say that the current KYRO app information does not specify it rather than guessing.
8. When explaining how to use a feature, give steps only for controls/workflows actually present in the app.

KYRO SOURCE-OF-TRUTH:
Founder: MR. NITIN KUSHWAHA.
Founder profile: self-taught coder/developer and digital creator. Coding skills were developed independently through hands-on learning and practice, alongside AI engineering, prompt engineering, photo editing, video editing and social media management. He learned and practiced these skills largely from home using a phone, online courses and hands-on experimentation. The KYRO concept was developed over roughly one and a half years, followed by around three months of focused effort to bring the current product together. Do not say the founder does not know coding, and do not describe him as a formally certified professional programmer or claim he wrote every line personally.
Version: 1.0.0.
Build: KYRO-2026.08.07.
KYRO is a mobile-first AI chat interface.
Demo Mode: offline/local demo responses; no API key required.
Models: KYRO, KYRO 1, KYRO 1.2.
Features: profile photo, attachments/files, voice input, themes, model switching, Web Search controls, Settings, About, Help & Support.
Settings: Language, API Manager, Model Manager, Voice, Web Search, Backup/Restore, Security.
Composer: users can send chat messages and use Plus to attach photos/files.
Files: attached items can appear in the local Library.
Voice: microphone speech input and optional read-replies-aloud are supported.
Web Search: can be enabled or disabled from Settings.
Profile: profile controls are available.
Themes: theme selection is available, including Pure Black mode in the current build.
Sidebar: can be opened with the menu button and by edge swipe.
Logo/status: the KYRO logo can be shown in generation/search status.
Help & Support: includes Chat & Messages, Files & Photos, Voice & Microphone, Models, Web Search, Themes, Profile, Settings, and About topics.
About: describes KYRO as a mobile-first AI chat interface and lists its current models/features.
Company/Powered-by: NOT SPECIFIED IN THE CURRENT APP INFORMATION. Do not invent a company name.
`;



var MODELS = [
  {id:'kyro-demo', label:'KYRO', provider:'KYRO', desc:'Offline · no key needed', rawId:null},
  {id:'kyro-1', label:'KYRO 1', provider:'KYRO', desc:'Fast · multimodal', rawId:'gemini-3.6-flash'},
  {id:'kyro-1-2', label:'KYRO 2', provider:'KYRO', desc:'Advanced · multimodal', rawId:'gemini-3.6-flash'},
  {id:'kyro-vision', label:'KYRO Vision', provider:'KYRO', desc:'Vision · multimodal', rawId:'gemini-2.5-flash-image'},
];



/* KYRO 1 quota migration: older builds saved gemini-3.6-flash.
   Keep the user's KYRO 1 selection but move it to the low-latency stable model. */
(function(){
  try{
    if(state && state.activeModel && state.activeModel.id==='kyro-1'){
      state.activeModel.rawId='gemini-3.5-flash-lite';
      state.activeModel.desc='Fast · low latency · multimodal';
    }
  }catch(_){}
})();

var KYRO_KNOWLEDGE = {
  founder: "KYRO के Founder MR. NITIN KUSHWAHA हैं.",
  version: "KYRO का Version 1.0.0 है और Build KYRO-2026.08.07 है.",
  about: "KYRO एक mobile-first AI chat interface है। इसमें KYRO, KYRO 1 और KYRO 1.2 model entries, profile photo, attachments, voice, themes, model switching, Web Search controls, Settings, About और Help & Support शामिल हैं.",
  models: "उपलब्ध model choices में KYRO (Offline), KYRO 1 (Fast · vision · docs), KYRO 2 (Advanced · reasoning · vision) और KYRO Vision (Vision · multimodal) हैं।",
  settings: "Settings में Language, API Manager, Model Manager, Voice, Web Search, Backup, Restore और Security controls मिलते हैं.",
  theme: "KYRO में कई themes हैं। Pure Black Theme minimal black-and-white presentation के लिए है और उसमें animations बंद रखी जाती हैं.",
  files: "Composer से photos और files attach की जा सकती हैं और attached items local Library में दिख सकते हैं.",
  voice: "Microphone से speech input लिया जा सकता है और Settings में read-replies-aloud विकल्प भी है.",
  search: "Web Search को Settings से enable या disable किया जाता है.",
  sidebar: "Menu button से sidebar खुलता है और edge swipe gesture से भी sidebar खोला या बंद किया जा सकता है.",
  logo: "KYRO logo interface के अलग-अलग हिस्सों में इस्तेमाल होता है। Generation/search status में animated logo दिखाया जा सकता है और result complete होने पर status indicator हट जाता है.",
  support: "Help & Support में Chat & Messages, Files & Photos, Voice & Microphone, Models, Web Search, Themes, Profile, Settings और About से जुड़ी जानकारी दी गई है.",
  privacy: "इस build में demo conversations और संबंधित UI state local browser/device state में रखी जाती है. API keys और chats इस build के local state में handle होते हैं."
};
function appKnowledgeReply(text){
  var t=(text||"").toLowerCase();
  if(/founder|फाउंडर|owner|मालिक|किसने बनाया|बनाने वाला|नितिन/.test(t)) return KYRO_KNOWLEDGE.founder;
  if(/version|वर्जन|build|बिल्ड/.test(t)) return KYRO_KNOWLEDGE.version;
  if(/model|मॉडल|gemini|demo mode|डेमो/.test(t)) return KYRO_KNOWLEDGE.models;
  if(/setting|सेटिंग/.test(t)) return KYRO_KNOWLEDGE.settings;
  if(/theme|थीम|pure black|jet black|ब्लैक/.test(t)) return KYRO_KNOWLEDGE.theme;
  if(/file|फाइल|photo|फोटो|attach|अटैच|gallery|गैलरी/.test(t)) return KYRO_KNOWLEDGE.files;
  if(/mic|microphone|voice|माइक|आवाज|बोल/.test(t)) return KYRO_KNOWLEDGE.voice;
  if(/web search|websearch|सर्च|search/.test(t)) return KYRO_KNOWLEDGE.search;
  if(/sidebar|menu|मेन्यू|साइडबार|swipe|स्वाइप/.test(t)) return KYRO_KNOWLEDGE.sidebar;
  if(/logo|लोगो|thinking|generating|researching|searching/.test(t)) return KYRO_KNOWLEDGE.logo;
  if(/help|support|मदद|सपोर्ट/.test(t)) return KYRO_KNOWLEDGE.support;
  if(/privacy|प्राइवेसी|data|डेटा/.test(t)) return KYRO_KNOWLEDGE.privacy;
  if(/about|kyro क्या|kyro kya|app क्या|ऐप क्या|ऐप के बारे/.test(t)) return KYRO_KNOWLEDGE.about;
  return "";
}

var DEMO_REPLIES = {
  greet: ["Hey! Kya scene hai? Batao.","Haan, bolo — kya dekhna ya karna hai?"],
  question: ["Iska proper live answer dene ke liye connected model/API chahiye. API Manager me key add kar doge to KYRO wahi se answer karega.","Haan, samajh gaya. Is mode me live model connected nahi hai, isliye main sirf app ke built-in answers de sakta hoon."],
  general: ["Haan, samajh gaya.","Theek hai, noted. Batao ab kya karna hai?"]
};

var els = {};
function $(id){ return document.getElementById(id); }

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async function(){
  cacheEls();
  renderProfilePhoto();
  initParticles();
  buildThemeGrid();
  buildLangLists();
  buildModelList();
  wireEvents();
  wireSwipeToDismiss();
  applyTheme(state.themePref);

  /* AUTH BOOT: do not decide 'login required' until IndexedDB/localStorage
     has been checked. This removes the Android reopen race that briefly (or
     permanently) showed the account screen before the async account restore. */
  $('splash').hidden = true;
  $('splash').classList.remove('leaving');
  $('app').hidden = true;
  $('firebase-auth-gate').hidden = true;
  try{
    var saved = (typeof kyroLoadAccount==='function') ? await kyroLoadAccount() : null;
    if(saved && saved.username){
      try{ kyroMirrorAccountToLocalStorage(saved); }catch(_){ }
      window.kyroAutoLocalLogin=true;
      window.kyroFirebaseUser=null;
      if(window.state) state.userName=saved.username;
      try{ window.syncKyroGreeting(); }catch(_){ }
      startAppBoot();
    }else{
      $('firebase-auth-gate').hidden = false;
    }
  }catch(e){
    /* localStorage fallback is still allowed if IndexedDB is unavailable */
    try{
      var fallback = (typeof getLocalAccount==='function') ? getLocalAccount() : null;
      if(fallback && fallback.username){
        window.kyroAutoLocalLogin=true;
        if(window.state) state.userName=fallback.username;
        startAppBoot();
      }else $('firebase-auth-gate').hidden=false;
    }catch(_){ $('firebase-auth-gate').hidden=false; }
  }
});

function cacheEls(){
  ['msg-input','btn-send','btn-mic','btn-attach','attach-chips','chat-view','home-view',
   'greeting-title','sidebar','app','sheet-attach','composer','composer-attachments','sheet-backdrop','modal-backdrop',
   'modal-settings','modal-about','modal-help','modal-model','settings-root','file-profile',
   'sheet-profile'].forEach(function(id){ els[id]=$(id); });
}

/* ============================================================
   AMBIENT PARTICLE NETWORK (lightweight, pauses when hidden)
   ============================================================ */
var pCtx, pCanvas, pPoints=[], pRAF, pRunning=true;
function initParticles(){
  pCanvas = $('bg-canvas');
  pCtx = pCanvas.getContext('2d');
  function size(){
    pCanvas.width = innerWidth * Math.min(devicePixelRatio||1,2);
    pCanvas.height = innerHeight * Math.min(devicePixelRatio||1,2);
    pCanvas.style.width = innerWidth+'px';
    pCanvas.style.height = innerHeight+'px';
  }
  size();
  window.addEventListener('resize', size);
  var n = innerWidth < 500 ? 26 : 42;
  for(var i=0;i<n;i++){
    pPoints.push({
      x:Math.random()*pCanvas.width, y:Math.random()*pCanvas.height,
      vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25, r:Math.random()*1.6+.6
    });
  }
  document.addEventListener('visibilitychange', function(){
    var theme=document.documentElement.getAttribute('data-theme');
    if(theme==='pureblack'){pRunning=false; if(pRAF)cancelAnimationFrame(pRAF); return;}
    pRunning = !document.hidden;
    if(pRunning) drawParticles();
  });
  drawParticles();
}
function accentColor(){
  return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2fd8e0';
}
function drawParticles(){
  if(!pRunning) return;
  var c = window.__kyroCachedAccent || accentColor();
  if(document.documentElement.getAttribute('data-theme')==='pureblack') return;
  pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);
  pCtx.strokeStyle = c; pCtx.fillStyle = c;
  for(var i=0;i<pPoints.length;i++){
    var p = pPoints[i];
    p.x += p.vx; p.y += p.vy;
    if(p.x<0||p.x>pCanvas.width) p.vx*=-1;
    if(p.y<0||p.y>pCanvas.height) p.vy*=-1;
    pCtx.globalAlpha = .5;
    pCtx.beginPath(); pCtx.arc(p.x,p.y,p.r*2,0,7); pCtx.fill();
    for(var j=i+1;j<pPoints.length;j++){
      var q = pPoints[j];
      var dx=p.x-q.x, dy=p.y-q.y, d=Math.sqrt(dx*dx+dy*dy), max=140*Math.min(devicePixelRatio||1,2);
      if(d<max){
        pCtx.globalAlpha = (1-d/max)*.18;
        pCtx.lineWidth=1;
        pCtx.beginPath(); pCtx.moveTo(p.x,p.y); pCtx.lineTo(q.x,q.y); pCtx.stroke();
      }
    }
  }
  pRAF = requestAnimationFrame(drawParticles);
}

/* ============================================================
   THEME ENGINE
   ============================================================ */
var THEMES = ['dark','jetblack','pureblack','light','midnight','ocean','emerald','purple','sunset','auto'];
function themeLabel(t){ return t==='jetblack' ? 'Jet Black' : (t==='pureblack' ? 'Pure Black' : t.charAt(0).toUpperCase()+t.slice(1)); }
function applyTheme(pref){
  /* Freeze MutationObservers during theme switch to prevent cascade lag */
  if(typeof window.__kyroMOFreeze==='undefined') window.__kyroMOFreeze=false;
  window.__kyroMOFreeze=true;
  /* Cache accent color to avoid per-frame getComputedStyle in particle loop */
  window.__kyroCachedAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2fd8e0';
  state.themePref = pref;
  var actual = pref;
  if(pref === 'auto'){
    actual = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  /* Set theme attribute FIRST so CSS variables update immediately */
  document.documentElement.setAttribute('data-theme', actual);
  /* Stop particles immediately for pureblack — before any DOM work */
  if(typeof pRunning !== 'undefined'){
    if(actual === 'pureblack'){
      pRunning = false;
      if(typeof pRAF !== 'undefined' && pRAF) cancelAnimationFrame(pRAF);
      /* Also hide the canvas directly to free GPU memory */
      var pcv=document.getElementById('bg-canvas');
      if(pcv) pcv.style.display='none';
    } else if(!pRunning && typeof drawParticles === 'function'){
      var pcv2=document.getElementById('bg-canvas');
      if(pcv2) pcv2.style.display='';
      pRunning = true;
      drawParticles();
    }
  }
  /* Defer DOM rebuild to next frame so theme switch doesn't block UI */
  requestAnimationFrame(function(){
    buildThemeGrid();
    renderProfileThemeButtons();
    /* Unfreeze MutationObservers after DOM rebuild completes */
    setTimeout(function(){window.__kyroMOFreeze=false;},150);
  });
}
if(window.matchMedia){
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(){
    if(state.themePref==='auto') applyTheme('auto');
  });
}
function renderProfileThemeButtons(){
  var grid=$('profile-theme-grid');
  if(!grid) return;
  grid.innerHTML='';
  THEMES.forEach(function(t){
    var b=document.createElement('button');
    b.type='button';
    b.className='theme-swatch'+(state.themePref===t?' active':'');
    b.setAttribute('data-theme',t);
    b.innerHTML='<div class="theme-dot sw-'+t+'"></div><span>'+themeLabel(t)+'</span>';
    b.addEventListener('click',function(){
      applyTheme(t);
      toast('Theme set to '+themeLabel(t));
    });
    grid.appendChild(b);
  });
}
function buildThemeGrid(){
  var grids=[];
  var mainGrid=$('theme-grid');
  var profileGrid=$('profile-theme-grid');
  if(mainGrid) grids.push(mainGrid);
  if(profileGrid) grids.push(profileGrid);
  if(!grids.length) return;
  grids.forEach(function(grid){ grid.innerHTML=''; });
  THEMES.forEach(function(t){
    grids.forEach(function(grid){
      var el=document.createElement('button');
      el.type='button';
      el.className='theme-swatch'+(state.themePref===t?' active':'');
      el.setAttribute('data-theme',t);
      el.innerHTML='<div class="theme-dot sw-'+t+'"></div><span>'+themeLabel(t)+'</span>';
      el.addEventListener('click',function(){
        applyTheme(t);
        toast('Theme set to '+themeLabel(t));
      });
      grid.appendChild(el);
    });
  });
}

/* ============================================================
   TOASTS
   ============================================================ */
function toast(msg){
  var root = $('toast-root');
  var t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<svg class="icon"><use href="#i-check"/></svg><span></span>';
  t.querySelector('span').textContent = msg;
  root.appendChild(t);
  setTimeout(function(){
    t.classList.add('leaving');
    setTimeout(function(){ t.remove(); }, 320);
  }, 2200);
}

/* ============================================================
   RIPPLE (event-delegated, all .icon-btn/.composer-btn/.quick-tile/.sheet-tile)
   ============================================================ */
document.addEventListener('pointerdown', function(e){
  var target = e.target.closest('.icon-btn,.composer-btn,.quick-tile,.sheet-tile,.model-chip,.avatar,.sb-newchat');
  if(!target) return;
  var r = target.getBoundingClientRect();
  var ripple = document.createElement('span');
  var size = Math.max(r.width, r.height);
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = size+'px';
  ripple.style.left = (e.clientX - r.left - size/2)+'px';
  ripple.style.top = (e.clientY - r.top - size/2)+'px';
  if(getComputedStyle(target).position === 'static') target.style.position='relative';
  target.style.overflow = target.style.overflow || 'hidden';
  target.appendChild(ripple);
  setTimeout(function(){ ripple.remove(); }, 600);
});

/* ============================================================
   SIDEBAR
   ============================================================ */
function openSidebar(){ $('app').classList.add('sidebar-open'); }
function closeSidebar(){ $('app').classList.remove('sidebar-open'); }

/* ============================================================
   SHEETS / MODALS (generic open/close)
   ============================================================ */
function openSheet(id){
  $('sheet-backdrop').classList.add('show');
  $(id).classList.add('show');
}
function closeSheets(){
  $('sheet-backdrop').classList.remove('show');
  document.querySelectorAll('.sheet').forEach(function(s){ s.classList.remove('show'); });
}
function openModal(id){
  var backdrop = $('modal-backdrop');
  if(id === 'modal-model'){
    backdrop.classList.remove('show','model-popover-backdrop');
  } else {
    backdrop.classList.remove('model-popover-backdrop');
    backdrop.classList.add('show');
  }
  $(id).classList.add('show');
}

function showSettingsPanel(name){
  var sm=$('modal-settings');
  if(sm && name!=='projects') sm.classList.remove('kyro-projects-mode');
  if(sm && name!=='library') sm.classList.remove('kyro-library-mode');
  var panelNames=['appearance','language','api','models','voice','security','scheduled','projects','plugins','library'];
  var root=$('settings-root');
  if(root) root.hidden = (name!=='root');
  panelNames.forEach(function(p){
    var el=$('panel-'+p);
    if(el) el.hidden = (name!==p);
  });
  var back=$('settings-back-wrap');
  var main=$('settings-title-main');
  var title=$('settings-title');
  var labels={
    appearance:'Theme & Appearance',
    language:'Language',
    api:'API Manager',
    models:'Model Manager',
    voice:'Voice',
    security:'Security',
    scheduled:'Scheduled',
    projects:'Projects',
    plugins:'Plugins',
    library:'Library'
  };
  var isRoot=(name==='root' || !name);
  if(back) back.hidden=isRoot;
  if(main) main.hidden=!isRoot;
  if(title) title.textContent=labels[name] || 'Settings';
  if(name==='appearance'){
    buildThemeGrid();
    var pg=$('profile-theme-grid');
    if(pg) pg.innerHTML='';
  }
}
function closeModals(){
  $('modal-backdrop').classList.remove('show','model-popover-backdrop');
  document.querySelectorAll('.modal').forEach(function(m){ m.classList.remove('show'); });
  showSettingsPanel('root');
}
function wireSwipeToDismiss(){
  /* Bottom sheets (three-dot quick actions, Plus attachments, message actions):
     tap buttons to use them; swipe DOWN anywhere on the open sheet to dismiss. */
  document.querySelectorAll('.sheet').forEach(function(sheet){
    var sx=0, sy=0, tracking=false, axisLocked=false;

    sheet.addEventListener('touchstart', function(e){
      if(!e.touches || !e.touches[0] || !sheet.classList.contains('show')) return;
      var t=e.touches[0];
      sx=t.clientX; sy=t.clientY;
      tracking=true; axisLocked=false;
    }, {passive:true});

    sheet.addEventListener('touchmove', function(e){
      if(!tracking || !e.touches || !e.touches[0]) return;
      var t=e.touches[0], dx=t.clientX-sx, dy=t.clientY-sy;
      if(!axisLocked && (Math.abs(dx)>10 || Math.abs(dy)>10)){
        axisLocked=true;
        if(Math.abs(dx) > Math.abs(dy)) tracking=false;
        else if(dy < 0) tracking=false;
      }
    }, {passive:true});

    sheet.addEventListener('touchend', function(e){
      if(!tracking) return;
      var t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
      if(dy >= 60 && Math.abs(dx) <= 110) closeSheets();
      tracking=false; axisLocked=false;
    }, {passive:true});

    sheet.addEventListener('touchcancel', function(){
      tracking=false; axisLocked=false;
    }, {passive:true});
  });

  /* Clicking/tapping anywhere outside the three-dot popover closes it immediately. */
  var backdrop=$('sheet-backdrop');
  if(backdrop){
    function dismissSheetFromBackdrop(e){
      if(e.target===backdrop) closeSheets();
    }
    backdrop.addEventListener('click', dismissSheetFromBackdrop);
    backdrop.addEventListener('touchend', dismissSheetFromBackdrop, {passive:true});
  }
}

/* ============================================================
   MODEL LIST / SELECTOR
   ============================================================ */
function buildModelList(filter){
  renderModelInto('model-list', filter);
  renderModelInto('model-modal-list', filter);
}
function renderModelInto(containerId, filter){
  var c = $(containerId);
  if(!c) return;
  c.innerHTML = '';
  var list = MODELS.filter(function(m){
    if(!filter) return true;
    return (m.label+m.desc).toLowerCase().indexOf(filter.toLowerCase()) > -1;
  });
  list.forEach(function(m){
    var row = document.createElement('div');
    row.className = 'model-row' + (m.id===state.activeModel.id?' selected':'');
    var fav = state.favModels.indexOf(m.id) > -1;
    if(containerId === 'model-modal-list'){
      row.innerHTML = '<div class="m-info"><b>'+m.label+'</b></div>';
    } else {
      row.innerHTML = '<div class="m-info"><b>'+m.label+'</b><small>'+m.desc+'</small></div>'+
        '<button class="star-btn '+(fav?'fav':'')+'" data-star="'+m.id+'"><svg class="icon icon-sm"><use href="#i-star"/></svg></button>';
    }
    row.addEventListener('click', function(e){
      if(e.target.closest('[data-star]')) return;
      selectModel(m);
    });
    c.appendChild(row);
  });
  c.querySelectorAll('[data-star]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var id = btn.getAttribute('data-star');
      var idx = state.favModels.indexOf(id);
      if(idx>-1) state.favModels.splice(idx,1); else state.favModels.push(id);
      buildModelList(filter);
    });
  });
}
function selectModel(m){
  state.activeModel = m;
  if(state.recentModels.indexOf(m.id)===-1) state.recentModels.unshift(m.id);
  $('model-chip-label').textContent = m.label;
  buildModelList();
  closeModals();
  toast('Switched to '+m.label);
  updateCapabilityUI();
}
function updateCapabilityUI(){
  var isDemo = state.activeModel.provider === 'Demo';
  var toggle = $('toggle-websearch');
  var row = $('settings-web-search');
  var note = $('web-search-status');
  if(toggle) toggle.classList.toggle('on', state.webSearch && !isDemo);
  if(note) note.textContent = isDemo ? 'Switch to a KYRO mode to enable' : (state.webSearch ? 'Enabled' : 'Tap to enable');
  if(row) row.style.opacity = isDemo ? '.62' : '1';
}

/* ============================================================
   CHAT MANAGEMENT
   ============================================================ */
function makeAutoChatTitle(input){
  var t=String(input||'').replace(/https?:\/\/\S+/gi,'').replace(/\s+/g,' ').trim();
  if(!t) return 'Untitled chat';
  t=t.replace(/^[\s\-–—:;,\.]+|[\s\-–—:;,\.]+$/g,'');
  var words=t.split(' ').filter(Boolean).slice(0,6);
  var title=words.join(' ');
  if(title.length>38) title=title.slice(0,38).replace(/\s+\S*$/,'');
  return title ? title.charAt(0).toUpperCase()+title.slice(1) : 'Untitled chat';
}
function newChat(){
  var chat = {id:'c'+Date.now(), title:'Untitled chat', messages:[], pinned:false, unread:false};
  state.chats.unshift(chat);
  state.activeChatId = chat.id;
  renderSidebarChats();
  showHome();
}
function activeChat(){
  return state.chats.find(function(c){ return c.id === state.activeChatId; });
}
function showHome(){
  els['home-view'].hidden = false;
  els['chat-view'].hidden = true;
  els['chat-view'].innerHTML = '';
}
function showChat(){
  els['home-view'].hidden = true;
  els['chat-view'].hidden = false;
}
function switchChat(id){
  state.activeChatId = id;
  var c = activeChat();
  if(c) c.unread = false;
  renderSidebarChats();
  if(!c || c.messages.length===0){ showHome(); return; }
  showChat();
  renderMessages();
  closeSidebar();
}
function renderSidebarChats(){
  /* A later patch installs a newer, authoritative sidebar-chat renderer
     (long-press action menu) on window. When present, defer to it so
     every caller — this file's own pin/unpin/delete/rename/new-chat
     handlers included — renders chats the same, consistent way instead
     of two implementations fighting over the same list. */
  if(window.renderSidebarChats && window.renderSidebarChats!==renderSidebarChats){
    window.renderSidebarChats();
    return;
  }
  var list = $('sb-chat-list');
  if(!list) return;
  list.innerHTML = '';

  var pinned = state.chats.filter(function(c){ return !!c.pinned; });
  var recent = state.chats.filter(function(c){ return !c.pinned; });

  function addLabel(text){
    var label=document.createElement('div');
    label.className='sb-label';
    label.textContent=text;
    list.appendChild(label);
  }

  // Pinned is completely hidden until at least one chat is actually pinned.
  if(pinned.length){
    addLabel('Pinned');
    pinned.forEach(function(c){ list.appendChild(chatRowEl(c)); });
  }

  if(recent.length){
    addLabel('Recent');
    recent.forEach(function(c){ list.appendChild(chatRowEl(c)); });
  }
}
function chatRowEl(c){
  var row = document.createElement('button');
  row.className = 'sb-chat' + (c.id===state.activeChatId?' active':'');
  var rowIcon = c.pinned ? 'pin' : 'chat';
  row.innerHTML = '<svg class="icon icon-sm"><use href="#i-'+rowIcon+'"/></svg><span></span>'+(c.unread?'<span class="dot-unread"></span>':'');
  row.querySelector('span').textContent = c.title;
  var longPressed=false;
  row.addEventListener('click', function(){ if(longPressed){ longPressed=false; return; } switchChat(c.id); });
  row.addEventListener('contextmenu', function(e){ e.preventDefault(); togglePinnedFromLongPress(c); });
  var pressTimer;
  row.addEventListener('touchstart', function(){
    longPressed=false;
    pressTimer=setTimeout(function(){
      longPressed=true;
      togglePinnedFromLongPress(c);
    }, 550);
  }, {passive:true});
  row.addEventListener('touchend', function(){ clearTimeout(pressTimer); });
  row.addEventListener('touchmove', function(){ clearTimeout(pressTimer); });
  return row;
}
function togglePinnedFromLongPress(c){
  if(!c) return;
  if(!c.pinned){
    var count=state.chats.filter(function(x){return !!x.pinned;}).length;
    if(count>=10){toast('Only 10 chats can be pinned');return;}
  }
  c.pinned=!c.pinned;
  renderSidebarChats();
  toast(c.pinned?'Chat pinned':'Chat unpinned');
}
function openChatActions(c){
  var list = $('msg-actions-list');
  list.innerHTML = '';
  var actions = [
    {icon:'edit', label:'Rename', fn:function(){
      var t=prompt('Rename chat', c.title);
      if(t){ c.title=t; renderSidebarChats(); }
    }},
    {icon:'pin', label:c.pinned?'Unpin':'Pin', fn:function(){
      if(!c.pinned){
        var count = state.chats.filter(function(x){ return !!x.pinned; }).length;
        if(count >= 10){
          toast('Only 10 chats can be pinned');
          return;
        }
      }
      c.pinned=!c.pinned;
      renderSidebarChats();
      toast(c.pinned ? 'Chat pinned' : 'Chat unpinned');
    }},
    {icon:'share', label:'Share', fn:function(){ shareChat(c); }},
    {icon:'download', label:'Export', fn:function(){ exportChat(c); }},
    {icon:'trash', label:'Delete', danger:true, fn:function(){
      state.chats = state.chats.filter(function(x){return x.id!==c.id;});
      if(state.activeChatId===c.id) newChat();
      renderSidebarChats();
    }}
  ];
  actions.forEach(function(a){
    var b = document.createElement('button');
    b.className = 'sheet-action' + (a.danger?' danger':'');
    b.innerHTML = '<svg class="icon"><use href="#i-'+a.icon+'"/></svg><span>'+a.label+'</span>';
    b.addEventListener('click', function(){ a.fn(); closeSheets(); });
    list.appendChild(b);
  });
  openSheet('sheet-msg-actions');
}
function shareChat(c){
  var text = c.messages.map(function(m){
    return (m.role==='user'?'You':'KYRO')+': '+m.text;
  }).join('\n\n');
  var title = c.title || 'KYRO Chat';
  window.__kyroShareChat = {chat:c, text:text, title:title};
  var titleEl=document.getElementById('kyro-share-preview-title');
  if(titleEl) titleEl.textContent=title;
  var bd=document.getElementById('kyro-share-backdrop');
  if(bd){ bd.classList.add('show'); bd.setAttribute('aria-hidden','false'); document.body.classList.add('kyro-share-open'); }
}
function closeKyroShare(){
  var bd=document.getElementById('kyro-share-backdrop');
  if(bd){ bd.classList.remove('show'); bd.setAttribute('aria-hidden','true'); }
  document.body.classList.remove('kyro-share-open');
}
function kyroSharePayload(){
  var d=window.__kyroShareChat||{};
  var text=d.text||''; var title=d.title||'KYRO Chat';
  var encoded='';
  try{ encoded=btoa(unescape(encodeURIComponent(JSON.stringify({title:title,text:text})))); }catch(e){}
  var url=location.href.split('#')[0]+'#shared='+encodeURIComponent(encoded);
  return {title:title,text:text,url:url};
}
function kyroOpenTarget(target){
  var p=kyroSharePayload();
  var urls={
    whatsapp:'https://wa.me/?text='+encodeURIComponent(p.title+'\n\n'+p.text+'\n\n'+p.url),
    'whatsapp-status':'https://wa.me/?text='+encodeURIComponent(p.title+'\n\n'+p.text+'\n\n'+p.url),
    telegram:'https://t.me/share/url?url='+encodeURIComponent(p.url)+'&text='+encodeURIComponent(p.title+'\n\n'+p.text),
    facebook:'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(p.url),
    'facebook-feed':'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(p.url),
    'facebook-story':'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(p.url),
    instagram:'https://www.instagram.com/',
    'instagram-story':'https://www.instagram.com/'
  };
  var u=urls[target];
  if(u) window.open(u,'_blank','noopener,noreferrer');
  else if(navigator.share) navigator.share({title:p.title,text:p.text,url:p.url}).catch(function(){});
  toast(target.indexOf('instagram')===0?'Instagram opened':target.indexOf('facebook')===0?'Facebook opened':target.indexOf('whatsapp')===0?'WhatsApp opened':target==='telegram'?'Telegram opened':'Share opened');
}

function exportChat(c){
  var text = c.messages.map(function(m){ return (m.role==='user'?'You':'KYRO')+': '+m.text; }).join('\n\n');
  var blob = new Blob([text], {type:'text/plain'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = c.title.replace(/\s+/g,'_')+'.txt';
  a.click();
  toast('Chat exported');
}

/* ============================================================
   MESSAGE RENDERING
   ============================================================ */
function renderMessages(){
  var c = activeChat();
  if(!c) return;
  els['chat-view'].innerHTML = '';

  /* Natural conversation order: user's message first, then KYRO's reply. */
  for(var j=0;j<c.messages.length;j++){
    els['chat-view'].appendChild(messageEl(c.messages[j]));
  }
  scrollChatToBottom();
}
var __kyroScrollRAF=null;
function scrollChatToBottom(){
  if(__kyroScrollRAF) return;
  __kyroScrollRAF=requestAnimationFrame(function(){
    __kyroScrollRAF=null;
    var cv=els['chat-view']; if(cv) cv.scrollTop=cv.scrollHeight;
  });
}
function messageEl(m){
  var row=document.createElement('div');
  row.className='msg-row '+(m.role==='user'?'user':'ai');
  var attachHtml='';
  if(m.attachments&&m.attachments.length){
    attachHtml=m.attachments.map(function(a){
      if(a.generatedImage&&a.dataUrl){
        return '<div class="msg-attach kyro-generated-image"><img src="'+a.dataUrl+'" alt="KYRO generated image"><div class="kyro-generated-image-tools"><button type="button" data-save-generated="'+escapeHtml(a.name||'kyro-generated.png')+'" data-image-src="'+a.dataUrl+'">Save image</button></div></div>';
      }
      return a.dataUrl ? '<div class="msg-attach"><img src="'+a.dataUrl+'" alt="Attached image"></div>' : '<div class="msg-attach" style="padding:10px 14px;display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text-dim);"><svg class="icon icon-sm"><use href="#i-file"></use></svg>'+escapeHtml(a.name||'File')+'</div>';
    }).join('');
  }
  var actionsHtml=msgActionsHtml(m);
  var rendered=window.kyroRenderMarkdown?window.kyroRenderMarkdown(m.text||''):(m.text?escapeHtml(m.text):'');
  row.innerHTML='<div class="msg-col">'+attachHtml+(rendered?'<div class="bubble">'+rendered+'</div>':'')+'<div class="msg-meta">'+(m.role==='ai'?'<span>'+escapeHtml(m.time||'')+'</span>':'')+actionsHtml+'</div></div>';
  enhanceCodeBlocks(row);
  wireMsgActions(row,m);
  if(m.role==='user')wireUserLongPress(row,m);
  return row;
}
function wireUserLongPress(row, m){
  /* Do not intercept long-press/context-menu on message text. The browser's
     native Select/Copy UI should remain available on phones. The old custom
     handler could steal the gesture and, in some browsers, cause the auth
     gate to surface while the user was only trying to copy text. */
  row.setAttribute('data-message-copy-enabled','1');
}
function openUserMessageActions(m){
  var list = $('msg-actions-list');
  list.innerHTML = '';
  [
    {icon:'copy',label:'Copy',fn:function(){ copyText(m.text); }},
    {icon:'edit',label:'Edit',fn:function(){ editMessage(m); }}
  ].forEach(function(a){
    var b=document.createElement('button');
    b.className='sheet-action';
    b.innerHTML='<svg class="icon"><use href="#i-'+a.icon+'"/></svg><span>'+a.label+'</span>';
    b.addEventListener('click',function(){ a.fn(); closeSheets(); });
    list.appendChild(b);
  });
  openSheet('sheet-msg-actions');
}
function msgActionsHtml(){
  return '<div class="msg-actions">'+
    
    '<button data-act="read" title="Read aloud"><svg class="icon icon-sm"><use href="#i-volume"/></svg></button>'+
    '<button data-act="regen" title="Regenerate"><svg class="icon icon-sm"><use href="#i-refresh"/></svg></button>'+
    '<button data-act="share" title="Share"><svg class="icon icon-sm"><use href="#i-share"/></svg></button>'+
    '<button data-act="more" title="More"><svg class="icon icon-sm"><use href="#i-kebab"/></svg></button>'+
    '</div>';
}
function enhanceCodeBlocks(row){
  row.querySelectorAll('pre').forEach(function(pre){
    if(pre.closest('.kyro-code-wrap')) return;
    var wrap=document.createElement('div'); wrap.className='kyro-code-wrap';
    var btn=document.createElement('button'); btn.type='button'; btn.className='kyro-code-copy'; btn.textContent='Copy code';
    btn.addEventListener('click',function(){
      var code=pre.innerText||pre.textContent||'';
      copyText(code);
      btn.textContent='Copied';
      setTimeout(function(){btn.textContent='Copy code';},1200);
    });
    pre.parentNode.insertBefore(wrap,pre); wrap.appendChild(btn); wrap.appendChild(pre);
  });
}
function userMsgActionsHtml(){
  return '<div class="msg-actions">'+
    '<button data-act="edit"><svg class="icon icon-sm"><use href="#i-edit"/></svg></button>'+
    '<button data-act="copy"><svg class="icon icon-sm"><use href="#i-copy"/></svg></button>'+
    '<button data-act="more"><svg class="icon icon-sm"><use href="#i-kebab"/></svg></button>'+
    '</div>';
}
function wireMsgActions(row, m){
  row.querySelectorAll('[data-act]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var act = btn.getAttribute('data-act');
      if(act==='copy'){ copyText(m.text); }
      else if(act==='read'){ readAloud(m.text); }
      else if(act==='regen'){ regenerate(m); }
      else if(act==='edit'){ editMessage(m); }
      else if(act==='share'){ shareMessage(m.text); }
      else if(act==='more'){ openMessageMore(m); }
    });
  });
}
function openMessageMore(m){
  var list = $('msg-actions-list');
  list.innerHTML = '';
  var c = activeChat();
  var actions = [
    {icon:'pin', label:'Pin message', fn:function(){ toast('Pinned'); }},
    {icon:'share', label:'Share', fn:function(){ toast('Share sheet would open here'); }},
    {icon:'copy', label:'Duplicate', fn:function(){ c.messages.push(Object.assign({},m,{id:'m'+Date.now(),time:nowTime()})); renderMessages(); }},
    {icon:'trash', label:'Delete', danger:true, fn:function(){ c.messages = c.messages.filter(function(x){return x.id!==m.id;}); renderMessages(); }}
  ];
  actions.forEach(function(a){
    var b = document.createElement('button');
    b.className = 'sheet-action' + (a.danger?' danger':'');
    b.innerHTML = '<svg class="icon"><use href="#i-'+a.icon+'"/></svg><span>'+a.label+'</span>';
    b.addEventListener('click', function(){ a.fn(); closeSheets(); });
    list.appendChild(b);
  });
  openSheet('sheet-msg-actions');
}
function copyText(t){
  t=String(t==null?'':t);
  if(!t){ toast('Nothing to copy'); return; }

  /* Works on HTTPS, localhost and local HTML/file:// where Clipboard API
     is often unavailable or blocked by Android Chrome. */
  function done(){ try{toast('Copied');}catch(e){} }
  function fallback(){
    try{
      var ta=document.createElement('textarea');
      ta.value=t;
      ta.setAttribute('readonly','');
      ta.setAttribute('aria-hidden','true');
      ta.style.position='fixed';
      ta.style.left='-9999px';
      ta.style.top='0';
      ta.style.width='1px';
      ta.style.height='1px';
      ta.style.opacity='0';
      ta.style.pointerEvents='none';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0,ta.value.length);
      var ok=false;
      try{ ok=document.execCommand('copy'); }catch(e){}
      ta.remove();
      if(ok){ done(); return; }

      /* Last fallback: keep the text selected so Android can copy it. */
      var ta2=document.createElement('textarea');
      ta2.value=t;
      ta2.style.position='fixed';
      ta2.style.left='8px';
      ta2.style.right='8px';
      ta2.style.top='20%';
      ta2.style.zIndex='50000';
      ta2.style.padding='12px';
      ta2.style.background='var(--surface-2)';
      ta2.style.color='var(--text)';
      ta2.style.border='1px solid var(--border)';
      ta2.style.borderRadius='12px';
      document.body.appendChild(ta2);
      ta2.focus();
      ta2.select();
      ta2.setSelectionRange(0,ta2.value.length);
      try{toast('Text selected — tap Copy');}catch(e){}
    }catch(e){
      try{toast('Copy failed — select the text manually');}catch(_){}
    }
  }

  try{
    if(navigator.clipboard && typeof navigator.clipboard.writeText==='function'){
      var r=navigator.clipboard.writeText(t);
      if(r && typeof r.then==='function'){
        r.then(done).catch(fallback);
        return;
      }
    }
  }catch(e){}
  fallback();
}
function legacyCopyText(t){ copyText(t); }
function shareMessage(t){
  t=String(t||'');
  if(navigator.share){ navigator.share({title:'KYRO',text:t}).catch(function(){}); }
  else copyText(t);
}
function editMessage(m){
  if(!m || m.role!=='user') return;
  var oldText=String(m.text||'');
  var t = prompt('Edit message', oldText);
  if(t===null) return;
  t=String(t).trim();
  if(!t){ try{toast('Message cannot be empty');}catch(e){} return; }
  m.text=t;
  try{ if(typeof scheduleSave==='function') scheduleSave(); }catch(e){}
  try{ renderMessages(); }catch(e){}
  try{ scrollChatToBottom(); }catch(e){}
  try{toast('Message updated');}catch(e){}
}
function regenerate(m){
  var c = activeChat();
  var idx = c.messages.indexOf(m);
  var prior = idx>0 ? c.messages[idx-1] : null;
  if(idx>-1) c.messages.splice(idx,1);
  renderMessages();
  var key=(state.apiKeys&&state.apiKeys[0]&&state.apiKeys[0].key)||'';
  if(key && prior && prior.role==='user') liveReply(c, prior.text||'', prior.attachments||[]);
  else streamReply(c, pickDemoReply(prior&&prior.text||''));
}
var synth = window.speechSynthesis;
var kyroSarvamAudio=null;
function readAloud(text){
  text=String(text||'').trim(); if(!text)return;
  // If Sarvam key is connected, use Sarvam TTS (Bulbul v3) for better Indian-language voice
  if(state.activeProvider==='sarvam' && loadPersistedSarvamApiKey()){
    if(kyroSarvamAudio){try{kyroSarvamAudio.pause();}catch(e){}}
    var lang=/[\u0900-\u097F]/.test(text)?'hi-IN':'en-IN';
    fetch('https://api.sarvam.ai/text-to-speech',{
      method:'POST',headers:sarvamAuthHeaders(loadPersistedSarvamApiKey()),cache:'no-store',
      body:JSON.stringify({text:text,model:'bulbul:v3',speaker:'shubh',target_language_code:lang,output_audio_codec:'mp3',speech_sample_rate:24000,pace:1.0,temperature:0.6})
    }).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error((j.error&&j.error.message)||('HTTP '+r.status));return j;});})
    .then(function(j){
      var b64=j&&j.audios&&j.audios[0];if(!b64)throw new Error('No audio returned');
      var bin=atob(b64),bytes=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
      kyroSarvamAudio=new Audio(URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'})));
      kyroSarvamAudio.play().catch(function(){toast('Tap the speaker again to play audio');});
    }).catch(function(e){toast('Voice error: '+(e.message||'unknown'));console.error('KYRO TTS:',e);});
    return;
  }
  // Fallback: browser SpeechSynthesis API
  if(!synth){ toast('Speech not supported on this device'); return; }
  synth.cancel();
  var u = new SpeechSynthesisUtterance(text);
  synth.speak(u);
}
function nowTime(){
  var d = new Date();
  var h = d.getHours(), mi = d.getMinutes();
  var ampm = h>=12?'PM':'AM';
  h = h%12; if(h===0) h=12;
  return h+':'+(mi<10?'0':'')+mi+' '+ampm;
}
function escapeHtml(s){
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/* ============================================================
   SENDING / DEMO AI
   ============================================================ */
function pickDemoReply(text){
  var t = (text||'').toLowerCase();
  var pool;
  if(/^(hi|hello|hey|namaste)/.test(t.trim())) pool = DEMO_REPLIES.greet;
  else if(t.indexOf('?') > -1) pool = DEMO_REPLIES.question;
  else pool = DEMO_REPLIES.general;
  return pool[Math.floor(Math.random()*pool.length)];
}
function kyroExtractApiKey(text){
  var raw=String(text||'').trim();
  if(!raw) return null;
  /* Accept any supported API key pasted alone or with a short label. Never send the key to the API. */
  var m=raw.match(/(?:^|\s)((?:AIza[0-9A-Za-z_-]{20,}|AQ\.[0-9A-Za-z_-]{20,}|sk_[A-Za-z0-9._-]{8,}))(?:$|\s)/);
  return m ? m[1].trim() : null;
}
/* Keep backward-compatible alias */
var kyroExtractGeminiApiKey = kyroExtractApiKey;

function kyroAutoAddChatApiKey(key){
  key=String(key||'').trim();
  var det=detectProvider(key);
  if(!det) return Promise.resolve({ok:false,status:0,message:'Invalid API key format.'});
  var testFn = det.provider==='sarvam' ? testSarvamApiKey : testGeminiApiKey;
  return testFn(key).then(function(res){
    if(res.ok){
      state.apiKeys=[{key:key,provider:det.provider,endpoint:det.endpoint}];
      if(det.provider==='sarvam'){
        persistSarvamApiKey(key);
      } else {
        persistGeminiApiKey(key);
      }
      setActiveProvider(det.provider);
      state.activeModel={id:'kyro-1',label:'KYRO 1',provider:'KYRO',desc:'Fast · multimodal',rawId:'gemini-3.5-flash-lite'};
      var modelChip=$('model-chip-label'); if(modelChip) modelChip.textContent='KYRO 1';
      renderApiKeys();
      return res;
    }
    return res;
  });
}

function sendMessage(){
  var text = els['msg-input'].value.trim();
  if(!text && state.pendingAttachments.length===0) return;

  /* If the user pastes an API key directly into the chat, capture it,
     validate it, save it to the same API-key store used by Settings, and do
     NOT expose/send the secret as a chat message. */
  var pastedApiKey=kyroExtractApiKey(text);
  if(pastedApiKey){
    els['msg-input'].value='';
    autoExpand(els['msg-input']);
    updateSendBtn();
    toast('Connection key detected — connecting…');
    kyroAutoAddChatApiKey(pastedApiKey).then(function(res){
      if(res.ok){
        toast('Connection established ✓ You can chat now');
        showChat();
      }else{
        var detMsg=kyroDetectActiveProvider(pastedApiKey)==='sarvam'?sarvamAuthErrorMessage(res.status,res.message):geminiAuthErrorMessage(res.status,res.message);
        toast(detMsg);
        showErrorCard(detMsg);
      }
    });
    return;
  }

  var c = activeChat();
  if(!c){ newChat(); c = activeChat(); }

  if(c.messages.length===0){
    c.title = makeAutoChatTitle(text || 'Attachment');
  }

  var userMsg = {
    id:'m'+Date.now(),
    role:'user',
    text:text,
    time:nowTime(),
    attachments:state.pendingAttachments.slice()
  };
  c.messages.push(userMsg);

  state.pendingAttachments.forEach(function(a){
    if(a.dataUrl) state.library.push(a);
  });
  state.pendingAttachments = [];
  renderAttachChips();
  els['msg-input'].value = '';
  autoExpand(els['msg-input']);
  showChat();
  renderSidebarChats();
  renderMessages();
  updateSendBtn();

  /* One-shot tools apply to this request only; clear their selection now. */
  try{if(typeof window.kyroExitWorkMode==="function")window.kyroExitWorkMode();}catch(_){}
  try{if(typeof window.kyroExitImageMode==="function")window.kyroExitImageMode();}catch(_){}
  try{window.dispatchEvent(new CustomEvent("kyro-one-shot-mode-cleared"));}catch(_){}

  /* Demo knowledge path runs AFTER the user message is stored so
     the Recent list always gets the generated chat title. */
  try{
    var demoAnswer = kyroV33TryDemoAnswer(text);
    if(demoAnswer){
      streamReply(c, demoAnswer, text);
      return;
    }
  }catch(e){}

  // A saved Gemini key should be enough to start live chat. The user must
  // not have to re-enter the key or manually switch models after reopening.
  try{ ensureGeminiModelForSavedKey(); }catch(e){}
  var hasBuiltInGeminiKey = typeof KYRO_BUILTIN_GEMINI_API_KEY === 'string' &&
    KYRO_BUILTIN_GEMINI_API_KEY.trim() &&
    KYRO_BUILTIN_GEMINI_API_KEY !== 'PASTE_YOUR_GEMINI_API_KEY_HERE';
  if(state.apiKeys.length && (state.activeModel.provider === 'Demo' || state.activeModel.id === 'kyro-demo')){
    state.activeModel={id:'kyro-1',label:'KYRO 1',provider:'KYRO',desc:'Fast · multimodal',rawId:'gemini-3.5-flash-lite'};
  }
  if(state.activeModel.provider !== 'Demo' && (state.apiKeys.length || hasBuiltInGeminiKey)){
    liveReply(c, text, userMsg.attachments);
  } else {
    var appReply = appKnowledgeReply(text);
    streamReply(c, appReply || pickDemoReply(text), text);
  }
}
function getWorkStatus(text){
  var t=(text||'').toLowerCase();
  if(t.indexOf('deep thinking')>-1 || t.indexOf('deepthink')>-1) return 'Deep thinking…';
  if(t.indexOf('research')>-1 || t.indexOf('researching')>-1) return 'Researching…';
  if(t.indexOf('generat')>-1) return 'Generating…';
  if(t.indexOf('search')>-1) return 'Searching…';
  return 'Thinking…';
}
function makeStatusRow(label){
  var row=document.createElement('div');
  row.className='status-row';
  if(/^Searching…?$/i.test(label || '')) row.classList.add('searching');
  row.innerHTML='<div class="logo-mark status-logo"></div><span></span>';
  row.querySelector('span').textContent=label;
  return row;
}
function streamReply(c, fullText, requestText){
  state.isGenerating=true; toggleSendStop(true);
  var statusRow=makeStatusRow(getWorkStatus(requestText||fullText));
  els['chat-view'].appendChild(statusRow); scrollChatToBottom();
  (function(){
    if(!state.isGenerating){statusRow.remove();return;}
    var aiMsg={id:'m'+Date.now(),role:'ai',text:'',time:nowTime(),attachments:[],_streaming:true}; c.messages.push(aiMsg);
    var el=messageEl(aiMsg); els['chat-view'].appendChild(el);
    var bubble=el.querySelector('.bubble');
    if(!bubble){bubble=document.createElement('div');bubble.className='bubble';el.querySelector('.msg-col').prepend(bubble);}
    bubble.classList.add('is-streaming');
    var i=0,step=Math.max(8,Math.ceil(fullText.length/90));
    var interval=setInterval(function(){
      if(!state.isGenerating){clearInterval(interval);finish();return;}
      i=Math.min(fullText.length,i+step); aiMsg.text=fullText.slice(0,i);
      bubble.innerHTML=window.kyroRenderMarkdown?window.kyroRenderMarkdown(aiMsg.text):escapeHtml(aiMsg.text);
      scrollChatToBottom();
      if(i>=fullText.length){clearInterval(interval);finish();}
    },12);
    function finish(){
      state.isGenerating=false; toggleSendStop(false); statusRow.remove(); bubble.classList.remove('is-streaming');
      aiMsg._streaming=false; aiMsg.text=fullText; el.replaceWith(messageEl(aiMsg));
      if(state.ttsAuto)readAloud(aiMsg.text); scrollChatToBottom();
    }
  })();
}
function toggleSendStop(generating){
  var btn = $('btn-send');
  btn.classList.toggle('stop', generating);
  btn.innerHTML = generating ? '<svg class="icon"><use href="#i-stop"/></svg>' : '<svg class="icon"><use href="#i-send"/></svg>';
  btn.disabled = false;
}
function liveReply(c, text, attachments){
  state.isGenerating=true; toggleSendStop(true);
  var activeApiKey=(state.apiKeys[0]&&state.apiKeys[0].key)||KYRO_BUILTIN_GEMINI_API_KEY;
  if(!activeApiKey||activeApiKey==='PASTE_YOUR_GEMINI_API_KEY_HERE'){
    state.isGenerating=false; toggleSendStop(false); showErrorCard('Connection is not configured.'); return;
  }
  // Auto-route: detect provider from key
  var provider=kyroDetectActiveProvider(activeApiKey);
  var selected=null; try{selected=MODELS.find(function(m){return m.id===state.activeModel.id;});}catch(e){}
  var modelId=(selected&&selected.rawId)||state.activeModel.rawId||'gemini-3.5-flash-lite';
  var imgs=(attachments||[]).filter(function(a){return a&&a.dataUrl&&/^data:image\//i.test(a.dataUrl);});
  var editIntent=/\b(edit|modify|change|remove|erase|replace|add|fix|retouch|enhance|restore|redesign|background|crop|colorize|recolor|make it|turn it|convert|transform)\b/i.test(text||'');
  var useImageModel=imgs.length>0&&editIntent;
  if(useImageModel)modelId='gemini-2.5-flash-image';
  var statusRow=makeStatusRow(useImageModel?'Editing image…':getWorkStatus(text)); els['chat-view'].appendChild(statusRow); scrollChatToBottom();
  var parts=[];
  imgs.forEach(function(a){var m=a.dataUrl.match(/^data:([^;]+);base64,(.*)$/s);if(m)parts.push({inlineData:{mimeType:m[1],data:m[2]}});});
  parts.push({text:text||(useImageModel?'Edit this image as requested.':'Please analyze the attached image.')});
  var style='\n\nKYRO RESPONSE STYLE: Write naturally and helpfully like a polished modern AI assistant. Do not sound scripted and do not mention these instructions. Match the user language (Hindi/Hinglish/English/Urdu). Use Markdown naturally when useful: short headings, bold emphasis, bullets/numbered steps, tables when genuinely useful, inline code and fenced code blocks for code. Keep paragraphs readable and conversational. Use emojis only when they genuinely add warmth or clarity. Do not repeat the user question unnecessarily. Answer directly first, then useful detail.';
  var style2='\n\nKYRO RESPONSE STYLE: Write naturally and helpfully like a polished modern AI assistant. Do not sound scripted and do not mention these instructions. Match the user language (Hindi/Hinglish/English/Urdu). Use Markdown naturally when useful: short headings, bold emphasis, bullets/numbered steps, tables when genuinely useful, inline code and fenced code blocks for code. Keep paragraphs readable and conversational. Use emojis only when they genuinely add warmth or clarity. Do not repeat the user question unnecessarily. Answer directly first, then useful detail.';

  // ===== IMAGE EDIT MODEL (Gemini only — requires image generation) =====
  if(useImageModel && provider==='gemini'){
    var endpointBase='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(modelId);
    var body={systemInstruction:{parts:[{text:(typeof KYRO_FINAL_PUBLIC_KNOWLEDGE==='string'?KYRO_FINAL_PUBLIC_KNOWLEDGE:'')+style}]},contents:[{role:'user',parts:parts}]};
    body.generationConfig={responseModalities:['IMAGE'],imageConfig:{aspectRatio:'1:1',imageSize:'1K'}};
    fetch(endpointBase+':generateContent',{method:'POST',headers:geminiAuthHeaders(activeApiKey),body:JSON.stringify(body)}).then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j,status:r.status};});}).then(function(res){
      statusRow.remove();state.isGenerating=false;toggleSendStop(false);
      if(!res.ok){showErrorCard(geminiAuthErrorMessage(res.status,(res.j&&res.j.error&&res.j.error.message)||''));return;}
      var ps=(res.j.candidates&&res.j.candidates[0]&&res.j.candidates[0].content&&res.j.candidates[0].content.parts)||[],generated=null;
      for(var i=0;i<ps.length;i++){generated=imagePartToDataUrl(ps[i]);if(generated)break;}
      if(!generated){showErrorCard('The model understood the edit request but returned no generated image. Try a simpler edit request.');return;}
      c.messages.push({id:'m'+Date.now()+'i',role:'ai',text:'',time:nowTime(),attachments:[{name:'KYRO-edited.png',dataUrl:generated,generatedImage:true}]});save();renderMessages();
    }).catch(function(err){statusRow.remove();state.isGenerating=false;toggleSendStop(false);showErrorCard('Image request failed. Check the API key, model access/quota, and browser console.');console.error('KYRO image:',err);});
    return;
  }

  // ===== GEMINI TEXT STREAMING =====
  if(provider==='gemini'){
    var endpointBase='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(modelId);
    var body={systemInstruction:{parts:[{text:(typeof KYRO_FINAL_PUBLIC_KNOWLEDGE==='string'?KYRO_FINAL_PUBLIC_KNOWLEDGE:'')+style}]},contents:[{role:'user',parts:parts}]};
    if(state.webSearch && !useImageModel){ body.tools=[{google_search:{}}]; }
    var aiMsg={id:'m'+Date.now(),role:'ai',text:'',time:nowTime(),attachments:[],_streaming:true};c.messages.push(aiMsg);
    var el=messageEl(aiMsg);els['chat-view'].appendChild(el);var bubble=el.querySelector('.bubble');
    if(!bubble){bubble=document.createElement('div');bubble.className='bubble';el.querySelector('.msg-col').prepend(bubble);}
    bubble.classList.add('is-streaming');
    function streamRequest(modelForRequest, allowFallback){
      var url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(modelForRequest)+':streamGenerateContent?alt=sse';
      return fetch(url,{method:'POST',headers:geminiAuthHeaders(activeApiKey),body:JSON.stringify(body)}).then(function(r){
        if(!r.ok){
          return r.text().then(function(t){
            var e=new Error(t||('Request failed ('+r.status+')'));
            e.status=r.status;
            e.responseText=t||'';
            throw e;
          });
        }
        return r;
      }).catch(function(err){
        var raw=String((err&&err.responseText)||err&&err.message||'').toLowerCase();
        var is429=(err&&err.status===429)||raw.indexOf('resource_exhausted')>=0||raw.indexOf('quota exceeded')>=0;
        if(allowFallback && is429 && modelForRequest!=='gemini-3.5-flash-lite'){
          return streamRequest('gemini-3.5-flash-lite',false);
        }
        throw err;
      });
    }
    streamRequest(modelId,true).then(function(r){
      if(!r.body)throw new Error('Streaming is not available in this browser.');
      var reader=r.body.getReader(),decoder=new TextDecoder('utf-8'),buffer='',full='';
      aiMsg.sources=[];
      function collectSources(j){ try{ var gm=j&&j.candidates&&j.candidates[0]&&j.candidates[0].groundingMetadata; var chunks=gm&&gm.groundingChunks||[]; chunks.forEach(function(ch){var w=ch&&ch.web;if(!w||!w.uri)return;var key=w.uri+'|'+(w.title||''); if(!aiMsg.sources.some(function(x){return x.uri+'|'+(x.title||'')===key;})) aiMsg.sources.push({uri:w.uri,title:w.title||w.uri});}); }catch(_){} }
      function event(ev){ev.split(/\r?\n/).forEach(function(line){if(line.indexOf('data:')!==0)return;var raw=line.slice(5).trim();if(!raw||raw==='[DONE]')return;try{var j=JSON.parse(raw);collectSources(j);var ps=j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts||[];ps.forEach(function(part){if(part.text){if(statusRow.parentNode)statusRow.remove();full+=part.text;aiMsg.text=full;bubble.innerHTML=window.kyroRenderMarkdown?window.kyroRenderMarkdown(full):escapeHtml(full);scrollChatToBottom();}});}catch(e){}});}
      function pump(){return reader.read().then(function(x){if(x.done){if(buffer.trim())event(buffer);finish();return;}buffer+=decoder.decode(x.value,{stream:true});var pieces=buffer.split(/\r?\n\r?\n/);buffer=pieces.pop();pieces.forEach(event);return pump();});}
      return pump();
    }).catch(function(err){statusRow.remove();state.isGenerating=false;toggleSendStop(false);c.messages=c.messages.filter(function(m){return m!==aiMsg;});renderMessages();(function(){
        var raw=String((err&&err.responseText)||err&&err.message||'');
        var low=raw.toLowerCase();
        if((err&&err.status===429)||low.indexOf('resource_exhausted')>=0||low.indexOf('quota exceeded')>=0){
          showErrorCard('Connection quota exceeded for the available models. Please wait for the quota reset or use a different key.');
        }else{
          showErrorCard('Connection request failed. '+(err&&err.message?err.message:'Check the API key, selected model, API access/quota, and browser console.'));
        }
      })();console.error('KYRO:',err);});
    function finish(){statusRow.remove();state.isGenerating=false;toggleSendStop(false);bubble.classList.remove('is-streaming');aiMsg._streaming=false;if(!aiMsg.text)aiMsg.text='No response text found in reply.';el.replaceWith(messageEl(aiMsg));if(state.ttsAuto)readAloud(aiMsg.text);scrollChatToBottom();}
    return;
  }

  // ===== SARVAM TEXT STREAMING =====
  if(provider==='sarvam'){
    var messages=[];
    try{
      var cc=Array.isArray(c.messages)?c.messages:[];
      cc.forEach(function(m){if(m&&((m.role==='user')||(m.role==='assistant'))&&m.text)messages.push({role:m.role==='ai'?'assistant':m.role,content:String(m.text)});});
    }catch(e){}
    if(!messages.length||messages[messages.length-1].content!==String(text||''))messages.push({role:'user',content:String(text||'')});

    var saMsg={id:'m'+Date.now(),role:'ai',text:'',time:nowTime(),attachments:[],_streaming:true};c.messages.push(saMsg);
    var sel=messageEl(saMsg);els['chat-view'].appendChild(sel);var sbubble=sel.querySelector('.bubble');
    if(!sbubble){sbubble=document.createElement('div');sbubble.className='bubble';sel.querySelector('.msg-col').prepend(sbubble);}
    sbubble.classList.add('is-streaming');

    var sysText=(typeof KYRO_FINAL_PUBLIC_KNOWLEDGE==='string'?KYRO_FINAL_PUBLIC_KNOWLEDGE:'')+style2;
    // Sarvam API doesn't have systemInstruction in v1/chat/completions, prepend as system message
    messages.unshift({role:'system',content:sysText});

    fetch('https://api.sarvam.ai/v1/chat/completions',{method:'POST',headers:sarvamAuthHeaders(activeApiKey),cache:'no-store',body:JSON.stringify({model:'sarvam-105b-conversations',messages:messages,max_tokens:2048,reasoning_effort:'low',stream:true})})
    .then(function(r){if(!r.ok)return r.text().then(function(raw){var j={};try{j=raw?JSON.parse(raw):{};}catch(e){};var er=new Error((j&&j.error&&j.error.message)||('HTTP '+r.status));er.status=r.status;throw er;});return r.body.getReader();})
    .then(function(reader){
      var decoder=new TextDecoder(),buffer='',full='';
      function event(chunk){
        chunk.split(/\r?\n/).forEach(function(line){
          if(line.indexOf('data:')!==0)return;
          var raw=line.slice(5).trim();if(!raw||raw==='[DONE]')return;
          try{var j=JSON.parse(raw),delta=j.choices&&j.choices[0]&&j.choices[0].delta&&j.choices[0].delta.content;if(delta){
            if(statusRow.parentNode)statusRow.remove();
            full+=delta;saMsg.text=full;
            sbubble.innerHTML=window.kyroRenderMarkdown?window.kyroRenderMarkdown(full):escapeHtml(full);
            scrollChatToBottom();
          }}catch(e){}
        });
      }
      function pump(){return reader.read().then(function(x){
        if(x.done){if(buffer.trim())event(buffer);finish();return;}
        buffer+=decoder.decode(x.value,{stream:true});
        var pieces=buffer.split(/\r?\n\r?\n/);
        buffer=pieces.pop();
        pieces.forEach(event);
        return pump();
      });}
      return pump();
    }).catch(function(err){
      statusRow.remove();state.isGenerating=false;toggleSendStop(false);
      c.messages=c.messages.filter(function(m){return m!==saMsg;});renderMessages();
      var msg=sarvamAuthErrorMessage(err&&err.status||0,err&&err.message||'');
      showErrorCard(msg);
      console.error('KYRO Sarvam:',err);
    });
    function finish(){statusRow.remove();state.isGenerating=false;toggleSendStop(false);sbubble.classList.remove('is-streaming');saMsg._streaming=false;if(!saMsg.text)saMsg.text='No response text found in reply.';sel.replaceWith(messageEl(saMsg));if(state.ttsAuto)readAloud(saMsg.text);scrollChatToBottom();}
  }
}
function showErrorCard(detail){
  var wrap = document.createElement('div');
  wrap.className = 'err-card';
  wrap.innerHTML = '<svg class="icon"><use href="#i-alert"/></svg><div><b>Couldn\'t reach the model</b><p></p></div>';
  wrap.querySelector('p').textContent = detail;
  els['chat-view'].appendChild(wrap);
  scrollChatToBottom();
}
function updateSendBtn(){
  var has = els['msg-input'].value.trim().length>0 || state.pendingAttachments.length>0;
  $('btn-send').disabled = !has && !state.isGenerating;
}
function autoExpand(ta){
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, 120)+'px';
}

/* ============================================================
   ATTACHMENTS
   ============================================================ */
function renderAttachChips(){
  var wrap = $('attach-chips');
  var box = $('composer-attachments');
  var composer = $('composer');
  wrap.innerHTML = '';
  if(state.pendingAttachments.length===0){
    box.hidden = true;
    composer.classList.remove('has-attachments');
    return;
  }
  box.hidden = false;
  composer.classList.add('has-attachments');
  state.pendingAttachments.forEach(function(a, idx){
    var chip = document.createElement('div');
    chip.className = 'attach-chip';
    chip.innerHTML = (a.dataUrl
      ? '<img src="'+a.dataUrl+'" alt="">'
      : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-faint);"><svg class="icon"><use href="#i-file"/></svg></div>') +
      '<button class="rm" aria-label="Remove"><svg class="icon"><use href="#i-x"/></svg></button>';
    chip.querySelector('.rm').addEventListener('click', function(){
      state.pendingAttachments.splice(idx,1);
      renderAttachChips();
      updateSendBtn();
    });
    wrap.appendChild(chip);
  });
}
function handleFiles(files){
  Array.prototype.forEach.call(files, function(f){
    if(f.type && f.type.indexOf('image/')===0){
      var reader = new FileReader();
      reader.onload = function(e){
        state.pendingAttachments.push({name:f.name, dataUrl:e.target.result});
        renderAttachChips();
        updateSendBtn();
      };
      reader.readAsDataURL(f);
    } else {
      state.pendingAttachments.push({name:f.name});
      renderAttachChips();
      updateSendBtn();
    }
  });
  toast(files.length>1 ? files.length+' files added' : (files[0] ? files[0].name+' added' : 'Added'));
}
function triggerAttach(kind){
  var map = {camera:'file-camera', gallery:'file-gallery', files:'file-files', pdf:'file-pdf'};
  var input = $(map[kind]);
  if(!input){ toast('Not available for current model'); return; }
  input.click();
}

/* ============================================================
   API KEY MANAGER
   ============================================================ */
function detectProvider(key){
  // KYRO Auto-Provider Detection — accepts both Gemini and Sarvam API keys.
  // The user never picks a provider; the key format determines the backend.
  key=String(key||'').trim();
  if(/^(AIza[A-Za-z0-9_-]+|AQ\.[A-Za-z0-9_-]+)$/.test(key)){
    return {provider:'gemini',endpoint:'https://generativelanguage.googleapis.com/v1beta/models'};
  }
  if(/^sk_[A-Za-z0-9._-]{8,}$/.test(key)){
    return {provider:'sarvam',endpoint:'https://api.sarvam.ai/v1/chat/completions'};
  }
  return null;
}

/* ===== Sarvam helpers ===== */
function detectSarvamKey(key){
  key=String(key||'').trim();
  return /^sk_[A-Za-z0-9._-]{8,}$/.test(key);
}
function sarvamAuthHeaders(key){
  return {'Content-Type':'application/json','api-subscription-key':String(key||'').trim(),'Authorization':'Bearer '+String(key||'').trim()};
}
function sarvamAuthErrorMessage(status,message){
  status=Number(status)||0;
  if(status===400||status===401||status===403) return 'Connection authentication failed ('+status+'). Check the API key and access.';
  if(status===404) return 'API endpoint/model not found (404).';
  if(status===429) return 'Connection quota exceeded. Please wait for the quota reset or use a different key.';
  return 'Connection request failed ('+status+'). '+(message||'');
}
function persistSarvamApiKey(key){
  try{
    var clean=String(key||'').trim();
    if(clean) localStorage.setItem('kyroSarvamApiKeyV1',clean);
    else localStorage.removeItem('kyroSarvamApiKeyV1');
  }catch(e){ console.warn('KYRO Sarvam key storage:',e); }
}
function loadPersistedSarvamApiKey(){
  try{
    var clean=String(localStorage.getItem('kyroSarvamApiKeyV1')||'').trim();
    return /^sk_[A-Za-z0-9._-]{8,}$/.test(clean) ? clean : '';
  }catch(e){ return ''; }
}
function clearPersistedSarvamApiKey(){
  try{ localStorage.removeItem('kyroSarvamApiKeyV1'); }catch(e){}
}
function testSarvamApiKey(key){
  key=String(key||'').trim();
  if(!detectSarvamKey(key)) return Promise.resolve({ok:false,status:0,message:'Invalid key format.'});
  return fetch('https://api.sarvam.ai/v1/chat/completions',{
    method:'POST',headers:sarvamAuthHeaders(key),cache:'no-store',
    body:JSON.stringify({model:'sarvam-105b-conversations',messages:[{role:'user',content:'Reply with OK.'}],max_tokens:32,reasoning_effort:'low',stream:false})
  }).then(function(r){return r.text().then(function(raw){var j={};try{j=raw?JSON.parse(raw):{};}catch(e){};return {ok:r.ok,status:r.status,message:(j&&j.error&&j.error.message)||'',json:j};});})
   .catch(function(err){return {ok:false,status:0,message:(err&&err.message)||'Network/API access error'};});
}

/* ===== KYRO Auto Router =====
   Both connection keys may be saved at once. Chat never requires a manual
   provider switch: it automatically uses the available connection, preferring
   the current model's native route and falling back to the other connection.
*/
function kyroGetActiveApiKey(){
  var gk=loadPersistedGeminiApiKey(), sk=loadPersistedSarvamApiKey();
  var key=(state.apiKeys[0]&&state.apiKeys[0].key)||'';
  if(!key && gk) key=gk;
  if(!key && sk) key=sk;
  return key;
}
function kyroDetectActiveProvider(key){
  key=String(key||kyroGetActiveApiKey()||'').trim();
  if(/^(AIza[A-Za-z0-9_-]+|AQ\.[A-Za-z0-9_-]+)$/.test(key)) return 'gemini';
  if(/^sk_[A-Za-z0-9._-]{8,}$/.test(key)) return 'sarvam';
  return null;
}
function setActiveProvider(provider){
  provider=String(provider||'').toLowerCase();
  state.activeProvider = provider;
  return provider;
}
function kyroAutoRoute(){
  var gk=loadPersistedGeminiApiKey(), sk=loadPersistedSarvamApiKey();
  var model=state.activeModel||{};
  var route = (model.id==='kyro-vision'||model.id==='kyro-1'||model.id==='kyro-1-2') ? 'gemini' : 'sarvam';
  if(route==='gemini' && gk){ setActiveProvider('gemini'); return 'gemini'; }
  if(route==='sarvam' && sk){ setActiveProvider('sarvam'); return 'sarvam'; }
  if(gk){ setActiveProvider('gemini'); return 'gemini'; }
  if(sk){ setActiveProvider('sarvam'); return 'sarvam'; }
  return null;
}

function geminiAuthHeaders(key){
  return {
    'Content-Type':'application/json',
    'x-goog-api-key':String(key||'').trim()
  };
}

function geminiAuthErrorMessage(status, message){
  status=Number(status)||0;
  if(status===400){
    return 'Connection rejected (400). Check the API key and configuration.';
  }
  if(status===401){
    return 'Connection authentication failed (401). The API key is invalid, expired, blocked, or unsupported.';
  }
  if(status===403){
    return 'Connection access denied (403). Check API restrictions, permissions, billing/quota, or whether the API is enabled.';
  }
  if(status===404){
    return 'Endpoint/model not found (404). The API key may be valid, but the selected model is unavailable.';
  }
  if(status===429){
    return 'Connection quota/rate limit reached (429). Please wait and try again.';
  }
  if(status===0){
    return message || 'Connection test failed. Check your internet connection, browser network access, or API restrictions.';
  }
  return message || ('Gemini request failed ('+status+')');
}

/* API Manager persistence is intentionally limited to the API-key section.
   This keeps the key available after refresh/re-open on the same browser. */
function persistGeminiApiKey(key){
  try{
    var clean=String(key||'').trim();
    if(clean) localStorage.setItem('kyroGeminiApiKeyV2',clean);
    else localStorage.removeItem('kyroGeminiApiKeyV2');
  }catch(e){
    console.warn('KYRO API key storage:',e);
  }
}
function loadPersistedGeminiApiKey(){
  try{
    var clean=String(localStorage.getItem('kyroGeminiApiKeyV2')||'').trim();
    return /^(AIza[A-Za-z0-9_-]+|AQ\.[A-Za-z0-9_-]+)$/.test(clean) ? clean : '';
  }catch(e){ return ''; }
}
function ensureGeminiModelForSavedKey(){
  var gk=loadPersistedGeminiApiKey(), sk=loadPersistedSarvamApiKey();
  if(!gk && !sk) return false;
  if(window.state){
    if(gk){
      state.apiKeys=[{key:gk,provider:'gemini',endpoint:'https://generativelanguage.googleapis.com/v1beta/models'}];
      setActiveProvider('gemini');
    } else if(sk){
      state.apiKeys=[{key:sk,provider:'sarvam',endpoint:'https://api.sarvam.ai/v1/chat/completions'}];
      setActiveProvider('sarvam');
    }
    if(!state.activeModel || state.activeModel.provider==='Demo' || state.activeModel.id==='kyro-demo'){
      state.activeModel={id:'kyro-1',label:'KYRO 1',provider:'KYRO',desc:'Fast · multimodal',rawId:'gemini-3.5-flash-lite'};
    }
  }
  return true;
}

function clearPersistedGeminiApiKey(){
  try{ localStorage.removeItem('kyroGeminiApiKeyV2'); }catch(e){}
}

function testGeminiApiKey(key){
  key=String(key||'').trim();
  if(!key) return Promise.resolve({ok:false,status:0,message:'Paste your API key first.'});

  var endpoint='https://generativelanguage.googleapis.com/v1beta/models';
  return fetch(endpoint,{
    method:'GET',
    headers:geminiAuthHeaders(key),
    cache:'no-store'
  }).then(function(r){
    return r.text().then(function(raw){
      var j={};
      try{ j=raw?JSON.parse(raw):{}; }catch(e){}
      var msg=(j&&j.error&&j.error.message)||'';
      return {
        ok:r.ok,
        status:r.status,
        message:msg,
        json:j
      };
    });
  }).catch(function(err){
    return {
      ok:false,
      status:0,
      message:(err&&err.message)||'Network/API access error'
    };
  });
}

function renderApiKeys(){
  var wrap = $('api-key-list');
  if(!wrap) return;
  wrap.innerHTML = '';

  state.apiKeys.forEach(function(k, idx){
    var card = document.createElement('div');
    card.className = 'key-card';
    card.innerHTML =
      '<div class="key-card-top"><b>Active Connection</b><span class="key-badge">Connected</span></div>'+
      '<small>'+maskKey(k.key)+'</small>'+
      '<div class="key-card-row">'+
      '<button class="chip-btn" data-test="'+idx+'">Test Connection</button>'+
      '<button class="chip-btn danger" data-del="'+idx+'">Remove</button>'+
      '</div>';
    wrap.appendChild(card);
  });

  var builtInReady = typeof KYRO_BUILTIN_GEMINI_API_KEY === 'string' &&
    KYRO_BUILTIN_GEMINI_API_KEY.trim() &&
    KYRO_BUILTIN_GEMINI_API_KEY !== 'PASTE_YOUR_GEMINI_API_KEY_HERE';

  $('api-count-lbl').textContent =
    state.apiKeys.length ? 'Active Connection' :
    (builtInReady ? 'Built-in connection ready' : 'No API connected');

  wrap.querySelectorAll('[data-del]').forEach(function(b){
    b.addEventListener('click', function(){
      state.apiKeys.splice(+b.getAttribute('data-del'),1);
      if(!state.apiKeys.length){ clearPersistedGeminiApiKey(); clearPersistedSarvamApiKey(); }
      renderApiKeys();
      toast('Connection key removed');
    });
  });

  wrap.querySelectorAll('[data-test]').forEach(function(b){
    b.addEventListener('click', function(){
      var k=state.apiKeys[+b.getAttribute('data-test')];
      if(!k||!k.key){toast('No connection key found');return;}

      b.disabled=true;
      b.textContent='Testing…';
      toast('Testing connection…');

      var testFn = detectSarvamKey(k.key) ? testSarvamApiKey : testGeminiApiKey;
      testFn(k.key).then(function(res){
        b.disabled=false;
        b.textContent='Test Connection';

        if(res.ok){
          $('api-detect-note').textContent='Connection is valid and reachable.';
          toast('Connection works ✓');
        }else{
          $('api-detect-note').textContent=geminiAuthErrorMessage(res.status,res.message);
          toast(geminiAuthErrorMessage(res.status,res.message));
        }
      });
    });
  });
}

function maskKey(k){
  k=String(k||'');
  if(k.length<=8) return '••••••••';
  return k.slice(0,6)+'••••••••'+k.slice(-4);
}

function maskKey(k){
  if(k.length<=8) return '••••••••';
  return k.slice(0,6)+'••••••••'+k.slice(-4);
}

/* ============================================================
   BACKUP / RESTORE  (plain JSON export today — see notes)
   ============================================================ */
function doBackup(){
  var data = {chats:state.chats, projects:state.projects, themePref:state.themePref, userName:state.userName, userPhoto:state.userPhoto, apiKeys:state.apiKeys};
  var blob = new Blob([JSON.stringify(data)], {type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'kyro-backup.kyro';
  a.click();
  toast('Backup saved');
}
var restoreInput;
function doRestore(){
  if(!restoreInput){
    restoreInput = document.createElement('input');
    restoreInput.type = 'file';
    restoreInput.accept = '.kyro,application/json';
    restoreInput.addEventListener('change', function(){
      var f = restoreInput.files[0];
      if(!f) return;
      var reader = new FileReader();
      reader.onload = function(e){
        try{
          var data = JSON.parse(e.target.result);
          state.chats = data.chats || state.chats;
          state.projects = data.projects || state.projects;
          state.userName = data.userName || state.userName;
          state.apiKeys = data.apiKeys || state.apiKeys;
          if(state.apiKeys && state.apiKeys[0] && state.apiKeys[0].key) persistGeminiApiKey(state.apiKeys[0].key);
          applyTheme(data.themePref || state.themePref);
          renderSidebarChats(); renderApiKeys();
          toast('Restore complete');
        }catch(err){ toast('That file could not be read'); }
      };
      reader.readAsText(f);
    });
  }
  restoreInput.click();
}

/* ============================================================
   PLUGINS / PROJECTS / LIBRARY (lightweight panels)
   ============================================================ */
var PLUGINS = [
  {name:'Vision', desc:'Understand images', icon:'image', on:true},
  {name:'OCR', desc:'Read text from images', icon:'scan', on:false},
  {name:'PDF Reader', desc:'Summarise documents', icon:'file', on:true},
  {name:'Translator', desc:'Translate text', icon:'globe', on:false},
  {name:'Code', desc:'Write &amp; explain code', icon:'edit', on:true},
  {name:'Maps', desc:'Places &amp; directions', icon:'pin', on:false},
  {name:'Weather', desc:'Forecasts', icon:'sun', on:false}
];
function renderPlugins(){
  var wrap = $('plugins-list');
  wrap.innerHTML = '';
  PLUGINS.forEach(function(p){
    var row = document.createElement('div');
    row.className = 'set-item';
    row.innerHTML = '<svg class="icon"><use href="#i-'+p.icon+'"/></svg><div class="lbl"><b>'+p.name+'</b><small>'+p.desc+'</small></div><div class="toggle '+(p.on?'on':'')+'"></div>';
    row.querySelector('.toggle').addEventListener('click', function(){ p.on=!p.on; renderPlugins(); });
    wrap.appendChild(row);
  });
}
var KYRO_PROJECT_DEFAULTS = [
  {name:'Green Croma', date:'July 29', icon:'star', tone:'green'},
  {name:'पोस्टर', date:'July 26', icon:'edit', tone:'purple'},
  {name:'Global Car Lab 🌍', date:'July 13', icon:'globe', tone:'green'},
  {name:'study lab', date:'July 2', icon:'file', tone:'red'},
  {name:'Voiceovers tons', date:'June 29', icon:'edit', tone:'purple'},
  {name:'Phone Infographic Content', date:'May 2', icon:'scan', tone:'gold'},
  {name:'Car 🚘🚘 wallpapers', date:'May 2', icon:'star', tone:'pink'}
];
function ensureProjectDemoData(){
  if(!Array.isArray(state.projects)) state.projects=[];
  if(state.projects.length===0){
    state.projects = KYRO_PROJECT_DEFAULTS.map(function(x){
      return {name:x.name, date:x.date, icon:x.icon, tone:x.tone, chats:[], owner:'mine', shared:false};
    });
  }
}
function renderProjects(){
  var wrap = $('projects-list'), empty=$('kyro-projects-empty');
  if(!wrap) return;
  ensureProjectDemoData();
  var filter = window.kyroProjectFilter || 'all';
  var search = String(window.kyroProjectSearch || '').trim().toLowerCase();
  var list = state.projects.filter(function(p){
    var owner = p.owner || (p.shared ? 'shared' : 'mine');
    if(filter==='mine' && owner!=='mine') return false;
    if(filter==='shared' && owner!=='shared') return false;
    return !search || String(p.name||'').toLowerCase().indexOf(search)!==-1;
  });
  wrap.innerHTML='';
  list.forEach(function(p, idx){
    var row=document.createElement('button');
    row.type='button';
    row.className='kyro-project-row';
    var tone=p.tone||KYRO_PROJECT_DEFAULTS[idx % KYRO_PROJECT_DEFAULTS.length].tone;
    var icon=p.icon||'folder';
    var date=p.date||'Today';
    var chats=Array.isArray(p.chats)?p.chats.length:0;
    row.innerHTML='<span class="kyro-project-icon tone-'+tone+'"><svg class="icon"><use href="#i-'+icon+'"/></svg></span>'+
      '<span class="kyro-project-copy"><strong>'+escapeHtml(p.name||'Untitled project')+'</strong><small>'+escapeHtml(date)+'</small></span>';
    row.addEventListener('click',function(){
      if(p.chats && p.chats.length) toast(p.name+' • '+chats+' chat'+(chats===1?'':'s'));
      else toast('Opened '+p.name);
    });
    wrap.appendChild(row);
  });
  if(empty) empty.hidden=list.length>0;
}
function openProjectsPage(){
  var sm=$('modal-settings'); if(!sm) return;
  try{closeSheets();}catch(_){ }
  sm.classList.remove('kyro-library-mode','kyro-scheduled-mode');
  sm.classList.add('kyro-projects-mode','show');
  showSettingsPanel('projects');
  if($('panel-projects')) $('panel-projects').hidden=false;
  renderProjects();
}
function exitProjects(){
  var sm=$('modal-settings');
  try{kyroProjectCreatePage(false);}catch(_){ }
  if(sm) sm.classList.remove('kyro-projects-mode');
  showSettingsPanel('root');
}

function renderLibrary(){
  var grid = $('kyro-library-grid');
  var empty = $('kyro-library-empty');
  if(!grid) return;
  var filter = state.libraryFilter || 'all';
  var search = String(state.librarySearch || '').trim().toLowerCase();
  var deleted = filter === 'deleted';
  var source = deleted ? (state.libraryDeleted || []) : (state.library || []);
  var folders = deleted ? [] : (state.libraryFolders || []);
  var items = [];

  folders.forEach(function(f){
    if(!search || String(f.name||'').toLowerCase().indexOf(search)!==-1) items.push(Object.assign({kind:'folder'}, f));
  });
  source.forEach(function(a){
    var type = String(a.type || '');
    var isImage = /^image\\//i.test(type) || !!a.dataUrl && !a.fileIcon;
    if(!deleted && filter==='images' && !isImage) return;
    if(!deleted && filter==='files' && isImage) return;
    var name = a.name || a.fileName || 'Untitled file';
    if(search && String(name).toLowerCase().indexOf(search)===-1) return;
    items.push(Object.assign({kind:'file'}, a));
  });

  grid.className = 'kyro-library-grid '+((state.libraryView==='grid')?'is-grid':'is-list');
  grid.innerHTML = '';
  items.forEach(function(item, idx){
    var card=document.createElement('article');
    card.className='kyro-library-item '+(item.kind==='folder'?'is-folder':'is-file');
    card.dataset.kind=item.kind;
    card.dataset.index=String(idx);
    card.dataset.name=item.name||'Untitled';
    card.dataset.libraryId=id;
    var selected = state.librarySelected.indexOf(item._libraryId || item.id || item.name) >= 0;
    var id = item._libraryId || item.id || ((item.kind||'file')+'-'+idx+'-'+(item.name||''));
    item._libraryId=id;
    var icon = item.kind==='folder' ? '<svg class="icon item-icon"><use href="#i-folder"/></svg>' : '';
    var preview='';
    if(item.kind==='file' && item.dataUrl && /^image\\//i.test(String(item.type||''))){
      preview='<img class="kyro-library-thumb" src="'+item.dataUrl+'" alt="">';
    }
    if(item.kind==='file' && !preview){
      preview='<div class="kyro-library-fileicon"><svg class="icon"><use href="#i-'+(String(item.type||'').indexOf('pdf')>=0?'file':'globe')+'"/></svg></div>';
    }
    var selectBox=state.librarySelectMode ? '<button type="button" class="kyro-library-check '+(selected?'checked':'')+'" data-library-select="'+id+'" aria-label="Select '+escapeHtml(item.name||'item')+'">'+(selected?'✓':'')+'</button>' : '';
    card.innerHTML = selectBox + (preview || icon) + '<div class="kyro-library-item-text"><strong>'+escapeHtml(item.name||'Untitled')+'</strong>' +
      (item.kind==='file' ? '<small>'+escapeHtml(item.modified || 'Modified today')+'</small>' : '') + '</div>' +
      '<button type="button" class="kyro-library-item-more" data-library-more="'+id+'" aria-label="More options"><svg class="icon"><use href="#i-more"/></svg></button>';
    if(item.kind==='folder') card.addEventListener('click',function(e){ if(e.target.closest('.kyro-library-item-more')||e.target.closest('.kyro-library-check')) return; toast('Opened folder: '+item.name); });
    grid.appendChild(card);
  });
  empty.hidden = items.length>0;
  if(empty) empty.classList.toggle('is-deleted', deleted);
  var check=$('kyro-library-list-check'); if(check) check.textContent=state.libraryView==='list'?'✓':'';
  var selectbar=$('kyro-library-selectbar'); if(selectbar) selectbar.hidden=!state.librarySelectMode;
}


/* ============================================================
   VOICE — SpeechRecognition + animated recording waveform
   ============================================================ */
var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = null;
var voiceWaveTimer = null;

function buildVoiceWave(){
  var bars = '';
  for(var i=0;i<14;i++){
    bars += '<span style="animation-delay:'+(-i*0.07)+'s;animation-duration:'+(0.48+(i%4)*0.08)+'s"></span>';
  }
  return '<div class="waveform" aria-label="Listening">'+bars+'</div><svg class="icon" style="margin-left:4px;"><use href="#i-stop"/></svg>';
}
function setMicLive(on){
  var b=$('btn-mic');
  if(!b) return;
  b.classList.toggle('live',!!on);
  b.setAttribute('aria-label',on?'Stop listening':'Voice input');
  b.innerHTML=on ? buildVoiceWave() : '<svg class="icon"><use href="#i-mic"/></svg>';
}
function stopVoiceUI(){
  state.recognizing=false;
  if(voiceWaveTimer){ clearInterval(voiceWaveTimer); voiceWaveTimer=null; }
  setMicLive(false);
}
if(SR){
  recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = (navigator.language || 'en-US');
  recognition.onresult = function(e){
    var t = '';
    for(var i=0;i<e.results.length;i++) t += e.results[i][0].transcript;
    els['msg-input'].value = t;
    autoExpand(els['msg-input']);
    updateSendBtn();
  };
  recognition.onend = function(){
    /* Chrome can end recognition after a pause; keep the visual state
       only when the user has not explicitly stopped it. */
    if(state.recognizing){
      try{ recognition.start(); return; }catch(e){}
    }
    stopVoiceUI();
  };
  recognition.onerror = function(e){
    if(e && e.error==='aborted') return;
    if(e && e.error==='no-speech' && state.recognizing){
      try{ recognition.start(); return; }catch(err){}
    }
    stopVoiceUI();
    toast('Voice input error');
  };
}
function toggleMic(){
  if(state.recognizing){
    try{ if(recognition) recognition.stop(); }catch(e){}
    stopVoiceUI();
    return;
  }
  if(!recognition){
    toast("Voice input isn't supported in this browser");
    return;
  }
  try{
    recognition.start();
    state.recognizing=true;
    setMicLive(true);
  }catch(err){
    stopVoiceUI();
    toast('Could not start microphone');
  }
}

/* ============================================================
   EVENTS
   ============================================================ */
function wireEvents(){
  /* Legacy onboarding was removed in the login-first build.
     Do not bind listeners to the old onboarding DOM. */
  $('btn-sidebar').addEventListener('click', openSidebar);
  $('sb-close-btn').addEventListener('click', closeSidebar);
  $('sidebar-overlay').addEventListener('click', closeSidebar);

  /* Sidebar gestures:
     - start near the left edge and swipe right -> open
     - swipe left anywhere on the open sidebar -> close
     - vertical movement is ignored so normal page scrolling remains intact
  */
  var swipeStartX=0, swipeStartY=0, swipeTracking=false;
  var swipeAxisLocked=false;

  /* Main app: a horizontal swipe can start anywhere on the screen.
     Vertical movement remains a normal scroll gesture. */
  $('main').addEventListener('touchstart', function(e){
    if(!e.touches || !e.touches[0]) return;
    var t=e.touches[0];
    swipeStartX=t.clientX;
    swipeStartY=t.clientY;
    swipeTracking=true;
    swipeAxisLocked=false;
  }, {passive:true});

  $('main').addEventListener('touchmove', function(e){
    if(!swipeTracking || !e.touches || !e.touches[0]) return;
    var t=e.touches[0];
    var dx=t.clientX-swipeStartX, dy=t.clientY-swipeStartY;
    if(!swipeAxisLocked && (Math.abs(dx)>10 || Math.abs(dy)>10)){
      swipeAxisLocked=true;
      if(Math.abs(dy) >= Math.abs(dx)){
        swipeTracking=false; /* preserve vertical page scrolling */
      }
    }
  }, {passive:true});

  $('main').addEventListener('touchend', function(e){
    if(!swipeTracking) return;
    var t=e.changedTouches[0];
    var dx=t.clientX-swipeStartX, dy=t.clientY-swipeStartY;
    if(dx >= 70 && Math.abs(dy) <= 110) openSidebar();
    swipeTracking=false;
    swipeAxisLocked=false;
  }, {passive:true});

  /* Open sidebar -> swipe left anywhere inside the sidebar to close. */
  $('sidebar').addEventListener('touchstart', function(e){
    if(!e.touches || !e.touches[0]) return;
    var t=e.touches[0];
    swipeStartX=t.clientX;
    swipeStartY=t.clientY;
    swipeTracking=true;
    swipeAxisLocked=false;
  }, {passive:true});

  $('sidebar').addEventListener('touchmove', function(e){
    if(!swipeTracking || !e.touches || !e.touches[0]) return;
    var t=e.touches[0];
    var dx=t.clientX-swipeStartX, dy=t.clientY-swipeStartY;
    if(!swipeAxisLocked && (Math.abs(dx)>10 || Math.abs(dy)>10)){
      swipeAxisLocked=true;
      if(Math.abs(dy) >= Math.abs(dx)){
        swipeTracking=false;
      }
    }
  }, {passive:true});

  $('sidebar').addEventListener('touchend', function(e){
    if(!swipeTracking) return;
    var t=e.changedTouches[0];
    var dx=t.clientX-swipeStartX, dy=t.clientY-swipeStartY;
    if(dx <= -70 && Math.abs(dy) <= 110) closeSidebar();
    swipeTracking=false;
    swipeAxisLocked=false;
  }, {passive:true});
  $('sb-newchat').addEventListener('click', function(){ newChat(); closeSidebar(); });
  $('sb-search-btn').addEventListener('click', function(){ toast('Search coming in the next pass'); });

  $('nav-projects').addEventListener('click', function(){ openProjectsPage(); closeSidebar(); });
  $('nav-scheduled').addEventListener('click', function(){ toast('Scheduled chats — coming soon'); });
  $('nav-plugins').addEventListener('click', function(){ openModal('modal-settings'); showSettingsPanel('plugins'); renderPlugins(); });
  $('nav-library').addEventListener('click', function(){ if(window.kyroOpenLibrary){ window.kyroOpenLibrary(); } else { openModal('modal-settings'); showSettingsPanel('library'); renderLibrary(); } });
  $('nav-settings').addEventListener('click', function(){ openModal('modal-settings'); showSettingsPanel('root'); closeSidebar(); });
  $('nav-help').addEventListener('click', function(){
    openModal('modal-help');
    closeSidebar();
  });
  $('nav-about').addEventListener('click', function(){ openModal('modal-about'); closeSidebar(); });
  $('nav-logout').addEventListener('click', function(){
    if(confirm('Log out of this local profile?')){
      try{
        localStorage.removeItem('kyroRememberedLogin');
        localStorage.setItem('kyroExplicitLogout','1');
      }catch(e){}
      state.userName=''; state.chats=[]; state.activeChatId=null;
      window.kyroLoginApproved=false;
      closeSidebar(); $('app').hidden = true;
      var gate=$('firebase-auth-gate'); if(gate) gate.hidden = false;
    }
  });

  function positionProfilePopover(){
    var btn=$('btn-profile'), panel=$('sheet-profile');
    if(!btn || !panel) return;
    var r=btn.getBoundingClientRect();
    var width=Math.min(380, Math.max(280, window.innerWidth-28));

    /* Reference geometry: the panel's right side sits about 70px from the
       viewport edge and its top starts just below the three-dot button. */
    var targetRight = Math.round(window.innerWidth - 70);
    var left = targetRight - width;
    left = Math.max(14, Math.min(window.innerWidth-width-14, left));

    var top = Math.round(r.bottom + 34);
    var height = Math.min(680, Math.max(320, window.innerHeight-28));
    if(top + height > window.innerHeight - 14){
      top = Math.max(14, window.innerHeight - height - 14);
    }

    panel.style.setProperty('width',Math.round(width)+'px','important');
    panel.style.setProperty('min-width',Math.round(width)+'px','important');
    panel.style.setProperty('max-width',Math.round(width)+'px','important');
    panel.style.setProperty('height',Math.round(height)+'px','important');
    panel.style.setProperty('min-height',Math.round(height)+'px','important');
    panel.style.setProperty('max-height',Math.round(height)+'px','important');
    panel.style.setProperty('left',Math.round(left)+'px','important');
    panel.style.setProperty('top',Math.round(top)+'px','important');
    panel.style.setProperty('right','auto','important');
    panel.style.setProperty('bottom','auto','important');
  }
  window.addEventListener('resize', function(){ if($('sheet-profile').classList.contains('show')) positionProfilePopover(); });
  window.positionProfilePopover = positionProfilePopover;

  var topNewChat=$('btn-top-newchat');
  if(topNewChat){
    topNewChat.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      try{ closeSheets(); }catch(err){}
      try{ newChat(); }catch(err){ console.error(err); }
    });
  }

  $('btn-profile').addEventListener('click', function(e){
    e.stopPropagation();
    var actions=$('profile-actions-list');
    var title=$('profile-sheet-title');
    if(actions) actions.hidden = false;
    var c=activeChat();
    if(title) title.textContent = c && c.title ? c.title : 'Chat actions';
    positionProfilePopover();
    openSheet('sheet-profile');
  });
  /* Profile photo lives in the sidebar header. Tapping that small photo
     opens the same local image picker and updates the chat/profile photo. */
  $('sb-profile-mini').addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();
    if(window.kyroOpenProfilePage) window.kyroOpenProfilePage();
  });
  $('file-profile').addEventListener('change', function(){
    var file=this.files && this.files[0];
    if(!file) return;
    if(!file.type || file.type.indexOf('image/')!==0){
      toast('Please choose an image');
      this.value='';
      return;
    }
    var reader=new FileReader();
    reader.onload=function(e){
      state.userPhoto=e.target.result;
      try{ localStorage.setItem('kyroUserPhoto', state.userPhoto); }catch(err){}
      renderProfilePhoto();
      if(window.kyroSyncProfilePage) window.kyroSyncProfilePage();
      toast('Profile photo updated');
    };
    reader.readAsDataURL(file);
    this.value='';
  });

  /* Profile photo is changed from the existing profile/photo control only.
     The top-right button is now the three-dot quick-action menu. */


  $('profile-pin-action').addEventListener('click', function(){
    var c = activeChat();
    if(!c){ toast('No chat to pin'); return; }
    if(!c.pinned){
      var count = state.chats.filter(function(x){ return !!x.pinned; }).length;
      if(count >= 10){
        toast('Only 10 chats can be pinned');
        return;
      }
    }
    c.pinned = !c.pinned;
    renderSidebarChats();
    toast(c.pinned ? 'Chat pinned' : 'Chat unpinned');
    closeSheets();
  });

  $('profile-share-action').addEventListener('click', function(){
    var c = activeChat();
    if(!c){ toast('No chat to share'); return; }
    shareChat(c);
    closeSheets();
  });

  $('profile-project-action').addEventListener('click', function(){
    var c = activeChat();
    if(!c){ toast('No chat to add'); return; }
    var name = prompt('Project name');
    if(!name) return;
    var project = state.projects.find(function(p){ return p.name.toLowerCase() === name.toLowerCase(); });
    if(!project){
      project = {name:name, chats:[]};
      state.projects.push(project);
    }
    if(project.chats.indexOf(c.id)===-1) project.chats.push(c.id);
    renderProjects();
    toast('Chat added to '+project.name);
    closeSheets();
  });

  $('profile-upload-action').addEventListener('click', function(){
    closeSheets();
    triggerAttach('files');
  });
  $('profile-find-action').addEventListener('click', function(){
    var c=activeChat();
    closeSheets();
    if(!c){ toast('No chat to search'); return; }
    var q=prompt('Find in chat');
    if(!q) return;
    var found=false;
    (c.messages||[]).forEach(function(m){
      if(String(m.text||'').toLowerCase().indexOf(q.toLowerCase())!==-1) found=true;
    });
    toast(found ? 'Match found in this chat' : 'No match found');
  });

  $('profile-home-action').addEventListener('click', function(){
    closeSheets();
    toast('Add to home is available from your browser/app menu');
  });

  $('profile-archive-action').addEventListener('click', function(){
    var c=activeChat();
    if(!c){ toast('No chat to archive'); return; }
    c.archived=true;
    renderSidebarChats();
    toast('Chat archived');
    closeSheets();
  });

  $('profile-delete-action').addEventListener('click', function(){
    var c=activeChat();
    if(!c){ toast('No chat to delete'); return; }
    if(!confirm('Delete this chat?')) return;
    var idx=state.chats.indexOf(c);
    if(idx>=0) state.chats.splice(idx,1);
    state.activeChatId=state.chats.length ? state.chats[Math.max(0,idx-1)].id : null;
    renderSidebarChats();
    closeSheets();
    if(typeof renderChat==='function') renderChat();
    toast('Chat deleted');
  });

  function positionModelDropdown(){
    var btn = $('btn-model'), panel = $('modal-model');
    if(!btn || !panel) return;
    var r = btn.getBoundingClientRect();
    var width = Math.round(r.width);
    var left = Math.max(12, Math.min(window.innerWidth - width - 12, Math.round(r.left)));
    var top = Math.round(r.bottom + 2);
    panel.style.setProperty('left', left + 'px', 'important');
    panel.style.setProperty('top', top + 'px', 'important');
    panel.style.setProperty('right', 'auto', 'important');
    panel.style.setProperty('bottom', 'auto', 'important');
    panel.style.setProperty('--kyro-v30-model-width', width + 'px');
  }
  $('btn-model').addEventListener('click', function(){
    var modal = $('modal-model');
    if(modal.classList.contains('show')) closeModals();
    else {
      openModal('modal-model');
      requestAnimationFrame(positionModelDropdown);
      setTimeout(positionModelDropdown, 40);
    }
  });
  window.addEventListener('resize', function(){
    if($('modal-model') && $('modal-model').classList.contains('show')) positionModelDropdown();
  });
  window.addEventListener('scroll', function(){
    if($('modal-model') && $('modal-model').classList.contains('show')) positionModelDropdown();
  }, {passive:true});
  $('model-modal-close').addEventListener('click', closeModals);

  /* Model popover: close by downward swipe or tapping outside it.
     It stays anchored directly under the KYRO model chip. */
  (function wireModelPopoverGestures(){
    var panel = $('modal-model');
    if(!panel) return;
    var sx=0, sy=0, tracking=false;
    panel.addEventListener('touchstart', function(e){
      if(!e.touches || !e.touches[0]) return;
      sx=e.touches[0].clientX; sy=e.touches[0].clientY; tracking=true;
    }, {passive:true});
    panel.addEventListener('touchmove', function(e){
      if(!tracking || !e.touches || !e.touches[0]) return;
      var dx=e.touches[0].clientX-sx, dy=e.touches[0].clientY-sy;
      if(Math.abs(dx)>Math.abs(dy)+8 || dy<0) tracking=false;
    }, {passive:true});
    panel.addEventListener('touchend', function(e){
      if(!tracking) return;
      var t=e.changedTouches[0], dy=t.clientY-sy, dx=t.clientX-sx;
      if(dy>55 && Math.abs(dx)<90) closeModals();
      tracking=false;
    }, {passive:true});

    document.addEventListener('touchstart', function(e){
      if(!panel.classList.contains('show') || !e.touches || !e.touches[0]) return;
      var r=panel.getBoundingClientRect(), t=e.touches[0];
      if(t.clientX<r.left || t.clientX>r.right || t.clientY<r.top || t.clientY>r.bottom){
        panel.__outsideTouch=true;
      }else{
        panel.__outsideTouch=false;
      }
    }, {passive:true});
    document.addEventListener('touchend', function(){
      if(panel.classList.contains('show') && panel.__outsideTouch) closeModals();
      panel.__outsideTouch=false;
    }, {passive:true});
  })();
  /* Web Search — the whole Settings row is clickable, not only the small toggle.
     Keep one shared action so tapping the row or toggle always behaves identically. */
  function toggleWebSearchSetting(){
    if(state.activeModel && state.activeModel.provider==='Demo'){
      toast('Switch to a KYRO mode for Web Search');
      return;
    }
    state.webSearch = !state.webSearch;
    updateCapabilityUI();
    try{ if(typeof scheduleSave==='function') scheduleSave(); }catch(_){ }
    toast(state.webSearch ? 'Web Search enabled' : 'Web Search disabled');
  }
  $('settings-web-search').addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    toggleWebSearchSetting();
  });
  $('settings-close').addEventListener('click', function(){
    if(window.kyroSettingsReturnToProfile) closeSettingsFromProfile();
    else closeModals();
  });
  $('modal-backdrop').addEventListener('click', function(){
    if(window.kyroSettingsReturnToProfile) closeSettingsFromProfile();
    else closeModals();
  });
  $('settings-back').addEventListener('click', function(){
    if(window.kyroSettingsReturnToProfile) closeSettingsFromProfile();
    else showSettingsPanel('root');
  });
  document.querySelectorAll('#settings-root [data-panel]').forEach(function(b){
    b.addEventListener('click', function(){
      var p = b.getAttribute('data-panel');
      showSettingsPanel(p);
      if(p==='api') renderApiKeys();
      if(p==='models') buildModelList();
    });
  });
  $('btn-backup').addEventListener('click', doBackup);
  $('btn-restore').addEventListener('click', doRestore);
  var kyroProjectCreateState={icon:'folder',tone:'gray',memory:'default'};
  var KYRO_PROJECT_ICONS=['folder','dollar','book','graduation','pen','pencil','code','terminal','music','gift','palette','heart','stethoscope','bag','chart','dumbbell','note','scale','globe','plane','wrench','paw','flask','brain','star'];
  function kyroProjectCreatePage(show){
    var list=$('kyro-projects-page'),create=$('kyro-project-create-page'); if(!list||!create)return;
    list.hidden=!!show; create.hidden=!show;
    if(show){var inp=$('kyro-project-name-input');if(inp){inp.value='';setTimeout(function(){inp.focus();},80);}kyroProjectCreateState={icon:'folder',tone:'gray',memory:'default'};updateKyroProjectCreateUI();}
  }
  function updateKyroProjectCreateUI(){
    var inp=$('kyro-project-name-input'),btn=$('kyro-project-create-submit');if(btn)btn.disabled=!String(inp&&inp.value||'').trim();
    var preview=$('kyro-project-picker-preview-icon');if(preview)preview.innerHTML='<use href="#i-'+kyroProjectCreateState.icon+'"/>';
    document.querySelectorAll('.kyro-project-color').forEach(function(b){b.classList.toggle('selected',b.dataset.projectTone===kyroProjectCreateState.tone);});
    document.querySelectorAll('.kyro-memory-option').forEach(function(b){var r=b.querySelector('input');b.classList.toggle('selected',!!r&&r.value===kyroProjectCreateState.memory);});
  }
  function openKyroProjectIconPicker(){
    var m=$('kyro-project-icon-modal');if(!m)return;var grid=$('kyro-project-icon-grid');
    if(grid&&!grid.dataset.ready){grid.innerHTML='';KYRO_PROJECT_ICONS.forEach(function(icon){var b=document.createElement('button');b.type='button';b.className='kyro-project-icon-choice';b.dataset.projectIcon=icon;var svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),use=document.createElementNS('http://www.w3.org/2000/svg','use');svg.classList.add('icon');use.setAttribute('href','#i-'+icon);svg.appendChild(use);b.appendChild(svg);grid.appendChild(b);});grid.dataset.ready='1';}
    m.hidden=false;updateKyroProjectCreateUI();
  }
  function createKyroProject(){kyroProjectCreatePage(true);}
  function saveKyroProjectFromCreate(){
    var inp=$('kyro-project-name-input'),name=String(inp&&inp.value||'').trim();if(!name)return;
    state.projects=Array.isArray(state.projects)?state.projects:[];
    if(state.projects.some(function(p){return String(p.name||'').toLowerCase()===name.toLowerCase();})){toast('Project already exists');return;}
    state.projects.push({id:'p'+Date.now(),name:name,chats:[],owner:'mine',shared:false,date:'Today',icon:kyroProjectCreateState.icon,tone:kyroProjectCreateState.tone,memory:kyroProjectCreateState.memory});
    save();renderProjects();kyroProjectCreatePage(false);toast('Project created');
  }
  var projectAdd=$('kyro-projects-add');
  if(projectAdd) projectAdd.addEventListener('click',createKyroProject);
  var projectCreateBack=$('kyro-project-create-back');if(projectCreateBack)projectCreateBack.addEventListener('click',function(){kyroProjectCreatePage(false);});
  var projectNameInput=$('kyro-project-name-input');if(projectNameInput)projectNameInput.addEventListener('input',updateKyroProjectCreateUI);
  var projectCreateSubmit=$('kyro-project-create-submit');if(projectCreateSubmit)projectCreateSubmit.addEventListener('click',saveKyroProjectFromCreate);
  var projectIconTrigger=$('kyro-project-icon-trigger');if(projectIconTrigger)projectIconTrigger.addEventListener('click',openKyroProjectIconPicker);
  var projectIconModal=$('kyro-project-icon-modal');if(projectIconModal)projectIconModal.addEventListener('click',function(e){if(e.target===projectIconModal)projectIconModal.hidden=true;});
  document.querySelectorAll('.kyro-project-color').forEach(function(b){b.addEventListener('click',function(){kyroProjectCreateState.tone=b.dataset.projectTone||'gray';updateKyroProjectCreateUI();});});
  document.addEventListener('click',function(e){
    var choice=e.target.closest&&e.target.closest('.kyro-project-icon-choice');if(choice){kyroProjectCreateState.icon=choice.dataset.projectIcon||'folder';updateKyroProjectCreateUI();return;}
    var preset=e.target.closest&&e.target.closest('[data-project-preset]');if(preset){var inp=$('kyro-project-name-input');if(inp&&!String(inp.value).trim())inp.value=preset.dataset.projectPreset||'';kyroProjectCreateState.icon=preset.dataset.projectIcon||'folder';kyroProjectCreateState.tone=preset.dataset.projectTone||'gray';document.querySelectorAll('.kyro-project-category').forEach(function(x){x.classList.remove('selected');});preset.classList.add('selected');updateKyroProjectCreateUI();}
  });
  var projectIconOk=$('kyro-project-icon-ok');if(projectIconOk)projectIconOk.addEventListener('click',function(){var m=$('kyro-project-icon-modal');if(m)m.hidden=true;});
  var projectMore=$('kyro-project-more-options');if(projectMore)projectMore.addEventListener('click',function(){var m=$('kyro-project-memory-modal');if(m)m.hidden=false;});
  var memoryModal=$('kyro-project-memory-modal');if(memoryModal)memoryModal.addEventListener('click',function(e){if(e.target===memoryModal)memoryModal.hidden=true;});
  document.querySelectorAll('.kyro-memory-option input').forEach(function(r){r.addEventListener('change',function(){kyroProjectCreateState.memory=r.value;updateKyroProjectCreateUI();});});
  var memoryOk=$('kyro-project-memory-ok');if(memoryOk)memoryOk.addEventListener('click',function(){var m=$('kyro-project-memory-modal');if(m)m.hidden=true;});
  var oldProjectAdd=$('add-project-btn');
  if(oldProjectAdd) oldProjectAdd.addEventListener('click',createKyroProject);
  document.querySelectorAll('[data-project-filter]').forEach(function(b){
    b.addEventListener('click',function(){
      window.kyroProjectFilter=b.getAttribute('data-project-filter')||'all';
      document.querySelectorAll('[data-project-filter]').forEach(function(x){x.classList.remove('active');});
      b.classList.add('active');
      renderProjects();
    });
  });
  var projectSearch=$('kyro-projects-search');
  if(projectSearch) projectSearch.addEventListener('input',function(){window.kyroProjectSearch=projectSearch.value;renderProjects();});
  var projectBack=$('kyro-projects-back');
  if(projectBack) projectBack.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();exitProjects();});

  $('toggle-fontscale').addEventListener('click', function(){ state.fontScale=!state.fontScale; this.classList.toggle('on'); document.body.style.fontSize = state.fontScale?'16.5px':'15px'; });
  $('toggle-contrast').addEventListener('click', function(){ state.highContrast=!state.highContrast; this.classList.toggle('on'); document.documentElement.style.filter = state.highContrast?'contrast(1.18)':'none'; });
  $('toggle-tts').addEventListener('click', function(){ state.ttsAuto=!state.ttsAuto; this.classList.toggle('on'); });
  $('toggle-applock').addEventListener('click', function(){ state.appLock=!state.appLock; this.classList.toggle('on'); toast(state.appLock?'App lock armed for next launch (demo)':'App lock off'); });

  $('api-key-toggle-vis').addEventListener('click', function(){
    var inp = $('api-key-input');
    inp.type = inp.type==='password' ? 'text' : 'password';
    this.innerHTML = '<svg class="icon icon-sm"><use href="#i-'+(inp.type==='password'?'eye':'eyeoff')+'"/></svg>';
  });
  $('api-key-add').addEventListener('click', function(){
    var btn=this;
    var val = $('api-key-input').value.trim();

    if(!val){
      $('api-detect-note').textContent='Paste your API key first.';
      toast('Paste a key first');
      return;
    }

    var det = detectProvider(val);
    if(!det){
      $('api-detect-note').textContent='Invalid key format. Paste a valid API key.';
      toast('Invalid key format');
      return;
    }

    btn.disabled=true;
    btn.textContent='Checking API…';
    $('api-detect-note').textContent='Checking the connection…';

    var testFn = det.provider==='sarvam' ? testSarvamApiKey : testGeminiApiKey;
    testFn(val).then(function(res){
      btn.disabled=false;
      btn.textContent='Add API Key';

      if(!res.ok){
        var msg = det.provider==='sarvam' ? sarvamAuthErrorMessage(res.status,res.message) : geminiAuthErrorMessage(res.status,res.message);
        $('api-detect-note').textContent=msg;
        toast(msg);
        return;
      }

      // Keep exactly one active key and make it the first key used by chat.
      state.apiKeys=[{key:val,provider:det.provider,endpoint:det.endpoint}];
      if(det.provider==='sarvam'){
        persistSarvamApiKey(val);
      } else {
        persistGeminiApiKey(val);
      }
      setActiveProvider(det.provider);
      state.activeModel={id:'kyro-1',label:'KYRO 1',provider:'KYRO',desc:'Fast · multimodal',rawId:'gemini-3.5-flash-lite'};
      var modelChip=$('model-chip-label'); if(modelChip) modelChip.textContent='KYRO 1';

      $('api-key-input').value='';
      $('api-detect-note').textContent='Connected successfully. The key is saved on this browser and will be used for live AI requests.';
      renderApiKeys();
      toast('Connection established ✓');
    });
  });

  $('about-close').addEventListener('click', closeModals);
  $('help-close').addEventListener('click', closeModals);


  $('btn-attach').addEventListener('click', function(){ openSheet('sheet-attach'); });
  $('sheet-backdrop').addEventListener('click', closeSheets);
  document.querySelectorAll('[data-attach]').forEach(function(b){
    b.addEventListener('click', function(){ triggerAttach(b.getAttribute('data-attach')); closeSheets(); });
  });
  document.querySelectorAll('[data-nav="plugins"]').forEach(function(b){
    b.addEventListener('click', function(){ openModal('modal-settings'); showSettingsPanel('plugins'); renderPlugins(); });
  });

  $('file-camera').addEventListener('change', function(){ handleFiles(this.files); this.value=''; });
  $('file-gallery').addEventListener('change', function(){ handleFiles(this.files); this.value=''; });
  $('file-files').addEventListener('change', function(){ handleFiles(this.files); this.value=''; });
  $('file-pdf').addEventListener('change', function(){ handleFiles(this.files); this.value=''; });

  els['msg-input'].addEventListener('input', function(){ autoExpand(this); updateSendBtn(); });
  els['msg-input'].addEventListener('keydown', function(e){
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); if(!$('btn-send').disabled) sendMessage(); }
  });
  $('btn-send').addEventListener('click', function(){
    if(state.isGenerating){ state.isGenerating=false; toggleSendStop(false); return; }
    sendMessage();
  });
  $('btn-mic').addEventListener('click', toggleMic);


  /* Defensive delegated fallback for the hamburger control. */
  document.addEventListener('click', function(e){
    var b=e.target && e.target.closest ? e.target.closest('#btn-sidebar') : null;
    if(b){ e.preventDefault(); e.stopPropagation(); openSidebar(); }
  }, true);

  window.addEventListener('resize', function(){ if(innerWidth>=720) closeSidebar(); });
}

function renderProfilePhoto(){
  var btn=$('btn-profile');
  var sideImg=$('sb-profile-photo');
  var sideFallback=$('sb-profile-fallback');
  if(btn){
    btn.innerHTML='<svg class="icon"><use href="#i-more"/></svg>';
    btn.setAttribute('aria-label','More actions');
  }
  if(sideImg && sideFallback){
    if(state.userPhoto){
      sideImg.src=state.userPhoto;
      sideImg.hidden=false;
      sideFallback.hidden=true;
    }else{
      sideImg.removeAttribute('src');
      sideImg.hidden=true;
      sideFallback.textContent=(state.userName||'K').charAt(0).toUpperCase();
      sideFallback.hidden=false;
    }
  }
}
function finishOnboard(){
  var name = $('onboard-name').value.trim();
  state.userName = name || 'there';
  $('greeting-title').textContent = 'Hello, ' + state.userName;
  renderProfilePhoto();
  $('onboard').hidden = true;
  $('app').hidden = false;
  newChat();
  toast('Welcome to KYRO, '+state.userName);
}

/* ------------------------------------------------------------------------
   Bridge: later patch scripts below (Profile page, language engine, three-
   dot menus, image viewer, chat actions, etc.) each run in their own
   separate scope and call into these already-existing functions. Expose
   them on window so those existing calls actually reach the existing
   implementations instead of silently failing. This does not change any
   behavior for code inside this closure, which continues to resolve these
   names to the exact same local declarations as before.
   ------------------------------------------------------------------------ */
window.openModal = openModal;
window.closeModals = closeModals;
window.showSettingsPanel = showSettingsPanel;
window.openSheet = openSheet;
window.closeSheets = closeSheets;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.toast = toast;
window.activeChat = activeChat;
window.newChat = newChat;
window.switchChat = switchChat;
window.showHome = showHome;
window.showChat = showChat;
window.shareChat = shareChat;
window.exportChat = exportChat;
window.renderSidebarChats = renderSidebarChats;
window.renderMessages = renderMessages;
window.renderProfilePhoto = renderProfilePhoto;
window.renderApiKeys = renderApiKeys;
window.renderProjects = renderProjects;
window.renderPlugins = renderPlugins;
window.renderLibrary = renderLibrary;
window.buildModelList = buildModelList;
window.buildThemeGrid = buildThemeGrid;
window.applyTheme = applyTheme;
window.selectModel = selectModel;
window.triggerAttach = triggerAttach;
window.handleFiles = handleFiles;
window.sendMessage = sendMessage;
window.updateCapabilityUI = updateCapabilityUI;
window.updateSendBtn = updateSendBtn;
window.toggleMic = toggleMic;
window.doBackup = doBackup;
window.doRestore = doRestore;
window.state = state;
window.LANGUAGES = LANGUAGES;

})();

/* KYRO V33 — intercept Demo Mode basic knowledge questions */
function kyroSelfKnowledgeAnswer(messageText){
  try{
    var t=String(messageText||"").trim().toLowerCase();

    if(/(?:powered\s*by|which company|main company|company.*behind|company.*owns|who owns|owner|कंपनी.*कौन|किस कंपनी|ओन.*कंपनी|पावर्ड.*बाय|किसके द्वारा|پاورڈ بائی|کس کمپنی|اونر)/i.test(t)){
      return "Current KYRO app information does not specify an owner or Powered-by company.";
    }

    if(/(?:what is kyro|about kyro|kyro.*app|कायरो.*क्या|कायरो.*ऐप|kyro के बारे में|کیرو.*کیا|کیرو.*ایپ)/i.test(t)){
      return "KYRO is a mobile-first AI chat interface. The current app includes KYRO, KYRO 1, and KYRO 1.2 modes, profile controls, attachments, voice input, themes, model switching, Web Search, Settings, About, and Help & Support.";
    }

    if(/(?:how.*use|how do i use|कैसे इस्तेमाल|कैसे उपयोग|कैसे चलाऊं|कैसे चलाएं|استعمال کیسے|کیسے چلاؤں)/i.test(t)){
      return "KYRO use karne ke liye model switcher se mode choose karein, composer se message bhejein, Plus se photo/file attach karein, aur Settings me Language, API Manager, Model Manager, Voice, Web Search, Backup/Restore aur Security manage karein.";
    }

    if(/(?:upload|attach|photo|file|फ़ाइल|फोटो|अपलोड|अटैच|فائل|اپلوڈ|فوٹو)/i.test(t)){
      return "KYRO me composer ke Plus button se photos/files attach ki ja sakti hain. Attached items local Library me dikh sakte hain.";
    }

    if(/(?:settings|सेटिंग|सेटिंग्स|سیٹنگ)/i.test(t)){
      return "KYRO Settings me Language, API Manager, Model Manager, Voice, Web Search, Backup/Restore aur Security controls hain.";
    }

    return null;
  }catch(e){ return null; }
}

function kyroFinalPublicKnowledgeAnswer(messageText){
  try{
    var t=String(messageText||"").trim().toLowerCase();

    if(/(?:what(?:'s| is)?\s+(?:your\s+)?name|who\s+are\s+you|your\s+name|tumhara naam|aapka naam|apna naam|क्या.*नाम|नाम.*क्या|آپ.*نام|نام.*کیا)/i.test(t)){
      return "Mera naam KYRO hai.";
    }
    if(/(?:founder|who.*founded|owner.*kyro|निर्माता|फाउंडर|संस्थापक|किसने बनाया|founder.*kyro)/i.test(t)){
      return "KYRO ke Founder MR. NITIN KUSHWAHA hain.";
    }
    if(/(?:powered\s*by|main company|company.*behind|kyro.*company|कंपनी.*कौन|किस कंपनी|पावर्ड.*बाय|کس کمپنی|پاورڈ بائی)/i.test(t)){
      return "KYRO is Powered by Synapse.";
    }
    if(/(?:instagram|इंस्टाग्राम|انسٹاگرام)/i.test(t) && /(?:kyro|synapse|founder|official|फाउंडर|آفیشل)/i.test(t)){
      return "KYRO/Synapse ka official Instagram: @synapsebykyro — https://www.instagram.com/synapsebykyro?igsh=YnJsdXFwN3h1M3dx";
    }
    if(/(?:youtube|यूट्यूब|یوٹیوب)/i.test(t) && /(?:kyro|synapse|official|آفیشل)/i.test(t)){
      return "KYRO/Synapse ka official YouTube: https://www.youtube.com/@synapsebykyro";
    }
    if(/(?:website|वेबसाइट|ویب سائٹ)/i.test(t)){
      return "KYRO ki abhi official website nahi hai.";
    }
    return null;
  }catch(e){ return null; }
}

function kyroIdentityAnswer(messageText){
  try{
    var t=String(messageText||"").trim().toLowerCase();
    if(/(?:what(?:'s| is)?\s+(?:your\s+)?name|who\s+are\s+you|your\s+name|tumhara naam|aapka naam|apna naam|क्या.*नाम|नाम.*क्या)/i.test(t)){
      return "Mera naam KYRO hai.";
    }
    if(/(?:founder|who.*founded|owner|निर्माता|फाउंडर|संस्थापक|किसने बनाया|किसने.*बनाया)/i.test(t)){
      return "KYRO ke Founder MR. NITIN KUSHWAHA hain.";
    }
    return null;
  }catch(e){ return null; }
}

function kyroV33TryDemoAnswer(messageText) {
  try {
    if (!state || !state.activeModel || state.activeModel.id !== 'kyro-demo') return null;
    return kyroFinalPublicKnowledgeAnswer(messageText) || kyroSelfKnowledgeAnswer(messageText) || kyroIdentityAnswer(messageText) || kyroDemoKnowledgeAnswer(messageText);
  } catch (e) { return null; }
}

(function(){
  /* V44: KYRO wordmarks are intentionally single-color.
     Keep this script inert so dynamic text is not rewritten into colored spans. */
  window.kyroSimpleWordmark = true;
})();

(function(){
  var sx = 0, sy = 0, tracking = false;
  function sidebar(){
    return document.getElementById('sidebar');
  }
  function openSide(){
    var el = sidebar();
    if(!el) return;
    el.classList.add('open');
    el.hidden = false;
    el.removeAttribute('aria-hidden');
  }
  function closeSide(){
    var el = sidebar();
    if(!el) return;
    el.classList.remove('open');
    el.setAttribute('aria-hidden','true');
  }
  document.addEventListener('touchstart', function(e){
    if(!e.touches || !e.touches.length) return;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    tracking = true;
  }, {passive:true});
  document.addEventListener('touchmove', function(e){
    if(!tracking || !e.touches || !e.touches.length) return;
    var dx = e.touches[0].clientX - sx;
    var dy = e.touches[0].clientY - sy;
    if(Math.abs(dy) > Math.abs(dx) * 1.25){ tracking = false; return; }
    var el = sidebar();
    if(!el) return;
    if(!el.classList.contains('open') && sx < window.innerWidth * .72 && dx > 70){
      openSide();
      tracking = false;
    } else if(el.classList.contains('open') && dx < -70){
      closeSide();
      tracking = false;
    }
  }, {passive:true});
  document.addEventListener('touchend', function(){ tracking = false; }, {passive:true});
})();

(function(){
  /* ------------------------------------------------------------
     V35: real UI-language switching for the built-in language list.
     The language choice changes visible UI labels immediately and is
     remembered locally. Chat language is used for Demo replies and
     is also requested from the connected Gemini endpoint.
     ------------------------------------------------------------ */
  var V35 = {
    packs: {
      "English": {
        settings:"Settings", help:"Help & Support", about:"About KYRO", language:"Language",
        chatLanguage:"Chat Language", profile:"Profile", theme:"Theme", changePhoto:"Change photo",
        chooseTheme:"Choose theme", newChat:"New Chat", projects:"Projects", scheduled:"Scheduled",
        plugins:"Plugins", library:"Library", pinned:"Pinned", recent:"Recent", logout:"Logout",
        camera:"Camera", photos:"Photos", files:"Files", documents:"Documents", imageGen:"Image Gen",
        gallery:"Gallery", pdf:"PDF", image:"Image", video:"Video", audio:"Audio", scanDoc:"Scan Doc",
        addToChat:"Add to chat", hello:"Hello, there", howHelp:"How can I help you today?",
        ask:"Ask anything...", powered:"Powered by Synapse", founder:"Founder",
        version:"Version", build:"Build", privacy:"Privacy Policy", terms:"Terms of Use",
        licenses:"Open Source Licenses", web:"Web Search", backup:"Backup", restore:"Restore",
        security:"Security", voice:"Voice", modelManager:"Model Manager", apiManager:"API Manager",
        noApi:"No API connected", favourites:"Favourites & recents", speech:"Speech input & output",
        liveWeb:"Search the live web", appLock:"App lock", uiLanguage:"UI Language",
        offline:"Offline · no key needed", fast:"Fast · vision · docs", reasoning:"Reasoning · vision",
        continue:"Continue", support:"Support"
      },
      "Hindi": {
        settings:"सेटिंग", help:"मदद और सहायता", about:"KYRO के बारे में", language:"भाषा",
        chatLanguage:"चैट भाषा", profile:"प्रोफ़ाइल", theme:"थीम", changePhoto:"फोटो बदलें",
        chooseTheme:"थीम चुनें", newChat:"नई चैट", projects:"प्रोजेक्ट", scheduled:"शेड्यूल",
        plugins:"प्लगइन्स", library:"लाइब्रेरी", pinned:"पिन किए गए", recent:"हाल की चैट", logout:"लॉग आउट",
        camera:"कैमरा", photos:"फोटो", files:"फाइलें", documents:"दस्तावेज़", imageGen:"इमेज जनरेशन",
        gallery:"गैलरी", pdf:"PDF", image:"इमेज", video:"वीडियो", audio:"ऑडियो", scanDoc:"दस्तावेज़ स्कैन",
        addToChat:"चैट में जोड़ें", hello:"नमस्ते", howHelp:"मैं आज आपकी कैसे मदद कर सकता हूँ?",
        ask:"कुछ भी पूछें...", powered:"Synapse द्वारा संचालित", founder:"फाउंडर",
        version:"वर्ज़न", build:"बिल्ड", privacy:"प्राइवेसी पॉलिसी", terms:"उपयोग की शर्तें",
        licenses:"ओपन सोर्स लाइसेंस", web:"वेब सर्च", backup:"बैकअप", restore:"रिस्टोर",
        security:"सुरक्षा", voice:"आवाज़", modelManager:"मॉडल मैनेजर", apiManager:"API मैनेजर",
        noApi:"कोई API कनेक्ट नहीं है", favourites:"पसंदीदा और हाल के मॉडल", speech:"स्पीच इनपुट और आउटपुट",
        liveWeb:"लाइव वेब खोजें", appLock:"ऐप लॉक", uiLanguage:"UI भाषा",
        offline:"ऑफलाइन · कुंजी की जरूरत नहीं", fast:"तेज़ · विज़न · डॉक्यूमेंट", reasoning:"रीज़निंग · विज़न",
        continue:"जारी रखें", support:"सहायता"
      },
      "Hinglish": {
        settings:"Settings", help:"Help & Support", about:"KYRO ke baare mein", language:"Language",
        chatLanguage:"Chat Language", profile:"Profile", theme:"Theme", changePhoto:"Photo change karein",
        chooseTheme:"Theme choose karein", newChat:"New Chat", projects:"Projects", scheduled:"Scheduled",
        plugins:"Plugins", library:"Library", pinned:"Pinned", recent:"Recent", logout:"Logout",
        camera:"Camera", photos:"Photos", files:"Files", documents:"Documents", imageGen:"Image Gen",
        gallery:"Gallery", pdf:"PDF", image:"Image", video:"Video", audio:"Audio", scanDoc:"Scan Doc",
        addToChat:"Chat mein add karein", hello:"Hello, there", howHelp:"Main aaj aapki kaise help kar sakta hoon?",
        ask:"Kuch bhi poochhein...", powered:"Powered by Synapse", founder:"Founder",
        version:"Version", build:"Build", privacy:"Privacy Policy", terms:"Terms of Use",
        licenses:"Open Source Licenses", web:"Web Search", backup:"Backup", restore:"Restore",
        security:"Security", voice:"Voice", modelManager:"Model Manager", apiManager:"API Manager",
        noApi:"Koi API connected nahi hai", favourites:"Favourites & recents", speech:"Speech input & output",
        liveWeb:"Live web search karein", appLock:"App lock", uiLanguage:"UI Language",
        offline:"Offline · key ki zarurat nahi", fast:"Fast · vision · docs", reasoning:"Reasoning · vision",
        continue:"Continue", support:"Support"
      },
      "Urdu": {
        settings:"ترتیبات", help:"مدد اور معاونت", about:"KYRO کے بارے میں", language:"زبان",
        chatLanguage:"چیٹ کی زبان", profile:"پروفائل", theme:"تھیم", changePhoto:"تصویر تبدیل کریں",
        chooseTheme:"تھیم منتخب کریں", newChat:"نئی چیٹ", projects:"پروجیکٹس", scheduled:"شیڈول",
        plugins:"پلگ اِنز", library:"لائبریری", pinned:"پن کیے گئے", recent:"حالیہ", logout:"لاگ آؤٹ",
        camera:"کیمرہ", photos:"تصاویر", files:"فائلیں", documents:"دستاویزات", imageGen:"امیج جنریشن",
        gallery:"گیلری", pdf:"PDF", image:"تصویر", video:"ویڈیو", audio:"آڈیو", scanDoc:"دستاویز اسکین",
        addToChat:"چیٹ میں شامل کریں", hello:"السلام علیکم", howHelp:"میں آج آپ کی کیسے مدد کر سکتا ہوں؟",
        ask:"کچھ بھی پوچھیں...", powered:"Synapse کے ذریعے", founder:"بانی",
        version:"ورژن", build:"بلڈ", privacy:"پرائیویسی پالیسی", terms:"استعمال کی شرائط",
        licenses:"اوپن سورس لائسنس", web:"ویب سرچ", backup:"بیک اپ", restore:"بحال کریں",
        security:"سیکیورٹی", voice:"آواز", modelManager:"ماڈل مینیجر", apiManager:"API مینیجر",
        noApi:"کوئی API منسلک نہیں", favourites:"پسندیدہ اور حالیہ", speech:"اسپیچ اِن پٹ اور آؤٹ پٹ",
        liveWeb:"لائیو ویب تلاش کریں", appLock:"ایپ لاک", uiLanguage:"UI زبان",
        offline:"آف لائن · کلید کی ضرورت نہیں", fast:"تیز · وژن · دستاویزات", reasoning:"ریزننگ · وژن",
        continue:"جاری رکھیں", support:"معاونت"
      },
      "Bengali": {
        settings:"সেটিংস", help:"সহায়তা ও সাপোর্ট", about:"KYRO সম্পর্কে", language:"ভাষা",
        chatLanguage:"চ্যাটের ভাষা", profile:"প্রোফাইল", theme:"থিম", changePhoto:"ছবি পরিবর্তন",
        chooseTheme:"থিম বেছে নিন", newChat:"নতুন চ্যাট", projects:"প্রজেক্ট", scheduled:"নির্ধারিত",
        plugins:"প্লাগইন", library:"লাইব্রেরি", pinned:"পিন করা", recent:"সাম্প্রতিক", logout:"লগ আউট",
        camera:"ক্যামেরা", photos:"ছবি", files:"ফাইল", documents:"ডকুমেন্ট", imageGen:"ইমেজ জেন",
        gallery:"গ্যালারি", pdf:"PDF", image:"ইমেজ", video:"ভিডিও", audio:"অডিও", scanDoc:"ডকুমেন্ট স্ক্যান",
        addToChat:"চ্যাটে যোগ করুন", hello:"হ্যালো", howHelp:"আজ আমি কীভাবে সাহায্য করতে পারি?",
        ask:"যেকোনো কিছু জিজ্ঞেস করুন...", powered:"Synapse দ্বারা পরিচালিত", founder:"প্রতিষ্ঠাতা",
        version:"ভার্সন", build:"বিল্ড", privacy:"গোপনীয়তা নীতি", terms:"ব্যবহারের শর্ত",
        licenses:"ওপেন সোর্স লাইসেন্স", web:"ওয়েব সার্চ", backup:"ব্যাকআপ", restore:"রিস্টোর",
        security:"নিরাপত্তা", voice:"ভয়েস", modelManager:"মডেল ম্যানেজার", apiManager:"API ম্যানেজার",
        noApi:"কোনো API সংযুক্ত নেই", favourites:"পছন্দের ও সাম্প্রতিক", speech:"স্পিচ ইনপুট ও আউটপুট",
        liveWeb:"লাইভ ওয়েবে খুঁজুন", appLock:"অ্যাপ লক", uiLanguage:"UI ভাষা",
        offline:"অফলাইন · কী দরকার নেই", fast:"দ্রুত · ভিশন · ডকস", reasoning:"রিজনিং · ভিশন",
        continue:"চালিয়ে যান", support:"সাপোর্ট"
      },
      "Tamil": {
        settings:"அமைப்புகள்", help:"உதவி & ஆதரவு", about:"KYRO பற்றி", language:"மொழி",
        chatLanguage:"அரட்டை மொழி", profile:"சுயவிவரம்", theme:"தீம்", changePhoto:"புகைப்படத்தை மாற்று",
        chooseTheme:"தீமைத் தேர்வு செய்", newChat:"புதிய அரட்டை", projects:"திட்டங்கள்", scheduled:"திட்டமிடப்பட்டது",
        plugins:"பிளகின்கள்", library:"நூலகம்", pinned:"பின் செய்யப்பட்டவை", recent:"சமீபத்தியவை", logout:"வெளியேறு",
        camera:"கேமரா", photos:"புகைப்படங்கள்", files:"கோப்புகள்", documents:"ஆவணங்கள்", imageGen:"பட உருவாக்கம்",
        gallery:"கேலரி", pdf:"PDF", image:"படம்", video:"வீடியோ", audio:"ஆடியோ", scanDoc:"ஆவண ஸ்கேன்",
        addToChat:"அரட்டையில் சேர்", hello:"வணக்கம்", howHelp:"இன்று நான் எப்படி உதவலாம்?",
        ask:"எதையும் கேளுங்கள்...", powered:"Synapse மூலம் இயக்கப்படுகிறது", founder:"நிறுவனர்",
        version:"பதிப்பு", build:"பில்ட்", privacy:"தனியுரிமைக் கொள்கை", terms:"பயன்பாட்டு விதிமுறைகள்",
        licenses:"ஓபன் சோர்ஸ் உரிமங்கள்", web:"வெப் தேடல்", backup:"காப்புப்பிரதி", restore:"மீட்டமை",
        security:"பாதுகாப்பு", voice:"குரல்", modelManager:"மாடல் மேலாளர்", apiManager:"API மேலாளர்",
        noApi:"API இணைக்கப்படவில்லை", favourites:"பிடித்தவை & சமீபத்தியவை", speech:"பேச்சு உள்ளீடு & வெளியீடு",
        liveWeb:"நேரடி இணையத்தைத் தேடு", appLock:"ஆப் பூட்டு", uiLanguage:"UI மொழி",
        offline:"ஆஃப்லைன் · கீ தேவையில்லை", fast:"வேகமான · விஷன் · டாக்ஸ்", reasoning:"ரீசனிங் · விஷன்",
        continue:"தொடரவும்", support:"ஆதரவு"
      },
      "Telugu": {
        settings:"సెట్టింగ్స్", help:"సహాయం & సపోర్ట్", about:"KYRO గురించి", language:"భాష",
        chatLanguage:"చాట్ భాష", profile:"ప్రొఫైల్", theme:"థీమ్", changePhoto:"ఫోటో మార్చు",
        chooseTheme:"థీమ్ ఎంచుకోండి", newChat:"కొత్త చాట్", projects:"ప్రాజెక్టులు", scheduled:"షెడ్యూల్",
        plugins:"ప్లగిన్లు", library:"లైబ్రరీ", pinned:"పిన్ చేసినవి", recent:"ఇటీవలి", logout:"లాగ్ అవుట్",
        camera:"కెమెరా", photos:"ఫోటోలు", files:"ఫైల్స్", documents:"డాక్యుమెంట్లు", imageGen:"ఇమేజ్ జనరేషన్",
        gallery:"గ్యాలరీ", pdf:"PDF", image:"ఇమేజ్", video:"వీడియో", audio:"ఆడియో", scanDoc:"డాక్యుమెంట్ స్కాన్",
        addToChat:"చాట్‌కు జోడించండి", hello:"నమస్కారం", howHelp:"ఈ రోజు నేను మీకు ఎలా సహాయం చేయగలను?",
        ask:"ఏదైనా అడగండి...", powered:"Synapse ద్వారా", founder:"వ్యవస్థాపకుడు",
        version:"వెర్షన్", build:"బిల్డ్", privacy:"గోప్యతా విధానం", terms:"వినియోగ నిబంధనలు",
        licenses:"ఓపెన్ సోర్స్ లైసెన్సులు", web:"వెబ్ సెర్చ్", backup:"బ్యాకప్", restore:"రిస్టోర్",
        security:"భద్రత", voice:"వాయిస్", modelManager:"మోడల్ మేనేజర్", apiManager:"API మేనేజర్",
        noApi:"API కనెక్ట్ కాలేదు", favourites:"ఇష్టమైనవి & ఇటీవలి", speech:"స్పీచ్ ఇన్‌పుట్ & అవుట్‌పుట్",
        liveWeb:"లైవ్ వెబ్‌లో వెతకండి", appLock:"యాప్ లాక్", uiLanguage:"UI భాష",
        offline:"ఆఫ్‌లైన్ · కీ అవసరం లేదు", fast:"వేగవంతమైన · విజన్ · డాక్స్", reasoning:"రీజనింగ్ · విజన్",
        continue:"కొనసాగించు", support:"సపోర్ట్"
      },
      "Gujarati": {
        settings:"સેટિંગ્સ", help:"મદદ અને સપોર્ટ", about:"KYRO વિશે", language:"ભાષા",
        chatLanguage:"ચેટ ભાષા", profile:"પ્રોફાઇલ", theme:"થીમ", changePhoto:"ફોટો બદલો",
        chooseTheme:"થીમ પસંદ કરો", newChat:"નવી ચેટ", projects:"પ્રોજેક્ટ્સ", scheduled:"શેડ્યૂલ",
        plugins:"પ્લગઇન્સ", library:"લાઇબ્રેરી", pinned:"પિન કરેલ", recent:"તાજેતરના", logout:"લૉગ આઉટ",
        camera:"કેમેરા", photos:"ફોટા", files:"ફાઇલો", documents:"દસ્તાવેજો", imageGen:"ઇમેજ જનરેશન",
        gallery:"ગેલેરી", pdf:"PDF", image:"ઇમેજ", video:"વિડિયો", audio:"ઓડિયો", scanDoc:"દસ્તાવેજ સ્કેન",
        addToChat:"ચેટમાં ઉમેરો", hello:"નમસ્તે", howHelp:"આજે હું તમારી કેવી રીતે મદદ કરી શકું?",
        ask:"કંઈ પણ પૂછો...", powered:"Synapse દ્વારા સંચાલિત", founder:"સ્થાપક",
        version:"વર્ઝન", build:"બિલ્ડ", privacy:"ગોપનીયતા નીતિ", terms:"ઉપયોગની શરતો",
        licenses:"ઓપન સોર્સ લાઇસન્સ", web:"વેબ સર્ચ", backup:"બેકઅપ", restore:"રીસ્ટોર",
        security:"સુરક્ષા", voice:"વોઇસ", modelManager:"મોડલ મેનેજર", apiManager:"API મેનેજર",
        noApi:"કોઈ API જોડાયેલ નથી", favourites:"મનપસંદ અને તાજેતરના", speech:"સ્પીચ ઇનપુટ અને આઉટપુટ",
        liveWeb:"લાઇવ વેબ શોધો", appLock:"એપ લોક", uiLanguage:"UI ભાષા",
        offline:"ઑફલાઇન · કી જરૂરી નથી", fast:"ઝડપી · વિઝન · ડોક્સ", reasoning:"રીઝનિંગ · વિઝન",
        continue:"ચાલુ રાખો", support:"સપોર્ટ"
      },
      "Punjabi": {
        settings:"ਸੈਟਿੰਗਾਂ", help:"ਮਦਦ ਅਤੇ ਸਹਾਇਤਾ", about:"KYRO ਬਾਰੇ", language:"ਭਾਸ਼ਾ",
        chatLanguage:"ਚੈਟ ਭਾਸ਼ਾ", profile:"ਪ੍ਰੋਫਾਈਲ", theme:"ਥੀਮ", changePhoto:"ਫੋਟੋ ਬਦਲੋ",
        chooseTheme:"ਥੀਮ ਚੁਣੋ", newChat:"ਨਵੀਂ ਚੈਟ", projects:"ਪ੍ਰੋਜੈਕਟ", scheduled:"ਸ਼ਡਿਊਲ",
        plugins:"ਪਲੱਗਇਨ", library:"ਲਾਇਬ੍ਰੇਰੀ", pinned:"ਪਿੰਨ ਕੀਤੇ", recent:"ਹਾਲੀਆ", logout:"ਲੌਗ ਆਉਟ",
        camera:"ਕੈਮਰਾ", photos:"ਫੋਟੋਆਂ", files:"ਫਾਈਲਾਂ", documents:"ਦਸਤਾਵੇਜ਼", imageGen:"ਇਮੇਜ ਜਨ",
        gallery:"ਗੈਲਰੀ", pdf:"PDF", image:"ਤਸਵੀਰ", video:"ਵੀਡੀਓ", audio:"ਆਡੀਓ", scanDoc:"ਦਸਤਾਵੇਜ਼ ਸਕੈਨ",
        addToChat:"ਚੈਟ ਵਿੱਚ ਜੋੜੋ", hello:"ਸਤ ਸ੍ਰੀ ਅਕਾਲ", howHelp:"ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
        ask:"ਕੁਝ ਵੀ ਪੁੱਛੋ...", powered:"Synapse ਦੁਆਰਾ", founder:"ਸੰਸਥਾਪਕ",
        version:"ਵਰਜਨ", build:"ਬਿਲਡ", privacy:"ਪਰਾਈਵੇਸੀ ਨੀਤੀ", terms:"ਵਰਤੋਂ ਦੀਆਂ ਸ਼ਰਤਾਂ",
        licenses:"ਓਪਨ ਸੋਰਸ ਲਾਇਸੈਂਸ", web:"ਵੈੱਬ ਸਰਚ", backup:"ਬੈਕਅਪ", restore:"ਰੀਸਟੋਰ",
        security:"ਸੁਰੱਖਿਆ", voice:"ਵੌਇਸ", modelManager:"ਮਾਡਲ ਮੈਨੇਜਰ", apiManager:"API ਮੈਨੇਜਰ",
        noApi:"ਕੋਈ API ਜੁੜੀ ਨਹੀਂ", favourites:"ਮਨਪਸੰਦ ਅਤੇ ਹਾਲੀਆ", speech:"ਸਪੀਚ ਇਨਪੁਟ ਅਤੇ ਆਉਟਪੁਟ",
        liveWeb:"ਲਾਈਵ ਵੈੱਬ ਖੋਜੋ", appLock:"ਐਪ ਲੌਕ", uiLanguage:"UI ਭਾਸ਼ਾ",
        offline:"ਆਫਲਾਈਨ · ਕੁੰਜੀ ਦੀ ਲੋੜ ਨਹੀਂ", fast:"ਤੇਜ਼ · ਵਿਜ਼ਨ · ਡੌਕਸ", reasoning:"ਰੀਜ਼ਨਿੰਗ · ਵਿਜ਼ਨ",
        continue:"ਜਾਰੀ ਰੱਖੋ", support:"ਸਹਾਇਤਾ"
      },
      "Marathi": {
        settings:"सेटिंग्ज", help:"मदत आणि समर्थन", about:"KYRO बद्दल", language:"भाषा",
        chatLanguage:"चॅट भाषा", profile:"प्रोफाइल", theme:"थीम", changePhoto:"फोटो बदला",
        chooseTheme:"थीम निवडा", newChat:"नवीन चॅट", projects:"प्रोजेक्ट्स", scheduled:"नियोजित",
        plugins:"प्लगइन्स", library:"लायब्ररी", pinned:"पिन केलेले", recent:"अलीकडील", logout:"लॉग आउट",
        camera:"कॅमेरा", photos:"फोटो", files:"फाइल्स", documents:"दस्तऐवज", imageGen:"इमेज जनरेशन",
        gallery:"गॅलरी", pdf:"PDF", image:"इमेज", video:"व्हिडिओ", audio:"ऑडिओ", scanDoc:"दस्तऐवज स्कॅन",
        addToChat:"चॅटमध्ये जोडा", hello:"नमस्कार", howHelp:"आज मी तुमची कशी मदत करू शकतो?",
        ask:"काहीही विचारा...", powered:"Synapse द्वारे", founder:"संस्थापक",
        version:"आवृत्ती", build:"बिल्ड", privacy:"गोपनीयता धोरण", terms:"वापरण्याच्या अटी",
        licenses:"ओपन सोर्स परवाने", web:"वेब शोध", backup:"बॅकअप", restore:"पुनर्संचयित",
        security:"सुरक्षा", voice:"व्हॉइस", modelManager:"मॉडेल व्यवस्थापक", apiManager:"API व्यवस्थापक",
        noApi:"कोणतेही API जोडलेले नाही", favourites:"आवडते आणि अलीकडील", speech:"स्पीच इनपुट आणि आउटपुट",
        liveWeb:"लाइव्ह वेब शोधा", appLock:"अॅप लॉक", uiLanguage:"UI भाषा",
        offline:"ऑफलाइन · की आवश्यक नाही", fast:"जलद · व्हिजन · डॉक्युमेंट्स", reasoning:"रीझनिंग · व्हिजन",
        continue:"सुरू ठेवा", support:"समर्थन"
      },
      "Kannada": {
        settings:"ಸೆಟ್ಟಿಂಗ್ಸ್", help:"ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ", about:"KYRO ಬಗ್ಗೆ", language:"ಭಾಷೆ",
        chatLanguage:"ಚಾಟ್ ಭಾಷೆ", profile:"ಪ್ರೊಫೈಲ್", theme:"ಥೀಮ್", changePhoto:"ಫೋಟೋ ಬದಲಿಸಿ",
        chooseTheme:"ಥೀಮ್ ಆಯ್ಕೆಮಾಡಿ", newChat:"ಹೊಸ ಚಾಟ್", projects:"ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು", scheduled:"ನಿಗದಿತ",
        plugins:"ಪ್ಲಗಿನ್‌ಗಳು", library:"ಲೈಬ್ರರಿ", pinned:"ಪಿನ್ ಮಾಡಿದವು", recent:"ಇತ್ತೀಚಿನವು", logout:"ಲಾಗ್ ಔಟ್",
        camera:"ಕ್ಯಾಮೆರಾ", photos:"ಫೋಟೋಗಳು", files:"ಫೈಲ್‌ಗಳು", documents:"ದಾಖಲೆಗಳು", imageGen:"ಇಮೇಜ್ ಜನರೇಷನ್",
        gallery:"ಗ್ಯಾಲರಿ", pdf:"PDF", image:"ಇಮೇಜ್", video:"ವೀಡಿಯೊ", audio:"ಆಡಿಯೊ", scanDoc:"ದಾಖಲೆ ಸ್ಕ್ಯಾನ್",
        addToChat:"ಚಾಟ್‌ಗೆ ಸೇರಿಸಿ", hello:"ನಮಸ್ಕಾರ", howHelp:"ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
        ask:"ಏನಾದರೂ ಕೇಳಿ...", powered:"Synapse ಮೂಲಕ", founder:"ಸ್ಥಾಪಕರು",
        version:"ಆವೃತ್ತಿ", build:"ಬಿಲ್ಡ್", privacy:"ಗೌಪ್ಯತಾ ನೀತಿ", terms:"ಬಳಕೆಯ ನಿಯಮಗಳು",
        licenses:"ಓಪನ್ ಸೋರ್ಸ್ ಪರವಾನಗಿಗಳು", web:"ವೆಬ್ ಹುಡುಕಾಟ", backup:"ಬ್ಯಾಕಪ್", restore:"ಮರುಸ್ಥಾಪಿಸಿ",
        security:"ಭದ್ರತೆ", voice:"ಧ್ವನಿ", modelManager:"ಮಾಡೆಲ್ ಮ್ಯಾನೇಜರ್", apiManager:"API ಮ್ಯಾನೇಜರ್",
        noApi:"ಯಾವುದೇ API ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ", favourites:"ಮೆಚ್ಚಿನವು ಮತ್ತು ಇತ್ತೀಚಿನವು", speech:"ಸ್ಪೀಚ್ ಇನ್‌ಪುಟ್ ಮತ್ತು ಔಟ್‌ಪುಟ್",
        liveWeb:"ಲೈವ್ ವೆಬ್ ಹುಡುಕಿ", appLock:"ಆಪ್ ಲಾಕ್", uiLanguage:"UI ಭಾಷೆ",
        offline:"ಆಫ್‌ಲೈನ್ · ಕೀ ಅಗತ್ಯವಿಲ್ಲ", fast:"ವೇಗ · ವಿಷನ್ · ಡಾಕ್ಸ್", reasoning:"ರೀಸನಿಂಗ್ · ವಿಷನ್",
        continue:"ಮುಂದುವರಿಸಿ", support:"ಬೆಂಬಲ"
      },
      "Malayalam": {
        settings:"ക്രമീകരണങ്ങൾ", help:"സഹായവും പിന്തുണയും", about:"KYROയെ കുറിച്ച്", language:"ഭാഷ",
        chatLanguage:"ചാറ്റ് ഭാഷ", profile:"പ്രൊഫൈൽ", theme:"തീം", changePhoto:"ഫോട്ടോ മാറ്റുക",
        chooseTheme:"തീം തിരഞ്ഞെടുക്കുക", newChat:"പുതിയ ചാറ്റ്", projects:"പ്രോജക്റ്റുകൾ", scheduled:"ഷെഡ്യൂൾ ചെയ്തത്",
        plugins:"പ്ലഗിനുകൾ", library:"ലൈബ്രറി", pinned:"പിൻ ചെയ്തത്", recent:"സമീപകാലം", logout:"ലോഗ് ഔട്ട്",
        camera:"ക്യാമറ", photos:"ഫോട്ടോകൾ", files:"ഫയലുകൾ", documents:"രേഖകൾ", imageGen:"ഇമേജ് ജനറേഷൻ",
        gallery:"ഗാലറി", pdf:"PDF", image:"ഇമേജ്", video:"വീഡിയോ", audio:"ഓഡിയോ", scanDoc:"ഡോക്യുമെന്റ് സ്കാൻ",
        addToChat:"ചാറ്റിലേക്ക് ചേർക്കുക", hello:"നമസ്കാരം", howHelp:"ഇന്ന് എങ്ങനെ സഹായിക്കാം?",
        ask:"എന്തും ചോദിക്കാം...", powered:"Synapse വഴി", founder:"സ്ഥാപകൻ",
        version:"പതിപ്പ്", build:"ബിൽഡ്", privacy:"സ്വകാര്യതാ നയം", terms:"ഉപയോഗ നിബന്ധനകൾ",
        licenses:"ഓപ്പൺ സോഴ്‌സ് ലൈസൻസുകൾ", web:"വെബ് തിരയൽ", backup:"ബാക്കപ്പ്", restore:"പുനഃസ്ഥാപിക്കുക",
        security:"സുരക്ഷ", voice:"വോയ്സ്", modelManager:"മോഡൽ മാനേജർ", apiManager:"API മാനേജർ",
        noApi:"API കണക്റ്റ് ചെയ്തിട്ടില്ല", favourites:"പ്രിയപ്പെട്ടവയും സമീപകാലവും", speech:"സ്പീച്ച് ഇൻപുട്ടും ഔട്ട്പുട്ടും",
        liveWeb:"ലൈവ് വെബിൽ തിരയുക", appLock:"ആപ്പ് ലോക്ക്", uiLanguage:"UI ഭാഷ",
        offline:"ഓഫ്‌ലൈൻ · കീ ആവശ്യമില്ല", fast:"വേഗം · വിഷൻ · ഡോക്സ്", reasoning:"റീസണിംഗ് · വിഷൻ",
        continue:"തുടരുക", support:"പിന്തുണ"
      },
      "Odia": {
        settings:"ସେଟିଂସ୍", help:"ସହାୟତା ଓ ସମର୍ଥନ", about:"KYRO ବିଷୟରେ", language:"ଭାଷା",
        chatLanguage:"ଚାଟ୍ ଭାଷା", profile:"ପ୍ରୋଫାଇଲ୍", theme:"ଥିମ୍", changePhoto:"ଫଟୋ ବଦଳାନ୍ତୁ",
        chooseTheme:"ଥିମ୍ ବାଛନ୍ତୁ", newChat:"ନୂଆ ଚାଟ୍", projects:"ପ୍ରୋଜେକ୍ଟ", scheduled:"ନିର୍ଦ୍ଧାରିତ",
        plugins:"ପ୍ଲଗଇନ୍", library:"ଲାଇବ୍ରେରୀ", pinned:"ପିନ୍", recent:"ସମ୍ପ୍ରତିକ", logout:"ଲଗ୍ ଆଉଟ୍",
        camera:"କ୍ୟାମେରା", photos:"ଫଟୋ", files:"ଫାଇଲ୍", documents:"ଦଲିଲ", imageGen:"ଇମେଜ୍ ଜେନ",
        gallery:"ଗ୍ୟାଲେରୀ", pdf:"PDF", image:"ଇମେଜ୍", video:"ଭିଡିଓ", audio:"ଅଡିଓ", scanDoc:"ଦଲିଲ ସ୍କାନ୍",
        addToChat:"ଚାଟ୍‌ରେ ଯୋଡନ୍ତୁ", hello:"ନମସ୍କାର", howHelp:"ଆଜି ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
        ask:"ଯାହା ଚାହିଁବେ ପଚାରନ୍ତୁ...", powered:"Synapse ଦ୍ୱାରା", founder:"ପ୍ରତିଷ୍ଠାତା",
        version:"ସଂସ୍କରଣ", build:"ବିଲ୍ଡ", privacy:"ଗୋପନୀୟତା ନୀତି", terms:"ବ୍ୟବହାର ସର୍ତ୍ତ",
        licenses:"ଓପନ୍ ସୋର୍ସ ଲାଇସେନ୍ସ", web:"ୱେବ୍ ସର୍ଚ୍ଚ", backup:"ବ୍ୟାକଅପ୍", restore:"ରିଷ୍ଟୋର୍",
        security:"ସୁରକ୍ଷା", voice:"ଭଏସ୍", modelManager:"ମଡେଲ୍ ମ୍ୟାନେଜର୍", apiManager:"API ମ୍ୟାନେଜର୍",
        noApi:"କୌଣସି API ସଂଯୁକ୍ତ ନାହିଁ", favourites:"ପସନ୍ଦ ଓ ସମ୍ପ୍ରତିକ", speech:"ସ୍ପିଚ୍ ଇନପୁଟ୍ ଓ ଆଉଟପୁଟ୍",
        liveWeb:"ଲାଇଭ୍ ୱେବ୍ ଖୋଜନ୍ତୁ", appLock:"ଆପ୍ ଲକ୍", uiLanguage:"UI ଭାଷା",
        offline:"ଅଫଲାଇନ୍ · କୀ ଦରକାର ନାହିଁ", fast:"ଦ୍ରୁତ · ଭିଜନ୍ · ଡକ୍ସ", reasoning:"ରିଜନିଂ · ଭିଜନ୍",
        continue:"ଜାରି ରଖନ୍ତୁ", support:"ସମର୍ଥନ"
      },
      "Assamese": {
        settings:"ছেটিংছ", help:"সহায়তা আৰু সমৰ্থন", about:"KYRO ৰ বিষয়ে", language:"ভাষা",
        chatLanguage:"চেট ভাষা", profile:"প্ৰফাইল", theme:"থিম", changePhoto:"ফটো সলনি কৰক",
        chooseTheme:"থিম বাছক", newChat:"নতুন চেট", projects:"প্ৰজেক্ট", scheduled:"নিৰ্ধাৰিত",
        plugins:"প্লাগইন", library:"লাইব্ৰেৰী", pinned:"পিন কৰা", recent:"শেহতীয়া", logout:"লগ আউট",
        camera:"কেমেৰা", photos:"ফটো", files:"ফাইল", documents:"নথি", imageGen:"ইমেজ জেন",
        gallery:"গেলাৰী", pdf:"PDF", image:"ইমেজ", video:"ভিডিঅ'", audio:"অডিঅ'", scanDoc:"নথি স্কেন",
        addToChat:"চেটত যোগ কৰক", hello:"নমস্কাৰ", howHelp:"আজি মই কেনেকৈ সহায় কৰিব পাৰোঁ?",
        ask:"যিকোনো কথা সোধক...", powered:"Synapse দ্বাৰা", founder:"প্ৰতিষ্ঠাপক",
        version:"ভাৰ্চন", build:"বিল্ড", privacy:"গোপনীয়তা নীতি", terms:"ব্যৱহাৰৰ চৰ্ত",
        licenses:"অপেন ছ'ৰ্চ লাইচেন্স", web:"ৱেব সন্ধান", backup:"বেকআপ", restore:"পুনৰুদ্ধাৰ",
        security:"নিৰাপত্তা", voice:"ভইচ", modelManager:"মডেল মেনেজাৰ", apiManager:"API মেনেজাৰ",
        noApi:"কোনো API সংযুক্ত নাই", favourites:"পছন্দ আৰু শেহতীয়া", speech:"স্পীচ ইনপুট আৰু আউটপুট",
        liveWeb:"লাইভ ৱেব সন্ধান কৰক", appLock:"এপ লক", uiLanguage:"UI ভাষা",
        offline:"অফলাইন · কী নালাগে", fast:"দ্ৰুত · ভিজন · ডকছ", reasoning:"ৰিজনিং · ভিজন",
        continue:"আগবাঢ়ক", support:"সমৰ্থন"
      },
      "Nepali": {
        settings:"सेटिङहरू", help:"मद्दत र समर्थन", about:"KYRO बारे", language:"भाषा",
        chatLanguage:"च्याट भाषा", profile:"प्रोफाइल", theme:"थिम", changePhoto:"फोटो बदल्नुहोस्",
        chooseTheme:"थिम छान्नुहोस्", newChat:"नयाँ च्याट", projects:"प्रोजेक्टहरू", scheduled:"तालिका",
        plugins:"प्लगइनहरू", library:"लाइब्रेरी", pinned:"पिन गरिएका", recent:"हालका", logout:"लग आउट",
        camera:"क्यामेरा", photos:"फोटोहरू", files:"फाइलहरू", documents:"कागजातहरू", imageGen:"इमेज जेनेरेसन",
        gallery:"ग्यालरी", pdf:"PDF", image:"इमेज", video:"भिडियो", audio:"अडियो", scanDoc:"कागजात स्क्यान",
        addToChat:"च्याटमा थप्नुहोस्", hello:"नमस्ते", howHelp:"आज म तपाईंलाई कसरी मद्दत गर्न सक्छु?",
        ask:"जे पनि सोध्नुहोस्...", powered:"Synapse द्वारा", founder:"संस्थापक",
        version:"संस्करण", build:"बिल्ड", privacy:"गोपनीयता नीति", terms:"प्रयोगका सर्तहरू",
        licenses:"ओपन सोर्स लाइसेन्स", web:"वेब खोज", backup:"ब्याकअप", restore:"पुनर्स्थापना",
        security:"सुरक्षा", voice:"आवाज", modelManager:"मोडेल व्यवस्थापक", apiManager:"API व्यवस्थापक",
        noApi:"कुनै API जडान छैन", favourites:"मनपर्ने र हालका", speech:"स्पिच इनपुट र आउटपुट",
        liveWeb:"लाइभ वेब खोज्नुहोस्", appLock:"एप लक", uiLanguage:"UI भाषा",
        offline:"अफलाइन · कुञ्जी आवश्यक छैन", fast:"छिटो · भिजन · डक्स", reasoning:"रीजनिङ · भिजन",
        continue:"जारी राख्नुहोस्", support:"समर्थन"
      },
      "Arabic": {
        settings:"الإعدادات", help:"المساعدة والدعم", about:"حول KYRO", language:"اللغة",
        chatLanguage:"لغة الدردشة", profile:"الملف الشخصي", theme:"السمة", changePhoto:"تغيير الصورة",
        chooseTheme:"اختر السمة", newChat:"محادثة جديدة", projects:"المشاريع", scheduled:"مجدول",
        plugins:"الإضافات", library:"المكتبة", pinned:"مثبت", recent:"الأخيرة", logout:"تسجيل الخروج",
        camera:"الكاميرا", photos:"الصور", files:"الملفات", documents:"المستندات", imageGen:"إنشاء الصور",
        gallery:"المعرض", pdf:"PDF", image:"صورة", video:"فيديو", audio:"صوت", scanDoc:"مسح مستند",
        addToChat:"إضافة إلى الدردشة", hello:"مرحباً", howHelp:"كيف يمكنني مساعدتك اليوم؟",
        ask:"اسأل أي شيء...", powered:"مدعوم بواسطة Synapse", founder:"المؤسس",
        version:"الإصدار", build:"البناء", privacy:"سياسة الخصوصية", terms:"شروط الاستخدام",
        licenses:"تراخيص المصادر المفتوحة", web:"بحث الويب", backup:"نسخ احتياطي", restore:"استعادة",
        security:"الأمان", voice:"الصوت", modelManager:"مدير النماذج", apiManager:"مدير API",
        noApi:"لا توجد API متصلة", favourites:"المفضلة والأخيرة", speech:"إدخال وإخراج الكلام",
        liveWeb:"البحث في الويب مباشرة", appLock:"قفل التطبيق", uiLanguage:"لغة الواجهة",
        offline:"دون اتصال · لا حاجة لمفتاح", fast:"سريع · رؤية · مستندات", reasoning:"استدلال · رؤية",
        continue:"متابعة", support:"الدعم"
      },
      "French": {
        settings:"Paramètres", help:"Aide et assistance", about:"À propos de KYRO", language:"Langue",
        chatLanguage:"Langue du chat", profile:"Profil", theme:"Thème", changePhoto:"Changer la photo",
        chooseTheme:"Choisir le thème", newChat:"Nouveau chat", projects:"Projets", scheduled:"Planifié",
        plugins:"Plugins", library:"Bibliothèque", pinned:"Épinglés", recent:"Récents", logout:"Déconnexion",
        camera:"Caméra", photos:"Photos", files:"Fichiers", documents:"Documents", imageGen:"Génération d’image",
        gallery:"Galerie", pdf:"PDF", image:"Image", video:"Vidéo", audio:"Audio", scanDoc:"Scanner le document",
        addToChat:"Ajouter au chat", hello:"Bonjour", howHelp:"Comment puis-je vous aider aujourd’hui ?",
        ask:"Demandez n’importe quoi...", powered:"Propulsé par Synapse", founder:"Fondateur",
        version:"Version", build:"Build", privacy:"Politique de confidentialité", terms:"Conditions d’utilisation",
        licenses:"Licences open source", web:"Recherche Web", backup:"Sauvegarde", restore:"Restaurer",
        security:"Sécurité", voice:"Voix", modelManager:"Gestionnaire de modèles", apiManager:"Gestionnaire API",
        noApi:"Aucune API connectée", favourites:"Favoris et récents", speech:"Entrée et sortie vocales",
        liveWeb:"Rechercher sur le Web en direct", appLock:"Verrouillage de l’app", uiLanguage:"Langue de l’interface",
        offline:"Hors ligne · aucune clé requise", fast:"Rapide · vision · docs", reasoning:"Raisonnement · vision",
        continue:"Continuer", support:"Assistance"
      },
      "German": {
        settings:"Einstellungen", help:"Hilfe & Support", about:"Über KYRO", language:"Sprache",
        chatLanguage:"Chat-Sprache", profile:"Profil", theme:"Design", changePhoto:"Foto ändern",
        chooseTheme:"Design auswählen", newChat:"Neuer Chat", projects:"Projekte", scheduled:"Geplant",
        plugins:"Plugins", library:"Bibliothek", pinned:"Angeheftet", recent:"Zuletzt", logout:"Abmelden",
        camera:"Kamera", photos:"Fotos", files:"Dateien", documents:"Dokumente", imageGen:"Bildgenerierung",
        gallery:"Galerie", pdf:"PDF", image:"Bild", video:"Video", audio:"Audio", scanDoc:"Dokument scannen",
        addToChat:"Zum Chat hinzufügen", hello:"Hallo", howHelp:"Wie kann ich dir heute helfen?",
        ask:"Frag mich alles...", powered:"Unterstützt von Synapse", founder:"Gründer",
        version:"Version", build:"Build", privacy:"Datenschutzrichtlinie", terms:"Nutzungsbedingungen",
        licenses:"Open-Source-Lizenzen", web:"Websuche", backup:"Backup", restore:"Wiederherstellen",
        security:"Sicherheit", voice:"Sprache", modelManager:"Modellverwaltung", apiManager:"API-Manager",
        noApi:"Keine API verbunden", favourites:"Favoriten & zuletzt verwendet", speech:"Spracheingabe & -ausgabe",
        liveWeb:"Live im Web suchen", appLock:"App-Sperre", uiLanguage:"UI-Sprache",
        offline:"Offline · kein Schlüssel nötig", fast:"Schnell · Vision · Docs", reasoning:"Reasoning · Vision",
        continue:"Weiter", support:"Support"
      },
      "Spanish": {
        settings:"Ajustes", help:"Ayuda y soporte", about:"Acerca de KYRO", language:"Idioma",
        chatLanguage:"Idioma del chat", profile:"Perfil", theme:"Tema", changePhoto:"Cambiar foto",
        chooseTheme:"Elegir tema", newChat:"Nuevo chat", projects:"Proyectos", scheduled:"Programado",
        plugins:"Plugins", library:"Biblioteca", pinned:"Fijados", recent:"Recientes", logout:"Cerrar sesión",
        camera:"Cámara", photos:"Fotos", files:"Archivos", documents:"Documentos", imageGen:"Generación de imágenes",
        gallery:"Galería", pdf:"PDF", image:"Imagen", video:"Vídeo", audio:"Audio", scanDoc:"Escanear documento",
        addToChat:"Añadir al chat", hello:"Hola", howHelp:"¿Cómo puedo ayudarte hoy?",
        ask:"Pregunta lo que quieras...", powered:"Desarrollado por Synapse", founder:"Fundador",
        version:"Versión", build:"Build", privacy:"Política de privacidad", terms:"Términos de uso",
        licenses:"Licencias de código abierto", web:"Búsqueda web", backup:"Copia de seguridad", restore:"Restaurar",
        security:"Seguridad", voice:"Voz", modelManager:"Gestor de modelos", apiManager:"Gestor de API",
        noApi:"No hay ninguna API conectada", favourites:"Favoritos y recientes", speech:"Entrada y salida de voz",
        liveWeb:"Buscar en la web en directo", appLock:"Bloqueo de la app", uiLanguage:"Idioma de la interfaz",
        offline:"Sin conexión · no se necesita clave", fast:"Rápido · visión · docs", reasoning:"Razonamiento · visión",
        continue:"Continuar", support:"Soporte"
      },
      "Portuguese": {
        settings:"Configurações", help:"Ajuda e suporte", about:"Sobre o KYRO", language:"Idioma",
        chatLanguage:"Idioma do chat", profile:"Perfil", theme:"Tema", changePhoto:"Alterar foto",
        chooseTheme:"Escolher tema", newChat:"Novo chat", projects:"Projetos", scheduled:"Agendado",
        plugins:"Plugins", library:"Biblioteca", pinned:"Fixados", recent:"Recentes", logout:"Sair",
        camera:"Câmera", photos:"Fotos", files:"Arquivos", documents:"Documentos", imageGen:"Geração de imagens",
        gallery:"Galeria", pdf:"PDF", image:"Imagem", video:"Vídeo", audio:"Áudio", scanDoc:"Digitalizar documento",
        addToChat:"Adicionar ao chat", hello:"Olá", howHelp:"Como posso ajudar você hoje?",
        ask:"Pergunte qualquer coisa...", powered:"Desenvolvido por Synapse", founder:"Fundador",
        version:"Versão", build:"Build", privacy:"Política de privacidade", terms:"Termos de uso",
        licenses:"Licenças de código aberto", web:"Pesquisa na web", backup:"Backup", restore:"Restaurar",
        security:"Segurança", voice:"Voz", modelManager:"Gerenciador de modelos", apiManager:"Gerenciador de API",
        noApi:"Nenhuma API conectada", favourites:"Favoritos e recentes", speech:"Entrada e saída de voz",
        liveWeb:"Pesquisar na web ao vivo", appLock:"Bloqueio do app", uiLanguage:"Idioma da interface",
        offline:"Offline · nenhuma chave necessária", fast:"Rápido · visão · docs", reasoning:"Raciocínio · visão",
        continue:"Continuar", support:"Suporte"
      },
      "Russian": {
        settings:"Настройки", help:"Помощь и поддержка", about:"О KYRO", language:"Язык",
        chatLanguage:"Язык чата", profile:"Профиль", theme:"Тема", changePhoto:"Изменить фото",
        chooseTheme:"Выбрать тему", newChat:"Новый чат", projects:"Проекты", scheduled:"Запланировано",
        plugins:"Плагины", library:"Библиотека", pinned:"Закреплённые", recent:"Недавние", logout:"Выйти",
        camera:"Камера", photos:"Фото", files:"Файлы", documents:"Документы", imageGen:"Генерация изображений",
        gallery:"Галерея", pdf:"PDF", image:"Изображение", video:"Видео", audio:"Аудио", scanDoc:"Сканировать документ",
        addToChat:"Добавить в чат", hello:"Здравствуйте", howHelp:"Чем я могу помочь сегодня?",
        ask:"Спросите что угодно...", powered:"Работает на Synapse", founder:"Основатель",
        version:"Версия", build:"Сборка", privacy:"Политика конфиденциальности", terms:"Условия использования",
        licenses:"Лицензии с открытым исходным кодом", web:"Веб-поиск", backup:"Резервная копия", restore:"Восстановить",
        security:"Безопасность", voice:"Голос", modelManager:"Менеджер моделей", apiManager:"Менеджер API",
        noApi:"API не подключён", favourites:"Избранное и недавние", speech:"Речевой ввод и вывод",
        liveWeb:"Искать в интернете в реальном времени", appLock:"Блокировка приложения", uiLanguage:"Язык интерфейса",
        offline:"Офлайн · ключ не нужен", fast:"Быстро · зрение · документы", reasoning:"Рассуждение · зрение",
        continue:"Продолжить", support:"Поддержка"
      },
      "Japanese": {
        settings:"設定", help:"ヘルプとサポート", about:"KYROについて", language:"言語",
        chatLanguage:"チャット言語", profile:"プロフィール", theme:"テーマ", changePhoto:"写真を変更",
        chooseTheme:"テーマを選択", newChat:"新しいチャット", projects:"プロジェクト", scheduled:"予定",
        plugins:"プラグイン", library:"ライブラリ", pinned:"ピン留め", recent:"最近", logout:"ログアウト",
        camera:"カメラ", photos:"写真", files:"ファイル", documents:"ドキュメント", imageGen:"画像生成",
        gallery:"ギャラリー", pdf:"PDF", image:"画像", video:"動画", audio:"音声", scanDoc:"書類をスキャン",
        addToChat:"チャットに追加", hello:"こんにちは", howHelp:"今日はどのようにお手伝いできますか？",
        ask:"何でも聞いてください...", powered:"Synapse搭載", founder:"創設者",
        version:"バージョン", build:"ビルド", privacy:"プライバシーポリシー", terms:"利用規約",
        licenses:"オープンソースライセンス", web:"ウェブ検索", backup:"バックアップ", restore:"復元",
        security:"セキュリティ", voice:"音声", modelManager:"モデル管理", apiManager:"API管理",
        noApi:"API未接続", favourites:"お気に入りと最近使用したもの", speech:"音声入力と出力",
        liveWeb:"ウェブをリアルタイム検索", appLock:"アプリロック", uiLanguage:"UI言語",
        offline:"オフライン · キー不要", fast:"高速 · ビジョン · ドキュメント", reasoning:"推論 · ビジョン",
        continue:"続ける", support:"サポート"
      },
      "Korean": {
        settings:"설정", help:"도움말 및 지원", about:"KYRO 정보", language:"언어",
        chatLanguage:"채팅 언어", profile:"프로필", theme:"테마", changePhoto:"사진 변경",
        chooseTheme:"테마 선택", newChat:"새 채팅", projects:"프로젝트", scheduled:"예약됨",
        plugins:"플러그인", library:"라이브러리", pinned:"고정됨", recent:"최근", logout:"로그아웃",
        camera:"카메라", photos:"사진", files:"파일", documents:"문서", imageGen:"이미지 생성",
        gallery:"갤러리", pdf:"PDF", image:"이미지", video:"비디오", audio:"오디오", scanDoc:"문서 스캔",
        addToChat:"채팅에 추가", hello:"안녕하세요", howHelp:"오늘 무엇을 도와드릴까요?",
        ask:"무엇이든 물어보세요...", powered:"Synapse 제공", founder:"창립자",
        version:"버전", build:"빌드", privacy:"개인정보처리방침", terms:"이용약관",
        licenses:"오픈 소스 라이선스", web:"웹 검색", backup:"백업", restore:"복원",
        security:"보안", voice:"음성", modelManager:"모델 관리자", apiManager:"API 관리자",
        noApi:"연결된 API 없음", favourites:"즐겨찾기 및 최근 항목", speech:"음성 입력 및 출력",
        liveWeb:"실시간 웹 검색", appLock:"앱 잠금", uiLanguage:"UI 언어",
        offline:"오프라인 · 키 필요 없음", fast:"빠름 · 비전 · 문서", reasoning:"추론 · 비전",
        continue:"계속", support:"지원"
      },
      "Chinese": {
        settings:"设置", help:"帮助与支持", about:"关于 KYRO", language:"语言",
        chatLanguage:"聊天语言", profile:"个人资料", theme:"主题", changePhoto:"更换照片",
        chooseTheme:"选择主题", newChat:"新聊天", projects:"项目", scheduled:"已安排",
        plugins:"插件", library:"资料库", pinned:"已固定", recent:"最近", logout:"退出登录",
        camera:"相机", photos:"照片", files:"文件", documents:"文档", imageGen:"图像生成",
        gallery:"图库", pdf:"PDF", image:"图片", video:"视频", audio:"音频", scanDoc:"扫描文档",
        addToChat:"添加到聊天", hello:"你好", howHelp:"今天我能帮你什么？",
        ask:"问点什么吧...", powered:"由 Synapse 提供支持", founder:"创始人",
        version:"版本", build:"构建", privacy:"隐私政策", terms:"使用条款",
        licenses:"开源许可证", web:"网页搜索", backup:"备份", restore:"恢复",
        security:"安全", voice:"语音", modelManager:"模型管理", apiManager:"API 管理",
        noApi:"未连接 API", favourites:"收藏和最近使用", speech:"语音输入和输出",
        liveWeb:"搜索实时网页", appLock:"应用锁", uiLanguage:"界面语言",
        offline:"离线 · 无需密钥", fast:"快速 · 视觉 · 文档", reasoning:"推理 · 视觉",
        continue:"继续", support:"支持"
      }
    },

    /* Extra language names already present in the original picker.
       They fall back gracefully to English for untranslated UI phrases. */
    aliases: {
      "Auto Detect":"English"
    },

    keyText: {
      "Settings":"settings","Help & Support":"help","About KYRO":"about","Language":"language",
      "Chat Language":"chatLanguage","Profile":"profile","Theme":"theme","Change photo":"changePhoto",
      "Choose theme":"chooseTheme","New Chat":"newChat","Projects":"projects","Scheduled":"scheduled",
      "Plugins":"plugins","Library":"library","Pinned":"pinned","Recent":"recent","Logout":"logout",
      "Camera":"camera","Photos":"photos","Files":"files","Documents":"documents","Image Gen":"imageGen",
      "Gallery":"gallery","PDF":"pdf","Image":"image","Video":"video","Audio":"audio","Scan Doc":"scanDoc",
      "Add to chat":"addToChat","Hello, there":"hello","How can I help you today?":"howHelp",
      "Ask anything...":"ask","Powered by Synapse":"powered","Founder":"founder","Version":"version",
      "Build":"build","Privacy Policy":"privacy","Terms of Use":"terms","Open Source Licenses":"licenses",
      "Web Search":"web","Backup":"backup","Restore":"restore","Security":"security","Voice":"voice",
      "Model Manager":"modelManager","API Manager":"apiManager","No API connected":"noApi",
      "Favourites & recents":"favourites","Speech input & output":"speech","Search the live web":"liveWeb",
      "App lock":"appLock","UI Language":"uiLanguage","Offline · no key needed":"offline",
      "Fast · vision · docs":"fast","Reasoning · vision":"reasoning","Continue":"continue","Support":"support"
    }
  };

  function langPack(name){
    return V35.packs[name] || V35.packs[V35.aliases[name] || "English"] || V35.packs.English;
  }

  function setText(selector, key){
    var el=document.querySelector(selector), pack=langPack(window.kyroUILanguage || "English");
    if(el && pack[key]!=null) el.textContent=pack[key];
  }

  function translateExactNodes(){
    var lang=window.kyroUILanguage || "English";
    var pack=langPack(lang);
    var map=V35.keyText;

    /* First pass: remember a semantic key for every translatable element.
       This makes repeated language switching reliable. */
    document.querySelectorAll("button, h1, h2, h3, h4, p, small, span, label, .sb-label, .lbl b, .lbl small").forEach(function(el){
      if(el.children.length && !el.classList.contains("lbl")) return;
      var raw=(el.textContent||"").replace(/\s+/g," ").trim();
      if(!el.getAttribute("data-v35-key")){
        var key=map[raw];
        if(key) el.setAttribute("data-v35-key",key);
        else {
          /* Match a translation from any language pack back to its key. */
          Object.keys(V35.packs).some(function(ln){
            var p=V35.packs[ln];
            return Object.keys(p).some(function(k){
              if(p[k]===raw){ el.setAttribute("data-v35-key",k); return true; }
              return false;
            });
          });
        }
      }
      var semantic=el.getAttribute("data-v35-key");
      if(semantic && pack[semantic]!=null) el.textContent=pack[semantic];
    });

    /* Important fixed UI areas. */
    setText("#settings-title","settings");
    setText("#settings-title-main","settings");
    setText("#profile-sheet-title","profile");
    setText("#about-title","about");
    setText("#help-title","help");
    setText("#greeting-title","hello");

    var homeSub=document.querySelector("#home-view .home-greeting p");
    if(homeSub) homeSub.textContent=pack.howHelp || homeSub.textContent;

    var inp=document.getElementById("msg-input");
    if(inp) inp.placeholder=pack.ask || "Ask anything...";

    var onb=document.getElementById("onboard-continue");
    if(onb) onb.textContent=pack.continue || "Continue";

    /* Settings descriptions: semantic keys survive language changes. */
    var descMap={
      "[data-panel='language'] small":"language",
      "[data-panel='api'] small":"noApi",
      "[data-panel='models'] small":"favourites",
      "[data-panel='voice'] small":"speech",
      "#settings-web-search small":"liveWeb",
      "[data-panel='security'] small":"appLock"
    };
    Object.keys(descMap).forEach(function(sel){
      var el=document.querySelector(sel);
      var key=descMap[sel];
      if(el && pack[key]) el.textContent=pack[key];
    });

    var backup=document.querySelector("#btn-backup small");
    if(backup) backup.textContent = lang==="Hindi"?".kyro फाइल एक्सपोर्ट करें":
      lang==="Urdu"?".kyro فائل برآمد کریں":
      lang==="French"?"Exporter un fichier .kyro":
      lang==="German"?"Eine .kyro-Datei exportieren":
      lang==="Spanish"?"Exportar un archivo .kyro":
      lang==="Japanese"?".kyroファイルを書き出す":
      lang==="Korean"?".kyro 파일 내보내기":
      lang==="Chinese"?"导出 .kyro 文件":
      "Export a .kyro file";

    var restore=document.querySelector("#btn-restore small");
    if(restore) restore.textContent = lang==="Hindi"?".kyro फाइल इम्पोर्ट करें":
      lang==="Urdu"?".kyro فائل درآمد کریں":
      lang==="French"?"Importer un fichier .kyro":
      lang==="German"?"Eine .kyro-Datei importieren":
      lang==="Spanish"?"Importar un archivo .kyro":
      lang==="Japanese"?".kyroファイルを読み込む":
      lang==="Korean"?".kyro 파일 가져오기":
      lang==="Chinese"?"导入 .kyro 文件":
      "Import a .kyro file";

    /* Preserve product/model names but localize their descriptions. */
    document.querySelectorAll("#model-modal-list .model-row").forEach(function(row){
      var small=row.querySelector(".m-info small");
      if(!small) return;
      var raw=small.getAttribute("data-v35-model-desc") || small.textContent.trim();
      small.setAttribute("data-v35-model-desc",raw);
      if(raw.indexOf("Offline")===0) small.textContent=pack.offline || raw;
      else if(raw.indexOf("Fast")===0) small.textContent=pack.fast || raw;
      else if(raw.indexOf("Reasoning")===0) small.textContent=pack.reasoning || raw;
    });
  }

  function applyUILanguage(lang){
    window.kyroUILanguage = lang || "English";
    localStorage.setItem("kyroUILanguage", window.kyroUILanguage);
    document.documentElement.lang = ({Hindi:"hi",Urdu:"ur",Bengali:"bn",Tamil:"ta",Telugu:"te",Gujarati:"gu",Punjabi:"pa",Marathi:"mr",Kannada:"kn",Malayalam:"ml",Odia:"or",Assamese:"as",Nepali:"ne",Arabic:"ar",French:"fr",German:"de",Spanish:"es",Portuguese:"pt",Russian:"ru",Japanese:"ja",Korean:"ko",Chinese:"zh"}[lang] || "en");
    translateExactNodes();
    if(typeof renderMessages==="function") renderMessages();
  }

  /* Replace the original language list handler so tapping a language
     immediately changes the whole visible UI. */
  window.kyroUILanguage = localStorage.getItem("kyroUILanguage") || "English";
  window.kyroChatLanguage = localStorage.getItem("kyroChatLanguage") || "Auto Detect";

  function renderLangList(containerId, current, onSelect){
    var list = document.getElementById(containerId);
    if(!list) return;
    list.innerHTML = '';
    var langs = window.LANGUAGES || ["Auto Detect","English"];
    langs.forEach(function(name){
      var row = document.createElement('div');
      row.className = 'lang-row' + (name===current ? ' active' : '');
      row.innerHTML = '<span>'+name+'</span><svg class="icon check"><use href="#i-check"/></svg>';
      row.addEventListener('click', function(){ onSelect(name); });
      list.appendChild(row);
    });
  }

  window.buildLangLists = function(){
    if(typeof renderLangList!=="function") return;
    renderLangList("lang-list-ui", window.kyroUILanguage, function(v){
      window.kyroUILanguage=v; localStorage.setItem("kyroUILanguage",v);
      applyUILanguage(v);
      if(typeof buildLangLists==="function") buildLangLists();
      if(typeof toast==="function") toast((langPack(v).language||"Language")+": "+v);
    });
    renderLangList("lang-list-chat", window.kyroChatLanguage, function(v){
      window.kyroChatLanguage=v; localStorage.setItem("kyroChatLanguage",v);
      if(typeof toast==="function") toast((langPack(window.kyroUILanguage).chatLanguage||"Chat Language")+": "+v);
    });
    translateExactNodes();
  };

  /* Language-aware Demo responses. */
  var replies = {
    "Hindi": {
      founder:"KYRO के Founder MR. NITIN KUSHWAHA हैं। उन्होंने इसका concept अपनी जरूरत और vision से शुरू किया और इसे लगातार सीखते और develop करते हुए आगे बढ़ाया।",
      capabilities:"हाँ, मैं KYRO हूँ। App, models, photos/files, voice, themes, profile, Settings और Web Search—इन सब में मदद कर सकता हूँ।",
      howto:"ऊपर model name पर tap करके model बदलें। Menu के लिए hamburger दबाएँ। Plus से फोटो/फाइल attach करें, Mic से voice input लें और Settings से language व Web Search manage करें।",
      models:"इस build में KYRO, KYRO 1 और KYRO 1.2 हैं। Web Search Settings से manage होता है।",
      web:"Web Search को Settings में जाकर on/off किया जा सकता है।",
      demo:"Demo Mode offline/local scripted है। Live AI response के लिए connection चाहिए।",
      greet:"नमस्ते! मैं KYRO हूँ। मैं ऐप और इसके features के बारे में आपकी मदद कर सकता हूँ।"
    },
    "Urdu": {
      founder:"اس ایپ کے Founder MR. NITIN KUSHWAHA ہیں۔",
      capabilities:"میں KYRO ہوں۔ میں بنیادی گفتگو اور KYRO ایپ کے features، models، files، voice، themes، profile، Settings اور Web Search کے بارے میں مدد کر سکتا ہوں۔",
      howto:"اوپر model name پر tap کرکے model بدلیں۔ Menu کے لیے hamburger دبائیں۔ Plus سے photo/file attach کریں، Mic سے voice input لیں اور Settings سے language و Web Search manage کریں۔",
      models:"اس build میں KYRO، KYRO 1 اور KYRO 1.2 ہیں۔ Web Search Settings سے manage ہوتا ہے۔",
      web:"Web Search کو Settings میں جا کر on/off کیا جا سکتا ہے۔",
      demo:"Demo Mode offline/local scripted ہے۔ Live AI response کے لیے connection چاہیے۔",
      greet:"السلام علیکم! میں KYRO ہوں۔ میں ایپ اور اس کے features کے بارے میں مدد کر سکتا ہوں۔"
    },
    "Bengali": {
      founder:"এই অ্যাপের Founder হলেন MR. NITIN KUSHWAHA।",
      capabilities:"আমি KYRO। আমি সাধারণ কথোপকথন এবং KYRO-এর features, models, files, voice, themes, profile, Settings ও Web Search সম্পর্কে সাহায্য করতে পারি।",
      howto:"উপরের model name-এ ট্যাপ করে model বদলান। Menu-এর জন্য hamburger চাপুন। Plus দিয়ে photo/file attach করুন এবং Settings থেকে language ও Web Search পরিচালনা করুন।",
      models:"এই build-এ KYRO, KYRO 1 এবং KYRO 1.2 আছে। Web Search Settings থেকে পরিচালিত হয়।",
      web:"Web Search Settings থেকে on/off করা যায়।",
      demo:"Demo Mode offline/local scripted। Live AI response-এর জন্য connection দরকার।",
      greet:"নমস্কার! আমি KYRO। অ্যাপ ও এর features সম্পর্কে সাহায্য করতে পারি।"
    },
    "Tamil": {
      founder:"இந்த செயலியின் Founder MR. NITIN KUSHWAHA.",
      capabilities:"நான் KYRO. அடிப்படை உரையாடல் மற்றும் KYRO-வின் features, models, files, voice, themes, profile, Settings, Web Search பற்றி உதவ முடியும்.",
      howto:"மேலுள்ள model name-ஐ தட்டி model மாற்றலாம். Menu-க்கு hamburger அழுத்துங்கள். Plus மூலம் photo/file சேர்த்து, Settings-ல் language மற்றும் Web Search நிர்வகிக்கலாம்.",
      models:"இந்த build-ல் KYRO, KYRO 1, KYRO 1.2 உள்ளன. Web Search Settings-ல் நிர்வகிக்கப்படுகிறது.",
      web:"Web Search-ஐ Settings-ல் on/off செய்யலாம்.",
      demo:"Demo Mode offline/local scripted. Live AI பதிலுக்கு connection தேவை.",
      greet:"வணக்கம்! நான் KYRO. இந்த app மற்றும் அதன் features பற்றி உதவ முடியும்."
    },
    "Telugu": {
      founder:"ఈ యాప్ Founder MR. NITIN KUSHWAHA.",
      capabilities:"నేను KYRO. సాధారణ సంభాషణతో పాటు KYRO features, models, files, voice, themes, profile, Settings, Web Search గురించి సహాయం చేయగలను.",
      howto:"పై model name పై tap చేసి model మార్చండి. Menu కోసం hamburger నొక్కండి. Plus ద్వారా photo/file జోడించండి. Settingsలో language మరియు Web Search మార్చవచ్చు.",
      models:"ఈ buildలో KYRO, KYRO 1, KYRO 1.2 ఉన్నాయి. Web Search Settingsలో నిర్వహించబడుతుంది.",
      web:"Web Searchను Settingsలో on/off చేయవచ్చు.",
      demo:"Demo Mode offline/local scripted. Live AI response కోసం connection అవసరం.",
      greet:"నమస్కారం! నేను KYRO. యాప్ మరియు దాని features గురించి సహాయం చేయగలను."
    },
    "Arabic": {
      founder:"مؤسس هذا التطبيق هو MR. NITIN KUSHWAHA.",
      capabilities:"أنا KYRO. أستطيع المساعدة في المحادثة الأساسية وميزات التطبيق والنماذج والملفات والصوت والسمات والملف الشخصي والإعدادات وبحث الويب.",
      howto:"اضغط على اسم النموذج في الأعلى لتغييره. افتح القائمة من زر القائمة. استخدم Plus لإضافة الصور والملفات، ومن الإعدادات غيّر اللغة وWeb Search.",
      models:"تتضمن هذه النسخة KYRO وKYRO 1 وKYRO 1.2. تتم إدارة Web Search من الإعدادات.",
      web:"يمكن تشغيل أو إيقاف Web Search من الإعدادات.",
      demo:"وضع Demo يعمل محلياً وبردود مبرمجة. للحصول على رد مباشر من AI تحتاج إلى connection متصل.",
      greet:"مرحباً! أنا KYRO ويمكنني مساعدتك بشأن التطبيق وميزاته."
    },
    "French": {
      founder:"Le fondateur de cette application est MR. NITIN KUSHWAHA.",
      capabilities:"Je suis KYRO. Je peux aider pour les conversations de base et expliquer les fonctions, modèles, fichiers, voix, thèmes, profil, paramètres et recherche Web.",
      howto:"Touchez le nom du modèle en haut pour le changer. Ouvrez le menu avec le bouton hamburger. Utilisez Plus pour ajouter des photos/fichiers et les Paramètres pour la langue et la recherche Web.",
      models:"Cette version propose KYRO, KYRO 1 et KYRO 1.2. La recherche Web se gère dans les Paramètres.",
      web:"La recherche Web peut être activée ou désactivée dans les Paramètres.",
      demo:"Le mode Demo est local et scripté. Une connection est nécessaire pour une réponse IA en direct.",
      greet:"Bonjour ! Je suis KYRO et je peux vous aider avec l’application et ses fonctions."
    },
    "German": {
      founder:"Der Gründer dieser App ist MR. NITIN KUSHWAHA.",
      capabilities:"Ich bin KYRO. Ich kann bei grundlegenden Gesprächen helfen und Funktionen, Modelle, Dateien, Sprache, Themes, Profil, Einstellungen und Websuche erklären.",
      howto:"Tippe oben auf den Modellnamen, um das Modell zu wechseln. Öffne das Menü über den Hamburger-Button. Mit Plus kannst du Fotos/Dateien hinzufügen; Sprache und Websuche findest du in den Einstellungen.",
      models:"Diese Version enthält KYRO, KYRO 1 und KYRO 1.2. Die Websuche wird in den Einstellungen verwaltet.",
      web:"Die Websuche kann in den Einstellungen ein- oder ausgeschaltet werden.",
      demo:"Der Demo-Modus arbeitet offline/lokal mit Skriptantworten. Für Live-KI ist eine verbundene API/ein Provider nötig.",
      greet:"Hallo! Ich bin KYRO und helfe dir mit der App und ihren Funktionen."
    },
    "Spanish": {
      founder:"El fundador de esta aplicación es MR. NITIN KUSHWAHA.",
      capabilities:"Soy KYRO. Puedo ayudar con conversaciones básicas y explicar funciones, modelos, archivos, voz, temas, perfil, ajustes y búsqueda web.",
      howto:"Toca el nombre del modelo arriba para cambiarlo. Abre el menú con el botón hamburguesa. Usa Plus para adjuntar fotos/archivos y Ajustes para gestionar idioma y búsqueda web.",
      models:"Esta versión incluye KYRO, KYRO 1 y KYRO 1.2. La búsqueda web se gestiona desde Ajustes.",
      web:"La búsqueda web se puede activar o desactivar desde Ajustes.",
      demo:"El modo Demo es local y con respuestas programadas. Para respuestas de IA en directo se necesita una API/proveedor conectado.",
      greet:"¡Hola! Soy KYRO y puedo ayudarte con la aplicación y sus funciones."
    },
    "Portuguese": {
      founder:"O fundador deste aplicativo é MR. NITIN KUSHWAHA.",
      capabilities:"Eu sou o KYRO. Posso ajudar em conversas básicas e explicar recursos, modelos, arquivos, voz, temas, perfil, configurações e pesquisa na Web.",
      howto:"Toque no nome do modelo no topo para mudar. Abra o menu pelo botão de três linhas. Use Plus para anexar fotos/arquivos e Configurações para idioma e pesquisa Web.",
      models:"Esta versão inclui KYRO, KYRO 1 e KYRO 1.2. A pesquisa Web é gerenciada em Configurações.",
      web:"A pesquisa Web pode ser ativada ou desativada em Configurações.",
      demo:"O Demo Mode é local e baseado em respostas programadas. Para respostas de IA ao vivo é necessária uma API/provedor conectado.",
      greet:"Olá! Sou o KYRO e posso ajudar com o aplicativo e seus recursos."
    },
    "Russian": {
      founder:"Основатель этого приложения — MR. NITIN KUSHWAHA.",
      capabilities:"Я KYRO. Я могу помогать с базовым общением и объяснять функции, модели, файлы, голос, темы, профиль, настройки и веб-поиск.",
      howto:"Нажмите на имя модели сверху, чтобы сменить модель. Откройте меню кнопкой с тремя линиями. Через Plus добавляйте фото/файлы, а язык и веб-поиск меняйте в настройках.",
      models:"В этой версии есть KYRO, KYRO 1 и KYRO 1.2. Веб-поиск управляется в настройках.",
      web:"Веб-поиск можно включить или отключить в настройках.",
      demo:"Demo Mode работает локально и использует сценарные ответы. Для живого ответа ИИ нужен подключённый connection.",
      greet:"Здравствуйте! Я KYRO и могу помочь с приложением и его функциями."
    },
    "Japanese": {
      founder:"このアプリの創設者は MR. NITIN KUSHWAHA です。",
      capabilities:"私はKYROです。基本的な会話、機能、モデル、ファイル、音声、テーマ、プロフィール、設定、Web検索について案内できます。",
      howto:"上部のモデル名をタップしてモデルを変更します。メニューボタンでメニューを開きます。Plusで写真やファイルを追加し、設定から言語とWeb検索を管理できます。",
      models:"このビルドにはKYRO、KYRO 1、KYRO 1.2があります。Web検索は設定から管理します。",
      web:"Web検索は設定からオン・オフできます。",
      demo:"Demo Modeはオフラインのローカルなスクリプト応答です。ライブAIには接続されたAPI/providerが必要です。",
      greet:"こんにちは！私はKYROです。アプリと機能についてお手伝いできます。"
    },
    "Korean": {
      founder:"이 앱의 창립자는 MR. NITIN KUSHWAHA입니다.",
      capabilities:"저는 KYRO입니다. 기본 대화와 앱의 기능, 모델, 파일, 음성, 테마, 프로필, 설정, 웹 검색에 대해 안내할 수 있습니다.",
      howto:"상단의 모델 이름을 눌러 모델을 변경하세요. 메뉴 버튼으로 메뉴를 엽니다. Plus로 사진/파일을 추가하고 설정에서 언어와 웹 검색을 관리하세요.",
      models:"이 빌드에는 KYRO, KYRO 1, KYRO 1.2가 있습니다. 웹 검색은 설정에서 관리합니다.",
      web:"웹 검색은 설정에서 켜거나 끌 수 있습니다.",
      demo:"Demo Mode는 오프라인/로컬 스크립트 응답입니다. 실시간 AI 응답에는 연결된 API/provider가 필요합니다.",
      greet:"안녕하세요! 저는 KYRO이며 앱과 기능에 대해 도와드릴 수 있습니다."
    },
    "Chinese": {
      founder:"这个应用的创始人是 MR. NITIN KUSHWAHA。",
      capabilities:"我是 KYRO。我可以进行基础对话，并介绍应用功能、模型、文件、语音、主题、个人资料、设置和网页搜索。",
      howto:"点击顶部的模型名称即可切换模型。点击菜单按钮打开菜单。使用 Plus 添加照片/文件，并在设置中管理语言和网页搜索。",
      models:"此版本包含 KYRO、KYRO 1 和 KYRO 1.2。网页搜索在设置中管理。",
      web:"可以在设置中开启或关闭网页搜索。",
      demo:"Demo Mode 使用离线本地脚本回复。要获得实时 AI 回复，需要连接 API/provider。",
      greet:"你好！我是 KYRO，可以帮助你了解应用和它的功能。"
    }
  };

  function localizedDemo(text, fallback){
    var lang=window.kyroChatLanguage || window.kyroUILanguage || "English";
    if(lang==="Auto Detect" || lang==="English" || !replies[lang]) return fallback;
    var t=String(text||"").toLowerCase();
    var r=replies[lang];
    if(/founder|फाउंडर|owner|किसने बनाया|बनाने वाला|नितिन|foundateur|gründer|fundador|創設者|창립자|创始人|مؤسس/.test(t)) return r.founder;
    if(/what.*can|क्या.*कर|capabilit|feature|फीचर|क्या.*काम|क्या.*कर सकते|fonction|funktion|función|recurso|機能|기능|功能/.test(t)) return r.capabilities;
    if(/how.*use|कैसे.*चल|कैसे.*use|guide|मदद|help|aide|hilfe|ayuda|ajuda|как.*использ|使い方|사용|怎么用/.test(t)) return r.howto;
    if(/model|मॉडल|gemini|flash|pro/.test(t)) return r.models;
    if(/web|वेब|search|सर्च|internet|интернет|ウェブ|웹|网页/.test(t)) return r.web;
    if(/demo|डेमो|offline|ऑफलाइन/.test(t)) return r.demo;
    if(/^(hi|hello|hey|नमस्ते|हेलो|हाय|سلام|bonjour|hallo|hola|olá|здрав|こんにちは|안녕|你好)\b/i.test(t)) return r.greet;
    return fallback;
  }

  /* Patch the app's knowledge function so Demo replies follow Chat Language. */
  if(typeof window.appKnowledgeReply==="function"){
    var oldKnowledge=window.appKnowledgeReply;
    window.appKnowledgeReply=function(q){
      var base=oldKnowledge(q);
      return localizedDemo(q,base);
    };
  }

  /* Connected Gemini: request the selected chat language explicitly. */
  var langInstructionMap={
    "Hindi":"हिंदी में जवाब दें।","Hinglish":"हिंग्लिश (Roman Hindi) में जवाब दें।","Urdu":"اردو میں جواب دیں۔",
    "Bengali":"বাংলায় উত্তর দিন।","Tamil":"தமிழில் பதிலளிக்கவும்।","Telugu":"తెలుగులో సమాధానం ఇవ్వండి।",
    "Gujarati":"ગુજરાતીમાં જવાબ આપો.","Punjabi":"ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ.","Marathi":"मराठीत उत्तर द्या.",
    "Kannada":"ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ.","Malayalam":"മലയാളത്തിൽ മറുപടി നൽകുക.","Odia":"ଓଡ଼ିଆରେ ଉତ୍ତର ଦିଅନ୍ତୁ.",
    "Assamese":"অসমীয়াত উত্তৰ দিয়ক।","Nepali":"नेपालीमा उत्तर दिनुहोस्।","Arabic":"أجب باللغة العربية.",
    "French":"Répondez en français.","German":"Antworten Sie auf Deutsch.","Spanish":"Responde en español.",
    "Portuguese":"Responda em português.","Russian":"Отвечайте на русском языке.","Japanese":"日本語で回答してください。",
    "Korean":"한국어로 답변하세요.","Chinese":"请用中文回答。"
  };
  window.kyroV35LanguageInstruction=function(){
    var l=window.kyroChatLanguage||window.kyroUILanguage||"English";
    return langInstructionMap[l] || "";
  };

  /* Keep the existing send/liveReply logic intact; add a language prefix only
     when a connected provider is used. */
  var oldLiveReply=window.liveReply;
  if(typeof oldLiveReply==="function"){
    window.liveReply=function(c,userText){
      var ins=window.kyroV35LanguageInstruction();
      return oldLiveReply(c, ins ? ins+" "+userText : userText);
    };
  }

  document.addEventListener("DOMContentLoaded",function(){
    applyUILanguage(window.kyroUILanguage);
    /* Settings photo-change control is deliberately unavailable here. */
    var card=document.querySelector("#modal-settings .profile-photo-card");
    if(card) card.remove();
  });
})();

(function(){
  /* Skip legacy name-gate functions if this build contains them. */
  window.kyroSkipNameOnboarding = true;

  function bypass(){
    var ids=['onboard-name','onboard-name-input','name-input','onboard-continue'];
    ids.forEach(function(id){
      var el=document.getElementById(id);
      if(el) el.disabled=false;
    });

    /* If the legacy onboarding overlay is still present, hide it. */
    ['onboard','onboarding','onboard-screen','onboard-modal','name-step','name-onboarding-step']
      .forEach(function(id){
        var el=document.getElementById(id);
        if(el) el.style.display='none';
      });

    /* Never block the app just because userName is empty. */
    try{
      if(window.state && typeof window.state.userName === 'undefined'){
        window.state.userName = '';
      }
    }catch(e){}
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', bypass);
  }else{
    bypass();
  }
})();

(function(){
  const state = window.kyroAppState;
  "use strict";

  const KYRO_RECAPTCHA_ENTERPRISE_SITE_KEY = "6LfHnoAtAAAAAO3zvsFHCgtrKhY0gP4XIz1CWHMp";

  const firebaseConfig = {
    apiKey: "AIzaSyAE4yBrTgU4Z8FxdBMNM0yUJpYrTqShgUI",
    authDomain: "kyro-ac005.firebaseapp.com",
    projectId: "kyro-ac005",
    storageBucket: "kyro-ac005.firebasestorage.app",
    messagingSenderId: "727432625748",
    appId: "1:727432625748:web:04e52ab453fba0468af7c1"
  };

  let auth, db, saveTimer;
  window.kyroFirebaseUser = null;
  window.kyroLoginApproved = false;
  window.kyroPendingGoogleLogin = false;

  function setStatus(message,error){
    const el=document.getElementById("firebase-auth-status");
    if(el){el.textContent=message||"";el.className="auth-status"+(error?" error":"");}
  }

  function showGate(){
    const gate=document.getElementById("firebase-auth-gate");
    const appEl=document.getElementById("app");
    /* Never throw a remembered local user back to the login screen because
       of a focus/context-menu/selection event (for example Android long
       press -> Select/Copy). Only an explicit logout may show the gate. */
    let remembered=false, explicitlyLoggedOut=false;
    try{
      remembered=localStorage.getItem("kyroRememberedLogin")==="1";
      explicitlyLoggedOut=localStorage.getItem("kyroExplicitLogout")==="1";
    }catch(e){}
    if((window.kyroLoginApproved || window.kyroAutoLocalLogin || (remembered && !explicitlyLoggedOut)) && !explicitlyLoggedOut){
      if(gate) gate.hidden=true;
      if(appEl && appEl.hidden && !document.body.classList.contains("kyro-booting")) appEl.hidden=false;
      document.body.classList.remove("kyro-booting");
      return;
    }
    if(gate) gate.hidden=false;
    if(appEl) appEl.hidden=true;
    document.body.classList.remove("kyro-booting");
  }

  function startAppBoot(){
    // Restore the saved Gemini key before the UI/chat becomes available.
    try{ ensureGeminiModelForSavedKey(); }catch(e){ console.warn('KYRO saved API restore:',e); }
    const gate=document.getElementById("firebase-auth-gate");
    const splash=document.getElementById("splash");
    const appEl=document.getElementById("app");
    // Only ignore duplicate calls when the app is already visibly open.
    if(window.kyroLoginApproved && appEl && !appEl.hidden && (!splash || splash.hidden)) return;
    window.kyroLoginApproved=true;
    if(gate) gate.hidden=true;
    if(appEl) appEl.hidden=true;

    document.body.classList.add("kyro-booting");
    if(splash){
      splash.hidden=false;
      splash.classList.remove("leaving");
    }

    /* Realme-style KYRO boot animation: login -> logo animation -> app. */
    let finished=false;
    const finishBoot=function(){
      if(finished) return;
      finished=true;
      try{
        if(splash) splash.classList.add("leaving");
        setTimeout(function(){
          if(splash) splash.hidden=true;
          document.body.classList.remove("kyro-booting");
          if(appEl) appEl.hidden=false;
          if(typeof window.kyroShowAppAfterLogin==="function"){
            window.kyroShowAppAfterLogin();
          }
          try{ window.dispatchEvent(new Event("kyro-app-ready")); }catch(_){ }
          try{ if(typeof window.kyroMaybeShowFirstRunPermissions==="function") window.kyroMaybeShowFirstRunPermissions(); }catch(_){ }
        },650);
      }catch(e){
        console.error("KYRO boot transition:",e);
        if(splash) splash.hidden=true;
        document.body.classList.remove("kyro-booting");
        if(appEl) appEl.hidden=false;
      }
    };
    setTimeout(finishBoot,2900);
    // Never leave the user on the logo forever if a browser blocks a
    // transition/timer or an animation frame is interrupted.
    setTimeout(finishBoot,5200);
  }

  window.kyroShowAppAfterLogin=function(){
    const gate=document.getElementById("firebase-auth-gate");
    const appEl=document.getElementById("app");
    const onboard=document.getElementById("onboard");
    if(gate) gate.hidden=true;
    if(onboard) onboard.hidden=true;
    if(appEl) appEl.hidden=false;
    const u=window.kyroFirebaseUser;
    if(u){
      state.userName=u.displayName || state.userName || "";
      state.userPhoto=u.photoURL || state.userPhoto || "";
      try{localStorage.setItem("kyroUserPhoto",state.userPhoto||"");}catch(e){}
      renderProfilePhoto();
      if(typeof renderSidebarChats==="function") renderSidebarChats();
    }
  };

  async function sha256(value){
    const text=String(value);
    try{
      if(window.crypto && crypto.subtle && window.TextEncoder){
        const data=new TextEncoder().encode(text);
        const hash=await crypto.subtle.digest("SHA-256",data);
        return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
      }
    }catch(e){ console.warn("KYRO secure hash unavailable; using compatibility hash.",e); }

    // Compatibility fallback for file/content:// viewers where Web Crypto
    // is unavailable. This keeps the local-only login functional.
    let h1=2166136261>>>0, h2=16777619>>>0;
    for(let i=0;i<text.length;i++){
      const c=text.charCodeAt(i);
      h1^=c; h1=Math.imul(h1,16777619)>>>0;
      h2^=(c+i); h2=Math.imul(h2,2246822519)>>>0;
    }
    return h1.toString(16).padStart(8,"0")+h2.toString(16).padStart(8,"0");
  }


  function randomPart(n){
    const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out="";
    const a=new Uint32Array(n);
    crypto.getRandomValues(a);
    for(let i=0;i<n;i++) out+=chars[a[i]%chars.length];
    return out;
  }


  /* KYRO persistent device account store */
  var KYRO_PERSISTENT_ACCOUNT_CACHE=null;
  var KYRO_ACCOUNT_DB="KYRO_DEVICE_ACCOUNT_DB_V1";
  var KYRO_ACCOUNT_STORE="account";
  function kyroOpenAccountDB(){
    return new Promise(function(resolve,reject){
      try{
        if(!window.indexedDB)return reject(new Error("IndexedDB unavailable"));
        var r=indexedDB.open(KYRO_ACCOUNT_DB,1);
        r.onupgradeneeded=function(){try{if(!r.result.objectStoreNames.contains(KYRO_ACCOUNT_STORE))r.result.createObjectStore(KYRO_ACCOUNT_STORE,{keyPath:"id"});}catch(_){}};
        r.onsuccess=function(){resolve(r.result);};
        r.onerror=function(){reject(r.error||new Error("IndexedDB open failed"));};
      }catch(e){reject(e);}
    });
  }
  async function kyroPersistAccount(acc){
    if(!acc||!acc.username)return false;
    KYRO_PERSISTENT_ACCOUNT_CACHE=acc;
    try{
      var db=await kyroOpenAccountDB();
      await new Promise(function(resolve,reject){
        var tx=db.transaction(KYRO_ACCOUNT_STORE,"readwrite");
        tx.objectStore(KYRO_ACCOUNT_STORE).put({id:"primary",username:acc.username,passwordHash:acc.passwordHash,createdAt:acc.createdAt||Date.now(),updatedAt:acc.updatedAt||Date.now()});
        tx.oncomplete=resolve; tx.onerror=function(){reject(tx.error||new Error("IndexedDB write failed"));};
      });
      try{db.close();}catch(_){}
      return true;
    }catch(e){return false;}
  }
  async function kyroLoadAccount(){
    if(KYRO_PERSISTENT_ACCOUNT_CACHE&&KYRO_PERSISTENT_ACCOUNT_CACHE.username)return KYRO_PERSISTENT_ACCOUNT_CACHE;
    try{
      var db=await kyroOpenAccountDB();
      var acc=await new Promise(function(resolve,reject){
        var tx=db.transaction(KYRO_ACCOUNT_STORE,"readonly"), r=tx.objectStore(KYRO_ACCOUNT_STORE).get("primary");
        r.onsuccess=function(){resolve(r.result||null);}; r.onerror=function(){reject(r.error||new Error("IndexedDB read failed"));};
      });
      try{db.close();}catch(_){}
      if(acc&&acc.username){
        KYRO_PERSISTENT_ACCOUNT_CACHE={username:acc.username,passwordHash:acc.passwordHash,createdAt:acc.createdAt,updatedAt:acc.updatedAt};
        return KYRO_PERSISTENT_ACCOUNT_CACHE;
      }
    }catch(e){}
    return null;
  }
  function kyroMirrorAccountToLocalStorage(acc){
    if(!acc||!acc.username)return;
    try{
      localStorage.setItem("kyroLocalAccountV4",JSON.stringify(acc));
      localStorage.setItem("kyroLocalAccountV3",JSON.stringify(acc));
      localStorage.setItem("kyroUserName",acc.username);
      localStorage.setItem("kyroRememberedLogin","1");
      localStorage.removeItem("kyroExplicitLogout");
    }catch(_){}
  }

  function getLocalAccount(){
    try{
      const raw4=localStorage.getItem("kyroLocalAccountV4");
      const raw3=localStorage.getItem("kyroLocalAccountV3");
      const raw=raw4 || raw3;
      if(!raw){
        if(KYRO_PERSISTENT_ACCOUNT_CACHE&&KYRO_PERSISTENT_ACCOUNT_CACHE.username)return KYRO_PERSISTENT_ACCOUNT_CACHE;
        return null;
      }
      const acc=JSON.parse(raw);
      if(!acc || !acc.username) return null;
      // Migrate a legacy record without changing the visible login flow.
      if(!acc.passwordHash && typeof acc.password==="string"){
        return {username:acc.username,passwordHash:acc.password,createdAt:acc.createdAt||Date.now()};
      }
      return acc;
    }catch(e){ return null; }
  }

  async function createLocalAccount(username,password){
    username=(username||"").trim();
    if(!/^[A-Za-z0-9._-]{3,32}$/.test(username)){
      throw new Error("Username must be 3–32 characters: letters, numbers, . _ or -");
    }
    if(!password || password.length<6) throw new Error("Password must be at least 6 characters.");

    /*
      Device-local account policy:
      - There is one local KYRO account per browser/device.
      - Creating the account with the same username is treated as a
        deliberate password reset/update, not as a fatal "existing account"
        condition. This avoids the old dead-end state after a previous failed
        signup.
      - Password is never stored in plain text.
    */
    const existing=getLocalAccount();
    const hash=await sha256(password);
    const acc={
      username: existing && existing.username &&
                existing.username.toLowerCase()===username.toLowerCase()
                ? existing.username : username,
      passwordHash:hash,
      createdAt:(existing && existing.createdAt) || Date.now(),
      updatedAt:Date.now()
    };
    var localSaved=false;
    try{
      localStorage.setItem("kyroLocalAccountV4",JSON.stringify(acc));
      localStorage.setItem("kyroLocalAccountV3",JSON.stringify(acc));
      localStorage.setItem("kyroUserName",acc.username);
      localSaved=true;
    }catch(e){}
    var durableSaved=await kyroPersistAccount(acc);
    if(!localSaved&&!durableSaved)throw new Error("This browser cannot save the local account. Enable site storage and try again.");
    try{localStorage.setItem("kyroRememberedLogin","1");}catch(e){}
    return acc;
  }

  function clearAuthFields(){
    ["kyro-login-username","kyro-login-password","kyro-confirm-password"].forEach(function(id){
      const el=document.getElementById(id);
      if(el) el.value="";
    });
  }

  function setAuthMode(mode){
    window.kyroAuthMode=mode==="signup"?"signup":"login";
    const signup=window.kyroAuthMode==="signup";
    const title=document.getElementById("kyro-auth-title");
    const subtitle=document.getElementById("kyro-auth-subtitle");
    const confirm=document.getElementById("kyro-confirm-wrap");
    const confirmInput=document.getElementById("kyro-confirm-password");
    const switchBtn=document.getElementById("kyro-auth-switch");
    const primary=document.getElementById("kyro-local-login");
    const note=document.getElementById("kyro-generated-note");
    if(title) title.innerHTML=signup ? 'Create <span class="kyro-word">KYR<span class="kyro-o">O</span></span> account' : 'Welcome to <span class="kyro-word">KYR<span class="kyro-o">O</span></span>';
    if(subtitle) subtitle.textContent=signup?"Set your username and password to continue":"Sign in to continue";
    if(confirm) confirm.hidden=!signup;
    if(confirmInput) confirmInput.value="";
    document.querySelectorAll(".password-toggle").forEach(function(btn){ setPasswordFieldVisibility(btn,false); });
    if(primary) primary.textContent="Continue";
    if(switchBtn) switchBtn.textContent=signup?"Already have an account? Sign in":"Create account";
    if(note && !signup) note.textContent="";
    if(note && signup) note.textContent="Your account stays on this device. Enter your username and password to continue.";
    const user=document.getElementById("kyro-login-username");
    const pw=document.getElementById("kyro-login-password");
    if(user){
      user.autocomplete=signup?"new-username":"username";
      user.setAttribute("data-form-type",signup?"signup":"login");
    }
    if(pw) pw.autocomplete=signup?"new-password":"current-password";
  }

  async function localLogin(){
    const u=document.getElementById("kyro-login-username");
    const pw=document.getElementById("kyro-login-password");
    const confirm=document.getElementById("kyro-confirm-password");
    const username=(u&&u.value||"").trim();
    const password=(pw&&pw.value||"");

    if(!username || !password){
      setStatus("Enter your username and password.",true); return;
    }

    if(window.kyroAuthMode==="signup"){
      if(!confirm || confirm.value!==password){
        setStatus("Passwords do not match.",true); return;
      }
      try{
        const acc=await createLocalAccount(username,password);
        state.userName=acc.username;
        try{
          localStorage.setItem("kyroRememberedLogin","1");
          localStorage.removeItem("kyroExplicitLogout");
          localStorage.setItem("kyroAuthInstallId",window.KYRO_AUTH_INSTALL_ID);
        }catch(e){}
        syncKyroGreeting();
        setStatus("Account saved. Starting KYRO…");
        // Account creation is itself a successful login: open KYRO immediately.
        startAppBoot();
      }catch(e){
        console.error("KYRO local signup:",e);
        setStatus((e && e.message) ? e.message : "Could not save the account. Please try again.",true);
      }
      return;
    }

    const acc=getLocalAccount();
    if(!acc){
      setStatus("No account found on this device. Tap Create account first.",true);
      return;
    }
    if(username.toLowerCase()!==String(acc.username).toLowerCase() ||
       (await sha256(password))!==acc.passwordHash){
      setStatus("Username or password is incorrect.",true); return;
    }

    window.kyroFirebaseUser=null;
    state.userName=acc.username;
    try{
      localStorage.setItem("kyroUserName",acc.username);
      localStorage.setItem("kyroRememberedLogin","1");
      localStorage.removeItem("kyroExplicitLogout");
      localStorage.setItem("kyroAuthInstallId",window.KYRO_AUTH_INSTALL_ID);
    }catch(e){}
    syncKyroGreeting();
    setStatus("Login successful. Starting KYRO…");
    startAppBoot();
  }

  window.kyroLoginApproved=false;

  function setPasswordFieldVisibility(button, visible){
    const id=button && button.getAttribute("data-target");
    const input=id ? document.getElementById(id) : null;
    if(!input) return;
    input.type=visible ? "text" : "password";
    const use=button.querySelector("use");
    if(use) use.setAttribute("href", visible ? "#i-eyeoff" : "#i-eye");
    button.setAttribute("aria-label", visible ? "Hide password" : "Show password");
    button.setAttribute("title", visible ? "Hide password" : "Show password");
  }

  function initPasswordToggles(){
    document.querySelectorAll(".password-toggle").forEach(function(button){
      button.addEventListener("click",function(e){
        e.preventDefault();
        e.stopPropagation();
        const id=button.getAttribute("data-target");
        const input=id ? document.getElementById(id) : null;
        setPasswordFieldVisibility(button, !!input && input.type==="password");
        if(input) input.focus({preventScroll:true});
      });
    });
  }

  function resetPasswordToggles(){
    document.querySelectorAll(".password-toggle").forEach(function(button){
      setPasswordFieldVisibility(button,false);
    });
  }

  function initAuthPolicy(){
    const open=document.getElementById("kyro-auth-privacy");
    const close=document.getElementById("kyro-auth-policy-close");
    const panel=document.getElementById("kyro-auth-policy");
    if(!open || !close || !panel) return;
    const hide=function(){
      panel.hidden=true;
      panel.setAttribute("aria-hidden","true");
      document.body.style.overflow="";
    };
    open.addEventListener("click",function(){
      panel.hidden=false;
      panel.setAttribute("aria-hidden","false");
      document.body.style.overflow="hidden";
    });
    close.addEventListener("click",hide);
    panel.addEventListener("click",function(e){
      if(e.target===panel) hide();
    });
    document.addEventListener("keydown",function(e){
      if(e.key==="Escape" && !panel.hidden) hide();
    });
  }

  function initLocalAuthUI(){
    const switchBtn=document.getElementById("kyro-auth-switch");
    if(switchBtn) switchBtn.addEventListener("click",function(){
      setStatus("");
      clearAuthFields();
      setAuthMode(window.kyroAuthMode==="signup"?"login":"signup");
    });
    clearAuthFields();
    resetPasswordToggles();
    initPasswordToggles();
    initAuthPolicy();
    setAuthMode("login");
    // Mobile browsers may autofill after initial paint; clear the first-launch fields again.
    setTimeout(function(){ clearAuthFields(); resetPasswordToggles(); },120);
    setTimeout(function(){ clearAuthFields(); resetPasswordToggles(); },500);
  }

  function cleanState(){
    try{
      const copy=JSON.parse(JSON.stringify(state));
      delete copy.pendingAttachments;
      delete copy.recognizing;
      delete copy.isGenerating;
      delete copy.apiKeys;
      return copy;
    }catch(e){return null;}
  }

  function saveUserData(){
    if(!db || !window.kyroFirebaseUser) return;
    const data=cleanState();
    if(!data) return;
    data.email=window.kyroFirebaseUser.email||null;
    data.googleName=window.kyroFirebaseUser.displayName||null;
    data.googlePhoto=window.kyroFirebaseUser.photoURL||null;
    data.updatedAt=firebase.firestore.FieldValue.serverTimestamp();
    db.collection("users").doc(window.kyroFirebaseUser.uid).set(data,{merge:true})
      .catch(e=>console.warn("KYRO Firebase save:",e));
  }

  function scheduleSave(){
    clearTimeout(saveTimer);
    saveTimer=setTimeout(saveUserData,900);
  }

  function loadUserData(){
    if(!db || !window.kyroFirebaseUser) return Promise.resolve();
    return db.collection("users").doc(window.kyroFirebaseUser.uid).get().then(function(snap){
      if(!snap.exists) return;
      const data=snap.data()||{};
      Object.keys(data).forEach(function(k){
        if(k==="updatedAt"||k==="email"||k==="googleName"||k==="googlePhoto") return;
        if(k in state) state[k]=data[k];
      });
      if(window.kyroFirebaseUser.displayName) state.userName=window.kyroFirebaseUser.displayName;
      if(window.kyroFirebaseUser.photoURL) state.userPhoto=window.kyroFirebaseUser.photoURL;
      try{
        localStorage.setItem("kyroUserName",state.userName||"");
        localStorage.setItem("kyroUserPhoto",state.userPhoto||"");
      }catch(e){}
      if(typeof renderSidebarChats==="function") renderSidebarChats();
      if(typeof renderProjects==="function") renderProjects();
      if(typeof renderLibrary==="function") renderLibrary();
      if(typeof renderMessages==="function") renderMessages();
      if(typeof updateModelUI==="function") updateModelUI();
    }).catch(e=>console.warn("KYRO Firebase load:",e));
  }

  function initFirebase(){
    if(!window.firebase) throw new Error("Firebase SDK did not load");
    firebase.initializeApp(firebaseConfig);

    // Firebase App Check — reCAPTCHA Enterprise.
    // Site key is public/client-side; secret keys are never stored in this HTML.
    try{
      if(firebase.appCheck && firebase.appCheck.ReCaptchaEnterpriseProvider){
        const appCheck = firebase.appCheck();
        appCheck.activate(
          new firebase.appCheck.ReCaptchaEnterpriseProvider(KYRO_RECAPTCHA_ENTERPRISE_SITE_KEY),
          true
        );
        window.kyroAppCheck = appCheck;
      }else{
        console.warn("KYRO App Check SDK/provider not available.");
      }
    }catch(appCheckError){
      console.warn("KYRO App Check initialization:", appCheckError);
    }

    auth=firebase.auth();
    db=firebase.firestore();
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.warn);

    auth.onAuthStateChanged(function(user){
      window.kyroFirebaseUser=user||null;
      /* Do not skip the login screen. A Google session is accepted only
         when the user has actively pressed the Google button this launch. */
      if(user && window.kyroPendingGoogleLogin){
        window.kyroPendingGoogleLogin=false;
        setStatus("Google login successful. Starting KYRO…");
        loadUserData().finally(function(){
          startAppBoot();
          scheduleSave();
        });
      }else if(!user && !window.kyroAutoLocalLogin){
        showGate();
        setStatus("Sign in with Google or use your device login.");
      }
    });

    const googleBtn=document.getElementById("firebase-google-btn");
    if(googleBtn) googleBtn.addEventListener("click",function(){
      googleBtn.disabled=true;
      window.kyroPendingGoogleLogin=true;
      setStatus("Opening Google sign-in…");
      const provider=new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({prompt:"select_account"});
      auth.signInWithPopup(provider).catch(function(err){
        window.kyroPendingGoogleLogin=false;
        console.error(err);
        const msg=err.code==="auth/unauthorized-domain"
          ? "This website domain is not authorized in Firebase Authentication."
          : (err.message||"Google sign-in failed.");
        setStatus(msg,true);
      }).finally(function(){googleBtn.disabled=false;});
    });

    const logout=document.getElementById("nav-logout");
    if(logout) logout.addEventListener("click",function(){
      saveUserData();
      window.kyroLoginApproved=false;
      auth.signOut().finally(showGate);
    });

    setInterval(scheduleSave,5000);
    window.addEventListener("beforeunload",saveUserData);
  }

  function wireLocalAuthUI(){
    const localBtn=document.getElementById("kyro-local-login");
    if(localBtn) localBtn.addEventListener("click",localLogin);

    ["kyro-login-username","kyro-login-password","kyro-confirm-password"].forEach(function(id){
      const el=document.getElementById(id);
      if(el) el.addEventListener("keydown",function(e){if(e.key==="Enter") localLogin();});
    });
    initLocalAuthUI();
  }

  async function boot(){
    /* Local auth is wired first. Before Firebase can show an auth gate, wait
       for the durable device account to be restored. */
    wireLocalAuthUI();
    try{
      var saved = (typeof kyroLoadAccount==='function') ? await kyroLoadAccount() : null;
      if(saved && saved.username){
        try{kyroMirrorAccountToLocalStorage(saved);}catch(_){ }
        window.kyroAutoLocalLogin=true;
        if(window.state) state.userName=saved.username;
        try{syncKyroGreeting();}catch(_){ }
        try{startAppBoot();}catch(e){console.warn("KYRO auto boot:",e);}
      }else{
        try{tryAutoLocalLogin();}catch(e){console.warn("KYRO auto local login:",e);}
      }
    }catch(e){
      try{tryAutoLocalLogin();}catch(_){ }
    }
    try{initFirebase();}
    catch(e){
      console.error(e);
      setStatus("Local login is available. Google login needs Firebase HTTPS hosting.",false);
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();

(function(){
  /* Do NOT force the login gate during startup. The durable-account bootstrap
     must get the first chance to restore the device account. */
  async function guard(){
    var gate=document.getElementById('firebase-auth-gate');
    var app=document.getElementById('app');
    if(window.kyroLoginApproved || window.kyroAutoLocalLogin) return;
    try{
      var saved=(typeof kyroLoadAccount==='function')?await kyroLoadAccount():null;
      if(saved&&saved.username){
        try{kyroMirrorAccountToLocalStorage(saved);}catch(_){ }
        window.kyroAutoLocalLogin=true;
        if(window.state)state.userName=saved.username;
        if(typeof startAppBoot==='function')startAppBoot();
        return;
      }
    }catch(_){ }
    if(!window.kyroLoginApproved && !window.kyroAutoLocalLogin){
      if(gate)gate.hidden=false;
      if(app)app.hidden=true;
      document.body.classList.remove('kyro-booting');
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',guard,{once:true});
  else guard();
})();

(function(){
  "use strict";

  function el(id){ return document.getElementById(id); }

  /* Keep the existing implementation, but make the important feature
     controls resilient to re-rendering and mobile tap handling. */
  function safeOpenSheet(id){
    try{
      if(typeof openSheet === "function"){
        openSheet(id);
        return true;
      }
    }catch(e){}
    var backdrop=el("sheet-backdrop"), sheet=el(id);
    if(!sheet) return false;
    if(backdrop) backdrop.classList.add("show");
    sheet.classList.add("show");
    return true;
  }

  function safeCloseSheets(){
    try{
      if(typeof closeSheets === "function"){ closeSheets(); return; }
    }catch(e){}
    var b=el("sheet-backdrop");
    if(b) b.classList.remove("show");
    document.querySelectorAll(".sheet").forEach(function(s){s.classList.remove("show");});
  }

  function openFilePicker(kind){
    var map={
      camera:"file-camera",
      gallery:"file-gallery",
      files:"file-files",
      pdf:"file-pdf",
    };
    var input=el(map[kind]);
    if(!input) return false;

    /* File pickers must be triggered synchronously from the user's tap.
       The existing hidden input is retained; only add a safe fallback
       for browsers that ignore click() on a display:none/hidden control. */
    try{
      input.removeAttribute("disabled");
      input.click();
      return true;
    }catch(e){
      try{
        input.hidden=false;
        input.style.position="fixed";
        input.style.left="-10000px";
        input.style.top="0";
        input.style.opacity="0.01";
        input.click();
        setTimeout(function(){
          input.hidden=true;
          input.removeAttribute("style");
        },250);
        return true;
      }catch(e2){
        return false;
      }
    }
  }

  function handleAttachTap(kind){
    safeCloseSheets();
    setTimeout(function(){
      /* Preserve the original triggerAttach logic when available. */
      try{
        if(typeof triggerAttach === "function"){
          triggerAttach(kind);
          return;
        }
      }catch(e){}
      openFilePicker(kind);
    }, 0);
  }

  function handleProfileTap(){
    var p=el("profile-actions-list"), t=el("profile-theme-panel"), title=el("profile-sheet-title");
    if(p) p.hidden=false;
    if(t) t.hidden=true;
    var c=activeChat();
    if(title) title.textContent=(c && c.title) ? c.title : "Chat actions";
    positionProfilePopover();
    safeOpenSheet("sheet-profile");
  }

  /* One delegated handler covers dynamically-rendered quick tiles and
     profile actions. This prevents a later render from losing handlers. */
  if(!window.__kyroV12Delegated){
    window.__kyroV12Delegated=true;

    document.addEventListener("click", function(e){
      var attach=e.target.closest && e.target.closest("[data-attach]");
      if(attach && !attach.hasAttribute("data-disabled")){
        e.preventDefault();
        e.stopPropagation();
        handleAttachTap(attach.getAttribute("data-attach"));
        return;
      }

      var profile=e.target.closest && e.target.closest("#btn-profile");
      if(profile){
        e.preventDefault();
        e.stopPropagation();
        handleProfileTap();
        return;
      }

      var upload=e.target.closest && e.target.closest("#profile-upload-action");
      if(upload){
        e.preventDefault();
        e.stopPropagation();
        handleAttachTap("files");
        return;
      }
    }, true);

    /* Make the sidebar navigation reliable even if its contents are
       re-rendered after login. */
    document.addEventListener("click", function(e){
      var n=e.target.closest && e.target.closest("[data-nav]");
      if(!n) return;
      var nav=n.getAttribute("data-nav");
      if(nav==="plugins"){
        try{ openModal("modal-settings"); showSettingsPanel("plugins"); renderPlugins(); }catch(_){}
      }else if(nav==="projects"){
        try{ openModal("modal-settings"); showSettingsPanel("projects"); renderProjects(); }catch(_){}
      }
    }, false);
  }

  /* Re-wire the primary attach button defensively. */
  function repair(){
    var attach=el("btn-attach");
    if(attach && !attach.__kyroV12){
      attach.__kyroV12=true;
      attach.addEventListener("click",function(e){
        e.preventDefault();
        e.stopPropagation();
        safeOpenSheet("sheet-attach");
      },true);
    }

    var profile=el("btn-profile");
    if(profile && !profile.__kyroV12){
      profile.__kyroV12=true;
      profile.addEventListener("click",function(e){
        e.preventDefault();
        e.stopPropagation();
        handleProfileTap();
      },true);
    }
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",repair,{once:true});
  }else{
    repair();
  }
  setTimeout(repair,300);
  setTimeout(repair,1200);
})();

(function(){
  "use strict";
  var viewer, stage, img, closeBtn;
  var startX=0,startY=0,lastY=0,tracking=false,moved=false;
  var opened=false;

  function init(){
    viewer=document.getElementById("kyro-image-viewer");
    stage=document.getElementById("kyro-image-viewer-stage");
    img=document.getElementById("kyro-image-viewer-img");
    closeBtn=document.getElementById("kyro-image-viewer-close");
    if(!viewer || !stage || !img) return;

    closeBtn.addEventListener("click",function(e){
      e.preventDefault(); e.stopPropagation(); close();
    });

    viewer.addEventListener("click",function(e){
      if(e.target===viewer || e.target===stage) close();
    });

    stage.addEventListener("touchstart",function(e){
      if(!e.touches || !e.touches[0]) return;
      var t=e.touches[0];
      startX=t.clientX; startY=t.clientY; lastY=startY;
      tracking=true; moved=false;
    },{passive:true});

    stage.addEventListener("touchmove",function(e){
      if(!tracking || !e.touches || !e.touches[0]) return;
      var t=e.touches[0], dx=t.clientX-startX, dy=t.clientY-startY;
      lastY=t.clientY;
      if(Math.abs(dx)>8 || Math.abs(dy)>8) moved=true;

      /* Vertical swipe: follow the finger, horizontal swipe is ignored. */
      if(Math.abs(dy)>Math.abs(dx) && dy>0){
        var amount=Math.min(280,dy);
        img.style.transform="translate3d(0,"+amount+"px,0) scale("+Math.max(.82,1-amount/1200)+")";
        viewer.classList.add("dragging");
      }
    },{passive:true});

    stage.addEventListener("touchend",function(){
      if(!tracking) return;
      var dy=lastY-startY;
      tracking=false;
      viewer.classList.remove("dragging");

      if(dy>90){
        close();
      }else{
        img.style.transform="translate3d(0,0,0) scale(1)";
      }
    },{passive:true});

    stage.addEventListener("touchcancel",function(){
      tracking=false;
      viewer.classList.remove("dragging");
      img.style.transform="translate3d(0,0,0) scale(1)";
    },{passive:true});

    document.addEventListener("keydown",function(e){
      if(e.key==="Escape" && opened) close();
    });

    /* Delegated so images created by renderMessages/renderLibrary still work. */
    document.addEventListener("click",function(e){
      var target=e.target;
      if(!target || target.tagName!=="IMG") return;
      if(target.id==="kyro-image-viewer-img") return;

      var source=target.getAttribute("src");
      if(!source || source.indexOf("data:")!==0 && source.indexOf("blob:")!==0) return;

      /* Only app content images: message attachments and library thumbnails. */
      var allowed=target.closest(".msg-attach") || target.closest("#library-grid") ||
                  target.closest(".attach-chip");
      if(!allowed) return;

      e.preventDefault();
      e.stopPropagation();
      open(source);
    },true);
  }

  function open(source){
    if(!viewer || !img) return;
    img.style.transform="translate3d(0,0,0) scale(1)";
    img.src=source;
    viewer.classList.add("show");
    viewer.setAttribute("aria-hidden","false");
    document.body.classList.add("kyro-image-viewer-open");
    opened=true;
  }

  function close(){
    if(!viewer) return;
    viewer.classList.remove("show","dragging");
    viewer.setAttribute("aria-hidden","true");
    img.style.transform="translate3d(0,0,0) scale(1)";
    /* Do not revoke/remove the data URL; chat/library state keeps it alive. */
    document.body.classList.remove("kyro-image-viewer-open");
    opened=false;
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init,{once:true});
  }else{
    init();
  }
})();

(function(){
  var panel=document.getElementById('sheet-profile');
  if(!panel) return;
  var sx=0,sy=0,tracking=false;
  panel.addEventListener('touchstart',function(e){
    if(!panel.classList.contains('show') || !e.touches || !e.touches[0]) return;
    sx=e.touches[0].clientX; sy=e.touches[0].clientY; tracking=true;
  },{passive:true});
  panel.addEventListener('touchmove',function(e){
    if(!tracking || !e.touches || !e.touches[0]) return;
    var dx=e.touches[0].clientX-sx, dy=e.touches[0].clientY-sy;
    if(Math.abs(dx)>Math.abs(dy)*1.15 || dy>0){ tracking=false; }
  },{passive:true});
  panel.addEventListener('touchend',function(e){
    if(!tracking) return;
    var t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
    if(dy < -60 && Math.abs(dx)<100 && typeof closeSheets==='function') closeSheets();
    tracking=false;
  },{passive:true});
})();

document.addEventListener('pointerdown', function(e){
  var panel=document.getElementById('sheet-profile');
  if(!panel || !panel.classList.contains('show')) return;
  if(e.target.closest && e.target.closest('#sheet-profile')) return;
  if(e.target.closest && e.target.closest('#btn-profile')) return;
  closeSheets();
}, true);

(function(){
  "use strict";
  function q(id){ return document.getElementById(id); }
  function close(){
    try{ if(typeof closeSheets==="function") closeSheets(); }catch(e){}
    var b=q("sheet-backdrop"); if(b) b.classList.remove("show");
    var p=q("sheet-profile"); if(p) p.classList.remove("show");
  }
  function chat(){
    try{ return typeof activeChat==="function" ? activeChat() : null; }catch(e){ return null; }
  }
  function toastMsg(s){ try{ if(typeof toast==="function") toast(s); else console.log(s); }catch(e){} }

  function dispatch(id){
    var c=chat();
    if(id==="profile-share-action"){
      if(!c){toastMsg("No chat to share"); return;}
      try{
        if(typeof shareChat==="function"){ shareChat(c); }
        else if(navigator.share){ navigator.share({title:c.title||"KYRO chat",text:(c.messages||[]).map(function(m){return m.text||""}).join("\n")}); }
        else { toastMsg("Share is not available in this browser"); }
      }catch(e){ toastMsg("Unable to share this chat"); }
      close(); return;
    }
    if(id==="profile-pin-action"){
      if(!c){toastMsg("No chat to pin"); return;}
      if(!c.pinned){
        var count=(window.state&&Array.isArray(state.chats)) ? state.chats.filter(function(x){return !!x.pinned;}).length : 0;
        if(count>=10){toastMsg("Only 10 chats can be pinned"); return;}
      }
      c.pinned=!c.pinned;
      try{renderSidebarChats();}catch(e){}
      toastMsg(c.pinned?"Chat pinned":"Chat unpinned"); close(); return;
    }
    if(id==="profile-project-action"){
      if(!c){toastMsg("No chat to add"); return;}
      try{
        var name=prompt("Project name");
        if(!name) return;
        var project=(state.projects||[]).find(function(p){return String(p.name).toLowerCase()===name.toLowerCase();});
        if(!project){project={name:name,chats:[]};state.projects.push(project);}
        if(project.chats.indexOf(c.id)<0) project.chats.push(c.id);
        try{renderProjects();}catch(e){}
        toastMsg("Chat added to "+project.name); close();
      }catch(e){toastMsg("Could not add chat to project");}
      return;
    }
    if(id==="profile-upload-action"){
      close();
      try{
        if(typeof triggerAttach==="function") triggerAttach("files");
        else {
          var f=q("file-files"); if(f) f.click(); else toastMsg("File picker unavailable");
        }
      }catch(e){toastMsg("File picker unavailable");}
      return;
    }
    if(id==="profile-find-action"){
      if(!c){toastMsg("No chat to search"); return;}
      var term=prompt("Find in chat");
      if(!term) return;
      var found=(c.messages||[]).some(function(m){return String(m.text||"").toLowerCase().indexOf(term.toLowerCase())!==-1;});
      toastMsg(found?"Match found in this chat":"No match found");
      close(); return;
    }
    if(id==="profile-home-action"){
      close();
      try{
        if(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches){
          toastMsg("KYRO is already added to home");
        }else{
          toastMsg("Use your browser's Add to Home screen option");
        }
      }catch(e){toastMsg("Use your browser's Add to Home screen option");}
      return;
    }
    if(id==="profile-archive-action"){
      if(!c){toastMsg("No chat to archive"); return;}
      c.archived=true;
      try{renderSidebarChats();}catch(e){}
      toastMsg("Chat archived"); close(); return;
    }
    if(id==="profile-delete-action"){
      if(!c){toastMsg("No chat to delete"); return;}
      if(!confirm("Delete this chat?")) return;
      try{
        var idx=state.chats.indexOf(c);
        if(idx>=0) state.chats.splice(idx,1);
        state.activeChatId=state.chats.length ? state.chats[Math.max(0,idx-1)].id : null;
        renderSidebarChats();
        if(typeof renderChat==="function") renderChat();
        toastMsg("Chat deleted"); close();
      }catch(e){toastMsg("Could not delete this chat");}
      return;
    }
  }

  // Capture phase makes these actions reliable even if older delegated handlers
  // or re-rendering code runs later.
  document.addEventListener("click",function(e){
    var b=e.target.closest && e.target.closest("#sheet-profile .sheet-action");
    if(!b) return;
    e.preventDefault();
    e.stopPropagation();
    dispatch(b.id);
  },true);

  // Transparent backdrop catches any tap outside the popover.
  document.addEventListener("click",function(e){
    var p=q("sheet-profile"), b=q("sheet-backdrop");
    if(!p || !p.classList.contains("show")) return;
    if(e.target===b || (!e.target.closest("#sheet-profile") && !e.target.closest("#btn-profile"))){
      close();
    }
  },true);

  // Same behavior for touch taps on mobile.
  document.addEventListener("touchend",function(e){
    var p=q("sheet-profile"), b=q("sheet-backdrop");
    if(!p || !p.classList.contains("show")) return;
    if(e.target===b || (!e.target.closest("#sheet-profile") && !e.target.closest("#btn-profile"))){
      close();
    }
  },{passive:true,capture:true});
})();

(function(){
  "use strict";
  function q(id){ return document.getElementById(id); }

  function positionModes(){
    var btn=q('btn-model'), panel=q('modal-model');
    if(!btn || !panel) return;
    var r=btn.getBoundingClientRect();
    var width=205;
    var left=Math.max(12,Math.min(window.innerWidth-width-12,Math.round(r.left)));
    var top=Math.round(r.bottom+6);
    var h=Math.min(panel.scrollHeight||300,340);
    if(top+h>window.innerHeight-12) top=Math.max(12,Math.round(r.top-h-6));
    panel.style.setProperty('left',left+'px','important');
    panel.style.setProperty('top',top+'px','important');
    panel.style.setProperty('right','auto','important');
    panel.style.setProperty('bottom','auto','important');
  }

  function positionThreeDot(){
    var btn=q('btn-profile'), panel=q('sheet-profile');
    if(!btn || !panel) return;
    var r=btn.getBoundingClientRect();
    var width=Math.min(260,window.innerWidth-24);
    var left=Math.round(window.innerWidth-width-10);
    var top=Math.round(r.bottom+6);
    var h=Math.min(panel.scrollHeight||400,440);
    if(top+h>window.innerHeight-12) top=Math.max(12,Math.round(r.top-h-6));
    panel.style.setProperty('width',width+'px','important');
    panel.style.setProperty('min-width',width+'px','important');
    panel.style.setProperty('max-width',width+'px','important');
    panel.style.setProperty('left',left+'px','important');
    panel.style.setProperty('top',top+'px','important');
    panel.style.setProperty('right','auto','important');
    panel.style.setProperty('bottom','auto','important');
  }

  function openModes(){
    try{ closeSheets(); }catch(e){}
    var p=q('modal-model');
    if(!p) return;
    document.querySelectorAll('.modal').forEach(function(m){ if(m!==p) m.classList.remove('show'); });
    p.classList.add('show');
    try{ buildModelList(); }catch(e){}
    requestAnimationFrame(positionModes);
    setTimeout(positionModes,30);
  }

  function closeModes(){
    var p=q('modal-model');
    if(p) p.classList.remove('show');
  }

  function openThreeDot(){
    try{ closeModals(); }catch(e){}
    var p=q('sheet-profile');
    if(!p) return;
    var t=q('profile-theme-panel'), a=q('profile-actions-list'), title=q('profile-sheet-title');
    if(t) t.hidden=true;
    if(a) a.hidden=false;
    var c=(typeof activeChat==='function')?activeChat():null;
    if(title) title.textContent=(c && c.title)?c.title:'Chat actions';
    p.classList.add('show');
    try{ positionThreeDot(); }catch(e){}
  }

  /* Model selector: capture-phase repair guarantees this opens even if an
     older handler is broken or the generic modal layer intercepts the tap. */
  document.addEventListener('click',function(e){
    var model=e.target.closest && e.target.closest('#btn-model');
    if(model){
      e.preventDefault();
      e.stopImmediatePropagation();
      var p=q('modal-model');
      if(p && p.classList.contains('show')) closeModes(); else openModes();
      return;
    }
  },true);

  /* Three-dot: keep the existing chat-actions content, but force the
     compact anchored geometry requested for the top-right menu. */
  document.addEventListener('click',function(e){
    var more=e.target.closest && e.target.closest('#btn-profile');
    if(more){
      e.preventDefault();
      e.stopPropagation();
      openThreeDot();
      return;
    }
  },false);

  /* Close either anchored popup when tapping outside it. */
  document.addEventListener('pointerdown',function(e){
    var mode=q('modal-model');
    if(mode && mode.classList.contains('show') &&
       !e.target.closest('#modal-model') && !e.target.closest('#btn-model')){
      closeModes();
    }
    var three=q('sheet-profile');
    if(three && three.classList.contains('show') &&
       !e.target.closest('#sheet-profile') && !e.target.closest('#btn-profile')){
      try{ closeSheets(); }catch(_){ three.classList.remove('show'); }
    }
  },true);

  window.addEventListener('resize',function(){
    if(q('modal-model') && q('modal-model').classList.contains('show')) positionModes();
    if(q('sheet-profile') && q('sheet-profile').classList.contains('show')) positionThreeDot();
  },{passive:true});
  window.addEventListener('scroll',function(){
    if(q('modal-model') && q('modal-model').classList.contains('show')) positionModes();
    if(q('sheet-profile') && q('sheet-profile').classList.contains('show')) positionThreeDot();
  },{passive:true});

  /* Sidebar navigation repair. Every visible sidebar option now has a
     deterministic action, including Scheduled. */
  document.addEventListener('click',function(e){
    var n=e.target.closest && e.target.closest('#nav-projects,#nav-scheduled,#nav-plugins,#nav-library,#nav-settings,#nav-help,#nav-about');
    if(!n) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var id=n.id;
    try{ closeSidebar(); }catch(_){}
    if(id==='nav-projects'){
      openModal('modal-settings'); showSettingsPanel('projects'); renderProjects();
    }else if(id==='nav-scheduled'){
      openModal('modal-settings'); showSettingsPanel('scheduled');
      if(typeof window.kyroOpenScheduledTasks==='function') window.kyroOpenScheduledTasks();
    }else if(id==='nav-plugins'){
      openModal('modal-settings'); showSettingsPanel('plugins'); renderPlugins();
    }else if(id==='nav-library'){
      if(window.kyroOpenLibrary) window.kyroOpenLibrary(); else { openModal('modal-settings'); showSettingsPanel('library'); renderLibrary(); }
    }else if(id==='nav-settings'){
      openModal('modal-settings'); showSettingsPanel('root');
    }else if(id==='nav-help'){
      openModal('modal-help');
    }else if(id==='nav-about'){
      openModal('modal-about');
    }
  },true);

  /* New Schedule demo action: visible and functional rather than a dead
     "SOON" button. */
  document.addEventListener('click',function(e){
    var b=e.target.closest && e.target.closest('#add-schedule-btn');
    if(!b) return;
    e.preventDefault();
    var name=prompt('What should KYRO remind you about?');
    if(name){
      toast('Scheduled: '+name);
    }
  },true);

  /* Keep Recent free of the old "New Chat" label. */
  function repairRecentLabels(){
    if(typeof state==='undefined' || !state.chats) return;
    state.chats.forEach(function(c){
      if(c.title==='New Chat') c.title='Untitled chat';
    });
  }
  try{ repairRecentLabels(); }catch(e){}
})();

/* Popup size override disabled — 3-dot menu now uses natural sizing. */

(function(){
  function q(id){return document.getElementById(id);}
  function resolveIdentity(){
    var n='';
    try{ n=(window.state && state.userName)||localStorage.getItem('kyroUserName')||''; }catch(e){}
    if(!n && window.kyroFirebaseUser && window.kyroFirebaseUser.displayName) n=window.kyroFirebaseUser.displayName;
    if(!n){
      try{
        var acc=typeof getLocalAccount==='function' ? getLocalAccount() : null;
        if(acc && acc.username) n=acc.username;
      }catch(e){}
    }
    return n || 'MR NITIN Kushwanshi';
  }
  function resolvePhoto(){
    var photo='';
    try{ photo=(window.state && state.userPhoto)||localStorage.getItem('kyroUserPhoto')||''; }catch(e){}
    /* If the sidebar already has the real profile image, mirror that exact
       source into the full-screen profile page. */
    if(!photo){
      var side=q('sb-profile-photo');
      if(side && !side.hidden && side.src && side.src.indexOf('data:')===0) photo=side.src;
    }
    if(!photo && window.kyroFirebaseUser && window.kyroFirebaseUser.photoURL) photo=window.kyroFirebaseUser.photoURL;
    return photo;
  }
  function sync(){
    var img=q('kyro-profile-photo'), fb=q('kyro-profile-fallback'), name=q('kyro-profile-name');
    var n=resolveIdentity(), photo=resolvePhoto();
    if(window.state){ state.userName=n; if(photo) state.userPhoto=photo; }
    if(name) name.textContent=n;
    if(img && fb){
      if(photo){
        img.src=photo; img.hidden=false; fb.hidden=true;
      }else{
        img.removeAttribute('src'); img.hidden=true; fb.hidden=false;
        fb.textContent=(n||'K').charAt(0).toUpperCase();
      }
    }
    /* Keep sidebar and profile in sync whenever either one is rendered. */
    try{ if(typeof renderProfilePhoto==='function') renderProfilePhoto(); }catch(e){}
  }
  function open(){var p=q('kyro-profile-page');if(!p)return;sync();p.classList.add('show');p.setAttribute('aria-hidden','false');try{closeSidebar();}catch(e){}}
  function close(){var p=q('kyro-profile-page');if(!p)return;p.classList.remove('show');p.setAttribute('aria-hidden','true');}
  window.kyroOpenProfilePage=open; window.kyroCloseProfilePage=close; window.kyroSyncProfilePage=sync;
  window.kyroSyncProfileIdentity=sync;
  window.addEventListener('pageshow',sync);
  window.addEventListener('storage',sync);
  function editName(){
    var current=resolveIdentity();
    var next=prompt('Edit name',current);
    if(next===null)return; next=next.trim(); if(!next)return toast('Name cannot be empty');
    state.userName=next;
    try{localStorage.setItem('kyroUserName',next);}catch(e){}
    var g=q('greeting-title'); if(g)g.textContent='Hello, '+next;
    try{renderProfilePhoto();}catch(e){}
    sync();
    try{if(typeof scheduleSave==='function')scheduleSave();}catch(e){}
    toast('Name updated');
  }
  /*
     PROFILE -> SETTING navigation state.
     When a setting is opened from the full-screen Profile page, the
     Settings sub-panel must return to that Profile page. It must NOT
     expose the generic Settings root behind it.
  */
  window.kyroSettingsReturnToProfile = false;
  window.kyroProfileChildOpen = false;

  function restoreProfileAfterChild(){
    window.kyroSettingsReturnToProfile = false;
    window.kyroProfileChildOpen = false;
    try{ closeModals(); }catch(e){}
    document.querySelectorAll('.modal').forEach(function(m){m.classList.remove('show');});
    try{ if(typeof closeSheets==='function') closeSheets(); }catch(e){}
    setTimeout(function(){
      try{ if(typeof window.kyroOpenProfilePage==='function') window.kyroOpenProfilePage(); }catch(e){}
    },0);
  }

  function closeSettingsFromProfile(){
    if(!window.kyroSettingsReturnToProfile) return;
    restoreProfileAfterChild();
  }

  function openSetting(which){
    window.kyroSettingsReturnToProfile = true;
    window.kyroProfileChildOpen = true;
    try{ history.pushState({kyroProfileChild:true},'',location.href); }catch(e){}
    close();
    try{openModal('modal-settings');}catch(e){}
    if(which==='web'){
      try{showSettingsPanel('root');}catch(e){}
      var b=q('settings-web-search'); if(b)b.click();
      return;
    }
    if(which==='backup'){var b=q('btn-backup');if(b)b.click();return;}
    if(which==='restore'){var b=q('btn-restore');if(b)b.click();return;}
    try{showSettingsPanel(which);}catch(e){}
    if(which==='api'){try{renderApiKeys();}catch(e){}}
    if(which==='models'){try{buildModelList();}catch(e){}}
  }

  function openProfileChildModal(id){
    window.kyroSettingsReturnToProfile = true;
    window.kyroProfileChildOpen = true;
    try{ history.pushState({kyroProfileChild:true},'',location.href); }catch(e){}
    close();
    try{openModal(id);}catch(e){}
  }
  document.addEventListener('DOMContentLoaded',function(){
    var back=q('kyro-profile-back'), edit=q('kyro-profile-edit'), file=q('file-profile'), name=q('kyro-profile-name');
    if(back)back.addEventListener('click',close);
    if(name)name.addEventListener('click',editName);
    if(edit)edit.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(file)file.click();});
    /* file-profile's 'change' is already handled by the original listener
       in wireEvents() — it fires the same way regardless of which button
       (this one or the Settings profile-photo button) opened the picker,
       so no separate handler is needed here. */
    document.querySelectorAll('[data-kyro-setting]').forEach(function(b){b.addEventListener('click',function(){openSetting(this.getAttribute('data-kyro-setting'));});});
    var about=q('kyro-profile-about'), help=q('kyro-profile-help'), logout=q('kyro-profile-logout');
    if(about)about.addEventListener('click',function(){openProfileChildModal('modal-about');});
    if(help)help.addEventListener('click',function(){openProfileChildModal('modal-help');});
    var aboutBack=q('about-back'), helpBack=q('help-back'), aboutClose=q('about-close'), helpClose=q('help-close');
    if(aboutBack)aboutBack.addEventListener('click',function(){if(window.kyroProfileChildOpen)restoreProfileAfterChild();});
    if(helpBack)helpBack.addEventListener('click',function(){if(window.kyroProfileChildOpen)restoreProfileAfterChild();});
    if(aboutClose)aboutClose.addEventListener('click',function(){if(window.kyroProfileChildOpen)restoreProfileAfterChild();});
    if(helpClose)helpClose.addEventListener('click',function(){if(window.kyroProfileChildOpen)restoreProfileAfterChild();});
    if(logout)logout.addEventListener('click',function(){
      close();
      var nl=q('nav-logout'); if(nl) nl.click();
    });
    sync();
    setTimeout(sync,150);
    setTimeout(sync,700);
  });
})();

(function(){
  function guard(){
    ['nav-logout','nav-settings','nav-help','nav-about'].forEach(function(id){
      var el=document.getElementById(id); if(el)el.style.setProperty('display','none','important');
    });
    var p=document.getElementById('kyro-profile-page'); if(p)p.style.setProperty('z-index','10000','important');
  }
  document.addEventListener('DOMContentLoaded',guard);
  window.addEventListener('pageshow',guard);
  guard();
})();

(function(){
  'use strict';
  function q(id){ return document.getElementById(id); }
  function place(){
    var btn=q('btn-profile'), panel=q('sheet-profile');
    if(!btn || !panel) return;
    var r=btn.getBoundingClientRect();
    var w=Math.min(260, window.innerWidth-24);
    var left=Math.round(window.innerWidth-60-w);
    left=Math.max(10, Math.min(window.innerWidth-w-10, left));
    var top=Math.round(r.bottom+6);
    var h=Math.min(440, Math.max(200, window.innerHeight-top-14));
    if(top+h>window.innerHeight-14) top=Math.max(14, window.innerHeight-h-14);
    panel.style.setProperty('width',w+'px','important');
    panel.style.setProperty('max-width',w+'px','important');
    panel.style.setProperty('height','auto','important');
    panel.style.setProperty('max-height',h+'px','important');
    panel.style.setProperty('left',left+'px','important');
    panel.style.setProperty('top',top+'px','important');
    panel.style.setProperty('right','auto','important');
    panel.style.setProperty('bottom','auto','important');
  }
  function open(){
    var panel=q('sheet-profile');
    if(!panel) return;
    var title=q('profile-sheet-title'), actions=q('profile-actions-list'), theme=q('profile-theme-panel');
    if(theme) theme.hidden=true;
    if(actions) actions.hidden=false;
    try{
      var c=typeof activeChat==='function' ? activeChat() : null;
      if(title) title.textContent=(c && c.title) ? c.title : 'Chat actions';
    }catch(_){ if(title) title.textContent='Chat actions'; }
    try{ if(typeof closeModals==='function') closeModals(); }catch(_){ }
    var back=q('sheet-backdrop');
    if(back) back.classList.add('show');
    panel.classList.add('show');
    place();
    requestAnimationFrame(place);
    setTimeout(place,30);
  }
  function close(){
    var panel=q('sheet-profile'), back=q('sheet-backdrop');
    if(panel) panel.classList.remove('show');
    if(back) back.classList.remove('show');
  }
  function install(){
    var btn=q('btn-profile');
    if(!btn) return;
    /* Capture on the document is the final authority. It prevents the older
       duplicate handlers from toggling/closing this popup after it opens. */
    document.addEventListener('click',function(e){
      var target=e.target && e.target.closest ? e.target.closest('#btn-profile') : null;
      if(!target) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      open();
    },true);
    document.addEventListener('pointerdown',function(e){
      var panel=q('sheet-profile');
      if(!panel || !panel.classList.contains('show')) return;
      if(e.target.closest && (e.target.closest('#sheet-profile') || e.target.closest('#btn-profile'))) return;
      close();
    },true);
    window.addEventListener('resize',function(){
      var panel=q('sheet-profile');
      if(panel && panel.classList.contains('show')) place();
    },{passive:true});
    window.addEventListener('scroll',function(){
      var panel=q('sheet-profile');
      if(panel && panel.classList.contains('show')) place();
    },{passive:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();

(function(){
  'use strict';
  function q(id){return document.getElementById(id);}
  function chat(){try{return typeof activeChat==='function'?activeChat():null;}catch(e){return null;}}
  function say(t){try{if(typeof toast==='function')toast(t);else console.log(t);}catch(e){}}
  function save(){try{if(typeof scheduleSave==='function')scheduleSave();}catch(e){}}
  function close(){try{if(typeof closeSheets==='function')closeSheets();}catch(e){}var p=q('sheet-profile');if(p)p.classList.remove('show');}

  /* Keep the popup anchored to the same compact location as the reference image. */
  function place(){
    var p=q('sheet-profile');
    if(!p || !p.classList.contains('show')) return;
    if(window.innerWidth<=520){
      p.style.setProperty('right','10px','important');
      p.style.setProperty('top','54px','important');
      return;
    }
    p.style.setProperty('width','260px','important');
    p.style.setProperty('height','auto','important');
    p.style.setProperty('max-height','440px','important');
    p.style.setProperty('right','58px','important');
    p.style.setProperty('top','54px','important');
  }

  function updateTitle(){
    var c=chat(), t=q('profile-sheet-title');
    if(!t) return;
    t.textContent=(c && c.title && c.title!=='Untitled chat') ? c.title : 'Chat actions';
  }

  /* Create a portable URL so the exact chat can be opened on another phone. */
  function shareUrl(c){
    try{
      var payload={
        v:1,
        title:c.title||'KYRO Chat',
        messages:(c.messages||[]).map(function(m){return {role:m.role,text:m.text,time:m.time,attachments:(m.attachments||[]).map(function(a){return {name:a.name,dataUrl:a.dataUrl||null};})};})
      };
      var raw=JSON.stringify(payload);
      var encoded=btoa(unescape(encodeURIComponent(raw))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
      return location.href.split('#')[0].split('?')[0]+'?kyroChat='+encoded;
    }catch(e){return location.href;}
  }

  function share(c){
    if(!c){say('No chat to share');return;}
    var url=shareUrl(c);
    var text=(c.messages||[]).map(function(m){return (m.role==='user'?'You':'KYRO')+': '+(m.text||'');}).join('\n\n');
    if(navigator.share){
      navigator.share({title:c.title||'KYRO Chat',text:'Open this KYRO chat:',url:url}).then(function(){say('Chat link shared');}).catch(function(){});
    }else if(navigator.clipboard){
      navigator.clipboard.writeText(url).then(function(){say('Chat link copied — open it on another phone');}).catch(function(){say('Could not copy chat link');});
    }else{say('Share link: '+url);}
  }

  function pin(c){
    if(!c){say('No chat to pin');return;}
    if(!c.pinned){
      var count=state.chats.filter(function(x){return !!x.pinned;}).length;
      if(count>=10){say('Only 10 chats can be pinned');return;}
    }
    c.pinned=!c.pinned;
    if(typeof renderSidebarChats==='function')renderSidebarChats();
    save();
    say(c.pinned?'Chat pinned':'Chat unpinned');
    close();
  }

  function project(c){
    if(!c){say('No chat to add');return;}
    var name=prompt('Project name', c.title && c.title!=='Untitled chat' ? c.title : 'New project');
    if(!name)return;
    name=name.trim(); if(!name)return;
    var projects=state.projects||[];
    var created=false;
    var p=projects.find(function(x){return String(x.name).toLowerCase()===name.toLowerCase();});
    if(!p){p={id:'p'+Date.now(),name:name,chats:[]};projects.push(p);state.projects=projects;created=true;}
    if(p.chats.indexOf(c.id)<0)p.chats.push(c.id);

    /* If this is a brand-new project, immediately open a fresh project chat. */
    if(created && typeof newChat==='function'){
      var before=state.chats.length;
      newChat();
      var fresh=activeChat();
      if(fresh){fresh.title=p.name+' — New chat'; if(p.chats.indexOf(fresh.id)<0)p.chats.push(fresh.id);}
      if(typeof renderSidebarChats==='function')renderSidebarChats();
    }
    if(typeof renderProjects==='function')renderProjects();
    save();
    say(created ? 'Project "'+p.name+'" created — new project chat opened' : 'Chat added to '+p.name);
    close();
  }

  function upload(){
    close();
    var f=q('file-files');
    if(f){f.click();return;}
    try{if(typeof triggerAttach==='function'){triggerAttach('files');return;}}catch(e){}
    say('File picker unavailable');
  }

  function findInChat(c){
    if(!c){say('No chat to search');return;}
    var term=prompt('Find in chat', '');
    if(!term)return;
    term=term.trim().toLowerCase(); if(!term)return;
    var matches=[];
    (c.messages||[]).forEach(function(m,i){if(String(m.text||'').toLowerCase().indexOf(term)>=0)matches.push(i+1);});
    if(!matches.length){say('No match found');return;}
    if(typeof renderMessages==='function')renderMessages();
    setTimeout(function(){
      var rows=document.querySelectorAll('#chat-view .msg-row');
      var first=-1;
      rows.forEach(function(row,i){
        if(matches.indexOf(i+1)>=0){
          row.style.filter='brightness(1.18)';
          row.style.outline='1px solid var(--accent)';
          row.style.borderRadius='14px';
          if(first<0)first=i;
        }
      });
      if(first>=0 && rows[first] && rows[first].scrollIntoView)rows[first].scrollIntoView({behavior:'smooth',block:'center'});
      say(matches.length+' match'+(matches.length>1?'es':'')+' found');
      setTimeout(function(){rows.forEach(function(row){row.style.filter='';row.style.outline='';});},2200);
    },40);
    close();
  }

  function home(){
    close();
    if(window.__kyroInstallPrompt){
      window.__kyroInstallPrompt.prompt();
      window.__kyroInstallPrompt.userChoice.then(function(r){say(r.outcome==='accepted'?'KYRO added to home':'Add to home cancelled');window.__kyroInstallPrompt=null;});
    }else{
      say('Add to Home is available from your browser menu on this device');
    }
  }

  function archive(c){
    if(!c){say('No chat to archive');return;}
    c.archived=true; save();
    if(typeof renderSidebarChats==='function')renderSidebarChats();
    say('Chat archived');close();
  }

  function del(c){
    if(!c){say('No chat to delete');return;}
    if(!confirm('Delete this chat?'))return;
    var idx=state.chats.indexOf(c);
    if(idx>=0)state.chats.splice(idx,1);
    if(state.activeChatId===c.id){
      if(state.chats.length){state.activeChatId=state.chats[0].id;if(typeof switchChat==='function')switchChat(state.activeChatId);}
      else if(typeof newChat==='function')newChat();
    }
    if(typeof renderSidebarChats==='function')renderSidebarChats();
    save(); say('Chat deleted');close();
  }

  function run(id){
    var c=chat();
    if(id==='profile-share-action')return share(c);
    if(id==='profile-pin-action')return pin(c);
    if(id==='profile-project-action')return project(c);
    if(id==='profile-upload-action')return upload();
    if(id==='profile-find-action')return findInChat(c);
    if(id==='profile-home-action')return home();
    if(id==='profile-archive-action')return archive(c);
    if(id==='profile-delete-action')return del(c);
  }

  /* One final capture-phase handler wins over older duplicate handlers in the file. */
  document.addEventListener('click',function(e){
    var b=e.target.closest && e.target.closest('#sheet-profile .sheet-action');
    if(b){e.preventDefault();e.stopImmediatePropagation();run(b.id);return;}
    var more=e.target.closest && e.target.closest('#btn-profile');
    if(more){
      e.preventDefault();e.stopImmediatePropagation();
      var p=q('sheet-profile');
      try{if(typeof closeModals==='function')closeModals();}catch(x){}
      updateTitle();
      if(p){p.classList.add('show');place();requestAnimationFrame(place);}
      return;
    }
  },true);

  window.addEventListener('resize',place,{passive:true});

  /* Browser install prompt, when the page is actually installable. */
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__kyroInstallPrompt=e;});

  /* Import a shared chat URL on another phone/browser. */
  function importSharedChat(){
    try{
      var param=new URLSearchParams(location.search).get('kyroChat');
      if(!param || typeof state==='undefined')return;
      var padded=param.replace(/-/g,'+').replace(/_/g,'/');
      while(padded.length%4)padded+='=';
      var raw=decodeURIComponent(escape(atob(padded)));
      var data=JSON.parse(raw);
      if(!data || !Array.isArray(data.messages))return;
      var id='c'+Date.now();
      var c={id:id,title:data.title||'Shared chat',messages:data.messages,pinned:false,unread:false};
      state.chats.unshift(c);state.activeChatId=id;
      if(typeof renderSidebarChats==='function')renderSidebarChats();
      if(typeof showChat==='function')showChat();
      if(typeof renderMessages==='function')renderMessages();
      history.replaceState({},document.title,location.pathname+location.hash);
      save();
      setTimeout(function(){say('Shared chat opened');},250);
    }catch(e){console.warn('KYRO shared chat import failed',e);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(importSharedChat,500);});
  else setTimeout(importSharedChat,500);
})();

/* Popup size override disabled — 3-dot menu now uses natural sizing. */

(function(){
  'use strict';
  function $(id){ return document.getElementById(id); }

  /* ---------- Profile photo click handling now lives in wireEvents()
     (main script) and kyro-final-profile-click-repair-js — both reach
     window.kyroOpenProfilePage correctly now that it (and the DOM
     structure around it) are fixed, so no delegated capture-phase
     interception is needed here. ---------- */

  /* ---------- Long-press action menu ---------- */
  var menu = null, menuChat = null, suppressNextClick = false;
  function closeLongMenu(){
    if(menu){ menu.remove(); menu=null; }
    menuChat=null;
  }
  document.addEventListener('pointerdown', function(e){
    if(menu && !(e.target.closest && e.target.closest('#kyro-chat-longpress-menu')) &&
       !(e.target.closest && e.target.closest('.sb-chat'))){
      closeLongMenu();
    }
  }, true);
  function toastSafe(t){ try{ if(typeof toast==='function') toast(t); else if(typeof toastMsg==='function') toastMsg(t); }catch(_){} }
  function buildLongMenu(c, x, y){
    closeLongMenu();
    menuChat=c;
    menu=document.createElement('div');
    menu.id='kyro-chat-longpress-menu';
    menu.setAttribute('role','menu');
    var actions=[
      {icon:'chat', label:'Open', fn:function(){ closeLongMenu(); suppressNextClick=true; try{switchChat(c.id);}catch(_){} }},
      {icon:'check', label:c.unread?'Read':'Read', fn:function(){ c.unread=false; try{renderSidebarChats();}catch(_){} closeLongMenu(); toastSafe('Marked as read'); }},
      {icon:'pin', label:c.pinned?'Unpin':'Pin', fn:function(){
        if(!c.pinned){
          var count=(state.chats||[]).filter(function(x){return !!x.pinned;}).length;
          if(count>=10){toastSafe('Only 10 chats can be pinned');return;}
        }
        c.pinned=!c.pinned;
        try{renderSidebarChats();}catch(_){}
        closeLongMenu();
        toastSafe(c.pinned?'Chat pinned':'Chat unpinned');
      }}
    ];
    actions.forEach(function(a){
      var b=document.createElement('button');
      b.type='button'; b.setAttribute('role','menuitem');
      b.innerHTML='<svg class="icon"><use href="#i-'+a.icon+'"/></svg><span></span>';
      b.querySelector('span').textContent=a.label;
      b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();a.fn();});
      menu.appendChild(b);
    });
    document.body.appendChild(menu);
    var left=Math.max(8, Math.min(window.innerWidth-166, x||20));
    var top=Math.max(8, Math.min(window.innerHeight-150, y||200));
    menu.style.left=left+'px'; menu.style.top=top+'px';
  }

  /* Replace the older chat-row implementation so the old immediate-pin
     long press cannot fire before the new action menu. */
  window.renderSidebarChats = function(){
    var list=$('sb-chat-list');
    if(!list) return;
    list.innerHTML='';
    var pinned=(state.chats||[]).filter(function(c){return !!c.pinned && !c.archived;});
    var recent=(state.chats||[]).filter(function(c){return !c.pinned && !c.archived;});
    function label(text){
      var d=document.createElement('div'); d.className='sb-label'; d.textContent=text; list.appendChild(d);
    }
    function addRow(c){ list.appendChild(makeRow(c)); }
    if(pinned.length){ label('Pinned'); pinned.forEach(addRow); }
    if(recent.length){ label('Recent'); recent.forEach(addRow); }
  };

  function makeRow(c){
    var row=document.createElement('button');
    row.type='button';
    row.className='sb-chat'+(c.id===state.activeChatId?' active':'');
    row.innerHTML='<svg class="icon icon-sm"><use href="#i-'+(c.pinned?'pin':'chat')+'"/></svg><span></span>'+(c.unread?'<span class="dot-unread"></span>':'');
    row.querySelector('span').textContent=c.title || 'Untitled chat';
    row.style.background='transparent';
    row.style.border='0';
    row.style.boxShadow='none';

    var timer=null, startX=0, startY=0, longDone=false;
    function cancel(){ if(timer){clearTimeout(timer);timer=null;} }
    row.addEventListener('pointerdown',function(e){
      if(e.button!==undefined && e.button!==0) return;
      longDone=false; startX=e.clientX; startY=e.clientY;
      cancel();
      timer=setTimeout(function(){
        timer=null; longDone=true; suppressNextClick=true;
        buildLongMenu(c,e.clientX,e.clientY);
      },550);
    });
    row.addEventListener('pointermove',function(e){
      if(Math.abs(e.clientX-startX)>12 || Math.abs(e.clientY-startY)>12) cancel();
    });
    row.addEventListener('pointerup',function(){ cancel(); });
    row.addEventListener('pointercancel',function(){ cancel(); });
    row.addEventListener('contextmenu',function(e){
      e.preventDefault();
      if(!longDone){ longDone=true; suppressNextClick=true; buildLongMenu(c,e.clientX,e.clientY); }
    });
    row.addEventListener('click',function(e){
      if(suppressNextClick || longDone){ suppressNextClick=false; longDone=false; return; }
      closeLongMenu();
      try{switchChat(c.id);}catch(_){}
    });
    return row;
  }

  /* Re-render after this patch is installed. */
  document.addEventListener('DOMContentLoaded',function(){
    setTimeout(function(){ try{renderSidebarChats();}catch(_){} },0);
  });
  window.addEventListener('pageshow',function(){ try{renderSidebarChats();}catch(_){} });
})();

(function(){
  'use strict';
  function byId(id){ return document.getElementById(id); }
  function openProfileNow(){
    var page=byId('kyro-profile-page');
    if(!page) return false;
    try{
      if(typeof window.kyroOpenProfilePage==='function'){
        window.kyroOpenProfilePage();
      }else{
        page.classList.add('show');
        page.removeAttribute('aria-hidden');
        page.setAttribute('aria-hidden','false');
        try{ if(typeof closeSidebar==='function') closeSidebar(); }catch(_){ }
      }
    }catch(err){
      page.classList.add('show');
      page.removeAttribute('aria-hidden');
      page.setAttribute('aria-hidden','false');
    }
    return page.classList.contains('show');
  }
  function bind(){
    var b=byId('sb-profile-mini'), p=byId('kyro-profile-page');
    if(!b || !p) return;
    b.type='button';
    /* Make the actual button the only pointer target. */
    b.onclick=function(e){
      if(e){e.preventDefault();e.stopPropagation();}
      openProfileNow();
      return false;
    };
    b.ontouchend=function(e){
      if(e){e.preventDefault();e.stopPropagation();}
      openProfileNow();
      return false;
    };
    b.onpointerup=function(e){
      if(e && e.pointerType==='mouse') return;
      if(e){e.preventDefault();e.stopPropagation();}
      openProfileNow();
      return false;
    };
    /* Keep the profile page mounted directly under body so no transformed
       sidebar/main ancestor can create a stacking or hit-test problem. */
    if(p.parentElement!==document.body){
      document.body.appendChild(p);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
  window.addEventListener('pageshow',bind);
  setTimeout(bind,100);
  setTimeout(bind,500);
})();

(function(){
  'use strict';

  var IMAGE_MODEL = 'gemini-2.5-flash-image';

  function q(id){ return document.getElementById(id); }

  function kyroImageApiKey(){
    /* Use the auto-router's active key — works for both Gemini and Sarvam */
    if(typeof kyroGetActiveApiKey==='function'){
      var k=kyroGetActiveApiKey();
      if(k) return k;
    }
    var external = (window.kyroAppState && window.kyroAppState.apiKeys &&
      window.kyroAppState.apiKeys[0] && window.kyroAppState.apiKeys[0].key) || '';
    if(external) return external;
    if(typeof KYRO_BUILTIN_GEMINI_API_KEY === 'string' &&
       KYRO_BUILTIN_GEMINI_API_KEY !== 'PASTE_YOUR_GEMINI_API_KEY_HERE'){
      return KYRO_BUILTIN_GEMINI_API_KEY;
    }
    return '';
  }

  window.kyroOpenImageGen = function(){
    var modal=q('kyro-image-gen-modal'), back=q('kyro-image-gen-backdrop');
    if(!modal || !back) return;
    back.hidden=false;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    setTimeout(function(){ q('kyro-image-gen-prompt').focus(); },60);
  };

  function closeImageGen(){
    var modal=q('kyro-image-gen-modal'), back=q('kyro-image-gen-backdrop');
    if(!modal || !back) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
    back.hidden=true;
  }

  function imagePartToDataUrl(part){
    var d = part && (part.inlineData || part.inline_data);
    if(!d || !d.data) return null;
    var mime = d.mimeType || d.mime_type || 'image/png';
    return 'data:'+mime+';base64,'+d.data;
  }

  function setImageGenBusy(busy, text){
    var btn=q('kyro-image-gen-create'), status=q('kyro-image-gen-status');
    if(btn) btn.disabled=busy;
    if(status){
      status.hidden=!busy && !text;
      status.textContent=text||'';
    }
  }

  window.kyroGenerateImage = function(){
    var prompt=(q('kyro-image-gen-prompt').value||'').trim();
    if(!prompt){ toast('Write an image prompt first'); return; }

    var key=kyroImageApiKey();
    if(!key){
      toast('Add an API key in API Manager first');
      return;
    }
    /* Image generation requires a Gemini key (image models). */
    var provider=kyroDetectActiveProvider ? kyroDetectActiveProvider(key) : null;
    if(provider==='sarvam'){
      toast('Image generation requires a Gemini key. Please add a Gemini API key.');
      setImageGenBusy(false,'Image generation needs a Gemini API key.');
      return;
    }

    var ratio=q('kyro-image-gen-ratio').value || '9:16';
    var size=q('kyro-image-gen-size').value || '1K';
    setImageGenBusy(true,'Generating with KYRO Image Gen…');

    var endpoint='https://generativelanguage.googleapis.com/v1beta/models/' +
      IMAGE_MODEL + ':generateContent';

    fetch(endpoint,{
      method:'POST',
      headers:geminiAuthHeaders(key),
      body:JSON.stringify({
        contents:[{
          role:'user',
          parts:[{
            text:'Create an image based on this user request. Follow the request faithfully. Do not add explanatory text unless needed for safety. User request: '+prompt
          }]
        }],
        generationConfig:{
          responseModalities:['IMAGE'],
          responseFormat:{
            image:{
              aspectRatio:ratio
            }
          }
        }
      })
    }).then(function(r){
      return r.json().then(function(j){return {ok:r.ok,j:j,status:r.status};});
    }).then(function(res){
      if(!res.ok){
        var msg=(res.j&&res.j.error&&res.j.error.message)||('Image generation failed ('+res.status+')');
        if(res.status===429){
          msg='Image generation quota is currently exhausted. Please wait for the quota reset or use a key with available image-generation quota.';
        }
        throw new Error(msg);
      }

      var parts=(res.j.candidates&&res.j.candidates[0]&&
        res.j.candidates[0].content&&res.j.candidates[0].content.parts)||[];
      var dataUrl=null;
      for(var i=0;i<parts.length;i++){
        dataUrl=imagePartToDataUrl(parts[i]);
        if(dataUrl) break;
      }
      if(!dataUrl) throw new Error('The image model returned no image data. Try again or choose 1K.');

      var c=activeChat();
      if(!c) throw new Error('No active chat available.');

      c.messages.push({
        id:'m'+Date.now()+'u',
        role:'user',
        text:'Create an image: '+prompt,
        time:nowTime(),
        attachments:[]
      });
      c.messages.push({
        id:'m'+Date.now()+'i',
        role:'ai',
        text:'',
        time:nowTime(),
        attachments:[{
          name:'KYRO-generated.png',
          dataUrl:dataUrl,
          generatedImage:true
        }]
      });
      save();
      renderMessages();
      closeImageGen();
      toast('Image generated');
    }).catch(function(err){
      console.error('KYRO Image Gen:',err);
      var msg=String(err&&err.message||err);
      setImageGenBusy(false,msg);
      showErrorCard('KYRO Image Gen: '+msg);
      return;
    }).finally(function(){
      setImageGenBusy(false,'');
    });
  };

  function bindImageGen(){
    var home=q('kyro-image-gen-home');
    var top=q('kyro-image-gen-top');
    var sheet=q('kyro-image-gen-sheet');
    var close=q('kyro-image-gen-close');
    var back=q('kyro-image-gen-backdrop');
    var create=q('kyro-image-gen-create');

    if(home) home.addEventListener('click',function(){ window.kyroOpenImageGen(); });
    if(top) top.addEventListener('click',function(){ window.kyroOpenImageGen(); });
    if(sheet) sheet.addEventListener('click',function(){
      try{ if(typeof closeSheet==='function') closeSheet('sheet-attach'); }catch(e){}
      window.kyroOpenImageGen();
    });
    if(close) close.addEventListener('click',closeImageGen);
    if(back) back.addEventListener('click',closeImageGen);
    if(create) create.addEventListener('click',window.kyroGenerateImage);

    document.addEventListener('keydown',function(e){
      if(e.key==='Escape' && q('kyro-image-gen-modal') &&
         q('kyro-image-gen-modal').classList.contains('show')) closeImageGen();
    });

    document.addEventListener('click',function(e){
      var b=e.target.closest ? e.target.closest('[data-save-generated]') : null;
      if(!b) return;
      var src=b.getAttribute('data-image-src'), name=b.getAttribute('data-save-generated')||'KYRO-generated.png';
      if(!src) return;
      var a=document.createElement('a');
      a.href=src;a.download=name;a.rel='noopener';
      document.body.appendChild(a);a.click();a.remove();
      toast('Image saved');
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindImageGen,{once:true});
  else bindImageGen();
})();

(function(){
  'use strict';

  function esc(s){
    var d=document.createElement('div'); d.textContent=String(s==null?'':s); return d.innerHTML;
  }
  function inline(s){
    var stash=[];
    function hold(html){var k='\u0000KYRO'+stash.length+'\u0000';stash.push(html);return k;}
    s=esc(s);
    s=s.replace(/`([^`\n]+)`/g,function(_,x){return hold('<code>'+x+'</code>');});
    s=s.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,function(_,a,u){return hold('<img src="'+u.replace(/"/g,'&quot;')+'" alt="'+a.replace(/"/g,'&quot;')+'">');});
    s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,function(_,a,u){return hold('<a href="'+u.replace(/"/g,'&quot;')+'" target="_blank" rel="noopener noreferrer">'+a+'</a>');});
    s=s.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
    s=s.replace(/__([^_\n]+)__/g,'<strong>$1</strong>');
    s=s.replace(/\*([^*\n]+)\*/g,'<em>$1</em>');
    s=s.replace(/_([^_\n]+)_/g,'<em>$1</em>');
    s=s.replace(/~~([^~\n]+)~~/g,'<del>$1</del>');
    s=s.replace(/  $/g,'<br>');
    s=s.replace(/\u0000KYRO(\d+)\u0000/g,function(_,i){return stash[Number(i)];});
    return s;
  }
  function renderMd(src){
    src=String(src==null?'':src).replace(/\r\n?/g,'\n');
    if(!src.trim()) return '';
    var lines=src.split('\n'), out=[], i=0, para=[];
    function flush(){
      if(!para.length)return;
      var txt=para.join('\n').trim();
      if(txt){out.push('<p>'+inline(txt).replace(/\n/g,'<br>')+'</p>');}
      para=[];
    }
    while(i<lines.length){
      var line=lines[i];
      var fence=line.match(/^\s*```([\w+-]*)\s*$/);
      if(fence){
        flush(); var lang=fence[1]||''; var code=[]; i++;
        while(i<lines.length && !/^\s*```\s*$/.test(lines[i])){code.push(lines[i]);i++;}
        if(i<lines.length)i++;
        out.push('<pre><code'+(lang?' data-lang="'+esc(lang)+'"':'')+'>'+esc(code.join('\n'))+'</code></pre>');
        continue;
      }
      var h=line.match(/^\s*(#{1,4})\s+(.+?)\s*#*\s*$/);
      if(h){flush();var n=h[1].length;out.push('<h'+n+'>'+inline(h[2])+'</h'+n+'>');i++;continue;}
      if(/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)){flush();out.push('<hr>');i++;continue;}
      var bq=line.match(/^\s*>\s?(.*)$/);
      if(bq){flush();var q=[];while(i<lines.length){var bm=lines[i].match(/^\s*>\s?(.*)$/);if(!bm)break;q.push(bm[1]);i++;}out.push('<blockquote>'+inline(q.join('\n')).replace(/\n/g,'<br>')+'</blockquote>');continue;}
      var ul=line.match(/^\s*[-*+]\s+(.*)$/), ol=line.match(/^\s*\d+[.)]\s+(.*)$/);
      if(ul||ol){
        flush();var tag=ul?'ul':'ol', items=[];
        while(i<lines.length){var mm=lines[i].match(ul? /^\s*[-*+]\s+(.*)$/ : /^\s*\d+[.)]\s+(.*)$/);if(!mm)break;items.push('<li>'+inline(mm[1])+'</li>');i++;}
        out.push('<'+tag+'>'+items.join('')+'</'+tag+'>');continue;
      }
      if(/^\s*$/.test(line)){flush();i++;continue;}
      // Simple Markdown table support.
      if(i+1<lines.length && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i+1])){
        flush();
        function cells(x){return x.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(function(v){return v.trim();});}
        var heads=cells(line), aligns=cells(lines[i+1]); i+=2; var rows=[];
        while(i<lines.length && /\|/.test(lines[i]) && lines[i].trim()!==''){rows.push(cells(lines[i]));i++;}
        var th=heads.map(function(v){return '<th>'+inline(v)+'</th>';}).join('');
        var tb=rows.map(function(r){return '<tr>'+heads.map(function(_,k){return '<td>'+inline(r[k]||'')+'</td>';}).join('')+'</tr>';}).join('');
        out.push('<table><thead><tr>'+th+'</tr></thead><tbody>'+tb+'</tbody></table>');continue;
      }
      para.push(line);i++;
    }
    flush();
    return '<div class="kyro-md">'+out.join('')+'</div>';
  }

  window.kyroRenderMarkdown = renderMd;

  window.messageEl = function(m){
    var row=document.createElement('div');
    row.className='msg-row '+(m.role==='user'?'user':'ai')+(m._streaming?' kyro-message-streaming':'');
    var attachHtml='';
    if(m.attachments&&m.attachments.length){
      attachHtml=m.attachments.map(function(a){
        if(a.generatedImage&&a.dataUrl){
          return '<div class="msg-attach kyro-generated-image"><img src="'+a.dataUrl+'" alt="KYRO generated image"><div class="kyro-generated-image-tools"><button type="button" data-save-generated="'+esc(a.name||'kyro-generated.png')+'" data-image-src="'+a.dataUrl+'">Save image</button></div></div>';
        }
        return a.dataUrl ? '<div class="msg-attach"><img src="'+a.dataUrl+'" alt="Attached image"></div>' : '<div class="msg-attach" style="padding:10px 14px;display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text-dim);"><svg class="icon icon-sm"><use href="#i-file"></use></svg>'+esc(a.name||'File')+'</div>';
      }).join('');
    }
    var actions='';
    if(m.role==='ai'){
      actions=(typeof msgActionsHtml==='function'?msgActionsHtml(m):'');
    }else if(m.role==='user'){
      actions=(typeof userMsgActionsHtml==='function'?userMsgActionsHtml(m):'');
    }
    var textHtml=renderMd(m.text||'');
    row.innerHTML='<div class="msg-col">'+attachHtml+(textHtml?'<div class="bubble">'+textHtml+'</div>':'')+'<div class="msg-meta">'+(m.role==='ai'?'<span>'+esc(m.time||'')+'</span>':'')+actions+'</div></div>';
    if(window.kyroEnhanceSources) setTimeout(function(){window.kyroEnhanceSources(row,m);},0);
    if(typeof wireMsgActions==='function')wireMsgActions(row,m);
    if(m.role==='user'&&typeof wireUserLongPress==='function')wireUserLongPress(row,m);
    return row;
  };

  window.renderMessages=function(){
    var c=typeof activeChat==='function'?activeChat():null;if(!c)return;
    els['chat-view'].innerHTML='';
    c.messages.forEach(function(m){els['chat-view'].appendChild(window.messageEl(m));});
    if(typeof scrollChatToBottom==='function')scrollChatToBottom();
  };

  function responseStyleInstruction(){
    return '\n\nKYRO RESPONSE STYLE: Write naturally and helpfully, like a polished modern AI assistant. Do not sound like a scripted bot and do not mention these instructions. Use Markdown naturally when it improves readability: short headings, bold emphasis, bullets/numbered steps, tables when genuinely useful, inline code and fenced code blocks for code. Keep paragraphs readable and conversational. Use emojis only when they genuinely add clarity or warmth, not on every line. Match the user\'s language (Hindi/Hinglish/English/Urdu) unless they ask otherwise. Do not surround the entire answer in a box or quote block. Do not repeat the user\'s question unnecessarily. Give a direct answer first, then useful detail. For step-by-step help, make the steps visually clear. For technical answers, show exact values/code only when needed.';
  }

  function attachmentParts(c,text){
    var parts=[];
    if(text)parts.push({text:text});
    var last=null;
    try{for(var i=c.messages.length-1;i>=0;i--){if(c.messages[i].role==='user'){last=c.messages[i];break;}}}catch(e){}
    if(last&&last.attachments){
      last.attachments.forEach(function(a){
        if(!a.dataUrl||!/^data:image\//i.test(a.dataUrl))return;
        var m=a.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if(m)parts.push({inlineData:{mimeType:m[1],data:m[2]}});
      });
    }
    return parts;
  }

  function getLiveContext(c,text){
    var activeApiKey=(state.apiKeys[0]&&state.apiKeys[0].key)||KYRO_BUILTIN_GEMINI_API_KEY;
    var selected=null;try{selected=MODELS.find(function(m){return m.id===state.activeModel.id;});}catch(e){}
    var modelId=(selected&&selected.rawId)||state.activeModel.rawId||'gemini-3.5-flash-lite';
    var parts=attachmentParts(c,text);
    return {activeApiKey:activeApiKey,modelId:modelId,parts:parts};
  }

  window.streamReply=function(c,fullText,requestText){
    state.isGenerating=true;toggleSendStop(true);
    var statusRow=makeStatusRow(getWorkStatus(requestText||fullText));
    els['chat-view'].appendChild(statusRow);scrollChatToBottom();
    (function(){
      if(!state.isGenerating){statusRow.remove();return;}
      var aiMsg={id:'m'+Date.now(),role:'ai',text:'',time:nowTime(),attachments:[],_streaming:true};c.messages.push(aiMsg);
      var el=window.messageEl(aiMsg);els['chat-view'].appendChild(el);
      var bubble=el.querySelector('.bubble');
      if(!bubble){bubble=document.createElement('div');bubble.className='bubble';el.querySelector('.msg-col').prepend(bubble);}
      bubble.classList.add('is-streaming');
      var i=0, step=Math.max(8,Math.ceil(fullText.length/90));
      var interval=setInterval(function(){
        if(!state.isGenerating){clearInterval(interval);aiMsg.text=fullText;finish();return;}
        i=Math.min(fullText.length,i+step);aiMsg.text=fullText.slice(0,i);bubble.innerHTML=renderMd(aiMsg.text);scrollChatToBottom();
        if(i>=fullText.length){clearInterval(interval);finish();}
      },24);
      function finish(){
        state.isGenerating=false;toggleSendStop(false);statusRow.remove();
        aiMsg._streaming=false; aiMsg.text=fullText;var refreshed=window.messageEl(aiMsg);el.replaceWith(refreshed);
        if(state.ttsAuto)readAloud(aiMsg.text);scrollChatToBottom();
      }
    })();
  };

  window.liveReply=function(c,text){
    state.isGenerating=true;toggleSendStop(true);
    var ctx=getLiveContext(c,text), key=ctx.activeApiKey;
    if(!key||key==='PASTE_YOUR_GEMINI_API_KEY_HERE'){
      state.isGenerating=false;toggleSendStop(false);showErrorCard('Connection is not configured.');return;
    }
    var statusRow=makeStatusRow(getWorkStatus(text));els['chat-view'].appendChild(statusRow);scrollChatToBottom();
    var aiMsg={id:'m'+Date.now(),role:'ai',text:'',time:nowTime(),attachments:[],_streaming:true};c.messages.push(aiMsg);
    var el=window.messageEl(aiMsg);els['chat-view'].appendChild(el);
    var bubble=el.querySelector('.bubble');
    if(!bubble){bubble=document.createElement('div');bubble.className='bubble';el.querySelector('.msg-col').prepend(bubble);}
    bubble.classList.add('is-streaming');
    var endpoint='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(ctx.modelId)+':streamGenerateContent?alt=sse';
    var body={systemInstruction:{parts:[{text:(typeof KYRO_FINAL_PUBLIC_KNOWLEDGE==='string'?KYRO_FINAL_PUBLIC_KNOWLEDGE:'')+responseStyleInstruction()}]},contents:[{role:'user',parts:ctx.parts.length?ctx.parts:[{text:text}]}]};
    fetch(endpoint,{method:'POST',headers:geminiAuthHeaders(key),body:JSON.stringify(body)}).then(function(r){
      if(!r.ok)return r.text().then(function(t){throw new Error(t||('Gemini request failed ('+r.status+')'));});
      if(!r.body)throw new Error('Streaming is not available in this browser.');
      var reader=r.body.getReader(),decoder=new TextDecoder('utf-8'),buffer='',full='';
      function applyEvent(ev){
        var lines=ev.split(/\r?\n/);lines.forEach(function(line){
          if(line.indexOf('data:')!==0)return;var raw=line.slice(5).trim();if(!raw||raw==='[DONE]')return;
          try{var j=JSON.parse(raw),ps=j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts||[];ps.forEach(function(p){if(p.text){if(statusRow.parentNode)statusRow.remove();full+=p.text;aiMsg.text=full;bubble.innerHTML=renderMd(full);bubble.classList.add('is-streaming');scrollChatToBottom();}});}catch(e){}
        });
      }
      function pump(){return reader.read().then(function(x){
        if(x.done){if(buffer.trim())applyEvent(buffer);finish();return;}
        buffer+=decoder.decode(x.value,{stream:true});var chunks=buffer.split(/\r?\n\r?\n/);buffer=chunks.pop();chunks.forEach(applyEvent);return pump();
      });}
      return pump();
    }).catch(function(err){
      statusRow.remove();state.isGenerating=false;toggleSendStop(false);c.messages=c.messages.filter(function(m){return m!==aiMsg;});renderMessages();showErrorCard('Connection request failed. '+(err&&err.message?err.message:'Check the API key, model, quota and browser console.'));console.error('KYRO stream:',err);
    });
    function finish(){
      statusRow.remove();state.isGenerating=false;toggleSendStop(false);bubble.classList.remove('is-streaming');
      aiMsg._streaming=false;
      if(!aiMsg.text)aiMsg.text='No response text found in reply.';
      var refreshed=window.messageEl(aiMsg);el.replaceWith(refreshed);if(state.ttsAuto)readAloud(aiMsg.text);scrollChatToBottom();
    }
  };

  // Re-render an already-open chat with the new renderer.
  if(typeof activeChat==='function' && activeChat()) setTimeout(function(){try{window.renderMessages();}catch(e){}},0);
})();

(function(){
  function esc(v){ if(typeof window.esc==='function') return window.esc(String(v||'')); return String(v||'').replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c];}); }
  function sourceHtml(m){
    var list=Array.isArray(m&&m.sources)?m.sources:[]; if(!list.length)return '';
    var rows=list.map(function(x){
      var uri=String(x.uri||''); if(!/^https?:\/\//i.test(uri))return '';
      var title=String(x.title||uri); var domain=''; try{domain=new URL(uri).hostname.replace(/^www\./,'');}catch(_){}
      var icon='https://www.google.com/s2/favicons?domain='+encodeURIComponent(domain)+'&sz=64';
      return '<a class="kyro-source" href="'+esc(uri)+'" target="_blank" rel="noopener noreferrer"><img class="kyro-source-icon" src="'+esc(icon)+'" alt=""><span class="kyro-source-text"><span class="kyro-source-title">'+esc(title)+'</span><span class="kyro-source-domain">'+esc(domain)+'</span></span></a>';
    }).join('');
    return '<div class="kyro-sources"><button type="button" class="kyro-sources-toggle" aria-expanded="false"><span>Sources '+list.length+'</span><span class="chev">⌄</span></button><div class="kyro-sources-list">'+rows+'</div></div>';
  }
  window.kyroSourcesHtml=sourceHtml;
  function enhance(row,m){
    if(!row||!m||m.role!=='ai')return;
    var meta=row.querySelector('.msg-meta'); if(!meta)return;
    var old=meta.querySelector('.kyro-sources'); if(old)old.remove();
    var html=sourceHtml(m); if(!html)return;
    meta.insertAdjacentHTML('beforeend',html);
    var box=meta.querySelector('.kyro-sources'),btn=box&&box.querySelector('.kyro-sources-toggle');
    if(btn)btn.addEventListener('click',function(){var open=box.classList.toggle('open');btn.setAttribute('aria-expanded',open?'true':'false');});
  }
  window.kyroEnhanceSources=enhance;
})();

(function(){
  const install = () => {
    const box = document.querySelector('#app #composer textarea, #app textarea');
    if (!box || box.dataset.kyroEnterFixed === '1') return;
    box.dataset.kyroEnterFixed = '1';

    box.addEventListener('keydown', function(e){
      if (e.key !== 'Enter') return;

      /* Plain Enter must NOT send. Put a newline in the composer. */
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.stopImmediatePropagation();
        e.preventDefault();

        const start = this.selectionStart ?? this.value.length;
        const end = this.selectionEnd ?? start;
        this.setRangeText('\n', start, end, 'end');
        this.dispatchEvent(new Event('input', {bubbles:true}));
      }
    }, true);
  };

  install();
  new MutationObserver(function(){
    if(window.__kyroMOFreeze) return;
    install();
  }).observe(document.documentElement, {
    subtree:true, childList:true
  });
})();

(function(){
  function refresh(){
    if(window.__kyroMOFreeze) return;
    const chat = document.querySelector('#chat-view');
    if (!chat) return;
    const hasMessage = chat.children.length > 0 && !!chat.querySelector('.msg-row, .message, .chat-message, [data-message]');
    chat.classList.toggle('kyro-chat-has-message', hasMessage);
  }
  refresh();
  new MutationObserver(refresh).observe(document.documentElement, {subtree:true, childList:true});
})();

/* Image Generation disabled safely in this build. */

(function(){
  'use strict';
  var mode=null;
  var labels={
    imageGen:{title:'Image Generation',hint:'Describe the image you want to create…',icon:'image',status:'Generating image…'},
    pdf:{title:'PDF Analysis',hint:'Ask something about the PDF…',icon:'file',status:'Analyzing PDF…'},
    scan:{title:'Document Scan',hint:'Ask something about the scanned document…',icon:'scan',status:'Scanning document…'},
    analyze:{title:'Image Analysis',hint:'Ask something about the image…',icon:'image',status:'Analyzing image…'},
    deepResearch:{title:'Deep Research',hint:'Ask a research question…',icon:'search',status:'Deep Researching…'}
  };
  function q(id){return document.getElementById(id);}
  function ensureBar(){
    var composer=q('composer'); if(!composer)return null;
    var bar=q('kyro-work-mode-bar'); if(bar)return bar;
    bar=document.createElement('div'); bar.id='kyro-work-mode-bar';
    bar.innerHTML='<div class="kyro-work-mode-icon"></div><div class="kyro-work-mode-label"></div><button type="button" id="kyro-work-mode-cancel" aria-label="Exit mode">×</button>';
    var row=composer.querySelector('.composer-row'); if(row)composer.insertBefore(bar,row); else composer.appendChild(bar);
    q('kyro-work-mode-cancel').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();exit();},true);
    return bar;
  }
  function setMode(next){
    try{if(typeof window.kyroExitImageMode==="function")window.kyroExitImageMode();}catch(_){}
    mode=next; window.kyroWorkMode=next;
    var info=labels[next]; var bar=ensureBar();
    if(!info||!bar)return;
    bar.querySelector('.kyro-work-mode-icon').innerHTML='<svg class="icon"><use href="#i-'+info.icon+'"></use></svg>';
    bar.querySelector('.kyro-work-mode-label').innerHTML=info.title+'<small>'+info.hint+'</small>';
    bar.classList.add('show');
    var input=q('msg-input'); if(input){input.placeholder=info.hint;input.focus();}
    try{if(typeof closeSheets==='function')closeSheets();}catch(e){}
    try{if(typeof showChat==='function')showChat();}catch(e){}
    try{if(typeof updateSendBtn==='function')updateSendBtn();}catch(e){}
    /* When imageGen mode is selected, open the KYRO Image Gen modal */
    if(next==='imageGen' && typeof window.kyroOpenImageGen==='function'){
      try{window.kyroOpenImageGen();}catch(e){}
    }
  }
  function exit(){
    mode=null; window.kyroWorkMode=null;
    var bar=q('kyro-work-mode-bar'); if(bar)bar.classList.remove('show');
    var input=q('msg-input'); if(input)input.placeholder='Ask anything...';
    try{if(typeof updateSendBtn==='function')updateSendBtn();}catch(e){}
  }
  function setAfterAttach(next){
    try{if(typeof window.kyroExitImageMode==="function")window.kyroExitImageMode();}catch(_){}
    mode=next; window.kyroWorkMode=next;
    var info=labels[next],bar=ensureBar(); if(!info||!bar)return;
    bar.querySelector('.kyro-work-mode-icon').innerHTML='<svg class="icon"><use href="#i-'+info.icon+'"></use></svg>';
    bar.querySelector('.kyro-work-mode-label').innerHTML=info.title+'<small>'+info.hint+'</small>';
    bar.classList.add('show');
    var input=q('msg-input'); if(input)input.placeholder=info.hint;
  }
  function statusLabel(){return mode&&labels[mode]?labels[mode].status:null;}
  function makeStatus(text){
    var row=document.createElement('div'); row.className='kyro-mode-status-row';
    row.innerHTML='<div class="kyro-mode-status-spinner"></div><span></span>';
    row.querySelector('span').textContent=text; return row;
  }
  function bindTile(id,next){
    var el=q(id); if(!el||el.__kyroModeBound)return; el.__kyroModeBound=true;
    el.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();setMode(next);},true);
  }
  function bind(){
    bindTile('kyro-deep-research-sheet','deepResearch');
    var scan=q('kyro-scan-doc-sheet');
    if(scan&&!scan.__kyroScanBound){
      scan.__kyroScanBound=true;
      scan.addEventListener('click',function(e){
        e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
        setMode('scan');
        setTimeout(function(){try{if(typeof triggerAttach==='function')triggerAttach('camera');}catch(_){ }},80);
      },true);
    }
    var pdf=q('file-pdf'),gallery=q('file-gallery'),camera=q('file-camera'),files=q('file-files');
    if(pdf&&!pdf.__kyroModeChange){pdf.__kyroModeChange=true;pdf.addEventListener('change',function(){if(this.files&&this.files.length)setAfterAttach('pdf');},true);}
    if(gallery&&!gallery.__kyroModeChange){gallery.__kyroModeChange=true;gallery.addEventListener('change',function(){if(this.files&&this.files.length)setAfterAttach('analyze');},true);}
    if(camera&&!camera.__kyroModeChange){camera.__kyroModeChange=true;camera.addEventListener('change',function(){if(this.files&&this.files.length)setAfterAttach((window.kyroWorkMode==='scan')?'scan':'analyze');},true);}
    if(files&&!files.__kyroModeChange){files.__kyroModeChange=true;files.addEventListener('change',function(){if(this.files&&this.files.length)setAfterAttach('analyze');},true);}
    var origGet=window.getWorkStatus;
    if(!window.__kyroWorkStatusPatched && typeof origGet==='function'){
      window.__kyroWorkStatusPatched=true;
      window.getWorkStatus=function(text){return statusLabel()||origGet(text);};
    }
  }
  ensureBar(); bind();
  setTimeout(bind,300);setTimeout(bind,1200);setTimeout(bind,2500);
  window.kyroSetWorkMode=setMode;window.kyroExitWorkMode=exit;window.kyroWorkModeStatus=statusLabel;
})();

(function(){
  /* FINAL FIX: Profile -> any Settings panel -> Back must ALWAYS return
     to the Profile page. Settings opened from the normal sidebar keeps its
     normal Root -> Panel -> Root navigation. */
  function el(id){ return document.getElementById(id); }
  function isProfileReturn(){ return !!window.kyroSettingsReturnToProfile; }

  function returnToProfile(){
    if(typeof restoreProfileAfterChild === 'function') restoreProfileAfterChild();
    else {
      window.kyroSettingsReturnToProfile = false;
      window.kyroProfileChildOpen = false;
      try{ if(typeof closeModals === 'function') closeModals(); }catch(_){}
      document.querySelectorAll('.modal').forEach(function(m){m.classList.remove('show');});
      setTimeout(function(){try{if(typeof window.kyroOpenProfilePage==='function')window.kyroOpenProfilePage();}catch(_){}},0);
    }
  }

  /* Capture phase guarantees this wins over older/duplicate handlers. */
  document.addEventListener('click', function(e){
    var back = e.target.closest && e.target.closest('#settings-back');
    if(back && isProfileReturn()){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      returnToProfile();
      return;
    }

    var close = e.target.closest && e.target.closest('#settings-close');
    if(close && isProfileReturn()){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      returnToProfile();
      return;
    }

    var childBack = e.target.closest && e.target.closest('#about-back,#help-back,#about-close,#help-close');
    if(childBack && isProfileReturn()){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      returnToProfile();
      return;
    }

    var backdrop = e.target.closest && e.target.closest('#modal-backdrop');
    if(backdrop && e.target === backdrop && isProfileReturn()){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      returnToProfile();
    }
  }, true);

  /* If a setting is opened from Profile, mark the return destination even
     when another older handler opens the modal first. */
  document.addEventListener('click', function(e){
    var b=e.target.closest && e.target.closest('[data-kyro-setting]');
    if(!b) return;
    window.kyroSettingsReturnToProfile = true;
  }, true);

  /* Extra protection for the Android/browser Back gesture/button. */
  window.addEventListener('popstate', function(){
    if(isProfileReturn() || window.kyroProfileChildOpen) returnToProfile();
  });
})();

(function(){
  /*
   * KYRO FINAL NAVIGATION CLEANUP
   * The Settings modal is shared by:
   *   1) Profile -> settings
   *   2) Sidebar -> Projects / Plugins / Library / Settings
   *
   * The old handlers treated every Settings-panel Back as
   * "show Settings root". That is why the Settings root screenshot
   * appeared after returning from unrelated panels.
   *
   * This capture-phase handler gives each entry point its own destination:
   *   Profile child -> Profile
   *   Sidebar child -> close the Settings modal
   *   Profile Backup -> perform backup, then Profile
   *   Profile Restore -> open picker, then Profile after selection
   *   Profile Web Search -> toggle directly, then Profile
   */
  function q(id){ return document.getElementById(id); }

  function clearModalVisuals(){
    try{ document.querySelectorAll('.modal').forEach(function(m){m.classList.remove('show');}); }catch(_){}
    try{ var b=q('modal-backdrop'); if(b)b.classList.remove('show','model-popover-backdrop'); }catch(_){}
    try{ if(typeof closeSheets==='function') closeSheets(); }catch(_){}
  }

  function openProfileAgain(){
    try{
      if(typeof window.kyroOpenProfilePage==='function'){
        window.kyroOpenProfilePage();
        return;
      }
    }catch(_){}
    var p=q('kyro-profile-page');
    if(p){ p.classList.add('show'); p.setAttribute('aria-hidden','false'); }
  }

  function returnProfile(){
    window.kyroSettingsReturnToProfile=false;
    window.kyroProfileChildOpen=false;
    clearModalVisuals();
    setTimeout(openProfileAgain,0);
  }

  function markProfileChild(){
    window.kyroSettingsReturnToProfile=true;
    window.kyroProfileChildOpen=true;
    try{ history.pushState({kyroProfileChild:true},'',location.href); }catch(_){}
  }

  function hideProfile(){
    var p=q('kyro-profile-page');
    if(p){ p.classList.remove('show'); p.setAttribute('aria-hidden','true'); }
  }

  function openProfileSetting(which){
    markProfileChild();
    hideProfile();
    clearModalVisuals();

    if(which==='backup'){
      try{ if(typeof doBackup==='function') doBackup(); }catch(e){}
      returnProfile();
      return;
    }

    if(which==='restore'){
      try{
        if(typeof doRestore==='function') doRestore();
        /* The file picker is asynchronous. Return to Profile as soon as
           a file is selected; the existing restore handler continues
           reading/applying the file in the background. */
        setTimeout(function(){
          try{
            var ri=window.restoreInput;
            if(ri && !ri.__kyroProfileReturnBound){
              ri.__kyroProfileReturnBound=true;
              ri.addEventListener('change',function(){
                if(ri.files && ri.files.length) setTimeout(returnProfile,0);
              },{once:true});
            }
          }catch(_){}
        },0);
      }catch(e){ returnProfile(); }
      return;
    }

    if(which==='web'){
      try{
        if(state && state.activeModel && state.activeModel.provider==='Demo'){
          toast('Switch to a KYRO mode for Web Search');
        }else{
          state.webSearch=!state.webSearch;
          if(typeof updateCapabilityUI==='function') updateCapabilityUI();
          if(typeof scheduleSave==='function') scheduleSave();
          toast(state.webSearch?'Web Search enabled':'Web Search disabled');
        }
      }catch(_){}
      returnProfile();
      return;
    }

    try{
      openModal('modal-settings');
      showSettingsPanel(which);
      if(which==='api' && typeof renderApiKeys==='function') renderApiKeys();
      if(which==='models' && typeof buildModelList==='function') buildModelList();
    }catch(e){
      returnProfile();
    }
  }

  /* Profile setting cards: stop the older bubble listeners before they can
     open the generic Settings root. */
  document.addEventListener('click',function(e){
    var b=e.target.closest && e.target.closest('#kyro-profile-page [data-kyro-setting]');
    if(!b) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    openProfileSetting(b.getAttribute('data-kyro-setting'));
  },true);

  /* Settings-panel Back:
     - opened from Profile => Profile
     - opened from Sidebar => close completely (do NOT reveal Settings root)
  */
  document.addEventListener('click',function(e){
    var b=e.target.closest && e.target.closest('#settings-back');
    if(!b) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if(window.kyroSettingsReturnToProfile || window.kyroProfileChildOpen){
      returnProfile();
    }else{
      clearModalVisuals();
    }
  },true);

  /* X on Settings follows the same destination rule. */
  document.addEventListener('click',function(e){
    var b=e.target.closest && e.target.closest('#settings-close');
    if(!b) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if(window.kyroSettingsReturnToProfile || window.kyroProfileChildOpen){
      returnProfile();
    }else{
      clearModalVisuals();
    }
  },true);

  /* Android/browser Back:
     profile child -> profile;
     sidebar Settings child -> close the modal. */
  window.addEventListener('popstate',function(){
    if(window.kyroSettingsReturnToProfile || window.kyroProfileChildOpen){
      returnProfile();
      return;
    }
    var m=q('modal-settings');
    if(m && m.classList.contains('show')){
      var back=q('settings-back-wrap');
      if(back && !back.hidden) clearModalVisuals();
    }
  },true);
})();

(function(){
  'use strict';
  function q(id){return document.getElementById(id);}
  function toastL(s){try{toast(s);}catch(_){}}
  function closeLibraryMenu(){var m=q('kyro-library-more-menu');if(m)m.hidden=true;}
  function setFilter(filter){
    state.libraryFilter=filter;
    document.querySelectorAll('[data-library-filter]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-library-filter')===filter);});
    closeLibraryMenu(); renderLibrary();
  }
  function makeLibraryId(prefix){return prefix+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);}
  function uploadFiles(files){
    Array.prototype.forEach.call(files||[],function(file){
      var item={id:makeLibraryId('file'),name:file.name,type:file.type||'application/octet-stream',size:file.size||0,modified:'Modified today'};
      if(file.type && file.type.indexOf('image/')===0){
        var reader=new FileReader();
        reader.onload=function(e){item.dataUrl=e.target.result;state.library.push(item);renderLibrary();};
        reader.readAsDataURL(file);
      }else{state.library.push(item);renderLibrary();}
    });
    if(files && files.length) toastL(files.length+' file'+(files.length>1?'s':'')+' added to Library');
  }
  function newFolder(){
    var name=prompt('Folder name');
    if(!name || !name.trim()) return;
    state.libraryFolders=state.libraryFolders||[];
    state.libraryFolders.push({id:makeLibraryId('folder'),name:name.trim(),modified:'Modified today'});
    state.libraryFilter='all'; renderLibrary(); toastL('Folder created: '+name.trim());
  }
  function findItem(id){
    var all=(state.libraryFolders||[]).concat(state.library||[],state.libraryDeleted||[]);
    return all.find(function(x){return (x._libraryId||x.id)===id;}) || null;
  }
  function deleteItem(id){
    var folder=(state.libraryFolders||[]).findIndex(function(x){return (x._libraryId||x.id)===id;});
    if(folder>=0){var f=state.libraryFolders.splice(folder,1)[0];state.libraryDeleted.push(Object.assign({},f,{kind:'folder'}));renderLibrary();toastL('Moved to Deleted');return;}
    var idx=(state.library||[]).findIndex(function(x){return (x._libraryId||x.id)===id;});
    if(idx>=0){var a=state.library.splice(idx,1)[0];state.libraryDeleted.push(Object.assign({},a,{kind:'file'}));renderLibrary();toastL('Moved to Deleted');return;}
  }
  function restoreItem(id){
    var idx=(state.libraryDeleted||[]).findIndex(function(x){return (x._libraryId||x.id)===id;});
    if(idx<0)return;
    var a=state.libraryDeleted.splice(idx,1)[0];
    if(a.kind==='folder') (state.libraryFolders=state.libraryFolders||[]).push(a); else state.library.push(a);
    renderLibrary(); toastL('Restored');
  }
  function permanentDelete(id){
    var idx=(state.libraryDeleted||[]).findIndex(function(x){return (x._libraryId||x.id)===id;});
    if(idx<0)return; state.libraryDeleted.splice(idx,1); renderLibrary(); toastL('Deleted permanently');
  }
  function renameItem(id){
    var item=findItem(id); if(!item)return;
    var name=prompt('Rename',item.name||'Untitled'); if(!name || !name.trim())return;
    item.name=name.trim(); renderLibrary(); toastL('Renamed');
  }
  function openItemMenu(id,btn){
    document.querySelectorAll('.kyro-library-item-menu').forEach(function(x){x.remove();});
    var item=findItem(id); if(!item)return;
    var menu=document.createElement('div'); menu.className='kyro-library-item-menu';
    if(state.libraryFilter==='deleted'){
      menu.innerHTML='<button data-library-item-action="restore">Restore</button><button data-library-item-action="permanent" class="danger">Delete permanently</button>';
    }else{
      menu.innerHTML='<button data-library-item-action="rename">Rename</button><button data-library-item-action="delete" class="danger">Delete from library</button>';
    }
    menu.dataset.itemId=id;
    var r=btn.getBoundingClientRect(); menu.style.left=Math.max(12,Math.min(window.innerWidth-230,r.right-220))+'px'; menu.style.top=Math.min(window.innerHeight-150,r.bottom+6)+'px';
    document.body.appendChild(menu);
  }
  window.kyroOpenLibrary=function(){
    var sm=q('modal-settings'); if(!sm)return;
    try{closeSheets();}catch(_){ }
    sm.classList.remove('kyro-scheduled-mode'); sm.classList.add('kyro-library-mode');
    sm.classList.add('show');
    try{showSettingsPanel('library');}catch(_){ }
    q('panel-library').hidden=false;
    closeLibraryMenu();
    renderLibrary();
  };
  function exitLibrary(){
    closeLibraryMenu();
    document.querySelectorAll('.kyro-library-item-menu').forEach(function(x){x.remove();});
    var sm=q('modal-settings'); if(sm) sm.classList.remove('kyro-library-mode');
    try{showSettingsPanel('root');}catch(_){ }
  }
  document.addEventListener('click',function(e){
    var back=e.target.closest&&e.target.closest('#kyro-library-back');
    if(back){e.preventDefault();e.stopPropagation();exitLibrary();return;}
    var more=e.target.closest&&e.target.closest('#kyro-library-more');
    if(more){e.preventDefault();var m=q('kyro-library-more-menu');if(m)m.hidden=!m.hidden;return;}
    var filter=e.target.closest&&e.target.closest('[data-library-filter]');
    if(filter){e.preventDefault();setFilter(filter.getAttribute('data-library-filter'));return;}
    var action=e.target.closest&&e.target.closest('[data-library-action]');
    if(action){
      e.preventDefault(); var a=action.getAttribute('data-library-action'); closeLibraryMenu();
      if(a==='upload'){var inp=q('kyro-library-file-input');if(inp)inp.click();}
      else if(a==='folder')newFolder();
      else if(a==='grid'){state.libraryView='grid';renderLibrary();}
      else if(a==='list'){state.libraryView='list';renderLibrary();}
      else if(a==='deleted'){state.libraryFilter='deleted';document.querySelectorAll('[data-library-filter]').forEach(function(b){b.classList.remove('active');});renderLibrary();}
      else if(a==='select'){state.librarySelectMode=true;state.librarySelected=[];renderLibrary();}
      return;
    }
    var itemMore=e.target.closest&&e.target.closest('[data-library-more]');
    if(itemMore){e.preventDefault();e.stopPropagation();openItemMenu(itemMore.getAttribute('data-library-more'),itemMore);return;}
    var itemAction=e.target.closest&&e.target.closest('[data-library-item-action]');
    if(itemAction){
      e.preventDefault();var menu=itemAction.closest('.kyro-library-item-menu');var id=menu&&menu.dataset.itemId;var ia=itemAction.getAttribute('data-library-item-action');
      if(ia==='rename')renameItem(id); else if(ia==='delete')deleteItem(id); else if(ia==='restore')restoreItem(id); else if(ia==='permanent')permanentDelete(id);
      if(menu)menu.remove();return;
    }
    var check=e.target.closest&&e.target.closest('[data-library-select]');
    if(check){e.preventDefault();var id=check.getAttribute('data-library-select');var i=state.librarySelected.indexOf(id);if(i>=0)state.librarySelected.splice(i,1);else state.librarySelected.push(id);renderLibrary();return;}
    var selectAll=e.target.closest&&e.target.closest('#kyro-library-select-all');
    if(selectAll){state.librarySelected=[];document.querySelectorAll('#kyro-library-grid .kyro-library-item').forEach(function(card){var id=card.dataset.libraryId; if(id) state.librarySelected.push(id);});renderLibrary();return;}
    var cancel=e.target.closest&&e.target.closest('#kyro-library-select-cancel');
    if(cancel){state.librarySelectMode=false;state.librarySelected=[];renderLibrary();return;}
    var delSel=e.target.closest&&e.target.closest('#kyro-library-delete-selected');
    if(delSel){var ids=state.librarySelected.slice();ids.forEach(deleteItem);state.librarySelected=[];state.librarySelectMode=false;renderLibrary();return;}
    var page=q('kyro-library-page'), menu=q('kyro-library-more-menu');
    if(menu&&!menu.hidden&&!e.target.closest('#kyro-library-more-menu')&&!e.target.closest('#kyro-library-more'))closeLibraryMenu();
    if(page && !e.target.closest('.kyro-library-item-menu')) document.querySelectorAll('.kyro-library-item-menu').forEach(function(x){if(!e.target.closest('[data-library-more]'))x.remove();});
  },true);
  var fileInput=q('kyro-library-file-input');
  if(fileInput)fileInput.addEventListener('change',function(){uploadFiles(fileInput.files);fileInput.value='';});
  var search=q('kyro-library-search');
  if(search)search.addEventListener('input',function(){state.librarySearch=search.value;renderLibrary();});
  var oldRender=window.renderLibrary;
  window.kyroRenderLibrary=renderLibrary;
  var originalLibraryRender=renderLibrary;
  window.addEventListener('resize',function(){document.querySelectorAll('.kyro-library-item-menu').forEach(function(x){x.remove();});});
})();

(function(){
  'use strict';
  function q(id){return document.getElementById(id);}
  function setFilterMenu(show){var m=q('kyro-tasks-filter-menu'); if(m) m.hidden=!show;}
  function filterTasks(status){
    document.querySelectorAll('#kyro-tasks-list .kyro-task-card').forEach(function(card){
      card.style.display=(status==='active'||card.dataset.taskStatus===status)?'block':'none';
    });
    var t=q('kyro-tasks-filter-trigger'); if(t) t.firstChild.textContent=status.charAt(0).toUpperCase()+status.slice(1)+' ';
    setFilterMenu(false);
  }
  window.kyroOpenScheduledTasks=function(){
    var page=q('kyro-tasks-page'); if(!page) return;
    page.hidden=false;
    var sm=q('modal-settings'); if(sm) sm.classList.add('kyro-scheduled-mode');
    setFilterMenu(false);
    filterTasks('active');
    var input=q('kyro-task-input'); if(input) setTimeout(function(){input.blur();},0);
  };
  document.addEventListener('click',function(e){
    var trigger=e.target.closest&&e.target.closest('#kyro-tasks-filter-trigger,#kyro-tasks-filter');
    if(trigger){e.preventDefault();e.stopPropagation();var m=q('kyro-tasks-filter-menu');setFilterMenu(!m||m.hidden);return;}
    var option=e.target.closest&&e.target.closest('[data-task-filter]');
    if(option){e.preventDefault();filterTasks(option.getAttribute('data-task-filter'));return;}
    var plus=e.target.closest&&e.target.closest('.kyro-task-plus');
    if(plus){e.preventDefault();var name=plus.getAttribute('data-task-name')||'New task';var input=q('kyro-task-input');if(input){input.value=name;input.focus();}return;}
    var back=e.target.closest&&e.target.closest('#kyro-tasks-back');
    if(back){e.preventDefault();var sm=q('modal-settings');if(sm) sm.classList.remove('kyro-scheduled-mode');try{showSettingsPanel('root');}catch(_){ }return;}
    var mic=e.target.closest&&e.target.closest('#kyro-task-mic');
    if(mic){try{toast('Voice task input');}catch(_){ }return;}
    var page=q('kyro-tasks-page');var menu=q('kyro-tasks-filter-menu');
    if(menu&&!menu.hidden&&page&&!e.target.closest('#kyro-tasks-filter-menu')) setFilterMenu(false);
  },true);
  var input=q('kyro-task-input');
  if(input) input.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&input.value.trim()){try{toast('Task created: '+input.value.trim());}catch(_){ }input.value='';}
  });
})();

(function(){
  function init(){
    var bd=document.getElementById('kyro-share-backdrop');
    var close=document.getElementById('kyro-share-close');
    if(close) close.addEventListener('click',closeKyroShare);
    if(close) close.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();closeKyroShare();});
    if(bd) bd.addEventListener('click',function(e){if(e.target===bd) closeKyroShare();});
    if(bd) bd.addEventListener('pointerdown',function(e){if(e.target===bd){e.preventDefault();closeKyroShare();}});
    document.querySelectorAll('#kyro-share-grid [data-share-target]').forEach(function(btn){
      btn.addEventListener('click',function(){kyroOpenTarget(btn.getAttribute('data-share-target'));});
    });
    var copy=document.getElementById('kyro-copy-share-link');
    if(copy) copy.addEventListener('click',function(){
      var p=kyroSharePayload();
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(p.url).then(function(){toast('Share link copied');}).catch(function(){toast('Could not copy link');});}
      else{var ta=document.createElement('textarea');ta.value=p.url;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('Share link copied');}catch(e){toast('Could not copy link');}ta.remove();}
    });
    var sys=document.getElementById('kyro-system-share');
    if(sys) sys.addEventListener('click',function(){
      var p=kyroSharePayload();
      if(navigator.share){navigator.share({title:p.title,text:p.text,url:p.url}).then(function(){toast('Chat shared');}).catch(function(){});}
      else{navigator.clipboard&&navigator.clipboard.writeText(p.url).then(function(){toast('Share link copied');}).catch(function(){toast('Share is not available on this device');});}
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape') closeKyroShare();});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();

(function(){
  'use strict';
  function keepSessionDuringSelection(){
    try{
      var gate=document.getElementById('firebase-auth-gate');
      var app=document.getElementById('app');
      var remembered=localStorage.getItem('kyroRememberedLogin')==='1';
      var loggedOut=localStorage.getItem('kyroExplicitLogout')==='1';
      if(remembered && !loggedOut && app && !app.hidden && gate && !gate.hidden){
        gate.hidden=true;
      }
    }catch(e){}
  }
  document.addEventListener('selectionchange',keepSessionDuringSelection,true);
})();

window.KYRO_PRO_AI_READY=true;

(function(){
  'use strict';
  var userMenu=null;
  function closeUserMenu(){if(userMenu){userMenu.remove();userMenu=null;}}
  function copySafe(t){try{if(typeof copyText==='function')copyText(t);else if(navigator.clipboard)navigator.clipboard.writeText(String(t||''));}catch(_){} }
  function showUserMenu(m,x,y){
    closeUserMenu();
    userMenu=document.createElement('div');userMenu.id='kyro-user-message-menu';
    [{icon:'edit',label:'Edit',fn:function(){if(typeof editMessage==='function')editMessage(m);} },
     {icon:'copy',label:'Copy',fn:function(){copySafe(m.text);}}].forEach(function(a){
      var b=document.createElement('button');b.type='button';
      b.innerHTML='<svg class="icon"><use href="#i-'+a.icon+'"/></svg><span>'+a.label+'</span>';
      b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();closeUserMenu();a.fn();});
      userMenu.appendChild(b);
    });
    document.body.appendChild(userMenu);
    var left=Math.max(8,Math.min(window.innerWidth-178,(x||20)));
    var top=Math.max(8,Math.min(window.innerHeight-105,(y||200)));
    userMenu.style.left=left+'px';userMenu.style.top=top+'px';
  }
  document.addEventListener('pointerdown',function(e){
    if(userMenu && !(e.target.closest&&e.target.closest('#kyro-user-message-menu')))closeUserMenu();
  },true);

  /* User message long press = Edit / Copy. */
  window.wireUserLongPress=function(row,m){
    if(!row||!m)return;
    row.setAttribute('data-message-copy-enabled','1');

    var timer=null, sx=0, sy=0, fired=false, touchMode=false;
    function clearPress(){
      if(timer){clearTimeout(timer);timer=null;}
    }
    function fire(x,y,e){
      clearPress();
      if(fired)return;
      fired=true;
      if(e){try{e.preventDefault();}catch(_){} try{e.stopPropagation();}catch(_){}}
      showUserMenu(m, x || sx || 20, y || sy || 200);
    }
    function start(x,y,e,isTouch){
      touchMode=!!isTouch;
      sx=x||0; sy=y||0; fired=false;
      clearPress();
      timer=setTimeout(function(){
        timer=null;
        fire(sx,sy,e);
      },500);
    }
    function move(x,y){
      if(Math.abs((x||0)-sx)>14 || Math.abs((y||0)-sy)>14) clearPress();
    }
    function end(){
      clearPress();
      setTimeout(function(){fired=false;},80);
    }

    /* Android touch path */
    row.addEventListener('touchstart',function(e){
      if(!e.touches||!e.touches[0])return;
      var p=e.touches[0];
      start(p.clientX,p.clientY,e,true);
    },{capture:true,passive:false});

    row.addEventListener('touchmove',function(e){
      if(!e.touches||!e.touches[0])return;
      var p=e.touches[0];
      move(p.clientX,p.clientY);
    },{capture:true,passive:true});

    row.addEventListener('touchend',end,{capture:true,passive:true});
    row.addEventListener('touchcancel',end,{capture:true,passive:true});

    /* Pointer/mouse fallback */
    row.addEventListener('pointerdown',function(e){
      if(touchMode && e.pointerType==='touch')return;
      if(e.button!==undefined&&e.button!==0)return;
      start(e.clientX,e.clientY,e,false);
    },true);
    row.addEventListener('pointermove',function(e){move(e.clientX,e.clientY);},true);
    row.addEventListener('pointerup',end,true);
    row.addEventListener('pointercancel',end,true);

    /* Desktop/right-click fallback */
    row.addEventListener('contextmenu',function(e){
      e.preventDefault();
      e.stopPropagation();
      fire(e.clientX,e.clientY,e);
    },true);

    row.addEventListener('click',function(e){
      if(fired){
        e.preventDefault();
        e.stopPropagation();
        fired=false;
      }
    },true);
  };

  /* AI reply action row: Read, Regenerate, Share, Copy. */
  window.msgActionsHtml=function(){
    return '<div class="msg-actions">'+
      '<button data-act="read" title="Read aloud"><svg class="icon icon-sm"><use href="#i-volume"/></svg></button>'+
      '<button data-act="regen" title="Regenerate"><svg class="icon icon-sm"><use href="#i-refresh"/></svg></button>'+
      '<button data-act="share" title="Share"><svg class="icon icon-sm"><use href="#i-share"/></svg></button>'+
      '<button data-act="copy" title="Copy"><svg class="icon icon-sm"><use href="#i-copy"/></svg></button>'+
      '</div>';
  };

  /* Re-render after the override so the new bottom Copy button appears immediately. */
  function refresh(){try{if(typeof renderMessages==='function')renderMessages();}catch(_){}
    try{if(typeof window.renderMessages==='function')window.renderMessages();}catch(_){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(refresh,50);},{once:true});
  else setTimeout(refresh,50);
})();

(function(){
  'use strict';
  function getMessageText(row){
    var bubble=row.querySelector('.bubble');
    if(!bubble)return '';
    var clone=bubble.cloneNode(true);
    clone.querySelectorAll('button,.kyro-code-copy').forEach(function(x){x.remove();});
    return clone.innerText||clone.textContent||'';
  }
  function ensureCopy(row){
    if(!row || !row.classList.contains('ai')) return;
    if(row.classList.contains('kyro-message-streaming')) return;
    var meta=row.querySelector('.msg-meta');
    if(!meta)return;
    var actions=meta.querySelector('.msg-actions');
    if(!actions){
      actions=document.createElement('div');
      actions.className='msg-actions';
      meta.appendChild(actions);
    }
    if(actions.querySelector('.kyro-forced-copy,[data-act="copy"]')) return;
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='kyro-forced-copy';
    btn.title='Copy';
    btn.setAttribute('aria-label','Copy');
    btn.innerHTML='<svg class="icon icon-sm"><use href="#i-copy"></use></svg>';
    btn.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      var text=getMessageText(row);
      try{
        if(typeof copyText==='function') copyText(text);
        else if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text);
      }catch(_){ }
    });
    actions.appendChild(btn);
  }
  function scan(){
    document.querySelectorAll('#chat-view .msg-row.ai').forEach(ensureCopy);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){scan();setTimeout(scan,100);setTimeout(scan,700);},{once:true});
  }else{
    scan();setTimeout(scan,100);setTimeout(scan,700);
  }
  var root=document.getElementById('chat-view');
  if(root){
    new MutationObserver(function(){if(window.__kyroMOFreeze)return;scan();}).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }else{
    var wait=new MutationObserver(function(){
      if(window.__kyroMOFreeze)return;
      var r=document.getElementById('chat-view');
      if(r){
        wait.disconnect();
        new MutationObserver(function(){if(window.__kyroMOFreeze)return;scan();}).observe(r,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
        scan();
      }
    });
    wait.observe(document.documentElement,{childList:true,subtree:true});
  }
})();

(function(){
  "use strict";
  var SETUP_KEY="kyroFirstRunPermissionsV1";
  var running=false;
  function el(id){return document.getElementById(id)}
  function isCapacitor(){try{return !!(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.getPlatform && window.Capacitor.getPlatform()!=='web'));}catch(e){return false}}
  function show(){var x=el("kyro-permission-setup");if(!x)return;x.hidden=false;x.setAttribute("aria-hidden","false")}
  function hide(){var x=el("kyro-permission-setup");if(!x)return;x.hidden=true;x.setAttribute("aria-hidden","true")}
  function status(t){var x=el("kyro-permission-status");if(x)x.textContent=t||""}
  function done(){try{localStorage.setItem(SETUP_KEY,"1")}catch(e){}hide()}

  async function askMic(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){return false}
    try{var stream=await navigator.mediaDevices.getUserMedia({audio:true});stream.getTracks().forEach(function(t){try{t.stop()}catch(e){}});return true}catch(e){return false}
  }
  async function askCamera(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){return false}
    try{var stream=await navigator.mediaDevices.getUserMedia({video:true});stream.getTracks().forEach(function(t){try{t.stop()}catch(e){}});return true}catch(e){return false}
  }

  async function requestAll(){
    if(running)return; running=true;
    var btn=el("kyro-permission-allow"); if(btn)btn.disabled=true;
    status("Microphone permission…");
    await askMic();
    status("Camera permission…");
    await askCamera();
    status("Setup complete. Gallery opens from Photos/Gallery.");
    setTimeout(function(){done();running=false},450);
  }

  function firstRun(){
    var saved=false;try{saved=localStorage.getItem(SETUP_KEY)==="1"}catch(e){}
    if(saved)return;
    /* Keep normal login first. The setup appears only after KYRO has opened. */
    show();
  }

  function hook(){
    var b=el("kyro-permission-allow"),s=el("kyro-permission-skip");
    if(b)b.addEventListener("click",requestAll);
    if(s)s.addEventListener("click",done);
    window.kyroShowPermissionSetup=firstRun;
  }

  /* Show after the normal KYRO boot animation, not before login. */
  window.addEventListener("kyro-app-ready",function(){setTimeout(firstRun,180)});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hook,{once:true});else hook();

  /* The existing boot function calls this after the splash finishes. */
  window.kyroMaybeShowFirstRunPermissions=function(){
    try{if(!window.kyroLoginApproved)return;firstRun()}catch(e){}
  };
})();

/* Guarantee the share sheet closes when × is tapped, regardless of other handlers. */
document.addEventListener('click',function(e){
  var btn=e.target.closest && e.target.closest('#kyro-share-close');
  if(!btn) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if(typeof closeKyroShare==='function') closeKyroShare();
  else{
    var bd=document.getElementById('kyro-share-backdrop');
    if(bd){bd.classList.remove('show');bd.setAttribute('aria-hidden','true');}
    document.body.classList.remove('kyro-share-open');
  }
},true);
document.addEventListener('pointerdown',function(e){
  var btn=e.target.closest && e.target.closest('#kyro-share-close');
  if(!btn) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if(typeof closeKyroShare==='function') closeKyroShare();
  else{
    var bd=document.getElementById('kyro-share-backdrop');
    if(bd){bd.classList.remove('show');bd.setAttribute('aria-hidden','true');}
    document.body.classList.remove('kyro-share-open');
  }
},true);

/* Close share sheet when tapping outside the sheet content */
document.addEventListener('pointerdown',function(e){
  var bd=document.getElementById('kyro-share-backdrop');
  if(!bd || !bd.classList.contains('show')) return;
  var sheet=e.target.closest && e.target.closest('#kyro-share-sheet');
  var close=e.target.closest && e.target.closest('#kyro-share-close');
  if(!sheet && !close){
    e.preventDefault();
    if(typeof closeKyroShare==='function') closeKyroShare();
    else{bd.classList.remove('show');bd.setAttribute('aria-hidden','true');document.body.classList.remove('kyro-share-open');}
  }
},true);

(function(){
  'use strict';
  function q(id){return document.getElementById(id);}
  function getInfo(name){
    var map={
      imageGen:{title:'Image Generation',hint:'Describe the image you want to create…',icon:'image'},
      pdf:{title:'PDF Analysis',hint:'Ask something about the PDF…',icon:'file'},
      scan:{title:'Document Scan',hint:'Ask something about the scanned document…',icon:'scan'},
      analyze:{title:'Image Analysis',hint:'Ask something about the image…',icon:'image'},
      deepResearch:{title:'Deep Research',hint:'Ask a research question…',icon:'search'}
    };
    return map[name]||null;
  }
  function ensure(){
    var composer=q('composer'); if(!composer)return null;
    var bar=q('kyro-work-mode-bar'); if(!bar){
      bar=document.createElement('div');bar.id='kyro-work-mode-bar';
      var row=composer.querySelector('.composer-row');
      if(row)composer.insertBefore(bar,row);else composer.appendChild(bar);
    }
    bar.innerHTML='<div class="kyro-work-mode-icon"></div><div class="kyro-work-mode-label"></div><button type="button" id="kyro-work-mode-cancel" aria-label="Exit selected mode">×</button>';
    var cancel=q('kyro-work-mode-cancel');
    if(cancel&&!cancel.__kyroChipBound){
      cancel.__kyroChipBound=true;
      cancel.addEventListener('click',function(e){
        e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
        if(typeof window.kyroExitWorkMode==='function')window.kyroExitWorkMode();
      },true);
    }
    return bar;
  }
  function render(name){
    var bar=ensure(),info=getInfo(name); if(!bar||!info)return;
    bar.querySelector('.kyro-work-mode-icon').innerHTML='<svg class="icon"><use href="#i-'+info.icon+'"></use></svg>';
    bar.querySelector('.kyro-work-mode-label').innerHTML=info.title+'<small>'+info.hint+'</small>';
    bar.classList.add('show');
    var input=q('msg-input');
    if(input){input.classList.add('kyro-mode-input');input.placeholder=info.hint;}
  }
  function clear(){
    var bar=q('kyro-work-mode-bar');if(bar)bar.classList.remove('show');
    var input=q('msg-input');if(input){input.classList.remove('kyro-mode-input');input.placeholder='Ask anything...';}
  }
  window.addEventListener('kyro-work-mode-changed',function(e){
    var name=e&&e.detail?e.detail:null;
    if(name)render(name);else clear();
  });
  var oldSet=window.kyroSetWorkMode;
  if(typeof oldSet==='function'&&!window.__kyroModeSetWrapped){
    window.__kyroModeSetWrapped=true;
    window.kyroSetWorkMode=function(name){
      oldSet(name);render(name);
      try{window.dispatchEvent(new CustomEvent('kyro-work-mode-changed',{detail:name}));}catch(e){}
    };
  }
  var oldExit=window.kyroExitWorkMode;
  if(typeof oldExit==='function'&&!window.__kyroModeExitWrapped){
    window.__kyroModeExitWrapped=true;
    window.kyroExitWorkMode=function(){
      oldExit();clear();
      try{window.dispatchEvent(new CustomEvent('kyro-work-mode-changed',{detail:null}));}catch(e){}
    };
  }
  function watch(){
    ensure();
    var name=window.kyroWorkMode;
    if(name)render(name);else clear();
  }
  watch();setTimeout(watch,250);setTimeout(watch,1000);setTimeout(watch,2200);
})();

(function(){
  "use strict";
  window.kyroAutoLocalLogin = false;

  function getStoredLocalAccount(){
    try{ return typeof getLocalAccount === "function" ? getLocalAccount() : null; }
    catch(e){ return null; }
  }

  function hasSavedAccount(){
    var acc=getStoredLocalAccount();
    return !!(acc && acc.username);
  }

  window.syncKyroGreeting = function(){
    try{
      const acc=getStoredLocalAccount();
      const name=(window.state && state.userName) || (acc && acc.username) ||
                 localStorage.getItem("kyroUserName") || "";
      const el=document.getElementById("greeting-title");
      if(el && name) el.textContent="Hello, "+name;
    }catch(e){}
  };

  window.tryAutoLocalLogin = function(){
    var acc=getStoredLocalAccount();
    if(!acc || !acc.username) return false;

    /*
      KYRO DEVICE LOGIN:
      A saved local account means this device is already signed in.
      Reopening/reloading the app must NOT show the login/account screen.
      Only deleting the saved account/app data should remove this state.
      We intentionally clear the old explicit-logout flag here because the
      user's requested behavior is persistent login until the app/account is deleted.
    */
    try{
      localStorage.setItem("kyroRememberedLogin","1");
      localStorage.removeItem("kyroExplicitLogout");
      localStorage.setItem("kyroUserName",acc.username);
    }catch(e){}

    window.kyroAutoLocalLogin=true;
    window.kyroFirebaseUser=null;
    if(window.state) state.userName=acc.username;
    window.syncKyroGreeting();
    try{ ensureGeminiModelForSavedKey(); }catch(e){}

    /* Reuse the existing KYRO splash/boot animation on every reopen. */
    if(typeof startAppBoot === "function"){
      try{ startAppBoot(); }catch(e){ console.warn("KYRO auto boot:",e); }
    }
    return true;
  };

  function hideAuthGateIfSaved(){
    if(!hasSavedAccount()) return;
    try{
      localStorage.setItem("kyroRememberedLogin","1");
      localStorage.removeItem("kyroExplicitLogout");
    }catch(e){}
    var gate=document.getElementById("firebase-auth-gate");
    if(gate) gate.hidden=true;
  }

  function installGreetingObserver(){
    const el=document.getElementById("greeting-title");
    if(!el) return;
    let busy=false;
    const observer=new MutationObserver(function(){
      if(busy || window.__kyroMOFreeze) return;
      try{
        const acc=getStoredLocalAccount();
        const name=(window.state && state.userName) || (acc && acc.username) ||
                   localStorage.getItem("kyroUserName") || "";
        if(name && el.textContent!=="Hello, "+name){
          busy=true; el.textContent="Hello, "+name; busy=false;
        }
      }catch(e){}
    });
    observer.observe(el,{childList:true,characterData:true,subtree:true});
    window.syncKyroGreeting();
  }

  function initFix(){
    installGreetingObserver();
    /* Existing account = automatic login + the normal KYRO rotating splash. */
    if(hasSavedAccount()){
      try{ window.tryAutoLocalLogin(); }catch(e){ console.warn("KYRO persistent login:",e); }
    }
    setTimeout(function(){ if(hasSavedAccount()) hideAuthGateIfSaved(); },100);
    setTimeout(function(){ if(hasSavedAccount()) window.syncKyroGreeting(); },700);
    setTimeout(function(){ if(hasSavedAccount()) hideAuthGateIfSaved(); },1200);
    setTimeout(function(){ if(hasSavedAccount()) window.syncKyroGreeting(); },3200);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initFix,{once:true});
  else initFix();

  window.addEventListener("pageshow",function(){
    if(hasSavedAccount() && !window.kyroLoginApproved){
      try{ window.tryAutoLocalLogin(); }catch(e){}
    }
  });
})();

(function(){
  async function restore(){
    try{
      var acc=await kyroLoadAccount();
      if(!acc||!acc.username)return;
      kyroMirrorAccountToLocalStorage(acc);
      window.kyroAutoLocalLogin=true; window.kyroFirebaseUser=null;
      try{if(window.state)state.userName=acc.username;}catch(_){}
      try{if(typeof window.syncKyroGreeting==="function")window.syncKyroGreeting();}catch(_){}
      try{if(typeof ensureGeminiModelForSavedKey==="function")ensureGeminiModelForSavedKey();}catch(_){}
      try{if(typeof window.tryAutoLocalLogin==="function"){window.tryAutoLocalLogin();return;}}catch(_){}
      try{if(typeof startAppBoot==="function")startAppBoot();}catch(_){}
    }catch(e){console.warn("KYRO persistent account restore:",e);}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",restore,{once:true});else restore();
  window.addEventListener("pageshow",function(){setTimeout(function(){ if(!window.kyroLoginApproved) restore(); },120);});
})();

(function(){
  'use strict';
  var menu=null;
  function close(){if(menu){menu.remove();menu=null;}}
  function copy(t){
    try{
      if(typeof copyText==='function'){copyText(t);return;}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(String(t||''));return;}
      var ta=document.createElement('textarea');ta.value=String(t||'');ta.style.position='fixed';ta.style.opacity='0';
      document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
    }catch(e){}
  }
  function show(m,x,y){
    close();
    menu=document.createElement('div');
    menu.id='kyro-user-message-menu-final';
    menu.style.cssText='position:fixed;z-index:40000;width:172px;padding:6px;border-radius:15px;background:color-mix(in srgb,var(--surface-2) 96%,#000 4%);border:1px solid var(--border);box-shadow:0 16px 40px rgba(0,0,0,.48);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);';
    [
      ['edit','Edit',function(){try{if(typeof editMessage==='function')editMessage(m);}catch(e){}}],
      ['copy','Copy',function(){copy(m&&m.text||'');}]
    ].forEach(function(a){
      var b=document.createElement('button');b.type='button';
      b.style.cssText='width:100%;height:42px;display:flex;align-items:center;gap:10px;padding:0 12px;border:0;border-radius:11px;background:transparent;color:var(--text);font:inherit;font-size:14px;text-align:left;';
      b.innerHTML='<svg class="icon" style="width:18px;height:18px"><use href="#i-'+a[0]+'"></use></svg><span>'+a[1]+'</span>';
      b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();close();a[2]();});
      menu.appendChild(b);
    });
    document.body.appendChild(menu);
    menu.style.left=Math.max(8,Math.min(window.innerWidth-180,(x||20)))+'px';
    menu.style.top=Math.max(8,Math.min(window.innerHeight-110,(y||200)))+'px';
  }
  document.addEventListener('pointerdown',function(e){
    if(menu && !(e.target.closest&&e.target.closest('#kyro-user-message-menu-final')))close();
  },true);
  window.wireUserLongPress=function(row,m){
    if(!row||!m||row.__kyroFinalLongPressV2)return;
    row.__kyroFinalLongPressV2=true;
    var timer=null,sx=0,sy=0,triggered=false;
    function cancel(){if(timer){clearTimeout(timer);timer=null;}}
    function openMenu(x,y,e){
      cancel();triggered=true;
      if(e){try{e.preventDefault();}catch(_){}try{e.stopPropagation();}catch(_){}}
      show(m,x||sx||20,y||sy||200);
    }
    function start(x,y){
      sx=x||0;sy=y||0;triggered=false;cancel();
      timer=setTimeout(function(){timer=null;openMenu(sx,sy,null);},500);
    }
    function move(x,y){if(Math.abs((x||0)-sx)>14||Math.abs((y||0)-sy)>14)cancel();}
    row.addEventListener('touchstart',function(e){
      if(!e.touches||!e.touches[0])return;
      var p=e.touches[0];start(p.clientX,p.clientY);
    },{capture:true,passive:true});
    row.addEventListener('touchmove',function(e){
      if(!e.touches||!e.touches[0])return;
      var p=e.touches[0];move(p.clientX,p.clientY);
    },{capture:true,passive:true});
    row.addEventListener('touchend',function(){cancel();setTimeout(function(){triggered=false;},120);},{capture:true,passive:true});
    row.addEventListener('touchcancel',function(){cancel();triggered=false;},{capture:true,passive:true});
    row.addEventListener('pointerdown',function(e){
      if(e.pointerType==='touch')return;
      if(e.button!==undefined&&e.button!==0)return;
      start(e.clientX,e.clientY);
    },true);
    row.addEventListener('pointermove',function(e){if(e.pointerType!=='touch')move(e.clientX,e.clientY);},true);
    row.addEventListener('pointerup',function(){cancel();setTimeout(function(){triggered=false;},120);},true);
    row.addEventListener('pointercancel',cancel,true);
    row.addEventListener('contextmenu',function(e){e.preventDefault();e.stopPropagation();openMenu(e.clientX,e.clientY,e);},true);
    row.addEventListener('click',function(e){if(triggered){triggered=false;e.preventDefault();e.stopPropagation();}},true);
  };
  function refresh(){try{if(typeof renderMessages==='function')renderMessages();}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(refresh,80);},{once:true});
  else setTimeout(refresh,80);
})();

(function(){
  try{
    var m = window.state && window.state.activeModel;
    if(m && (m.id === 'kyro-1' || /gemini-2\.5-flash-lite|gemini-3\.6-flash/.test(String(m.rawId||'')))){
      m.rawId = 'gemini-3.5-flash-lite';
      m.desc = 'Fast · low latency · multimodal';
      try{ localStorage.setItem('kyroActiveModel', JSON.stringify(m)); }catch(_){}
    }
  }catch(_){}
})();

(function(){
  function wrap(){
    if(typeof window.kyroSetWorkMode==="function"&&!window.__kyroOneShotSetWrapped){
      var old=window.kyroSetWorkMode;window.__kyroOneShotSetWrapped=true;
      window.kyroSetWorkMode=function(n){try{if(typeof window.kyroExitImageMode==="function")window.kyroExitImageMode();}catch(_){}old(n);};
    }
    if(typeof window.kyroEnterImageMode==="function"&&!window.__kyroOneShotImageWrapped){
      var oldI=window.kyroEnterImageMode;window.__kyroOneShotImageWrapped=true;
      window.kyroEnterImageMode=function(){try{if(typeof window.kyroExitWorkMode==="function")window.kyroExitWorkMode();}catch(_){}oldI();};
    }
  }
  wrap();setTimeout(wrap,250);setTimeout(wrap,800);setTimeout(wrap,1800);
  document.addEventListener("kyro-one-shot-mode-cleared",function(){
    try{if(typeof window.kyroExitWorkMode==="function")window.kyroExitWorkMode();}catch(_){}
    try{if(typeof window.kyroExitImageMode==="function")window.kyroExitImageMode();}catch(_){}
  },true);
})();

(function(){
  /* Image Generation has been intentionally removed from the Plus/quick menu.
     Normal text chat and other existing features are untouched. */
  window.KYRO_IMAGE_GENERATION_DISABLED = true;
})();

(function(){
  "use strict";
  async function enforce(){
    try{
      var acc=await kyroLoadAccount();
      if(!acc||!acc.username)return;
      window.kyroAutoLocalLogin=true;
      window.kyroFirebaseUser=null;
      try{kyroMirrorAccountToLocalStorage(acc);}catch(_){ }
      try{if(window.state)state.userName=acc.username;}catch(_){ }
      var gate=document.getElementById("firebase-auth-gate"), app=document.getElementById("app");
      if(gate)gate.hidden=true;
      if(!window.kyroLoginApproved && typeof startAppBoot==="function")startAppBoot();
    }catch(_){ }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(enforce,30);},{once:true});
  else setTimeout(enforce,30);
})();

(function(){
  "use strict";
  /*
   * FINAL DEVICE LOGIN RULE
   * 1. First successful local account creation is remembered on this browser/device.
   * 2. Every later open/reload skips login and account creation.
   * 3. The normal KYRO rotating/logo splash is shown on every reopen.
   * 4. Login returns only after the browser/site data is cleared or the app is
   *    actually removed from the device (for a packaged app).
   */
  var KEY="kyroLocalAccountV4";
  var NAME="kyroUserName";
  var REM="kyroRememberedLogin";

  function readSaved(){
    try{
      var raw=localStorage.getItem(KEY)||localStorage.getItem("kyroLocalAccountV3");
      if(raw){
        var a=JSON.parse(raw);
        if(a && a.username) return a;
      }
    }catch(e){}
    return null;
  }

  function markSaved(a){
    if(!a || !a.username) return;
    try{
      localStorage.setItem(KEY,JSON.stringify(a));
      localStorage.setItem("kyroLocalAccountV3",JSON.stringify(a));
      localStorage.setItem(NAME,a.username);
      localStorage.setItem(REM,"1");
      localStorage.removeItem("kyroExplicitLogout");
    }catch(e){}
  }

  function hasSaved(){
    var a=readSaved();
    return !!(a && a.username);
  }

  function applySaved(a){
    if(!a) return false;
    markSaved(a);
    window.kyroAutoLocalLogin=true;
    window.kyroFirebaseUser=null;
    try{
      if(window.state) window.state.userName=a.username;
      var g=document.getElementById("greeting-title");
      if(g) g.textContent="Hello, "+a.username;
    }catch(e){}
    document.body.classList.add("kyro-persistent-signed-in");
    return true;
  }

  function bootSaved(){
    var a=readSaved();
    if(!a) return false;
    applySaved(a);

    /* Reuse the exact existing KYRO splash/boot animation. */
    try{
      if(typeof window.startAppBoot==="function"){
        window.startAppBoot();
        return true;
      }
    }catch(e){}
    return true;
  }

  /* Capture the account immediately when createLocalAccount succeeds,
     even if another older handler later changes the login UI. */
  function hookCreate(){
    if(typeof window.createLocalAccount!=="function" || window.__kyroCreateHooked) return;
    window.__kyroCreateHooked=true;
    var old=window.createLocalAccount;
    window.createLocalAccount=async function(username,password){
      var a=await old.apply(this,arguments);
      if(a && a.username) applySaved(a);
      return a;
    };
  }

  function hideGate(){
    if(!hasSaved()) return;
    var a=readSaved();
    applySaved(a);
    var gate=document.getElementById("firebase-auth-gate");
    if(gate) gate.hidden=true;
    try{
      if(typeof window.hideAuthGateIfSaved==="function") window.hideAuthGateIfSaved();
    }catch(e){}
  }

  function early(){
    /* Synchronous localStorage restore happens before Firebase can show login. */
    var a=readSaved();
    if(a){
      applySaved(a);
      var gate=document.getElementById("firebase-auth-gate");
      if(gate) gate.hidden=true;
    }
    hookCreate();
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",function(){
      early();
      setTimeout(hookCreate,50);
      setTimeout(hideGate,100);
      setTimeout(hideGate,350);
      setTimeout(function(){
        if(hasSaved() && !window.kyroLoginApproved) bootSaved();
      },120);
    },{once:true});
  }else{
    early();
    setTimeout(hookCreate,50);
    setTimeout(hideGate,100);
    setTimeout(function(){
      if(hasSaved() && !window.kyroLoginApproved) bootSaved();
    },120);
  }

  window.addEventListener("pageshow",function(){
    setTimeout(function(){
      if(hasSaved() && !window.kyroLoginApproved) bootSaved();
      else hideGate();
    },30);
  });

  /* Keep the account remembered if any existing KYRO code writes it later. */
  window.addEventListener("storage",function(e){
    if(e.key===KEY || e.key==="kyroLocalAccountV3") hideGate();
  });
})();

(function(){
  'use strict';
  function install(){
    try{
      var oldRender=window.messageEl;
      if(typeof oldRender!=='function' || oldRender.__kyroUserActionsRepair)return;

      function repaired(m){
        var row=oldRender(m);
        if(!row || m.role!=='user')return row;

        /* If a later renderer omitted user actions, add them directly. */
        var meta=row.querySelector('.msg-meta');
        if(!meta)return row;
        var actions=meta.querySelector('.msg-actions');
        if(!actions){
          actions=document.createElement('div');
          actions.className='msg-actions';
          actions.innerHTML=
            '<button type="button" data-act="edit" title="Edit message" aria-label="Edit message"><svg class="icon icon-sm"><use href="#i-edit"></use></svg></button>'+
            '<button type="button" data-act="copy" title="Copy message" aria-label="Copy message"><svg class="icon icon-sm"><use href="#i-copy"></use></svg></button>';
          meta.appendChild(actions);
        }

        actions.querySelectorAll('[data-act]').forEach(function(btn){
          if(btn.__kyroBound)return;
          btn.__kyroBound=true;
          btn.addEventListener('click',function(e){
            e.preventDefault(); e.stopPropagation();
            var act=btn.getAttribute('data-act');
            if(act==='copy'){
              try{copyText(m.text);}catch(_){}
            }else if(act==='edit'){
              try{editMessage(m);}catch(_){}
            }
          });
        });
        return row;
      }
      repaired.__kyroUserActionsRepair=true;
      window.messageEl=repaired;
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
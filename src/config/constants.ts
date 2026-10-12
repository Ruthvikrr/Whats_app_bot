export const COMPANY_NAME = 'Triuss Solutions';

export const WELCOME_MESSAGE = `👋 Hi! Welcome to ${COMPANY_NAME}.

Thanks for reaching out.

We help businesses build AI-powered digital solutions.

Please choose a service below to learn more.`;

export const SERVICE_IDS = {
  WHATSAPP_AGENTS: 'whatsapp_agents',
  WEBSITES: 'websites',
  AI_PHOTO_SHOOTS: 'ai_photo_shoots',
  VOICE_AGENTS: 'voice_agents',
  DEMO_HUB: 'demo_hub',
} as const;

export type ServiceId = (typeof SERVICE_IDS)[keyof typeof SERVICE_IDS];

export interface ServiceMenuItem {
  id: ServiceId;
  title: string;
  description: string;
}

export const SERVICE_MENU_ITEMS: ServiceMenuItem[] = [
  {
    id: SERVICE_IDS.WHATSAPP_AGENTS,
    title: '🤖 WhatsApp Agents',
    description: 'AI customer support & automation',
  },
  {
    id: SERVICE_IDS.WEBSITES,
    title: '🌐 Modern Websites',
    description: 'High-speed business web solutions',
  },
  {
    id: SERVICE_IDS.AI_PHOTO_SHOOTS,
    title: '📸 AI Photo Shoots',
    description: 'Studio product visuals without shoots',
  },
  {
    id: SERVICE_IDS.VOICE_AGENTS,
    title: '🎙️ AI Voice Agents',
    description: 'Automated voice calls & enquiries',
  },
  {
    id: SERVICE_IDS.DEMO_HUB,
    title: '🚀 Custom WhatsApp Bot',
    description: 'Try custom bot for your business',
  },
];

export const SERVICE_DETAILS: Record<ServiceId, string> = {
  [SERVICE_IDS.WHATSAPP_AGENTS]: `🤖 *Official WhatsApp Cloud AI Agents & Automation*

Transform your WhatsApp into an automated 24/7 sales, booking, and customer support machine built on Meta's Official Cloud API.

✨ *What We Build for Your Business:*
• *24/7 Instant AI Responses:* Resolve FAQs, pricing questions, business hours, and policies in under 2 seconds.
• *Interactive Catalogs & Instant UPI Checkout:* Showcase products and services with clickable menus and direct payment links.
• *Automated Appointment Booking:* Sync directly with Google Calendar, CRM, or booking software with instant reminders.
• *Lead Qualification & CRM Sync:* Capture customer names, phone numbers, and requirements automatically.
• *Broadcast Marketing:* Send verified promotional campaigns, festive offers, and re-engagement updates with 98% open rates.
• *Smart Human Escalation:* Seamless handoff to your live staff whenever complex questions arise.

📈 *Proven Business Impact:*
⚡ <2-second response time across 1,000+ simultaneous chats
🚀 3x higher lead conversion compared to website forms
💰 70% reduction in repetitive customer support workload

━━━━━━━━━━━━━━━━━━━━━━━━━━
👉 *Would you like to speak to our real customer support specialist or get a free custom demo designed for your business?*

💬 *Reply "YES" to connect with our team right away!*`,

  [SERVICE_IDS.WEBSITES]: `🌐 *Modern High-Speed Websites & Web Apps*

We engineer ultra-fast, premium digital experiences that establish instant brand authority and turn casual visitors into paying clients.

✨ *What We Build:*
• *High-Converting Landing Pages:* Laser-focused design optimized for lead capture, marketing campaigns, and paid ad traffic.
• *Corporate & Business Portals:* Sleek, responsive company websites with modern typography, smooth animations, and easy CMS updates.
• *D2C & E-Commerce Stores:* Modern storefronts with lightning-fast checkout, payment gateways (Razorpay, Stripe), and inventory tracking.
• *Custom Web Applications & SaaS:* Scalable customer portals, admin dashboards, and bespoke workflow tools built on Next.js, Node.js & React.
• *SEO & Speed Optimization:* 95+ Google PageSpeed score, mobile-first responsiveness, and structured schema for top Google rankings.

📈 *Proven Business Impact:*
⚡ Sub-second load times that drastically reduce visitor drop-off
📱 Pixel-perfect visual aesthetics across mobile, tablet, and desktop
🔒 Enterprise-grade security with SSL certificates and automated backups

━━━━━━━━━━━━━━━━━━━━━━━━━━
👉 *Would you like to speak to our real customer support specialist or get a custom quote for your website project?*

💬 *Reply "YES" to connect with our team right away!*`,

  [SERVICE_IDS.AI_PHOTO_SHOOTS]: `📸 *Studio-Grade AI Product Photo Shoots*

Skip expensive studio rentals, photographer fees, and weeks of scheduling. We generate photorealistic, magazine-quality product visuals using state-of-the-art Generative AI.

✨ *What We Create for Your Brand:*
• *Hyper-Realistic Product Photography:* Place your jewelry, cosmetics, apparel, or packaged goods in luxury real-world scenes.
• *Virtual Model Shoots:* Showcase your products on diverse, photorealistic AI fashion models in any setting or outfit.
• *E-Commerce Marketplace Ready:* Clean, high-resolution white-background catalog imagery strictly compliant with Amazon, Flipkart & Myntra standards.
• *Social Media Ad Creatives:* High-impact Instagram/Facebook creative assets tailored for high click-through rates.
• *Rapid Iterations:* Test 50+ background aesthetics, lighting variations, and themes in 24–48 hours—not weeks.

📈 *Proven Business Impact:*
💸 Save up to 85% compared to traditional physical photo shoots
⏱️ Turnaround in 24–48 hours instead of 3–4 weeks
🎨 Unlimited creative freedom without shipping physical inventory

━━━━━━━━━━━━━━━━━━━━━━━━━━
👉 *Would you like to speak to our real customer support specialist to view our portfolio or discuss your brand?*

💬 *Reply "YES" to connect with our team right away!*`,

  [SERVICE_IDS.VOICE_AGENTS]: `🎙️ *Intelligent AI Voice Agents & Calling*

Never miss another customer phone call. Our human-like AI voice assistants handle incoming customer calls and conduct smart outbound follow-ups with natural, fluent speech.

✨ *Key Capabilities:*
• *24/7 Inbound Call Answering:* Answers calls within 1 ring with natural Indian English, Hindi, or multilingual accents.
• *Smart Appointment Scheduling:* Books consultations, reservations, and appointments directly into your calendar during the live call.
• *Instant Outbound Lead Qualification:* Calls back website form leads within 60 seconds while customer interest is highest.
• *Automated Reminders & Follow-Ups:* Dispatches automated payment reminders, booking confirmations, and renewal alerts.
• *Real-Time CRM & Call Summaries:* Automatically transcribes every call, summarizes action items, and syncs them to your database.

📈 *Proven Business Impact:*
📞 100% call answer rate—zero missed customer inquiries or sales leads
⚡ <800ms voice response latency for natural, fluent conversations
💰 Scales from 10 to 10,000 calls simultaneously with zero staff additions

━━━━━━━━━━━━━━━━━━━━━━━━━━
👉 *Would you like to speak to our real customer support specialist or listen to a live sample voice call demo?*

💬 *Reply "YES" to connect with our team right away!*`,

  [SERVICE_IDS.DEMO_HUB]: `🚀 *Custom WhatsApp Bot for Your Business*

Select your industry below to experience how custom WhatsApp automation works live for your brand:`,
};

// 8 Industry Demo Categories
export const DEMO_IDS = {
  // Main Categories
  JEWELRY: 'demo_jewelry',
  SALON: 'demo_salon',
  REAL_ESTATE: 'demo_realestate',
  CLINIC: 'demo_clinic',
  GYM: 'demo_gym',
  RESTAURANT: 'demo_restaurant',
  AUTO: 'demo_auto',
  EDTECH: 'demo_edtech',
  EXIT: 'demo_exit',

  // 1. Jewelry Services
  JW_CHAIN: 'jw_chain',
  JW_PENDANT: 'jw_pendant',
  JW_BANGLES: 'jw_bangles',
  JW_RING: 'jw_ring',
  JW_VIDEO_CALL: 'jw_video_call',

  // 2. Salon Services
  SALON_HAIRSPA: 'salon_hairspa',
  SALON_FACIAL: 'salon_facial',
  SALON_BRIDAL: 'salon_bridal',
  SALON_BOTOX: 'salon_botox',
  SALON_SLOT_11AM: 'salon_slot_11am',
  SALON_SLOT_4PM: 'salon_slot_4pm',

  // 3. Real Estate Services
  RE_2BHK: 're_2bhk',
  RE_3BHK: 're_3bhk',
  RE_VILLA: 're_villa',
  RE_BROCHURE: 're_brochure',
  RE_VISIT: 're_visit',

  // 4. Clinic Services
  CL_DOCTOR: 'cl_doctor',
  CL_CHECKUP: 'cl_checkup',
  CL_DENTAL: 'cl_dental',
  CL_BLOOD: 'cl_blood',
  CL_REFILL: 'cl_refill',

  // 5. Gym Services
  GYM_TRIAL: 'gym_trial',
  GYM_3MONTH: 'gym_3month',
  GYM_PT: 'gym_pt',
  GYM_DIET: 'gym_diet',
  GYM_CROSSFIT: 'gym_crossfit',

  // 6. Restaurant Services
  REST_MENU: 'rest_menu',
  REST_TABLE: 'rest_table',
  REST_ORDER: 'rest_order',
  REST_PARTY: 'rest_party',
  REST_SPECIAL: 'rest_special',

  // 7. Auto Services
  AUTO_SERVICE: 'auto_service',
  AUTO_DETAIL: 'auto_detail',
  AUTO_DRIVE: 'auto_drive',
  AUTO_VALUATION: 'auto_valuation',
  AUTO_INSURANCE: 'auto_insurance',

  // 8. EdTech Services
  ED_DEMO: 'ed_demo',
  ED_FEES: 'ed_fees',
  ED_COUNSEL: 'ed_counsel',
  ED_TIMINGS: 'ed_timings',
  ED_PAPERS: 'ed_papers',
} as const;

// 8 Industry Menu List (Under 24 chars title for Meta Cloud API)
export const DEMO_MENU_ITEMS = [
  {
    id: DEMO_IDS.JEWELRY,
    title: '💎 Jewelry & D2C Store',
    description: 'Product enquiry & UPI payment',
  },
  {
    id: DEMO_IDS.SALON,
    title: '💇 Salon & Aesthetics',
    description: 'Service & slot booking system',
  },
  {
    id: DEMO_IDS.REAL_ESTATE,
    title: '🏢 Real Estate Agency',
    description: '2BHK/3BHK filter & PDF brochure',
  },
  {
    id: DEMO_IDS.CLINIC,
    title: '🩺 Healthcare & Clinic',
    description: 'Doctor consultation & tests',
  },
  {
    id: DEMO_IDS.GYM,
    title: '🏋️ Gym & Fitness Center',
    description: 'Free trial pass & memberships',
  },
  {
    id: DEMO_IDS.RESTAURANT,
    title: '🍽️ Restaurant & Cafe',
    description: 'Digital menu & table bookings',
  },
  {
    id: DEMO_IDS.AUTO,
    title: '🚗 Car Sales & Service',
    description: 'Service packages & test drives',
  },
  {
    id: DEMO_IDS.EDTECH,
    title: '🎓 Coaching & EdTech',
    description: 'Demo classes & fee breakdown',
  },
  {
    id: DEMO_IDS.EXIT,
    title: '🔙 Return to Agency Menu',
    description: 'Exit live demo simulation',
  },
];

export const MENU_COMMANDS = ['menu', 'hi', 'hello', 'hey', 'start'];
export const DEMO_COMMANDS = ['demo', 'demos', 'showcase', 'test', 'build'];

export const INVALID_SELECTION_MESSAGE = `I can help you explore our services.

Please choose one of the options from the menu below.`;

export const MENU_PROMPT_BODY = 'What service are you interested in?';
export const MENU_BUTTON_TEXT = 'View Services';
export const MENU_SECTION_TITLE = 'Our Services';

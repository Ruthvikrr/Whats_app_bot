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
};
export const SERVICE_MENU_ITEMS = [
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
export const SERVICE_DETAILS = {
    [SERVICE_IDS.WHATSAPP_AGENTS]: `🤖 *WhatsApp AI Agents*

We build official WhatsApp Cloud AI agents that automate customer conversations, FAQs, lead qualification, support, and orders 24/7.

Reply to this message if you'd like to build an agent for your business.`,
    [SERVICE_IDS.WEBSITES]: `🌐 *Modern Websites & Web Apps*

We build modern business websites, luxury landing pages, portfolios, e-commerce stores, and custom web applications.

Reply to this message if you'd like to build a website.`,
    [SERVICE_IDS.AI_PHOTO_SHOOTS]: `📸 *AI Photo Shoots*

We create high-end AI product and promotional visuals for brands without requiring an expensive physical photo shoot.

Reply to this message if you'd like to book an AI photo shoot.`,
    [SERVICE_IDS.VOICE_AGENTS]: `🎙️ *AI Voice Agents*

We build smart AI voice calling agents that can handle incoming customer enquiries, outbound lead qualification, and bookings.

Reply to this message if you'd like to explore voice agents.`,
    [SERVICE_IDS.DEMO_HUB]: `🚀 *Custom WhatsApp Bot for Your Business*

Select your industry below to see how our WhatsApp automation works live:`,
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
};
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

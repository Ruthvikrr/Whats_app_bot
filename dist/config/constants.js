export const COMPANY_NAME = 'Triuss Solutions';
export const WELCOME_MESSAGE = `👋 Hi there! Welcome to ${COMPANY_NAME}.

We build modern websites, smart WhatsApp automation, and AI tools to help your business grow! 🚀

Please choose a service below to explore or view live examples:`;
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
    [SERVICE_IDS.WHATSAPP_AGENTS]: `🤖 *WhatsApp AI Agents & Automation*

Hey! Turn your WhatsApp into a 24/7 assistant that chats with customers, answers FAQs, and closes sales instantly. ⚡

✨ *What we set up for you:*
• *Instant 24/7 Replies:* Answer customer questions & FAQs in under 2 seconds.
• *Product Catalogs & UPI:* Showcase products with direct checkout links.
• *Automated Bookings:* Schedule meetings, appointments, and test drives effortlessly.
• *Smart Human Handoff:* Connect seamlessly to your real team anytime.

📈 *The result:* 3x faster lead response, higher conversions, and zero repetitive typing!

👉 Want a free live demo customized for your business?
*Reply "YES"* to chat with our team, or reply *MENU* anytime!`,
    [SERVICE_IDS.WEBSITES]: `🌐 *Modern High-Speed Websites & Web Apps*

Hey! We design and develop lightning-fast, high-converting websites and custom web applications tailored for your business. 🚀

🌟 *Check out sample websites we built for our clients:*
• 👤 *Personal Portfolio:* https://ruthvikrr.in
• 🎯 *AIM Model:* https://aimmodel.in
• 🏛️ *YGR Function Hall:* https://ygrfunctionhall.in
• 🌿 *Thanks Earth:* https://thanksearth.in
• 🔬 *Research Visions:* https://researchvisions.com
...and many more bespoke portals!

⚡ *What we deliver:*
• Ultra-fast load times (<1s) & 100% mobile-friendly
• Modern UI/UX, SEO optimized for Google rankings
• Direct WhatsApp chat integration & secure payments

👉 Want a custom website designed for your brand?
*Reply "YES"* to get a quote, or reply *MENU* anytime!`,
    [SERVICE_IDS.AI_PHOTO_SHOOTS]: `📸 *Studio-Grade AI Product Photo Shoots*

Hey! Skip expensive studio rentals, photographers, and long delays. We create stunning, photorealistic product imagery using AI. ✨

✨ *What we create for your brand:*
• *Luxury Scenes:* Place your jewelry, cosmetics, or apparel in premium real-world settings.
• *AI Fashion Models:* Showcase outfits and accessories on diverse digital models.
• *Marketplace Ready:* High-resolution visuals for Amazon, Flipkart, and Instagram.

💰 Save up to 80% on shoot costs and get your visuals delivered in 24–48 hours!

👉 Want to see sample photo shoot styles for your products?
*Reply "YES"* to connect with us, or reply *MENU* anytime!`,
    [SERVICE_IDS.VOICE_AGENTS]: `🎙️ *Smart AI Voice Agents & Calling*

Hey! Never miss another customer call. Our AI voice assistants answer incoming calls 24/7 with natural, fluent speech. 📞

✨ *What our voice agents can do:*
• *Instant Call Answering:* Answers in 1 ring with natural accents.
• *Bookings & Reservations:* Schedules appointments directly to your calendar.
• *Fast Lead Callback:* Calls new website leads within 60 seconds while interest is highest.
• *Call Summaries:* Automatically logs transcriptions and key action items.

👉 Want to listen to a live sample call?
*Reply "YES"* to chat with us, or reply *MENU* anytime!`,
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
    ACCESSORIES: 'demo_accessories',
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
    // 9. Bike & Car Accessories Store (E-commerce)
    ACC_MENU_BIKES: 'acc_menu_bikes',
    ACC_MENU_BROWSE: 'acc_menu_browse',
    ACC_MENU_OFFERS: 'acc_menu_offers',
    // Bike Brands
    BIKE_BRAND_SUZUKI: 'bike_brand_suzuki',
    BIKE_BRAND_ROYALENFIELD: 'bike_brand_royalenfield',
    BIKE_BRAND_YAMAHA: 'bike_brand_yamaha',
    BIKE_BRAND_KTM: 'bike_brand_ktm',
    BIKE_BRAND_HERO: 'bike_brand_hero',
    BIKE_BRAND_HONDA: 'bike_brand_honda',
    BIKE_BRAND_KAWASAKI: 'bike_brand_kawasaki',
    BIKE_BRAND_BAJAJ_TVS: 'bike_brand_bajaj_tvs',
    // Bike Models
    BM_SUZUKI_VSTROM250: 'bm_suzuki_vstrom250',
    BM_SUZUKI_GIXXER: 'bm_suzuki_gixxer',
    BM_SUZUKI_HAYABUSA: 'bm_suzuki_hayabusa',
    BM_SUZUKI_ACCESS: 'bm_suzuki_access',
    BM_RE_HIMALAYAN: 'bm_re_himalayan',
    BM_RE_CLASSIC: 'bm_re_classic',
    BM_RE_HUNTER: 'bm_re_hunter',
    BM_RE_GT650: 'bm_re_gt650',
    BM_YAMAHA_R15: 'bm_yamaha_r15',
    BM_YAMAHA_MT15: 'bm_yamaha_mt15',
    BM_YAMAHA_AEROX: 'bm_yamaha_aerox',
    BM_KTM_DUKE: 'bm_ktm_duke',
    BM_KTM_ADV: 'bm_ktm_adv',
    BM_HERO_XPULSE: 'bm_hero_xpulse',
    BM_HERO_KARIZMA: 'bm_hero_karizma',
    ACC_HELMETS: 'acc_helmets',
    ACC_DASHCAM: 'acc_dashcam',
    ACC_LIGHTS: 'acc_lights',
    ACC_AUDIO: 'acc_audio',
    ACC_EXHAUST: 'acc_exhaust',
    ACC_STYLING: 'acc_styling',
    ACC_BEST_SELLERS: 'acc_bestsellers',
    ACC_FINDER: 'acc_finder',
    // Specific Accessory Products
    ACC_P_AXOR: 'acc_p_axor',
    ACC_P_RYNOX: 'acc_p_rynox',
    ACC_P_GLOVES: 'acc_p_gloves',
    ACC_P_MT: 'acc_p_mt',
    ACC_P_70MAI: 'acc_p_70mai',
    ACC_P_QUBO: 'acc_p_qubo',
    ACC_P_GPS: 'acc_p_gps',
    ACC_P_CARPLAY: 'acc_p_carplay',
    ACC_P_HJG: 'acc_p_hjg',
    ACC_P_NIGHTEYE: 'acc_p_nighteye',
    ACC_P_MADDOG: 'acc_p_maddog',
    ACC_P_SONY: 'acc_p_sony',
    ACC_P_JBL: 'acc_p_jbl',
    ACC_P_BLAUPUNKT: 'acc_p_blaupunkt',
    ACC_P_AKRA: 'acc_p_akra',
    ACC_P_BMC: 'acc_p_bmc',
    ACC_P_POWERT: 'acc_p_powert',
    ACC_P_7DMATS: 'acc_p_7dmats',
    ACC_P_CRASHGUARD: 'acc_p_crashguard',
    ACC_P_SPOILER: 'acc_p_spoiler',
};
// Industry Menu List (Strictly under 24 chars title and <= 10 items for WhatsApp API)
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
        id: DEMO_IDS.ACCESSORIES,
        title: '🏍️ Auto & Bike Store',
        description: 'Helmets, cams, audio, lights & gear',
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

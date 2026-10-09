import { DEMO_COMMANDS, DEMO_IDS, DEMO_MENU_ITEMS, INVALID_SELECTION_MESSAGE, MENU_BUTTON_TEXT, MENU_COMMANDS, MENU_PROMPT_BODY, MENU_SECTION_TITLE, SERVICE_DETAILS, SERVICE_IDS, SERVICE_MENU_ITEMS, WELCOME_MESSAGE, } from '../config/constants.js';
import { idempotencyService } from '../utils/idempotency.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { dbService } from '../db/database.js';
import { whatsAppService } from './whatsapp.service.js';
export class BotService {
    whatsapp;
    constructor(whatsapp = whatsAppService) {
        this.whatsapp = whatsapp;
    }
    /**
     * Main entry point for processing an incoming WhatsApp message.
     */
    async handleIncomingMessage(message) {
        const messageId = message.id;
        const sender = message.from;
        // Idempotency check: ignore if already processed
        if (idempotencyService.isDuplicate(messageId)) {
            logger.info({ messageId, sender }, 'Duplicate message detected, skipping processing');
            return;
        }
        // Mark as processed
        idempotencyService.markProcessed(messageId);
        // Record lead interaction and log inbound message to SQLite
        try {
            dbService.recordLeadInteraction(sender);
            dbService.logMessage(messageId, sender, 'inbound', message.type, message.text?.body || message.interactive?.list_reply?.title || '');
        }
        catch (dbErr) {
            logger.warn({ error: dbErr }, 'Non-fatal error logging lead or message to database');
        }
        logger.info({
            messageId,
            sender,
            type: message.type,
        }, 'Processing incoming WhatsApp message');
        try {
            if (message.type === 'interactive') {
                await this.handleInteractiveMessage(message);
                return;
            }
            if (message.type === 'text') {
                await this.handleTextMessage(message);
                return;
            }
            // Any unsupported message type (image, audio, document, location, etc.)
            logger.info({ messageId, sender, type: message.type }, 'Unsupported message type received');
            await this.handleUnsupportedMessage(sender);
        }
        catch (err) {
            logger.error({
                messageId,
                sender,
                error: err instanceof Error ? err.message : String(err),
            }, 'Error occurred while processing message flow');
            throw err;
        }
    }
    /**
     * Handles interactive list selections and replies.
     */
    async handleInteractiveMessage(message) {
        const sender = message.from;
        const selectedId = message.interactive?.list_reply?.id || message.interactive?.button_reply?.id;
        if (!selectedId) {
            logger.warn({ sender }, 'Interactive message received without selectable ID');
            await this.handleUnsupportedMessage(sender);
            return;
        }
        logger.info({ sender, selectedId }, 'User selected interactive menu option');
        // 1. Check for Demo Hub Trigger
        if (selectedId === SERVICE_IDS.DEMO_HUB) {
            dbService.recordLeadInteraction(sender, { activeDemo: 'hub', status: 'demo_tested' });
            await this.sendDemoHubMenu(sender);
            return;
        }
        // 2. Check for Specific Industry Demo Entry Points
        if (selectedId === DEMO_IDS.JEWELRY) {
            await this.handleJewelryDemo(sender);
            return;
        }
        if (selectedId === DEMO_IDS.SALON) {
            await this.handleSalonDemo(sender);
            return;
        }
        if (selectedId === DEMO_IDS.REAL_ESTATE) {
            await this.handleRealEstateDemo(sender);
            return;
        }
        if (selectedId === DEMO_IDS.CLINIC) {
            await this.handleClinicDemo(sender);
            return;
        }
        if (selectedId === DEMO_IDS.GYM) {
            await this.handleGymDemo(sender);
            return;
        }
        if (selectedId === DEMO_IDS.RESTAURANT) {
            await this.handleRestaurantDemo(sender);
            return;
        }
        if (selectedId === DEMO_IDS.AUTO) {
            await this.handleAutoDemo(sender);
            return;
        }
        if (selectedId === DEMO_IDS.EDTECH) {
            await this.handleEdTechDemo(sender);
            return;
        }
        if (selectedId === DEMO_IDS.EXIT) {
            dbService.recordLeadInteraction(sender, { activeDemo: null });
            await this.sendTrackedText(sender, '👋 Exited demo mode. Welcome back to Triuss Solutions agency menu!');
            await this.sendServiceMenu(sender);
            return;
        }
        // 3. Handle Detailed Services Under Each Industry Demo
        if (await this.handleIndustryServiceDetail(sender, selectedId)) {
            return;
        }
        // 4. Check if the selected ID matches one of our primary Triuss services
        if (this.isValidServiceId(selectedId)) {
            dbService.recordLeadInteraction(sender, { interestedService: selectedId });
            const serviceDescription = SERVICE_DETAILS[selectedId];
            await this.sendTrackedText(sender, serviceDescription);
            return;
        }
        // Unsupported or unknown selection
        logger.warn({ sender, selectedId }, 'Unrecognized interactive selection ID');
        await this.handleUnsupportedMessage(sender);
    }
    /**
     * Handles individual service details within each demo industry.
     */
    async handleIndustryServiceDetail(sender, selectedId) {
        // 1. Jewelry Options
        if (selectedId === DEMO_IDS.JW_CHAIN || selectedId === 'jw_chain') {
            await this.handleProductEnquiry(sender, 'silver chain', false);
            return true;
        }
        if (selectedId === DEMO_IDS.JW_PENDANT || selectedId === 'jw_pendant') {
            await this.handleProductEnquiry(sender, 'pendant', false);
            return true;
        }
        if (selectedId === DEMO_IDS.JW_BANGLES) {
            await this.sendTrackedText(sender, `✨ *22K Antique Gold Bangles (Kada)*\n💰 Price: *₹4,899* (100% Hallmarked)\n\n🎁 Free Luxury Gift Box + Certificate of Authenticity.\n💳 *Instant UPI Checkout:* https://rzp.io/l/demo-gold-bangles\n\n_Type 'exit' to return to agency menu._`);
            return true;
        }
        if (selectedId === DEMO_IDS.JW_RING) {
            await this.sendTrackedText(sender, `💍 *Custom Solitaire Diamond Ring Design*\n\nSend us a reference image from Pinterest or Instagram! Our master artisans craft it in 5-7 business days.\n\nReply with your budget (e.g., ₹25,000) to receive 3D CAD renders.`);
            return true;
        }
        if (selectedId === DEMO_IDS.JW_VIDEO_CALL) {
            await this.sendTrackedText(sender, `📹 *Live WhatsApp Video Shopping*\n\nConnect 1-on-1 with our Bangalore jewelry stylist. See the sparkle and fit in real time!\n\nReply *"CALL NOW"* or choose a preferred time slot.`);
            return true;
        }
        // 2. Salon Options
        if (selectedId === DEMO_IDS.SALON_HAIRSPA || selectedId === 'salon_hairspa') {
            await this.sendSalonTimeSlots(sender, 'Luxury Hair Spa (₹1,499)');
            return true;
        }
        if (selectedId === DEMO_IDS.SALON_FACIAL || selectedId === 'salon_facial') {
            await this.sendSalonTimeSlots(sender, 'Hydra-Facial Glow (₹2,499)');
            return true;
        }
        if (selectedId === DEMO_IDS.SALON_BRIDAL) {
            await this.sendTrackedText(sender, `💄 *Royal Bridal Makeover Package*\n\nIncludes HD Makeup, Hair Styling, Draping & Pre-Bridal Skin Rituals.\n💰 Price: *₹14,999* onwards.\n\nReply *"BRIDAL TRIAL"* to book your look consultation.`);
            return true;
        }
        if (selectedId === DEMO_IDS.SALON_BOTOX) {
            await this.sendTrackedText(sender, `💇 *Keratin & Hair Botox Treatment*\n\nFrizz-free, mirror-shine hair lasting up to 5 months (Formaldehyde-free formula).\n💰 Price: *₹3,499* (All hair lengths).\n\nReply *"BOOK BOTOX"* to reserve your stylist.`);
            return true;
        }
        if (selectedId === DEMO_IDS.SALON_SLOT_11AM || selectedId === DEMO_IDS.SALON_SLOT_4PM || selectedId === 'slot_11am' || selectedId === 'slot_4pm') {
            const slotTime = selectedId.includes('11') ? 'Tomorrow at 11:00 AM' : 'Tomorrow at 04:00 PM';
            await this.sendTrackedText(sender, `🎉 *Appointment Confirmed!*\n\n📅 Slot: *${slotTime}*\n📍 Location: Indiranagar Flagship Studio, Bangalore\n💰 Payment: Pay at salon via Cash or UPI\n\n🔔 *(Live Demo: An instant SMS & WhatsApp alert was dispatched to the Salon Owner's phone).*`);
            return true;
        }
        // 3. Real Estate Options
        if (selectedId === DEMO_IDS.RE_2BHK || selectedId === 're_2bhk' || selectedId === DEMO_IDS.RE_3BHK || selectedId === 're_3bhk') {
            const is3Bhk = selectedId.includes('3bhk');
            const title = is3Bhk ? '3BHK Luxury Highrise' : '2BHK Premium Smart Home';
            const price = is3Bhk ? '₹1.85 Cr onwards' : '₹98 Lakhs onwards';
            const size = is3Bhk ? '1,850 sq.ft' : '1,220 sq.ft';
            await this.sendTrackedText(sender, `🏢 *Prestige Skyline Residences - Bangalore*\n\n✨ Unit: *${title}* (${size})\n📍 Location: Whitefield / ITPL Main Road\n💰 Pricing: *${price}*\n🏊 Amenities: Infinity Pool, Clubhouse, EV Charging.\n\n📄 *Download Brochure:* https://triuss.in/brochures/skyline-${is3Bhk ? '3bhk' : '2bhk'}.pdf\n\nReply *"VISIT"* to book a free VIP cab for site visit.`);
            return true;
        }
        if (selectedId === DEMO_IDS.RE_VILLA) {
            await this.sendTrackedText(sender, `🏡 *Sobha Meadow Luxury Sky Villa*\n\n✨ 4BHK Duplex Villa with Private Plunge Pool & Terrace Garden.\n📐 4,200 sq.ft | Location: Sarjapur Road, Bangalore\n💰 Price: *₹3.45 Cr*\n\nReply *"VILLA"* for floor plans and video walkthrough.`);
            return true;
        }
        if (selectedId === DEMO_IDS.RE_BROCHURE) {
            await this.sendTrackedText(sender, `📄 *Project Master Plan & Floorplans Delivered*\n\nDownload the complete 28-page high-res architectural PDF:\n👉 https://triuss.in/brochures/bangalore-skyline-masterplan.pdf`);
            return true;
        }
        if (selectedId === DEMO_IDS.RE_VISIT) {
            await this.sendTrackedText(sender, `🚗 *VIP Site Visit Scheduled!*\n\nOur chauffeur will pick you up from your doorstep in Bangalore this Saturday at 10:30 AM.\n\n(Live Demo: Lead details with buyer budget automatically added to Realtor CRM).`);
            return true;
        }
        // 4. Clinic Options
        if (selectedId === DEMO_IDS.CL_DOCTOR) {
            await this.sendTrackedText(sender, `👨‍⚕️ *Consult Senior Physician*\n\nDr. Arvind Menon, MBBS, MD (15+ Years Exp).\n🩺 Consultation Fee: *₹500*\nAvailable Today: 5:00 PM – 8:30 PM\n\nReply *"CONFIRM DR"* to lock your token number.`);
            return true;
        }
        if (selectedId === DEMO_IDS.CL_CHECKUP) {
            await this.sendTrackedText(sender, `🩸 *Full Body Executive Health Checkup*\n\nIncludes 72 Vital Tests (CBC, Liver, Kidney, Lipid, Thyroid, HbA1c & Vitamin D).\n💰 Special Price: *₹999* (Original ₹2,800).\n\nReply *"BOOK 999"* with your preferred morning slot.`);
            return true;
        }
        if (selectedId === DEMO_IDS.CL_DENTAL) {
            await this.sendTrackedText(sender, `🦷 *Advanced Ultrasonic Dental Scaling & Polish*\n\nPainless tartar removal + bright smile polishing.\n💰 Special Offer: *₹799*\n\nReply *"DENTAL"* to schedule with our specialist.`);
            return true;
        }
        if (selectedId === DEMO_IDS.CL_BLOOD) {
            await this.sendTrackedText(sender, `🧪 *Free Home Blood Sample Collection*\n\nOur certified phlebotomist visits your home at 7:00 AM tomorrow. Digital reports delivered directly on WhatsApp in 6 hours!\n\nReply with your home address to confirm.`);
            return true;
        }
        if (selectedId === DEMO_IDS.CL_REFILL) {
            await this.sendTrackedText(sender, `💊 *WhatsApp Medicine Refill*\n\nSimply take a photo of your doctor's prescription and send it here. We deliver medicines to your doorstep in 90 mins with flat 15% discount!`);
            return true;
        }
        // 5. Gym Options
        if (selectedId === DEMO_IDS.GYM_TRIAL) {
            await this.sendTrackedText(sender, `🎟️ *1-Day Free VIP Workout Pass Generated!*\n\nPass Code: *IRON-FREE-2026*\nIncludes full gym access, steam bath & body composition analysis.\n📍 Location: Cult/Iron Gym, Koramangala, Bangalore.\n\nShow this WhatsApp message at the reception counter!`);
            return true;
        }
        if (selectedId === DEMO_IDS.GYM_3MONTH) {
            await this.sendTrackedText(sender, `🥇 *3-Month Total Body Transformation Plan*\n\nIncludes unlimited gym access + certified trainer guidance + free gym bag & shaker.\n💰 Price: *₹4,999* (Zero Joining Fee).\n💳 *Pay via UPI:* https://rzp.io/l/demo-gym-3month`);
            return true;
        }
        if (selectedId === DEMO_IDS.GYM_PT) {
            await this.sendTrackedText(sender, `🏋️ *1-on-1 Celebrity Personal Trainer*\n\nPersonalized workouts tailored for fat loss or muscle hypertrophy with weekly progress tracking.\n\nReply *"TRAINER"* to get assigned to our Head Fitness Coach.`);
            return true;
        }
        if (selectedId === DEMO_IDS.GYM_DIET) {
            await this.sendTrackedText(sender, `🥗 *Custom Nutrition & Calorie Chart*\n\nTailored for Indian vegetarian & non-vegetarian diets with precise macro targets.\n\nReply with your goal: *"FAT LOSS"* or *"MUSCLE GAIN"* to receive your sample PDF.`);
            return true;
        }
        if (selectedId === DEMO_IDS.GYM_CROSSFIT) {
            await this.sendTrackedText(sender, `🧘 *CrossFit, HIIT & Yoga Group Batches*\n\nMorning batches: 6:30 AM & 7:30 AM | Evening: 6:30 PM & 7:30 PM.\n\nReply with your preferred timing to reserve your workout spot.`);
            return true;
        }
        // 6. Restaurant Options
        if (selectedId === DEMO_IDS.REST_MENU) {
            await this.sendTrackedText(sender, `📜 *Truffles & Bistro Digital WhatsApp Menu*\n\n1. Artisan Woodfired Pizza (₹449)\n2. Gourmet Truffle Burger (₹349)\n3. Creamy Alfredo Fettuccine (₹399)\n4. Belgian Chocolate Lava Cake (₹229)\n\n👉 Reply with item names or send *"ORDER"* to checkout!`);
            return true;
        }
        if (selectedId === DEMO_IDS.REST_TABLE) {
            await this.sendTrackedText(sender, `🍷 *Table Reserved for Tonight!*\n\nTable for 2 Guests @ 8:00 PM (Rooftop Seating).\n📍 Bistro 108, Indiranagar, Bangalore.\n\n(Live Demo: Restaurant host tablet instantly updated with reservation).`);
            return true;
        }
        if (selectedId === DEMO_IDS.REST_ORDER) {
            await this.sendTrackedText(sender, `🛵 *Direct WhatsApp Food Delivery*\n\nZero Swiggy/Zomato commission = flat 20% cheaper prices for you!\n\nSend your delivery address and item name to place order instantly.`);
            return true;
        }
        if (selectedId === DEMO_IDS.REST_PARTY) {
            await this.sendTrackedText(sender, `🎉 *Party & Corporate Catering*\n\nCatering packages starting at ₹499/person for 15 to 200 guests with live counters.\n\nReply *"CATERING"* with your expected guest count.`);
            return true;
        }
        if (selectedId === DEMO_IDS.REST_SPECIAL) {
            await this.sendTrackedText(sender, `⭐ *Chef's Special of the Day*\n\nSlow-cooked Smoked Butter Chicken with Garlic Herb Kulchas & Gulab Jamun.\n💰 Special Combo Price: *₹399*.\n💳 *Instant UPI Order:* https://rzp.io/l/demo-chef-special`);
            return true;
        }
        // 7. Auto / Car Service Options
        if (selectedId === DEMO_IDS.AUTO_SERVICE) {
            await this.sendTrackedText(sender, `🔧 *Comprehensive Periodic Car Service*\n\nEngine oil replacement (Synthetic), oil filter, air filter, 40-point safety checkup, wash & interior vacuum.\n💰 Price: *₹3,499* (All Hatchbacks & Sedans).\n\nReply *"BOOK SERVICE"* with your car registration number.`);
            return true;
        }
        if (selectedId === DEMO_IDS.AUTO_DETAIL) {
            await this.sendTrackedText(sender, `🏎️ *9H Ceramic Coating & Paint Protection*\n\nMirror-like high gloss paint finish with 3-year warranty against scratches and water spots.\n💰 Package: *₹9,999* onwards.\n\nReply *"CERAMIC"* to book slot.`);
            return true;
        }
        if (selectedId === DEMO_IDS.AUTO_DRIVE) {
            await this.sendTrackedText(sender, `🚙 *Doorstep VIP Test Drive Scheduled!*\n\nNew 2026 SUV brought directly to your home/office in Bangalore at your convenient time.\n\nReply with your pincode to confirm your test drive route.`);
            return true;
        }
        if (selectedId === DEMO_IDS.AUTO_VALUATION) {
            await this.sendTrackedText(sender, `💰 *Instant Used Car Price Valuation*\n\nReply with your Car Model, Year & Kilometers (e.g., *"2021 Swift ZXi, 28000 km"*). Our automated appraisal engine will calculate real-time market value in 10 seconds!`);
            return true;
        }
        if (selectedId === DEMO_IDS.AUTO_INSURANCE) {
            await this.sendTrackedText(sender, `📄 *Instant Car Insurance Renewal*\n\nZero-depreciation policies with up to 50% No-Claim Bonus (NCB) discount.\n\nSend a picture of your current policy to get 3 instant quotes.`);
            return true;
        }
        // 8. EdTech / Coaching Options
        if (selectedId === DEMO_IDS.ED_DEMO) {
            await this.sendTrackedText(sender, `🎓 *Free Live Interactive Demo Class*\n\nSubject: Advanced Data Science & AI with Python.\nLive Session: This Saturday at 6:00 PM on Zoom.\n\n👉 *Join Link:* https://triuss.in/live-demo/ai-batch-102`);
            return true;
        }
        if (selectedId === DEMO_IDS.ED_FEES) {
            await this.sendTrackedText(sender, `📚 *Course Curriculum & Fee Breakdown*\n\n• Duration: 12 Weeks (Live Weekend Batches)\n• 100% Placement Assistance with 40+ Hiring Partners\n• Total Fee: ₹18,000 (EMI starting at ₹2,999/month)\n\n📄 *Download Syllabus:* https://triuss.in/brochures/curriculum-2026.pdf`);
            return true;
        }
        if (selectedId === DEMO_IDS.ED_COUNSEL) {
            await this.sendTrackedText(sender, `📞 *1-on-1 Career Counselling Call*\n\nSpeak with our Senior Academic Advisor to evaluate your profile and target job roles.\n\nReply with your preferred call time (Morning or Evening).`);
            return true;
        }
        if (selectedId === DEMO_IDS.ED_TIMINGS) {
            await this.sendTrackedText(sender, `⏰ *Flexible Working Professional Batches*\n\n• Batch A: Saturdays & Sundays (10:00 AM – 1:00 PM)\n• Batch B: Tuesday & Thursday Evenings (8:00 PM – 10:00 PM)\n\nAll sessions recorded in HD with lifetime portal access.`);
            return true;
        }
        if (selectedId === DEMO_IDS.ED_PAPERS) {
            await this.sendTrackedText(sender, `📑 *Solved Sample Question Papers & Mock Tests*\n\nDownload the last 5 years' solved questions with step-by-step explanations:\n👉 https://triuss.in/study-material/sample-papers.pdf`);
            return true;
        }
        return false;
    }
    /**
     * Handles incoming text messages.
     */
    async handleTextMessage(message) {
        const sender = message.from;
        const textBody = message.text?.body?.trim() || '';
        const lowerText = textBody.toLowerCase();
        // 1. Check if user typed "demo", "build", or showcase commands
        if (DEMO_COMMANDS.includes(lowerText)) {
            dbService.recordLeadInteraction(sender, { activeDemo: 'hub', status: 'demo_tested' });
            await this.sendDemoHubMenu(sender);
            return;
        }
        // 2. Check if user typed "exit" to leave demo mode
        if (lowerText === 'exit') {
            dbService.recordLeadInteraction(sender, { activeDemo: null });
            await this.sendTrackedText(sender, '👋 Exited demo mode. Welcome back to Triuss Solutions agency menu!');
            await this.sendServiceMenu(sender);
            return;
        }
        // 3. Check for product query / reel links (E-commerce / Jewelry simulation)
        const isReelLink = lowerText.includes('instagram.com') || lowerText.includes('reel') || lowerText.includes('fb.watch');
        const isProductQuery = isReelLink ||
            lowerText.includes('silver') ||
            lowerText.includes('chain') ||
            lowerText.includes('pendant') ||
            lowerText.includes('jw-01') ||
            lowerText.includes('jw-02') ||
            lowerText.startsWith('interested in') ||
            lowerText.includes('product');
        if (isProductQuery) {
            await this.handleProductEnquiry(sender, lowerText, isReelLink);
            return;
        }
        // 4. Check if the incoming text matches a menu / greeting command
        const isMenuCommand = MENU_COMMANDS.includes(lowerText);
        if (isMenuCommand) {
            logger.info({ sender, command: lowerText }, 'Menu command triggered');
            await this.sendWelcomeAndMenu(sender);
            return;
        }
        // Any text that is not a known command
        logger.info({ sender, text: lowerText }, 'Unrecognized text message received');
        await this.handleUnsupportedMessage(sender);
    }
    /**
     * Handles product enquiries (from Instagram links, website wa.me buttons, or catalog search).
     */
    async handleProductEnquiry(recipient, query, fromSocialMedia) {
        const searchTerms = fromSocialMedia ? 'silver chain' : query;
        const items = dbService.searchCatalog(searchTerms);
        const item = items.length > 0 ? items[0] : dbService.getAllCatalogItems()[0];
        if (!item) {
            await this.sendTrackedText(recipient, "Sorry, I couldn't find that item in our catalog. Type 'menu' to see our services.");
            return;
        }
        const introPrefix = fromSocialMedia
            ? `📱 *Instagram Reel Item Identified!*\n\n`
            : `💎 *Product Details:*\n\n`;
        const productCaption = `${introPrefix}` +
            `✨ *${item.name}*\n` +
            `🏷️ SKU: ${item.sku}\n` +
            `💰 Price: *₹${item.price.toLocaleString('en-IN')}* (Incl. of all taxes)\n\n` +
            `📝 *Description:*\n${item.description}\n\n` +
            `🚚 Fast Delivery across India (2-4 business days)\n` +
            `💳 *Instant WhatsApp Checkout (UPI):*\n${item.paymentUrl || 'https://rzp.io/l/demo-silver-chain'}\n\n` +
            `_Type 'exit' anytime to return to agency menu._`;
        if (item.imageUrl) {
            await this.sendTrackedImage(recipient, item.imageUrl, productCaption);
        }
        else {
            await this.sendTrackedText(recipient, productCaption);
        }
    }
    /**
     * Sends polite invalid message notification followed by the service menu.
     */
    async handleUnsupportedMessage(recipient) {
        await this.sendTrackedText(recipient, INVALID_SELECTION_MESSAGE);
        if (process.env.NODE_ENV !== 'test') {
            await new Promise((resolve) => setTimeout(resolve, 600));
        }
        await this.sendServiceMenu(recipient);
    }
    /**
     * Sends the welcome greeting (with professional services banner image) followed by the interactive service menu.
     */
    async sendWelcomeAndMenu(recipient) {
        const publicUrl = env.PUBLIC_APP_URL || 'https://crawling-pouncing-docile.ngrok-free.dev';
        const imageUrl = `${publicUrl}/public/triuss_services.jpg`;
        try {
            logger.info({ recipient, imageUrl }, 'Sending services banner image with welcome caption');
            await this.sendTrackedImage(recipient, imageUrl, WELCOME_MESSAGE);
            if (process.env.NODE_ENV !== 'test') {
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }
        }
        catch (imgErr) {
            logger.warn({ error: imgErr instanceof Error ? imgErr.message : String(imgErr) }, 'Could not send image banner, falling back to text welcome message');
            await this.sendTrackedText(recipient, WELCOME_MESSAGE);
            if (process.env.NODE_ENV !== 'test') {
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
        }
        await this.sendServiceMenu(recipient);
    }
    /**
     * Sends the interactive service menu list.
     */
    async sendServiceMenu(recipient) {
        const sections = [
            {
                title: MENU_SECTION_TITLE,
                rows: SERVICE_MENU_ITEMS.map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                })),
            },
        ];
        await this.sendTrackedInteractiveList(recipient, MENU_PROMPT_BODY, MENU_BUTTON_TEXT, sections);
    }
    /**
     * Sends the interactive Demo Hub menu featuring 8 industries.
     */
    async sendDemoHubMenu(recipient) {
        const sections = [
            {
                title: 'Choose Your Industry',
                rows: DEMO_MENU_ITEMS.map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                })),
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '🚀 *Custom WhatsApp Bot for Your Business*\n\nSelect your industry below to experience how custom WhatsApp bot automation works live for your brand:', 'Select Industry', sections);
    }
    /**
     * Demo Flow: 1. Jewelry & D2C Store
     */
    async handleJewelryDemo(recipient) {
        const sections = [
            {
                title: 'Jewelry Services',
                rows: [
                    { id: DEMO_IDS.JW_CHAIN, title: '🔗 Silver Cuban Chain', description: '₹1,499 • Italian design' },
                    { id: DEMO_IDS.JW_PENDANT, title: '💎 Solitaire Pendant', description: '₹2,299 • Rose gold finish' },
                    { id: DEMO_IDS.JW_BANGLES, title: '✨ Antique Gold Bangles', description: '₹4,899 • Hallmarked' },
                    { id: DEMO_IDS.JW_RING, title: '💍 Custom Ring Design', description: 'Send design & get 3D CAD' },
                    { id: DEMO_IDS.JW_VIDEO_CALL, title: '📹 Video Shopping Call', description: 'Live 1-on-1 styling call' },
                ],
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '💎 *Aura Jewels (Luxury Jewelry Demo)*\n\nExperience seamless product discovery & instant WhatsApp UPI checkout:', 'View Collection', sections);
    }
    /**
     * Demo Flow: 2. Salon & Aesthetic Clinic
     */
    async handleSalonDemo(recipient) {
        const sections = [
            {
                title: 'Salon Services',
                rows: [
                    { id: DEMO_IDS.SALON_HAIRSPA, title: '💆 Luxury Hair Spa', description: '₹1,499 • 60 mins • Deep care' },
                    { id: DEMO_IDS.SALON_FACIAL, title: '✨ Hydra-Facial Glow', description: '₹2,499 • 45 mins • Instant glow' },
                    { id: DEMO_IDS.SALON_BRIDAL, title: '💄 Royal Bridal Package', description: 'From ₹14,999 • HD Makeup' },
                    { id: DEMO_IDS.SALON_BOTOX, title: '💇 Keratin & Hair Botox', description: '₹3,499 • 5 months frizz-free' },
                    { id: DEMO_IDS.SALON_SLOT_11AM, title: '📅 Book Slot (Tomorrow)', description: 'Pick 11:00 AM or 4:00 PM' },
                ],
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '💇 *Glow & Shine Studio (Salon Demo)*\n\nPlease select the service you would like to explore or book:', 'Choose Treatment', sections);
    }
    /**
     * Demo Flow: 3. Real Estate Agency
     */
    async handleRealEstateDemo(recipient) {
        const sections = [
            {
                title: 'Available Residences',
                rows: [
                    { id: DEMO_IDS.RE_2BHK, title: '🏙️ 2BHK Smart Home', description: 'From ₹98 Lakhs • Whitefield' },
                    { id: DEMO_IDS.RE_3BHK, title: '🏰 3BHK Luxury Highrise', description: 'From ₹1.85 Cr • Whitefield' },
                    { id: DEMO_IDS.RE_VILLA, title: '🏡 4BHK Sky Villa', description: 'From ₹3.45 Cr • Private pool' },
                    { id: DEMO_IDS.RE_BROCHURE, title: '📄 Download Brochure', description: 'High-res master plan PDF' },
                    { id: DEMO_IDS.RE_VISIT, title: '🚗 Free Cab Site Visit', description: 'Weekend VIP doorstep pickup' },
                ],
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '🏢 *Prestige Skyline Residences (Real Estate Demo)*\n\nExplore Bangalore luxury properties with instant plans & bookings:', 'Select Residence', sections);
    }
    /**
     * Demo Flow: 4. Healthcare & Clinic
     */
    async handleClinicDemo(recipient) {
        const sections = [
            {
                title: 'Clinic Services',
                rows: [
                    { id: DEMO_IDS.CL_DOCTOR, title: '👨‍⚕️ Doctor Consultation', description: '₹500 • Senior Physician' },
                    { id: DEMO_IDS.CL_CHECKUP, title: '🩸 Full Body Checkup', description: '₹999 • 72 Vital health tests' },
                    { id: DEMO_IDS.CL_DENTAL, title: '🦷 Dental Scaling & Care', description: '₹799 • Ultrasonic cleaning' },
                    { id: DEMO_IDS.CL_BLOOD, title: '🧪 Home Blood Sample', description: 'Free home pickup at 7:00 AM' },
                    { id: DEMO_IDS.CL_REFILL, title: '💊 WhatsApp Rx Refill', description: 'Flat 15% off • 90 min delivery' },
                ],
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '🩺 *CareFirst Multi-Speciality Clinic (Healthcare Demo)*\n\nSelect a medical care service or appointment below:', 'View Medical Care', sections);
    }
    /**
     * Demo Flow: 5. Gym & Fitness Center
     */
    async handleGymDemo(recipient) {
        const sections = [
            {
                title: 'Fitness Plans',
                rows: [
                    { id: DEMO_IDS.GYM_TRIAL, title: '🎟️ 1-Day Free VIP Pass', description: 'Free gym, steam & analysis' },
                    { id: DEMO_IDS.GYM_3MONTH, title: '🥇 3-Month Plan (₹4,999)', description: 'Unlimited gym + bag + shaker' },
                    { id: DEMO_IDS.GYM_PT, title: '🏋️ 1-on-1 Personal Coach', description: 'Tailored fat loss / hypertrophy' },
                    { id: DEMO_IDS.GYM_DIET, title: '🥗 Custom Diet Chart', description: 'Indian vegetarian & non-veg' },
                    { id: DEMO_IDS.GYM_CROSSFIT, title: '🧘 CrossFit & Yoga Batch', description: 'Morning & evening group classes' },
                ],
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '🏋️ *IronPulse Fitness & Gym (Fitness Demo)*\n\nReady to transform? Choose a membership or trial pass below:', 'Explore Gym Plans', sections);
    }
    /**
     * Demo Flow: 6. Restaurant & Cafe
     */
    async handleRestaurantDemo(recipient) {
        const sections = [
            {
                title: 'Dining Options',
                rows: [
                    { id: DEMO_IDS.REST_MENU, title: '📜 Digital Food Menu', description: 'Woodfired pizza, burgers & desserts' },
                    { id: DEMO_IDS.REST_TABLE, title: '🍷 Reserve VIP Table', description: 'Tonight @ 8:00 PM • Rooftop' },
                    { id: DEMO_IDS.REST_ORDER, title: '🛵 Order Food Delivery', description: 'Direct food delivery at home' },
                    { id: DEMO_IDS.REST_PARTY, title: '🎉 Party & Catering', description: 'From ₹499/person • Live counters' },
                    { id: DEMO_IDS.REST_SPECIAL, title: '⭐ Chef\'s Daily Special', description: '₹399 • Smoked butter chicken combo' },
                ],
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '🍽️ *Bistro 108 Indiranagar (Restaurant Demo)*\n\nBrowse gourmet menu, reserve tables or order delivery with zero commissions:', 'View Dining Menu', sections);
    }
    /**
     * Demo Flow: 7. Car Sales & Auto Service
     */
    async handleAutoDemo(recipient) {
        const sections = [
            {
                title: 'Auto Care & Sales',
                rows: [
                    { id: DEMO_IDS.AUTO_SERVICE, title: '🔧 Periodic Car Service', description: '₹3,499 • 40-point safety check' },
                    { id: DEMO_IDS.AUTO_DETAIL, title: '🏎️ Ceramic Detailing', description: '₹9,999 • 9H glass finish' },
                    { id: DEMO_IDS.AUTO_DRIVE, title: '🚙 Doorstep Test Drive', description: 'Test drive 2026 SUV at home' },
                    { id: DEMO_IDS.AUTO_VALUATION, title: '💰 Free Car Valuation', description: 'Instant market appraisal' },
                    { id: DEMO_IDS.AUTO_INSURANCE, title: '📄 Car Insurance Renewal', description: 'Zero-dep policy • Up to 50% off' },
                ],
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '🚗 *SpeedCraft Motors & Service (Automotive Demo)*\n\nBook doorstep car servicing, test drives or instant valuations:', 'Select Auto Care', sections);
    }
    /**
     * Demo Flow: 8. Coaching & EdTech
     */
    async handleEdTechDemo(recipient) {
        const sections = [
            {
                title: 'Courses & Admissions',
                rows: [
                    { id: DEMO_IDS.ED_DEMO, title: '🎓 Free Live Demo Class', description: 'Live Zoom session this Saturday' },
                    { id: DEMO_IDS.ED_FEES, title: '📚 Syllabus & Fees', description: '12-week course curriculum' },
                    { id: DEMO_IDS.ED_COUNSEL, title: '📞 1-on-1 Counselling', description: 'Speak with Senior Advisor' },
                    { id: DEMO_IDS.ED_TIMINGS, title: '⏰ Weekend Batch Timings', description: 'Working professional batches' },
                    { id: DEMO_IDS.ED_PAPERS, title: '📑 Solved Sample Papers', description: '5 years solved question papers' },
                ],
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '🎓 *Apex Academy & EdTech (Education Demo)*\n\nUpskill with Bangalore\'s premier tech coaching programs:', 'View Courses', sections);
    }
    /**
     * Demo Flow: Salon Slot Selection
     */
    async sendSalonTimeSlots(recipient, treatment) {
        const sections = [
            {
                title: 'Available Slots',
                rows: [
                    {
                        id: DEMO_IDS.SALON_SLOT_11AM,
                        title: '📅 Tomorrow at 11:00 AM',
                        description: 'Morning slot • 2 stylists available',
                    },
                    {
                        id: DEMO_IDS.SALON_SLOT_4PM,
                        title: '📅 Tomorrow at 04:00 PM',
                        description: 'Evening slot • 3 stylists available',
                    },
                ],
            },
        ];
        await this.sendTrackedInteractiveList(recipient, `Selected: *${treatment}*\n\nPlease choose your preferred appointment slot:`, 'Pick Time Slot', sections);
    }
    /**
     * Helpers to send and log outbound messages for quota tracking.
     */
    async sendTrackedText(to, text) {
        const res = await this.whatsapp.sendTextMessage(to, text);
        const msgId = res.messages?.[0]?.id || `out_${Date.now()}`;
        dbService.logMessage(msgId, to, 'outbound', 'text', text);
    }
    async sendTrackedImage(to, imageUrl, caption) {
        const res = await this.whatsapp.sendImageMessage(to, imageUrl, caption);
        const msgId = res.messages?.[0]?.id || `out_${Date.now()}`;
        dbService.logMessage(msgId, to, 'outbound', 'image', caption || '');
    }
    async sendTrackedInteractiveList(to, bodyText, buttonText, sections) {
        const res = await this.whatsapp.sendInteractiveListMessage(to, bodyText, buttonText, sections);
        const msgId = res.messages?.[0]?.id || `out_${Date.now()}`;
        dbService.logMessage(msgId, to, 'outbound', 'interactive', bodyText);
    }
    /**
     * Type guard to verify if an ID is a valid ServiceId.
     */
    isValidServiceId(id) {
        return Object.values(SERVICE_IDS).includes(id);
    }
}
export const botService = new BotService();

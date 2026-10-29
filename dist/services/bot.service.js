import { DEMO_COMMANDS, DEMO_IDS, DEMO_MENU_ITEMS, HTRZ_MENU_IDS, HTRZ_MENU_ITEMS, HTRZ_WELCOME_MESSAGE, WELCOME_MESSAGE, MENU_BUTTON_TEXT, MENU_COMMANDS, MENU_PROMPT_BODY, MENU_SECTION_TITLE, SERVICE_DETAILS, SERVICE_IDS, SERVICE_MENU_ITEMS, } from '../config/constants.js';
import fs from 'node:fs';
import path from 'node:path';
import { idempotencyService } from '../utils/idempotency.js';
import { logger } from '../utils/logger.js';
import { dbService } from '../db/database.js';
import { env } from '../config/env.js';
import { whatsAppService } from './whatsapp.service.js';
export class BotService {
    whatsapp;
    inactivityTimers = new Map();
    lastEnquiredService = new Map();
    mediaIdCache = new Map();
    constructor(whatsapp = whatsAppService) {
        this.whatsapp = whatsapp;
    }
    /**
     * Main entry point for processing an incoming WhatsApp message.
     */
    async handleIncomingMessage(message) {
        const messageId = message.id;
        const sender = message.from;
        // Clear any pending inactivity timer as customer has responded
        this.cancelInactivityReminder(sender);
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
        // While a ticket is open, the bot stays silent for human agent conversation.
        // However, if the customer types "hi", "menu", "start", "reset", or clicks a menu button,
        // we auto-resolve the ticket and turn the bot back on.
        if (dbService.hasOpenTicket(sender)) {
            const rawText = message.type === 'text' && message.text ? message.text.body.trim().toLowerCase() : '';
            const isResetCommand = ['menu', 'reset', 'start', 'restart', 'bot', 'hi', 'hello', 'hey'].includes(rawText);
            const isInteractive = message.type === 'interactive';
            if (isResetCommand || isInteractive) {
                logger.info({ sender, rawText, isInteractive }, 'Customer sent greeting/menu command or clicked button. Reactivating bot and resolving open ticket.');
                const openTicket = dbService.getOpenTicketForPhone(sender);
                if (openTicket) {
                    dbService.updateTicketStatus(openTicket.id, 'RESOLVED');
                }
            }
            else {
                logger.info({ sender }, 'Active support ticket is OPEN for customer. Bot staying silent for human agent.');
                return;
            }
        }
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
        // 0. Primary HTRZ Modz Hub Selections
        if (selectedId === HTRZ_MENU_IDS.BIKES || selectedId === 'htrz_menu_bikes') {
            await this.sendBikeBrandsMenu(sender);
            return;
        }
        if (selectedId === HTRZ_MENU_IDS.CATALOG || selectedId === 'htrz_menu_catalog') {
            await this.sendAccessoryCategoriesMenu(sender);
            return;
        }
        if (selectedId === HTRZ_MENU_IDS.OFFERS || selectedId === 'htrz_menu_offers') {
            await this.sendLiveOffers(sender);
            return;
        }
        if (selectedId === HTRZ_MENU_IDS.EXPERT || selectedId === 'htrz_menu_expert') {
            dbService.recordLeadInteraction(sender, { status: 'contacted' });
            const lead = dbService.getLead(sender);
            const ticket = dbService.createSupportTicket(sender, lead?.name || null, 'HTRZ Fitment Specialist Support', 'Customer clicked Speak to Fitment Specialist in HTRZ Modz menu.', 'htrz');
            await this.sendHumanSupportConfirmation(sender, ticket.ticketNumber, 'Motorcycle Accessories & Fitment', 'htrz');
            return;
        }
        // 1. Check for Demo Hub Trigger (Custom WhatsApp Bot by Triuss)
        if (selectedId === HTRZ_MENU_IDS.CUSTOM_BOT ||
            selectedId === SERVICE_IDS.DEMO_HUB ||
            selectedId === 'htrz_menu_custom_bot') {
            const serviceTitle = 'Custom WhatsApp Bot Demo';
            this.lastEnquiredService.set(sender, serviceTitle);
            dbService.recordLeadInteraction(sender, { interestedService: 'demo_hub', activeDemo: 'hub', status: 'new' });
            await this.sendDemoHubMenu(sender);
            this.scheduleInactivityReminder(sender, serviceTitle);
            return;
        }
        // 2. Check for Specific Industry Demo Entry Points
        if (selectedId === DEMO_IDS.JEWELRY) {
            this.lastEnquiredService.set(sender, 'Jewelry & D2C Store Demo');
            dbService.recordLeadInteraction(sender, { interestedService: DEMO_IDS.JEWELRY, activeDemo: 'jewelry' });
            await this.handleJewelryDemo(sender);
            this.scheduleInactivityReminder(sender, 'Jewelry & D2C Store Demo');
            return;
        }
        if (selectedId === DEMO_IDS.SALON) {
            this.lastEnquiredService.set(sender, 'Salon & Aesthetics Demo');
            dbService.recordLeadInteraction(sender, { interestedService: DEMO_IDS.SALON, activeDemo: 'salon' });
            await this.handleSalonDemo(sender);
            this.scheduleInactivityReminder(sender, 'Salon & Aesthetics Demo');
            return;
        }
        if (selectedId === DEMO_IDS.REAL_ESTATE) {
            this.lastEnquiredService.set(sender, 'Real Estate Agency Demo');
            dbService.recordLeadInteraction(sender, { interestedService: DEMO_IDS.REAL_ESTATE, activeDemo: 'realestate' });
            await this.handleRealEstateDemo(sender);
            this.scheduleInactivityReminder(sender, 'Real Estate Agency Demo');
            return;
        }
        if (selectedId === DEMO_IDS.CLINIC) {
            this.lastEnquiredService.set(sender, 'Healthcare & Clinic Demo');
            dbService.recordLeadInteraction(sender, { interestedService: DEMO_IDS.CLINIC, activeDemo: 'clinic' });
            await this.handleClinicDemo(sender);
            this.scheduleInactivityReminder(sender, 'Healthcare & Clinic Demo');
            return;
        }
        if (selectedId === DEMO_IDS.GYM) {
            this.lastEnquiredService.set(sender, 'Gym & Fitness Center Demo');
            dbService.recordLeadInteraction(sender, { interestedService: DEMO_IDS.GYM, activeDemo: 'gym' });
            await this.handleGymDemo(sender);
            this.scheduleInactivityReminder(sender, 'Gym & Fitness Center Demo');
            return;
        }
        if (selectedId === DEMO_IDS.RESTAURANT) {
            this.lastEnquiredService.set(sender, 'Restaurant & Cafe Demo');
            dbService.recordLeadInteraction(sender, { interestedService: DEMO_IDS.RESTAURANT, activeDemo: 'restaurant' });
            await this.handleRestaurantDemo(sender);
            this.scheduleInactivityReminder(sender, 'Restaurant & Cafe Demo');
            return;
        }
        if (selectedId === DEMO_IDS.AUTO) {
            this.lastEnquiredService.set(sender, 'Car Sales & Service Demo');
            dbService.recordLeadInteraction(sender, { interestedService: DEMO_IDS.AUTO, activeDemo: 'auto' });
            await this.handleAutoDemo(sender);
            this.scheduleInactivityReminder(sender, 'Car Sales & Service Demo');
            return;
        }
        if (selectedId === DEMO_IDS.EDTECH) {
            this.lastEnquiredService.set(sender, 'Coaching & EdTech Demo');
            dbService.recordLeadInteraction(sender, { interestedService: DEMO_IDS.EDTECH, activeDemo: 'edtech' });
            await this.handleEdTechDemo(sender);
            this.scheduleInactivityReminder(sender, 'Coaching & EdTech Demo');
            return;
        }
        if (selectedId === DEMO_IDS.ACCESSORIES) {
            this.lastEnquiredService.set(sender, 'HTRZ Modz');
            dbService.recordLeadInteraction(sender, { interestedService: 'htrz_modz', activeDemo: 'htrz' });
            await this.sendTrackedText(sender, HTRZ_WELCOME_MESSAGE);
            if (process.env.NODE_ENV !== 'test') {
                await new Promise((resolve) => setTimeout(resolve, 600));
            }
            await this.sendHtrzMainMenu(sender);
            this.scheduleInactivityReminder(sender, 'HTRZ Modz');
            return;
        }
        if (selectedId === DEMO_IDS.EXIT) {
            this.lastEnquiredService.delete(sender);
            dbService.recordLeadInteraction(sender, { activeDemo: 'triuss', interestedService: null });
            await this.sendTrackedText(sender, '👋 Exited demo mode. Welcome back to Triuss Solutions!');
            await this.sendServiceMenu(sender);
            return;
        }
        // 3. Handle Detailed Services Under Each Industry Demo
        if (await this.handleIndustryServiceDetail(sender, selectedId)) {
            return;
        }
        // 4. Check if the selected ID matches one of our primary Triuss services
        if (this.isValidServiceId(selectedId)) {
            const serviceTitle = this.formatServiceName(selectedId);
            this.lastEnquiredService.set(sender, serviceTitle);
            dbService.recordLeadInteraction(sender, { interestedService: selectedId, activeDemo: null, status: 'new' });
            const serviceDescription = SERVICE_DETAILS[selectedId];
            await this.sendTrackedText(sender, serviceDescription);
            this.scheduleInactivityReminder(sender, serviceTitle);
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
        // 9. Bike & Car Accessories Navigation (Bike Models, Categories, Offers)
        if (selectedId === DEMO_IDS.ACC_MENU_BIKES) {
            await this.sendBikeBrandsMenu(sender);
            return true;
        }
        if (selectedId === DEMO_IDS.ACC_MENU_BROWSE) {
            await this.sendAccessoryCategoriesMenu(sender);
            return true;
        }
        if (selectedId === DEMO_IDS.ACC_MENU_OFFERS) {
            await this.sendLiveOffers(sender);
            return true;
        }
        // Bike Brand Selection (Suzuki, Royal Enfield, Yamaha, KTM, Hero, etc.)
        if ([
            DEMO_IDS.BIKE_BRAND_SUZUKI,
            DEMO_IDS.BIKE_BRAND_ROYALENFIELD,
            DEMO_IDS.BIKE_BRAND_YAMAHA,
            DEMO_IDS.BIKE_BRAND_KTM,
            DEMO_IDS.BIKE_BRAND_HERO,
            DEMO_IDS.BIKE_BRAND_HONDA,
            DEMO_IDS.BIKE_BRAND_KAWASAKI,
            DEMO_IDS.BIKE_BRAND_BAJAJ_TVS,
        ].includes(selectedId)) {
            await this.sendBikeModelsMenu(sender, selectedId);
            return true;
        }
        // Bike Model Selection (V-Strom 250, Himalayan, R15, Duke, Xpulse, etc.)
        if (selectedId.startsWith('bm_') ||
            [
                DEMO_IDS.BM_SUZUKI_VSTROM250,
                DEMO_IDS.BM_SUZUKI_GIXXER,
                DEMO_IDS.BM_SUZUKI_HAYABUSA,
                DEMO_IDS.BM_SUZUKI_ACCESS,
                DEMO_IDS.BM_RE_HIMALAYAN,
                DEMO_IDS.BM_RE_CLASSIC,
                DEMO_IDS.BM_RE_HUNTER,
                DEMO_IDS.BM_RE_GT650,
                DEMO_IDS.BM_YAMAHA_R15,
                DEMO_IDS.BM_YAMAHA_MT15,
                DEMO_IDS.BM_YAMAHA_AEROX,
                DEMO_IDS.BM_KTM_DUKE,
                DEMO_IDS.BM_KTM_ADV,
                DEMO_IDS.BM_HERO_XPULSE,
                DEMO_IDS.BM_HERO_KARIZMA,
            ].includes(selectedId)) {
            await this.handleBikeModelSelection(sender, selectedId);
            return true;
        }
        // Product Category Selections (Helmets, Dashcam, Lights, Audio, etc.)
        if (selectedId === DEMO_IDS.ACC_HELMETS) {
            await this.sendAccessoryCategoryProducts(sender, 'Helmets & Riding Gear', [
                { id: DEMO_IDS.ACC_P_AXOR, title: 'Axor Apex Venom Helmet', description: '₹4,999 • ECE 22.06 & DOT • Dual visor' },
                { id: DEMO_IDS.ACC_P_RYNOX, title: 'Rynox Air GT4 Jacket', description: '₹6,499 • Knox CE Level 2 armor' },
                { id: DEMO_IDS.ACC_P_GLOVES, title: 'Viaterra Carbon Gloves', description: '₹2,199 • Real carbon knuckle' },
                { id: DEMO_IDS.ACC_P_MT, title: 'MT Blade 2 SV Carbon', description: '₹8,999 • Carbon racing diffuser' },
            ]);
            return true;
        }
        if (selectedId === DEMO_IDS.ACC_DASHCAM) {
            await this.sendAccessoryCategoryProducts(sender, 'Dash Cams & GPS Trackers', [
                { id: DEMO_IDS.ACC_P_70MAI, title: '70mai A810 4K Dashcam', description: '₹13,999 • Dual HDR • Sony Starvis 2' },
                { id: DEMO_IDS.ACC_P_QUBO, title: 'Qubo Smart Dashcam Pro', description: '₹3,990 • 1080p FHD night vision' },
                { id: DEMO_IDS.ACC_P_GPS, title: 'Onelap Micro GPS', description: '₹2,499 • WhatsApp engine lock' },
                { id: DEMO_IDS.ACC_P_CARPLAY, title: 'Wireless CarPlay USB', description: '₹2,999 • 5-sec auto connect' },
            ]);
            return true;
        }
        if (selectedId === DEMO_IDS.ACC_LIGHTS) {
            await this.sendAccessoryCategoryProducts(sender, 'LED & Auxiliary Lights', [
                { id: DEMO_IDS.ACC_P_HJG, title: 'HJG 60W Cree Fog Light', description: '₹2,899/pair • Amber & White dual beam' },
                { id: DEMO_IDS.ACC_P_NIGHTEYE, title: 'Nighteye H4 72W LED', description: '₹1,599/pair • 9000LM 6000K' },
                { id: DEMO_IDS.ACC_P_MADDOG, title: 'Maddog ScoutX Lights', description: '₹5,750/pair • 4800 Lumens • 18mo wrnty' },
            ]);
            return true;
        }
        if (selectedId === DEMO_IDS.ACC_AUDIO) {
            await this.sendAccessoryCategoryProducts(sender, 'Car Audio & Screens', [
                { id: DEMO_IDS.ACC_P_SONY, title: 'Sony XAV-AX3200 7"', description: '₹17,990 • Apple CarPlay & Android Auto' },
                { id: DEMO_IDS.ACC_P_JBL, title: 'JBL Stage2 Components', description: '₹4,290 • 270W Peak power' },
                { id: DEMO_IDS.ACC_P_BLAUPUNKT, title: 'Blaupunkt 10.1" Unit', description: '₹11,499 • 4GB/64GB • DSP 32-band EQ' },
            ]);
            return true;
        }
        if (selectedId === DEMO_IDS.ACC_EXHAUST) {
            await this.sendAccessoryCategoryProducts(sender, 'Exhausts & Performance', [
                { id: DEMO_IDS.ACC_P_AKRA, title: 'Akrapovic Slip-On', description: '₹3,499 • Carbon finish • DB killer' },
                { id: DEMO_IDS.ACC_P_BMC, title: 'BMC Performance Filter', description: '₹4,690 • Lifetime washable • +5% BHP' },
                { id: DEMO_IDS.ACC_P_POWERT, title: 'PowerTRONIC Piggyback', description: '₹19,000 • Handlebar dual map switch' },
            ]);
            return true;
        }
        if (selectedId === DEMO_IDS.ACC_STYLING) {
            await this.sendAccessoryCategoryProducts(sender, 'Protection & Styling', [
                { id: DEMO_IDS.ACC_P_7DMATS, title: '7D Dual Layer Car Mats', description: '₹3,499 • Laser-fit 100% waterproof' },
                { id: DEMO_IDS.ACC_P_CRASHGUARD, title: 'RE Heavy Crash Guard', description: '₹2,799 • 32mm seamless steel' },
                { id: DEMO_IDS.ACC_P_SPOILER, title: 'Carbon Ducktail', description: '₹1,899 • Universal 3M adhesive' },
            ]);
            return true;
        }
        if (selectedId === DEMO_IDS.ACC_BEST_SELLERS) {
            await this.sendTrackedText(sender, `🔥 *ApexMoto & Auto Gear - Top Trending Combos*\n\n` +
                `1. 🏍️ *Rider Safety Combo:*\n   Axor Helmet + Viaterra Gloves + Riding Jacket: *₹12,499* (Save ₹1,198!)\n\n` +
                `2. 🚗 *Car Pro Tech Combo:*\n   70mai 4K Dashcam + Wireless CarPlay Dongle: *₹15,499* (Save ₹1,500!)\n\n` +
                `3. 💡 *Touring Night Vision Pack:*\n   HJG 60W Cree Fog Lights + Nighteye H4 LED: *₹3,999* (Save ₹500!)\n\n` +
                `🏷️ *Exclusive WhatsApp Voucher:* Use code *APEX10* for extra 10% OFF at checkout!\n\n` +
                `_Reply with the combo name or reply *YES* to speak with our product expert!_`);
            this.scheduleInactivityReminder(sender, 'Trending Auto Accessories Combo');
            return true;
        }
        if (selectedId === DEMO_IDS.ACC_FINDER) {
            await this.sendTrackedText(sender, `🔍 *Vehicle Accessory Finder Engine*\n\n` +
                `Please reply with your vehicle model name, for example:\n` +
                `• *"Royal Enfield Classic 350"*\n` +
                `• *"Hyundai Creta 2024"*\n` +
                `• *"KTM Duke 390"*\n` +
                `• *"Mahindra Thar 4x4"*\n` +
                `• *"Maruti Suzuki Swift"*\n\n` +
                `Our database will instantly match guaranteed-fit crash guards, mats, screens, exhausts and lights for your exact ride!`);
            return true;
        }
        // Check if an individual accessory product was clicked
        if (this.isAccessoryProductId(selectedId)) {
            await this.handleAccessoryProductCard(sender, selectedId);
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
        // 1. Check if user wants to speak to real customer support
        const isAffirmative = [
            'yes',
            'y',
            'yeah',
            'yep',
            'yes please',
            'sure',
            'support',
            'human',
            'agent',
            'call me',
            'talk to human',
            'speak to human',
            'contact support',
            'customer support',
        ].includes(lowerText) ||
            lowerText.startsWith('yes ') ||
            lowerText.startsWith('yes,') ||
            lowerText.startsWith('yes.');
        if (isAffirmative) {
            logger.info({ sender, text: lowerText }, 'Customer requested real human support');
            this.cancelInactivityReminder(sender);
            dbService.recordLeadInteraction(sender, { status: 'contacted' });
            const lead = dbService.getLead(sender);
            const isTriussDemo = lead?.activeDemo === 'hub' ||
                (lead?.activeDemo && lead.activeDemo !== 'htrz' && lead.activeDemo !== 'none');
            if (isTriussDemo) {
                const contextualService = this.lastEnquiredService.get(sender) ||
                    (lead?.activeDemo && lead.activeDemo !== 'none'
                        ? lead.activeDemo === 'hub'
                            ? 'Custom WhatsApp Bot'
                            : `demo_${lead.activeDemo}`
                        : null) ||
                    lead?.interestedService ||
                    'Custom WhatsApp Bot Demo';
                const serviceName = this.formatServiceName(contextualService);
                const ticket = dbService.createSupportTicket(sender, lead?.name || null, serviceName, `Customer enquired about ${serviceName} and replied YES to speak with real support.`, 'triuss');
                await this.sendHumanSupportConfirmation(sender, ticket.ticketNumber, serviceName, 'triuss');
                return;
            }
            // Default: HTRZ Modz fitment specialist ticket!
            const contextualService = this.lastEnquiredService.get(sender) ||
                lead?.interestedService ||
                'HTRZ Bike Accessories & Fitment';
            const serviceName = this.formatServiceName(contextualService);
            const ticket = dbService.createSupportTicket(sender, lead?.name || null, serviceName, `Customer enquired about ${serviceName} and requested HTRZ fitment support.`, 'htrz');
            await this.sendHumanSupportConfirmation(sender, ticket.ticketNumber, serviceName, 'htrz');
            return;
        }
        // 2. Check if user typed "demo", "build", "custom bot", or showcase commands
        if (DEMO_COMMANDS.includes(lowerText) ||
            lowerText.includes('custom bot') ||
            lowerText.includes('triuss') ||
            lowerText.includes('build bot')) {
            const serviceTitle = 'Custom WhatsApp Bot Demo';
            this.lastEnquiredService.set(sender, serviceTitle);
            dbService.recordLeadInteraction(sender, { interestedService: 'demo_hub', activeDemo: 'hub', status: 'demo_tested' });
            await this.sendDemoHubMenu(sender);
            this.scheduleInactivityReminder(sender, serviceTitle);
            return;
        }
        // 2. Check if user typed "exit" or "triuss" to return to Triuss main menu
        if (lowerText === 'exit' || lowerText === 'triuss') {
            this.lastEnquiredService.delete(sender);
            dbService.recordLeadInteraction(sender, { activeDemo: 'triuss', interestedService: null });
            await this.sendTrackedText(sender, '👋 Welcome back to Triuss Solutions!');
            await this.sendServiceMenu(sender);
            return;
        }
        // Check if user explicitly typed "htrz" to start HTRZ Modz bot
        if (lowerText === 'htrz' || lowerText.includes('htrz modz')) {
            this.lastEnquiredService.set(sender, 'HTRZ Modz');
            dbService.recordLeadInteraction(sender, { interestedService: 'htrz_modz', activeDemo: 'htrz' });
            await this.sendTrackedText(sender, HTRZ_WELCOME_MESSAGE);
            if (process.env.NODE_ENV !== 'test') {
                await new Promise((resolve) => setTimeout(resolve, 600));
            }
            await this.sendHtrzMainMenu(sender);
            return;
        }
        // 3. Check if user enquired about websites or web design
        const isWebsiteQuery = [
            'website',
            'websites',
            'web design',
            'web development',
            'web app',
            'web apps',
            'portfolio',
            'sample websites',
            'sample website',
            'client websites',
            'sample sites',
        ].some((k) => lowerText.includes(k));
        if (isWebsiteQuery) {
            const serviceTitle = '🌐 Modern Websites';
            this.lastEnquiredService.set(sender, serviceTitle);
            dbService.recordLeadInteraction(sender, { interestedService: 'websites', status: 'new' });
            await this.sendTrackedText(sender, SERVICE_DETAILS[SERVICE_IDS.WEBSITES]);
            this.scheduleInactivityReminder(sender, serviceTitle);
            return;
        }
        // 4. Check for Live Offers query
        const isOffersQuery = [
            'offer',
            'offers',
            'deal',
            'deals',
            'discount',
            'discounts',
            'coupon',
            'coupons',
            'promo',
            'promos',
        ].some((k) => lowerText.includes(k));
        if (isOffersQuery) {
            await this.sendLiveOffers(sender);
            return;
        }
        // 5. Check for V-Strom specific query
        if (lowerText.includes('vstrom') || lowerText.includes('v-strom') || lowerText.includes('v strom')) {
            await this.handleBikeModelSelection(sender, DEMO_IDS.BM_SUZUKI_VSTROM250);
            return;
        }
        // 6. Check for bike brands query
        if (lowerText === 'suzuki' || lowerText.includes('suzuki bike') || lowerText.includes('suzuki model')) {
            await this.sendBikeModelsMenu(sender, DEMO_IDS.BIKE_BRAND_SUZUKI);
            return;
        }
        if (lowerText === 'royal enfield' ||
            lowerText === 're' ||
            lowerText.includes('royal enfield bike') ||
            lowerText.includes('bullet')) {
            await this.sendBikeModelsMenu(sender, DEMO_IDS.BIKE_BRAND_ROYALENFIELD);
            return;
        }
        if (lowerText === 'yamaha' || lowerText.includes('yamaha bike')) {
            await this.sendBikeModelsMenu(sender, DEMO_IDS.BIKE_BRAND_YAMAHA);
            return;
        }
        if (lowerText === 'ktm' || lowerText.includes('ktm bike')) {
            await this.sendBikeModelsMenu(sender, DEMO_IDS.BIKE_BRAND_KTM);
            return;
        }
        if (lowerText === 'hero' || lowerText.includes('hero bike')) {
            await this.sendBikeModelsMenu(sender, DEMO_IDS.BIKE_BRAND_HERO);
            return;
        }
        if (lowerText.includes('bike model') ||
            lowerText.includes('bike models') ||
            lowerText.includes('select bike') ||
            lowerText.includes('shop by bike') ||
            lowerText.includes('bikes')) {
            await this.sendBikeBrandsMenu(sender);
            return;
        }
        // 7. Check for vehicle model query (e.g. Royal Enfield, Thar, Creta, Duke, Swift)
        const vehicleMatches = [
            'royal enfield', 'classic 350', 'hunter 350', 'meteor', 'himalayan',
            'ktm', 'duke', 'creta', 'thar', 'swift', 'scorpio', 'fortuner',
            'seltos', 'nexon', 'brezza', 'xuv700', 'innova', 'splendor', 'pulsar', 'apache'
        ];
        const isVehicleQuery = vehicleMatches.some((v) => lowerText.includes(v));
        if (isVehicleQuery) {
            await this.sendTrackedText(sender, `🚗 *Compatible Accessories Found for Your Vehicle!*\n\n` +
                `We have verified, precision-fit accessories in stock for *${textBody}*:\n` +
                `• 🛡️ Heavy-Duty Crash Guard / Bumper Protectors\n` +
                `• 💡 60W Dual Projector Cree LED Fog Lamps\n` +
                `• 📹 4K Front & Rear Dash Cam with Parking Guard\n` +
                `• 🔊 7" Apple CarPlay & Android Auto Touchscreen\n` +
                `• 🏎️ 7D Custom Laser-Cut All-Weather Floor Mats\n\n` +
                `_Reply with the item name (e.g., *"crash guard"* or *"dash cam"*) to view photos and checkout, or reply *YES* to speak with our fitment engineer!_`);
            this.scheduleInactivityReminder(sender, `Accessories for ${textBody}`);
            return;
        }
        // 4. Check for product query / reel links (E-commerce / Jewelry & Accessories simulation)
        const isReelLink = lowerText.includes('instagram.com') || lowerText.includes('reel') || lowerText.includes('fb.watch');
        const isProductQuery = isReelLink ||
            lowerText.includes('silver') ||
            lowerText.includes('chain') ||
            lowerText.includes('pendant') ||
            lowerText.includes('jw-01') ||
            lowerText.includes('jw-02') ||
            lowerText.includes('helmet') ||
            lowerText.includes('axor') ||
            lowerText.includes('rynox') ||
            lowerText.includes('jacket') ||
            lowerText.includes('glove') ||
            lowerText.includes('dashcam') ||
            lowerText.includes('dash cam') ||
            lowerText.includes('70mai') ||
            lowerText.includes('qubo') ||
            lowerText.includes('gps') ||
            lowerText.includes('tracker') ||
            lowerText.includes('fog light') ||
            lowerText.includes('fog lamp') ||
            lowerText.includes('headlight') ||
            lowerText.includes('hjg') ||
            lowerText.includes('maddog') ||
            lowerText.includes('speaker') ||
            lowerText.includes('touchscreen') ||
            lowerText.includes('carplay') ||
            lowerText.includes('android auto') ||
            lowerText.includes('sony') ||
            lowerText.includes('jbl') ||
            lowerText.includes('exhaust') ||
            lowerText.includes('akrapovic') ||
            lowerText.includes('air filter') ||
            lowerText.includes('powertronic') ||
            lowerText.includes('mat') ||
            lowerText.includes('crash guard') ||
            lowerText.includes('spoiler') ||
            lowerText.includes('accessories') ||
            lowerText.includes('ba-') ||
            lowerText.includes('ca-') ||
            lowerText.startsWith('interested in') ||
            lowerText.includes('product');
        if (isProductQuery) {
            await this.handleProductEnquiry(sender, lowerText, isReelLink);
            return;
        }
        // 5. Check if the incoming text matches a menu / greeting command
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
        if (items.length === 0) {
            if (query.includes('accessories') ||
                query.includes('accessory') ||
                query.includes('bike') ||
                query.includes('car') ||
                query.includes('gear')) {
                await this.handleAccessoriesDemo(recipient);
                return;
            }
            await this.sendTrackedText(recipient, "Sorry, I couldn't find that item in our catalog. Type 'menu' or 'demo' to browse our catalog.");
            return;
        }
        const item = items[0];
        if (!item) {
            await this.sendTrackedText(recipient, "Sorry, I couldn't find that item in our catalog. Type 'menu' or 'demo' to browse our catalog.");
            return;
        }
        const isAutoAccessory = item.sku.startsWith('BA-') ||
            item.sku.startsWith('CA-') ||
            ['bike_gear', 'car_electronics', 'lighting', 'audio', 'performance', 'styling'].includes(item.category);
        const introPrefix = fromSocialMedia
            ? `📱 *Instagram Reel Item Identified!*\n\n`
            : isAutoAccessory
                ? `🏍️ *ApexMoto & Auto Gear - Verified Product:*\n\n`
                : `💎 *Product Details:*\n\n`;
        const productCaption = `${introPrefix}` +
            `✨ *${item.name}*\n` +
            `🏷️ SKU: ${item.sku} | In Stock\n` +
            `💰 Price: *₹${item.price.toLocaleString('en-IN')}* (Incl. of all taxes)\n\n` +
            `📝 *Description & Specifications:*\n${item.description}\n\n` +
            `🚚 Fast Delivery across India (2-4 business days)\n` +
            `💳 *Instant WhatsApp Checkout (UPI):*\n${item.paymentUrl || 'https://rzp.io/l/demo-silver-chain'}\n\n` +
            `_Need fitment check for your vehicle? Reply *YES* to speak with our support specialist, or type *'exit'* to return to menu._`;
        if (item.imageUrl) {
            await this.sendTrackedImage(recipient, item.imageUrl, productCaption);
        }
        else {
            await this.sendTrackedText(recipient, productCaption);
        }
        this.scheduleInactivityReminder(recipient, item.name);
    }
    /**
     * Confirms real human customer support connection with ticket details.
     */
    async sendHumanSupportConfirmation(recipient, ticketNumber, serviceName, business = 'htrz') {
        const ticketLine = ticketNumber ? `🎫 *Support Ticket #${ticketNumber} Created*\n\n` : '';
        const serviceContext = serviceName ? `regarding *${serviceName}* ` : '';
        const confirmationText = business === 'htrz'
            ? `🎉 *Awesome! Our fitment team is on it.*\n\n` +
                `${ticketLine}` +
                `An HTRZ Modz bike specialist has been notified ${serviceContext}and will message you right here shortly! 🏍️💨\n\n` +
                `Feel free to share your motorcycle model, year, or questions in the meantime.\n\n` +
                `_Reply *MENU* anytime to return to options._`
            : `🎉 *Awesome! Our team is on it.*\n\n` +
                `${ticketLine}` +
                `A Triuss specialist has been notified ${serviceContext}and will message you right here shortly! 😊\n\n` +
                `Feel free to share your website, requirements, or any questions in the meantime.\n\n` +
                `_Reply *MENU* anytime to return to options._`;
        await this.sendTrackedText(recipient, confirmationText);
    }
    /**
     * Schedules a 5-minute reminder if the customer stops interacting after an enquiry.
     */
    scheduleInactivityReminder(recipient, serviceTitle, customDelayMs) {
        this.cancelInactivityReminder(recipient);
        this.lastEnquiredService.set(recipient, serviceTitle);
        dbService.recordLeadInteraction(recipient, { interestedService: serviceTitle });
        // Skip auto-scheduling in test mode unless explicit customDelayMs is provided
        if (process.env.NODE_ENV === 'test' && customDelayMs === undefined) {
            return;
        }
        const delayMs = customDelayMs ?? 300000; // 5 minutes default
        logger.info({ recipient, serviceTitle, delayMs }, 'Scheduled 5-minute inactivity reminder timer');
        const timer = setTimeout(async () => {
            this.inactivityTimers.delete(recipient);
            logger.info({ recipient, serviceTitle }, '5-minute inactivity timer elapsed, dispatching reminder message');
            try {
                await this.sendTrackedText(recipient, `👋 *Hey there! Quick reminder from Triuss Solutions*\n\n` +
                    `Still exploring *${serviceTitle}*? We'd love to help you build or customize it for your brand! 😊\n\n` +
                    `👉 *Reply "YES"* to chat with our team, or reply *MENU* anytime!`);
            }
            catch (err) {
                logger.error({ recipient, error: err }, 'Failed to deliver inactivity reminder');
            }
        }, delayMs);
        this.inactivityTimers.set(recipient, timer);
    }
    /**
     * Cancels any pending inactivity reminder for a customer.
     */
    cancelInactivityReminder(recipient) {
        const existing = this.inactivityTimers.get(recipient);
        if (existing) {
            clearTimeout(existing);
            this.inactivityTimers.delete(recipient);
        }
    }
    /**
     * Clears all active inactivity timers across all users.
     */
    clearAllTimers() {
        for (const timer of this.inactivityTimers.values()) {
            clearTimeout(timer);
        }
        this.inactivityTimers.clear();
        this.lastEnquiredService.clear();
    }
    /**
     * Formats internal service key into human-readable title.
     */
    formatServiceName(serviceKey) {
        if (serviceKey === 'demo_hub' ||
            serviceKey === 'hub' ||
            serviceKey.toLowerCase().includes('custom whatsapp bot')) {
            return '🤖 Custom WhatsApp Bot';
        }
        const item = SERVICE_MENU_ITEMS.find((s) => s.id === serviceKey);
        if (item)
            return item.title;
        const demoItem = DEMO_MENU_ITEMS.find((d) => d.id === serviceKey);
        if (demoItem)
            return demoItem.title;
        if (serviceKey.includes(' ') || serviceKey.startsWith('BA-') || serviceKey.startsWith('CA-')) {
            return serviceKey;
        }
        return serviceKey
            .replace(/^demo_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    /**
     * Sends polite invalid message notification followed by the service menu.
     */
    async handleUnsupportedMessage(recipient) {
        const lead = dbService.getLead(recipient);
        const isTriussDemo = lead?.activeDemo === 'hub' ||
            (lead?.activeDemo && lead.activeDemo !== 'htrz' && lead.activeDemo !== 'none');
        if (isTriussDemo) {
            await this.sendTrackedText(recipient, "I can help you explore our demos. Choose an option from the menu below, or type 'exit' to return to HTRZ Modz:");
            if (process.env.NODE_ENV !== 'test') {
                await new Promise((resolve) => setTimeout(resolve, 600));
            }
            await this.sendDemoHubMenu(recipient);
        }
        else {
            await this.sendTrackedText(recipient, "I can help you explore motorcycle accessories and gear. Please choose an option from the menu below:");
            if (process.env.NODE_ENV !== 'test') {
                await new Promise((resolve) => setTimeout(resolve, 600));
            }
            await this.sendHtrzMainMenu(recipient);
        }
    }
    /**
     * Sends the welcome greeting text followed by the interactive service menu.
     */
    async sendWelcomeAndMenu(recipient) {
        dbService.recordLeadInteraction(recipient, { activeDemo: 'triuss', interestedService: null });
        await this.sendTrackedText(recipient, WELCOME_MESSAGE);
        if (process.env.NODE_ENV !== 'test') {
            await new Promise((resolve) => setTimeout(resolve, 600));
        }
        await this.sendServiceMenu(recipient);
    }
    /**
     * Sends the primary HTRZ Modz interactive menu list.
     */
    async sendHtrzMainMenu(recipient) {
        const sections = [
            {
                title: 'HTRZ Modz Menu',
                rows: HTRZ_MENU_ITEMS.map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                })),
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '🏍️ *HTRZ Modz — Premium Motorcycle Accessories*\n\nSelect an option below to browse bike catalogs, view live offers, or connect with our fitment team:', 'View Options', sections);
    }
    /**
     * Sends the agency service menu list.
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
     * Demo Flow: 9. Bike & Car Accessories Store (E-commerce)
     * Offers 3 clean options: Shop by Bike Model (with PDF), Browse All Products, or Live Offers
     */
    async handleAccessoriesDemo(recipient) {
        const sections = [
            {
                title: 'Choose How to Shop',
                rows: [
                    {
                        id: DEMO_IDS.ACC_MENU_BIKES,
                        title: '🏍️ Shop by Bike Model',
                        description: 'Select brand & bike to get custom accessories PDF',
                    },
                    {
                        id: DEMO_IDS.ACC_MENU_BROWSE,
                        title: '📦 Browse All Products',
                        description: 'Helmets, fog lights, dashcams, riding gear & more',
                    },
                    {
                        id: DEMO_IDS.ACC_MENU_OFFERS,
                        title: '🔥 Live Offers & Deals',
                        description: 'Active combos, coupon codes & bundle discounts',
                    },
                ],
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '🏍️ *ApexMoto & Auto Gear (Accessories Store Demo)*\n\n' +
            'Welcome to India\'s premier bike & auto accessories hub! Explore 5,000+ verified products, riding gear, smart electronics & performance upgrades with instant WhatsApp UPI checkout.\n\n' +
            'How would you like to explore today? Select an option below:', 'Browse Store', sections);
    }
    /**
     * Sends the brand selection menu (Suzuki, Royal Enfield, Yamaha, KTM, Hero, etc.)
     */
    async sendBikeBrandsMenu(recipient) {
        const sections = [
            {
                title: 'Select Bike Brand',
                rows: [
                    {
                        id: DEMO_IDS.BIKE_BRAND_SUZUKI,
                        title: '🔵 Suzuki',
                        description: 'V-Strom SX 250, Gixxer SF & Hayabusa',
                    },
                    {
                        id: DEMO_IDS.BIKE_BRAND_ROYALENFIELD,
                        title: '🔴 Royal Enfield',
                        description: 'Himalayan 450, Classic 350, Hunter, GT650',
                    },
                    {
                        id: DEMO_IDS.BIKE_BRAND_YAMAHA,
                        title: '🔵 Yamaha',
                        description: 'R15 V4, MT-15, Aerox 155, FZ-S',
                    },
                    {
                        id: DEMO_IDS.BIKE_BRAND_KTM,
                        title: '🟠 KTM',
                        description: 'Duke 390 / 250, Adventure 390, RC 390',
                    },
                    {
                        id: DEMO_IDS.BIKE_BRAND_HERO,
                        title: '🔴 Hero MotoCorp',
                        description: 'Xpulse 200 4V, Karizma XMR, Mavrick',
                    },
                    {
                        id: DEMO_IDS.BIKE_BRAND_HONDA,
                        title: '🔴 Honda BigWing',
                        description: 'CB350, H\'ness, NX500, Transalp',
                    },
                    {
                        id: DEMO_IDS.BIKE_BRAND_KAWASAKI,
                        title: '🟢 Kawasaki',
                        description: 'Ninja 300 / 400, Z900, Versys 650',
                    },
                    {
                        id: DEMO_IDS.BIKE_BRAND_BAJAJ_TVS,
                        title: '🔵 Bajaj & TVS',
                        description: 'Dominar 400, Apache RR310, RTR 200',
                    },
                ],
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '🏍️ *Select Your Motorcycle Brand*\n\n' +
            'Please choose your bike brand below to view available models and download the complete accessories & price list PDF:', 'Select Brand', sections);
    }
    /**
     * Sends the models list for the chosen brand.
     */
    async sendBikeModelsMenu(recipient, brandId) {
        if (brandId === DEMO_IDS.BIKE_BRAND_SUZUKI) {
            const sections = [
                {
                    title: 'Suzuki Models',
                    rows: [
                        {
                            id: DEMO_IDS.BM_SUZUKI_VSTROM250,
                            title: '🏍️ V-Strom SX 250',
                            description: 'Touring setup, crash guards & PDF price list',
                        },
                        {
                            id: DEMO_IDS.BM_SUZUKI_GIXXER,
                            title: '🏍️ Gixxer SF 250 / 150',
                            description: 'Aero bubble visor, frame sliders & clip-ons',
                        },
                        {
                            id: DEMO_IDS.BM_SUZUKI_HAYABUSA,
                            title: '🏍️ Suzuki Hayabusa',
                            description: 'Exhaust systems, tank grips & aero carbon',
                        },
                        {
                            id: DEMO_IDS.BM_SUZUKI_ACCESS,
                            title: '🛵 Access 125 / Burgman',
                            description: 'Stainless perimeter guard & mobile mount',
                        },
                    ],
                },
            ];
            await this.sendTrackedInteractiveList(recipient, '🏍️ *Suzuki Motorcycle Models*\n\n' +
                'Choose your Suzuki model below to download the official accessories catalog & price list PDF:', 'Select Model', sections);
            return;
        }
        if (brandId === DEMO_IDS.BIKE_BRAND_ROYALENFIELD) {
            const sections = [
                {
                    title: 'Royal Enfield Models',
                    rows: [
                        {
                            id: DEMO_IDS.BM_RE_HIMALAYAN,
                            title: '🏍️ Himalayan 450',
                            description: 'Saddle stay, bash plate, touring tall visor',
                        },
                        {
                            id: DEMO_IDS.BM_RE_CLASSIC,
                            title: '🏍️ Classic 350 / Bullet',
                            description: 'Airfly leg guard, sump guard & touring seat',
                        },
                        {
                            id: DEMO_IDS.BM_RE_HUNTER,
                            title: '🏍️ Hunter 350',
                            description: 'Compact engine guard, bar-end mirrors, tail tidy',
                        },
                        {
                            id: DEMO_IDS.BM_RE_GT650,
                            title: '🏍️ Continental GT 650',
                            description: 'Single seat cowl, slip-ons & flyscreen',
                        },
                    ],
                },
            ];
            await this.sendTrackedInteractiveList(recipient, '🏍️ *Royal Enfield Models*\n\n' +
                'Choose your Royal Enfield model below to view custom accessories & price list:', 'Select Model', sections);
            return;
        }
        if (brandId === DEMO_IDS.BIKE_BRAND_YAMAHA) {
            const sections = [
                {
                    title: 'Yamaha Models',
                    rows: [
                        {
                            id: DEMO_IDS.BM_YAMAHA_R15,
                            title: '🏍️ R15 V4 / V3',
                            description: 'Aero winglets, frame sliders & racing bubble visor',
                        },
                        {
                            id: DEMO_IDS.BM_YAMAHA_MT15,
                            title: '🏍️ MT-15 V2',
                            description: 'Radiator guard, belly pan & tail tidy',
                        },
                        {
                            id: DEMO_IDS.BM_YAMAHA_AEROX,
                            title: '🛵 Aerox 155',
                            description: 'Rear rack, tall windshield & footboard mats',
                        },
                    ],
                },
            ];
            await this.sendTrackedInteractiveList(recipient, '🏍️ *Yamaha Motorcycle Models*\n\n' +
                'Choose your Yamaha model below to view custom accessories & price list:', 'Select Model', sections);
            return;
        }
        if (brandId === DEMO_IDS.BIKE_BRAND_KTM) {
            const sections = [
                {
                    title: 'KTM Models',
                    rows: [
                        {
                            id: DEMO_IDS.BM_KTM_DUKE,
                            title: '🏍️ Duke 390 / 250',
                            description: 'Orange crash cage, tail tidy, radiator guard',
                        },
                        {
                            id: DEMO_IDS.BM_KTM_ADV,
                            title: '🏍️ Adventure 390',
                            description: 'Headlight grill, GPS bracket, touring panniers',
                        },
                    ],
                },
            ];
            await this.sendTrackedInteractiveList(recipient, '🏍️ *KTM Motorcycle Models*\n\n' +
                'Choose your KTM model below to view custom accessories & price list:', 'Select Model', sections);
            return;
        }
        if (brandId === DEMO_IDS.BIKE_BRAND_HERO) {
            const sections = [
                {
                    title: 'Hero Models',
                    rows: [
                        {
                            id: DEMO_IDS.BM_HERO_XPULSE,
                            title: '🏍️ Xpulse 200 4V / Pro',
                            description: 'Rally kit, knuckle guards, bash plate & visor',
                        },
                        {
                            id: DEMO_IDS.BM_HERO_KARIZMA,
                            title: '🏍️ Karizma XMR 210',
                            description: 'Aero bubble visor, sliders & lever guards',
                        },
                    ],
                },
            ];
            await this.sendTrackedInteractiveList(recipient, '🏍️ *Hero Motorcycle Models*\n\n' +
                'Choose your Hero model below to view custom accessories & price list:', 'Select Model', sections);
            return;
        }
        // Default for Honda, Kawasaki, Bajaj
        await this.sendTrackedText(recipient, `🏍️ *Accessories for Selected Brand*\n\n` +
            `We carry complete bolt-on accessories, crash guards, and lighting kits for your ride!\n\n` +
            `👉 Reply with your exact model name (e.g. *"Honda CB350"* or *"Ninja 300"*) or reply *YES* to speak with our fitment desk.`);
    }
    /**
     * Handles selection of a specific bike model.
     * Dispatches PDF document for Suzuki V-Strom 250 and tailored lists for other models.
     */
    async handleBikeModelSelection(recipient, modelId) {
        if (modelId === DEMO_IDS.BM_SUZUKI_VSTROM250) {
            const pdfFileName = 'SUZUKI VSTORM 250 ACCESSORIES LIST.pdf';
            const localPdfPath = path.join(process.cwd(), 'pdfs', pdfFileName);
            const displayFilename = 'SUZUKI_VSTROM_250_ACCESSORIES_LIST.pdf';
            const caption = '🏍️ *Suzuki V-Strom SX 250 - Genuine Accessories & Price List*\n' +
                '👉 Reply *YES* to place an order or check fitment support!';
            let mediaId = this.mediaIdCache.get(localPdfPath)?.id;
            // 1. If not cached, upload directly to WhatsApp Media API
            if (!mediaId && fs.existsSync(localPdfPath)) {
                try {
                    mediaId = await this.whatsapp.uploadMedia(localPdfPath, 'application/pdf', displayFilename);
                    this.mediaIdCache.set(localPdfPath, { id: mediaId, uploadedAt: Date.now() });
                }
                catch (uploadErr) {
                    logger.warn({ uploadErr, recipient }, 'Direct media upload failed; falling back to URL if available');
                }
            }
            // 2. Try sending document directly with mediaId (preferred) or public URL
            let sentSuccessfully = false;
            if (mediaId) {
                try {
                    await this.sendTrackedDocument(recipient, mediaId, caption, displayFilename);
                    sentSuccessfully = true;
                }
                catch (docErr) {
                    logger.warn({ docErr, recipient }, 'Failed sending via mediaId; falling back to URL');
                }
            }
            if (!sentSuccessfully) {
                const publicUrl = (env.PUBLIC_APP_URL || '').replace(/\/+$/, '');
                if (publicUrl) {
                    try {
                        const pdfUrl = `${publicUrl}/pdfs/SUZUKI%20VSTORM%20250%20ACCESSORIES%20LIST.pdf`;
                        await this.sendTrackedDocument(recipient, pdfUrl, caption, displayFilename);
                        sentSuccessfully = true;
                    }
                    catch (urlErr) {
                        logger.warn({ urlErr, recipient }, 'Failed sending via public URL');
                    }
                }
            }
            // 3. Fallback only if direct document sending completely failed: deliver the 2 lines as text
            if (!sentSuccessfully) {
                await this.sendTrackedText(recipient, caption);
            }
            this.scheduleInactivityReminder(recipient, 'Suzuki V-Strom 250 Accessories');
            return;
        }
        if (modelId === DEMO_IDS.BM_RE_HIMALAYAN) {
            await this.sendTrackedText(recipient, `🏍️ *Royal Enfield Himalayan 450 - Expedition Accessories List* 📄\n\n` +
                `Verified bolt-on accessories in stock for *Himalayan 450*:\n` +
                `• 🛡️ Adventure Crash Guard with Dual Sliders - ₹3,799\n` +
                `• 💨 High-Impact Polycarbonate Touring Visor - ₹1,699\n` +
                `• 🎒 Heavy-Duty Stainless Top Rack & Saddle Stay - ₹3,299\n` +
                `• 💡 Maddog ScoutX 60W Auxiliary Fog Lamps - ₹5,750\n` +
                `• 🏎️ Aluminum Engine Sump Guard / Bash Plate - ₹2,199\n\n` +
                `👉 Reply *YES* to speak with our fitment specialist or order with instant WhatsApp UPI checkout!`);
            this.scheduleInactivityReminder(recipient, 'RE Himalayan 450 Accessories');
            return;
        }
        if (modelId === DEMO_IDS.BM_YAMAHA_R15) {
            await this.sendTrackedText(recipient, `🏍️ *Yamaha R15 V4 / V3 - Track & Aero Accessories* 📄\n\n` +
                `Top verified upgrades in stock for *Yamaha R15*:\n` +
                `• 🏎️ MotoGP Aerodynamic Front Winglets - ₹999\n` +
                `• 💨 Double-Bubble Smoked Racing Visor - ₹1,199\n` +
                `• 🛡️ CNC Billet Aluminum Frame Sliders - ₹1,899\n` +
                `• 🔊 Akrapovic Slip-On Exhaust (Carbon Finish) - ₹3,499\n` +
                `• 🏁 Tail Tidy Fender Eliminator with LED Indicators - ₹1,299\n\n` +
                `👉 Reply *YES* to connect with our support team or claim custom discounts!`);
            this.scheduleInactivityReminder(recipient, 'Yamaha R15 Accessories');
            return;
        }
        if (modelId === DEMO_IDS.BM_KTM_DUKE) {
            await this.sendTrackedText(recipient, `🏍️ *KTM Duke 390 / 250 - Performance & Stunt Protection* 📄\n\n` +
                `Top upgrades in stock for *KTM Duke*:\n` +
                `• 🛡️ Ready-to-Race Orange Crash Cage / Sliders - ₹3,899\n` +
                `• 🏎️ Stainless Steel Radiator Guard - ₹1,199\n` +
                `• 🏁 Tail Tidy with Number Plate LED Light - ₹1,399\n` +
                `• 💨 BMC Washable Performance Air Filter - ₹4,690\n` +
                `• ⚡ PowerTRONIC Piggyback ECU Quickshifter Kit - ₹19,000\n\n` +
                `👉 Reply *YES* to connect with our fitment team!`);
            this.scheduleInactivityReminder(recipient, 'KTM Duke Accessories');
            return;
        }
        if (modelId === DEMO_IDS.BM_HERO_XPULSE) {
            await this.sendTrackedText(recipient, `🏍️ *Hero Xpulse 200 4V - Off-Road & Rally Package* 📄\n\n` +
                `Top upgrades in stock for *Xpulse 200 4V*:\n` +
                `• 🛡️ Heavy-Duty Tubular Engine Guard & Slider - ₹2,499\n` +
                `• 🛡️ Heavy Aluminum Knuckle Guards with Deflectors - ₹1,799\n` +
                `• 💨 Rally High Windscreen Visor - ₹1,299\n` +
                `• 🎒 Luggage Carrier & Saddle Stay Mount - ₹2,799\n` +
                `• 💡 HJG Dual Projector 60W Cree Fog Light Kit - ₹2,899\n\n` +
                `👉 Reply *YES* to speak with our fitment desk!`);
            this.scheduleInactivityReminder(recipient, 'Hero Xpulse Accessories');
            return;
        }
        // Generic fallback for any other selected model
        await this.sendTrackedText(recipient, `🏍️ *Bike Accessories & Genuine Fitment List*\n\n` +
            `We have verified fitment packages ready for your motorcycle!\n\n` +
            `👉 *Reply "YES"* to connect with our fitment engineer, or reply *MENU* anytime!`);
        this.scheduleInactivityReminder(recipient, 'Bike Accessories List');
    }
    /**
     * Sends the general product categories menu (for users browsing products without selecting a bike).
     */
    async sendAccessoryCategoriesMenu(recipient) {
        const sections = [
            {
                title: 'Accessory Categories',
                rows: [
                    {
                        id: DEMO_IDS.ACC_HELMETS,
                        title: '🪖 Helmets & Riding',
                        description: 'ECE certified helmets, jackets & gloves',
                    },
                    {
                        id: DEMO_IDS.ACC_DASHCAM,
                        title: '📹 Dash Cams & GPS',
                        description: '4K dual dashcams & real-time anti-theft GPS',
                    },
                    {
                        id: DEMO_IDS.ACC_LIGHTS,
                        title: '💡 LED & Fog Lights',
                        description: 'Auxiliary laser fog lamps & LED headlights',
                    },
                    {
                        id: DEMO_IDS.ACC_AUDIO,
                        title: '🔊 Car Audio & Android',
                        description: 'Touchscreen CarPlay systems & JBL speakers',
                    },
                    {
                        id: DEMO_IDS.ACC_EXHAUST,
                        title: '💨 Exhaust & Tuners',
                        description: 'Slip-on exhausts, BMC filters & ECU remaps',
                    },
                    {
                        id: DEMO_IDS.ACC_STYLING,
                        title: '🛡️ Crash Guards & Mats',
                        description: '7D car mats, bike sliders & aero spoilers',
                    },
                    {
                        id: DEMO_IDS.ACC_BEST_SELLERS,
                        title: '🔥 Top Trending Offers',
                        description: 'Curated bundle deals with up to 40% OFF',
                    },
                    {
                        id: DEMO_IDS.ACC_FINDER,
                        title: '🔍 Vehicle Part Finder',
                        description: 'Filter accessories for your exact bike/car model',
                    },
                ],
            },
        ];
        await this.sendTrackedInteractiveList(recipient, '🏍️ *ApexMoto Product Catalog*\n\n' +
            'Please select a category below to browse verified products with instant WhatsApp UPI checkout:', 'Browse Catalog', sections);
    }
    /**
     * Dispatches live deals, discount coupons, and combo offers.
     */
    async sendLiveOffers(recipient) {
        const offersText = `🔥 *ApexMoto & Auto Gear - Live Exclusive Offers & Deals!* 🏷️\n\n` +
            `Here are this week's active bundle discounts and promo coupons:\n\n` +
            `🎉 *1. Adventure Touring Combo (Flat 18% OFF)*\n` +
            `• Crash Guard + Top Rack + Tall Touring Visor\n` +
            `• Coupon: *TOUR18* | Save up to ₹1,800!\n\n` +
            `💡 *2. Night-Rider Lighting Bundle (Flat 20% OFF)*\n` +
            `• Dual Projector 60W LED Fog Lights + Wire Harness + Waterproof Switch\n` +
            `• Coupon: *NIGHT20* | Now *₹2,999* (MRP ₹3,750)\n\n` +
            `🪖 *3. Rider Safety Gear Package (Flat ₹1,000 OFF)*\n` +
            `• Axor Apex Carbon Helmet + Rynox Urban Pro Knuckle Gloves\n` +
            `• Coupon: *SAFE1000*\n\n` +
            `🏍️ *4. Suzuki V-Strom SX 250 Special Promo*\n` +
            `• Order any 3 accessories from the official V-Strom catalog and get flat 15% OFF!\n` +
            `• Coupon: *VSTROM15*\n\n` +
            `💳 *Extra 5% Instant Discount on direct UPI payments!*\n` +
            `🚚 *Free Express Shipping across India on orders above ₹1,999.*\n\n` +
            `👉 *Want to claim any offer or place an order?*\n` +
            `Reply with the coupon code (e.g., *"TOUR18"* or *"VSTROM15"*) or reply *"YES"* to speak with our sales desk!`;
        await this.sendTrackedText(recipient, offersText);
        this.scheduleInactivityReminder(recipient, 'Live Accessories Offers');
    }
    /**
     * Sends an interactive product selection list for a specific accessory category.
     */
    async sendAccessoryCategoryProducts(recipient, categoryName, items) {
        const sections = [
            {
                title: categoryName.slice(0, 24),
                rows: items.map((item) => ({
                    id: item.id,
                    title: item.title.slice(0, 24),
                    description: item.description.slice(0, 72),
                })),
            },
        ];
        await this.sendTrackedInteractiveList(recipient, `🏍️ *ApexMoto - ${categoryName}*\n\nTap any product below to view high-res photos, detailed specs, customer reviews, and instant checkout link:`, 'View Products', sections);
    }
    /**
     * Dispatches a rich product card with photo, specs, warranty, and instant UPI checkout link.
     */
    async handleAccessoryProductCard(recipient, selectedId) {
        const skuMap = {
            [DEMO_IDS.ACC_P_AXOR]: 'BA-01',
            [DEMO_IDS.ACC_P_RYNOX]: 'BA-02',
            [DEMO_IDS.ACC_P_GLOVES]: 'BA-03',
            [DEMO_IDS.ACC_P_MT]: 'BA-04',
            [DEMO_IDS.ACC_P_70MAI]: 'CA-01',
            [DEMO_IDS.ACC_P_QUBO]: 'CA-02',
            [DEMO_IDS.ACC_P_GPS]: 'CA-03',
            [DEMO_IDS.ACC_P_CARPLAY]: 'CA-04',
            [DEMO_IDS.ACC_P_HJG]: 'CA-05',
            [DEMO_IDS.ACC_P_NIGHTEYE]: 'CA-06',
            [DEMO_IDS.ACC_P_MADDOG]: 'CA-07',
            [DEMO_IDS.ACC_P_SONY]: 'CA-08',
            [DEMO_IDS.ACC_P_JBL]: 'CA-09',
            [DEMO_IDS.ACC_P_BLAUPUNKT]: 'CA-10',
            [DEMO_IDS.ACC_P_AKRA]: 'BA-05',
            [DEMO_IDS.ACC_P_BMC]: 'BA-06',
            [DEMO_IDS.ACC_P_POWERT]: 'BA-07',
            [DEMO_IDS.ACC_P_7DMATS]: 'CA-11',
            [DEMO_IDS.ACC_P_CRASHGUARD]: 'BA-08',
            [DEMO_IDS.ACC_P_SPOILER]: 'CA-12',
        };
        const targetSku = skuMap[selectedId] || selectedId;
        await this.handleProductEnquiry(recipient, targetSku, false);
    }
    /**
     * Helper to identify if an ID represents an accessory product.
     */
    isAccessoryProductId(id) {
        return (id.startsWith('acc_p_') ||
            [
                DEMO_IDS.ACC_P_AXOR,
                DEMO_IDS.ACC_P_RYNOX,
                DEMO_IDS.ACC_P_GLOVES,
                DEMO_IDS.ACC_P_MT,
                DEMO_IDS.ACC_P_70MAI,
                DEMO_IDS.ACC_P_QUBO,
                DEMO_IDS.ACC_P_GPS,
                DEMO_IDS.ACC_P_CARPLAY,
                DEMO_IDS.ACC_P_HJG,
                DEMO_IDS.ACC_P_NIGHTEYE,
                DEMO_IDS.ACC_P_MADDOG,
                DEMO_IDS.ACC_P_SONY,
                DEMO_IDS.ACC_P_JBL,
                DEMO_IDS.ACC_P_BLAUPUNKT,
                DEMO_IDS.ACC_P_AKRA,
                DEMO_IDS.ACC_P_BMC,
                DEMO_IDS.ACC_P_POWERT,
                DEMO_IDS.ACC_P_7DMATS,
                DEMO_IDS.ACC_P_CRASHGUARD,
                DEMO_IDS.ACC_P_SPOILER,
            ].includes(id));
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
    async sendTrackedDocument(to, documentUrl, caption, filename) {
        const res = await this.whatsapp.sendDocumentMessage(to, documentUrl, caption, filename);
        const msgId = res.messages?.[0]?.id || `out_${Date.now()}`;
        dbService.logMessage(msgId, to, 'outbound', 'document', caption || filename || 'document');
    }
    /**
     * Type guard to verify if an ID is a valid ServiceId.
     */
    isValidServiceId(id) {
        return Object.values(SERVICE_IDS).includes(id);
    }
}
export const botService = new BotService();

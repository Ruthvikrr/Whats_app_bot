/* eslint-disable no-console */
import readline from 'readline';
import { botService } from '../src/services/bot.service.js';
import { whatsAppService } from '../src/services/whatsapp.service.js';
import { COMPANY_NAME } from '../src/config/constants.js';

// Intercept outgoing WhatsApp API calls to display them in terminal as simulated WhatsApp bubbles
whatsAppService.sendTextMessage = async (to: string, text: string) => {
  console.log('\n┌────────────────────────────────────────────────────────────┐');
  console.log(`│ 🤖 ${COMPANY_NAME} Bot (To: ${to})`);
  console.log('├────────────────────────────────────────────────────────────┤');
  console.log(text.split('\n').map((line) => `│ ${line}`).join('\n'));
  console.log('└────────────────────────────────────────────────────────────┘\n');
  return {
    messaging_product: 'whatsapp',
    contacts: [{ input: to, wa_id: to }],
    messages: [{ id: `wamid.sim_${Date.now()}` }],
  };
};

whatsAppService.sendImageMessage = async (to: string, imageUrl: string, caption?: string) => {
  console.log('\n┌────────────────────────────────────────────────────────────┐');
  console.log(`│ 🖼️ [Image Delivered] -> ${imageUrl}`);
  if (caption) {
    console.log('├────────────────────────────────────────────────────────────┤');
    console.log(caption.split('\n').map((line) => `│ ${line}`).join('\n'));
  }
  console.log('└────────────────────────────────────────────────────────────┘\n');
  return {
    messaging_product: 'whatsapp',
    contacts: [{ input: to, wa_id: to }],
    messages: [{ id: `wamid.sim_${Date.now()}` }],
  };
};

whatsAppService.sendInteractiveListMessage = async (
  to: string,
  bodyText: string,
  buttonText: string,
  sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>
) => {
  console.log('\n┌────────────────────────────────────────────────────────────┐');
  console.log(`│ 📋 Interactive Menu: "${bodyText.replace(/\n/g, ' ')}"`);
  console.log(`│ 🔘 Button: [ ${buttonText} ]`);
  console.log('├────────────────────────────────────────────────────────────┤');
  sections.forEach((sec) => {
    console.log(`│ 📁 Section: ${sec.title}`);
    sec.rows.forEach((row, idx) => {
      console.log(`│   [${idx + 1}] ID: ${row.id}`);
      console.log(`│       Title: ${row.title}`);
      if (row.description) console.log(`│       Desc:  ${row.description}`);
    });
  });
  console.log('└────────────────────────────────────────────────────────────┘\n');
  return {
    messaging_product: 'whatsapp',
    contacts: [{ input: to, wa_id: to }],
    messages: [{ id: `wamid.sim_${Date.now()}` }],
  };
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n============================================================');
console.log(`💬 WhatsApp Live Bot Simulator for ${COMPANY_NAME}`);
console.log('============================================================');
console.log('Try typing commands:');
console.log('  - "hi" or "menu"  (Triuss Solutions agency intro + banner)');
console.log('  - "demo"          (Open Interactive Industry Demos hub)');
console.log('  - "silver chain"  (Test E-Commerce product & UPI checkout)');
console.log('  - "1" to "5"      (Quick menu shortcuts)');
console.log('  - "dashboard"     (View at http://localhost:3000/dashboard)');
console.log('Type "quit" to stop simulator.\n');

const promptUser = () => {
  rl.question('👤 You: ', async (input) => {
    const trimmed = input.trim();
    if (trimmed.toLowerCase() === 'quit') {
      rl.close();
      process.exit(0);
    }

    const numberMap: Record<string, string> = {
      '1': 'whatsapp_agents',
      '2': 'websites',
      '3': 'ai_photo_shoots',
      '4': 'voice_agents',
      '5': 'demo_hub',
    };

    const knownIds = [
      'whatsapp_agents',
      'websites',
      'ai_photo_shoots',
      'voice_agents',
      'demo_hub',
      'demo_jewelry',
      'demo_salon',
      'demo_realestate',
      'demo_exit',
      'salon_hairspa',
      'salon_facial',
      'slot_11am',
      'slot_4pm',
      're_2bhk',
      're_3bhk',
    ];

    const isInteractiveSelection = knownIds.includes(trimmed) || Boolean(numberMap[trimmed]);

    if (isInteractiveSelection) {
      const selectedId = numberMap[trimmed] || trimmed;
      await botService.handleIncomingMessage({
        from: '918431860448',
        id: `sim_msg_${Date.now()}`,
        timestamp: String(Math.floor(Date.now() / 1000)),
        type: 'interactive',
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: selectedId,
            title: selectedId,
          },
        },
      });
    } else {
      await botService.handleIncomingMessage({
        from: '918431860448',
        id: `sim_msg_${Date.now()}`,
        timestamp: String(Math.floor(Date.now() / 1000)),
        type: 'text',
        text: { body: trimmed },
      });
    }

    promptUser();
  });
};

promptUser();

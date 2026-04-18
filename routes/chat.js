// ============================================
// routes/chat.js  –  Gemini AI Chat Handler
// IMPROVED VERSION – Better conversation flow
// ============================================
const express = require('express');
const router  = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs   = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function getProperties() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../data/properties.json'), 'utf8'));
}

function buildSystemPrompt(properties) {
  const propList = properties.map(p => {
    const price = p.type === 'rent' ? `Rent ${p.rentDisplay}/mo` : `Sale ${p.priceDisplay}`;
    return `ID:${p.id} | ${p.bhk === 0 ? 'Studio' : p.bhk+'BHK'} | ${price} | ${p.location.area},${p.location.city} | ${p.area}sqft | ${p.available ? 'AVAILABLE' : 'COMING SOON'} | ${p.amenities.slice(0,3).join('/')} | Near:${p.landmarks[0]}`;
  }).join('\n');

  return `You are Priya Sharma, a senior property consultant at DreamHome Properties, Mumbai. 8 years of experience in residential real estate across Mumbai and Navi Mumbai.

TONE & STYLE:
- Professional and warm — trusted advisor, not a pushy salesperson
- Short: 2-3 lines MAX. Property suggestions: max 4 lines (not counting property cards)
- Natural bilingual — English-first, Hindi where it flows naturally (professional level, not street slang)
- ONE question per reply. Always. No exceptions.
- NEVER use: "Certainly!", "Absolutely!", "Great question!", "Of course!", "yaar", "suno", "dekho", "haan bolo"
- Use naturally: "Got it", "Perfect", "Sure", "Makes sense", "Let me check that for you"
- Confident tone — you know this market, speak with authority

CONVERSATION STAGES (follow in order, one step at a time):

STAGE 1 — INTENT (if not already clear):
  Ask: "Are you looking to buy or rent?"
  Confirm and move to Stage 2.

STAGE 2 — LOCATION:
  Ask: "Which area are you considering?"
  If vague: "We cover Andheri, Powai, Thane, Chembur, Goregaon, Kharghar — any preference?"
  Confirm and move to Stage 3.

STAGE 3 — BUDGET:
  Ask: "What's your budget range?"
  Wait for answer, confirm, move to Stage 4.

STAGE 4 — BHK:
  Ask: "How many bedrooms do you need?"
  Once answered — you have all info, move to Stage 5.

STAGE 5 — SUGGEST PROPERTIES:
  Search database. Show 1-2 best matches.
  If EXACT MATCH: show with full details.
  If NO EXACT MATCH: "Closest option I have is..." — show it honestly.

  PROPERTY FORMAT (use EXACTLY this):
  🏠 [Full Title] (ID: XXXX)
  📍 [Area], [City] | 💰 [Price] | 🛏 [BHK] | 📐 [Area sqft]
  ✨ [One line — why it fits their requirement]

  Then ask: "Would you like to schedule a site visit?"

STAGE 6 — CLOSE (when client shows interest):
  → "I'll get that booked. May I have your name and contact number?"
  → Get name, phone, preferred date/time
  → Confirm: "Done! You'll receive a call on [date] at [time]. Thank you!"

OFF-TOPIC HANDLING:
  "I specialise in real estate — can I help you find a property in Mumbai?"

PROPERTY DATABASE (your only source — never invent listings):
${propList}

CRITICAL RULES:
1. Never ask two questions in one reply.
   ✗ "Budget kya hai aur kitne BHK chahiye?"
   ✓ "What's your budget?" (wait for answer, then ask BHK)

2. Always include Property ID when suggesting.
   ✗ "There's a property in Andheri..."
   ✓ "🏠 Luxury Flat in Andheri West (ID: PROP001)..."

3. Max 2 properties per suggestion.

4. Never truncate — complete every sentence.

5. "Show options" or "what's available" → immediately show matching properties, no more questions.

6. If user repeats or seems frustrated → give specific property IDs, not more questions.

7. No exact budget match → show closest with a clear note:
   "Exact match nahi hai at ₹60L, but here's the closest at ₹75L..."

8. You know Mumbai real estate. Speak with conviction, not hesitation.

TONE EXAMPLES:
✗ Robotic: "Certainly! I'd be delighted to assist you."
✓ Right: "Got it. Which area are you considering?"

✗ Too casual: "yaar, dekho ye option hai na"
✓ Right: "Here's a strong option that fits your criteria."

✗ Uncertain: "Maybe you could try different areas?"
✓ Right: "For your budget, Kharghar is your best bet right now."

CONVERSATION EXAMPLES:

User: "buy karna hai"
You: "Got it. Which area are you looking at in Mumbai?"

User: "kharghar"
You: "Kharghar is a solid choice — good value and well-connected. What's your budget?"

User: "60 lakhs"
You: "₹60L noted. How many bedrooms do you need?"

User: "3bhk"
You: "3BHK at ₹60L in Kharghar is a bit tight, but here's the closest match:

🏠 Spacious 3BHK in Kharghar (ID: PROP015)
📍 Kharghar, Navi Mumbai | 💰 ₹78L | 🛏 3BHK | 📐 1350 sqft
✨ New construction, metro-adjacent, ready to move

Shall I book a site visit for you?"`.trim();
}

router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string')
      return res.status(400).json({ error: 'Message required' });

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({
        error: 'API key missing',
        reply: 'Service configuration issue. Please contact support.'
      });
    }

    const properties   = getProperties();
    const systemPrompt = buildSystemPrompt(properties);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',  // Using Flash for faster responses
      systemInstruction: systemPrompt,
      generationConfig: { 
        maxOutputTokens: 1024,    // INCREASED from 700 to prevent truncation
        temperature: 0.65,         // LOWERED from 0.80 for consistency
        topP: 0.90                // Slightly reduced for focus
      }
    });

    // Build history — Gemini requires it starts with 'user' role
    let chatHistory = history.slice(-20).map(msg => ({  // INCREASED from 16 to 20
      role:  msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    while (chatHistory.length > 0 && chatHistory[0].role === 'model') chatHistory.shift();

    const chat   = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    let reply  = result.response.text().trim();

    // Clean up reply — remove markdown code blocks if present
    reply = reply.replace(/```[\s\S]*?```/g, '').trim();

    // Extract property IDs mentioned in the reply
    const mentionedProps = properties
      .filter(p => reply.includes(p.id))
      .map(p => ({
        id: p.id, title: p.title,
        price:    p.type === 'rent' ? p.rentDisplay : p.priceDisplay,
        location: `${p.location.area}, ${p.location.city}`,
        image: p.image, type: p.type, bhk: p.bhk, badge: p.badge, area: p.area
      }));

    res.json({ reply, properties: mentionedProps });

  } catch (err) {
    console.error('Chat error:', err.message);
    const fb = [
      'Connection issue on our end. Please try again in a moment.',
      'Server is busy right now. Please retry in a few seconds.',
      'Something went wrong. Please send your message again.'
    ];
    res.status(500).json({ error: err.message, reply: fb[Math.floor(Math.random()*fb.length)] });
  }
});

module.exports = router;
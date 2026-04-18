# 🏠 DreamHome – AI Real Estate Chatbot

A complete AI-powered **Hinglish Real Estate Chatbot** built with Node.js, Express, and Google Gemini API.
Chatbot persona: **Rahul Sharma** – your friendly Mumbai property advisor.

---

## 📁 Project Structure

```
real-estate-chatbot/
├── server.js                  ← Express server (entry point)
├── package.json
├── .env.example               ← Copy to .env and add your API key
│
├── data/
│   └── properties.json        ← 15 property listings (editable)
│
├── routes/
│   ├── chat.js                ← Gemini AI chat handler
│   └── properties.js          ← CRUD API for properties
│
└── public/
    ├── index.html             ← Chatbot UI (WhatsApp-style)
    ├── admin.html             ← Admin panel
    ├── css/
    │   ├── chat.css           ← Chat interface styles
    │   └── admin.css          ← Admin panel styles
    └── js/
        ├── chat.js            ← Chat frontend logic
        └── admin.js           ← Admin CRUD logic
```

---

## 🚀 Setup & Run

### Step 1 – Clone / Download the project

### Step 2 – Install dependencies
```bash
npm install
```

### Step 3 – Configure environment
```bash
cp .env.example .env
```
Open `.env` and add your **Gemini API key**:
```
GEMINI_API_KEY=your_actual_api_key_here
```
> Get your free key at: https://aistudio.google.com/app/apikey

### Step 4 – Start the server
```bash
# Production
npm start

# Development (auto-restart on changes)
npm run dev
```

### Step 5 – Open in browser
| URL | Page |
|-----|------|
| `http://localhost:3000`       | 💬 Chat with Rahul |
| `http://localhost:3000/admin` | ⚙️ Admin Panel |

---

## 🌐 API Endpoints

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message, get AI reply |

**Request Body:**
```json
{
  "message": "2BHK chahiye Andheri mein",
  "history": [
    { "role": "user", "text": "Hello" },
    { "role": "bot",  "text": "Namaskar! Main Rahul hoon..." }
  ]
}
```

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/properties`     | Get all properties (with filters) |
| GET    | `/api/properties/:id` | Get single property |
| POST   | `/api/properties`     | Add new property |
| PUT    | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |

**GET query params:** `?type=sale&bhk=2&city=Mumbai&available=true`

---

## 🤖 Chatbot Features

- **Hinglish persona** – Talks like a real Mumbai sales agent
- **Conversation memory** – Remembers last 10 messages for context
- **Property matching** – AI suggests properties from your database
- **Property cards** – Shows image, price, location inline in chat
- **Site visit scheduling** – Collects date, name, phone
- **Urgency tactics** – "Ye property kaafi demand mein hai"
- **Typing animation** – Realistic 1-2.5 second delay
- **Quick reply buttons** – One-tap shortcuts for common queries
- **Property detail modal** – Full property info on card click

---

## 🧾 Admin Panel Features

- **Dashboard** with live stats (total, available, sale, rent counts)
- **All Properties table** with search & filter
- **Add Property** form with all fields
- **Edit** any property inline
- **Delete** with confirmation
- Changes instantly reflect in the chatbot

---

## 📦 Sample Properties Included

15 realistic Mumbai/Navi Mumbai listings:
1. 2BHK – Andheri West (Sale ₹95L)
2. 3BHK – Powai / Hiranandani (Sale ₹1.85Cr)
3. 1BHK – Borivali East (Rent ₹22K/mo)
4. 4BHK Villa – Juhu Beach (Sale ₹8.5Cr)
5. 2BHK – Thane West (Rent ₹28K/mo)
6. Studio – BKC (Rent ₹45K/mo)
7. 3BHK – Goregaon East (Sale ₹1.35Cr)
8. 2BHK – Kandivali West (Sale ₹78L)
9. 1BHK – Dadar West (Rent ₹32K/mo)
10. Penthouse 3BHK – Worli Sea Face (Sale ₹5.5Cr)
11. 2BHK – Malad West (Rent ₹30K/mo)
12. 4BHK – Bandra West (Sale ₹4.2Cr)
13. 1BHK – Chembur (Sale ₹62L)
14. 2BHK – Vashi, Navi Mumbai (Sale ₹85L)
15. 3BHK – Kharghar (Rent ₹35K/mo)

---

## 💡 Customization Tips

### Change chatbot name/company
Edit `routes/chat.js` → `buildSystemPrompt()` → change "Rahul Sharma" and "DreamHome Properties"

### Add your own properties
Go to `http://localhost:3000/admin` → Add Property form
OR edit `data/properties.json` directly

### Change city / market
Replace Mumbai properties in `data/properties.json` with your local market data

### Adjust AI personality
Edit the system prompt in `routes/chat.js` → `buildSystemPrompt()`

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| AI | Google Gemini 1.5 Flash |
| Frontend | Vanilla HTML5 + CSS3 + JS |
| Data | JSON file (upgradeable to MongoDB) |
| Fonts | Google Fonts (Inter) |
| Avatars | DiceBear API |
| Images | Unsplash |

---

## 📞 Support

If chatbot replies with an error, check:
1. `.env` file exists and has a valid `GEMINI_API_KEY`
2. Server is running (`npm start`)
3. Network connectivity to Gemini API

---

*Built with ❤️ — DreamHome Properties*

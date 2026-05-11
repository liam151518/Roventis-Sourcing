export type LessonCard = {
  type: "concept" | "example" | "drill" | "callout";
  title?: string;
  body: string;
  example?: { weak?: string; strong: string; context?: string };
};

export type Lesson = {
  id: string;
  chapter: string;
  title: string;
  subtitle: string;
  duration: string;
  cards: LessonCard[];
  drill: { title: string; instructions: string; checklist: string[] };
};

export const courseTitle = "The Roventis Behavioral Sales Manual";
export const courseSubtitle = "A behaviorally engineered framework for high-ticket sourcing. Master the psychology behind every closed deal.";

export const courseAttribution = {
  text: "Behavioral frameworks inspired by the research of Chase Hughes.",
  linkText: "Explore his work at chasehughes.com",
  url: "https://chasehughes.com"
};

export const lessons: Lesson[] = [
  {
    id: "intro",
    chapter: "Introduction",
    title: "The Psychology of High-Ticket Sourcing",
    subtitle: "Why logic loses and emotion wins.",
    duration: "5 min",
    cards: [
      { type: "concept", title: "The Fatal Error", body: "The fundamental mistake most salespeople make is attempting to sell logic. They list features, benefits, and pricing, hoping the client will make a rational calculation. Human beings do not make decisions logically. They make decisions emotionally and justify them logically afterward." },
      { type: "concept", title: "The Hierarchy of Influence", body: "The cognitive level of logic and reason is the weakest point of engagement. True influence occurs at deeper levels: the impulse level driven by survival and immediate reward, the behavioral level governed by ingrained patterns, and the chemical level fueled by neurotransmitters like dopamine and oxytocin." },
      { type: "callout", title: "Your real goal", body: "Your goal is not to convince the client to buy. Your goal is to create an environment where buying is the only action that resolves their internal tension." },
      { type: "example", title: "Practical Application", body: "When a client asks why they should choose Roventis over their current supplier who is 10% cheaper, a logical salesperson lists fabric specs and delivery times.", example: { weak: "Our fabric is 220gsm cotton blend with a 4 to 6 week delivery window and ISO-certified stitching.", strong: "You can absolutely find cheaper fabric. But when your executive team walks into a major conference, the difference between a cheap shirt and a premium Roventis garment is the difference between looking like a vendor and looking like an industry leader. How important is that first impression to your brand?", context: "Same client, same product. The second response targets emotion. That is the difference between a meeting and a sale." } }
    ],
    drill: {
      title: "The Logic-to-Emotion Translation",
      instructions: "Take three logical features of a Roventis product. Write down the emotional driver behind each one.",
      checklist: [
        "100% cotton becomes the physical comfort and pride an employee feels wearing it, reducing staff turnover and boosting morale.",
        "4 to 6 week delivery becomes certainty. The client can plan their event launch without anxiety.",
        "Custom sublimation becomes significance. The client's brand stands distinctly apart from competitors."
      ]
    }
  },
  {
    id: "father-frame",
    chapter: "Chapter 1",
    title: "The Father Frame and Masterful State Control",
    subtitle: "The sale is won or lost before you speak.",
    duration: "7 min",
    cards: [
      { type: "concept", title: "Social Resonance", body: "Before you utter a single word, the sale is often already won or lost based on your internal state. Human beings possess an innate ability to detect the emotional state of those around them. If you approach a call with anxiety, neediness, or desperation for the commission, the client will feel that tension and instinctively pull away." },
      { type: "concept", title: "The Father Frame", body: "The ideal state for influence is the Father Frame, characterized by amused composure, maturity, and unshakeable authority. Imagine a seasoned expert who has solved this exact problem a thousand times. He is not desperate for the business. He is simply there to diagnose the issue and offer the solution." },
      { type: "callout", title: "Eliminate neediness", body: "You are the prize. You represent Roventis Sourcing, a premium provider of high-quality merchandise. The client needs your expertise to elevate their brand far more than you need their specific order." },
      { type: "example", title: "When the client tests you", body: "Client says they are talking to three other suppliers, so you need to give them your absolute best price.", example: { weak: "Oh, okay, let me see what discounts I can apply. We really want your business.", strong: "I completely understand. It is smart to look at your options. Our pricing is fixed because we do not compromise on the quality of the final product. If you are looking for the cheapest option, we probably are not the right fit. But if you are looking for gear that actually lasts and elevates your brand, we should continue the conversation.", context: "Delivered with a calm, slightly amused tone. The Father Frame does not argue. It simply states the truth and offers a choice." } }
    ],
    drill: {
      title: "The Mirror Exercise",
      instructions: "Stand in front of a mirror. Deliver the Father Frame response above. Watch your body language.",
      checklist: [
        "Are your shoulders relaxed?",
        "Is your breathing slow?",
        "Are you maintaining steady eye contact without looking aggressive?",
        "Can you deliver the line with zero internal tension?"
      ]
    }
  },
  {
    id: "needs-mapping",
    chapter: "Chapter 2",
    title: "Needs Mapping and Qualifying the Buyer",
    subtitle: "Diagnose the dominant need in 3 minutes.",
    duration: "8 min",
    cards: [
      { type: "concept", title: "The Four Core Needs", body: "Every client is driven by one of four core psychological needs: Certainty, Significance, Connection, or Contribution. Your first task in any interaction is to identify their dominant need within the first three minutes, not through interrogation, but through strategic observation and carefully calibrated questions." },
      { type: "concept", title: "Reading the Signals", body: "If a client constantly mentions their competitors, their market position, or how the merchandise will make their team look, their dominant need is Significance. They want to feel important and superior. If they focus heavily on delivery timelines, guarantees, and exact specifications, their dominant need is Certainty. They want to avoid risk." },
      { type: "example", title: "Identifying and Pivoting", body: "Client says their last supplier delivered late and the colors were wrong. It was a disaster.", example: { context: "Dominant need: Certainty.", strong: "That sounds incredibly frustrating. At Roventis, we provide a guaranteed 4 to 6 week timeline after final sample approval, and you sign off on the exact physical sample before full production begins. There are no surprises." } },
      { type: "example", title: "Qualifying budget without sounding like a salesperson", body: "Never ask what their budget is. Use a declarative assumption that invites correction.", example: { weak: "What is your budget for this project?", strong: "Typically, for a rollout of this scale with premium soft shells and custom branding, our clients allocate around R50,000. I assume we are operating in a similar realm.", context: "If they have less, they will correct you. If they have more, they will agree. Either way, you have qualified them without an awkward question." } }
    ],
    drill: {
      title: "The Needs Map Roleplay",
      instructions: "Have a friend or colleague play a prospect. Ask them to adopt a persona, either a highly anxious operations manager (Certainty ) or an ego-driven CEO (Significance). Spend three minutes asking them about their business.",
      checklist: [
        "Did I correctly identify their dominant need based on the words they used?",
        "Did I pivot my pitch to satisfy that need?",
        "Did I qualify their budget using a declarative assumption?"
      ]
    }
  },
  {
    id: "fate-model",
    chapter: "Chapter 3",
    title: "The FATE Model in Action",
    subtitle: "Focus. Authority. Tribe. Emotion.",
    duration: "9 min",
    cards: [
      { type: "concept", title: "F is for Focus", body: "Focus is about directing the client's attention exactly where you want it. You achieve this through pattern interrupts. If a client is distracted or running on autopilot, a sudden shift in your tone, a deliberate pause, or an unexpected statement will snap their focus back to you." },
      { type: "concept", title: "A is for Authority", body: "Authority leverages the innate human tendency to obey perceived leaders. Use high-certainty, declarative language. Never hedge your statements with phrases like I think, maybe, or hopefully. Speak in absolutes. Your physical stillness and measured pacing further reinforce this authority." },
      { type: "concept", title: "T is for Tribe", body: "Tribe activates the deep-seated need for belonging and social conformity. Use language that creates an Us vs. Them dynamic, the kind of company that values brand standards, versus the kind that cuts corners and pays for it later." },
      { type: "concept", title: "E is for Emotion", body: "Emotion anchors your product to their deepest desires. You are not selling a custom-branded travel bag. You are selling the pride executives will feel carrying it through an airport, and the status it projects to their clients." },
      { type: "example", title: "Authority in Practice", body: "Replace tentative language with declarative authority.", example: { weak: "I think this olive green safari hat would be a good fit.", strong: "Based on your outdoor operations, the olive green safari hat is the exact right choice. It hides dust, maintains its shape, and aligns perfectly with your brand colors." } },
      { type: "example", title: "Tribe in Practice", body: "Create the Us vs. Them frame.", example: { strong: "There are companies that view corporate uniforms as a frustrating expense. They buy the cheapest shirts, and their staff hates wearing them. And then there are companies like yours, who understand that what your team wears is the physical embodiment of your brand's standards." } }
    ],
    drill: {
      title: "The Pattern Interrupt",
      instructions: "Next time you are in a casual conversation that is dragging on, suddenly drop your voice to a near-whisper, pause for two seconds, and say something slightly unexpected but relevant.",
      checklist: [
        "Did their eyes widen?",
        "Did their focus snap entirely to you?",
        "Could you recreate this when a client's attention drifts on a sales call?"
      ]
    }
  },
  {
    id: "language-patterns",
    chapter: "Chapter 4",
    title: "Language Patterns and Hypnotic Flow",
    subtitle: "Silence is a weapon.",
    duration: "8 min",
    cards: [
      { type: "concept", title: "The Power of the Pause", body: "After delivering a key piece of information or stating the price, stop talking. The average salesperson rushes to fill the silence out of discomfort, thereby destroying their authority. By remaining perfectly silent and comfortable, you force the client to process the information and respond." },
      { type: "concept", title: "Embedded Commands and Presuppositions", body: "These bypass conscious resistance. Instead of asking a yes/no question, you assume the action is already taking place. The client's brain shifts from Should I? to How will this work?" },
      { type: "concept", title: "The Innocence Signal", body: "In high-stakes sales, over-explaining triggers the client's deception radar. When you state the value of the Roventis offering, let it stand. Do not justify the price or ramble about features. State the facts calmly and pivot immediately to the purpose." },
      { type: "example", title: "Embedded Commands", body: "Skip the yes/no question. Assume the sale.", example: { weak: "Would you like to move forward with the order?", strong: "When we begin production next week, we will need the high-resolution logo files sent over to ensure the sublimation is perfect.", context: "This assumes the sale is complete and shifts their brain to the logistical task of finding the logo." } },
      { type: "example", title: "Handling Price with the Innocence Signal", body: "Client says R45,000 seems a bit steep for this.", example: { strong: "It is R45,000. That includes all setup, branding, finishing, and insured shipping. There are no hidden fees.", context: "Stop talking immediately. Do not justify further. Let the silence do the heavy lifting." } }
    ],
    drill: {
      title: "The Silence Challenge",
      instructions: "In your next three sales conversations, or even personal negotiations, state your price or your requirement, and then count to ten in your head. Do not speak, no matter how uncomfortable the silence gets.",
      checklist: [
        "Did the other person fill the void first?",
        "Did they negotiate against themselves?",
        "How long did the silence feel vs how long it actually lasted?"
      ]
    }
  },
  {
    id: "objections",
    chapter: "Chapter 5",
    title: "Handling Objections via Cognitive Dissonance",
    subtitle: "Agree. Pivot. Force the choice.",
    duration: "8 min",
    cards: [
      { type: "concept", title: "Objections Are Emotional, Not Logical", body: "Objections are rarely logical. They are emotional defense mechanisms. Arguing with an objection is a fatal error, as it forces the client to defend their position, entrenching them further." },
      { type: "concept", title: "Agree and Pivot", body: "First, validate their feeling without agreeing with their conclusion. This disarms their resistance. Next, create Cognitive Dissonance by making their objection conflict with their stated goals. Force them to choose between their stated desire for quality and their objection, guiding them to realize the investment is necessary." },
      { type: "example", title: "Handling We don't have the budget right now", body: "Step 1, Agree. Step 2, Pivot to a goal they already stated.", example: { strong: "I completely understand. Managing cash flow is critical, especially this quarter. Earlier, you mentioned that your sales team is attending the national expo next month, and your primary goal was to ensure they look more professional than your main competitor. If we delay this order, they will be walking into that expo in their current, faded gear. Are you comfortable sacrificing that first impression at your biggest event of the year just to defer the cost by a few weeks?", context: "You have not argued. You have not dropped the price. You have simply made their objection conflict with their own goal." } }
    ],
    drill: {
      title: "Objection Aikido",
      instructions: "Write down the three most common objections you face: Price, Timing, and Need to consult a partner. For each one, write out an Agree and Pivot script that ties the objection back to a goal the client stated earlier in the conversation.",
      checklist: [
        "Did I validate the feeling without agreeing with the conclusion?",
        "Did I reference a specific goal they mentioned earlier?",
        "Did I force a choice between their objection and their goal?"
      ]
    }
  },
  {
    id: "the-close",
    chapter: "Chapter 6",
    title: "The Close",
    subtitle: "The inevitable conclusion, not a pressure event.",
    duration: "6 min",
    cards: [
      { type: "concept", title: "Closing Should Feel Natural", body: "If you have executed the previous steps correctly, the close is simply the natural, inevitable conclusion of the conversation. This is achieved through Large-Framing. You create a frame so strong and comfortable that the client naturally steps into it." },
      { type: "concept", title: "The Assumptive Close", body: "You do not ask for the business. You outline the next steps. The transaction is treated as a foregone conclusion. You move directly to logistics: invoice, sample approval, production timeline." },
      { type: "callout", title: "Post-close silence", body: "He who speaks first loses. You have stated the terms clearly and confidently. You now wait for their confirmation. Do not fidget. Do not add extra incentives. Do not break eye contact if you are in person or on video. Your unshakeable composure in this moment seals the deal." },
      { type: "example", title: "The Assumptive Close in Action", body: "After full discussion, transition seamlessly to the logistics of doing business.", example: { strong: "Excellent. Based on everything we have discussed regarding the soft shells and the travel bags, the next step is for me to generate the invoice for the 100% deposit. Once that is cleared, we move straight into the final sample approval, and production begins. I will send that over to your email now. Should I CC your accounts department on that invoice?" } }
    ],
    drill: {
      title: "The Final Step Visualization",
      instructions: "Close your eyes and visualize the exact moment you ask for the business. Visualize the client hesitating. Visualize yourself remaining perfectly still, breathing calmly, and holding the Father Frame.",
      checklist: [
        "Could I see myself stay perfectly composed?",
        "Did I avoid the urge to add an incentive or apologize?",
        "Did I let the silence do the work?"
      ]
    }
  },
  {
    id: "conclusion",
    chapter: "Conclusion",
    title: "Your Path to Platinum",
    subtitle: "Compounding mastery.",
    duration: "4 min",
    cards: [
      { type: "concept", title: "It is not overnight", body: "Mastering behavioral sales is not an overnight process. It requires discipline, self-awareness, and relentless practice. As a Roventis affiliate, you have access to a premium product line, a verified lead pool, and a flawless fulfillment infrastructure. Your only job is to master the interaction." },
      { type: "callout", title: "The compounding effect", body: "Consistency in these practices creates a compounding effect. As you close more deals, your natural authority grows, making subsequent sales even easier. Apply these principles diligently, and your progression to the Platinum tier is inevitable." }
    ],
    drill: {
      title: "Your Commitment",
      instructions: "Make a written commitment to practice one specific skill from this course every single day for the next 30 days.",
      checklist: [
        "I have chosen the one skill I will practice daily.",
        "I have set a specific time of day to rehearse it.",
        "I have decided how I will measure my progress."
      ]
    }
  }
];
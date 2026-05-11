export interface Script {
  id: string;
  title: string;
  trigger: string;
  leadSays: string;
  yourScript: string;
  delivery?: string;
  whyItWorks: string;
  techniques: string[];
}

export interface ScriptStage {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  scripts: Script[];
}

export const libraryTitle = "Behavioral Scripts Playbook";
export const librarySubtitle = "Word-for-word templates for the most common and challenging sales scenarios. Delivered from the Father Frame: amused composure, unshakeable authority, absolute stillness.";

export const goldenRule = "He who speaks first after a powerful statement loses. Deliver the script, stop talking, let silence do the heavy lifting.";

export const libraryAttribution = {
  text: "The behavioral frameworks in these scripts are inspired by and derived from the teachings of Chase Hughes. We have adapted his work into a playbook tailored for Roventis Sourcing affiliates. To master the underlying psychology, study his original works.",
  link: "https://chasehughes.com",
  linkLabel: "chasehughes.com",
};

export const stages: ScriptStage[] = [
  {
    id: "stage-1",
    number: 1,
    title: "Opening & Frame",
    subtitle: "The first 60 seconds dictate the entire dynamic. You are the expert diagnosing a problem, not a salesperson begging for time.",
    scripts: [
      {
        id: "rushed-lead",
        title: "The Rushed or Impatient Lead",
        trigger: "The lead answers the phone but immediately tries to seize control or rush you off the call.",
        leadSays: "Listen, I'm really busy right now, what is this about?",
        yourScript: "I completely understand. I'm looking at my calendar and I only have about three minutes before my next client anyway. I'm calling regarding the corporate merchandise rollout for your team. Are you the person handling that, or should I be speaking with operations?",
        delivery: "Delivered slowly, calmly, with zero anxiety.",
        whyItWorks: "You agree with them, but you immediately out-frame them by stating your time is also limited. You trigger the Authority tripwire by taking control of the clock.",
        techniques: ["Father Frame", "Authority Tripwire", "Out-Framing"],
      },
      {
        id: "curious-guarded",
        title: "The Curious but Guarded Lead",
        trigger: "The lead is interested but defensive, expecting a hard pitch.",
        leadSays: "I saw your email. What exactly are you offering?",
        yourScript: "We provide premium, custom-branded merchandise and uniforms for companies that want to elevate their brand perception. But to be completely transparent, I don't know if we are the right fit for you yet. Tell me, what is the biggest frustration you currently have with how your team's gear looks or how it's being supplied?",
        whyItWorks: "You use the Walk Away technique. By stating you might not be a fit, you lower their guard entirely. You then pivot immediately to diagnosing their pain point.",
        techniques: ["Walk Away", "Disqualification", "Pain Discovery"],
      },
      {
        id: "send-info",
        title: "The Just Send Me Info Lead",
        trigger: "The lead wants to end the call quickly by asking for an email.",
        leadSays: "Can you just email me some pricing and a catalog?",
        yourScript: "I can absolutely send that over. However, our catalog has over two dozen premium items, and I don't want to flood your inbox with things that aren't relevant to your specific team. If you have 60 seconds right now, tell me what your primary goal is for your next merchandise order, and I'll send you a custom breakdown that actually respects your time.",
        whyItWorks: "You agree to their request but reframe the conversation around their convenience, forcing them to engage and reveal their needs.",
        techniques: ["Reframe", "Convenience Anchoring", "Need Discovery"],
      },
    ],
  },
  {
    id: "stage-2",
    number: 2,
    title: "Emotional Resistance",
    subtitle: "Clients enter calls with emotional baggage from previous bad experiences. Disarm the emotion before you can sell the solution.",
    scripts: [
      {
        id: "angry-lead",
        title: "The Angry or Confrontational Lead",
        trigger: "The lead is aggressive, perhaps due to a bad experience with a previous supplier or general stress.",
        leadSays: "Every supplier promises 4 weeks and it always takes 10. Why should I believe you?",
        yourScript: "You have every right to be frustrated. If I were in your position and had been burned like that, I would be asking the exact same question. The reality is, the industry is full of people who over-promise. We operate differently. We don't begin production until you sign off on the physical sample, and our 4 to 6 week timeline is guaranteed from that exact moment. If that level of certainty is what you need, we can proceed. If not, I completely understand.",
        delivery: "Do not get defensive. Lower your voice slightly.",
        whyItWorks: "You validate their anger without accepting blame. You use the Father Frame to remain completely unaffected by their aggression, which forces them to calm down to match your state (Social Resonance).",
        techniques: ["Validation", "Father Frame", "Social Resonance"],
      },
      {
        id: "happy-supplier",
        title: "The Happy with Current Supplier Lead",
        trigger: "The lead is complacent and doesn't see a reason to change.",
        leadSays: "We've used the same guy for five years. We're happy.",
        yourScript: "That is excellent. Loyalty to a good supplier is rare and valuable. I would never ask you to replace a vendor who is taking perfect care of you. However, many of our top clients keep us on file as their premium backup for when their primary supplier drops the ball on a critical, high-stakes order. Would you be opposed to me sending over our catalog just so you have a premium option in your back pocket?",
        whyItWorks: "You don't attack their current supplier (which would cause them to defend their choice). You agree, validate them, and position yourself as the high-status backup. Would you be opposed is a behavioral trick: people naturally prefer to say no, so you frame the question so that no means yes, send it.",
        techniques: ["No-Means-Yes", "Position as Backup", "Validation"],
      },
      {
        id: "analytical-skeptical",
        title: "The Overly Analytical or Skeptical Lead",
        trigger: "The lead demands exact specifications, fabric weights, and micro-details before committing.",
        leadSays: "I need to know the exact GSM of the cotton and the specific sublimation process you use before we even talk about an order.",
        yourScript: "I appreciate your attention to detail; it shows you care about what your team wears. The cotton is a premium 180 GSM, and we use a high-heat dye sublimation process that guarantees the logo will never crack or fade. But let me ask you this: beyond the technical specs, what is the ultimate feeling you want your staff to have when they put this gear on every morning?",
        whyItWorks: "You satisfy their need for Certainty with facts, but immediately pivot the conversation back to the emotional driver (Significance and Pride), preventing the call from becoming a sterile technical debate.",
        techniques: ["Certainty Anchor", "Emotional Pivot", "Significance Trigger"],
      },
    ],
  },
  {
    id: "stage-3",
    number: 3,
    title: "Price Resistance",
    subtitle: "Price objections are rarely about the actual money. They are about a lack of perceived value or a fear of making a mistake.",
    scripts: [
      {
        id: "too-high",
        title: "The Your Price is Too High Objection",
        trigger: "The lead likes the product but balks at the invoice total.",
        leadSays: "R45,000 is way more than we budgeted for this. We can get it cheaper down the road.",
        yourScript: "You absolutely can get it cheaper down the road. And if the primary goal is just to put shirts on backs as cheaply as possible, you should go with them. But earlier, you told me that your executive team needs to look like industry leaders at the upcoming expo. If we cut the budget, we cut the quality of the fabric and the precision of the branding. Are you comfortable sacrificing that premium first impression just to save a few thousand rand today?",
        whyItWorks: "Cognitive Dissonance. You force their desire for a cheap price to collide violently with their desire for high status. You make them choose between being cheap and being perceived as a leader.",
        techniques: ["Cognitive Dissonance", "Status Pressure", "Stated-Goal Recall"],
      },
      {
        id: "need-discount",
        title: "The I Need a Discount Lead",
        trigger: "The lead is a grinder who always asks for a better deal.",
        leadSays: "Come on, you can do better than that. Give me 10% off and we have a deal.",
        yourScript: "I appreciate you asking, but the price is exactly what is on the invoice. That covers the premium materials, the custom sublimation, and the insured delivery. We don't inflate our prices just to offer fake discounts later. The total is R45,000. How would you like to handle the payment?",
        delivery: "Perfectly still, no hesitation.",
        whyItWorks: "The Innocence Signal. You state the fact calmly and pivot immediately to the close. You do not justify, you do not apologize.",
        techniques: ["Innocence Signal", "Father Frame", "Assumptive Pivot"],
      },
      {
        id: "no-upfront",
        title: "The We Don't Pay 100% Upfront Lead",
        trigger: "The lead is accustomed to paying deposits and pushes back on the full payment requirement.",
        leadSays: "We don't pay 100% upfront for anything. We can do a 50% deposit now and 50% on delivery.",
        yourScript: "I completely understand that is how many standard vendors operate. Because we are producing premium, custom-branded merchandise specifically tailored to your exact specifications, our policy is 100% payment upfront to initiate the production run. This ensures there are zero delays in sourcing the raw materials and securing your spot in the production queue. Once that is cleared, we move straight to the physical sample approval. I'll send the invoice over now so we can get this moving.",
        whyItWorks: "You frame the 100% upfront payment not as a demand but as a necessary mechanism to guarantee their speed and quality. You use the Father Frame to hold the boundary without being aggressive.",
        techniques: ["Boundary Framing", "Father Frame", "Mechanism Reframe"],
      },
    ],
  },
  {
    id: "stage-4",
    number: 4,
    title: "Stalling & The Close",
    subtitle: "The hardest part of the sale is when the client agrees in principle but refuses to take the final action.",
    scripts: [
      {
        id: "think-about-it",
        title: "The I Need to Think About It Lead",
        trigger: "The lead is uncertain and wants to delay the decision.",
        leadSays: "This all looks great. Let me think about it and get back to you next week.",
        yourScript: "I completely understand taking time to review it. Usually, when my clients say they need to think about it, it means one of two things: either the price is a concern, or they aren't fully convinced the quality will match their expectations. Just between us, which one is it for you?",
        whyItWorks: "You call out the stall. I need to think about it is a polite lie. By giving them two specific options, you force them to reveal the actual objection so you can handle it.",
        techniques: ["Stall Disarm", "False Choice", "Objection Surfacing"],
      },
      {
        id: "talk-to-boss",
        title: "The I Need to Talk to My Partner or Boss Lead",
        trigger: "The lead lacks the authority or courage to pull the trigger alone.",
        leadSays: "I love it, but I need to run this past the CEO before I can sign off.",
        yourScript: "That makes perfect sense; the CEO should absolutely be in the loop on an investment like this. Let me ask you this: if the CEO looks at this and says, What do you think we should do?, what are you going to tell them? [Wait for them to commit verbally, then say:] Great. Let's get the invoice generated now so you have the exact figures to show them, and we can finalize it tomorrow.",
        whyItWorks: "You force them to verbally commit to the product. If they say I'll tell them we should do it, they have just sold themselves to themselves.",
        techniques: ["Verbal Commitment", "Self-Sell", "Future-Pacing"],
      },
      {
        id: "next-quarter",
        title: "The Call Me Back Next Quarter Lead",
        trigger: "The lead tries to push the timeline far into the future.",
        leadSays: "We definitely want to do this, but our budget is tight right now. Call me back in three months.",
        yourScript: "I can certainly do that. But keep in mind, our production timeline is 4 to 6 weeks after sample approval. If we wait three months just to start the conversation, your team won't have this gear for nearly half the year. If having your team look professional is a priority, we should secure your production slot now. Should we go ahead and get the initial invoice processed so we don't lose any more time?",
        whyItWorks: "You use urgency and timeline reality to create Cognitive Dissonance. If they truly want the gear, waiting makes no logical sense.",
        techniques: ["Urgency", "Cognitive Dissonance", "Timeline Math"],
      },
      {
        id: "assumptive-close",
        title: "The Assumptive Close (Ideal Scenario)",
        trigger: "The lead has agreed to the terms and the objections are handled.",
        leadSays: "Everything looks good.",
        yourScript: "Excellent. Based on everything we've discussed, the olive green soft shells and the travel bags are the perfect fit for your team. The next step is for me to generate the invoice for the full payment. Once that clears, we move straight into the final sample approval, and production begins. I will send that over to your email right now. Should I CC your accounts department on that invoice?",
        whyItWorks: "You do not ask for the sale. You assume the sale is complete and you outline the logistical next steps. You end with a minor logistical question (Should I CC accounts?) which, when answered, confirms the entire deal.",
        techniques: ["Assumptive Close", "Logistical Pivot", "Micro-Commitment"],
      },
    ],
  },
];

export const allScripts: Script[] = stages.flatMap((s) => s.scripts);
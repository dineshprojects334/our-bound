import { SiteConfig } from '../types';

export const initialSiteConfig: SiteConfig = {
  recipientName: "Yashi",
  senderName: "Un Eruma 🫂",
  theme: {
    hotPink: "#FF4F9A",
    blushPink: "#FFE4EF",
    rose: "#E91E63",
    lavender: "#B8A4FF",
    purple: "#8067D8",
    midnightPlum: "#24142F",
  },
  login: {
    headline: "A Little World Made Just for You ❤️",
    subtitle: "Only one special person belongs here...",
    usernamePlaceholder: "Enter your name / nickname...",
    passwordPlaceholder: "Secret password / your birthdate...",
    unlockButtonText: "Unlock My World 💗",
    validUsernames: [],
    validPasscodes: [],
    hintText: "💡 Use the private credentials provided for this birthday world.",
  },
  questions: [
    {
      id: "q1",
      order: 1,
      question: "Hey loosu 😂❤️ unakku theriyuma, nee en life-la evlo special-nu?",
      options: [
        {
          id: "q1-opt1",
          text: "Theriyum 😌💗",
          feedback: "Awww, appadi dhaan irukkanum! 💗 Romba over-ah scene poda maata la?",
        },
        {
          id: "q1-opt2",
          text: "Illa, nee sollu 🥹",
          feedback: "Seri seri, innum konjam surprise irukku! 🥹 Porumaiya paaru!",
        },
        {
          id: "q1-opt3",
          text: "Naan avlo special-ah? 👀",
          feedback: "Special mattuma? En life-la irukkura number one certified loosu nee dhaan! 💖",
        },
      ],
      onAnswerMessage: "Adhaane paathen! Ipdi dhaan start aaganum! 🥹✨",
    },
    {
      id: "q2",
      order: 2,
      question: "Namma rendu perum serndha summa iruppoma illa world-ah torture pannuvoma? 😭😂",
      options: [
        {
          id: "q2-opt1",
          text: "World dhaan paavam 🤣",
          feedback: "Unmaiye adhu dhaan! Namma combo-va paathu naalu per odi poiduvaanga! 🤣",
        },
        {
          id: "q2-opt2",
          text: "Nee dhaan torture pannuva 😏",
          feedback: "Ennaya solra?! Nee panna mokka comedy-ku naan dhaan thaangitu irukken! 😜",
        },
        {
          id: "q2-opt3",
          text: "Rendu perum ore piece 😂",
          feedback: "Aama! Two bodies, one single chaotic brain cell roaming around! 🧠✨",
        },
      ],
      onAnswerMessage: "Pure unadulterated chaos combo forever! 💥😂",
    },
    {
      id: "q3",
      order: 3,
      question: "Namma spend panna moments-la unakku romba favourite memory edhu? 🫶",
      options: [
        {
          id: "q3-opt1",
          text: "Namma sirichu sirichu setha moments 😂",
          feedback: "Vayiru valikkira alavukku sirichadhellam eppovume golden memories! 🫶",
        },
        {
          id: "q3-opt2",
          text: "Namma pesuna late-night conversations 🌙",
          feedback: "Late night-la namma pesuna endless topics... eppovume peace vibe! ✨",
        },
        {
          id: "q3-opt3",
          text: "Ellame special dhaan ❤️",
          feedback: "Awww! Enakkum appadi dhaan... every single moment counts! 🫂",
        },
      ],
      onAnswerMessage: "Idhellam thirumba nenachaale sirippu varudhu la? 😂💗",
    },
    {
      id: "q4",
      order: 4,
      question: "Unakku edhavadhu kashtam-na, naan un kooda iruppen-nu namburiya? 🫂",
      options: [
        {
          id: "q4-opt1",
          text: "Kandippa 🥹❤️",
          feedback: "En kooda irukkum bothu unakku entha kavalaiyum venaam! 🫂",
        },
        {
          id: "q4-opt2",
          text: "Nee enna vittutu poga maata 💗",
          feedback: "Poga vida maaten, pogavum maaten! Podhum-aa? 🥹",
        },
        {
          id: "q4-opt3",
          text: "Enakku theriyum, loosu 🫂",
          feedback: "Nee kekaamalaye naan un back-la nilluven eppovume! 🛡️❤️",
        },
      ],
      onAnswerMessage: "Happy-ah irundhaalum, kashtama irundhaalum, un friendship enakku romba mukkiyam. ❤️",
    },
    {
      id: "q5",
      order: 5,
      question: "Ippo irukkura indha bond, years aanaalum same-ah maintain pannuvoma? 🥹💗",
      options: [
        {
          id: "q5-opt1",
          text: "Eppovume da! ❤️",
          feedback: "Appo 80 vayasu aanaalum ipdi dhaan thalaila kottuvom! 👵👴✨",
        },
        {
          id: "q5-opt2",
          text: "Time dhaan maarum, bond illa 🫂",
          feedback: "Hundred percent true! Namma vibe maaraave maaraadhu! 🌟",
        },
        {
          id: "q5-opt3",
          text: "Unna vida maaten, loosu 😭💖",
          feedback: "Naanum vida maaten! You're stuck with me for life! 🔒💖",
        },
      ],
      onAnswerMessage: "Indha bond eppovume unshakeable da! 🔐💗",
    },
    {
      id: "q6",
      order: 6,
      question: "Oru question kekkava? Indha friendship-la irundhu, namma life long best friends-ah iruppiya? 🫂❤️♾️",
      allowEscapeNo: true,
      options: [
        {
          id: "q6-yes",
          text: "Aama da, life long! ♾️",
          isYes: true,
          feedback: "Idhu dhaan da correct answer! Nee thappa choose panna kooda vida maaten! 🥹❤️",
        },
        {
          id: "q6-no",
          text: "Illa da 🙈",
          isYes: false,
          feedback: "Escape aaga try pannatha loosu! 😂",
        },
      ],
      customTease: [
        "Adei! Enna yosichu NO press panra? 😭",
        "Namma bond-ah ivlo easy-ah escape panna mudiyaadhu! 😂❤️",
        "Hehe, try again eruma! 😜💗",
        "NO button-la kai vekkave mudiyaadhu da loosu! 🏃‍♀️💨",
        "Aha! You have no choice, YES mattum dhaan valid! 🥰✨",
      ],
      onAnswerMessage: "Life evlo busy aanaalum, namma bond-ah maintain pannuvom nu namburen. Nee enakku romba special ❤️",
    },
    {
      id: "q7",
      order: 7,
      question: "Seri eruma, un birthday-ku naan oru chinna surprise ready pannirukken... paakka ready-ah? 👀💌",
      options: [
        {
          id: "q7-opt1",
          text: "Seekiram kaattu! 😭❤️",
          feedback: "Aha! Poruma illa pola! Ippove kaatren! 🎁✨",
        },
        {
          id: "q7-opt2",
          text: "Enakku surprise-na romba pudikkum! 🎁",
          feedback: "Idhu unakku kandippa romba pudikkum! Ready-ah iru! 💖",
        },
        {
          id: "q7-opt3",
          text: "Enna pannirukka nu theriyanum! 🥹",
          feedback: "Namma memories and warm wishes... get ready to smile! 🥹❤️",
        },
      ],
      onAnswerMessage: "Hold your breath... A magical surprise is loading for you! ✨💖",
    },
  ],
  transition: {
    title: "Yayyy! Nee vandhuta! 🥹💖",
    subtitle: "Ippo namma beautiful memories-ah paakkalama? 📸❤️",
    buttonText: "Open Our Memories 💗",
  },
  memoriesHeader: {
    heading: "Namma Little Collection of Memories 💗",
    subtitle: "Namma ovvoru photo-kum oru story irukku... ovvoru story-yum enakku special. 🫂",
    ctaButtonText: "Oru Chinna Vishayam Sollava? 💌",
  },
  memories: [
    {
      id: "mem-1",
      image: "/photo1.jpg",
      title: "Andha Naal Semma Special ❤️",
      description: "Indha photo-va paakkumbodhellam enakku sirippu vandhudum. Andha chinna moment kooda ippo oru beautiful memory-ah irukku. Innum neraya memories create pannanum! 🥹💗",
      date: "Special Day ✨",
      location: "Our Favourite Spot 📍",
      sticker: "🌟 Eruma Vibe",
      rotation: -2,
    },
    {
      id: "mem-2",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80",
      title: "Candid Sirippu Moments 😂",
      description: "Edho random mokka joke-ku namma sirichu sirichu kitta irundha ellarum paathanga! Indha natural smile eppovume un mookula irukkanum da loosu! 💖",
      date: "Unlimited Fun 💫",
      location: "Everyday Hangout ☕",
      sticker: "😂 Certified Loosu",
      rotation: 3,
    },
    {
      id: "mem-3",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
      title: "Selfie Star Mode 📸",
      description: "100 photo eduthu 'idhu nallaa illa, adhu nallaa illa' nu delete panni kadasiya select panna masterpiece! You always look amazing da! 🌸",
      date: "Golden Hour ☀️",
      location: "Snap Time 🤳",
      sticker: "✨ Queen Vibe",
      rotation: -1,
    },
    {
      id: "mem-4",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80",
      title: "Late Night Heart-to-Heart 🌙",
      description: "Life, future, dreams pathi namma pesuna deep conversations. En kashtatha un kitta share panna dhaan manasu leysaagum. Thanks for always listening. 🫂",
      date: "Midnight Talks 🌌",
      location: "Deep Thoughts Corner 💭",
      sticker: "🫂 Safe Place",
      rotation: 2,
    },
    {
      id: "mem-5",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80",
      title: "The Unstoppable Chaos Trio/Duo 💥",
      description: "Namma plan pannale edhavadhu twist varum, aana andha twist kooda semma jolly-ah mudiyum. Life is never boring with you around! 🚀",
      date: "Adventure Day 🎒",
      location: "Everywhere We Go 🗺️",
      sticker: "🔥 Chaos Partner",
      rotation: -3,
    },
    {
      id: "mem-6",
      image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1000&q=80",
      title: "Friendship for Infinity ♾️",
      description: "No matter how old we get, no matter where life takes us, we will always be each other's person. Here's to forever eruma combo! 🥂💗",
      date: "Always & Forever ♾️",
      location: "In Our Hearts ❤️",
      sticker: "❤️ Life Long Bond",
      rotation: 1,
    },
  ],

  // ── Photo Gallery ────────────────────────────────────────────────────────────
  // Drop your photos into public/gallery/ and add entries here.
  // src format: "/gallery/your-photo-name.jpg"
  galleryPhotos: [
    // Photos will be added here once the folder is shared!
    // Example:
    // { id: "g1", src: "/gallery/photo1.jpg", caption: "Namma best day 💗" },
  ],

  letter: {
    heading: "Oru Chinna Vishayam Sollava? 💌",
    subtitle: "Unakku sollanum-nu nenacha sila vishayangal irukku...",
    envelopeSealText: "TAP TO OPEN 💌",
    paragraphs: [
      "Hey loosu ❤️",
      "Un kooda pesura random conversations, namma mokka jokes, sirippu, sanda, samadhaanam — idhellame enakku romba special.",
      "Nee en life-la irukkuradhu enakku happy-ah irukku. Life-la evlo changes vandhaalum, namma friendship-ah marakkaama, mudinja varaikkum indha bond-ah maintain pannanum nu aasai.",
      "Unakku eppovume happiness kidaikkanum. Un dreams ellame nalla nadakkanum.",
      "Happy Birthday, en favourite eruma! 🥹❤️",
      "Innum neraya memories create pannuvom. Life long eruma-vaave iruppom! 🫂♾️",
    ],
    signOff: "With endless love & friendship,\nUn Eruma Forever 💖",
    buttonText: "Innum Oru Surprise Irukku ✨",
  },
  celebration: {
    recipientName: "Yashi",
    heroPhoto: "/birthday-kid.png",
    mainHeadline: "HAPPIEST BIRTHDAY, EN FAVOURITE LOOSU! 🎂❤️",
    supportingMessage: "Un life full-ah happiness, success, sirippu, beautiful memories ellame niraiya irukkanum. Eppovume happy-ah iru da! 🫂💗",
    makeAWishButtonText: "Make a Wish ✨",
    revealedWishMessage: "Candles blown! May all your secret wishes & big dreams come true this year! 🌟🎂✨",
    finalMessage: "Nee oru special person . Adha eppovume marandhuraadha! ❤️♾️",
    replayButtonText: "Thirumba Namma Memories Paakkalama? ↺",
  },
};

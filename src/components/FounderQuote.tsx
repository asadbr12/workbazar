"use client";

import { useEffect, useState } from "react";

const QUOTES: { en: string; hi: string }[] = [
  { en: "Hard work never goes unnoticed.", hi: "मेहनत कभी बेकार नहीं जाती।" },
  { en: "Every skill has value — every worker deserves respect.", hi: "हर हुनर की कीमत है — हर मज़दूर का सम्मान ज़रूरी है।" },
  { en: "Trust is built one job at a time.", hi: "भरोसा एक-एक काम से बनता है।" },
  { en: "Small work, done right, builds a big reputation.", hi: "छोटा काम भी सही ढंग से बड़ी पहचान बनाता है।" },
  { en: "Your nearest worker could be your next success story.", hi: "आपका सबसे पास का वर्कर ही आपकी अगली सफलता हो सकता है।" },
  { en: "Skilled hands build a stronger India.", hi: "कुशल हाथ मज़बूत भारत बनाते हैं।" },
  { en: "Quality work, fair price — that's a promise.", hi: "अच्छा काम, सही दाम — यही वादा है।" },
  { en: "Every job done well opens the next door.", hi: "हर अच्छा किया काम अगला दरवाज़ा खोलता है।" },
  { en: "Local talent, just a call away.", hi: "स्थानीय हुनर, बस एक कॉल दूर।" },
  { en: "We don't just connect people — we build trust.", hi: "हम सिर्फ़ लोगों को नहीं जोड़ते — भरोसा बनाते हैं।" },
];

export default function FounderQuote() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % QUOTES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const current = QUOTES[index];

  return (
    <div key={index} className="animate-fade-in text-center">
      <p className="text-xs font-bold italic leading-snug text-gray-700 sm:text-sm">
        &ldquo;{current.en}&rdquo;
      </p>
      <p className="mt-1.5 pt-0.5 text-xs font-bold italic leading-[1.7] text-gray-600 sm:text-sm">
        &ldquo;{current.hi}&rdquo;
      </p>
    </div>
  );
}

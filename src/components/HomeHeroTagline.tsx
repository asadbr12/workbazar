"use client";

import { useEffect, useState } from "react";

const TAGLINES: { en: string; hi: string }[] = [
  {
    en: "Midnight pipe burst? Get a plumber in 20 minutes — just call ALWorkBazar.",
    hi: "आधी रात पाइप फट गया? 20 मिनट में प्लंबर — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Power gone, fuse blown? An electrician is minutes away on ALWorkBazar.",
    hi: "बिजली गई, फ्यूज़ उड़ा? ALWorkBazar पर इलेक्ट्रीशियन बस कुछ मिनट दूर।",
  },
  {
    en: "Broken door, loose hinge? Find a trusted carpenter near you, today.",
    hi: "टूटा दरवाज़ा, ढीला कब्ज़ा? आज ही अपने पास भरोसेमंद बढ़ई पाएं।",
  },
  {
    en: "Fresh coat, fresh home — book a painter near you in seconds.",
    hi: "नया रंग, नया घर — सेकंडों में पास का पेंटर बुक करें।",
  },
  {
    en: "Building or repairing? Skilled masons near you, ready to work.",
    hi: "निर्माण या मरम्मत? कुशल राजमिस्त्री आपके पास, काम के लिए तैयार।",
  },
  {
    en: "Car won't start? A nearby mechanic is just one call away.",
    hi: "गाड़ी स्टार्ट नहीं हो रही? पास का मैकेनिक बस एक कॉल दूर।",
  },
  {
    en: "Need a driver for the day or a long trip? Find one near you now.",
    hi: "दिन भर या सफ़र के लिए ड्राइवर चाहिए? अभी अपने पास ढूंढें।",
  },
  {
    en: "Guests tonight, no time to cook? A cook is just a call away.",
    hi: "आज मेहमान, खाना बनाने का समय नहीं? कुक बस एक कॉल दूर।",
  },
  {
    en: "Home needs a deep clean? Book trusted help near you today.",
    hi: "घर की गहरी सफ़ाई चाहिए? आज ही पास में भरोसेमंद मदद बुक करें।",
  },
  {
    en: "Wedding, party, or just because — a beautician near you, ready.",
    hi: "शादी, पार्टी या यूं ही — पास की ब्यूटीशियन तैयार।",
  },
  {
    en: "Need reliable security today? Find a trained guard near you.",
    hi: "आज ही भरोसेमंद सुरक्षा चाहिए? पास का प्रशिक्षित गार्ड ढूंढें।",
  },
  {
    en: "Garden gone wild? A gardener near you can fix it today.",
    hi: "बगीचा बेतरतीब हो गया? पास का माली आज ही ठीक करेगा।",
  },
  {
    en: "Torn seam, new fitting? A tailor near you, ready to stitch.",
    hi: "फटी सिलाई, नई फिटिंग? पास का दर्ज़ी, सिलने को तैयार।",
  },
  {
    en: "Need extra hands for the day? Find labour near you, fast.",
    hi: "आज के लिए मदद चाहिए? पास में मज़दूर तुरंत पाएं।",
  },
  {
    en: "Exams near, need a tutor? Find a teacher near you tonight.",
    hi: "परीक्षा नज़दीक, ट्यूटर चाहिए? आज रात ही पास का शिक्षक पाएं।",
  },
];

export default function HomeHeroTagline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % TAGLINES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = TAGLINES[index];

  return (
    <div key={index} className="animate-fade-in">
      <h1 className="text-[clamp(1.4rem,4vh,2.7rem)] font-extrabold leading-[1.15] tracking-tight text-gray-900">
        {current.en}
      </h1>
      <p className="mt-[0.5vh] text-[clamp(1.15rem,2.9vh,2rem)] font-extrabold leading-[1.15] tracking-tight text-gray-900">
        {current.hi}
      </p>
    </div>
  );
}

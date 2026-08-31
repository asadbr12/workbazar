"use client";

import { useEffect, useState } from "react";

const TAGLINES: { en: string; hi: string }[] = [
  {
    en: "Midnight pipe burst? Get a plumber in 20 minutes — just call ALWorkBazar.",
    hi: "आधी रात पाइप फट गया? 20 मिनट में प्लंबर — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Power gone, fuse blown? Get an electrician in 20 minutes — just call ALWorkBazar.",
    hi: "बिजली गई, फ्यूज़ उड़ा? 20 मिनट में इलेक्ट्रीशियन — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Broken door, loose hinge? Get a carpenter in 20 minutes — just call ALWorkBazar.",
    hi: "टूटा दरवाज़ा, ढीला कब्ज़ा? 20 मिनट में बढ़ई — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Fresh coat, fresh home? Get a painter in 20 minutes — just call ALWorkBazar.",
    hi: "नया रंग, नया घर चाहिए? 20 मिनट में पेंटर — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Building or repairing? Get a mason in 20 minutes — just call ALWorkBazar.",
    hi: "निर्माण या मरम्मत करानी है? 20 मिनट में राजमिस्त्री — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Car won't start? Get a mechanic in 20 minutes — just call ALWorkBazar.",
    hi: "गाड़ी स्टार्ट नहीं हो रही? 20 मिनट में मैकेनिक — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Need a driver today? Get one in 20 minutes — just call ALWorkBazar.",
    hi: "आज ड्राइवर चाहिए? 20 मिनट में मिलेगा — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Guests tonight, no time to cook? Get a cook in 20 minutes — just call ALWorkBazar.",
    hi: "आज मेहमान, खाना बनाने का समय नहीं? 20 मिनट में कुक — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Home needs a deep clean? Get help in 20 minutes — just call ALWorkBazar.",
    hi: "घर की गहरी सफ़ाई चाहिए? 20 मिनट में मदद — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Wedding or party today? Get a beautician in 20 minutes — just call ALWorkBazar.",
    hi: "आज शादी या पार्टी है? 20 मिनट में ब्यूटीशियन — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Need reliable security today? Get a guard in 20 minutes — just call ALWorkBazar.",
    hi: "आज भरोसेमंद सुरक्षा चाहिए? 20 मिनट में गार्ड — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Garden gone wild? Get a gardener in 20 minutes — just call ALWorkBazar.",
    hi: "बगीचा बेतरतीब हो गया? 20 मिनट में माली — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Torn seam, new fitting? Get a tailor in 20 minutes — just call ALWorkBazar.",
    hi: "फटी सिलाई, नई फिटिंग चाहिए? 20 मिनट में दर्ज़ी — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Need extra hands today? Get labour in 20 minutes — just call ALWorkBazar.",
    hi: "आज मदद चाहिए? 20 मिनट में मज़दूर — बस ALWorkBazar को कॉल करें।",
  },
  {
    en: "Exams near, need a tutor? Get one in 20 minutes — just call ALWorkBazar.",
    hi: "परीक्षा नज़दीक, ट्यूटर चाहिए? 20 मिनट में मिलेगा — बस ALWorkBazar को कॉल करें।",
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
    <div>
      <div key={index} className="animate-fade-in">
        <h1 className="line-clamp-2 min-h-[2.75rem] text-base font-extrabold leading-snug tracking-tight text-gray-900 sm:min-h-[4.2rem] sm:text-2xl">
          {current.en}
        </h1>
        <p className="mt-2 line-clamp-2 min-h-[3rem] pt-1 text-sm font-extrabold leading-[1.7] tracking-tight text-blue-600 sm:mt-3 sm:min-h-[4.2rem] sm:text-xl">
          {current.hi}
        </p>
      </div>
    </div>
  );
}

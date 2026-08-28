import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AVATAR_COLORS = ["2563EB", "0891B2", "7C3AED", "DB2777", "059669", "D97706", "DC2626", "4F46E5"];

function avatarDataUri(initials: string, seed: number) {
  const color = AVATAR_COLORS[seed % AVATAR_COLORS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="#${color}"/><text x="50" y="50" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

type DummyWorker = {
  phone: string;
  fullName: string;
  skills: string[];
  age: number;
  gender: "MALE" | "FEMALE";
  address: string;
  pincode: string;
  lat: number;
  lng: number;
  experienceYears: number;
  feePerDay: number;
  feePerHour: number;
  availability: "DAY" | "NIGHT" | "BOTH";
  rating: number;
  ratingCount: number;
};

const WORKERS: DummyWorker[] = [
  {
    phone: "7000000001",
    fullName: "Ramesh Kumar",
    skills: ["Electrician"],
    age: 34,
    gender: "MALE",
    address: "Karol Bagh, New Delhi",
    pincode: "110005",
    lat: 28.6519,
    lng: 77.1909,
    experienceYears: 10,
    feePerDay: 700,
    feePerHour: 90,
    availability: "BOTH",
    rating: 4.8,
    ratingCount: 24,
  },
  {
    phone: "7000000002",
    fullName: "Suresh Yadav",
    skills: ["Plumber"],
    age: 29,
    gender: "MALE",
    address: "Lajpat Nagar, New Delhi",
    pincode: "110024",
    lat: 28.5677,
    lng: 77.2431,
    experienceYears: 6,
    feePerDay: 600,
    feePerHour: 80,
    availability: "DAY",
    rating: 4.6,
    ratingCount: 15,
  },
  {
    phone: "7000000003",
    fullName: "Vikas Sharma",
    skills: ["Carpenter"],
    age: 41,
    gender: "MALE",
    address: "Dwarka Sector 12, New Delhi",
    pincode: "110078",
    lat: 28.5921,
    lng: 77.046,
    experienceYears: 15,
    feePerDay: 750,
    feePerHour: 100,
    availability: "DAY",
    rating: 4.9,
    ratingCount: 31,
  },
  {
    phone: "7000000004",
    fullName: "Anita Devi",
    skills: ["Cook"],
    age: 38,
    gender: "FEMALE",
    address: "Rohini Sector 7, New Delhi",
    pincode: "110085",
    lat: 28.7161,
    lng: 77.1198,
    experienceYears: 9,
    feePerDay: 500,
    feePerHour: 70,
    availability: "DAY",
    rating: 4.7,
    ratingCount: 19,
  },
  {
    phone: "7000000005",
    fullName: "Manoj Singh",
    skills: ["Driver"],
    age: 33,
    gender: "MALE",
    address: "Saket, New Delhi",
    pincode: "110017",
    lat: 28.5245,
    lng: 77.2066,
    experienceYears: 8,
    feePerDay: 650,
    feePerHour: 85,
    availability: "BOTH",
    rating: 4.5,
    ratingCount: 11,
  },
  {
    phone: "7000000006",
    fullName: "Pooja Verma",
    skills: ["Housekeeping"],
    age: 27,
    gender: "FEMALE",
    address: "Vasant Kunj, New Delhi",
    pincode: "110070",
    lat: 28.5244,
    lng: 77.1588,
    experienceYears: 5,
    feePerDay: 450,
    feePerHour: 60,
    availability: "DAY",
    rating: 4.4,
    ratingCount: 8,
  },
  {
    phone: "7000000007",
    fullName: "Dr. Ravi Gupta",
    skills: ["Doctor"],
    age: 45,
    gender: "MALE",
    address: "Connaught Place, New Delhi",
    pincode: "110001",
    lat: 28.6315,
    lng: 77.2167,
    experienceYears: 18,
    feePerDay: 2500,
    feePerHour: 400,
    availability: "BOTH",
    rating: 4.9,
    ratingCount: 42,
  },
  {
    phone: "7000000008",
    fullName: "Neeraj Malhotra",
    skills: ["Accountant"],
    age: 36,
    gender: "MALE",
    address: "Nehru Place, New Delhi",
    pincode: "110019",
    lat: 28.5487,
    lng: 77.2519,
    experienceYears: 12,
    feePerDay: 1200,
    feePerHour: 180,
    availability: "DAY",
    rating: 4.6,
    ratingCount: 17,
  },
  {
    phone: "7000000009",
    fullName: "Sunita Rani",
    skills: ["Math Teacher"],
    age: 32,
    gender: "FEMALE",
    address: "Pitampura, New Delhi",
    pincode: "110034",
    lat: 28.6998,
    lng: 77.1314,
    experienceYears: 7,
    feePerDay: 900,
    feePerHour: 150,
    availability: "DAY",
    rating: 4.8,
    ratingCount: 22,
  },
  {
    phone: "7000000010",
    fullName: "Arjun Mehta",
    skills: ["English Teacher"],
    age: 30,
    gender: "MALE",
    address: "Janakpuri, New Delhi",
    pincode: "110058",
    lat: 28.6219,
    lng: 77.0878,
    experienceYears: 6,
    feePerDay: 850,
    feePerHour: 140,
    availability: "BOTH",
    rating: 4.5,
    ratingCount: 13,
  },
  {
    phone: "7000000011",
    fullName: "Deepak Chauhan",
    skills: ["Painter"],
    age: 39,
    gender: "MALE",
    address: "Mayur Vihar, New Delhi",
    pincode: "110091",
    lat: 28.6089,
    lng: 77.2957,
    experienceYears: 13,
    feePerDay: 600,
    feePerHour: 80,
    availability: "DAY",
    rating: 4.7,
    ratingCount: 20,
  },
  {
    phone: "7000000012",
    fullName: "Kavita Joshi",
    skills: ["Beautician"],
    age: 26,
    gender: "FEMALE",
    address: "Preet Vihar, New Delhi",
    pincode: "110092",
    lat: 28.6357,
    lng: 77.295,
    experienceYears: 4,
    feePerDay: 550,
    feePerHour: 90,
    availability: "BOTH",
    rating: 4.6,
    ratingCount: 9,
  },
];

const DUMMY_RECRUITERS = [
  {
    phone: "7100000001",
    fullName: "Sample Recruiter One",
    officeAddress: "Green Park, New Delhi",
    pincode: "110016",
    lat: 28.5586,
    lng: 77.2064,
  },
  {
    phone: "7100000002",
    fullName: "Sample Recruiter Two",
    officeAddress: "Model Town, New Delhi",
    pincode: "110009",
    lat: 28.7107,
    lng: 77.1917,
  },
];

async function main() {
  console.log("Seeding dummy workers…");

  const recruiterIds: string[] = [];
  for (const r of DUMMY_RECRUITERS) {
    const user = await prisma.user.upsert({
      where: { phone: r.phone },
      create: { phone: r.phone, role: "RECRUITER" },
      update: {},
    });
    await prisma.recruiterProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: r.fullName,
        officeAddress: r.officeAddress,
        pincode: r.pincode,
        lat: r.lat,
        lng: r.lng,
      },
      update: {},
    });
    recruiterIds.push(user.id);
  }

  let i = 0;
  for (const w of WORKERS) {
    i++;
    const initials = w.fullName
      .replace(/^Dr\.\s*/, "")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const user = await prisma.user.upsert({
      where: { phone: w.phone },
      create: { phone: w.phone, role: "WORKER" },
      update: {},
    });

    await prisma.workerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: w.fullName,
        age: w.age,
        gender: w.gender,
        address: w.address,
        pincode: w.pincode,
        lat: w.lat,
        lng: w.lng,
        photoUrl: avatarDataUri(initials, i),
        skills: w.skills,
        experienceYears: w.experienceYears,
        feePerDay: w.feePerDay,
        feePerHour: w.feePerHour,
        availability: w.availability,
        travelDistanceKm: 15,
      },
      update: {
        photoUrl: avatarDataUri(initials, i),
      },
    });

    await prisma.subscription.upsert({
      where: { id: `seed-sub-${user.id}` },
      create: {
        id: `seed-sub-${user.id}`,
        userId: user.id,
        amount: 99,
        status: "ACTIVE",
        paymentMethod: "SEED",
        transactionId: `SEED-${user.id}`,
        startDate: new Date(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      },
      update: {},
    });

    // Completed, rated bookings so search/directory show a real average rating.
    // rating is stored as an integer 1-5, so mix 5s and 4s to approximate the target average.
    const fiveStarCount = Math.round((w.rating - 4) * w.ratingCount);
    const ratingsSeq = [
      ...Array(fiveStarCount).fill(5),
      ...Array(w.ratingCount - fiveStarCount).fill(4),
    ];
    for (let n = 0; n < w.ratingCount; n++) {
      const recruiterId = recruiterIds[n % recruiterIds.length];
      const bookingId = `seed-booking-${user.id}-${n}`;
      await prisma.booking.upsert({
        where: { id: bookingId },
        create: {
          id: bookingId,
          recruiterId,
          workerId: user.id,
          skill: w.skills[0],
          status: "COMPLETED",
          rating: ratingsSeq[n],
          ratingComment: n === 0 ? "Great work, on time and professional." : null,
          ratedAt: new Date(),
        },
        update: {},
      });
    }

    console.log(`  ✓ ${w.fullName} (${w.skills.join(", ")})`);
  }

  console.log(`Done. Seeded ${WORKERS.length} workers and ${DUMMY_RECRUITERS.length} recruiters.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

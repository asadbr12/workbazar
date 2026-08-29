import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const verifyFirebaseTokenSchema = z.object({
  idToken: z.string().trim().min(1),
  role: z.enum(["WORKER", "RECRUITER"]).optional(),
});

export const workerRegistrationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  age: z.coerce.number().int().min(18, "Must be 18 or older").max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  address: z.string().trim().min(5).max(300),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  aadharNumber: z
    .string()
    .trim()
    .regex(/^\d{12}$/, "Aadhar number must be 12 digits")
    .optional()
    .or(z.literal("")),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  experienceYears: z.coerce.number().int().min(0).max(60),
  feePerDay: z.coerce.number().int().min(0).max(1000000).optional(),
  feePerHour: z.coerce.number().int().min(0).max(100000).optional(),
  availability: z.enum(["DAY", "NIGHT", "BOTH"]),
  travelDistanceKm: z.coerce.number().int().min(0).max(500),
  upiId: z.string().trim().max(100).optional().or(z.literal("")),
  accountNumber: z.string().trim().max(30).optional().or(z.literal("")),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  photoUrl: z.string().trim().min(1, "Please upload your photo").max(500),
});

export const recruiterRegistrationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  companyName: z.string().trim().max(150).optional().or(z.literal("")),
  businessType: z.string().trim().max(100).optional().or(z.literal("")),
  gstNumber: z.string().trim().max(20).optional().or(z.literal("")),
  officeAddress: z.string().trim().min(5).max(300),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  serviceAreas: z.array(z.string()).optional().default([]),
  workerTypesNeeded: z.array(z.string()).optional().default([]),
  budgetRange: z.string().trim().max(100).optional().or(z.literal("")),
  paymentTerms: z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY"]).optional(),
  upiId: z.string().trim().max(100).optional().or(z.literal("")),
  preferredPaymentMethod: z.string().trim().max(50).optional().or(z.literal("")),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  photoUrl: z.string().trim().max(500).optional().or(z.literal("")),
});

export const AVAILABILITY_LABELS: Record<string, string> = {
  DAY: "Day",
  NIGHT: "Night",
  BOTH: "Both Day & Night",
};

export const subscribeSchema = z.object({
  paymentMethod: z.enum(["CARD", "UPI", "QR"]),
});

export const createBookingSchema = z.object({
  workerUserId: z.string().min(1),
  skill: z.string().trim().min(1).max(60),
  destinationLat: z.coerce.number().min(-90).max(90).optional(),
  destinationLng: z.coerce.number().min(-180).max(180).optional(),
  destinationAddress: z.string().trim().max(300).optional().or(z.literal("")),
});

export const bookingLocationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const bookingStatusSchema = z.object({
  status: z.enum([
    "ACCEPTED",
    "DECLINED",
    "EN_ROUTE",
    "ARRIVED",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export const bookingRatingSchema = z.object({
  stars: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional().or(z.literal("")),
});

export const SKILL_GROUPS = [
  {
    slug: "skilled-trades",
    name: "Skilled Trades",
    nameHindi: "कुशल श्रमिक",
    skills: [
      "Carpenter",
      "Painter",
      "Electrician",
      "Mason",
      "Plumber",
      "Welder",
      "Mechanic",
      "General Labour",
    ],
  },
  {
    slug: "home-facility-services",
    name: "Home & Facility Services",
    nameHindi: "घरेलू व सुविधा सेवाएं",
    skills: [
      "Driver",
      "Housekeeping",
      "Security Guard",
      "Gardener",
      "Sweeper",
      "Cook",
      "Tailor",
      "Beautician",
    ],
  },
  {
    slug: "professionals",
    name: "Professionals",
    nameHindi: "पेशेवर",
    skills: [
      "Doctor",
      "Nurse",
      "Accountant",
      "Lawyer",
      "Engineer",
      "Architect",
      "Receptionist",
      "Office Assistant",
      "Data Entry Operator",
      "Delivery Boy",
      "Salesperson",
    ],
  },
  {
    slug: "teacher",
    name: "Teacher",
    nameHindi: "शिक्षक",
    skills: [
      "Math Teacher",
      "Science Teacher",
      "English Teacher",
      "Hindi Teacher",
      "Physics Teacher",
      "Chemistry Teacher",
      "Biology Teacher",
      "Computer Teacher",
      "History Teacher",
      "Geography Teacher",
      "Economics Teacher",
      "Commerce Teacher",
      "Accountancy Teacher",
      "Music Teacher",
      "Art Teacher",
      "Sports Teacher",
      "Sanskrit Teacher",
      "Social Studies Teacher",
    ],
  },
] as const;

export const SKILL_OPTIONS = SKILL_GROUPS.flatMap((group) => group.skills);

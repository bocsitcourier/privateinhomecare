export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
  icon: string;
}

export interface ServiceContent {
  key: string;
  title: string;
  tagline: string;
  heroDescription: string;
  overview: string;
  whoItHelps: string[];
  servicesIncluded: string[];
  caregiverStandards: string[];
  pricingInfo: string;
  coverageAreas: string[];
  benefits: ServiceBenefit[];
  faqs: ServiceFAQ[];
}

export const SERVICE_CONTENT: Record<string, ServiceContent> = {
  "personal-care": {
    key: "personal-care",
    title: "Personal Care Services",
    tagline: "Dignified Assistance for Daily Living",
    heroDescription: "Our certified Personal Care Assistants provide compassionate, hands-on support for activities of daily living, helping your loved ones maintain their independence and dignity at home.",
    overview: "Personal care services encompass a wide range of hands-on assistance designed to help individuals with activities of daily living (ADLs). Our trained caregivers provide respectful, dignified support that enables seniors and those with disabilities to remain safely in their homes. From bathing and grooming to mobility assistance and medication reminders, our PCAs are committed to enhancing quality of life while preserving independence.",
    whoItHelps: [
      "Seniors who need assistance with bathing, dressing, or grooming",
      "Individuals recovering from surgery or hospitalization",
      "People living with chronic conditions like arthritis or Parkinson's",
      "Those with mobility limitations requiring transfer assistance",
      "Individuals who need help with toileting and incontinence care",
      "Anyone requiring medication reminders and health monitoring"
    ],
    servicesIncluded: [
      "Bathing and showering assistance",
      "Dressing and grooming support",
      "Toileting and incontinence care",
      "Mobility and transfer assistance",
      "Medication reminders",
      "Vital signs monitoring",
      "Range of motion exercises",
      "Skin care and prevention of pressure sores",
      "Feeding assistance when needed",
      "Oral hygiene care"
    ],
    caregiverStandards: [
      "Minimum 2 years of personal care experience",
      "State-certified Personal Care Assistant (PCA) training",
      "CORI background check verified",
      "CPR and First Aid certified",
      "Trained in proper body mechanics and transfer techniques",
      "Ongoing education in dignity-preserving care practices",
      "Specialized training in dementia and cognitive care",
      "Regular performance evaluations and quality checks"
    ],
    pricingInfo: "Personal care services typically range from $28-$38 per hour depending on the level of care needed and scheduling requirements. We offer private pay options and work with long-term care insurance policies. Contact us for a free care assessment and personalized quote.",
    coverageAreas: [
      "Boston", "Cambridge", "Somerville", "Brookline", "Newton", "Quincy",
      "Worcester", "Springfield", "Lowell", "Brockton", "New Bedford", "Fall River",
      "All 14 Massachusetts counties"
    ],
    benefits: [
      { title: "Maintain Independence", description: "Stay in the comfort of your own home while receiving the support you need", icon: "home" },
      { title: "Personalized Care", description: "Care plans tailored to your specific needs, preferences, and schedule", icon: "user" },
      { title: "Trained Professionals", description: "All caregivers are certified, background-checked, and continuously trained", icon: "award" },
      { title: "Flexible Scheduling", description: "From a few hours a week to 24/7 care, we adapt to your needs", icon: "clock" }
    ],
    faqs: [
      { question: "What is the difference between personal care and home health care?", answer: "Personal care focuses on non-medical assistance with activities of daily living like bathing, dressing, and grooming. Home health care includes medical services provided by licensed nurses or therapists. Our personal care assistants work under care plans but do not provide medical treatments." },
      { question: "How quickly can personal care services begin?", answer: "In most cases, we can begin personal care services within 24-72 hours of your initial consultation. Emergency situations may be accommodated same-day. We prioritize matching you with a caregiver whose skills and personality fit your needs." },
      { question: "Can personal care assistants help with medication?", answer: "Our PCAs can provide medication reminders and help organize medications, but they cannot administer medications. For medication administration, a licensed nurse or certified medication aide is required under Massachusetts regulations." },
      { question: "What happens if my regular caregiver is unavailable?", answer: "We maintain a team of qualified backup caregivers who are familiar with your care plan. If your regular caregiver is unavailable, we ensure continuity of care by sending a trained replacement who has been briefed on your specific needs." },
      { question: "What payment options do you accept for personal care services?", answer: "We are a private pay agency specializing in personalized, high-quality care. We accept private pay and work with most long-term care insurance policies. We can help you understand your insurance benefits and provide documentation for reimbursement." },
      { question: "How do you ensure quality and safety in personal care?", answer: "All caregivers undergo rigorous background checks, skills assessments, and ongoing training. We conduct regular supervisory visits, gather client feedback, and maintain 24/7 on-call support for any concerns or emergencies." }
    ]
  },
  "companionship": {
    key: "companionship",
    title: "Companion Care Services",
    tagline: "Meaningful Connection & Emotional Support",
    heroDescription: "Our compassionate companions provide friendship, engagement, and emotional support, helping reduce isolation and enhancing quality of life for your loved ones.",
    overview: "Companion care addresses the emotional and social needs of seniors and individuals who may be isolated or lonely. Our companions provide meaningful engagement through conversation, activities, and genuine friendship. This non-medical care service focuses on mental stimulation, emotional support, and helping clients maintain social connections that are vital to overall health and happiness.",
    whoItHelps: [
      "Seniors living alone who experience loneliness or isolation",
      "Individuals whose family caregivers need respite",
      "Those transitioning from hospital to home who need support",
      "People with early-stage memory concerns who benefit from engagement",
      "Anyone who wants help staying socially active and engaged",
      "Clients who need supervision but not hands-on personal care"
    ],
    servicesIncluded: [
      "Friendly conversation and companionship",
      "Accompaniment to appointments and social events",
      "Assistance with hobbies and recreational activities",
      "Reading aloud and letter writing",
      "Light meal preparation and dining company",
      "Cognitive stimulation games and puzzles",
      "Technology assistance (video calls, email)",
      "Errands and shopping assistance",
      "Medication reminders",
      "Light housekeeping and organization"
    ],
    caregiverStandards: [
      "Warm, personable demeanor with excellent communication skills",
      "Background check verified through CORI",
      "Experience working with seniors or individuals with special needs",
      "Trained in recognizing signs of depression and cognitive decline",
      "CPR and First Aid certified",
      "Clean driving record for transportation services",
      "Ongoing training in engagement techniques and dementia care",
      "Regular quality assurance evaluations"
    ],
    pricingInfo: "Companion care services typically range from $24-$32 per hour. We offer flexible scheduling from a few hours weekly to full-time companionship. Long-term care insurance may cover companion care, and we offer competitive private pay rates. Contact us for a free consultation.",
    coverageAreas: [
      "Boston", "Cambridge", "Somerville", "Brookline", "Newton", "Quincy",
      "Worcester", "Springfield", "Lowell", "Brockton", "New Bedford", "Fall River",
      "All 14 Massachusetts counties"
    ],
    benefits: [
      { title: "Reduce Isolation", description: "Combat loneliness with meaningful human connection and friendship", icon: "heart" },
      { title: "Mental Stimulation", description: "Engage in activities that keep the mind sharp and spirits high", icon: "brain" },
      { title: "Peace of Mind", description: "Families rest easy knowing their loved one has regular check-ins", icon: "shield" },
      { title: "Flexible Support", description: "From weekly visits to daily companionship, we adapt to your needs", icon: "calendar" }
    ],
    faqs: [
      { question: "What is the difference between companion care and personal care?", answer: "Companion care focuses on emotional support, social engagement, and light assistance without hands-on personal care like bathing or dressing. Personal care includes physical assistance with activities of daily living. Many clients benefit from a combination of both services." },
      { question: "Can companions provide transportation to appointments?", answer: "Yes, our companions can drive clients to medical appointments, social events, shopping, and other activities. All companions who provide transportation have clean driving records and are insured. We can use your vehicle or ours." },
      { question: "How do you match companions with clients?", answer: "We carefully consider personality, interests, communication style, and care needs when matching companions with clients. We encourage a trial period and will make adjustments if the initial match isn't ideal. Your satisfaction is our priority." },
      { question: "Can companion care help with early-stage dementia?", answer: "Absolutely. Our companions are trained in dementia-friendly communication and engagement techniques. Consistent companionship can help maintain cognitive function, reduce anxiety, and provide valuable structure and routine." },
      { question: "Is companion care covered by insurance?", answer: "Some long-term care insurance policies cover companion care. We are a private pay agency offering competitive rates and personalized care. We help families understand their long-term care insurance benefits and provide documentation for reimbursement." },
      { question: "What if my loved one is reluctant to accept a companion?", answer: "Reluctance is common. We recommend introducing the companion as a 'helper' or 'friend' rather than a caregiver. Starting with short visits and shared activities often helps. Our experienced companions are skilled at building rapport and trust gradually." }
    ]
  },
  "homemaking": {
    key: "homemaking",
    title: "Homemaking Services",
    tagline: "A Clean, Safe, and Comfortable Home",
    heroDescription: "Our homemakers ensure your loved ones live in a clean, organized, and safe environment, handling household tasks that become challenging with age or disability.",
    overview: "Homemaking services help individuals maintain a clean, safe, and comfortable living environment when household tasks become difficult due to age, disability, or illness. Our homemakers handle everything from cleaning and laundry to meal preparation and grocery shopping, allowing clients to focus on their health and well-being while living in a well-maintained home.",
    whoItHelps: [
      "Seniors who can no longer manage household chores safely",
      "Individuals recovering from surgery or illness",
      "People with physical disabilities affecting mobility",
      "Those with chronic fatigue or energy-limiting conditions",
      "Family caregivers who need help with household management",
      "Anyone who wants to age in place safely and comfortably"
    ],
    servicesIncluded: [
      "Light housekeeping and cleaning",
      "Laundry and linen changes",
      "Meal planning and preparation",
      "Grocery shopping and errands",
      "Dish washing and kitchen cleanup",
      "Organizing closets and living spaces",
      "Trash removal and recycling",
      "Pet care assistance",
      "Plant watering and basic yard tasks",
      "Seasonal tasks like holiday decorating"
    ],
    caregiverStandards: [
      "Thorough background check (CORI verified)",
      "Experience in professional cleaning and household management",
      "Trained in senior-safe cleaning products and techniques",
      "Knowledge of nutrition and meal preparation for special diets",
      "Reliable transportation for shopping and errands",
      "Excellent organizational skills",
      "Respectful of client privacy and personal belongings",
      "Regular quality assurance visits"
    ],
    pricingInfo: "Homemaking services typically range from $24-$30 per hour. We offer packages for weekly, bi-weekly, or daily assistance. Some long-term care insurance policies cover homemaking services. Contact us for a free home assessment.",
    coverageAreas: [
      "Boston", "Cambridge", "Somerville", "Brookline", "Newton", "Quincy",
      "Worcester", "Springfield", "Lowell", "Brockton", "New Bedford", "Fall River",
      "All 14 Massachusetts counties"
    ],
    benefits: [
      { title: "Safe Environment", description: "Reduce fall risks and hazards with regular cleaning and organization", icon: "shield" },
      { title: "Nutritious Meals", description: "Enjoy healthy, home-cooked meals tailored to dietary needs", icon: "utensils" },
      { title: "Reduce Stress", description: "Free your loved one from household burdens to focus on health", icon: "smile" },
      { title: "Independence", description: "Continue living at home safely with the right support", icon: "home" }
    ],
    faqs: [
      { question: "What cleaning products do homemakers use?", answer: "We use client-preferred products when available. Otherwise, we provide senior-safe, non-toxic cleaning supplies. We accommodate allergies, sensitivities, and preferences for green or fragrance-free products." },
      { question: "Can homemakers prepare meals for special diets?", answer: "Yes, our homemakers are trained in preparing meals for diabetic, low-sodium, heart-healthy, and other special diets. We work with your dietary requirements and can follow specific recipes or physician recommendations." },
      { question: "How is homemaking different from a cleaning service?", answer: "Homemaking is person-centered care that adapts to the client's needs and may include companionship, medication reminders, and personal assistance alongside household tasks. Traditional cleaning services focus solely on the home, not the person." },
      { question: "Can homemakers do heavy cleaning or yard work?", answer: "Our homemakers handle light housekeeping and maintenance tasks. Heavy cleaning, major yard work, or home repairs require specialized services. We can help coordinate these additional services if needed." },
      { question: "What are the payment options for homemaking services?", answer: "We are a private pay agency offering flexible payment options. We also work with most long-term care insurance policies and can provide documentation for reimbursement. Contact us to discuss your specific needs and budget." },
      { question: "Can I combine homemaking with other care services?", answer: "Absolutely. Many clients benefit from a combination of homemaking, companion care, and personal care services. We create comprehensive care plans that address all of your loved one's needs through one reliable provider." }
    ]
  },
  "dementia-care": {
    key: "dementia-care",
    title: "Dementia & Memory Care",
    tagline: "Specialized Care for Cognitive Challenges",
    heroDescription: "Our dementia-trained caregivers provide patient, specialized support for individuals with Alzheimer's and other forms of dementia, creating calm, structured environments.",
    overview: "Dementia care requires specialized training, patience, and understanding. Our caregivers are extensively trained in dementia-specific approaches, including validation therapy, redirection techniques, and creating calm, structured environments. We help individuals with Alzheimer's disease and other dementias maintain their dignity, safety, and quality of life while providing families with respite and peace of mind.",
    whoItHelps: [
      "Individuals diagnosed with Alzheimer's disease",
      "Those living with vascular dementia or Lewy body dementia",
      "People with frontotemporal dementia or mixed dementias",
      "Seniors experiencing mild cognitive impairment",
      "Families needing respite from caregiving responsibilities",
      "Those transitioning from memory care facilities to home"
    ],
    servicesIncluded: [
      "Constant supervision and safety monitoring",
      "Structured daily routines and activities",
      "Medication management and reminders",
      "Assistance with all personal care needs",
      "Cognitive stimulation and memory activities",
      "Wandering prevention and exit monitoring",
      "Nutrition monitoring and feeding assistance",
      "Communication with healthcare providers",
      "Behavioral management and de-escalation",
      "Family education and support"
    ],
    caregiverStandards: [
      "Specialized dementia care certification",
      "Minimum 3 years experience with dementia patients",
      "Training in validation therapy and person-centered care",
      "Crisis intervention and behavioral management training",
      "Understanding of dementia progression and stages",
      "CORI background check verified",
      "CPR and First Aid certified",
      "Ongoing continuing education in dementia care advances"
    ],
    pricingInfo: "Dementia care services range from $32-$45 per hour due to the specialized training required. We offer 24/7 care options and live-in arrangements. Many families combine private pay with long-term care insurance. Contact us for a specialized dementia care assessment.",
    coverageAreas: [
      "Boston", "Cambridge", "Somerville", "Brookline", "Newton", "Quincy",
      "Worcester", "Springfield", "Lowell", "Brockton", "New Bedford", "Fall River",
      "All 14 Massachusetts counties"
    ],
    benefits: [
      { title: "Specialized Training", description: "Caregivers certified in the latest dementia care approaches", icon: "graduation-cap" },
      { title: "Safe Environment", description: "Home modifications and supervision to prevent accidents", icon: "shield" },
      { title: "Family Respite", description: "Give family caregivers the break they need to recharge", icon: "heart" },
      { title: "Dignity Preserved", description: "Person-centered care that honors who your loved one is", icon: "star" }
    ],
    faqs: [
      { question: "What training do your dementia caregivers have?", answer: "All dementia caregivers complete specialized certification programs covering Alzheimer's disease, other dementias, communication techniques, behavioral management, safety protocols, and person-centered care approaches. They receive ongoing training as best practices evolve." },
      { question: "Can dementia care help keep my loved one at home longer?", answer: "Yes, professional dementia care often allows individuals to remain safely at home much longer than they could without support. We provide the supervision, structure, and specialized care that maintains safety while preserving familiar surroundings and routines." },
      { question: "How do you handle behavioral symptoms like agitation?", answer: "Our caregivers are trained in non-pharmacological approaches to behavioral symptoms, including redirection, validation, environmental modifications, and identifying triggers. We work closely with healthcare providers and families to develop effective strategies." },
      { question: "What about wandering and safety concerns?", answer: "We implement comprehensive safety protocols including constant supervision, door alarms, GPS tracking options, and environmental modifications. We conduct thorough home safety assessments and create individualized prevention plans." },
      { question: "What are the payment options for dementia care?", answer: "We are a private pay agency specializing in personalized dementia care. Long-term care insurance often covers in-home dementia care, and we help families understand their benefits and provide documentation for reimbursement." },
      { question: "How do you support family caregivers?", answer: "We provide respite care so family caregivers can rest and maintain their own health. We also offer education about dementia progression, coping strategies, and community resources. Our care coordinators are available to support the entire family." }
    ]
  },
  "respite-care": {
    key: "respite-care",
    title: "Respite Care Services",
    tagline: "Relief for Family Caregivers",
    heroDescription: "Our respite care provides family caregivers with the break they need while ensuring their loved ones receive quality care from trusted professionals.",
    overview: "Respite care provides temporary relief for family caregivers who dedicate themselves to caring for aging parents, spouses, or family members with disabilities. Whether you need a few hours to run errands, a weekend getaway, or extended time to recover from burnout, our professional caregivers step in to provide the same loving care your family member deserves.",
    whoItHelps: [
      "Family caregivers experiencing burnout or exhaustion",
      "Spouses caring for partners with chronic conditions",
      "Adult children balancing work and eldercare",
      "Caregivers who need time for their own medical appointments",
      "Families planning vacations or attending events",
      "Anyone who needs temporary coverage for regular caregivers"
    ],
    servicesIncluded: [
      "All personal care services as needed",
      "Companionship and supervision",
      "Medication reminders and management",
      "Meal preparation and feeding assistance",
      "Light housekeeping during care",
      "Transportation to appointments",
      "Engagement activities and cognitive stimulation",
      "Overnight and weekend care options",
      "Detailed reporting to family caregivers",
      "Seamless transition and care coordination"
    ],
    caregiverStandards: [
      "Comprehensive background check (CORI verified)",
      "Training in multiple care disciplines",
      "Excellent communication and documentation skills",
      "Flexibility to adapt to different care routines",
      "Experience with various conditions and care needs",
      "CPR and First Aid certified",
      "Ability to quickly build rapport with new clients",
      "Commitment to following established care plans"
    ],
    pricingInfo: "Respite care rates vary based on the level of care needed, typically ranging from $26-$40 per hour. We offer discounted rates for extended respite periods. Some long-term care insurance policies cover respite care. Contact us for options.",
    coverageAreas: [
      "Boston", "Cambridge", "Somerville", "Brookline", "Newton", "Quincy",
      "Worcester", "Springfield", "Lowell", "Brockton", "New Bedford", "Fall River",
      "All 14 Massachusetts counties"
    ],
    benefits: [
      { title: "Prevent Burnout", description: "Take time to recharge so you can continue providing care", icon: "battery" },
      { title: "Maintain Health", description: "Attend to your own medical and wellness needs", icon: "heart" },
      { title: "Quality Coverage", description: "Trained professionals maintain your loved one's care routine", icon: "check-circle" },
      { title: "Flexible Options", description: "From hours to weeks, we adapt to your respite needs", icon: "clock" }
    ],
    faqs: [
      { question: "How far in advance should I schedule respite care?", answer: "We recommend scheduling 1-2 weeks in advance for regular respite care. However, we understand emergencies happen and offer last-minute coverage when caregivers are available. Build a relationship with us before you urgently need respite." },
      { question: "Will the respite caregiver follow our care routine?", answer: "Absolutely. We conduct a thorough intake process to document your loved one's routine, preferences, medications, and care needs. Our caregivers follow your established schedule and report back on the care period." },
      { question: "Can I use respite care for an extended vacation?", answer: "Yes, we provide extended respite care for vacations, family events, or any extended time away. We can arrange 24-hour care or live-in caregivers for trips lasting from a weekend to several weeks." },
      { question: "What if my loved one doesn't adjust well to a new caregiver?", answer: "We introduce respite caregivers gradually when possible, allowing your loved one to become comfortable. If the initial match isn't ideal, we'll work with you to find a better fit. Our goal is a seamless transition." },
      { question: "Does insurance cover respite care?", answer: "Many long-term care insurance policies cover respite care. We are a private pay agency and help families understand their long-term care insurance benefits. Contact us to discuss your coverage options." },
      { question: "How do I know my loved one is being cared for properly?", answer: "We provide detailed care notes after each respite period, documenting activities, meals, medications, and any observations. Our caregivers are reachable during the care period, and supervisors are available 24/7 for questions or concerns." }
    ]
  },
  "live-in-care": {
    key: "live-in-care",
    title: "Live-In Care Services",
    tagline: "Around-the-Clock Support at Home",
    heroDescription: "Our live-in caregivers provide continuous presence and support, offering a cost-effective alternative to residential care facilities while keeping your loved one at home.",
    overview: "Live-in care provides a dedicated caregiver who resides in your loved one's home, offering continuous support throughout the day and night. This arrangement is ideal for individuals who need consistent care but want to remain in the comfort and familiarity of their own home. Live-in care is often more affordable than 24-hour hourly care and far more personalized than facility care.",
    whoItHelps: [
      "Seniors who need overnight supervision and assistance",
      "Individuals with progressive conditions requiring increasing care",
      "Those recovering from major surgery or illness",
      "People with dementia who need constant supervision",
      "Individuals who want to avoid nursing home placement",
      "Those whose families cannot provide round-the-clock care"
    ],
    servicesIncluded: [
      "Continuous presence and supervision",
      "All personal care assistance",
      "Medication management around the clock",
      "Meal preparation and nutrition monitoring",
      "Light housekeeping and laundry",
      "Companionship and emotional support",
      "Safety monitoring and fall prevention",
      "Coordination with healthcare providers",
      "Transportation to appointments",
      "Family communication and updates"
    ],
    caregiverStandards: [
      "Extensive experience with complex care needs",
      "Background check verified (CORI)",
      "Ability to work independently with minimal supervision",
      "Training in emergency response procedures",
      "Excellent judgment and problem-solving skills",
      "Strong communication with families and care teams",
      "Flexibility and adaptability to changing needs",
      "Professional boundaries while building genuine rapport"
    ],
    pricingInfo: "Live-in care typically ranges from $280-$380 per day, making it significantly more affordable than 24-hour hourly care. Rates depend on care complexity and caregiver requirements. Long-term care insurance often covers live-in care. Contact us for a comprehensive assessment.",
    coverageAreas: [
      "Boston", "Cambridge", "Somerville", "Brookline", "Newton", "Quincy",
      "Worcester", "Springfield", "Lowell", "Brockton", "New Bedford", "Fall River",
      "All 14 Massachusetts counties"
    ],
    benefits: [
      { title: "Continuous Care", description: "Peace of mind knowing someone is always there", icon: "clock" },
      { title: "Cost Effective", description: "More affordable than 24-hour hourly care", icon: "dollar-sign" },
      { title: "Stay Home", description: "Avoid nursing home placement and remain in familiar surroundings", icon: "home" },
      { title: "Consistent Caregiver", description: "Build a trusting relationship with a dedicated caregiver", icon: "heart" }
    ],
    faqs: [
      { question: "What are the requirements for live-in care?", answer: "Live-in caregivers require a private room (can be modest), access to a bathroom, and meals provided. They work during waking hours and are available for brief assistance at night, with an 8-hour sleep period. If frequent nighttime care is needed, 24-hour care may be more appropriate." },
      { question: "How is live-in care different from 24-hour care?", answer: "Live-in care involves one caregiver who lives in the home with a scheduled sleep period. 24-hour care uses two or more caregivers working in shifts to provide continuous awake coverage. Live-in is more affordable; 24-hour care is best for high-needs clients." },
      { question: "What if I need to change live-in caregivers?", answer: "We understand that caregiver compatibility is essential. If the relationship isn't working, we'll work quickly to find a better match. We also arrange scheduled breaks for live-in caregivers with trained relief caregivers." },
      { question: "Can live-in caregivers handle medical emergencies?", answer: "Our live-in caregivers are CPR and First Aid certified and trained in emergency response. They can recognize warning signs, call 911, and provide first aid. However, they are not medical professionals and do not provide skilled nursing care." },
      { question: "How do live-in caregivers get time off?", answer: "Live-in caregivers typically work Monday through Friday or on a rotation schedule. We provide trained relief caregivers for weekends, vacations, and days off to ensure continuous, quality care for your loved one." },
      { question: "Is live-in care covered by insurance?", answer: "Many long-term care insurance policies cover live-in care. We are a private pay agency and can help you understand your long-term care insurance benefits and provide documentation for reimbursement claims." }
    ]
  },
  "overnight-care": {
    key: "overnight-care",
    title: "Overnight Care Services",
    tagline: "Peaceful Nights, Safe Supervision",
    heroDescription: "Our overnight caregivers provide security and assistance during nighttime hours, ensuring your loved one is safe and supported through the night.",
    overview: "Overnight care provides supervision and assistance during evening and nighttime hours when risks like falls, confusion, and medical emergencies increase. Our awake overnight caregivers remain alert and ready to assist with toileting, repositioning, medication, and any nighttime needs while allowing family members to get the restful sleep they need.",
    whoItHelps: [
      "Seniors with sundowning or nighttime confusion",
      "Individuals at high risk for falls during the night",
      "Those who need frequent repositioning for pressure sore prevention",
      "People requiring nighttime medication or treatments",
      "Family caregivers who are sleep-deprived",
      "Individuals recently discharged from hospital who need monitoring"
    ],
    servicesIncluded: [
      "Awake supervision throughout the night",
      "Assistance with toileting and incontinence care",
      "Medication reminders and administration assistance",
      "Repositioning for comfort and pressure relief",
      "Response to nighttime confusion or anxiety",
      "Fall prevention and safety monitoring",
      "Light snack preparation if needed",
      "Emergency response and family notification",
      "Detailed notes on nighttime activity",
      "Morning care assistance as transition to day"
    ],
    caregiverStandards: [
      "Experience with overnight care and night shift work",
      "Trained in sundowning and nighttime dementia behaviors",
      "Alert and attentive throughout nighttime hours",
      "CORI background check verified",
      "CPR and First Aid certified",
      "Skilled in gentle, calming nighttime interventions",
      "Strong observation and documentation skills",
      "Reliable attendance and punctuality"
    ],
    pricingInfo: "Overnight care typically ranges from $200-$280 per night (8-12 hour shifts) for awake care. Sleeping overnight care is available at reduced rates for clients needing only periodic assistance. Contact us to discuss your specific nighttime needs.",
    coverageAreas: [
      "Boston", "Cambridge", "Somerville", "Brookline", "Newton", "Quincy",
      "Worcester", "Springfield", "Lowell", "Brockton", "New Bedford", "Fall River",
      "All 14 Massachusetts counties"
    ],
    benefits: [
      { title: "Family Rest", description: "Get the sleep you need while knowing your loved one is safe", icon: "moon" },
      { title: "Fall Prevention", description: "Reduce nighttime fall risk with attentive supervision", icon: "shield" },
      { title: "Sundowning Support", description: "Specialized care for nighttime confusion and agitation", icon: "sun" },
      { title: "Health Monitoring", description: "Overnight observation catches changes in condition", icon: "activity" }
    ],
    faqs: [
      { question: "What is the difference between awake and sleeping overnight care?", answer: "Awake overnight care means the caregiver stays alert throughout the night, actively monitoring and available for immediate assistance. Sleeping overnight care is for clients who rarely need help at night; the caregiver sleeps but wakes for occasional needs." },
      { question: "What hours do overnight shifts cover?", answer: "Standard overnight shifts run from approximately 10 PM to 6 AM or 11 PM to 7 AM. We can customize timing to match your family's schedule and needs. Longer or shorter overnight periods are available." },
      { question: "How do overnight caregivers stay awake and alert?", answer: "Our overnight caregivers are experienced night-shift workers who maintain alertness through light activity, regular check-ins, and scheduled tasks. We select caregivers whose natural sleep patterns suit overnight work." },
      { question: "Can overnight care help with sundowning?", answer: "Yes, our overnight caregivers are trained in managing sundowning behaviors including confusion, agitation, and wandering that often occur in evening and nighttime hours. They use calming techniques and maintain safe, peaceful environments." },
      { question: "What if there is an emergency during the night?", answer: "Our overnight caregivers are trained in emergency response and will call 911 if needed. They immediately notify family members and stay with your loved one throughout any emergency. We maintain 24/7 on-call supervisor support." },
      { question: "Can overnight care be combined with daytime services?", answer: "Absolutely. Many families combine overnight care with daytime personal care or companion services for comprehensive coverage. We coordinate schedules and communication between caregivers to ensure seamless transitions." }
    ]
  },
  "post-hospital-care": {
    key: "post-hospital-care",
    title: "Post-Hospital Care",
    tagline: "Safe Recovery at Home",
    heroDescription: "Our post-hospital care specialists help patients transition safely from hospital to home, reducing readmission risks and supporting full recovery.",
    overview: "The transition from hospital to home is a vulnerable time when readmission risks are highest. Our post-hospital care provides the extra support needed during recovery, including medication management, following discharge instructions, attending follow-up appointments, and monitoring for complications. We bridge the gap between hospital care and independent living.",
    whoItHelps: [
      "Patients discharged after surgery or major procedures",
      "Those recovering from heart attacks, strokes, or serious illness",
      "Individuals with complex discharge instructions",
      "Seniors at high risk for hospital readmission",
      "Patients needing help with wound care or therapy exercises",
      "Anyone without adequate support system at home during recovery"
    ],
    servicesIncluded: [
      "Discharge planning coordination",
      "Transportation home from hospital",
      "Medication organization and reminders",
      "Following discharge care instructions",
      "Assistance with wound care and dressing changes",
      "Mobility support and fall prevention",
      "Meal preparation for healing nutrition",
      "Monitoring for warning signs and complications",
      "Transportation to follow-up appointments",
      "Communication with healthcare providers"
    ],
    caregiverStandards: [
      "Experience with post-acute care transitions",
      "Understanding of common post-surgical needs",
      "Training in recognizing signs of complications",
      "Excellent documentation and communication skills",
      "CORI background check verified",
      "CPR and First Aid certified",
      "Ability to follow detailed medical instructions",
      "Calm demeanor during stressful recovery periods"
    ],
    pricingInfo: "Post-hospital care typically ranges from $28-$40 per hour depending on care complexity. Short-term intensive packages are available for the critical first weeks of recovery. Some Medicare Advantage plans and long-term care insurance cover transitional care. Contact us for options.",
    coverageAreas: [
      "Boston", "Cambridge", "Somerville", "Brookline", "Newton", "Quincy",
      "Worcester", "Springfield", "Lowell", "Brockton", "New Bedford", "Fall River",
      "All 14 Massachusetts counties"
    ],
    benefits: [
      { title: "Reduce Readmissions", description: "Professional support significantly lowers hospital return rates", icon: "trending-down" },
      { title: "Faster Recovery", description: "Proper care and nutrition support optimal healing", icon: "activity" },
      { title: "Peace of Mind", description: "Expert monitoring catches problems early", icon: "shield" },
      { title: "Independence Restored", description: "Regain your strength and return to normal life", icon: "user" }
    ],
    faqs: [
      { question: "When should post-hospital care begin?", answer: "Ideally, post-hospital care begins immediately upon discharge. We recommend contacting us before discharge so we can coordinate with the hospital discharge planner and have a caregiver ready when your loved one arrives home." },
      { question: "How long is post-hospital care typically needed?", answer: "The duration depends on the condition and surgery type. Minor procedures may require 1-2 weeks; major surgeries or serious illness may need 4-6 weeks or longer. We adjust care levels as recovery progresses." },
      { question: "Can caregivers help with physical therapy exercises?", answer: "Our caregivers can remind clients to do prescribed exercises and provide encouragement and safety during home therapy. For hands-on physical therapy, a licensed therapist is required. We coordinate with therapy providers." },
      { question: "What warning signs do caregivers watch for?", answer: "Our caregivers monitor for fever, increased pain, wound changes, breathing difficulties, confusion, falls, medication reactions, and other signs that may indicate complications requiring medical attention." },
      { question: "Does Medicare cover post-hospital home care?", answer: "Medicare covers skilled home health care (nursing, therapy) for homebound patients. Personal care assistance during recovery may be covered under Medicare Advantage plans or long-term care insurance. We help families understand options." },
      { question: "Can you coordinate with home health nurses?", answer: "Absolutely. We regularly work alongside visiting nurses, physical therapists, and other home health providers. Our caregivers fill the gaps between skilled visits, providing the continuous support that promotes recovery." }
    ]
  }
};

export const getServiceContent = (serviceKey: string): ServiceContent | null => {
  return SERVICE_CONTENT[serviceKey] || null;
};

export const getAllServiceKeys = (): string[] => {
  return Object.keys(SERVICE_CONTENT);
};

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export const SERVICE_FAQS: Record<string, ServiceFAQ[]> = {
  "personal-care": [
    {
      question: "What is included in personal care services?",
      answer: "Personal care services include bathing and showering assistance, grooming (hair care, oral hygiene, shaving), dressing and undressing support, toileting and incontinence care, transfer and mobility assistance, medication reminders, and feeding assistance when needed. Our caregivers are trained to provide dignified, respectful support."
    },
    {
      question: "How do you ensure caregiver quality for personal care?",
      answer: "All our personal care assistants undergo rigorous CORI background checks, reference verification, skills assessments, and ongoing training. They receive specialized training in safe transfer techniques, infection control, and privacy-respecting personal care delivery."
    },
    {
      question: "Can personal care be customized to my loved one's preferences?",
      answer: "Absolutely. We create individualized care plans based on your loved one's specific needs, preferences, and routines. This includes preferred bath times, grooming habits, and any cultural or religious considerations that are important to your family."
    },
    {
      question: "What is the difference between personal care and skilled nursing care?",
      answer: "Personal care focuses on assistance with daily living activities like bathing, dressing, and grooming. Skilled nursing care involves medical procedures like wound care, IV management, and medication administration. Our personal care assistants provide non-medical support that complements any medical care your loved one receives."
    },
    {
      question: "How much does personal care cost in Massachusetts?",
      answer: "Personal care costs in Massachusetts typically range from $25-35 per hour depending on the level of care needed, caregiver experience, and scheduling requirements. We offer flexible packages from a few hours weekly to 24/7 care. Contact us for a personalized quote."
    },
    {
      question: "Do you provide personal care for individuals with disabilities?",
      answer: "Yes, we provide personal care services for adults of all ages with physical disabilities, chronic conditions, or recovery needs. Our caregivers are trained in adaptive techniques and use appropriate assistive devices to ensure safe, comfortable care."
    }
  ],
  "companionship": [
    {
      question: "What activities are included in companionship care?",
      answer: "Companionship care includes friendly conversation, shared hobbies and activities, reading together, playing games, light exercise and walks, escorting to appointments and social events, meal companionship, technology assistance, and emotional support. Activities are tailored to your loved one's interests."
    },
    {
      question: "How does companionship care help combat loneliness in seniors?",
      answer: "Studies show that social isolation significantly impacts senior health. Our companions provide consistent, meaningful interactions that reduce depression, improve cognitive function, and enhance quality of life. Regular visits create something to look forward to and maintain social engagement."
    },
    {
      question: "Can companions accompany my loved one to doctor appointments?",
      answer: "Yes, our companions can escort your loved one to medical appointments, social events, religious services, and community activities. They can also help take notes during appointments and communicate important information to family members."
    },
    {
      question: "What is the minimum hours for companionship services?",
      answer: "We typically require a minimum of 3-4 hours per visit to ensure meaningful engagement and make transportation practical for our caregivers. However, we offer flexible scheduling to meet your family's needs, including regular weekly visits or occasional companionship."
    },
    {
      question: "How do you match companions with clients?",
      answer: "We carefully match companions based on personality, interests, language, and cultural background. Before starting services, we conduct an in-home assessment to understand your loved one's preferences and hobbies, then select a companion who will be a good fit."
    },
    {
      question: "Can companionship care include light housekeeping?",
      answer: "Yes, many families combine companionship with light homemaking services. Companions can help with light meal preparation, tidying up, laundry, and other household tasks during their visits, making each visit more valuable."
    }
  ],
  "homemaking": [
    {
      question: "What household tasks are included in homemaking services?",
      answer: "Homemaking services include meal planning and preparation, light housekeeping (vacuuming, dusting, mopping), laundry and linen changes, grocery shopping and errands, organizing and decluttering, pet care assistance, transportation to appointments, and home safety monitoring."
    },
    {
      question: "Can homemakers help with special dietary needs?",
      answer: "Yes, our homemakers are trained to prepare meals according to dietary restrictions including diabetic-friendly, low-sodium, heart-healthy, soft or pureed textures, and cultural preferences. We work with your family and healthcare providers to ensure proper nutrition."
    },
    {
      question: "Do homemakers run errands and grocery shopping?",
      answer: "Absolutely. Our homemakers can handle grocery shopping, pharmacy pickups, post office visits, dry cleaning, and other essential errands. They can shop independently with a list or accompany your loved one for a more engaging experience."
    },
    {
      question: "How is homemaking different from a cleaning service?",
      answer: "Unlike cleaning services, our homemakers provide comprehensive household support focused on maintaining a safe, healthy living environment for seniors. They also provide companionship, observe changes in health or safety, and report concerns to family members."
    },
    {
      question: "Can homemakers assist with pet care?",
      answer: "Yes, we understand pets are family. Our homemakers can help with feeding, letting pets out, cleaning litter boxes, and ensuring pets have fresh water. For more complex pet care needs, we can help coordinate with pet care professionals."
    },
    {
      question: "What areas in Massachusetts do you serve for homemaking?",
      answer: "We provide homemaking services throughout Greater Boston and Massachusetts, including Boston, Cambridge, Brookline, Newton, Wellesley, Lexington, Arlington, Somerville, Quincy, and surrounding communities. Contact us to confirm service in your specific area."
    }
  ],
  "dementia-care": [
    {
      question: "What specialized training do your dementia caregivers receive?",
      answer: "Our dementia caregivers complete comprehensive training in Alzheimer's and dementia care, including communication techniques, behavioral management, safety protocols, cognitive stimulation activities, and wandering prevention. They receive ongoing education on the latest best practices in memory care."
    },
    {
      question: "How do you handle challenging dementia behaviors?",
      answer: "Our caregivers are trained in positive, person-centered approaches to manage sundowning, agitation, repetitive questions, and other challenging behaviors. We focus on understanding triggers, maintaining consistent routines, and using redirection and validation techniques."
    },
    {
      question: "Is in-home dementia care better than a memory care facility?",
      answer: "For many families, in-home dementia care allows loved ones to remain in familiar surroundings, which can reduce confusion and anxiety. The one-on-one attention and personalized routines often lead to better outcomes than facility care. We help families evaluate the best option for their situation."
    },
    {
      question: "Can you provide 24-hour dementia care at home?",
      answer: "Yes, we offer 24/7 dementia care with live-in caregivers or rotating shifts. This ensures continuous supervision for safety while allowing your loved one to age in place. We customize care schedules based on your family's needs and budget."
    },
    {
      question: "How do you support family caregivers of dementia patients?",
      answer: "We provide education on dementia progression, communication tips, and coping strategies. Our caregivers offer respite so family members can rest and recharge. We also connect families with local support groups and resources throughout Massachusetts."
    },
    {
      question: "What safety measures do you implement for dementia care?",
      answer: "We conduct home safety assessments, implement wandering prevention strategies, remove hazards, establish consistent routines, and use monitoring systems when appropriate. Our caregivers are trained to identify and respond to safety concerns immediately."
    }
  ],
  "respite-care": [
    {
      question: "What is respite care and who is it for?",
      answer: "Respite care provides temporary relief for family caregivers who need a break from caregiving responsibilities. Whether you need a few hours to run errands, a weekend to recharge, or extended coverage during travel, respite care ensures your loved one receives quality care while you take time for yourself."
    },
    {
      question: "How quickly can you arrange respite care?",
      answer: "We understand respite needs can arise suddenly. For planned respite, we recommend scheduling at least 1-2 weeks in advance. For urgent situations, we often can arrange care within 24-48 hours, depending on availability in your area."
    },
    {
      question: "What services are included during respite care?",
      answer: "Respite caregivers provide the same comprehensive services as our regular caregivers, including personal care, companionship, medication reminders, meal preparation, light housekeeping, and any specialized care your loved one requires."
    },
    {
      question: "Can respite care be used regularly or just occasionally?",
      answer: "Both! Some families schedule regular weekly respite for consistent breaks, while others use it occasionally for vacations, special events, or when they feel overwhelmed. We offer flexible scheduling to meet your needs."
    },
    {
      question: "How do you ensure continuity of care with different respite caregivers?",
      answer: "We maintain detailed care plans documenting your loved one's routines, preferences, and needs. Before each respite visit, caregivers review this information. When possible, we try to assign the same caregiver for consistency."
    },
    {
      question: "Is respite care covered by insurance or Medicare?",
      answer: "Medicare typically covers limited respite care for hospice patients. Some long-term care insurance policies include respite benefits. While most respite care is private pay, we can help you explore potential coverage options and veterans' benefits."
    }
  ],
  "live-in-care": [
    {
      question: "What does live-in care include?",
      answer: "Live-in care provides a dedicated caregiver who resides in your home, offering around-the-clock support including personal care, companionship, meal preparation, medication reminders, housekeeping, and overnight assistance. The caregiver receives scheduled sleep time but is available for nighttime needs."
    },
    {
      question: "How is live-in care different from 24-hour care?",
      answer: "Live-in care involves one caregiver staying in the home who sleeps during the night (usually 8 hours). 24-hour care uses rotating shift caregivers who are awake and alert at all times. Live-in is more cost-effective for those who don't require extensive overnight assistance."
    },
    {
      question: "What living accommodations does the live-in caregiver need?",
      answer: "Live-in caregivers need a private room with a bed and access to bathroom facilities. They also require access to food and kitchen amenities. A comfortable, private space helps ensure they can rest properly to provide quality care."
    },
    {
      question: "How much does live-in care cost compared to assisted living?",
      answer: "Live-in care in Massachusetts typically costs $350-450 per day, which is often comparable to or less than quality assisted living facilities. The advantage is one-on-one attention and the ability to remain at home. We provide detailed cost comparisons during consultations."
    },
    {
      question: "What if my loved one needs care at night?",
      answer: "Live-in caregivers are available for brief nighttime assistance such as bathroom trips or repositioning. If your loved one requires frequent or extended overnight care, we may recommend 24-hour shift care or supplementing live-in care with overnight assistance."
    },
    {
      question: "How do you handle caregiver time off and vacations?",
      answer: "Live-in caregivers typically work 5 days with 2 days off weekly. We arrange backup caregivers for regular days off, vacations, and emergencies. Our care coordination ensures seamless coverage so your loved one always has qualified support."
    }
  ],
  "post-hospital-care": [
    {
      question: "When should post-hospital care begin?",
      answer: "Ideally, discharge planning begins before leaving the hospital. We can coordinate with hospital case managers to have a caregiver ready when your loved one arrives home. Same-day or next-day care is often available for unexpected discharges."
    },
    {
      question: "What does post-hospital transitional care include?",
      answer: "Post-hospital care includes medication management and reminders, wound care monitoring, physical therapy exercise support, fall prevention, nutrition and hydration support, transportation to follow-up appointments, health status monitoring, and communication with healthcare providers."
    },
    {
      question: "How long is post-hospital care typically needed?",
      answer: "Recovery timelines vary based on the procedure and individual health. Some clients need 1-2 weeks of intensive support, while others benefit from several weeks or months of decreasing care. We continuously assess needs and adjust care plans accordingly."
    },
    {
      question: "Can your caregivers help with physical therapy exercises?",
      answer: "Yes, our caregivers can assist with prescribed exercises and mobility activities under the direction of physical therapists. While we don't provide therapy services, we reinforce the exercises and techniques your loved one learns during PT sessions."
    },
    {
      question: "How do you coordinate with doctors and hospitals?",
      answer: "With your authorization, we communicate with healthcare providers about care needs and concerns. Our caregivers document daily observations that can be shared with doctors. We also ensure medication lists are accurate and follow-up appointments are kept."
    },
    {
      question: "What is the cost of post-hospital care?",
      answer: "Post-hospital care typically ranges from $25-40 per hour in Massachusetts, depending on care intensity and caregiver qualifications. Many families start with more hours immediately after discharge and decrease as recovery progresses. We provide customized quotes based on your needs."
    }
  ],
  "hospice-palliative-care": [
    {
      question: "What is the difference between hospice and palliative care?",
      answer: "Palliative care focuses on comfort and quality of life for anyone with a serious illness, regardless of prognosis. Hospice care is specifically for those with a terminal illness and life expectancy of six months or less who choose comfort over curative treatment. We support families through both types of care."
    },
    {
      question: "How do your caregivers support hospice patients?",
      answer: "Our caregivers provide comfort-focused personal care, companionship, medication reminders, positioning for comfort, respite for family caregivers, emotional support, and coordination with hospice medical teams. We supplement the care provided by hospice nurses and aides."
    },
    {
      question: "Can you provide 24-hour hospice support at home?",
      answer: "Yes, we offer around-the-clock caregivers for hospice patients who need continuous presence and support. This allows families to be present as loved ones without the burden of providing all physical care themselves."
    },
    {
      question: "How do you support family members during end-of-life care?",
      answer: "We provide respite so families can rest, emotional support during a difficult time, practical assistance with household tasks, and help navigating the caregiving journey. Many families find our compassionate presence invaluable during this sacred time."
    },
    {
      question: "Do you work with all hospice agencies in Massachusetts?",
      answer: "Yes, we coordinate with all licensed hospice agencies throughout Massachusetts. Our caregivers understand hospice protocols and work seamlessly with hospice nurses, social workers, and chaplains to provide comprehensive end-of-life support."
    },
    {
      question: "Is hospice care covered by insurance?",
      answer: "Medicare, Medicaid, and most private insurance cover hospice medical services. Our companion and personal care services are typically private pay, though some long-term care insurance policies may cover them. We help families understand their options during consultations."
    }
  ]
};

export const GENERAL_HOME_CARE_FAQS: ServiceFAQ[] = [
  {
    question: "How do I know if my loved one needs in-home care?",
    answer: "Signs that in-home care may be beneficial include difficulty with daily activities (bathing, dressing, cooking), forgetfulness affecting safety, social isolation, declining home cleanliness, weight changes, missed medications, or family caregiver burnout. Our free consultation can help assess your specific situation."
  },
  {
    question: "Are your caregivers insured and bonded?",
    answer: "Yes, all our caregivers are fully insured and bonded for your protection. We also carry comprehensive liability insurance and workers' compensation coverage, so you're protected from any liability."
  },
  {
    question: "What if we need to change our care schedule?",
    answer: "We understand that care needs evolve. You can increase or decrease hours with reasonable notice. For schedule changes, we ask for at least 24-48 hours notice when possible to ensure proper caregiver coverage."
  },
  {
    question: "How do you handle caregiver matches and replacements?",
    answer: "We carefully match caregivers based on care needs, personality, language, and cultural preferences. If a match isn't working for any reason, we'll find a replacement caregiver at no additional cost. Your satisfaction is our priority."
  },
  {
    question: "What are your service areas in Massachusetts?",
    answer: "We provide in-home care services throughout Massachusetts, including Greater Boston, Cambridge, Brookline, Newton, Wellesley, Lexington, Worcester, Springfield, and surrounding communities. Contact us to confirm coverage in your specific location."
  },
  {
    question: "How quickly can services begin?",
    answer: "We can often begin services within 24-48 hours for urgent situations. For planned care, we recommend scheduling an assessment 1-2 weeks in advance to ensure the best caregiver match and thorough care planning."
  }
];

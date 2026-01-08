import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Phone,
  Home,
  Heart,
  Users,
  DollarSign,
  Building2,
  Car,
  Utensils,
  Shield,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Clock,
  FileText,
  HelpCircle,
  Stethoscope,
  Pill,
  Scale,
  Thermometer,
  Globe,
  Mail
} from "lucide-react";
import { Link } from "wouter";

import heroImage from "@assets/Comfort_and_Independence_Aging_in_Place_in_Massachusetts_1767894946697.png";
import homeCareImage from "@assets/non-medical-caregiver-options-in-greater-boston-ma_1767895133875.png";
import nutritionImage from "@assets/non-medical-caregiver-cost-in-newton-ma-2026_1767895133875.png";
import housingImage from "@assets/non-medical-caregiver-options-wellesley-ma_1767895133875.png";
import communityImage from "@assets/private-inhome-caregiver-non-medical-caregiver-services-cape-c_1767895133875.png";
import supportImage from "@assets/vetting-trusted-in-home-caregivers-agencies-massachusetts-priv_1767894946697.png";
import mobilityImage from "@assets/hire-non-medical-caregiver-marlborough-ma_1767895133875.png";
import medicationImage from "@assets/non-medical-caregiver-providers-plymouth-ma_1767895133875.png";

const emergencyResources = [
  {
    title: "Elder Abuse Hotline",
    phone: "1-800-922-2275",
    description: "Report suspected abuse, neglect, or financial exploitation of elders",
    available: "24/7",
    icon: Shield,
    link: "https://www.mass.gov/how-to/report-elder-abuse"
  },
  {
    title: "Suicide & Crisis Lifeline",
    phone: "988",
    description: "Free, confidential support for people in distress",
    available: "24/7",
    icon: Phone,
    link: "https://988lifeline.org/"
  },
  {
    title: "Poison Control Center",
    phone: "1-800-222-1222",
    description: "Immediate guidance for poisoning emergencies",
    available: "24/7",
    icon: AlertTriangle,
    link: "https://www.poison.org/"
  },
  {
    title: "Mass 211",
    phone: "211",
    description: "Connect to local health and human services programs",
    available: "24/7",
    icon: HelpCircle,
    link: "https://mass211.org/"
  }
];

const asapList = [
  {
    name: "AgeSpan",
    region: "Merrimack Valley & North Shore",
    towns: "Amesbury, Andover, Beverly, Billerica, Boxford, Burlington, Chelmsford, Danvers, Dracut, Essex, Georgetown, Gloucester, Groveland, Hamilton, Haverhill, Ipswich, Lawrence, Lowell, Lynn, Lynnfield, Manchester-by-the-Sea, Marblehead, Merrimac, Methuen, Middleton, Nahant, Newbury, Newburyport, North Andover, North Reading, Peabody, Reading, Rockport, Rowley, Salem, Salisbury, Saugus, Swampscott, Tewksbury, Topsfield, Tyngsborough, Wakefield, Wenham, West Newbury, Westford, Wilmington",
    address: "280 Merrimack Street, Suite 400, Lawrence, MA 01843",
    phone: "(978) 683-7747",
    tollfree: "1-800-892-0890",
    website: "https://www.agespan.org"
  },
  {
    name: "BayPath Elder Services",
    region: "MetroWest",
    towns: "Ashland, Bellingham, Blackstone, Douglas, Framingham, Franklin, Holliston, Hopedale, Hopkinton, Medway, Mendon, Milford, Millis, Millville, Natick, Norfolk, Northbridge, Sherborn, Southborough, Upton, Uxbridge",
    address: "33 Boston Post Road West, Suite 100, Marlborough, MA 01752",
    phone: "(508) 573-7200",
    tollfree: "1-800-287-7284",
    website: "https://www.baypath.org"
  },
  {
    name: "Boston Senior Home Care",
    region: "Boston",
    towns: "Allston, Back Bay, Bay Village, Beacon Hill, Brighton, Charlestown, Chinatown, Dorchester, Downtown, East Boston, Fenway-Kenmore, Hyde Park, Jamaica Plain, Mattapan, Mission Hill, North End, Roslindale, Roxbury, South Boston, South End, West End, West Roxbury",
    address: "89 South Street, Suite 501, Boston, MA 02111",
    phone: "(617) 451-6400",
    tollfree: "1-888-227-0038",
    website: "https://www.bshcinfo.org"
  },
  {
    name: "Bristol Elder Services",
    region: "Bristol County",
    towns: "Acushnet, Attleboro, Berkley, Dartmouth, Dighton, Easton, Fairhaven, Fall River, Freetown, Mansfield, New Bedford, North Attleborough, Norton, Raynham, Rehoboth, Seekonk, Somerset, Swansea, Taunton, Westport",
    address: "1 Father DeValles Blvd, Suite 101, Fall River, MA 02723",
    phone: "(508) 675-2101",
    tollfree: "1-800-427-0509",
    website: "https://www.bristolelder.org"
  },
  {
    name: "Central Massachusetts Agency on Aging",
    region: "North Central MA",
    towns: "Ashburnham, Ashby, Ayer, Berlin, Bolton, Clinton, Devens, Fitchburg, Gardner, Groton, Harvard, Hubbardston, Lancaster, Leominster, Littleton, Lunenburg, Pepperell, Princeton, Shirley, Sterling, Townsend, Westminster, Winchendon",
    address: "360 West Boylston Street, Suite 2, West Boylston, MA 01583",
    phone: "(508) 852-5539",
    tollfree: "1-800-244-3032",
    website: "https://www.seniorconnection.org"
  },
  {
    name: "Chelsea Jewish Lifecare",
    region: "Chelsea & Revere",
    towns: "Chelsea, Revere, Winthrop",
    address: "165 Captains Row, Chelsea, MA 02150",
    phone: "(617) 887-0001",
    tollfree: "",
    website: "https://www.chelseajewish.org"
  },
  {
    name: "Coastline Elderly Services",
    region: "South Coast",
    towns: "Acushnet, Dartmouth, Fairhaven, Freetown, Lakeville, Marion, Mattapoisett, New Bedford, Rochester, Wareham",
    address: "1646 Purchase Street, New Bedford, MA 02740",
    phone: "(508) 999-6400",
    tollfree: "1-800-244-9110",
    website: "https://www.coastlineelderly.org"
  },
  {
    name: "Elder Services of Berkshire County",
    region: "Berkshire County",
    towns: "Adams, Alford, Becket, Cheshire, Clarksburg, Dalton, Egremont, Florida, Great Barrington, Hancock, Hinsdale, Lanesborough, Lee, Lenox, Monterey, Mount Washington, New Ashford, New Marlborough, North Adams, Otis, Peru, Pittsfield, Richmond, Sandisfield, Savoy, Sheffield, Stockbridge, Tyringham, Washington, West Stockbridge, Williamstown, Windsor",
    address: "877 South Street, Suite 4E, Pittsfield, MA 01201",
    phone: "(413) 499-0524",
    tollfree: "1-800-544-5242",
    website: "https://www.esbci.org"
  },
  {
    name: "Elder Services of Cape Cod and the Islands",
    region: "Cape Cod & Islands",
    towns: "Barnstable, Bourne, Brewster, Chatham, Chilmark, Dennis, Eastham, Edgartown, Falmouth, Gosnold, Harwich, Mashpee, Nantucket, Oak Bluffs, Orleans, Provincetown, Sandwich, Tisbury, Truro, Wellfleet, West Tisbury, Yarmouth",
    address: "68 Route 134, South Dennis, MA 02660",
    phone: "(508) 394-4630",
    tollfree: "1-800-244-4630",
    website: "https://www.escci.org"
  },
  {
    name: "Elder Services of the Merrimack Valley",
    region: "Merrimack Valley",
    towns: "Andover, Boxford, Georgetown, Groveland, Haverhill, Lawrence, Methuen, North Andover, West Newbury",
    address: "360 Merrimack Street, Building 5, Lawrence, MA 01843",
    phone: "(978) 683-7747",
    tollfree: "1-800-892-0890",
    website: "https://www.esmv.org"
  },
  {
    name: "Elder Services of Worcester Area",
    region: "Greater Worcester",
    towns: "Auburn, Barre, Boylston, Brookfield, Charlton, Douglas, Dudley, East Brookfield, Grafton, Hardwick, Holden, Leicester, Millbury, New Braintree, North Brookfield, Northborough, Northbridge, Oakham, Oxford, Paxton, Rutland, Shrewsbury, Southbridge, Spencer, Sturbridge, Sutton, Warren, Webster, West Boylston, West Brookfield, Worcester",
    address: "67 Millbrook Street, Suite 100, Worcester, MA 01606",
    phone: "(508) 756-1545",
    tollfree: "1-800-243-5980",
    website: "https://www.eswa.org"
  },
  {
    name: "Franklin County Home Care",
    region: "Franklin County",
    towns: "Ashfield, Bernardston, Buckland, Charlemont, Colrain, Conway, Deerfield, Erving, Gill, Greenfield, Hawley, Heath, Leverett, Leyden, Monroe, Montague, New Salem, Northfield, Orange, Rowe, Shelburne, Shutesbury, Sunderland, Warwick, Wendell, Whately",
    address: "330 Montague City Road, Turners Falls, MA 01376",
    phone: "(413) 773-5555",
    tollfree: "1-800-732-4636",
    website: "https://www.fchcc.org"
  },
  {
    name: "Greater Lynn Senior Services",
    region: "Lynn Area",
    towns: "Lynn, Lynnfield, Nahant, Saugus, Swampscott",
    address: "8 Silsbee Street, Lynn, MA 01901",
    phone: "(781) 599-0110",
    tollfree: "1-800-734-8703",
    website: "https://www.glss.net"
  },
  {
    name: "Greater Springfield Senior Services",
    region: "Greater Springfield",
    towns: "Agawam, Blandford, Brimfield, Chester, Chicopee, East Longmeadow, Granville, Hampden, Holland, Holyoke, Longmeadow, Ludlow, Monson, Montgomery, Palmer, Russell, Southwick, Springfield, Tolland, Wales, West Springfield, Westfield, Wilbraham",
    address: "66 Industry Avenue, Suite 9, Springfield, MA 01104",
    phone: "(413) 781-8800",
    tollfree: "1-800-649-3641",
    website: "https://www.gsssi.org"
  },
  {
    name: "Highland Valley Elder Services",
    region: "Hampshire County",
    towns: "Amherst, Belchertown, Chesterfield, Cummington, Easthampton, Goshen, Granby, Hadley, Hatfield, Huntington, Middlefield, Northampton, Pelham, Plainfield, South Hadley, Southampton, Ware, Westhampton, Williamsburg, Worthington",
    address: "320 Riverside Drive, Suite B, Florence, MA 01062",
    phone: "(413) 586-2000",
    tollfree: "1-800-322-0551",
    website: "https://www.highlandvalley.org"
  },
  {
    name: "Minuteman Senior Services",
    region: "Northwest Suburbs",
    towns: "Acton, Arlington, Bedford, Boxborough, Burlington, Carlisle, Concord, Lexington, Lincoln, Littleton, Maynard, Stow, Wilmington, Winchester, Woburn",
    address: "26 Crosby Drive, Bedford, MA 01730",
    phone: "(781) 272-7177",
    tollfree: "1-888-222-6171",
    website: "https://www.minutemansenior.org"
  },
  {
    name: "Montachusett Home Care",
    region: "North Central MA",
    towns: "Ashburnham, Ashby, Ayer, Berlin, Bolton, Clinton, Fitchburg, Gardner, Groton, Harvard, Holden, Hubbardston, Lancaster, Leominster, Lunenburg, Pepperell, Princeton, Shirley, Sterling, Townsend, Westminster, Winchendon",
    address: "680 Mechanic Street, Leominster, MA 01453",
    phone: "(978) 537-7411",
    tollfree: "1-800-734-7312",
    website: "https://www.montachusetthomecare.com"
  },
  {
    name: "Mystic Valley Elder Services",
    region: "Mystic Valley",
    towns: "Everett, Malden, Medford, Melrose, North Reading, Reading, Stoneham, Wakefield, Winchester",
    address: "300 Commercial Street, Suite 19, Malden, MA 02148",
    phone: "(781) 324-7705",
    tollfree: "1-800-281-0277",
    website: "https://www.mves.org"
  },
  {
    name: "Old Colony Elder Services",
    region: "Plymouth County",
    towns: "Abington, Avon, Bridgewater, Brockton, Carver, Duxbury, East Bridgewater, Halifax, Hanover, Hanson, Kingston, Lakeville, Marshfield, Middleborough, Pembroke, Plymouth, Plympton, Rochester, Rockland, Stoughton, West Bridgewater, Whitman",
    address: "144 Main Street, Brockton, MA 02301",
    phone: "(508) 584-1561",
    tollfree: "1-800-242-4637",
    website: "https://www.oldcolonyelderservices.org"
  },
  {
    name: "SeniorCare Inc.",
    region: "North Shore",
    towns: "Beverly, Danvers, Essex, Gloucester, Hamilton, Ipswich, Manchester-by-the-Sea, Marblehead, Middleton, Peabody, Rockport, Salem, Topsfield, Wenham",
    address: "49 Blackburn Center, Gloucester, MA 01930",
    phone: "(978) 281-1750",
    tollfree: "1-866-927-1050",
    website: "https://www.seniorcareinc.org"
  },
  {
    name: "Somerville-Cambridge Elder Services",
    region: "Cambridge & Somerville",
    towns: "Cambridge, Somerville",
    address: "61 Medford Street, Somerville, MA 02143",
    phone: "(617) 628-2601",
    tollfree: "",
    website: "https://www.eldercare.org"
  },
  {
    name: "South Shore Elder Services",
    region: "South Shore",
    towns: "Braintree, Cohasset, Hingham, Holbrook, Hull, Milton, Norwell, Quincy, Randolph, Scituate, Weymouth",
    address: "159 Bay State Drive, Braintree, MA 02184",
    phone: "(781) 848-3910",
    tollfree: "1-800-242-2311",
    website: "https://www.sselder.org"
  },
  {
    name: "Springwell",
    region: "MetroWest & West Suburbs",
    towns: "Belmont, Brookline, Dover, Needham, Newton, Waltham, Watertown, Wellesley, Weston",
    address: "307 Waverley Oaks Road, Suite 205, Waltham, MA 02452",
    phone: "(617) 926-4100",
    tollfree: "1-800-734-7608",
    website: "https://www.springwell.com"
  },
  {
    name: "TriValley Inc.",
    region: "South Central MA",
    towns: "Bellingham, Blackstone, Douglas, Dover, Foxborough, Franklin, Holliston, Hopedale, Hopkinton, Medfield, Medway, Mendon, Milford, Millis, Millville, Norfolk, Northbridge, Plainville, Sharon, Sherborn, Upton, Uxbridge, Walpole, Wrentham",
    address: "10 Mill Street, Dudley, MA 01571",
    phone: "(508) 949-6640",
    tollfree: "1-800-286-6640",
    website: "https://www.trivalleyinc.org"
  }
];

const coreServices = [
  {
    title: "Home Care Program",
    description: "In-home support services including personal care, homemaking, and companion services for eligible older adults.",
    icon: Home,
    link: "https://www.mass.gov/info-details/home-care-program",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
  },
  {
    title: "Senior Nutrition Program",
    description: "Home-delivered meals (Meals on Wheels) and congregate dining options at senior centers across Massachusetts.",
    icon: Utensils,
    link: "https://www.mass.gov/info-details/senior-nutrition-program",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
  },
  {
    title: "SHINE Program",
    description: "Free, unbiased health insurance counseling for Medicare beneficiaries and their caregivers.",
    icon: Shield,
    link: "https://www.mass.gov/info-details/serving-the-health-insurance-needs-of-everyone-shine-program",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
  },
  {
    title: "Medicare Savings Programs",
    description: "Help paying Medicare premiums, deductibles, and coinsurance for qualifying low-income seniors.",
    icon: DollarSign,
    link: "https://www.mass.gov/info-details/get-help-paying-medicare-costs",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
  },
  {
    title: "Behavioral Health Resources",
    description: "Mental health and substance use support services designed specifically for older adults.",
    icon: Heart,
    link: "https://www.mass.gov/info-details/behavioral-health-resources-for-older-adults",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
  },
  {
    title: "Options Counseling",
    description: "Person-centered planning to help older adults and caregivers understand and access long-term care options.",
    icon: Users,
    link: "https://www.mass.gov/info-details/options-counseling",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
  },
  {
    title: "Protective Services Program",
    description: "Investigation and intervention for cases of elder abuse, neglect, self-neglect, and financial exploitation.",
    icon: Shield,
    link: "https://www.mass.gov/info-details/adult-protective-services-program",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
  },
  {
    title: "Family Caregiver Support",
    description: "Resources, respite care, and support services for family members caring for older adults.",
    icon: Heart,
    link: "https://www.mass.gov/info-details/family-caregiver-support-program",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
  },
  {
    title: "Long-Term Care Ombudsman",
    description: "Advocacy and complaint resolution for residents of nursing homes, rest homes, and assisted living facilities.",
    icon: Scale,
    link: "https://www.mass.gov/info-details/long-term-care-ombudsman-program",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
  }
];

const housingResources = [
  {
    title: "Supportive Housing",
    description: "Assisted living-type services in a residential setting for those who need help with daily activities.",
    link: "https://www.mass.gov/info-details/supportive-housing"
  },
  {
    title: "Congregate Housing",
    description: "Apartments with shared dining and social activities for independent seniors.",
    link: "https://www.mass.gov/info-details/congregate-housing"
  },
  {
    title: "Continuing Care Retirement Communities",
    description: "Communities offering independent living, assisted living, and nursing care on one campus.",
    link: "https://www.mass.gov/lists/continuing-care-retirement-communities"
  },
  {
    title: "Assisted Living Residences",
    description: "Licensed facilities providing 24/7 personal care, medication management, and supportive services.",
    link: "https://www.mass.gov/info-details/assisted-living-certification"
  },
  {
    title: "Public Housing Programs",
    description: "Affordable housing options for low-income seniors throughout Massachusetts.",
    link: "https://www.mass.gov/public-housing"
  },
  {
    title: "Emergency Housing Assistance",
    description: "Resources for seniors facing housing emergencies or homelessness.",
    link: "https://www.mass.gov/emergency-housing-assistance"
  }
];

const additionalResources = [
  {
    title: "Senior Parking Pass",
    description: "Free parking at state-owned facilities for Massachusetts residents 62 and older.",
    link: "https://www.mass.gov/how-to/get-a-senior-parking-pass",
    icon: Car
  },
  {
    title: "Senior Tax Information",
    description: "Tax credits, exemptions, and tips specifically for Massachusetts seniors and retirees.",
    link: "https://www.mass.gov/info-details/massachusetts-tax-information-for-seniors-and-retirees",
    icon: FileText
  },
  {
    title: "SNAP Benefits",
    description: "Supplemental Nutrition Assistance Program (formerly food stamps) for eligible seniors.",
    link: "https://www.mass.gov/snap-benefits-formerly-food-stamps",
    icon: Utensils
  },
  {
    title: "Prescription Advantage",
    description: "State-sponsored prescription drug assistance program for Medicare beneficiaries.",
    link: "https://www.mass.gov/prescription-advantage",
    icon: Pill
  },
  {
    title: "Grandparents Raising Grandchildren",
    description: "Support services and resources for grandparents who are primary caregivers.",
    link: "https://www.mass.gov/info-details/grandparents-raising-grandchildren",
    icon: Users
  },
  {
    title: "Reverse Mortgage Counselors",
    description: "HUD-approved counselors to help seniors understand reverse mortgage options.",
    link: "https://www.mass.gov/info-details/reverse-mortgage-counselors",
    icon: DollarSign
  },
  {
    title: "Money Management Program",
    description: "Budget assistance, bill paying, and banking support for adults 60 and older.",
    link: "https://www.mass.gov/info-details/money-management-program",
    icon: DollarSign
  },
  {
    title: "Accessible Transportation",
    description: "Transportation options and services for seniors and people with disabilities.",
    link: "https://www.mass.gov/topics/accessible-transportation",
    icon: Car
  },
  {
    title: "Extreme Heat Preparation",
    description: "Safety tips and cooling center locations for seniors during heat emergencies.",
    link: "https://www.mass.gov/info-details/preparing-for-extreme-heat",
    icon: Thermometer
  },
  {
    title: "Nursing Home Discharge Help",
    description: "Community Transition Liaison Program helps residents transition from nursing homes to community living.",
    link: "https://www.mass.gov/info-details/community-transition-liaison-program-ctlp",
    icon: Building2
  },
  {
    title: "Councils on Aging",
    description: "Find your local senior center with activities, meals, health programs, and community connections.",
    link: "https://www.mass.gov/info-details/find-your-local-council-on-aging",
    icon: Users
  },
  {
    title: "Guardianship Services",
    description: "Court-appointed guardianship for elders who lack capacity to make decisions due to abuse or neglect.",
    link: "https://www.mass.gov/info-details/guardianship-services",
    icon: Scale
  }
];

const faqs = [
  {
    question: "How do I find my local Aging Services Access Point (ASAP)?",
    answer: "Massachusetts has 24 regional Aging Services Access Points that help older adults access services. You can find your local ASAP on this page, visit mass.gov/info-details/find-your-regional-aging-services-access-point-asap, or call the MassOptions helpline at 1-800-243-4636 (1-800-AGE-INFO)."
  },
  {
    question: "What is the Home Care Program and who qualifies?",
    answer: "The Home Care Program provides in-home services to help older adults (60+) remain living independently. Services include personal care, homemaking, companion services, and more. Eligibility is based on age, functional need, and income. Contact your local ASAP for a free assessment. Learn more at mass.gov/info-details/home-care-program."
  },
  {
    question: "How do I apply for Meals on Wheels?",
    answer: "Contact your local Aging Services Access Point (ASAP) or Council on Aging. They will assess your eligibility based on age (60+), ability to prepare meals, and nutritional needs. Most programs have a suggested donation but no one is denied meals due to inability to pay. Visit mass.gov/info-details/senior-nutrition-program for details."
  },
  {
    question: "What is SHINE and how can it help me?",
    answer: "SHINE (Serving the Health Insurance Needs of Everyone) provides free, unbiased health insurance counseling. SHINE counselors help with Medicare enrollment, plan comparisons, prescription drug coverage, and applications for programs that help pay Medicare costs. Call 1-800-243-4636 to schedule an appointment or visit mass.gov/shine."
  },
  {
    question: "How do I report elder abuse or neglect?",
    answer: "Call the Elder Abuse Hotline at 1-800-922-2275. This line is available 24/7 and all reports are confidential. You can also report online at mass.gov/ReportElderAbuse. Signs of abuse include unexplained injuries, sudden changes in finances, poor hygiene, or fearful behavior around certain people."
  },
  {
    question: "What programs help pay for Medicare costs?",
    answer: "Several programs help with Medicare costs: Medicare Savings Programs pay premiums and may cover deductibles (mass.gov/info-details/get-help-paying-medicare-costs). MassHealth (Medicaid) may cover what Medicare doesn't. The Extra Help program reduces prescription drug costs. Prescription Advantage provides additional coverage (mass.gov/prescription-advantage)."
  },
  {
    question: "How do I find my local Senior Center?",
    answer: "Visit mass.gov/info-details/find-your-local-council-on-aging to find your local Council on Aging/Senior Center. Massachusetts has 351 municipal Councils on Aging. These centers offer social activities, meals, health programs, transportation, and connections to services. Most are free and open to adults 60+."
  },
  {
    question: "What is the difference between a Senior Center and ASAP?",
    answer: "Senior Centers (run by Councils on Aging) offer activities, meals, and local programs at a physical location in your community. ASAPs are regional agencies that assess needs, coordinate services, and connect older adults to programs like home care. Both work together to support seniors. Find your Senior Center at mass.gov/info-details/find-your-local-council-on-aging."
  },
  {
    question: "Are there programs to help grandparents raising grandchildren?",
    answer: "Yes, Massachusetts offers support including respite care, support groups, legal assistance, and financial help. Contact your local ASAP or visit mass.gov/info-details/grandparents-raising-grandchildren for resources specific to kinship caregivers."
  },
  {
    question: "How can I get help transitioning from a nursing home back home?",
    answer: "The Community Transition Liaison Program (CTLP) helps nursing home residents move back to community living. They assist with housing, setting up home care, and connecting to resources. Contact your ASAP or ask the nursing home social worker about CTLP. Learn more at mass.gov/info-details/community-transition-liaison-program-ctlp."
  }
];

export default function AgingResourcesPage() {
  return (
    <>
      <PageSEO
        pageSlug="aging-resources"
        fallbackTitle="Massachusetts Aging Resources | Complete Senior Services Guide | PrivateInHomeCareGiver"
        fallbackDescription="Comprehensive guide to Massachusetts aging resources including all 24 ASAPs, home care, meals on wheels, Medicare help, housing options, and emergency services for older adults."
        canonicalPath="/aging-resources"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="relative py-16 md:py-24">
            <div className="absolute inset-0 z-0">
              <img 
                src={heroImage} 
                alt="Aging in place in Massachusetts"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
            </div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-2xl">
                <Badge variant="secondary" className="mb-4" data-testid="badge-page-type">
                  Official Mass.gov Resources
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6" data-testid="text-page-title">
                  Massachusetts Aging Resources
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Complete guide to services and support for older adults in Massachusetts. 
                  Access programs for home care, nutrition, housing, healthcare, and more from the 
                  Executive Office of Aging & Independence.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" data-testid="button-find-asap">
                    <a href="#asap-directory">
                      Find Your ASAP <MapPin className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" data-testid="button-call-massoptions">
                    <a href="tel:18002434636">
                      <Phone className="mr-2 h-4 w-4" /> Call 1-800-AGE-INFO
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-12 bg-destructive/10">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  <h2 className="text-2xl font-bold text-foreground" data-testid="text-emergency-title">
                    Emergency Resources
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {emergencyResources.map((resource) => (
                    <Card key={resource.title} className="border-destructive/30" data-testid={`card-emergency-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-destructive/10">
                            <resource.icon className="h-5 w-5 text-destructive" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground text-sm">{resource.title}</h3>
                            <a 
                              href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`}
                              className="text-lg font-bold text-destructive hover:underline"
                              data-testid={`link-phone-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              {resource.phone}
                            </a>
                            <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" /> {resource.available}
                              </Badge>
                              <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center">
                                <ExternalLink className="h-3 w-3 mr-1" /> More Info
                              </a>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 items-center mb-12">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-core-services-title">
                      Core Services & Programs
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Essential programs offered by the Massachusetts Executive Office of Aging & Independence 
                      to help older adults live independently and with dignity.
                    </p>
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <p className="font-medium text-foreground mb-2">MassOptions Helpline</p>
                      <a href="tel:18002434636" className="text-2xl font-bold text-primary hover:underline">1-800-243-4636</a>
                      <p className="text-sm text-muted-foreground mt-1">Available in 100+ languages, Mon-Fri 9 AM - 5 PM</p>
                      <p className="text-sm text-muted-foreground">Email: <a href="mailto:information.resources@mass.gov" className="text-primary hover:underline">information.resources@mass.gov</a></p>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={homeCareImage} 
                      alt="Home care consultation in Massachusetts"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coreServices.map((service) => (
                    <Card key={service.title} className="hover-elevate" data-testid={`card-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <CardHeader className="pb-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${service.color} mb-3`}>
                          <service.icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <a href={service.link} target="_blank" rel="noopener noreferrer">
                            Learn More <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 items-center mb-10">
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={mobilityImage} 
                      alt="Caregiver helping senior with mobility"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      Mobility & Independence Support
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Massachusetts offers numerous programs to help seniors maintain their independence and mobility, 
                      including personal care assistance, adaptive equipment, and transportation services.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild>
                        <Link href="/personal-care/massachusetts">Personal Care Services</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <a href="https://www.mass.gov/topics/accessible-transportation" target="_blank" rel="noopener noreferrer">
                          Transportation <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 items-center mb-10">
                  <div className="order-2 lg:order-1">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      Medication & Health Management
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Access prescription assistance programs, medication management support, and health resources 
                      designed specifically for Massachusetts seniors.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild variant="outline">
                        <a href="https://www.mass.gov/prescription-advantage" target="_blank" rel="noopener noreferrer">
                          Prescription Advantage <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/consultation">Schedule Consultation</Link>
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-lg order-1 lg:order-2">
                    <img 
                      src={medicationImage} 
                      alt="Caregiver helping with medication management"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="asap-directory" className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                  <Badge variant="secondary" className="mb-4">24 Regional Agencies</Badge>
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Aging Services Access Points (ASAPs)
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    ASAPs are regional non-profit agencies that assess needs, coordinate services, and connect 
                    older adults to programs like home care, meals, and more. Find your local ASAP below.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {asapList.map((asap) => (
                    <Card key={asap.name} className="hover-elevate" data-testid={`card-asap-${asap.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary mt-1 shrink-0" />
                          <span>{asap.name}</span>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{asap.region}</p>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          <p className="line-clamp-2">{asap.address}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <a href={`tel:${asap.phone.replace(/[^0-9]/g, '')}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {asap.phone}
                          </a>
                          {asap.tollfree && (
                            <a href={`tel:${asap.tollfree.replace(/[^0-9]/g, '')}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                              Toll-free: {asap.tollfree}
                            </a>
                          )}
                        </div>
                        <a 
                          href={asap.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Globe className="h-3 w-3" /> Visit Website <ExternalLink className="h-3 w-3" />
                        </a>
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="towns" className="border-0">
                            <AccordionTrigger className="text-xs py-1 hover:no-underline">
                              View Service Areas
                            </AccordionTrigger>
                            <AccordionContent className="text-xs text-muted-foreground">
                              {asap.towns}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Button asChild variant="outline">
                    <a href="https://www.mass.gov/info-details/find-your-regional-aging-services-access-point-asap" target="_blank" rel="noopener noreferrer">
                      View Interactive Map on Mass.gov <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 items-center mb-10">
                  <div className="rounded-lg overflow-hidden shadow-lg order-2 lg:order-1">
                    <img 
                      src={housingImage} 
                      alt="Senior housing in Massachusetts"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="order-1 lg:order-2">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      Housing Resources
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Housing options and assistance programs for Massachusetts seniors, from independent 
                      living to supportive care environments.
                    </p>
                    <Button asChild variant="outline">
                      <a href="https://www.mass.gov/topics/housing-for-seniors" target="_blank" rel="noopener noreferrer">
                        Explore All Housing Options <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {housingResources.map((resource) => (
                    <a
                      key={resource.title}
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      data-testid={`link-housing-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Card className="hover-elevate h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div>
                              <h3 className="font-semibold text-foreground mb-1">{resource.title}</h3>
                              <p className="text-sm text-muted-foreground">{resource.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 items-center mb-10">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      Additional Resources
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      More programs and services to support Massachusetts seniors including transportation, 
                      financial assistance, healthcare savings, and community programs.
                    </p>
                    <Button asChild variant="outline">
                      <a href="https://www.mass.gov/topics/seniors" target="_blank" rel="noopener noreferrer">
                        View All Senior Resources <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={communityImage} 
                      alt="Community support for seniors in Massachusetts"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {additionalResources.map((resource) => (
                    <a
                      key={resource.title}
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      data-testid={`link-resource-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Card className="hover-elevate h-full">
                        <CardContent className="p-4 text-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            <resource.icon className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground text-sm mb-1">{resource.title}</h3>
                          <p className="text-xs text-muted-foreground">{resource.description}</p>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2">
                    <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-faq-title">
                      Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Common questions about Massachusetts aging services and programs
                    </p>
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`faq-${index}`} data-testid={`accordion-faq-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                  <div className="hidden lg:block">
                    <div className="rounded-lg overflow-hidden shadow-lg sticky top-24">
                      <img 
                        src={supportImage} 
                        alt="Family support for aging loved ones"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4 bg-card">
                        <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Call MassOptions for free assistance finding the right services.
                        </p>
                        <Button asChild className="w-full">
                          <a href="tel:18002434636">
                            <Phone className="mr-2 h-4 w-4" /> 1-800-AGE-INFO
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={nutritionImage} 
                      alt="In-home care support in Massachusetts"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      Prefer In-Home Care?
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Many older adults prefer to age in place with support. Our personal care assistants provide 
                      compassionate in-home care throughout Massachusetts, helping seniors maintain independence 
                      in the comfort of their own homes.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button asChild size="lg" data-testid="button-learn-more-services">
                        <Link href="/services">Our Services</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" data-testid="button-request-consultation">
                        <Link href="/consultation">Request a Consultation</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="bg-card border-t py-10" data-testid="footer-aging-resources">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
              <p>© 2025 Private InHome CareGiver. Serving communities across Massachusetts.</p>
              <p className="mt-2">
                Information on this page is sourced from{" "}
                <a href="https://www.mass.gov/orgs/executive-office-of-aging-independence-age" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Mass.gov Executive Office of Aging & Independence
                </a>
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Link href="/privacy-policy" className="hover:text-primary" data-testid="link-footer-privacy">Privacy Policy</Link>
                <Link href="/terms-and-conditions" className="hover:text-primary" data-testid="link-footer-terms">Terms & Conditions</Link>
                <Link href="/consultation" className="hover:text-primary" data-testid="link-footer-contact">Contact Us</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

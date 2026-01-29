import nursingHomeImg from "@assets/Screenshot_2025-12-10_at_4.08.09_PM_1769694567019.png";
import assistedLivingImg from "@assets/Why_Private_Caregivers_Are_the_Top_Choice_for_Wellesley,_MA_Fa_1769694567041.png";
import memoryCareImg from "@assets/Local_In-Home_Care_Options_for_Seniors_in_Burlington,_MA_1769694567040.png";
import independentLivingImg from "@assets/concierge-care-in-massachusetts-private-inhome-caregiver_1769694567019.png";
import continuingCareImg from "@assets/vetting-trusted-in-home-caregivers-agencies-massachusetts-priv_1769694567018.png";
import hospiceImg from "@assets/private-in-home-caregivers-senior-lives-massachusetts_1769694567019.png";
import hospitalImg from "@assets/private_in-home_caregiver_assisting_an_elderly_person_in_a_hom_1769694567035.png";

export const FACILITY_TYPE_IMAGES: Record<string, { hero: string; thumbnail: string; alt: string }> = {
  "nursing-home": {
    hero: nursingHomeImg,
    thumbnail: nursingHomeImg,
    alt: "Professional nursing home care facility"
  },
  "assisted-living": {
    hero: assistedLivingImg,
    thumbnail: assistedLivingImg,
    alt: "Assisted living community for seniors"
  },
  "memory-care": {
    hero: memoryCareImg,
    thumbnail: memoryCareImg,
    alt: "Memory care facility for dementia and Alzheimer's patients"
  },
  "independent-living": {
    hero: independentLivingImg,
    thumbnail: independentLivingImg,
    alt: "Independent living senior community"
  },
  "continuing-care": {
    hero: continuingCareImg,
    thumbnail: continuingCareImg,
    alt: "Continuing care retirement community"
  },
  "hospice": {
    hero: hospiceImg,
    thumbnail: hospiceImg,
    alt: "Hospice and palliative care facility"
  },
  "hospital": {
    hero: hospitalImg,
    thumbnail: hospitalImg,
    alt: "Massachusetts hospital and medical center"
  }
};

export function getFacilityTypeImage(facilityType: string): { hero: string; thumbnail: string; alt: string } {
  return FACILITY_TYPE_IMAGES[facilityType] || FACILITY_TYPE_IMAGES["nursing-home"];
}

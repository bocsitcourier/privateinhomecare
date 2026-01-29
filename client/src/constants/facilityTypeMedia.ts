import nursingHomeImg from "@assets/Screenshot_2025-12-10_at_4.08.09_PM_1769694567019.png";
import assistedLivingImg from "@assets/Why_Private_Caregivers_Are_the_Top_Choice_for_Wellesley,_MA_Fa_1769694567041.png";
import memoryCareImg from "@assets/Local_In-Home_Care_Options_for_Seniors_in_Burlington,_MA_1769694567040.png";
import independentLivingImg from "@assets/concierge-care-in-massachusetts-private-inhome-caregiver_1769694567019.png";
import continuingCareImg from "@assets/vetting-trusted-in-home-caregivers-agencies-massachusetts-priv_1769694567018.png";
import hospiceImg from "@assets/private-in-home-caregivers-senior-lives-massachusetts_1769694567019.png";
import hospitalImg from "@assets/private_in-home_caregiver_assisting_an_elderly_person_in_a_hom_1769694567035.png";

export const FACILITY_TYPE_IMAGES: Record<string, { hero: string; thumbnail: string; alt: string; title: string }> = {
  "nursing-home": {
    hero: nursingHomeImg,
    thumbnail: nursingHomeImg,
    alt: "Massachusetts nursing home facilities - Compare with private in-home senior care alternatives",
    title: "Nursing Homes Massachusetts - Private In-Home Care Alternative"
  },
  "assisted-living": {
    hero: assistedLivingImg,
    thumbnail: assistedLivingImg,
    alt: "Massachusetts assisted living communities for seniors - Private pay care options available",
    title: "Assisted Living Massachusetts - Private Senior Care Options"
  },
  "memory-care": {
    hero: memoryCareImg,
    thumbnail: memoryCareImg,
    alt: "Massachusetts memory care facilities for dementia and Alzheimer's - Private home care alternative",
    title: "Memory Care Massachusetts - Private Dementia Care at Home"
  },
  "independent-living": {
    hero: independentLivingImg,
    thumbnail: independentLivingImg,
    alt: "Massachusetts independent living senior communities - Private in-home support services",
    title: "Independent Living Massachusetts - Private Home Care Support"
  },
  "continuing-care": {
    hero: continuingCareImg,
    thumbnail: continuingCareImg,
    alt: "Massachusetts continuing care retirement communities - Private pay senior care options",
    title: "CCRC Massachusetts - Private Continuing Care Options"
  },
  "hospice": {
    hero: hospiceImg,
    thumbnail: hospiceImg,
    alt: "Massachusetts hospice and palliative care facilities - Private in-home hospice support",
    title: "Hospice Care Massachusetts - Private Home Hospice Services"
  },
  "hospital": {
    hero: hospitalImg,
    thumbnail: hospitalImg,
    alt: "Massachusetts hospitals and medical centers - Private in-home care after hospital discharge",
    title: "Massachusetts Hospitals - Private Post-Hospital Care"
  }
};

export function getFacilityTypeImage(facilityType: string): { hero: string; thumbnail: string; alt: string; title: string } {
  return FACILITY_TYPE_IMAGES[facilityType] || FACILITY_TYPE_IMAGES["nursing-home"];
}

import nursingHomeImg from "@assets/stock_images/elderly_care_caregiv_71009293.jpg";
import assistedLivingImg from "@assets/stock_images/elderly_care_caregiv_283cf488.jpg";
import memoryCareImg from "@assets/stock_images/senior_dementia_alzh_a04ebee0.jpg";
import independentLivingImg from "@assets/stock_images/elderly_senior_care__9dce600a.jpg";
import continuingCareImg from "@assets/stock_images/elderly_care_caregiv_2dabe619.jpg";
import hospiceImg from "@assets/stock_images/family_caregiver_wit_aee9cbea.jpg";
import hospitalImg from "@assets/stock_images/elderly_senior_care__aea077be.jpg";

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

import nursingHomeImg from "@assets/images/facility-types/nursing-home.png";
import assistedLivingImg from "@assets/images/facility-types/assisted-living.png";
import memoryCareImg from "@assets/images/facility-types/memory-care.png";
import independentLivingImg from "@assets/images/facility-types/independent-living.png";
import continuingCareImg from "@assets/images/facility-types/continuing-care.png";
import hospiceImg from "@assets/images/facility-types/hospice.png";
import hospitalImg from "@assets/images/facility-types/hospital.png";

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

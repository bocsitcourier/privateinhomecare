import personalCareImg from "@assets/in-home-care-bidmc-discharge-boston_1769694632453.png";
import companionshipImg from "@assets/non-medical-caregiver-cost-cambridge-ma_1769694632458.png";
import homemakingImg from "@assets/guide-to-in-home-support-for-seniors-discharged-from-hospital_1769694632455.png";
import dementiaCareImg from "@assets/how-to-choose-the-right-in-home-care-after-hebrew-senior-life-_1769694632449.png";
import respiteCareImg from "@assets/private-in-home-care-boston-medical-center_1769694632455.png";
import liveInCareImg from "@assets/private-in-home-care-after-discharge-greater-boston_1769694632456.png";
import postHospitalCareImg from "@assets/in-home-help-after-hospital-discharge-boston_1769694632453.png";
import hospiceCareImg from "@assets/in-home-help-costs-mass-general-boston_1769694632454.png";

export const CARE_TYPE_IMAGES: Record<string, { hero: string; thumbnail: string; alt: string }> = {
  "personal-care": {
    hero: personalCareImg,
    thumbnail: personalCareImg,
    alt: "Caregiver providing personal care assistance to elderly client"
  },
  "companionship": {
    hero: companionshipImg,
    thumbnail: companionshipImg,
    alt: "Companion caregiver engaging with senior client"
  },
  "homemaking": {
    hero: homemakingImg,
    thumbnail: homemakingImg,
    alt: "Professional home care and homemaking services"
  },
  "dementia-care": {
    hero: dementiaCareImg,
    thumbnail: dementiaCareImg,
    alt: "Specialized dementia and Alzheimer's care support"
  },
  "respite-care": {
    hero: respiteCareImg,
    thumbnail: respiteCareImg,
    alt: "Respite care providing relief for family caregivers"
  },
  "live-in-care": {
    hero: liveInCareImg,
    thumbnail: liveInCareImg,
    alt: "24/7 live-in caregiver assistance at home"
  },
  "post-hospital-care": {
    hero: postHospitalCareImg,
    thumbnail: postHospitalCareImg,
    alt: "Post-hospital recovery care and support services"
  },
  "hospice-palliative-care": {
    hero: hospiceCareImg,
    thumbnail: hospiceCareImg,
    alt: "Compassionate hospice and palliative care support"
  }
};

export function getCareTypeImage(careType: string): { hero: string; thumbnail: string; alt: string } {
  return CARE_TYPE_IMAGES[careType] || CARE_TYPE_IMAGES["personal-care"];
}

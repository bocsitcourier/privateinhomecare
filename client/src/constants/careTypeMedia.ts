import personalCareImg from "@assets/stock_images/elderly_care_caregiv_e43826bf.jpg";
import companionshipImg from "@assets/stock_images/senior_companion_car_36a9cbbd.jpg";
import homemakingImg from "@assets/stock_images/professional_home_ca_b42d5493.jpg";
import dementiaCareImg from "@assets/stock_images/dementia_alzheimer_e_33623aa0.jpg";
import respiteCareImg from "@assets/stock_images/respite_care_break_c_9c0cb1f6.jpg";
import liveInCareImg from "@assets/stock_images/elderly_care_caregiv_3d01a824.jpg";
import postHospitalCareImg from "@assets/stock_images/elderly_senior_care__4a0f33b0.jpg";
import hospiceCareImg from "@assets/stock_images/family_caregiver_wit_2b3524ad.jpg";

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

import personalCareImg from "@assets/images/care-types/personal-care.png";
import companionshipImg from "@assets/images/care-types/companionship.png";
import homemakingImg from "@assets/images/care-types/homemaking.png";
import dementiaCareImg from "@assets/images/care-types/dementia-care.png";
import respiteCareImg from "@assets/images/care-types/respite-care.png";
import liveInCareImg from "@assets/images/care-types/live-in-care.png";
import postHospitalCareImg from "@assets/images/care-types/post-hospital-care.png";
import hospiceCareImg from "@assets/images/care-types/hospice-care.png";

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

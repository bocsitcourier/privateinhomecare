import personalCareImg from "@assets/in-home-care-bidmc-discharge-boston_1769694632453.png";
import companionshipImg from "@assets/senior-companionship-care-service.png";
import homemakingImg from "@assets/guide-to-in-home-support-for-seniors-discharged-from-hospital_1769694632455.png";
import dementiaCareImg from "@assets/how-to-choose-the-right-in-home-care-after-hebrew-senior-life-_1769694632449.png";
import respiteCareImg from "@assets/private-in-home-care-boston-medical-center_1769694632455.png";
import liveInCareImg from "@assets/private-in-home-care-after-discharge-greater-boston_1769694632456.png";
import postHospitalCareImg from "@assets/in-home-help-after-hospital-discharge-boston_1769694632453.png";
import hospiceCareImg from "@assets/in-home-help-costs-mass-general-boston_1769694632454.png";

export const CARE_TYPE_IMAGES: Record<string, { hero: string; thumbnail: string; alt: string; title: string }> = {
  "personal-care": {
    hero: personalCareImg,
    thumbnail: personalCareImg,
    alt: "Private pay personal care assistance for seniors in Massachusetts - Boston, Cambridge, Newton caregivers",
    title: "Personal Care Services - Private In-Home Senior Care Massachusetts"
  },
  "companionship": {
    hero: companionshipImg,
    thumbnail: companionshipImg,
    alt: "Private companion caregiver engaging with elderly client in Massachusetts home - Greater Boston area",
    title: "Companionship Care - Private Senior Services Massachusetts"
  },
  "homemaking": {
    hero: homemakingImg,
    thumbnail: homemakingImg,
    alt: "Professional private pay homemaking services for seniors in Massachusetts - Light housekeeping and meal prep",
    title: "Homemaking Services - Private In-Home Care Massachusetts"
  },
  "dementia-care": {
    hero: dementiaCareImg,
    thumbnail: dementiaCareImg,
    alt: "Specialized private dementia and Alzheimer's care support for seniors in Massachusetts - Memory care at home",
    title: "Dementia Care - Private Memory Care Services Massachusetts"
  },
  "respite-care": {
    hero: respiteCareImg,
    thumbnail: respiteCareImg,
    alt: "Private respite care providing relief for Massachusetts family caregivers - Temporary senior care support",
    title: "Respite Care - Private Family Caregiver Relief Massachusetts"
  },
  "live-in-care": {
    hero: liveInCareImg,
    thumbnail: liveInCareImg,
    alt: "24/7 private live-in caregiver assistance for seniors in Massachusetts - Round-the-clock home care",
    title: "Live-In Care - 24/7 Private Senior Care Massachusetts"
  },
  "post-hospital-care": {
    hero: postHospitalCareImg,
    thumbnail: postHospitalCareImg,
    alt: "Private post-hospital recovery care for seniors after Massachusetts hospital discharge - Boston area",
    title: "Post-Hospital Care - Private Recovery Support Massachusetts"
  },
  "hospice-palliative-care": {
    hero: hospiceCareImg,
    thumbnail: hospiceCareImg,
    alt: "Compassionate private hospice and palliative care support for seniors in Massachusetts - End-of-life care",
    title: "Hospice Care - Private Palliative Support Massachusetts"
  }
};

export function getCareTypeImage(careType: string): { hero: string; thumbnail: string; alt: string; title: string } {
  return CARE_TYPE_IMAGES[careType] || CARE_TYPE_IMAGES["personal-care"];
}

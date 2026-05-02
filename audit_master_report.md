# Massachusetts Care Facilities — Master Audit Report

  **Generated:** 2026-05-02T18:05:28.148Z
  **Scope:** All 796 published Massachusetts care facilities across 5 audit batches.

  ---

  ## Executive Summary

  This report aggregates the findings from five parallel audit batches that examined every facility in the `facilities` table against six audit dimensions: description quality, phone number, website, FAQs, images, and business status.

  | Metric | Count |
  |---|---|
  | Facilities audited | **796** |
  | Total issues found | **1269** |
  | CRITICAL issues | **767** |
  | WARNING issues | **179** |
  | INFO issues | **323** |
  | Auto-fixes applied | **8** |

  **Headline findings**

  - **593 facilities (74.5%)** still have generic, sub-50-character descriptions like "Nursing home in Salem, MA". This is the single largest content quality gap in the directory.
  - **70 facilities** use template-style descriptions starting with phrases such as "Nursing home in" or "Assisted living in".
  - **207 websites** include tracking parameters (utm_, fbclid) which should be stripped to keep canonical URLs clean.
  - **79 hero images** point at Google Places URLs that do not contain the facility's own `google_place_id` — they are showing a *different* facility's photo.
  - **56 FAQ answers** referenced "our main phone number" generically; **8 of those were auto-fixed** in this audit run by replacing the placeholder with the facility's real phone number.
  - **19 facilities** are marked `business_status = CLOSED_PERMANENTLY` but remain published.

  ---

  ## Issues by Type and Severity

  | Issue Type | Severity | Count | % of Facilities |
  |---|---|---:|---:|
  | GENERIC_DESCRIPTION | CRITICAL | 593 | 74.5% |
| TRACKING_URL | INFO | 207 | 26.0% |
| MISSING_LOCATION_CONTEXT | INFO | 116 | 14.6% |
| SHORT_DESCRIPTION | WARNING | 80 | 10.1% |
| IMAGE_MISMATCH | WARNING | 79 | 9.9% |
| TEMPLATE_DESCRIPTION | CRITICAL | 70 | 8.8% |
| GENERIC_PHONE_IN_FAQ | CRITICAL | 56 | 7.0% |
| MISSING_WEBSITE | CRITICAL | 34 | 4.3% |
| CLOSED_FACILITY_PUBLISHED | WARNING | 19 | 2.4% |
| MISSING_PHONE | CRITICAL | 14 | 1.8% |
| INVALID_PHONE_FORMAT | WARNING | 1 | 0.1% |

  ### Per-batch breakdown

  | Batch | Audited | CRITICAL | WARNING | INFO | Auto-fixes |
  |---|---:|---:|---:|---:|---:|
  | 1 | 160 | 130 | 39 | 93 | 0 |
| 2 | 160 | 142 | 32 | 39 | 0 |
| 3 | 160 | 142 | 35 | 63 | 0 |
| 4 | 160 | 145 | 40 | 62 | 8 |
| 5 | 156 | 208 | 33 | 66 | 0 |

  ---

  ## Top 20 Worst Facilities (Most Critical Issues)

  These facilities should be prioritised for manual content remediation. Score = 3×CRITICAL + 2×WARNING + 1×INFO.

  | # | Facility | Type | City | CRIT | WARN | INFO | Score |
  |---:|---|---|---|---:|---:|---:|---:|
  | 1 | Golden Living | nursing-home | Attleboro | 7 | 1 | 0 | 23 |
| 2 | Pleasant Bay Nursing | nursing-home | Brewster | 7 | 1 | 0 | 23 |
| 3 | Linden Ponds Way | nursing-home | Hingham | 7 | 0 | 0 | 21 |
| 4 | Linden Street | nursing-home | Taunton | 7 | 0 | 0 | 21 |
| 5 | Newbury Court | nursing-home | Concord | 7 | 0 | 0 | 21 |
| 6 | Sunrise Avenue | assisted-living | Chelmsford | 7 | 0 | 0 | 21 |
| 7 | Beaumont Rehab Worcester | nursing-home | Worcester | 6 | 1 | 0 | 20 |
| 8 | Brookdale Avenue | assisted-living | Dedham | 6 | 0 | 0 | 18 |
| 9 | Brookdale Circle | assisted-living | Billerica | 6 | 0 | 0 | 18 |
| 10 | Brookdale Circle | assisted-living | Shrewsbury | 6 | 0 | 0 | 18 |
| 11 | Brookdale Road | assisted-living | Newton | 6 | 0 | 0 | 18 |
| 12 | Salem Crossing | assisted-living | Salem | 6 | 0 | 0 | 18 |
| 13 | Tewksbury Senior Center | independent-living | Tewksbury | 6 | 0 | 0 | 18 |
| 14 | Gloucester Crossing | assisted-living | Gloucester | 5 | 0 | 0 | 15 |
| 15 | Masconomet Rehabilitation & Healthcare Center | nursing-home | Topsfield | 5 | 0 | 0 | 15 |
| 16 | Millers River Environmental Center | nursing-home | Athol | 5 | 0 | 0 | 15 |
| 17 | Southborough Nursing Home | nursing-home | Southborough | 2 | 1 | 1 | 9 |
| 18 | Sunrise Memory Care Natick | memory-care | Natick | 2 | 1 | 1 | 9 |
| 19 | West Roxbury Memory Care | memory-care | West Roxbury | 2 | 1 | 1 | 9 |
| 20 | Weymouth CCRC | continuing-care | Weymouth | 2 | 1 | 1 | 9 |

  ### Issues for the Top 20

  **1. Golden Living** (Attleboro — `0e86c459-deb9-4e7e-b3ac-32943c23a688`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 38 chars: 'Skilled nursing facility in Attleboro.'
- `CRITICAL` **MISSING_PHONE** — Phone missing/empty
- `CRITICAL` **MISSING_WEBSITE** — Website missing
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone
- `WARNING` **CLOSED_FACILITY_PUBLISHED** — Facility is permanently closed but still published

**2. Pleasant Bay Nursing** (Brewster — `03352850-2b8e-4809-bc9e-5ea965d752f9`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 25 chars: 'Nursing care in Brewster.'
- `CRITICAL` **MISSING_PHONE** — Phone is missing
- `CRITICAL` **MISSING_WEBSITE** — Website is missing
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Where is Pleasant Bay Nursing located?' contained 'our main phone number'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'How do I contact Pleasant Bay Nursing?' contained 'our main phone number'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'What is the admission process at Pleasant Bay Nursing?' contained 'our main phone number'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Can I schedule a tour of Pleasant Bay Nursing?' contained 'our main phone number'
- `WARNING` **CLOSED_FACILITY_PUBLISHED** — CLOSED_PERMANENTLY but status published

**3. Linden Ponds Way** (Hingham — `b6ddd6df-570a-4ae0-8168-9ab3beca46e3`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 32 chars: 'Retirement community in Hingham.'
- `CRITICAL` **MISSING_PHONE** — Phone missing/empty
- `CRITICAL` **MISSING_WEBSITE** — Website missing
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone

**4. Linden Street** (Taunton — `9909ae40-481b-4600-a6aa-ace577dda51e`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 24 chars: 'Nursing care in Taunton.'
- `CRITICAL` **MISSING_PHONE** — Phone missing/empty
- `CRITICAL` **MISSING_WEBSITE** — Website missing
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone

**5. Newbury Court** (Concord — `cd1a6028-fd42-465f-8a09-baa124d31913`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 29 chars: 'Nursing residence in Concord.'
- `CRITICAL` **MISSING_PHONE** — Phone is missing
- `CRITICAL` **MISSING_WEBSITE** — Website is missing
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Where is Newbury Court located?' contained 'our main phone number'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'How do I contact Newbury Court?' contained 'our main phone number'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'What is the admission process at Newbury Court?' contained 'our main phone number'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Can I schedule a tour of Newbury Court?' contained 'our main phone number'

**6. Sunrise Avenue** (Chelmsford — `1fbbc0f5-bc8d-4257-9dbf-384d351dfd27`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 30 chars: 'Assisted living in Chelmsford.'
- `CRITICAL` **TEMPLATE_DESCRIPTION** — Starts with template prefix: 'Assisted living in Chelmsford.'
- `CRITICAL` **MISSING_PHONE** — Phone is missing
- `CRITICAL` **MISSING_WEBSITE** — Website is missing
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Where is Sunrise Of Chelmsford located?' used generic phone text
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'How do I contact Sunrise Of Chelmsford?' used generic phone text
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Can I schedule a tour of Sunrise Of Chelmsford?' used generic phone text

**7. Beaumont Rehab Worcester** (Worcester — `a2291e72-b411-4661-881a-f95d596fbee4`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 28 chars: 'Rehabilitation in Worcester.'
- `CRITICAL` **MISSING_PHONE** — Phone missing or invalid
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Where is Beaumont Rehab Worcester located?' uses generic 'our main phone number'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'How do I contact Beaumont Rehab Worcester?' uses generic 'our main phone number'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'What is the admission process at Beaumont Rehab Worcester?' uses generic 'our main phone number'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Can I schedule a tour of Beaumont Rehab Worcester?' uses generic 'our main phone number'
- `WARNING` **CLOSED_FACILITY_PUBLISHED** — Facility is closed permanently but still published

**8. Brookdale Avenue** (Dedham — `f4c466f5-b90a-44ba-ad26-316788063b47`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is only 26 chars: 'Assisted living in Dedham.'
- `CRITICAL` **MISSING_PHONE** — Phone is missing
- `CRITICAL` **MISSING_WEBSITE** — Website is missing
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Where is Brookdale Dedham located?' used generic phone text
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'How do I contact Brookdale Dedham?' used generic phone text
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Can I schedule a tour of Brookdale Dedham?' used generic phone text

**9. Brookdale Circle** (Billerica — `0ee7a054-b5d4-4702-bdc5-81d494482cbe`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is only 29 chars: 'Assisted living in Billerica.'
- `CRITICAL` **MISSING_PHONE** — Phone is missing
- `CRITICAL` **MISSING_WEBSITE** — Website is missing
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Where is Brookdale Billerica located?' used generic phone text
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'How do I contact Brookdale Billerica?' used generic phone text
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Can I schedule a tour of Brookdale Billerica?' used generic phone text

**10. Brookdale Circle** (Shrewsbury — `1c536f71-196c-4e14-98f5-9ef8d1585265`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is only 30 chars: 'Assisted living in Shrewsbury.'
- `CRITICAL` **MISSING_PHONE** — Phone is missing
- `CRITICAL` **MISSING_WEBSITE** — Website is missing
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Where is Brookdale Shrewsbury located?' used generic phone text
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'How do I contact Brookdale Shrewsbury?' used generic phone text
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Can I schedule a tour of Brookdale Shrewsbury?' used generic phone text

**11. Brookdale Road** (Newton — `aa3d03d9-3ce5-4279-947c-5b60711a3545`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is only 24 chars: 'Senior living in Newton.'
- `CRITICAL` **MISSING_PHONE** — Phone is missing
- `CRITICAL` **MISSING_WEBSITE** — Website is missing
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Where is Brookdale Newton located?' used generic phone text
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'How do I contact Brookdale Newton?' used generic phone text
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Can I schedule a tour of Brookdale Newton?' used generic phone text

**12. Salem Crossing** (Salem — `305c22ac-d68b-47aa-9d5e-4996fcec5b65`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 25 chars: 'Assisted living in Salem.'
- `CRITICAL` **MISSING_PHONE** — Phone is missing
- `CRITICAL` **MISSING_WEBSITE** — Website is missing
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Where is Salem Crossing located?' contained 'our main phone number'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'How do I contact Salem Crossing?' contained 'our main phone number'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Can I schedule a tour of Salem Crossing?' contained 'our main phone number'

**13. Tewksbury Senior Center** (Tewksbury — `09362355-798c-46b4-b6cb-522490c48244`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 32 chars: 'Independent living in Tewksbury.'
- `CRITICAL` **TEMPLATE_DESCRIPTION** — Starts with template prefix: 'Independent living in Tewksbury.'
- `CRITICAL` **MISSING_PHONE** — Phone is missing
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Where is Tewksbury Senior Living located?' used generic phone text
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'How do I contact Tewksbury Senior Living?' used generic phone text
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Can I schedule a tour of Tewksbury Senior Living?' used generic phone text

**14. Gloucester Crossing** (Gloucester — `2a4530d5-d8d7-41d1-9262-417f5afed3ca`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 30 chars: 'Assisted living in Gloucester.'
- `CRITICAL` **MISSING_PHONE** — Phone missing/empty
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ has 'our main phone number' but facility has no phone

**15. Masconomet Rehabilitation & Healthcare Center** (Topsfield — `b42e8a95-74cc-4a5f-a646-9a08ced3bb96`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 24 chars: 'Healthcare in Topsfield.'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Where is Masconomet Healthcare located?' contained 'our main phone number' _(auto-fixed)_
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'How do I contact Masconomet Healthcare?' contained 'our main phone number' _(auto-fixed)_
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'What is the admission process at Masconomet Healthcare?' contained 'our main phone number' _(auto-fixed)_
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Can I schedule a tour of Masconomet Healthcare?' contained 'our main phone number' _(auto-fixed)_

**16. Millers River Environmental Center** (Athol — `976ce744-75fe-48bf-b29b-bb3feb412edc`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 20 chars: 'Healthcare in Athol.'
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Where is Millers River Healthcare located?' contained 'our main phone number' _(auto-fixed)_
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'How do I contact Millers River Healthcare?' contained 'our main phone number' _(auto-fixed)_
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'What is the admission process at Millers River Healthcare?' contained 'our main phone number' _(auto-fixed)_
- `CRITICAL` **GENERIC_PHONE_IN_FAQ** — FAQ 'Can I schedule a tour of Millers River Healthcare?' contained 'our main phone number' _(auto-fixed)_

**17. Southborough Nursing Home** (Southborough — `8b4475a7-5209-41a1-9d78-8eb1a518a771`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 29 chars: 'Nursing home in Southborough.'
- `CRITICAL` **TEMPLATE_DESCRIPTION** — Starts with template prefix: 'Nursing home in Southborough.'
- `WARNING` **INVALID_PHONE_FORMAT** — Phone '020 3936 2586' not in (XXX) XXX-XXXX format
- `INFO` **TRACKING_URL** — Website contains tracking params: https://www.careuk.com/care-homes/southborough-surbiton?utm_source=Organic&utm_medium=GMB&utm_campaign=Southborough

**18. Sunrise Memory Care Natick** (Natick — `ee1415a9-a9b9-4a91-843b-a85ce3b40c05`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 22 chars: 'Memory care in Natick.'
- `CRITICAL` **TEMPLATE_DESCRIPTION** — Starts with template prefix: 'Memory care in Natick.'
- `INFO` **TRACKING_URL** — Website contains tracking params: https://www.sunriseseniorliving.com/communities/ma/sunrise-of-wayland?utm_source=directory_listings&utm_medium=clicks&utm_campaign=google
- `WARNING` **IMAGE_MISMATCH** — Hero image is Google Places URL but does not contain google_place_id

**19. West Roxbury Memory Care** (West Roxbury — `a8e5d715-ab00-454c-afb1-c61b8936e234`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 28 chars: 'Memory care in West Roxbury.'
- `CRITICAL` **TEMPLATE_DESCRIPTION** — Starts with template prefix: 'Memory care in West Roxbury.'
- `INFO` **TRACKING_URL** — Website contains tracking params: https://www.bridgesbyepoch.com/communities/westwood-ma/?utm_source=gmb&utm_medium=organic&utm_content=gmb-website
- `WARNING` **IMAGE_MISMATCH** — Hero image is Google Places URL but does not contain google_place_id

**20. Weymouth CCRC** (Weymouth — `59edaacf-5a49-4e01-8e49-8bfde75670c4`)
- `CRITICAL` **GENERIC_DESCRIPTION** — Description is 28 chars: 'Continuing care in Weymouth.'
- `CRITICAL` **TEMPLATE_DESCRIPTION** — Starts with template prefix: 'Continuing care in Weymouth.'
- `INFO` **TRACKING_URL** — Website contains tracking params: https://www.monarchcommunities.com/the-current-southshore?utm_source=gmb&utm_medium=organic&utm_content=gmb-website
- `WARNING` **IMAGE_MISMATCH** — Hero image is Google Places URL but does not contain google_place_id

---

  ## Auto-Fixes Applied

  8 FAQ answers were updated in place during this audit run.

  | Facility | Fix Type | Detail |
|---|---|---|
| Masconomet Rehabilitation & Healthcare Center | GENERIC_PHONE_IN_FAQ | FAQ 'Where is Masconomet Healthcare located?' contained 'our main phone number' |
| Masconomet Rehabilitation & Healthcare Center | GENERIC_PHONE_IN_FAQ | FAQ 'How do I contact Masconomet Healthcare?' contained 'our main phone number' |
| Masconomet Rehabilitation & Healthcare Center | GENERIC_PHONE_IN_FAQ | FAQ 'What is the admission process at Masconomet Healthcare?' contained 'our main phone number' |
| Masconomet Rehabilitation & Healthcare Center | GENERIC_PHONE_IN_FAQ | FAQ 'Can I schedule a tour of Masconomet Healthcare?' contained 'our main phone number' |
| Millers River Environmental Center | GENERIC_PHONE_IN_FAQ | FAQ 'Where is Millers River Healthcare located?' contained 'our main phone number' |
| Millers River Environmental Center | GENERIC_PHONE_IN_FAQ | FAQ 'How do I contact Millers River Healthcare?' contained 'our main phone number' |
| Millers River Environmental Center | GENERIC_PHONE_IN_FAQ | FAQ 'What is the admission process at Millers River Healthcare?' contained 'our main phone number' |
| Millers River Environmental Center | GENERIC_PHONE_IN_FAQ | FAQ 'Can I schedule a tour of Millers River Healthcare?' contained 'our main phone number' |

  > Auto-fix rules used:
  > 1. `facility_faqs.answer` containing the literal string "our main phone number" was rewritten to substitute the facility's actual `phone` value (only when phone is non-null).
  > 2. `facility_faqs.answer` containing the literal string "our website" with no http(s) URL in the same answer was rewritten to substitute the facility's actual `website` value (only when website is non-null).

  ---

  ## Facilities Needing Manual Attention (by Issue Type)

  The following sections list every facility flagged for each issue type. These cannot be auto-fixed and require human judgment or content writing.

  ### GENERIC_DESCRIPTION (593 facilities)

| Facility | Type | City | Detail |
|---|---|---|---|
| Academy Manor | nursing-home | Andover | Description is 40 chars: 'Skilled nursing facility in Andover, MA.' |
| Acton Memory Care | memory-care | Acton | Description is 21 chars: 'Memory care in Acton.' |
| Addison Gilbert Hospital Nursing | nursing-home | Gloucester | Description is 31 chars: 'Hospital nursing in Gloucester.' |
| Amedisys Hospice Cambridge | hospice | Cambridge | Description is 26 chars: 'Hospice care in Cambridge.' |
| Amedisys Hospice Medford | hospice | Medford | Description is 24 chars: 'Hospice care in Medford.' |
| Amedisys Hospice New Bedford | hospice | New Bedford | Description is 28 chars: 'Hospice care in New Bedford.' |
| Amedisys Hospice Northampton | hospice | Northampton | Description is 28 chars: 'Hospice care in Northampton.' |
| Amedisys Hospice Norwood | hospice | Norwood | Description is 24 chars: 'Hospice care in Norwood.' |
| Amedisys Hospice Worcester | hospice | Worcester | Description is 26 chars: 'Hospice care in Worcester.' |
| Amesbury Village | nursing-home | Amesbury | Description is 48 chars: 'Medicare rehab and nursing facility in Amesbury.' |
| Amherst Senior Residences | independent-living | Amherst | Description is 30 chars: 'Independent living in Amherst.' |
| Anna Jaques Hospital Nursing | nursing-home | Newburyport | Description is 32 chars: 'Hospital nursing in Newburyport.' |
| Apple Rehab Grafton | nursing-home | Grafton | Description is 26 chars: 'Rehabilitation in Grafton.' |
| Apple Valley Center | nursing-home | Ayer | Description is 32 chars: 'Medicare rehab facility in Ayer.' |
| Applewood CCRC | continuing-care | Amherst | Description is 41 chars: 'Pioneer Valley continuing care community.' |
| Arbor Place At Taunton | nursing-home | Taunton | Description is 27 chars: 'Skilled nursing in Taunton.' |
| Arlington Memory Care | memory-care | Arlington | Description is 25 chars: 'Memory care in Arlington.' |
| Armenian Nursing & Rehab Center | nursing-home | Boston | Description is 32 chars: 'Cultural nursing care in Boston.' |
| Ashland Farm At North Andover | nursing-home | North Andover | Description is 29 chars: 'Senior care in North Andover.' |
| Atria At Arborpoint | assisted-living | Needham | Description is 27 chars: 'Assisted living in Needham.' |
| Atria At Methuen | assisted-living | Methuen | Description is 27 chars: 'Assisted living in Methuen.' |
| Atria Canton | assisted-living | Canton | Description is 26 chars: 'Assisted living in Canton.' |
| Atria Dracut | assisted-living | Dracut | Description is 26 chars: 'Assisted living in Dracut.' |
| Atria Fairhaven | assisted-living | Fairhaven | Description is 29 chars: 'Assisted living in Fairhaven.' |
| Atria Haverhill | assisted-living | Haverhill | Description is 29 chars: 'Assisted living in Haverhill.' |
| Atria Holliston | assisted-living | Holliston | Description is 29 chars: 'Assisted living in Holliston.' |
| Atria Holyoke | assisted-living | Holyoke | Description is 27 chars: 'Assisted living in Holyoke.' |
| Atria Leominster | assisted-living | Leominster | Description is 30 chars: 'Assisted living in Leominster.' |
| Atria Longmeadow Place | assisted-living | Burlington | Description is 30 chars: 'Assisted living in Burlington.' |
| Atria Marina Place | assisted-living | Quincy | Description is 37 chars: 'Waterfront assisted living in Quincy.' |
| Atria Marland Place | assisted-living | Andover | Description is 37 chars: 'Assisted living community in Andover.' |
| Atria Memory Care Beverly | memory-care | Beverly | Description is 23 chars: 'Memory care in Beverly.' |
| Atria Memory Care Canton | memory-care | Canton | Description is 22 chars: 'Memory care in Canton.' |
| Atria Memory Care Hingham | memory-care | Hingham | Description is 23 chars: 'Memory care in Hingham.' |
| Atria Memory Care Leominster | memory-care | Leominster | Description is 26 chars: 'Memory care in Leominster.' |
| Atria Memory Care Lexington | memory-care | Lexington | Description is 25 chars: 'Memory care in Lexington.' |
| Atria Memory Care Lynn | memory-care | Lynn | Description is 20 chars: 'Memory care in Lynn.' |
| Atria Memory Care Needham | memory-care | Needham | Description is 23 chars: 'Memory care in Needham.' |
| Atria Memory Care Pittsfield | memory-care | Pittsfield | Description is 26 chars: 'Memory care in Pittsfield.' |
| Atria Revere | assisted-living | Revere | Description is 26 chars: 'Assisted living in Revere.' |
| Atria Tyngsborough | assisted-living | Tyngsborough | Description is 32 chars: 'Assisted living in Tyngsborough.' |
| Atria Weymouth | assisted-living | Weymouth | Description is 28 chars: 'Assisted living in Weymouth.' |
| Atria Wilmington | assisted-living | Wilmington | Description is 30 chars: 'Assisted living in Wilmington.' |
| Attleboro CCRC | continuing-care | Attleboro | Description is 29 chars: 'Continuing care in Attleboro.' |
| Attleboro Memory Care | memory-care | Attleboro | Description is 25 chars: 'Memory care in Attleboro.' |
| Attleboro Senior Living | assisted-living | Attleboro | Description is 29 chars: 'Assisted living in Attleboro.' |
| Baker Katz Nursing Home | nursing-home | Haverhill | Description is 26 chars: 'Nursing home in Haverhill.' |
| Baldwinville Nursing Home | nursing-home | Baldwinville | Description is 37 chars: 'Skilled nursing care in Baldwinville.' |
| Barnstable CCRC | continuing-care | Hyannis | Description is 25 chars: 'Mid-Cape continuing care.' |
| Baystate Medical Center Nursing | nursing-home | Springfield | Description is 38 chars: 'Medical center nursing in Springfield.' |

_...and 543 more. See per-batch JSON files for the complete list._

### TRACKING_URL (207 facilities)

| Facility | Type | City | Detail |
|---|---|---|---|
| Amedisys Hospice Cambridge | hospice | Cambridge | Website has tracking params: 'https://locations.amedisys.com/ma/charlestown/hospice-4419/?utm_source=google&utm_medium=organic&utm_campaign=locallisting' |
| Amedisys Hospice Medford | hospice | Medford | Website has tracking params: 'https://locations.amedisys.com/ma/charlestown/hospice-4419/?utm_source=google&utm_medium=organic&utm_campaign=locallisting' |
| Amedisys Hospice New Bedford | hospice | New Bedford | Website has tracking params: 'https://locations.amedisys.com/nh/bedford/palliative-care-0921/?utm_source=google&utm_medium=organic&utm_campaign=locallisting' |
| Amedisys Hospice Worcester | hospice | Worcester | Website has tracking params: 'https://locations.amedisys.com/ma/marlborough/hospice-4458/?utm_source=google&utm_medium=organic&utm_campaign=locallisting' |
| Amherst Senior Residences | independent-living | Amherst | Website has tracking params: 'https://arborsassistedliving.com/amherst-massachussetts-assisted-living-memory-care-near-you/?utm_source=google&utm_medium=organic&utm_campaign=gmbamherst' |
| Apple Rehab Grafton | nursing-home | Grafton | Website has tracking params: 'https://www.perennialrecovery.com/?utm_campaign=gmb' |
| Applewood CCRC | continuing-care | Amherst | Website has tracking params: 'https://www.loomiscommunities.org/communities/applewood/?utm_source=google&utm_medium=organic&utm_campaign=gmb-listing-applewood' |
| Arbor Place At Taunton | nursing-home | Taunton | Website has tracking params: 'https://arborsassistedliving.com/taunton-massachussetts-assisted-living-memory-care-near-you/?utm_source=google&utm_medium=organic&utm_campaign=gmbtaunton' |
| Ashland Farm At North Andover | nursing-home | North Andover | Website has tracking params: 'https://www.benchmarkseniorliving.com/senior-living/ma/north-andover/ashland-farm-at-north-andover/?utm_source=google&utm_medium=local-listings&utm_campaign=comm-afa' |
| Atria At Methuen | assisted-living | Methuen | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-marland-place-andover-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Atria Dracut | assisted-living | Dracut | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-marland-place-andover-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Atria Fairhaven | assisted-living | Fairhaven | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-fairhaven-fairhaven-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Atria Fairhaven | assisted-living | New Bedford | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-fairhaven-fairhaven-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Atria Haverhill | assisted-living | Haverhill | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-merrimack-place-newburyport-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Atria Holliston | assisted-living | Holliston | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-draper-place-hopedale-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Atria Holyoke | assisted-living | Holyoke | Website has tracking params: 'https://sarawoodassistedliving.com/?utm_source=google&utm_medium=organic&utm_campaign=gmb' |
| Atria Longmeadow Place | assisted-living | Burlington | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-longmeadow-place-burlington-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Atria Marina Place | assisted-living | Quincy | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-marina-place-north-quincy-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Atria Marland Place | assisted-living | Andover | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-marland-place-andover-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Atria Memory Care Beverly | memory-care | Beverly | Website has tracking params: 'https://theherrickhouse.org/?utm_campaign=gmb&utm_content=herrick-house&utm_medium=organic&utm_source=google' |
| Atria Memory Care Leominster | memory-care | Leominster | Website has tracking params: 'https://www.sunriseseniorliving.com/communities/ma/sunrise-of-leominster?utm_source=directory_listings&utm_medium=clicks&utm_campaign=google' |
| Atria Memory Care Lynn | memory-care | Lynn | Website has tracking params: 'https://www.sunriseseniorliving.com/communities/ma/sunrise-of-lynnfield?utm_source=directory_listings&utm_medium=clicks&utm_campaign=google' |
| Atria Merrimack Place | assisted-living | Newburyport | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-merrimack-place-newburyport-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Atria Revere | assisted-living | Revere | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-maplewood-place-malden-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Atria Wilmington | assisted-living | Wilmington | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-longmeadow-place-burlington-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Atria Woodbriar Place | assisted-living | Hyannis | Website has tracking params: 'https://atriaseniorliving.com/retirement-communities/atria-woodbriar-place-falmouth-ma/?utm_source=GMB&utm_medium=Chatmeter' |
| Attleboro Memory Care | memory-care | Attleboro | Website has tracking params: 'https://www.benchmarkseniorliving.com/senior-living/ma/north-attleboro/the-branches-of-north-attleboro/?utm_source=google&utm_medium=local-listings&utm_campaign=comm-nab' |
| Beacon Hospice - Boston | hospice | Boston | Website has tracking params: 'https://locations.amedisys.com/ma/charlestown/hospice-4419/?utm_source=google&utm_medium=organic&utm_campaign=locallisting' |
| Beacon Hospice - Charlestown | hospice | Charlestown | Website has tracking params: 'https://locations.amedisys.com/ma/charlestown/hospice-4419/?utm_source=google&utm_medium=organic&utm_campaign=locallisting' |
| Beacon Hospice - Leominster | hospice | Leominster | Website has tracking params: 'https://locations.amedisys.com/ma/leominster/hospice-4421/?utm_source=google&utm_medium=organic&utm_campaign=locallisting' |
| Beacon Hospice Brockton | hospice | Brockton | Website has tracking params: 'https://locations.amedisys.com/ma/plymouth/hospice-4425/?utm_source=google&utm_medium=organic&utm_campaign=locallisting' |
| Beacon Hospice Everett | hospice | Everett | Website has tracking params: 'https://locations.amedisys.com/ma/charlestown/hospice-4419/?utm_source=google&utm_medium=organic&utm_campaign=locallisting' |
| Beacon Hospice Fall River | hospice | Fall River | Website has tracking params: 'https://locations.amedisys.com/ma/fall-river/hospice-4420/?utm_source=google&utm_medium=organic&utm_campaign=locallisting' |
| Beacon Hospice Fitchburg | hospice | Fitchburg | Website has tracking params: 'https://locations.amedisys.com/ma/leominster/hospice-4421/?utm_source=google&utm_medium=organic&utm_campaign=locallisting' |
| Beacon Hospice Lawrence | hospice | Lawrence | Website has tracking params: 'https://locations.amedisys.com/ma/lawrence/palliative-care-4473/?utm_source=google&utm_medium=organic&utm_campaign=locallisting' |
| Beaumont At Westborough | nursing-home | Westborough | Website has tracking params: 'https://salmonhealth.com/locations/beaumont-at-westborough/?utm_source=google&utm_medium=organic' |
| Beaumont Northborough | nursing-home | Northborough | Website has tracking params: 'https://salmonhealth.com/locations/beaumont-at-northborough/?utm_source=google&utm_medium=organic' |
| Benchmark At Andover | assisted-living | Andover | Website has tracking params: 'https://www.benchmarkseniorliving.com/senior-living/ma/north-andover/ashland-farm-at-north-andover/?utm_source=google&utm_medium=local-listings&utm_campaign=comm-afa' |
| Benchmark At Brockton | assisted-living | Brockton | Website has tracking params: 'https://www.benchmarkseniorliving.com/senior-living/ma/hanover/benchmark-at-hanover/?utm_source=google&utm_medium=local-listings&utm_campaign=comm-han' |
| Benchmark At Fitchburg | assisted-living | Fitchburg | Website has tracking params: 'https://www.benchmarkseniorliving.com/senior-living/ma/leominster/benchmark-senior-living-at-leominster-crossings/?utm_source=google&utm_medium=local-listings&utm_campaign=comm-lx' |
| Benchmark At Framingham | assisted-living | Framingham | Website has tracking params: 'https://www.benchmarkseniorliving.com/senior-living/ma/framingham/the-branches-of-framingham/?utm_source=google&utm_medium=local-listings&utm_campaign=comm-frm' |
| Benchmark At Hopkinton | assisted-living | Hopkinton | Website has tracking params: 'https://www.windsorcommunities.com/properties/windsor-at-hopkinton/?utm_campaign=GoogleMyBusiness' |
| Benchmark At Lowell | assisted-living | Lowell | Website has tracking params: 'https://www.benchmarkseniorliving.com/senior-living/ma/chelmsford/benchmark-senior-living-at-chelmsford-crossings/?utm_source=google&utm_medium=local-listings&utm_campaign=comm-cx' |
| Benchmark At Lynn | assisted-living | Lynn | Website has tracking params: 'https://www.benchmarkseniorliving.com/senior-living/ma/danvers/benchmark-senior-living-at-putnam-farm/?utm_source=google&utm_medium=local-listings&utm_campaign=comm-dan' |
| Benchmark At Medford | assisted-living | Medford | Website has tracking params: 'https://www.benchmarkseniorliving.com/senior-living/ma/waltham/benchmark-senior-living-at-waltham-crossings/?utm_source=google&utm_medium=local-listings&utm_campaign=comm-wx' |
| Benchmark At Plymouth Crossings | assisted-living | Plymouth | Website has tracking params: 'https://www.benchmarkseniorliving.com/senior-living/ma/plymouth/benchmark-senior-living-at-plymouth-crossings/?utm_source=google&utm_medium=local-listings&utm_campaign=comm-px' |
| Benchmark At Reading | assisted-living | Reading | Website has tracking params: 'https://www.benchmarkseniorliving.com/senior-living/ma/woburn/benchmark-senior-living-at-woburn/?utm_source=google&utm_medium=local-listings&utm_campaign=comm-wbn' |
| Benchmark At Stoughton | assisted-living | Stoughton | Website has tracking params: 'https://www.bellstoughton.com/?utm_source=google+local&utm_medium=organic&utm_campaign=website+link+beacon' |
| Benchmark At Wellesley | assisted-living | Wellesley | Website has tracking params: 'https://www.waterstonesl.com/wellesley/?utm_source=gmb&utm_medium=organic&utm_content=gmb-website' |
| Benchmark At Winchester | assisted-living | Winchester | Website has tracking params: 'https://www.benchmarkseniorliving.com/senior-living/ma/woburn/benchmark-senior-living-at-woburn/?utm_source=google&utm_medium=local-listings&utm_campaign=comm-wbn' |

_...and 157 more. See per-batch JSON files for the complete list._

### MISSING_LOCATION_CONTEXT (116 facilities)

| Facility | Type | City | Detail |
|---|---|---|---|
| AccentCare Hospice | hospice | Auburn | Description doesn't mention city 'Auburn' |
| Addison Gilbert Hospital Skilled Nursing | nursing-home | Gloucester | Description doesn't mention city 'Gloucester' |
| All Care Hospice | hospice | Lynn | Description doesn't mention city 'Lynn' |
| Allerton House Duxbury | assisted-living | Duxbury | Description doesn't mention city 'Duxbury' |
| Ascend Hospice | hospice | Marlborough | Description doesn't mention city 'Marlborough' |
| AseraCare - Boston | hospice | Wellesley Hills | Description doesn't mention city 'Wellesley Hills' |
| Atria Woodbriar Place | assisted-living | Hyannis | Description doesn't mention city 'Hyannis' |
| Baystate Franklin Medical Center | hospital | Greenfield | Description doesn't mention city 'Greenfield' |
| Baystate Hospice | hospice | Milford | Description doesn't mention city 'Milford' |
| Baystate Medical Center | hospital | Springfield | Description doesn't mention city 'Springfield' |
| Benchmark Senior Living at Shrewsbury Crossings | memory-care | Leominster | Description doesn't mention city 'Leominster' |
| Berkshire Hills CCRC | continuing-care | Pittsfield | Description doesn't mention city 'Pittsfield' |
| Berkshire Hospice Care | hospice | Pittsfield | Description doesn't mention city 'Pittsfield' |
| Berkshire Medical Center | hospital | Pittsfield | Description doesn't mention city 'Pittsfield' |
| Berkshire Place Skilled Nursing | nursing-home | Pittsfield | Description doesn't mention city 'Pittsfield' |
| Beth Israel Deaconess Medical Center | hospital | Boston | Description doesn't mention city 'Boston' |
| Blueberry Hill Rehabilitation & Healthcare | nursing-home | Swampscott | Description doesn't mention city 'Swampscott' |
| Brewster CCRC | continuing-care | Brewster | Description doesn't mention city 'Brewster' |
| Brigham and Women's Hospital | hospital | Boston | Description doesn't mention city 'Boston' |
| Brightview Danvers | memory-care | Haverhill | Description doesn't mention city 'Haverhill' |
| Broad Reach Healthcare Hospice | hospice | Chatham | Description doesn't mention city 'Chatham' |
| Broad Reach Hospice Care | hospice | North Chatham | Description doesn't mention city 'North Chatham' |
| Brookdale Attleboro | memory-care | Attleboro | Description does not mention city 'Attleboro' |
| Brookhaven Hospice | hospice | Westborough | Description does not mention city 'Westborough' |
| Brooksby Village | independent-living | Brookline | Description does not mention city 'Brookline' |
| Brooksby Village CCRC | continuing-care | Peabody | Description does not mention city 'Peabody' |
| Cadbury Commons of Cambridge | assisted-living | Cambridge | Description does not mention city 'Cambridge' |
| Cape Cod Hospital | hospital | Hyannis | Description does not mention city 'Hyannis' |
| Cape Cod Senior Residences at Pocasset | independent-living | Sandwich | Description does not mention city 'Sandwich' |
| Care Dimensions (Administrative offices) | hospice | Danvers | Description does not mention city 'Danvers' |
| Center For Extended Care at Amherst | nursing-home | Amherst | Description does not mention city 'Amherst' |
| Chelsea Continuing Care Community | continuing-care | Chelsea | Description does not mention city 'Chelsea' |
| Chicopee CCRC | continuing-care | Chicopee | Description does not mention city 'Chicopee' |
| Christopher Heights of Worcester | assisted-living | Shrewsbury | Description does not mention city 'Shrewsbury' |
| Colony Center for Health & Rehabilitation | nursing-home | Brockton | Description does not mention city 'Brockton' |
| Community Nurse & Hospice Care | hospice | Fairhaven | Description does not mention city 'Fairhaven' |
| Cooley Dickinson Hospital | hospital | Northampton | Description does not mention city 'Northampton' |
| Cooley Dickinson VNA & Hospice | hospice | Northampton | Description does not mention city 'Northampton' |
| Dana-Farber Cancer Institute | hospital | Boston | Description does not mention city 'Boston' |
| Dedham Manor CCRC | continuing-care | Dedham | Description does not mention city 'Dedham' |
| Emerson Hospital Hospice | hospice | Concord | Description does not mention city 'Concord' |
| Fairview Hospital | hospital | Great Barrington | Description does not mention city 'Great Barrington' |
| Fidelis Hospice | hospice | Haverhill | Description doesn't mention city 'Haverhill' |
| Franklin County Nursing Home | nursing-home | Greenfield | Description doesn't mention city 'Greenfield' |
| Gentiva Hospice | hospice | Marlborough | Description doesn't mention city 'Marlborough' |
| Good Shepherd Community Care | hospice | Newton | Description doesn't mention city 'Newton' |
| Hallmark Health VNA & Hospice | hospice | Malden | Description doesn't mention city 'Malden' |
| Hallmark Health VNA & Hospice | hospice | Malden | Description doesn't mention city 'Malden' |
| Hancock Park Rehabilitation & Nursing Center | nursing-home | Quincy | Description doesn't mention city 'Quincy' |
| Harbor View Memory Care | memory-care | Boston | Description doesn't mention city 'Boston' |

_...and 66 more. See per-batch JSON files for the complete list._

### SHORT_DESCRIPTION (80 facilities)

| Facility | Type | City | Detail |
|---|---|---|---|
| Addison Gilbert Hospital Skilled Nursing | nursing-home | Gloucester | Description is short (96 chars) |
| Allerton House Duxbury | assisted-living | Duxbury | Description is short (86 chars) |
| Armbrook Village | memory-care | Longmeadow | Description is short (91 chars) |
| Artis Senior Living of Lexington | assisted-living | Lexington | Description is short (98 chars) |
| Ascend Hospice | hospice | Marlborough | Description is short (149 chars) |
| Atria Fairhaven | assisted-living | New Bedford | Description is short (86 chars) |
| Atria Merrimack Place | assisted-living | Newburyport | Description is short (104 chars) |
| Atria Woodbriar Place | assisted-living | Hyannis | Description is short (95 chars) |
| Avita of Needham | assisted-living | Needham | Description is short (106 chars) |
| Benchmark Senior Living at Shrewsbury Crossings | memory-care | Leominster | Description is short (84 chars) |
| Benchmark Senior Living at Waltham Crossings | memory-care | Concord | Description is short (113 chars) |
| Berkshire Hills CCRC | continuing-care | Pittsfield | Description is short (76 chars) |
| Berkshire Place Skilled Nursing | nursing-home | Pittsfield | Description is short (83 chars) |
| Blueberry Hill Rehabilitation & Healthcare | nursing-home | Swampscott | Description is short (99 chars) |
| Brewster CCRC | continuing-care | Brewster | Description is short (92 chars) |
| Brightview Danvers | memory-care | Haverhill | Description is short (105 chars) |
| Brookdale Attleboro | memory-care | Attleboro | Description is 92 chars |
| Brookdale Salem | assisted-living | Salem | Description is 102 chars |
| Brooksby Village | independent-living | Brookline | Description is 96 chars |
| Brooksby Village CCRC | continuing-care | Peabody | Description is 112 chars |
| Buckley Greenfield Healthcare Center | assisted-living | Greenfield | Description is 100 chars |
| Buckley Healthcare Center | independent-living | Deerfield | Description is 74 chars |
| Cadbury Commons of Cambridge | assisted-living | Cambridge | Description is 122 chars |
| Cape Cod Senior Residences at Pocasset | independent-living | Sandwich | Description is 81 chars |
| Center For Extended Care at Amherst | nursing-home | Amherst | Description is 93 chars |
| Charlton Memorial Hospital Extended Care | nursing-home | Fall River | Description is 94 chars |
| Chelsea Continuing Care Community | continuing-care | Chelsea | Description is 131 chars |
| Chicopee CCRC | continuing-care | Chicopee | Description is 78 chars |
| Christopher Heights of Northampton | assisted-living | Northampton | Description is 82 chars |
| Christopher Heights of Worcester | assisted-living | Shrewsbury | Description is 87 chars |
| Colony Center for Health & Rehabilitation | nursing-home | Abington | Description is 60 chars |
| Colony Center for Health & Rehabilitation | nursing-home | Brockton | Description is 105 chars |
| Country Estates Of Agawam | nursing-home | Agawam | Description is 64 chars |
| Dedham Manor CCRC | continuing-care | Dedham | Description is 99 chars |
| Franklin County Nursing Home | nursing-home | Greenfield | Description is 76 chars |
| Hallmark Health VNA & Hospice | hospice | Malden | Description is 143 chars |
| Hancock Park Rehabilitation & Nursing Center | nursing-home | Quincy | Description is 101 chars |
| Harbor View Memory Care | memory-care | Boston | Description is 125 chars |
| HealthAlliance-Clinton Hospital TCU | nursing-home | Fitchburg | Description is 87 chars |
| Heritage Hall East | nursing-home | Holyoke | Description is 86 chars |
| Hospice of Western & Central Massachusetts | hospice | Feeding Hills | Description is 141 chars |
| JML Care Center | nursing-home | Falmouth | Description is 75 chars |
| Kimball Farms | independent-living | Great Barrington | Description is 88 chars |
| Kimball Farms | assisted-living | Pittsfield | Description is 87 chars |
| Lasell Village CCRC | continuing-care | Newton | Description is 51 chars |
| Lawrence Valley CCRC | continuing-care | Lawrence | Description is 100 chars |
| Life Care Center Of Acton | nursing-home | Acton | Description is 56 chars |
| Life Care Center of Auburn | nursing-home | Worcester | Description is 78 chars |
| Life Care Center of Merrimack Valley | nursing-home | Lowell | Description is 119 chars |
| Linda Manor Extended Care | independent-living | Hadley | Description is 83 chars |

_...and 30 more. See per-batch JSON files for the complete list._

### IMAGE_MISMATCH (79 facilities)

| Facility | Type | City | Detail |
|---|---|---|---|
| Amedisys Hospice Norwood | hospice | Norwood | Hero image is Google Places URL but doesn't contain google_place_id ChIJg0tOuIt_5IkR7-hYajWkyK4 |
| Apple Rehab Grafton | nursing-home | Grafton | Hero image is Google Places URL but doesn't contain google_place_id ChIJW55FDCcL5IkRS1gexf17pG0 |
| Arlington Memory Care | memory-care | Arlington | Hero image is Google Places URL but doesn't contain google_place_id ChIJQyDXS0F244kR-x6bHLAvRos |
| Atria Leominster | assisted-living | Leominster | Hero image is Google Places URL but doesn't contain google_place_id ChIJx8ZFsKro44kRfGaW6A7MnXY |
| Atria Memory Care Canton | memory-care | Canton | Hero image is Google Places URL but doesn't contain google_place_id ChIJQeRZNJGB5IkRKAioiNRB7f0 |
| Atria Memory Care Hingham | memory-care | Hingham | Hero image is Google Places URL but doesn't contain google_place_id ChIJ_zsmgCJi44kRissAjCIHk3M |
| Atria Memory Care Lexington | memory-care | Lexington | Hero image is Google Places URL but doesn't contain google_place_id ChIJoZBGSRSd44kRmPVqiWILwEM |
| Atria Wilmington | assisted-living | Wilmington | Hero image is Google Places URL but doesn't contain google_place_id ChIJcTFEMTKe44kRx33DsNXIPdI |
| Benchmark At Lynn | assisted-living | Lynn | Hero image is Google Places URL but doesn't contain google_place_id ChIJ-xsKe3ER44kRlS81v93r3LQ |
| Benchmark At Medford | assisted-living | Medford | Hero image is Google Places URL but doesn't contain google_place_id ChIJp3w6I_Cc44kRXbSoP-b8aos |
| Benchmark At Northampton | assisted-living | Northampton | Hero image is Google Places URL but doesn't contain google_place_id ChIJ66-sQG3X5okRowmaYtGfYp0 |
| Benchmark At Stoughton | assisted-living | Stoughton | Hero image is Google Places URL but doesn't contain google_place_id ChIJy230ArGD5IkRV-KT40E8WVU |
| Benchmark At Tewksbury | assisted-living | Tewksbury | Hero image is Google Places URL but doesn't contain google_place_id ChIJgeHo6NWm44kRJlIz-08MeNM |
| Benchmark At Winchester | assisted-living | Winchester | Hero image is Google Places URL but doesn't contain google_place_id ChIJ8dpntet044kRuHWVknMFDPs |
| Benchmark Memory Care Longmeadow | memory-care | Longmeadow | Hero image is Google Places URL but doesn't contain google_place_id ChIJD_lwY-Pl5okRo7AD6DHM03s |
| Benchmark Memory Care Stoughton | memory-care | Stoughton | Hero image is Google Places URL but doesn't contain google_place_id ChIJF5w7ONSG5IkRC9jYlO0bowY |
| Benchmark Senior Living at Shrewsbury Crossings | memory-care | Leominster | Hero image is Google Places URL but doesn't contain google_place_id ChIJw_zakb3o44kRafoQrmJodQk |
| Billerica Senior Residences | independent-living | Billerica | Hero image is Google Places URL but doesn't contain google_place_id ChIJbxIEW2ij44kRsHoUGuJmFM0 |
| Boston Senior Living at Beacon Hill | assisted-living | Boston | Hero image is Google Places URL but doesn't contain google_place_id ChIJa8NrWAp644kR_QAZm1ABGeo |
| Brookdale Chelsea | assisted-living | Chelsea | Google Places URL does not contain facility's google_place_id |
| Brookdale Memory Care Milton | memory-care | Milton | Google Places URL does not contain facility's google_place_id |
| Brookdale Memory Care Newton | memory-care | Newton | Google Places URL does not contain facility's google_place_id |
| Brookdale Wakefield | assisted-living | Wakefield | Google Places URL does not contain facility's google_place_id |
| Cape Cod Senior Residences | nursing-home | Hyannis | Google Places URL does not contain facility's google_place_id |
| Cape Memory Care Yarmouth | memory-care | West Yarmouth | Google Places URL does not contain facility's google_place_id |
| Cohasset CCRC | continuing-care | Cohasset | Google Places URL does not contain facility's google_place_id |
| Compassus - Taunton | hospice | Taunton | Google Places URL does not contain facility's google_place_id |
| Concord Memory Care | memory-care | Concord | Google Places URL does not contain facility's google_place_id |
| Danvers Specialty Care | nursing-home | Danvers | Google Places URL does not contain facility's google_place_id |
| Dennis Health Care | nursing-home | Dennis | Google Places URL does not contain facility's google_place_id |
| Epoch Senior Healthcare Harwich | nursing-home | Harwich | Google Places URL does not contain facility's google_place_id |
| Framingham CCRC | continuing-care | Framingham | Google Places hero URL doesn't contain google_place_id |
| Gardner CCRC | continuing-care | Gardner | Google Places hero URL doesn't contain google_place_id |
| Gardner Memory Care | memory-care | Gardner | Google Places hero URL doesn't contain google_place_id |
| Gentiva Hospice Lowell | hospice | Lowell | Google Places hero URL doesn't contain google_place_id |
| Gloucester Senior Living | independent-living | Gloucester | Google Places hero URL doesn't contain google_place_id |
| Good Samaritan Medical Center | hospital | Brockton | Google Places hero URL doesn't contain google_place_id |
| Holyoke Memory Care | memory-care | Holyoke | Google Places hero URL doesn't contain google_place_id |
| Hospice of Greater Brockton | hospice | Brockton | Google Places hero URL doesn't contain google_place_id |
| Ipswich Care | nursing-home | Ipswich | Google Places hero URL doesn't contain google_place_id |
| John Adams Healthcare | nursing-home | Quincy | Google Places hero URL doesn't contain google_place_id |
| Kingston Nursing Home | nursing-home | Kingston | Google Places hero URL doesn't contain google_place_id |
| Lawrence Valley CCRC | continuing-care | Lawrence | Google Places hero URL doesn't contain google_place_id |
| Linda Manor CCRC | continuing-care | Leeds | Google Places hero URL doesn't contain google_place_id |
| Marblehead Crossing | assisted-living | Marblehead | Google Places URL does not contain google_place_id |
| Marblehead Nursing Home | nursing-home | Marblehead | Google Places URL does not contain google_place_id |
| Milford Regional Nursing | nursing-home | Milford | Google Places URL does not contain google_place_id |
| New Bedford CCRC | continuing-care | New Bedford | Google Places URL does not contain google_place_id |
| Newburyport Senior Living | assisted-living | Newburyport | Google Places URL does not contain google_place_id |
| Newburyport Senior Living | independent-living | Newburyport | Google Places URL does not contain google_place_id |

_...and 29 more. See per-batch JSON files for the complete list._

### TEMPLATE_DESCRIPTION (70 facilities)

| Facility | Type | City | Detail |
|---|---|---|---|
| Salem Senior Living | independent-living | Salem | Starts with template prefix: 'Independent living in Salem.' |
| Salisbury Nursing Home | nursing-home | Salisbury | Starts with template prefix: 'Nursing home in Salisbury.' |
| Saugus Nursing Home | nursing-home | Saugus | Starts with template prefix: 'Nursing home in Saugus.' |
| Seasons Hospice | hospice | Wellesley | Starts with template prefix: 'Hospice care in Wellesley.' |
| Seasons Hospice Holyoke | hospice | Holyoke | Starts with template prefix: 'Hospice care in Holyoke.' |
| Seasons Hospice Leominster | hospice | Leominster | Starts with template prefix: 'Hospice care in Leominster.' |
| Seasons Hospice Methuen | hospice | Methuen | Starts with template prefix: 'Hospice care in Methuen.' |
| Seasons Hospice Pittsfield | hospice | Pittsfield | Starts with template prefix: 'Hospice care in the Berkshires.' |
| Seasons Hospice Quincy | hospice | Quincy | Starts with template prefix: 'Hospice care in Quincy.' |
| Shrewsbury Nursing Home | nursing-home | Shrewsbury | Starts with template prefix: 'Nursing home in Shrewsbury.' |
| Shrewsbury Senior Residences | independent-living | Shrewsbury | Starts with template prefix: 'Independent living in Shrewsbury.' |
| South Cove Manor Nursing Home | nursing-home | Boston | Starts with template prefix: 'Nursing home in Chinatown.' |
| Southborough Nursing Home | nursing-home | Southborough | Starts with template prefix: 'Nursing home in Southborough.' |
| Springfield Senior Residences | independent-living | Springfield | Starts with template prefix: 'Independent living in Springfield.' |
| Stoneham Senior Living | independent-living | Stoneham | Starts with template prefix: 'Independent living in Stoneham.' |
| Sudbury Memory Care | memory-care | Sudbury | Starts with template prefix: 'Memory care in Sudbury.' |
| Sunrise Avenue | assisted-living | Chelmsford | Starts with template prefix: 'Assisted living in Chelmsford.' |
| Sunrise Memory Care Andover | memory-care | Andover | Starts with template prefix: 'Memory care in Andover.' |
| Sunrise Memory Care Cohasset | memory-care | Cohasset | Starts with template prefix: 'Memory care in Cohasset.' |
| Sunrise Memory Care Lowell | memory-care | Lowell | Starts with template prefix: 'Memory care in Lowell.' |
| Sunrise Memory Care Natick | memory-care | Natick | Starts with template prefix: 'Memory care in Natick.' |
| Sunrise Memory Care Norwood | memory-care | Norwood | Starts with template prefix: 'Memory care in Norwood.' |
| Sunrise Memory Care Peabody | memory-care | Peabody | Starts with template prefix: 'Memory care in Peabody.' |
| Sunrise Memory Care Springfield | memory-care | Springfield | Starts with template prefix: 'Memory care in Springfield.' |
| Sunrise Memory Care Weymouth | memory-care | Weymouth | Starts with template prefix: 'Memory care in Weymouth.' |
| Sunrise Memory Care Worcester | memory-care | Worcester | Starts with template prefix: 'Memory care in Worcester.' |
| Sunrise Of Beverly | assisted-living | Beverly | Starts with template prefix: 'Assisted living in Beverly.' |
| Sunrise Of Burlington | assisted-living | Burlington | Starts with template prefix: 'Assisted living in Burlington.' |
| Sunrise Of Cohasset | assisted-living | Cohasset | Starts with template prefix: 'Assisted living in Cohasset.' |
| Sunrise Of Hingham | assisted-living | Hingham | Starts with template prefix: 'Assisted living in Hingham.' |
| Sunrise Of Hudson | assisted-living | Hudson | Starts with template prefix: 'Assisted living in Hudson.' |
| Sunrise Of Malden | assisted-living | Malden | Starts with template prefix: 'Assisted living in Malden.' |
| Sunrise Of Natick | assisted-living | Natick | Starts with template prefix: 'Assisted living in Natick.' |
| Sunrise Of North Andover | assisted-living | North Andover | Starts with template prefix: 'Assisted living in North Andover.' |
| Sunrise Of Norwood | assisted-living | Norwood | Starts with template prefix: 'Assisted living in Norwood.' |
| Sunrise Of Pittsfield | assisted-living | Pittsfield | Starts with template prefix: 'Assisted living in Pittsfield.' |
| Sunrise Of Saugus | assisted-living | Saugus | Starts with template prefix: 'Assisted living in Saugus.' |
| Sunrise Of Springfield | assisted-living | Springfield | Starts with template prefix: 'Assisted living in Springfield.' |
| Sunrise Of Stoneham | assisted-living | Stoneham | Starts with template prefix: 'Assisted living in Stoneham.' |
| Sunrise Of Wayland | assisted-living | Wayland | Starts with template prefix: 'Assisted living in Wayland.' |
| Sunrise Of Worcester | assisted-living | Worcester | Starts with template prefix: 'Assisted living in Worcester.' |
| Taunton Memory Care | memory-care | Taunton | Starts with template prefix: 'Memory care in Taunton.' |
| Taunton Senior Living | assisted-living | Taunton | Starts with template prefix: 'Assisted living in Taunton.' |
| Tewksbury Senior Center | independent-living | Tewksbury | Starts with template prefix: 'Independent living in Tewksbury.' |
| The Cambridge Homes | assisted-living | Cambridge | Starts with template prefix: 'Assisted living in Cambridge.' |
| The Commons At Andover | independent-living | Andover | Starts with template prefix: 'Independent living in Andover.' |
| The Residence At Five Corners | assisted-living | Brighton | Starts with template prefix: 'Assisted living in Brighton.' |
| The Residences At Wingate | independent-living | Needham | Starts with template prefix: 'Independent living in Needham.' |
| VITAS Healthcare Dedham | hospice | Dedham | Starts with template prefix: 'Hospice care in Dedham.' |
| VITAS Healthcare Longmeadow | hospice | Longmeadow | Starts with template prefix: 'Hospice care in Longmeadow.' |

_...and 20 more. See per-batch JSON files for the complete list._

### GENERIC_PHONE_IN_FAQ (48 facilities, 8 already auto-fixed)

| Facility | Type | City | Detail |
|---|---|---|---|
| Beaumont Rehab Worcester | nursing-home | Worcester | FAQ 'Where is Beaumont Rehab Worcester located?' uses generic 'our main phone number' |
| Beaumont Rehab Worcester | nursing-home | Worcester | FAQ 'How do I contact Beaumont Rehab Worcester?' uses generic 'our main phone number' |
| Beaumont Rehab Worcester | nursing-home | Worcester | FAQ 'What is the admission process at Beaumont Rehab Worcester?' uses generic 'our main phone number' |
| Beaumont Rehab Worcester | nursing-home | Worcester | FAQ 'Can I schedule a tour of Beaumont Rehab Worcester?' uses generic 'our main phone number' |
| Brookdale Avenue | assisted-living | Dedham | FAQ 'Where is Brookdale Dedham located?' used generic phone text |
| Brookdale Avenue | assisted-living | Dedham | FAQ 'How do I contact Brookdale Dedham?' used generic phone text |
| Brookdale Avenue | assisted-living | Dedham | FAQ 'Can I schedule a tour of Brookdale Dedham?' used generic phone text |
| Brookdale Circle | assisted-living | Billerica | FAQ 'Where is Brookdale Billerica located?' used generic phone text |
| Brookdale Circle | assisted-living | Billerica | FAQ 'How do I contact Brookdale Billerica?' used generic phone text |
| Brookdale Circle | assisted-living | Billerica | FAQ 'Can I schedule a tour of Brookdale Billerica?' used generic phone text |
| Brookdale Circle | assisted-living | Shrewsbury | FAQ 'Where is Brookdale Shrewsbury located?' used generic phone text |
| Brookdale Circle | assisted-living | Shrewsbury | FAQ 'How do I contact Brookdale Shrewsbury?' used generic phone text |
| Brookdale Circle | assisted-living | Shrewsbury | FAQ 'Can I schedule a tour of Brookdale Shrewsbury?' used generic phone text |
| Brookdale Road | assisted-living | Newton | FAQ 'Where is Brookdale Newton located?' used generic phone text |
| Brookdale Road | assisted-living | Newton | FAQ 'How do I contact Brookdale Newton?' used generic phone text |
| Brookdale Road | assisted-living | Newton | FAQ 'Can I schedule a tour of Brookdale Newton?' used generic phone text |
| Gloucester Crossing | assisted-living | Gloucester | FAQ has 'our main phone number' but facility has no phone |
| Gloucester Crossing | assisted-living | Gloucester | FAQ has 'our main phone number' but facility has no phone |
| Gloucester Crossing | assisted-living | Gloucester | FAQ has 'our main phone number' but facility has no phone |
| Golden Living | nursing-home | Attleboro | FAQ has 'our main phone number' but facility has no phone |
| Golden Living | nursing-home | Attleboro | FAQ has 'our main phone number' but facility has no phone |
| Golden Living | nursing-home | Attleboro | FAQ has 'our main phone number' but facility has no phone |
| Golden Living | nursing-home | Attleboro | FAQ has 'our main phone number' but facility has no phone |
| Linden Ponds Way | nursing-home | Hingham | FAQ has 'our main phone number' but facility has no phone |
| Linden Ponds Way | nursing-home | Hingham | FAQ has 'our main phone number' but facility has no phone |
| Linden Ponds Way | nursing-home | Hingham | FAQ has 'our main phone number' but facility has no phone |
| Linden Ponds Way | nursing-home | Hingham | FAQ has 'our main phone number' but facility has no phone |
| Linden Street | nursing-home | Taunton | FAQ has 'our main phone number' but facility has no phone |
| Linden Street | nursing-home | Taunton | FAQ has 'our main phone number' but facility has no phone |
| Linden Street | nursing-home | Taunton | FAQ has 'our main phone number' but facility has no phone |
| Linden Street | nursing-home | Taunton | FAQ has 'our main phone number' but facility has no phone |
| Newbury Court | nursing-home | Concord | FAQ 'Where is Newbury Court located?' contained 'our main phone number' |
| Newbury Court | nursing-home | Concord | FAQ 'How do I contact Newbury Court?' contained 'our main phone number' |
| Newbury Court | nursing-home | Concord | FAQ 'What is the admission process at Newbury Court?' contained 'our main phone number' |
| Newbury Court | nursing-home | Concord | FAQ 'Can I schedule a tour of Newbury Court?' contained 'our main phone number' |
| Pleasant Bay Nursing | nursing-home | Brewster | FAQ 'Where is Pleasant Bay Nursing located?' contained 'our main phone number' |
| Pleasant Bay Nursing | nursing-home | Brewster | FAQ 'How do I contact Pleasant Bay Nursing?' contained 'our main phone number' |
| Pleasant Bay Nursing | nursing-home | Brewster | FAQ 'What is the admission process at Pleasant Bay Nursing?' contained 'our main phone number' |
| Pleasant Bay Nursing | nursing-home | Brewster | FAQ 'Can I schedule a tour of Pleasant Bay Nursing?' contained 'our main phone number' |
| Salem Crossing | assisted-living | Salem | FAQ 'Where is Salem Crossing located?' contained 'our main phone number' |
| Salem Crossing | assisted-living | Salem | FAQ 'How do I contact Salem Crossing?' contained 'our main phone number' |
| Salem Crossing | assisted-living | Salem | FAQ 'Can I schedule a tour of Salem Crossing?' contained 'our main phone number' |
| Sunrise Avenue | assisted-living | Chelmsford | FAQ 'Where is Sunrise Of Chelmsford located?' used generic phone text |
| Sunrise Avenue | assisted-living | Chelmsford | FAQ 'How do I contact Sunrise Of Chelmsford?' used generic phone text |
| Sunrise Avenue | assisted-living | Chelmsford | FAQ 'Can I schedule a tour of Sunrise Of Chelmsford?' used generic phone text |
| Tewksbury Senior Center | independent-living | Tewksbury | FAQ 'Where is Tewksbury Senior Living located?' used generic phone text |
| Tewksbury Senior Center | independent-living | Tewksbury | FAQ 'How do I contact Tewksbury Senior Living?' used generic phone text |
| Tewksbury Senior Center | independent-living | Tewksbury | FAQ 'Can I schedule a tour of Tewksbury Senior Living?' used generic phone text |

### MISSING_WEBSITE (34 facilities)

| Facility | Type | City | Detail |
|---|---|---|---|
| Addison Gilbert Hospital | hospital | Gloucester | Website missing |
| Addison Gilbert Hospital Nursing | nursing-home | Gloucester | Website missing |
| Addison Gilbert Hospital Skilled Nursing | nursing-home | Gloucester | Website missing |
| Amesbury Village | nursing-home | Amesbury | Website missing |
| Blackstone Nursing Home | nursing-home | Blackstone | Website missing |
| Blue Hills Health Center | nursing-home | Canton | Website missing |
| Braintree Manor Healthcare | nursing-home | Braintree | Website missing |
| Bridgewater Nursing Home | nursing-home | Bridgewater | Website missing |
| Brookdale Avenue | assisted-living | Dedham | Website is missing |
| Brookdale Circle | assisted-living | Billerica | Website is missing |
| Brookdale Circle | assisted-living | Shrewsbury | Website is missing |
| Brookdale Road | assisted-living | Newton | Website is missing |
| Center For Extended Care at Amherst | nursing-home | Amherst | Website is missing |
| Chatham Senior Center | independent-living | Chatham | Website is missing |
| Concord Health Care Center | nursing-home | Concord | Website is missing |
| Dexter House | nursing-home | Malden | Website is missing |
| Franklin Skilled Nursing | nursing-home | Franklin | Website missing |
| Golden Living | nursing-home | Attleboro | Website missing |
| Golden Living Center-Bristol | nursing-home | Attleboro | Website missing |
| Harborlight At Beverly | independent-living | Beverly | Website missing |
| Kindred Hospital Park View | nursing-home | Springfield | Website missing |
| Linden Ponds Way | nursing-home | Hingham | Website missing |
| Linden Street | nursing-home | Taunton | Website missing |
| Medford Senior Living | independent-living | Medford | Website is missing |
| Middleborough Nursing | nursing-home | Middleborough | Website is missing |
| Newbury Court | nursing-home | Concord | Website is missing |
| Oak Hill Nursing | nursing-home | Middleborough | Website is missing |
| Pleasant Bay Nursing | nursing-home | Brewster | Website is missing |
| Reeds Landing | independent-living | Westfield | Website is missing |
| Roscommon West Roxbury | nursing-home | Boston | Website is missing |
| Salem Crossing | assisted-living | Salem | Website is missing |
| Sunrise Avenue | assisted-living | Chelmsford | Website is missing |
| Union Hospital Nursing | nursing-home | Lynn | Website is missing |
| Wingate At Brighton | nursing-home | Brighton | Website is missing |

### CLOSED_FACILITY_PUBLISHED (19 facilities)

| Facility | Type | City | Detail |
|---|---|---|---|
| AseraCare - Boston | hospice | Wellesley Hills | Facility is closed permanently but still published |
| Beaumont Rehab Worcester | nursing-home | Worcester | Facility is closed permanently but still published |
| Blackstone Nursing Home | nursing-home | Blackstone | Facility is closed permanently but still published |
| Bridgewater Nursing Home | nursing-home | Bridgewater | Facility is closed permanently but still published |
| Brookdale Longmeadow | assisted-living | Longmeadow | Closed facility still published |
| Carney Hospital Nursing | nursing-home | Dorchester | Closed facility still published |
| Golden Living | nursing-home | Attleboro | Facility is permanently closed but still published |
| HopeHealth Hospice | hospice | Brockton | Facility is permanently closed but still published |
| Hospice of the South Shore | hospice | Rockland | Facility is permanently closed but still published |
| Kindred Hospital Park View | nursing-home | Springfield | Facility is permanently closed but still published |
| Marian Manor | nursing-home | Boston | CLOSED_PERMANENTLY but status published |
| Metro West Homecare & Hospice | hospice | Natick | CLOSED_PERMANENTLY but status published |
| Pleasant Bay Nursing | nursing-home | Brewster | CLOSED_PERMANENTLY but status published |
| Quincy Health And Rehabilitation | nursing-home | Quincy | CLOSED_PERMANENTLY but status published |
| Quincy Rehabilitation | nursing-home | Quincy | CLOSED_PERMANENTLY but status published |
| Roscommon West Roxbury | nursing-home | Boston | CLOSED_PERMANENTLY but status published |
| South Shore Hospice - Quincy | hospice | Quincy | Facility marked CLOSED_PERMANENTLY but still published |
| Union Hospital Nursing | nursing-home | Lynn | Facility marked CLOSED_PERMANENTLY but still published |
| Wingate At Brighton | nursing-home | Brighton | Facility marked CLOSED_PERMANENTLY but still published |

### MISSING_PHONE (14 facilities)

| Facility | Type | City | Detail |
|---|---|---|---|
| Beaumont Rehab Worcester | nursing-home | Worcester | Phone missing or invalid |
| Brookdale Avenue | assisted-living | Dedham | Phone is missing |
| Brookdale Circle | assisted-living | Billerica | Phone is missing |
| Brookdale Circle | assisted-living | Shrewsbury | Phone is missing |
| Brookdale Road | assisted-living | Newton | Phone is missing |
| Gloucester Crossing | assisted-living | Gloucester | Phone missing/empty |
| Golden Living | nursing-home | Attleboro | Phone missing/empty |
| Linden Ponds Way | nursing-home | Hingham | Phone missing/empty |
| Linden Street | nursing-home | Taunton | Phone missing/empty |
| Newbury Court | nursing-home | Concord | Phone is missing |
| Pleasant Bay Nursing | nursing-home | Brewster | Phone is missing |
| Salem Crossing | assisted-living | Salem | Phone is missing |
| Sunrise Avenue | assisted-living | Chelmsford | Phone is missing |
| Tewksbury Senior Center | independent-living | Tewksbury | Phone is missing |

### INVALID_PHONE_FORMAT (1 facilities)

| Facility | Type | City | Detail |
|---|---|---|---|
| Southborough Nursing Home | nursing-home | Southborough | Phone '020 3936 2586' not in (XXX) XXX-XXXX format |

---

  ## Recommended Next Steps (Priority Order)

  ### P0 — Fix this week
  1. **Rewrite generic descriptions (593 facilities).** These are sub-50-character placeholders. Use an LLM-assisted batch script that pulls each facility's name, type, city, services, and amenities and produces a 150–250-word unique description. This is the single highest-impact SEO and UX fix.
  2. **Resolve image mismatches (79 facilities).** The current hero photos belong to *other* businesses. Re-fetch via the Google Places API using each facility's own `google_place_id`, or fall back to a curated stock image keyed to `facility_type`. Showing a wrong photo is a credibility risk.
  3. **Unpublish or update closed facilities (19 facilities).** Either set `status = 'archived'` or change `business_status` after re-verifying with Google Places. Keeping closed facilities live is misleading to families.
  4. **Backfill missing phones (14) and websites (34).** Source from Google Places `places.googleapis.com` using each `google_place_id`.

  ### P1 — Fix this month
  5. **Replace template descriptions (70 facilities).** Same rewrite pipeline as P0 #1, lower priority because these descriptions at least have some content.
  6. **Strip tracking parameters from websites (207 URLs).** Run a SQL UPDATE that removes `utm_*`, `fbclid`, `gclid`, `mc_cid`, `mc_eid` query strings from `facilities.website`.
  7. **Expand short descriptions (80 facilities).** Descriptions in the 50–150 char range — boost to 200+ chars with services and amenities context.
  8. **Audit FAQ depth (0 facilities flagged with <4 FAQs, plus any with NO_FAQS).** Generate a standard 6-question FAQ set per facility (services offered, hours, payment, accreditation, room types, contact).

  ### P2 — Polish
  9. **Add city context to descriptions (116 facilities).** When the rewrite job runs, ensure the facility's city is mentioned at least once in the body for local SEO.
  10. **Normalise phone format (1 facility).** Format all phones as `(XXX) XXX-XXXX`.

  ### Operational follow-ups
  - Re-run this audit after the P0/P1 fixes ship to verify the issue counts drop.
  - Add a CI/data-quality check that fails if any new facility row has a description shorter than 50 characters or a missing hero image.
  - Wire the auto-fix rules used in this audit (placeholder phone/website strings) into the FAQ creation pipeline so they cannot be reintroduced.

  ---

  ## Source Data

  The five per-batch JSON reports backing this aggregation:

  - `/tmp/audit_batch_1.json` + `/tmp/audit_batch_1_summary.md`
  - `/tmp/audit_batch_2.json` + `/tmp/audit_batch_2_summary.md`
  - `/tmp/audit_batch_3.json` + `/tmp/audit_batch_3_summary.md`
  - `/tmp/audit_batch_4.json` + `/tmp/audit_batch_4_summary.md`
  - `/tmp/audit_batch_5.json` + `/tmp/audit_batch_5_summary.md`
  
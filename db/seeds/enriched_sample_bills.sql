-- Run AFTER 0001_initial.sql and BEFORE sample_bills.sql, or replace
-- the existing sample_bills entries with this enriched version.

-- Texas SB 2847 — full realistic bill text
UPDATE bills SET full_text = $bill$
SECTION 1. SHORT TITLE.
This Act may be cited as the "Texas Consumer Data Protection Act Amendments of 2026".

SECTION 2. DEFINITIONS.
For purposes of this Chapter, "data processor" means any person or entity that processes personal data on behalf of a controller, including software-as-a-service providers, cloud infrastructure operators, and third-party analytics services that handle personal data of Texas residents.

SECTION 3. BREACH NOTIFICATION REQUIREMENTS.
(a) A data processor that becomes aware of a security incident affecting personal data of one hundred (100) or more Texas residents shall notify the Texas Attorney General not later than seventy-two (72) hours after discovery.
(b) This Section supersedes any prior provision allowing notification within thirty (30) days. Compliance with the federal Health Insurance Portability and Accountability Act does not exempt a data processor from this Section.

SECTION 4. DATA SUBJECT RIGHTS.
(a) A data processor shall, upon verified request of a Texas resident, provide a mechanism for the deletion of all personal data within forty-five (45) days, including data retained in archival systems and third-party backups.
(b) The mechanism required by Subsection (a) shall be implemented through an automated application programming interface (API) accessible to the Texas Attorney General's office for audit purposes.

SECTION 5. CROSS-BORDER TRANSFER RESTRICTIONS.
A data processor shall not transfer personal data of Texas residents to any jurisdiction not deemed adequate by rule of the Texas Attorney General, except under standard contractual clauses approved by the Attorney General.

SECTION 6. PENALTIES.
Violation of this Chapter is punishable by a civil penalty of not more than $7,500 per affected resident per violation. Pattern violations involving more than ten thousand residents are subject to enhanced penalties of not more than $50,000 per resident.

SECTION 7. EFFECTIVE DATE.
This Act takes effect on the 180th day after enactment.
$bill$,
status = 'committee',
introduced_at = '2026-02-12'::timestamptz,
effective_date = (NOW() + INTERVAL '142 days')::timestamptz
WHERE jurisdiction = 'TX' AND bill_number = 'SB2847';

-- California AB 1823
UPDATE bills SET full_text = $bill$
SECTION 1. TITLE.
This Act shall be known as the "California AI Transparency and Safety Act".

SECTION 2. SCOPE.
This Act applies to any entity that deploys an automated decision-making system within the State of California or that affects California residents, regardless of the entity's principal place of business.

SECTION 3. DISCLOSURE REQUIREMENTS.
(a) Every covered entity shall publish, in plain English at a publicly accessible URL, the following information about each automated decision-making system:
  (1) The categories of input data used;
  (2) The categories of outcomes produced;
  (3) The training data sources, including approximate dates of collection;
  (4) Performance metrics across protected class subgroups defined in the Unruh Civil Rights Act.

SECTION 4. RISK ASSESSMENT.
A covered entity that deploys a high-risk automated decision-making system shall, prior to deployment, conduct and publish an algorithmic impact assessment evaluating: (i) potential disparate impact, (ii) data quality safeguards, (iii) human review procedures, (iv) appeal mechanisms.

SECTION 5. ENFORCEMENT.
The Attorney General may bring a civil action for violations. Penalties: up to $25,000 per violation.

SECTION 6. EFFECTIVE DATE.
This Act takes effect January 1, 2027.
$bill$,
status = 'introduced',
introduced_at = '2026-03-04'::timestamptz,
effective_date = '2027-01-01'::timestamptz
WHERE jurisdiction = 'CA' AND bill_number = 'AB1823';

-- EU AI Act DA-04
UPDATE bills SET full_text = $bill$
COMMISSION DELEGATED REGULATION (EU) 2026/XXX of XX March 2026 supplementing Regulation (EU) 2024/1689 of the European Parliament and of the Council with regard to technical requirements for providers of high-risk AI systems.

THE EUROPEAN COMMISSION,
Having regard to Regulation (EU) 2024/1689,
Whereas:
(1) Providers of high-risk AI systems must establish a quality management system that ensures compliance with this Regulation.
(2) The risk management system shall be a continuous iterative process planned and run throughout the entire lifecycle of a high-risk AI system.

Article 1 — Subject matter
This Delegated Regulation supplements Regulation (EU) 2024/1689 by specifying technical requirements for providers of high-risk AI systems classified under Annex III.

Article 2 — Quality management system
Providers shall implement a documented quality management system covering: (a) compliance with this Regulation, (b) techniques for design and design control, (c) data management, (d) post-market monitoring.

Article 3 — Transparency and provision of information to users
Providers shall ensure that the operation of high-risk AI systems is sufficiently transparent to enable users to interpret the system's output and use it appropriately. Technical documentation shall be drawn up before the system is placed on the market.

Article 4 — Effective date
This Regulation shall enter into force on the twentieth day following that of its publication in the Official Journal of the European Union and shall apply from 1 August 2026.
$bill$,
status = 'committee',
introduced_at = '2026-03-15'::timestamptz,
effective_date = '2026-08-01'::timestamptz
WHERE jurisdiction = 'EU' AND bill_number = 'AIA-DA-04';

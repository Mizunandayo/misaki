INSERT INTO bills (jurisdiction, bill_number, title, full_text, status, content_hash, urgency_score, pass_probability)
VALUES
  ('TX', 'SB2847', 'Texas Consumer Data Protection Act Amendments',
   'A bill relating to consumer data protection, breach notification requirements, and data subject rights for entities processing personal information of Texas residents.',
   'committee', 'tx-sb2847-' || md5(random()::text), 92, 71),
  ('CA', 'AB1823', 'California AI Transparency and Safety Act',
   'An act to require disclosure and risk assessment for automated decision-making systems deployed in the state of California.',
   'introduced', 'ca-ab1823-' || md5(random()::text), 78, 54),
  ('EU', 'AIA-DA-04', 'EU AI Act Delegated Act on High-Risk AI Systems',
   'Delegated act specifying technical requirements for providers of high-risk AI systems under the Artificial Intelligence Act.',
   'committee', 'eu-aia-04-' || md5(random()::text), 88, 81),
  ('NY', 'A8807', 'New York Algorithmic Accountability Act',
   'A bill to establish an algorithmic accountability framework requiring impact assessments for automated decision systems.',
   'introduced', 'ny-a8807-' || md5(random()::text), 65, 42),
  ('UK', 'HC-1142', 'UK Online Safety Bill — Technical Amendments',
   'Technical amendments to the Online Safety Act addressing platform liability and content moderation transparency requirements.',
   'committee', 'uk-hc1142-' || md5(random()::text), 71, 59)
ON CONFLICT (content_hash) DO NOTHING;

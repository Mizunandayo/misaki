INSERT INTO company_profiles (
  id,
  name,
  industry_tags,
  jurisdictions,
  headcount,
  revenue_band,
  data_handling_classification,
  compliance_certifications,
  tech_stack_indicators,
  profile_confidence_score,
  profile_gaps
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'NovaTech',
  ARRAY['SaaS', 'Data Processing', 'B2B Software'],
  ARRAY['TX', 'CA', 'NY', 'EU', 'UK'],
  280,
  'Series C',
  'data_processor',
  ARRAY['SOC2_TYPE2', 'GDPR'],
  ARRAY['cloud_infrastructure', 'api_first', 'multi_tenant_saas'],
  94,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;
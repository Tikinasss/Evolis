-- Add full analysis data storage and improve analysis tracking
ALTER TABLE analyses 
ADD COLUMN IF NOT EXISTS analysis_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS financial_snapshot JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS projections_12_months JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS industry_benchmarks JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS training_resources JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS success_metrics JSONB DEFAULT NULL;

-- Create index for better historical data retrieval
CREATE INDEX IF NOT EXISTS idx_analyses_company_owner_date ON analyses(company_name, owner_user_id, created_at DESC);

-- Create index for fast lookups by company name
CREATE INDEX IF NOT EXISTS idx_analyses_company_name_date ON analyses(company_name, created_at DESC);

-- Add comment explaining the analysis_data column
COMMENT ON COLUMN analyses.analysis_data IS 'Complete analysis data including financial_snapshot, projections_12_months, industry_benchmarks, training_resources, success_metrics';

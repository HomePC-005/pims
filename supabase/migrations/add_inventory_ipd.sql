CREATE TABLE IF NOT EXISTS public.inventory_ipd (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  section TEXT NOT NULL,
  row TEXT NOT NULL,
  bin_size TEXT NOT NULL,
  bin_loc TEXT NOT NULL,
  location_code TEXT GENERATED ALWAYS AS (section || '-' || row || '-' || bin_size || bin_loc) STORED,
  remarks TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_ipd_name ON inventory_ipd(name);
CREATE INDEX IF NOT EXISTS idx_inventory_ipd_section ON inventory_ipd(section);
CREATE INDEX IF NOT EXISTS idx_inventory_ipd_location ON inventory_ipd(location_code);

-- Triggers to auto-update updated_at
CREATE TRIGGER update_inventory_ipd_updated_at
  BEFORE UPDATE ON inventory_ipd
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

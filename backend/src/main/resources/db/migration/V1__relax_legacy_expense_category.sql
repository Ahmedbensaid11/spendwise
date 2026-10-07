-- Older local schemas stored the category name directly in expenses.category.
-- Current code stores the relationship in category_id, so preserve old values
-- while allowing new rows to omit that legacy column.
DO $$
BEGIN
    IF to_regclass('public.expenses') IS NOT NULL
       AND EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public'
             AND table_name = 'expenses'
             AND column_name = 'category'
       ) THEN
        ALTER TABLE public.expenses ALTER COLUMN category DROP NOT NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(10) CHECK (type IN ('expense', 'income')) NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
  workspace_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('personal', 'group')) NOT NULL,
  owner_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
  type VARCHAR(10) CHECK (type IN ('expense', 'income')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  workspace_type VARCHAR(20) NOT NULL DEFAULT 'personal' CHECK (workspace_type IN ('personal', 'group')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (category_name, type) VALUES
('All Categories', 'expense'),
('Salary', 'income'),
('Bonus', 'income'),
('Investment', 'income'),
('Gift', 'income'),
('Rent', 'expense'),
('Food', 'expense'),
('Utilities', 'expense'),
('Entertainment', 'expense'),
('Health', 'expense'),
('Other', 'expense')
ON CONFLICT (category_name) DO NOTHING;

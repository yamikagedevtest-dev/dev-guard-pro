
INSERT INTO public.mcq_questions (question, options, correct_answer, difficulty, category) VALUES
('What is the time complexity of binary search?', '["O(n)", "O(log n)", "O(n²)", "O(1)"]', 1, 'easy', 'DSA'),
('Which hook is used for side effects in React?', '["useState", "useEffect", "useContext", "useReducer"]', 1, 'easy', 'React'),
('What does ACID stand for in databases?', '["Atomicity, Consistency, Isolation, Durability", "Association, Concurrency, Isolation, Data", "Atomicity, Concurrency, Integration, Durability", "Association, Consistency, Isolation, Durability"]', 0, 'medium', 'Databases'),
('Difference between == and === in JS?', '["No difference", "=== checks type+value", "== is faster", "=== is deprecated"]', 1, 'easy', 'JavaScript'),
('Which data structure uses FIFO?', '["Stack", "Queue", "Tree", "Graph"]', 1, 'easy', 'DSA'),
('What is a closure in JavaScript?', '["Function with access to outer scope", "Close browser window", "A type of loop", "End a program"]', 0, 'medium', 'JavaScript'),
('What is the virtual DOM?', '["Lightweight copy of actual DOM", "A browser API", "A CSS framework", "A database"]', 0, 'medium', 'React'),
('What is Docker used for?', '["Containerization", "Version control", "Code compilation", "Database management"]', 0, 'medium', 'DevOps'),
('What is Big O notation?', '["Algorithm efficiency", "Formatting code", "Memory allocation", "Network protocols"]', 0, 'easy', 'DSA'),
('What is REST?', '["Representational State Transfer", "Remote Execution Standard", "Rapid Enterprise Testing", "None"]', 0, 'easy', 'Backend'),
('Quicksort average complexity?', '["O(n)", "O(n log n)", "O(n²)", "O(log n)"]', 1, 'medium', 'DSA'),
('TypeScript interfaces define?', '["Object shapes", "Promises", "Generators", "Decorators"]', 0, 'easy', 'TypeScript'),
('What is a race condition?', '["Two processes compete for resource", "A sorting algorithm", "A CSS animation", "A database join"]', 0, 'hard', 'System Design'),
('What is database sharding?', '["Horizontal partitioning", "Encrypting data", "Backing up data", "Indexing"]', 0, 'hard', 'System Design'),
('What is the CAP theorem?', '["Consistency+Availability+Partition tolerance pick 2", "Create Alter Purge", "Cache API Protocol", "None"]', 0, 'hard', 'System Design');

INSERT INTO public.coding_challenges (title, description, difficulty, category, starter_code, test_cases, hidden_test_cases, time_limit_seconds) VALUES
('Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.', 'easy', 'DSA', '{"javascript": "function twoSum(nums, target) {\n  // Your code here\n}", "python": "def two_sum(nums, target):\n    pass", "typescript": "function twoSum(nums: number[], target: number): number[] {\n  // Your code here\n}"}', '[{"input": "[2,7,11,15], 9", "expected": "[0,1]"}, {"input": "[3,2,4], 6", "expected": "[1,2]"}]', '[{"input": "[3,3], 6", "expected": "[0,1]"}]', 300),
('Reverse String', 'Write a function that reverses a string in-place given as an array of characters.', 'easy', 'DSA', '{"javascript": "function reverseString(s) {\n  // Your code here\n}", "python": "def reverse_string(s):\n    pass"}', '[{"input": "[h,e,l,l,o]", "expected": "[o,l,l,e,h]"}]', '[{"input": "[H,a,n,n,a,h]", "expected": "[h,a,n,n,a,H]"}]', 180),
('Valid Parentheses', 'Given a string containing just ( ) { } [ ], determine if the input string is valid.', 'medium', 'DSA', '{"javascript": "function isValid(s) {\n  // Your code here\n}", "python": "def is_valid(s):\n    pass"}', '[{"input": "()", "expected": "true"}, {"input": "()[]{}", "expected": "true"}, {"input": "(]", "expected": "false"}]', '[{"input": "([)]", "expected": "false"}, {"input": "{[]}", "expected": "true"}]', 300);

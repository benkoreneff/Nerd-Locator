-- Kokonaisturvallisuus MVP Seed Data
-- Demo data for testing the system

-- Insert sample users
INSERT INTO users (national_id_hash, full_name, dob, address, lat, lon) VALUES
('hash_civilian1', 'Matti Virtanen', '1985-03-15', 'Mannerheimintie 1, 00100 Helsinki', 60.1699, 24.9384),
('hash_civilian2', 'Liisa Korhonen', '1990-07-22', 'Unioninkatu 25, 00170 Helsinki', 60.1719, 24.9414),
('hash_civilian3', 'Jukka Nieminen', '1978-11-08', 'Kaisaniemenkatu 3, 00100 Helsinki', 60.1708, 24.9439),
('hash_civilian4', 'Anna Mäkelä', '1992-05-12', 'Fredrikinkatu 22, 00120 Helsinki', 60.1636, 24.9271),
('hash_civilian5', 'Pekka Salminen', '1983-09-30', 'Bulevardi 12, 00120 Helsinki', 60.1649, 24.9271),
('hash_civilian6', 'Sanna Koskinen', '1988-12-03', 'Esplanadi 15, 00130 Helsinki', 60.1676, 24.9439),
('hash_civilian7', 'Mikko Rantanen', '1975-06-18', 'Aleksanterinkatu 50, 00100 Helsinki', 60.1699, 24.9414),
('hash_civilian8', 'Eeva Järvinen', '1991-04-25', 'Pohjoisesplanadi 35, 00130 Helsinki', 60.1676, 24.9439);

-- Insert sample profiles with generated tags and scores
INSERT INTO profiles (user_id, education_level, skills, free_text, availability, capability_score, tags_json, status) VALUES
(1, 'masters', '["medical", "emergency", "first aid", "ambulance"]', 'Experienced paramedic with 10 years in emergency services. Certified in advanced life support.', 'immediate', 85.0, '["medical"]', 'available'),
(2, 'bachelors', '["translation", "communication", "english", "russian"]', 'Professional translator fluent in multiple languages. Experience in crisis communication.', '24h', 65.0, '["communication"]', 'available'),
(3, 'vocational', '["construction", "heavy machinery", "safety", "logistics"]', 'Construction supervisor with access to heavy machinery and vehicles. Safety certified.', 'immediate', 70.0, '["technical", "logistics"]', 'available'),
(4, 'masters', '["psychology", "counseling", "mental health", "crisis intervention"]', 'Clinical psychologist specializing in trauma and crisis intervention. Available for mental health support.', '48h', 75.0, '["medical"]', 'available'),
(5, 'bachelors', '["IT", "network administration", "communication systems", "radio"]', 'IT specialist with expertise in communication systems and radio networks. Can set up emergency communications.', 'immediate', 80.0, '["technical", "communication"]', 'available'),
(6, 'associate', '["nursing", "first aid", "medical equipment", "hospital"]', 'Registered nurse with experience in emergency medicine. Can provide medical support and coordinate with hospitals.', '24h', 78.0, '["medical"]', 'available'),
(7, 'high_school', '["driving", "transport", "logistics", "fuel"]', 'Professional driver with commercial license. Access to multiple vehicles and fuel resources.', 'immediate', 55.0, '["logistics"]', 'available'),
(8, 'masters', '["management", "coordination", "public relations", "media"]', 'Former crisis manager with experience in coordinating emergency responses and public communication.', '24h', 82.0, '["leadership", "communication"]', 'available');

-- Insert sample resources
INSERT INTO resources (user_id, type, specs_json, lat, lon, available) VALUES
(3, 'vehicle', '{"type": "excavator", "capacity": "heavy", "fuel_type": "diesel"}', 60.1708, 24.9439, 1),
(5, 'equipment', '{"type": "radio_network", "range": "50km", "channels": 20}', 60.1649, 24.9271, 1),
(7, 'vehicle', '{"type": "truck", "capacity": "medium", "fuel_type": "diesel"}', 60.1699, 24.9414, 1),
(7, 'vehicle', '{"type": "van", "capacity": "small", "fuel_type": "gasoline"}', 60.1699, 24.9414, 1);

-- Insert sample requests
INSERT INTO requests (authority_id, type, user_id, message, status) VALUES
('hash_authority1', 'info', 1, 'Need additional information about medical certifications', 'pending'),
('hash_authority1', 'allocate', 3, 'Emergency construction work needed', 'pending');

-- Insert sample allocations
INSERT INTO allocations (user_id, resource_id, mission_code, status) VALUES
(1, NULL, 'MED-2024-001', 'active'),
(5, 2, 'COMM-2024-001', 'active');

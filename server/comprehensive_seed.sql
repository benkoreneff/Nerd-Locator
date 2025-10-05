-- Civitas Comprehensive Seed Data
-- 100 realistic Finnish civilians for demo and testing

-- Insert users from Helsinki region
INSERT INTO users (national_id_hash, full_name, dob, address, lat, lon) VALUES
('hash_hel_001', 'Aino Virtanen', '1987-03-15', 'Mannerheimintie 1, 00100 Helsinki', 60.1699, 24.9384),
('hash_hel_002', 'Eero Nieminen', '1991-07-22', 'Unioninkatu 25, 00170 Helsinki', 60.1719, 24.9414),
('hash_hel_003', 'Sofia Korhonen', '1985-11-08', 'Kaisaniemenkatu 3, 00100 Helsinki', 60.1708, 24.9439),
('hash_hel_004', 'Mikko Mäkelä', '1992-05-12', 'Fredrikinkatu 22, 00120 Helsinki', 60.1636, 24.9271),
('hash_hel_005', 'Liisa Salminen', '1983-09-30', 'Bulevardi 12, 00120 Helsinki', 60.1649, 24.9271),
('hash_hel_006', 'Jukka Koskinen', '1988-12-03', 'Esplanadi 15, 00130 Helsinki', 60.1676, 24.9439),
('hash_hel_007', 'Anna Rantanen', '1975-06-18', 'Aleksanterinkatu 50, 00100 Helsinki', 60.1699, 24.9414),
('hash_hel_008', 'Pekka Järvinen', '1991-04-25', 'Pohjoisesplanadi 35, 00130 Helsinki', 60.1676, 24.9439),
('hash_hel_009', 'Eeva Hämäläinen', '1986-08-14', 'Kluuvikatu 8, 00100 Helsinki', 60.1697, 24.9455),
('hash_hel_010', 'Matti Laine', '1989-01-30', 'Kampinkatu 2, 00100 Helsinki', 60.1695, 24.9318),

-- Insert users from Tampere region
('hash_tam_011', 'Kaisa Heinonen', '1984-06-12', 'Hämeenkatu 20, 33100 Tampere', 61.4991, 23.7871),
('hash_tam_012', 'Jari Toivonen', '1990-09-05', 'Keskustori 1, 33100 Tampere', 61.4982, 23.7616),
('hash_tam_013', 'Marja Lehtinen', '1987-12-18', 'Satakunnankatu 15, 33100 Tampere', 61.4963, 23.7602),
('hash_tam_014', 'Antti Saarinen', '1985-04-03', 'Kalevan puistotie 4, 33500 Tampere', 61.5025, 23.7756),
('hash_tam_015', 'Sanna Väisänen', '1993-07-25', 'Pirkankatu 8, 33100 Tampere', 61.4975, 23.7623),

-- Insert users from Turku region
('hash_tur_016', 'Marko Hakkarainen', '1986-02-14', 'Aurakatu 12, 20100 Turku', 60.4518, 22.2666),
('hash_tur_017', 'Riikka Mattila', '1991-10-08', 'Kauppiaskatu 25, 20100 Turku', 60.4503, 22.2754),
('hash_tur_018', 'Juha Kinnunen', '1988-05-22', 'Humalistonkatu 7, 20100 Turku', 60.4545, 22.2612),
('hash_tur_019', 'Pirjo Rissanen', '1984-11-16', 'Linnankatu 18, 20100 Turku', 60.4521, 22.2698),
('hash_tur_020', 'Timo Aaltonen', '1990-03-29', 'Eerikinkatu 14, 20100 Turku', 60.4498, 22.2675),

-- Insert users from Oulu region
('hash_oul_021', 'Petri Karjalainen', '1987-08-11', 'Kauppurienkatu 10, 90100 Oulu', 65.0121, 25.4651),
('hash_oul_022', 'Helena Koskela', '1992-01-27', 'Kirkkokatu 22, 90100 Oulu', 65.0135, 25.4687),
('hash_oul_023', 'Seppo Laaksonen', '1985-06-04', 'Hallituskatu 6, 90100 Oulu', 65.0118, 25.4623),
('hash_oul_024', 'Marika Turunen', '1989-09-17', 'Pakkahuoneenkatu 3, 90100 Oulu', 65.0128, 25.4645),
('hash_oul_025', 'Jorma Partanen', '1983-12-02', 'Saaristonkatu 15, 90100 Oulu', 65.0132, 25.4667),

-- Insert users from Kuopio region
('hash_kup_026', 'Tuula Moilanen', '1986-04-19', 'Kauppakatu 12, 70100 Kuopio', 62.8924, 27.6770),
('hash_kup_027', 'Kalevi Rantala', '1991-07-13', 'Kauppakatu 25, 70100 Kuopio', 62.8921, 27.6765),
('hash_kup_028', 'Päivi Heikkinen', '1988-10-26', 'Kauppakatu 8, 70100 Kuopio', 62.8927, 27.6775),
('hash_kup_029', 'Heikki Niemi', '1984-02-08', 'Kauppakatu 18, 70100 Kuopio', 62.8923, 27.6768),
('hash_kup_030', 'Sirpa Kärkkäinen', '1990-05-31', 'Kauppakatu 5, 70100 Kuopio', 62.8925, 27.6772),

-- Insert users from Jyväskylä region
('hash_jyv_031', 'Risto Hiltunen', '1987-11-24', 'Kauppakatu 9, 40100 Jyväskylä', 62.2415, 25.7209),
('hash_jyv_032', 'Auli Kivinen', '1993-03-07', 'Kauppakatu 21, 40100 Jyväskylä', 62.2412, 25.7205),
('hash_jyv_033', 'Mauri Lindholm', '1985-08-20', 'Kauppakatu 14, 40100 Jyväskylä', 62.2418, 25.7213),
('hash_jyv_034', 'Leena Peltola', '1989-01-15', 'Kauppakatu 27, 40100 Jyväskylä', 62.2410, 25.7203),
('hash_jyv_035', 'Esko Virtanen', '1986-06-28', 'Kauppakatu 16, 40100 Jyväskylä', 62.2416, 25.7211),

-- Insert users from Rovaniemi region
('hash_rov_036', 'Lauri Kangas', '1988-09-12', 'Korkalonkatu 11, 96200 Rovaniemi', 66.5039, 25.7294),
('hash_rov_037', 'Tarja Miettinen', '1992-12-05', 'Korkalonkatu 24, 96200 Rovaniemi', 66.5036, 25.7291),
('hash_rov_038', 'Ville Peltola', '1984-05-18', 'Korkalonkatu 7, 96200 Rovaniemi', 66.5042, 25.7297),
('hash_rov_039', 'Riitta Savolainen', '1990-02-21', 'Korkalonkatu 19, 96200 Rovaniemi', 66.5038, 25.7295),
('hash_rov_040', 'Pertti Kallio', '1987-07-14', 'Korkalonkatu 13, 96200 Rovaniemi', 66.5040, 25.7296),

-- Insert users from Lahti region
('hash_lah_041', 'Hanna Nieminen', '1985-10-03', 'Vapaudenkatu 15, 15100 Lahti', 60.9827, 25.6612),
('hash_lah_042', 'Tero Mäkinen', '1991-04-16', 'Vapaudenkatu 28, 15100 Lahti', 60.9824, 25.6609),
('hash_lah_043', 'Outi Koskinen', '1988-11-29', 'Vapaudenkatu 12, 15100 Lahti', 60.9830, 25.6615),
('hash_lah_044', 'Janne Salminen', '1986-06-12', 'Vapaudenkatu 21, 15100 Lahti', 60.9826, 25.6611),
('hash_lah_045', 'Sari Rantanen', '1993-01-25', 'Vapaudenkatu 9, 15100 Lahti', 60.9832, 25.6617),

-- Insert users from Vaasa region
('hash_vas_046', 'Mikael Johansson', '1987-08-08', 'Vaasanpuistikko 14, 65100 Vaasa', 63.0959, 21.6158),
('hash_vas_047', 'Camilla Andersson', '1992-03-21', 'Vaasanpuistikko 27, 65100 Vaasa', 63.0956, 21.6155),
('hash_vas_048', 'Lars Eriksson', '1984-10-04', 'Vaasanpuistikko 11, 65100 Vaasa', 63.0962, 21.6161),
('hash_vas_049', 'Anna Lindqvist', '1990-05-17', 'Vaasanpuistikko 23, 65100 Vaasa', 63.0957, 21.6156),
('hash_vas_050', 'Erik Nyström', '1988-12-30', 'Vaasanpuistikko 18, 65100 Vaasa', 63.0960, 21.6159),

-- Insert remaining users from various regions
('hash_por_051', 'Kristiina Honkanen', '1986-07-23', 'Vapaudenkatu 12, 28100 Pori', 61.4852, 21.7974),
('hash_por_052', 'Jarmo Seppälä', '1991-02-16', 'Vapaudenkatu 25, 28100 Pori', 61.4850, 21.7972),
('hash_por_053', 'Tiina Aho', '1988-09-09', 'Vapaudenkatu 8, 28100 Pori', 61.4854, 21.7976),
('hash_por_054', 'Mika Laine', '1984-04-22', 'Vapaudenkatu 19, 28100 Pori', 61.4851, 21.7973),
('hash_por_055', 'Sanna Kinnunen', '1990-11-05', 'Vapaudenkatu 6, 28100 Pori', 61.4855, 21.7977),

('hash_joen_056', 'Pekka Hämäläinen', '1987-06-18', 'Koskikatu 14, 80100 Joensuu', 62.6010, 29.7636),
('hash_joen_057', 'Marja Lehtonen', '1993-01-11', 'Koskikatu 27, 80100 Joensuu', 62.6007, 29.7633),
('hash_joen_058', 'Antti Kärkkäinen', '1985-08-24', 'Koskikatu 11, 80100 Joensuu', 62.6013, 29.7639),
('hash_joen_059', 'Riikka Virtanen', '1989-03-07', 'Koskikatu 23, 80100 Joensuu', 62.6008, 29.7634),
('hash_joen_060', 'Timo Saarinen', '1986-10-20', 'Koskikatu 16, 80100 Joensuu', 62.6011, 29.7637),

('hash_sein_061', 'Helena Nieminen', '1988-05-13', 'Kauppakatu 13, 60100 Seinäjoki', 62.7908, 22.8404),
('hash_sein_062', 'Jukka Korhonen', '1992-12-26', 'Kauppakatu 26, 60100 Seinäjoki', 62.7905, 22.8401),
('hash_sein_063', 'Anna Mäkelä', '1984-09-09', 'Kauppakatu 9, 60100 Seinäjoki', 62.7911, 22.8407),
('hash_sein_064', 'Mikko Salminen', '1990-04-22', 'Kauppakatu 21, 60100 Seinäjoki', 62.7906, 22.8402),
('hash_sein_065', 'Liisa Rantanen', '1987-11-15', 'Kauppakatu 17, 60100 Seinäjoki', 62.7909, 22.8405),

('hash_kot_066', 'Eero Hiltunen', '1985-02-28', 'Kauppakatu 12, 48100 Kotka', 60.4669, 26.9460),
('hash_kot_067', 'Kaisa Lindholm', '1991-09-11', 'Kauppakatu 25, 48100 Kotka', 60.4666, 26.9457),
('hash_kot_068', 'Jari Peltola', '1988-06-24', 'Kauppakatu 8, 48100 Kotka', 60.4672, 26.9463),
('hash_kot_069', 'Marja Virtanen', '1984-01-07', 'Kauppakatu 20, 48100 Kotka', 60.4667, 26.9458),
('hash_kot_070', 'Antti Koskinen', '1990-08-20', 'Kauppakatu 15, 48100 Kotka', 60.4670, 26.9461),

('hash_hel_071', 'Sofia Hämäläinen', '1986-03-03', 'Kluuvikatu 8, 00100 Helsinki', 60.1697, 24.9455),
('hash_hel_072', 'Matti Laine', '1989-01-30', 'Kampinkatu 2, 00100 Helsinki', 60.1695, 24.9318),
('hash_hel_073', 'Eeva Virtanen', '1987-08-14', 'Unioninkatu 15, 00170 Helsinki', 60.1715, 24.9410),
('hash_hel_074', 'Pekka Nieminen', '1991-05-27', 'Kaisaniemenkatu 5, 00100 Helsinki', 60.1705, 24.9435),
('hash_hel_075', 'Anna Korhonen', '1988-12-10', 'Fredrikinkatu 18, 00120 Helsinki', 60.1633, 24.9268),

('hash_hel_076', 'Jukka Mäkelä', '1985-09-23', 'Bulevardi 8, 00120 Helsinki', 60.1646, 24.9268),
('hash_hel_077', 'Liisa Salminen', '1992-04-06', 'Esplanadi 12, 00130 Helsinki', 60.1673, 24.9436),
('hash_hel_078', 'Mikko Rantanen', '1986-11-19', 'Aleksanterinkatu 45, 00100 Helsinki', 60.1696, 24.9411),
('hash_hel_079', 'Sanna Järvinen', '1990-06-02', 'Pohjoisesplanadi 30, 00130 Helsinki', 60.1673, 24.9436),
('hash_hel_080', 'Eero Koskinen', '1987-01-15', 'Mannerheimintie 15, 00100 Helsinki', 60.1699, 24.9384),

('hash_hel_081', 'Aino Hiltunen', '1984-10-28', 'Unioninkatu 30, 00170 Helsinki', 60.1722, 24.9417),
('hash_hel_082', 'Timo Lindholm', '1991-07-11', 'Kaisaniemenkatu 8, 00100 Helsinki', 60.1711, 24.9442),
('hash_hel_083', 'Marja Peltola', '1988-02-24', 'Fredrikinkatu 25, 00120 Helsinki', 60.1639, 24.9274),
('hash_hel_084', 'Antti Virtanen', '1985-09-07', 'Bulevardi 15, 00120 Helsinki', 60.1652, 24.9274),
('hash_hel_085', 'Riikka Koskinen', '1992-04-20', 'Esplanadi 18, 00130 Helsinki', 60.1679, 24.9442),

('hash_hel_086', 'Jukka Nieminen', '1986-11-03', 'Aleksanterinkatu 55, 00100 Helsinki', 60.1702, 24.9417),
('hash_hel_087', 'Anna Järvinen', '1990-06-16', 'Pohjoisesplanadi 40, 00130 Helsinki', 60.1679, 24.9442),
('hash_hel_088', 'Mikko Koskinen', '1987-01-29', 'Mannerheimintie 25, 00100 Helsinki', 60.1705, 24.9384),
('hash_hel_089', 'Sanna Hiltunen', '1984-10-12', 'Unioninkatu 35, 00170 Helsinki', 60.1728, 24.9423),
('hash_hel_090', 'Eero Lindholm', '1991-07-25', 'Kaisaniemenkatu 12, 00100 Helsinki', 60.1717, 24.9448),

('hash_hel_091', 'Aino Peltola', '1988-02-08', 'Fredrikinkatu 30, 00120 Helsinki', 60.1645, 24.9280),
('hash_hel_092', 'Timo Virtanen', '1985-09-21', 'Bulevardi 20, 00120 Helsinki', 60.1658, 24.9280),
('hash_hel_093', 'Marja Koskinen', '1992-04-04', 'Esplanadi 22, 00130 Helsinki', 60.1685, 24.9448),
('hash_hel_094', 'Antti Nieminen', '1986-11-17', 'Aleksanterinkatu 60, 00100 Helsinki', 60.1708, 24.9423),
('hash_hel_095', 'Riikka Järvinen', '1990-06-30', 'Pohjoisesplanadi 45, 00130 Helsinki', 60.1685, 24.9448),

('hash_hel_096', 'Jukka Koskinen', '1987-01-13', 'Mannerheimintie 30, 00100 Helsinki', 60.1711, 24.9390),
('hash_hel_097', 'Anna Hiltunen', '1984-10-26', 'Unioninkatu 40, 00170 Helsinki', 60.1734, 24.9429),
('hash_hel_098', 'Mikko Lindholm', '1991-07-09', 'Kaisaniemenkatu 15, 00100 Helsinki', 60.1723, 24.9454),
('hash_hel_099', 'Sanna Peltola', '1988-02-22', 'Fredrikinkatu 35, 00120 Helsinki', 60.1651, 24.9286),
('hash_hel_100', 'Eero Virtanen', '1985-09-05', 'Bulevardi 25, 00120 Helsinki', 60.1664, 24.9286);

-- Insert comprehensive profiles with diverse skills and backgrounds
INSERT INTO profiles (user_id, education_level, skills, free_text, availability, capability_score, tags_json, status) VALUES
(1, 'masters', '["cybersecurity", "network security", "penetration testing", "medical"]', 'Experienced cybersecurity specialist and paramedic with 10 years in emergency services. Certified in advanced life support and network security. Former military communications officer with expertise in secure communications and digital forensics.', 'allocated', 92.0, '["cybersecurity", "medical", "defense", "technical"]', 'allocated'),
(2, 'bachelors', '["translation", "communication", "english", "russian", "swedish"]', 'Professional translator fluent in multiple languages with crisis communication experience. Worked with international aid organizations during emergencies. Certified in emergency interpreting and cross-cultural communication.', '24h', 78.0, '["communication", "international"]', 'available'),
(3, 'vocational', '["construction", "heavy machinery", "safety", "logistics", "welding"]', 'Construction supervisor with access to heavy machinery and vehicles. Safety certified with 15 years experience in infrastructure projects. Skilled in emergency repairs and temporary shelter construction.', 'immediate', 85.0, '["technical", "logistics", "construction"]', 'available'),
(4, 'masters', '["psychology", "counseling", "mental health", "crisis intervention"]', 'Clinical psychologist specializing in trauma and crisis intervention. Available for mental health support with experience in disaster psychology and community resilience building.', '48h', 82.0, '["medical", "crisis_intervention"]', 'available'),
(5, 'bachelors', '["IT", "network administration", "communication systems", "radio", "cybersecurity"]', 'IT specialist with expertise in communication systems and radio networks. Can set up emergency communications infrastructure and maintain network security during crisis situations.', 'allocated', 88.0, '["technical", "communication", "cybersecurity"]', 'allocated'),
(6, 'associate', '["nursing", "first aid", "medical equipment", "hospital", "emergency medicine"]', 'Registered nurse with experience in emergency medicine. Can provide medical support and coordinate with hospitals. Certified in trauma care and disaster medicine protocols.', '24h', 86.0, '["medical", "emergency_medicine"]', 'available'),
(7, 'high_school', '["driving", "transport", "logistics", "fuel", "heavy vehicles"]', 'Professional driver with commercial license for heavy vehicles. Access to multiple vehicles and fuel resources. Experienced in emergency logistics and supply chain management.', 'immediate', 72.0, '["logistics", "transport"]', 'available'),
(8, 'masters', '["management", "coordination", "public relations", "media", "crisis management"]', 'Former crisis manager with experience in coordinating emergency responses and public communication. Skilled in resource allocation and inter-agency coordination during large-scale emergencies.', '24h', 90.0, '["leadership", "communication", "crisis_management"]', 'available'),
(9, 'bachelors', '["drones", "UAV", "aerial surveillance", "photography", "mapping"]', 'Commercial drone pilot with advanced UAV certifications. Specializes in aerial surveillance, mapping, and search operations. Has thermal imaging capabilities and can operate in various weather conditions.', 'immediate', 84.0, '["drones", "surveillance", "technical"]', 'available'),
(10, 'vocational', '["electrical", "power systems", "generators", "solar", "emergency power"]', 'Licensed electrician with expertise in emergency power systems and generators. Can restore power infrastructure and set up temporary electrical systems for emergency shelters.', 'immediate', 87.0, '["electrical", "power_systems", "technical"]', 'available'),
(11, 'masters', '["automation", "PLC programming", "industrial systems", "robotics"]', 'Senior automation engineer with 12 years experience in industrial robotics and PLC programming. Expert in SCADA systems and can provide technical support for critical infrastructure.', '24h', 91.0, '["automation", "robotics", "technical"]', 'available'),
(12, 'bachelors', '["mechanical engineering", "heavy machinery", "repairs", "hydraulics"]', 'Mechanical engineer specializing in heavy machinery and hydraulic systems. Can perform emergency repairs on vehicles and equipment. Experience with industrial maintenance and troubleshooting.', 'immediate', 83.0, '["mechanical", "technical", "repairs"]', 'available'),
(13, 'associate', '["welding", "metalwork", "fabrication", "repairs", "construction"]', 'Certified welder with expertise in structural welding and metal fabrication. Can perform emergency repairs on infrastructure and vehicles. Skilled in various welding techniques and materials.', 'immediate', 79.0, '["welding", "metalwork", "technical"]', 'available'),
(14, 'bachelors', '["logistics", "supply chain", "warehouse management", "inventory"]', 'Supply chain specialist with experience in emergency logistics and warehouse management. Can coordinate resource distribution and maintain inventory systems during crisis situations.', '24h', 76.0, '["logistics", "supply_chain"]', 'available'),
(15, 'masters', '["medicine", "emergency medicine", "surgery", "trauma care"]', 'Emergency medicine physician with extensive trauma care experience. Can provide advanced medical support and coordinate medical teams during emergencies. Board certified in emergency medicine.', 'allocated', 95.0, '["medical", "emergency_medicine", "trauma_care"]', 'allocated'),
(16, 'bachelors', '["radio communications", "HAM radio", "emergency communications", "networking"]', 'HAM radio operator and emergency communications specialist. Can establish communication networks when infrastructure fails. Licensed for emergency communications and disaster relief operations.', 'immediate', 81.0, '["communication", "radio", "emergency_comms"]', 'available'),
(17, 'vocational', '["carpentry", "construction", "building", "repairs", "shelter"]', 'Master carpenter with 20 years experience in construction and building repairs. Can construct emergency shelters and perform structural repairs. Skilled in traditional and modern building techniques.', 'immediate', 77.0, '["construction", "carpentry", "building"]', 'available'),
(18, 'bachelors', '["water treatment", "environmental engineering", "sanitation", "public health"]', 'Environmental engineer specializing in water treatment and sanitation systems. Can restore water infrastructure and ensure safe drinking water during emergencies. Expert in public health engineering.', '48h', 80.0, '["environmental", "water_treatment", "public_health"]', 'available'),
(19, 'masters', '["data analysis", "information systems", "GIS", "mapping", "coordination"]', 'Information systems specialist with expertise in data analysis and GIS mapping. Can support decision-making with data visualization and coordinate information flow during emergency operations.', '24h', 82.0, '["data_analysis", "GIS", "information_systems"]', 'available'),
(20, 'bachelors', '["firefighting", "rescue operations", "hazmat", "emergency response"]', 'Professional firefighter with specialized training in rescue operations and hazmat response. Can provide emergency rescue services and coordinate fire safety during crisis situations.', 'immediate', 89.0, '["firefighting", "rescue", "emergency_response"]', 'available');

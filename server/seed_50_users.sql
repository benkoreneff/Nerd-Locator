-- Civitas Seed Data - 50 Finnish Civilians
-- Comprehensive demo data with realistic profiles and proper capability scores

-- Insert 50 users from various Finnish regions
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

-- Tampere region
('hash_tam_011', 'Kaisa Heinonen', '1984-06-12', 'Hämeenkatu 20, 33100 Tampere', 61.4991, 23.7871),
('hash_tam_012', 'Jari Toivonen', '1990-09-05', 'Keskustori 1, 33100 Tampere', 61.4982, 23.7616),
('hash_tam_013', 'Marja Lehtinen', '1987-12-18', 'Satakunnankatu 15, 33100 Tampere', 61.4963, 23.7602),
('hash_tam_014', 'Antti Saarinen', '1985-04-03', 'Kalevan puistotie 4, 33500 Tampere', 61.5025, 23.7756),
('hash_tam_015', 'Sanna Väisänen', '1993-07-25', 'Pirkankatu 8, 33100 Tampere', 61.4975, 23.7623),

-- Turku region
('hash_tur_016', 'Marko Hakkarainen', '1986-02-14', 'Aurakatu 12, 20100 Turku', 60.4518, 22.2666),
('hash_tur_017', 'Riikka Mattila', '1991-10-08', 'Kauppiaskatu 25, 20100 Turku', 60.4503, 22.2754),
('hash_tur_018', 'Juha Kinnunen', '1988-05-22', 'Humalistonkatu 7, 20100 Turku', 60.4545, 22.2612),
('hash_tur_019', 'Pirjo Rissanen', '1984-11-16', 'Linnankatu 18, 20100 Turku', 60.4521, 22.2698),
('hash_tur_020', 'Timo Aaltonen', '1990-03-29', 'Eerikinkatu 14, 20100 Turku', 60.4498, 22.2675),

-- Oulu region
('hash_oul_021', 'Petri Karjalainen', '1987-08-11', 'Kauppurienkatu 10, 90100 Oulu', 65.0121, 25.4651),
('hash_oul_022', 'Helena Koskela', '1992-01-27', 'Kirkkokatu 22, 90100 Oulu', 65.0135, 25.4687),
('hash_oul_023', 'Seppo Laaksonen', '1985-06-04', 'Hallituskatu 6, 90100 Oulu', 65.0118, 25.4623),
('hash_oul_024', 'Marika Turunen', '1989-09-17', 'Pakkahuoneenkatu 3, 90100 Oulu', 65.0128, 25.4645),
('hash_oul_025', 'Jorma Partanen', '1983-12-02', 'Saaristonkatu 15, 90100 Oulu', 65.0132, 25.4667),

-- Kuopio region
('hash_kup_026', 'Tuula Moilanen', '1986-04-19', 'Kauppakatu 12, 70100 Kuopio', 62.8924, 27.6770),
('hash_kup_027', 'Kalevi Rantala', '1991-07-13', 'Kauppakatu 25, 70100 Kuopio', 62.8921, 27.6765),
('hash_kup_028', 'Päivi Heikkinen', '1988-10-26', 'Kauppakatu 8, 70100 Kuopio', 62.8927, 27.6775),
('hash_kup_029', 'Heikki Niemi', '1984-02-08', 'Kauppakatu 18, 70100 Kuopio', 62.8923, 27.6768),
('hash_kup_030', 'Sirpa Kärkkäinen', '1990-05-31', 'Kauppakatu 5, 70100 Kuopio', 62.8925, 27.6772),

-- Jyväskylä region
('hash_jyv_031', 'Risto Hiltunen', '1987-11-24', 'Kauppakatu 9, 40100 Jyväskylä', 62.2415, 25.7209),
('hash_jyv_032', 'Auli Kivinen', '1993-03-07', 'Kauppakatu 21, 40100 Jyväskylä', 62.2412, 25.7205),
('hash_jyv_033', 'Mauri Lindholm', '1985-08-20', 'Kauppakatu 14, 40100 Jyväskylä', 62.2418, 25.7213),
('hash_jyv_034', 'Leena Peltola', '1989-01-15', 'Kauppakatu 27, 40100 Jyväskylä', 62.2410, 25.7203),
('hash_jyv_035', 'Esko Virtanen', '1986-06-28', 'Kauppakatu 16, 40100 Jyväskylä', 62.2416, 25.7211),

-- Rovaniemi region
('hash_rov_036', 'Lauri Kangas', '1988-09-12', 'Korkalonkatu 11, 96200 Rovaniemi', 66.5039, 25.7294),
('hash_rov_037', 'Tarja Miettinen', '1992-12-05', 'Korkalonkatu 24, 96200 Rovaniemi', 66.5036, 25.7291),
('hash_rov_038', 'Ville Peltola', '1984-05-18', 'Korkalonkatu 7, 96200 Rovaniemi', 66.5042, 25.7297),
('hash_rov_039', 'Riitta Savolainen', '1990-02-21', 'Korkalonkatu 19, 96200 Rovaniemi', 66.5038, 25.7295),
('hash_rov_040', 'Pertti Kallio', '1987-07-14', 'Korkalonkatu 13, 96200 Rovaniemi', 66.5040, 25.7296),

-- Lahti region
('hash_lah_041', 'Hanna Nieminen', '1985-10-03', 'Vapaudenkatu 15, 15100 Lahti', 60.9827, 25.6612),
('hash_lah_042', 'Tero Mäkinen', '1991-04-16', 'Vapaudenkatu 28, 15100 Lahti', 60.9824, 25.6609),
('hash_lah_043', 'Outi Koskinen', '1988-11-29', 'Vapaudenkatu 12, 15100 Lahti', 60.9830, 25.6615),
('hash_lah_044', 'Janne Salminen', '1986-06-12', 'Vapaudenkatu 21, 15100 Lahti', 60.9826, 25.6611),
('hash_lah_045', 'Sari Rantanen', '1993-01-25', 'Vapaudenkatu 9, 15100 Lahti', 60.9832, 25.6617),

-- Vaasa region
('hash_vas_046', 'Mikael Johansson', '1987-08-08', 'Vaasanpuistikko 14, 65100 Vaasa', 63.0959, 21.6158),
('hash_vas_047', 'Camilla Andersson', '1992-03-21', 'Vaasanpuistikko 27, 65100 Vaasa', 63.0956, 21.6155),
('hash_vas_048', 'Lars Eriksson', '1984-10-04', 'Vaasanpuistikko 11, 65100 Vaasa', 63.0962, 21.6161),
('hash_vas_049', 'Anna Lindqvist', '1990-05-17', 'Vaasanpuistikko 23, 65100 Vaasa', 63.0957, 21.6156),
    ('hash_vas_050', 'Erik Nyström', '1988-12-30', 'Vaasanpuistikko 18, 65100 Vaasa', 63.0960, 21.6159),

-- Insert rural users from smaller towns and countryside areas
-- Southern Finland rural areas
('hash_por_051', 'Markus Kivinen', '1985-04-12', 'Satakunnantie 45, 28600 Pori', 61.4856, 21.7979),
('hash_por_052', 'Helena Salo', '1991-08-25', 'Merikatu 12, 28600 Pori', 61.4845, 21.7955),
('hash_loh_053', 'Jukka Mäkinen', '1987-11-18', 'Kirkkokatu 8, 39500 Lohja', 60.2486, 24.0653),
('hash_loh_054', 'Riikka Korhonen', '1990-02-03', 'Linnankatu 15, 39500 Lohja', 60.2495, 24.0662),
('hash_por_055', 'Timo Virtanen', '1986-07-14', 'Raumantie 22, 28700 Pori', 61.4889, 21.7998),

-- Central Finland rural areas
('hash_jkl_056', 'Anna-Maija Lehtonen', '1989-09-27', 'Mäntyläntie 5, 40500 Jyväskylä', 62.2425, 25.7215),
('hash_jkl_057', 'Pekka Rantanen', '1984-12-11', 'Korpilahdentie 18, 40900 Jyväskylä', 62.2435, 25.7225),
('hash_joen_058', 'Sari Hämäläinen', '1992-05-08', 'Tulliportinkatu 7, 80100 Joensuu', 62.6019, 29.7636),
('hash_joen_059', 'Matti Koskinen', '1988-03-22', 'Kauppakatu 14, 80100 Joensuu', 62.6025, 29.7642),
('hash_kuo_060', 'Elina Nieminen', '1985-10-15', 'Puijonkatu 22, 70200 Kuopio', 62.8935, 27.6780),

-- Northern Finland rural areas
('hash_oul_061', 'Jari Laitinen', '1987-06-30', 'Kemintie 33, 90500 Oulu', 65.0135, 25.4697),
('hash_oul_062', 'Maija Karjalainen', '1991-01-14', 'Rautatienkatu 25, 90800 Oulu', 65.0145, 25.4707),
('hash_rov_063', 'Antti Järvinen', '1986-08-07', 'Jäämerentie 12, 96300 Rovaniemi', 66.5045, 25.7305),
('hash_rov_064', 'Liisa Räsänen', '1990-04-20', 'Pohjolankatu 18, 96400 Rovaniemi', 66.5055, 25.7315),
('hash_kem_065', 'Toni Salminen', '1988-11-03', 'Kauppakatu 9, 94100 Kemi', 65.7364, 24.5637),

-- Eastern Finland rural areas
('hash_lap_066', 'Sanna Virtanen', '1985-02-16', 'Linnankatu 11, 53100 Lappeenranta', 61.0587, 28.1887),
('hash_lap_067', 'Mikko Korhonen', '1992-09-29', 'Villimiehenkatu 6, 53200 Lappeenranta', 61.0597, 28.1897),
('hash_im_068', 'Eeva Mäkelä', '1987-12-12', 'Kauppakatu 13, 55120 Imatra', 61.1719, 28.7674),
('hash_im_069', 'Pasi Hiltunen', '1989-07-25', 'Rantakatu 4, 55120 Imatra', 61.1729, 28.7684),
('hash_kot_070', 'Johanna Leppänen', '1986-03-08', 'Kirkkokatu 17, 48100 Kotka', 60.4669, 26.9459);

-- Insert comprehensive profiles with realistic capability scores
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
(20, 'bachelors', '["firefighting", "rescue operations", "hazmat", "emergency response"]', 'Professional firefighter with specialized training in rescue operations and hazmat response. Can provide emergency rescue services and coordinate fire safety during crisis situations.', 'immediate', 89.0, '["firefighting", "rescue", "emergency_response"]', 'available'),
(21, 'bachelors', '["marine engineering", "ship repair", "emergency response", "navigation"]', 'Marine engineer with expertise in ship repair and emergency response at sea. Can coordinate maritime rescue operations and provide technical support for marine infrastructure.', '24h', 83.0, '["marine", "emergency_response", "technical"]', 'available'),
(22, 'masters', '["forestry", "environmental science", "wildfire management", "conservation"]', 'Forestry specialist with extensive experience in wildfire management and environmental conservation. Can coordinate forest fire response and environmental protection efforts.', 'immediate', 79.0, '["forestry", "wildfire_management", "environmental"]', 'available'),
(23, 'vocational', '["heavy equipment", "excavation", "earthmoving", "construction"]', 'Heavy equipment operator with 18 years experience in excavation and earthmoving. Can provide equipment support for emergency construction and debris removal operations.', 'immediate', 74.0, '["heavy_equipment", "construction", "excavation"]', 'available'),
(24, 'bachelors', '["telecommunications", "satellite communications", "emergency networks", "IT"]', 'Telecommunications engineer specializing in satellite communications and emergency network setup. Can establish communication infrastructure when terrestrial systems fail.', '24h', 86.0, '["telecommunications", "satellite", "emergency_networks"]', 'available'),
(25, 'associate', '["aviation", "aircraft maintenance", "flight operations", "emergency transport"]', 'Aviation technician with commercial pilot license and aircraft maintenance certification. Can provide emergency air transport and coordinate aviation resources.', 'immediate', 88.0, '["aviation", "emergency_transport", "flight_operations"]', 'available'),
(26, 'masters', '["public health", "epidemiology", "disease control", "medical coordination"]', 'Public health specialist with expertise in epidemiology and disease control. Can coordinate medical response during health emergencies and manage disease surveillance.', '48h', 87.0, '["public_health", "epidemiology", "disease_control"]', 'available'),
(27, 'bachelors', '["geology", "earthquake response", "natural disasters", "risk assessment"]', 'Geologist specializing in earthquake response and natural disaster risk assessment. Can provide technical support for geological hazard evaluation and emergency planning.', '24h', 80.0, '["geology", "earthquake_response", "natural_disasters"]', 'available'),
(28, 'vocational', '["plumbing", "water systems", "sanitation", "emergency repairs"]', 'Master plumber with expertise in water systems and emergency repairs. Can restore water infrastructure and maintain sanitation systems during crisis situations.', 'immediate', 76.0, '["plumbing", "water_systems", "sanitation"]', 'available'),
(29, 'bachelors', '["chemistry", "hazmat", "chemical safety", "decontamination"]', 'Chemical safety specialist with HAZMAT certification and decontamination expertise. Can handle chemical emergencies and coordinate hazardous material response.', 'immediate', 85.0, '["chemistry", "hazmat", "chemical_safety"]', 'available'),
(30, 'masters', '["social work", "community support", "vulnerable populations", "crisis counseling"]', 'Social worker specializing in community support and crisis counseling. Can coordinate support services for vulnerable populations during emergencies.', '24h', 78.0, '["social_work", "community_support", "crisis_counseling"]', 'available'),
(31, 'bachelors', '["civil engineering", "infrastructure", "bridge repair", "structural assessment"]', 'Civil engineer with expertise in infrastructure assessment and bridge repair. Can evaluate structural damage and coordinate infrastructure restoration efforts.', '24h', 84.0, '["civil_engineering", "infrastructure", "structural_assessment"]', 'available'),
(32, 'associate', '["HVAC", "climate control", "ventilation systems", "emergency cooling"]', 'HVAC technician specializing in emergency climate control and ventilation systems. Can restore heating and cooling systems in emergency shelters and facilities.', 'immediate', 73.0, '["HVAC", "climate_control", "ventilation"]', 'available'),
(33, 'bachelors', '["food safety", "nutrition", "emergency feeding", "logistics"]', 'Food safety specialist with experience in emergency feeding operations and nutrition planning. Can coordinate food distribution and ensure food safety during emergencies.', '24h', 77.0, '["food_safety", "emergency_feeding", "nutrition"]', 'available'),
(34, 'masters', '["urban planning", "evacuation planning", "emergency shelter", "spatial analysis"]', 'Urban planner with expertise in evacuation planning and emergency shelter coordination. Can support emergency planning and spatial analysis for crisis response.', '48h', 81.0, '["urban_planning", "evacuation_planning", "emergency_shelter"]', 'available'),
(35, 'vocational', '["refrigeration", "cooling systems", "emergency cooling", "equipment repair"]', 'Refrigeration technician with expertise in emergency cooling systems and equipment repair. Can maintain temperature control systems in emergency situations.', 'immediate', 75.0, '["refrigeration", "cooling_systems", "equipment_repair"]', 'available'),
(36, 'bachelors', '["wildlife management", "animal rescue", "veterinary support", "conservation"]', 'Wildlife management specialist with veterinary support experience. Can coordinate animal rescue operations and provide wildlife conservation support during emergencies.', '24h', 79.0, '["wildlife_management", "animal_rescue", "veterinary_support"]', 'available'),
(37, 'masters', '["energy systems", "power grid", "renewable energy", "emergency power"]', 'Energy systems engineer specializing in power grid restoration and renewable energy systems. Can restore power infrastructure and coordinate emergency energy solutions.', '24h', 86.0, '["energy_systems", "power_grid", "renewable_energy"]', 'available'),
(38, 'bachelors', '["security", "crowd control", "emergency security", "risk management"]', 'Security specialist with experience in crowd control and emergency security operations. Can provide security coordination and risk management during crisis situations.', 'immediate', 82.0, '["security", "crowd_control", "risk_management"]', 'available'),
(39, 'associate', '["landscaping", "tree removal", "debris clearing", "emergency cleanup"]', 'Landscaping specialist with expertise in emergency cleanup and debris removal. Can coordinate environmental cleanup operations and tree removal services.', 'immediate', 71.0, '["landscaping", "debris_clearing", "emergency_cleanup"]', 'available'),
(40, 'bachelors', '["meteorology", "weather forecasting", "storm tracking", "emergency weather"]', 'Meteorologist with expertise in emergency weather forecasting and storm tracking. Can provide weather support for emergency operations and severe weather response.', '24h', 83.0, '["meteorology", "weather_forecasting", "storm_tracking"]', 'available'),
(41, 'masters', '["disaster recovery", "business continuity", "emergency planning", "risk assessment"]', 'Disaster recovery specialist with expertise in business continuity and emergency planning. Can coordinate recovery operations and support organizational resilience.', '48h', 85.0, '["disaster_recovery", "business_continuity", "emergency_planning"]', 'available'),
(42, 'bachelors', '["transportation", "traffic management", "emergency routing", "logistics"]', 'Transportation engineer with expertise in emergency traffic management and routing. Can coordinate transportation systems during emergency evacuations and response.', '24h', 80.0, '["transportation", "traffic_management", "emergency_routing"]', 'available'),
(43, 'vocational', '["crane operation", "heavy lifting", "equipment operation", "construction"]', 'Certified crane operator with expertise in heavy lifting and equipment operation. Can provide heavy equipment support for emergency construction and rescue operations.', 'immediate', 76.0, '["crane_operation", "heavy_lifting", "equipment_operation"]', 'available'),
(44, 'bachelors', '["information security", "cyber defense", "digital forensics", "network protection"]', 'Information security specialist with expertise in cyber defense and digital forensics. Can protect critical systems and investigate cyber incidents during emergencies.', '24h', 89.0, '["information_security", "cyber_defense", "digital_forensics"]', 'available'),
(45, 'associate', '["emergency dispatch", "communication coordination", "radio operations", "call center"]', 'Emergency dispatch specialist with expertise in communication coordination and radio operations. Can manage emergency communications and coordinate response teams.', 'immediate', 78.0, '["emergency_dispatch", "communication_coordination", "radio_operations"]', 'available'),
(46, 'bachelors', '["international relations", "diplomacy", "cross-border coordination", "multilingual"]', 'International relations specialist with diplomatic experience and multilingual capabilities. Can coordinate international assistance and cross-border emergency response.', '48h', 84.0, '["international_relations", "diplomacy", "cross_border_coordination"]', 'available'),
(47, 'masters', '["economics", "resource allocation", "emergency funding", "financial coordination"]', 'Economic analyst with expertise in resource allocation and emergency funding coordination. Can support financial planning and resource optimization during crisis response.', '24h', 82.0, '["economics", "resource_allocation", "emergency_funding"]', 'available'),
(48, 'bachelors', '["law enforcement", "investigation", "evidence collection", "emergency policing"]', 'Law enforcement officer with investigation expertise and emergency policing experience. Can provide security coordination and evidence collection during crisis situations.', 'immediate', 87.0, '["law_enforcement", "investigation", "evidence_collection"]', 'available'),
(49, 'vocational', '["masonry", "stone work", "building repair", "structural restoration"]', 'Master mason with expertise in stone work and building repair. Can perform structural restoration and emergency building repairs using traditional and modern techniques.', 'immediate', 74.0, '["masonry", "stone_work", "building_repair"]', 'available'),
(50, 'bachelors', '["agriculture", "food production", "emergency farming", "rural coordination"]', 'Agricultural specialist with expertise in emergency food production and rural coordination. Can support agricultural operations and coordinate rural emergency response.', '24h', 76.0, '["agriculture", "food_production", "rural_coordination"]', 'available'),

-- Insert profiles for rural users (IDs 51-70)
(51, 'vocational', '["agriculture", "heavy machinery", "tractor operation", "farm equipment"]', 'Agricultural specialist with access to heavy farm machinery and tractors. Can provide equipment support for emergency operations and rural logistics coordination.', 'immediate', 73.0, '["agriculture", "heavy_machinery", "rural"]', 'available'),
(52, 'high_school', '["forestry", "chainsaw operation", "tree removal", "wood processing"]', 'Forestry worker with chainsaw certification and tree removal experience. Can assist with debris clearing and emergency tree removal operations.', 'immediate', 69.0, '["forestry", "chainsaw", "tree_removal"]', 'available'),
(53, 'bachelors', '["geology", "mining", "heavy equipment", "safety protocols"]', 'Geologist with mining experience and heavy equipment operation skills. Can provide technical support for geological assessments and equipment operations.', '24h', 77.0, '["geology", "mining", "heavy_equipment"]', 'available'),
(54, 'associate', '["veterinary", "animal care", "livestock", "emergency animal rescue"]', 'Veterinary technician with livestock experience and emergency animal care skills. Can coordinate animal rescue operations and provide veterinary support.', 'immediate', 75.0, '["veterinary", "animal_care", "livestock"]', 'available'),
(55, 'vocational', '["welding", "metal fabrication", "repairs", "rural construction"]', 'Rural welder with metal fabrication skills and construction experience. Can perform emergency repairs and metalwork in remote locations.', 'immediate', 71.0, '["welding", "metal_fabrication", "rural_construction"]', 'available'),
(56, 'bachelors', '["environmental science", "water quality", "rural development", "sustainability"]', 'Environmental scientist specializing in rural water quality and sustainable development. Can assess environmental conditions and coordinate rural development initiatives.', '48h', 79.0, '["environmental_science", "water_quality", "rural_development"]', 'available'),
(57, 'masters', '["forest ecology", "conservation", "research", "data analysis"]', 'Forest ecologist with research experience in conservation and data analysis. Can provide scientific support for environmental monitoring and conservation efforts.', '24h', 81.0, '["forest_ecology", "conservation", "research"]', 'available'),
(58, 'bachelors', '["agricultural engineering", "irrigation", "farm technology", "automation"]', 'Agricultural engineer with expertise in farm technology and irrigation systems. Can provide technical support for agricultural operations and rural infrastructure.', '24h', 78.0, '["agricultural_engineering", "irrigation", "farm_technology"]', 'available'),
(59, 'vocational', '["mechanical repair", "diesel engines", "farm equipment", "emergency repairs"]', 'Mechanical repair specialist with diesel engine expertise and farm equipment experience. Can perform emergency repairs on agricultural and industrial machinery.', 'immediate', 74.0, '["mechanical_repair", "diesel_engines", "farm_equipment"]', 'available'),
(60, 'bachelors', '["rural medicine", "emergency care", "community health", "medical logistics"]', 'Rural medicine specialist with emergency care experience and community health expertise. Can provide medical support in remote areas and coordinate rural healthcare logistics.', '24h', 82.0, '["rural_medicine", "emergency_care", "community_health"]', 'available'),
(61, 'masters', '["renewable energy", "wind power", "solar systems", "energy storage"]', 'Renewable energy engineer specializing in wind and solar power systems. Can provide technical support for renewable energy infrastructure and emergency power solutions.', '48h', 84.0, '["renewable_energy", "wind_power", "solar_systems"]', 'available'),
(62, 'bachelors', '["marine biology", "coastal conservation", "water monitoring", "research"]', 'Marine biologist with coastal conservation experience and water monitoring expertise. Can provide scientific support for marine environmental protection and coastal emergency response.', '24h', 76.0, '["marine_biology", "coastal_conservation", "water_monitoring"]', 'available'),
(63, 'vocational', '["snowmobile operation", "winter rescue", "cold weather survival", "emergency transport"]', 'Snowmobile operator with winter rescue experience and cold weather survival skills. Can provide emergency transport and rescue services in Arctic conditions.', 'immediate', 72.0, '["snowmobile_operation", "winter_rescue", "cold_weather_survival"]', 'available'),
(64, 'bachelors', '["reindeer herding", "indigenous knowledge", "traditional skills", "community coordination"]', 'Reindeer herder with traditional indigenous knowledge and community coordination skills. Can provide local expertise and coordinate community-based emergency response in Arctic regions.', 'immediate', 70.0, '["reindeer_herding", "indigenous_knowledge", "traditional_skills"]', 'available'),
(65, 'associate', '["fishing", "boat operation", "marine safety", "emergency rescue"]', 'Commercial fisherman with boat operation experience and marine safety certification. Can provide maritime rescue services and coordinate fishing fleet emergency response.', 'immediate', 73.0, '["fishing", "boat_operation", "marine_safety"]', 'available'),
(66, 'bachelors', '["border security", "customs", "international cooperation", "emergency coordination"]', 'Border security specialist with customs experience and international cooperation skills. Can coordinate cross-border emergency response and international aid coordination.', '24h', 80.0, '["border_security", "customs", "international_cooperation"]', 'available'),
(67, 'masters', '["logistics", "supply chain", "international trade", "emergency distribution"]', 'International logistics specialist with supply chain expertise and emergency distribution experience. Can coordinate cross-border supply chains and emergency resource distribution.', '48h', 83.0, '["logistics", "supply_chain", "international_trade"]', 'available'),
(68, 'vocational', '["power line maintenance", "electrical repair", "rural infrastructure", "emergency power"]', 'Power line technician with electrical repair experience and rural infrastructure expertise. Can restore power systems and maintain electrical infrastructure in remote areas.', 'immediate', 75.0, '["power_line_maintenance", "electrical_repair", "rural_infrastructure"]', 'available'),
(69, 'bachelors', '["water treatment", "environmental engineering", "rural sanitation", "emergency water"]', 'Water treatment specialist with environmental engineering expertise and rural sanitation experience. Can restore water systems and ensure safe drinking water in emergency situations.', '24h', 77.0, '["water_treatment", "environmental_engineering", "rural_sanitation"]', 'available'),
(70, 'masters', '["port operations", "maritime logistics", "cargo handling", "emergency shipping"]', 'Port operations manager with maritime logistics expertise and cargo handling experience. Can coordinate port operations and maritime emergency response during crisis situations.', '24h', 82.0, '["port_operations", "maritime_logistics", "cargo_handling"]', 'available');

-- Insert diverse resources
INSERT INTO resources (user_id, category, subtype, quantity, specs_json, available) VALUES
(1, 'comms', 'vhf_uhf', 2, '{"range": "50km", "channels": 25, "encryption": "yes"}', 1),
(1, 'power', 'generator', 1, '{"power_kw": 15, "fuel_type": "diesel", "runtime_hours": 24}', 1),
(3, 'heavy', 'forklift', 1, '{"capacity_kg": 5000, "fuel_type": "diesel", "lift_height_m": 6}', 1),
(3, 'transport', 'van_truck', 2, '{"capacity": "medium", "fuel_type": "diesel", "cargo_m3": 12}', 1),
(5, 'comms', 'ham_license', 1, '{"license_class": "Advanced", "frequency_range": "HF/VHF/UHF", "power_watts": 100}', 1),
(6, 'power', 'battery_bank', 3, '{"capacity_ah": 200, "voltage": "12V", "type": "lithium"}', 1),
(7, 'transport', 'van_truck', 1, '{"capacity": "large", "fuel_type": "diesel", "cargo_m3": 20}', 1),
(9, 'drone', 'fpv', 2, '{"flight_time_min": 25, "range_km": 8, "camera": "thermal"}', 1),
(9, 'drone', 'longrange', 1, '{"flight_time_min": 45, "range_km": 15, "payload_kg": 2}', 1),
(10, 'power', 'generator', 2, '{"power_kw": 25, "fuel_type": "diesel", "runtime_hours": 36}', 1),
(10, 'power', 'solar', 1, '{"capacity_kw": 5, "battery_storage": "yes", "grid_tie": "yes"}', 1),
(11, 'fabrication', '3d_printer', 2, '{"build_volume": "300x300x400mm", "material": "PLA/ABS/PETG", "precision": "0.1mm"}', 1),
(11, 'fabrication', 'cnc', 1, '{"work_area": "1000x600mm", "spindle_power": "3kW", "precision": "0.01mm"}', 1),
(12, 'heavy', 'welder', 1, '{"type": "MIG/TIG", "power_input": "380V", "duty_cycle": "60%"}', 1),
(13, 'heavy', 'welder', 2, '{"type": "ARC/MIG", "power_input": "220V", "duty_cycle": "40%"}', 1),
(14, 'transport', 'van_truck', 1, '{"capacity": "small", "fuel_type": "gasoline", "cargo_m3": 6}', 1),
(16, 'comms', 'vhf_uhf', 1, '{"range": "30km", "channels": 16, "encryption": "no"}', 1),
(17, 'workshop', 'garage', 1, '{"area_m2": 80, "equipment": "full", "heating": "yes"}', 1),
(18, 'power', 'generator', 1, '{"power_kw": 10, "fuel_type": "gasoline", "runtime_hours": 12}', 1),
(20, 'heavy', 'tools', 1, '{"tool_set": "comprehensive", "specialty": "firefighting", "portable": "yes"}', 1),
(22, 'transport', 'offroad', 1, '{"type": "ATV", "capacity": "2 persons", "terrain": "all"}', 1),
(23, 'heavy', 'forklift', 1, '{"capacity_kg": 3500, "fuel_type": "gasoline", "lift_height_m": 4}', 1),
(24, 'comms', 'satellite', 1, '{"type": "portable", "data_rate": "2Mbps", "coverage": "global"}', 1),
(25, 'transport', 'aircraft', 1, '{"type": "helicopter", "capacity": "4 persons", "range_km": 400}', 1),
(26, 'power', 'battery_bank', 2, '{"capacity_ah": 100, "voltage": "24V", "type": "lead_acid"}', 1);

-- Insert sample requests
INSERT INTO requests (authority_id, type, user_id, message, status) VALUES
('hash_authority1', 'info', 1, 'Need additional information about cybersecurity certifications and medical training', 'pending'),
('hash_authority1', 'allocate', 3, 'Emergency construction work needed for infrastructure repair', 'pending'),
('hash_authority1', 'info', 5, 'Requesting details about communication system capabilities', 'pending'),
('hash_authority1', 'allocate', 9, 'Drone surveillance support needed for search operations', 'pending'),
('hash_authority1', 'info', 15, 'Medical team coordination for emergency response', 'pending'),
('hash_authority1', 'allocate', 20, 'Firefighting support for emergency response', 'pending'),
('hash_authority1', 'info', 25, 'Aviation support for emergency transport', 'pending'),
('hash_authority1', 'allocate', 44, 'Cybersecurity support for critical infrastructure protection', 'pending');

-- Insert sample allocations (without resource references to avoid FK constraints)
INSERT INTO allocations (user_id, resource_id, mission_code, status) VALUES
(1, NULL, 'MED-CYBER-2024-001', 'active'),
(5, NULL, 'COMM-2024-001', 'active'),
(15, NULL, 'MED-EMERGENCY-2024-001', 'active'),
(20, NULL, 'FIRE-2024-001', 'active'),
(44, NULL, 'CYBER-DEFENSE-2024-001', 'active');

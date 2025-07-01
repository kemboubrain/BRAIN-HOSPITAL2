/*
  # Insertion des données de démonstration avec gestion des doublons

  1. Données d'exemple
    - Patients avec profils sénégalais
    - Médecins de différentes spécialités
    - Rendez-vous et consultations
    - Médicaments avec prix en XOF
    - Factures et résultats de laboratoire

  2. Gestion des doublons
    - Utilisation de ON CONFLICT DO NOTHING
    - Vérification de l'existence avant insertion
*/

-- Insertion des patients avec gestion des doublons
INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, phone, email, address, city, postal_code, blood_group, allergies, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, insurance_provider, insurance_number) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Aminata', 'Diallo', '1985-03-15', 'F', '+221 77 123 45 67', 'aminata.diallo@email.com', '15 rue de la Paix', 'Dakar', '10001', 'A+', 'Pénicilline', 'Mamadou Diallo', '+221 77 987 65 43', 'Époux', 'IPRES', '1 85 03 75 123 456 78'),
('550e8400-e29b-41d4-a716-446655440002', 'Ousmane', 'Ndiaye', '1978-07-22', 'M', '+221 76 234 56 78', 'ousmane.ndiaye@email.com', '42 avenue Bourguiba', 'Thiès', '21001', 'B+', 'Aucune', 'Fatou Ndiaye', '+221 76 876 54 32', 'Épouse', 'CSS', '1 78 07 69 234 567 89'),
('550e8400-e29b-41d4-a716-446655440003', 'Aïssatou', 'Sow', '1992-11-08', 'F', '+221 78 345 67 89', 'aissatou.sow@email.com', '8 boulevard Général de Gaulle', 'Saint-Louis', '32001', 'O-', 'Arachides, Fruits de mer', 'Ibrahima Sow', '+221 78 765 43 21', 'Père', 'Mutuelle Santé', 'MS 92 11 08 345 678'),
('550e8400-e29b-41d4-a716-446655440004', 'Moussa', 'Fall', '1965-12-03', 'M', '+221 77 456 78 90', 'moussa.fall@email.com', '25 rue Félix Faure', 'Kaolack', '22001', 'AB+', 'Aspirine', 'Khady Fall', '+221 77 654 32 10', 'Épouse', 'IPRES', 'IP 65 12 03 456 789'),
('550e8400-e29b-41d4-a716-446655440005', 'Mariama', 'Ba', '1990-06-25', 'F', '+221 76 567 89 01', 'mariama.ba@email.com', '12 place de l''Indépendance', 'Ziguinchor', '27001', 'O+', 'Lactose', 'Alioune Ba', '+221 76 543 21 09', 'Frère', 'CSS', 'CS 90 06 25 567 890'),
('550e8400-e29b-41d4-a716-446655440006', 'Cheikh', 'Sarr', '2010-02-14', 'M', '+221 78 678 90 12', 'contact.sarr@email.com', '7 avenue Léopold Sédar Senghor', 'Tambacounda', '26001', 'A-', 'Aucune', 'Awa Sarr', '+221 78 432 10 98', 'Mère', 'Mutuelle Santé', 'MS 10 02 14 678 901'),
('550e8400-e29b-41d4-a716-446655440007', 'Fatou', 'Cissé', '1988-09-12', 'F', '+221 77 789 01 23', 'fatou.cisse@email.com', '33 rue Blaise Diagne', 'Diourbel', '24001', 'B-', 'Pollen', 'Abdou Cissé', '+221 77 321 09 87', 'Époux', 'IPRES', 'IP 88 09 12 789 012'),
('550e8400-e29b-41d4-a716-446655440008', 'Ibrahima', 'Gueye', '1995-04-08', 'M', '+221 76 890 12 34', 'ibrahima.gueye@email.com', '18 rue Parchappe', 'Rufisque', '11001', 'A+', 'Gluten', 'Coumba Gueye', '+221 76 210 98 76', 'Mère', 'CSS', 'CS 95 04 08 890 123'),
('550e8400-e29b-41d4-a716-446655440009', 'Ndèye', 'Diop', '1982-11-30', 'F', '+221 78 901 23 45', 'ndeye.diop@email.com', '9 avenue Cheikh Anta Diop', 'Mbour', '23001', 'O-', 'Fruits à coque', 'Modou Diop', '+221 78 109 87 65', 'Époux', 'Mutuelle Santé', 'MS 82 11 30 901 234'),
('550e8400-e29b-41d4-a716-446655440010', 'Lamine', 'Touré', '1975-05-18', 'M', '+221 77 012 34 56', 'lamine.toure@email.com', '14 rue Carnot', 'Louga', '25001', 'AB-', 'Iode', 'Rama Touré', '+221 77 098 76 54', 'Épouse', 'IPRES', 'IP 75 05 18 012 345')
ON CONFLICT (id) DO NOTHING;

-- Insertion des médecins avec tarifs en XOF
INSERT INTO doctors (id, first_name, last_name, specialty, phone, email, schedule, consultation_fee) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Dr. Abdoulaye', 'Diagne', 'Médecine Générale', '+221 33 821 12 34', 'a.diagne@clinique.sn', '{"monday": {"start": "09:00", "end": "17:00", "available": true}, "tuesday": {"start": "09:00", "end": "17:00", "available": true}, "wednesday": {"start": "09:00", "end": "17:00", "available": true}, "thursday": {"start": "09:00", "end": "17:00", "available": true}, "friday": {"start": "09:00", "end": "17:00", "available": true}, "saturday": {"start": "09:00", "end": "12:00", "available": true}, "sunday": {"start": "00:00", "end": "00:00", "available": false}}', 25000),
('660e8400-e29b-41d4-a716-446655440002', 'Dr. Fatima', 'Mbaye', 'Cardiologie', '+221 33 822 23 45', 'f.mbaye@clinique.sn', '{"monday": {"start": "08:00", "end": "16:00", "available": true}, "tuesday": {"start": "08:00", "end": "16:00", "available": true}, "wednesday": {"start": "08:00", "end": "16:00", "available": true}, "thursday": {"start": "08:00", "end": "16:00", "available": true}, "friday": {"start": "08:00", "end": "16:00", "available": true}, "saturday": {"start": "00:00", "end": "00:00", "available": false}, "sunday": {"start": "00:00", "end": "00:00", "available": false}}', 40000),
('660e8400-e29b-41d4-a716-446655440003', 'Dr. Mamadou', 'Kane', 'Pédiatrie', '+221 33 823 34 56', 'm.kane@clinique.sn', '{"monday": {"start": "10:00", "end": "18:00", "available": true}, "tuesday": {"start": "10:00", "end": "18:00", "available": true}, "wednesday": {"start": "10:00", "end": "18:00", "available": true}, "thursday": {"start": "10:00", "end": "18:00", "available": true}, "friday": {"start": "10:00", "end": "18:00", "available": true}, "saturday": {"start": "10:00", "end": "14:00", "available": true}, "sunday": {"start": "00:00", "end": "00:00", "available": false}}', 30000),
('660e8400-e29b-41d4-a716-446655440004', 'Dr. Awa', 'Thiam', 'Dermatologie', '+221 33 824 45 67', 'a.thiam@clinique.sn', '{"monday": {"start": "09:00", "end": "17:00", "available": true}, "tuesday": {"start": "09:00", "end": "17:00", "available": true}, "wednesday": {"start": "00:00", "end": "00:00", "available": false}, "thursday": {"start": "09:00", "end": "17:00", "available": true}, "friday": {"start": "09:00", "end": "17:00", "available": true}, "saturday": {"start": "09:00", "end": "13:00", "available": true}, "sunday": {"start": "00:00", "end": "00:00", "available": false}}', 35000),
('660e8400-e29b-41d4-a716-446655440005', 'Dr. Cheikh', 'Diouf', 'Orthopédie', '+221 33 825 56 78', 'c.diouf@clinique.sn', '{"monday": {"start": "08:30", "end": "16:30", "available": true}, "tuesday": {"start": "08:30", "end": "16:30", "available": true}, "wednesday": {"start": "08:30", "end": "16:30", "available": true}, "thursday": {"start": "08:30", "end": "16:30", "available": true}, "friday": {"start": "08:30", "end": "12:30", "available": true}, "saturday": {"start": "00:00", "end": "00:00", "available": false}, "sunday": {"start": "00:00", "end": "00:00", "available": false}}', 45000),
('660e8400-e29b-41d4-a716-446655440006', 'Dr. Mame', 'Seck', 'Gynécologie', '+221 33 826 67 89', 'm.seck@clinique.sn', '{"monday": {"start": "09:00", "end": "17:00", "available": true}, "tuesday": {"start": "09:00", "end": "17:00", "available": true}, "wednesday": {"start": "09:00", "end": "17:00", "available": true}, "thursday": {"start": "09:00", "end": "17:00", "available": true}, "friday": {"start": "09:00", "end": "17:00", "available": true}, "saturday": {"start": "00:00", "end": "00:00", "available": false}, "sunday": {"start": "00:00", "end": "00:00", "available": false}}', 38000)
ON CONFLICT (id) DO NOTHING;

-- Insertion des médicaments avec prix en XOF
INSERT INTO medications (id, name, category, manufacturer, batch_number, expiry_date, stock, unit_price, min_stock, description) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Paracétamol 1000mg', 'Antalgique', 'Pharma Sénégal', 'PS2024001', '2025-12-31', 500, 100, 50, 'Antalgique et antipyrétique'),
('770e8400-e29b-41d4-a716-446655440002', 'Amoxicilline 500mg', 'Antibiotique', 'MediAfrique', 'MA2024002', '2025-06-30', 200, 250, 30, 'Antibiotique pénicilline'),
('770e8400-e29b-41d4-a716-446655440003', 'Ibuprofène 400mg', 'Anti-inflammatoire', 'PharmaWest', 'PW2024003', '2025-09-15', 150, 150, 25, 'Anti-inflammatoire non stéroïdien'),
('770e8400-e29b-41d4-a716-446655440004', 'Oméprazole 20mg', 'Digestif', 'Pharma Sénégal', 'PS2024004', '2025-08-20', 80, 200, 20, 'Inhibiteur de la pompe à protons'),
('770e8400-e29b-41d4-a716-446655440005', 'Salbutamol 100mcg', 'Respiratoire', 'RespiMed Afrique', 'RMA2024005', '2025-11-10', 45, 3500, 15, 'Bronchodilatateur'),
('770e8400-e29b-41d4-a716-446655440006', 'Loratadine 10mg', 'Antihistaminique', 'AllergyFree Sénégal', 'AFS2024006', '2025-07-05', 25, 120, 30, 'Antihistaminique H1'),
('770e8400-e29b-41d4-a716-446655440007', 'Metformine 850mg', 'Antidiabétique', 'DiabetCare Afrique', 'DCA2024007', '2025-10-15', 120, 180, 40, 'Antidiabétique oral'),
('770e8400-e29b-41d4-a716-446655440008', 'Chloroquine 250mg', 'Antipaludique', 'MalariaStop', 'MS2024008', '2025-12-20', 300, 80, 100, 'Traitement du paludisme'),
('770e8400-e29b-41d4-a716-446655440009', 'Vitamine C 500mg', 'Vitamine', 'VitaAfrique', 'VA2024009', '2025-09-30', 200, 75, 50, 'Complément vitaminique'),
('770e8400-e29b-41d4-a716-446655440010', 'Fer + Acide Folique', 'Complément', 'NutriSénégal', 'NS2024010', '2025-11-25', 150, 120, 30, 'Traitement de l''anémie')
ON CONFLICT (id) DO NOTHING;

-- Insertion des rendez-vous
INSERT INTO appointments (id, patient_id, doctor_id, date, time, duration, type, status, reason, notes) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-02-15', '10:00', 30, 'consultation', 'scheduled', 'Consultation de routine', ''),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '2024-02-16', '14:30', 45, 'follow-up', 'confirmed', 'Suivi cardiologique', ''),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '2024-02-14', '16:00', 30, 'consultation', 'completed', 'Vaccination', ''),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '2024-02-17', '11:30', 30, 'consultation', 'scheduled', 'Douleurs abdominales', ''),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', '2024-02-18', '09:15', 30, 'consultation', 'confirmed', 'Consultation dermatologique', ''),
('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003', '2024-02-19', '15:45', 30, 'follow-up', 'scheduled', 'Suivi pédiatrique', ''),
('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440006', '2024-02-20', '10:30', 45, 'consultation', 'scheduled', 'Consultation gynécologique', '')
ON CONFLICT (id) DO NOTHING;

-- Insertion des consultations
INSERT INTO consultations (id, appointment_id, patient_id, doctor_id, date, symptoms, diagnosis, treatment, notes, follow_up_date) VALUES
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '2024-02-14', 'Fièvre légère, fatigue', 'Syndrome viral bénin', 'Repos, hydratation', 'Patient en bonne santé générale. Vaccination à jour.', NULL),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-02-15', 'Maux de tête récurrents, stress', 'Céphalées de tension', 'Antalgiques, relaxation', 'Recommander des techniques de gestion du stress.', '2024-03-15'),
('990e8400-e29b-41d4-a716-446655440003', NULL, '550e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440001', '2024-02-12', 'Toux persistante, fièvre', 'Infection respiratoire', 'Antibiotiques, repos', 'Amélioration attendue sous 7 jours', '2024-02-26')
ON CONFLICT (id) DO NOTHING;

-- Insertion des prescriptions
INSERT INTO prescriptions (id, consultation_id, medication_id, dosage, frequency, duration, instructions) VALUES
(gen_random_uuid(), '990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '1 comprimé', '3 fois par jour', '5 jours', 'À prendre pendant les repas'),
(gen_random_uuid(), '990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '1 comprimé', 'Au besoin', '10 jours', 'Maximum 3 comprimés par jour'),
(gen_random_uuid(), '990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', '1 gélule', '2 fois par jour', '7 jours', 'À prendre à jeun'),
(gen_random_uuid(), '990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440009', '1 comprimé', '1 fois par jour', '15 jours', 'Le matin au petit-déjeuner');

-- Insertion des factures avec montants en XOF
INSERT INTO invoices (id, patient_id, consultation_id, date, subtotal, tax, total, status, payment_method, payment_date) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', '2024-02-14', 30000, 0, 30000, 'paid', 'Espèces', '2024-02-14'),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', '2024-02-15', 25000, 0, 25000, 'pending', 'Mobile Money', NULL),
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440003', '2024-02-12', 25000, 0, 25000, 'overdue', 'Chèque', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insertion des éléments de facture
INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total) VALUES
(gen_random_uuid(), 'aa0e8400-e29b-41d4-a716-446655440001', 'Consultation pédiatrique', 1, 30000, 30000),
(gen_random_uuid(), 'aa0e8400-e29b-41d4-a716-446655440002', 'Consultation médecine générale', 1, 25000, 25000),
(gen_random_uuid(), 'aa0e8400-e29b-41d4-a716-446655440003', 'Consultation médecine générale', 1, 25000, 25000);

-- Insertion des résultats de laboratoire
INSERT INTO lab_results (id, patient_id, consultation_id, test_type, test_date, results, conclusion, technician) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', NULL, 'Bilan lipidique', '2024-02-10', '{"cholesterolTotal": {"value": "180", "unit": "mg/dL", "referenceRange": "< 200", "status": "normal"}, "hdl": {"value": "55", "unit": "mg/dL", "referenceRange": "> 40", "status": "normal"}, "ldl": {"value": "110", "unit": "mg/dL", "referenceRange": "< 130", "status": "normal"}, "triglycerides": {"value": "75", "unit": "mg/dL", "referenceRange": "< 150", "status": "normal"}}', 'Bilan lipidique normal', 'Laboratoire Central Dakar'),
('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', NULL, 'Numération formule sanguine', '2024-02-11', '{"hemoglobine": {"value": "14.5", "unit": "g/dL", "referenceRange": "12-16", "status": "normal"}, "globulesRouges": {"value": "4.8", "unit": "millions/mm³", "referenceRange": "4.2-5.4", "status": "normal"}, "globulesBlancs": {"value": "7.2", "unit": "milliers/mm³", "referenceRange": "4-10", "status": "normal"}, "plaquettes": {"value": "320", "unit": "milliers/mm³", "referenceRange": "150-400", "status": "normal"}}', 'NFS normale', 'Laboratoire Central Dakar'),
('bb0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440009', NULL, 'Test de grossesse', '2024-02-13', '{"hcg": {"value": "Positif", "unit": "", "referenceRange": "Négatif si non enceinte", "status": "abnormal"}}', 'Test de grossesse positif', 'Laboratoire Médical Thiès')
ON CONFLICT (id) DO NOTHING;
Product Requirement Document (PRD) & Project Brief: RelaxFood

1. Executive Summary & Vision

1.1 Prodotto

RelaxFood è un'applicazione mobile focalizzata sulla riduzione dello spreco alimentare domestico e sulla gestione consapevole delle scorte di spesa. Attraverso l'acquisizione intelligente di scontrini fiscali tramite fotocamera (OCR) e promemoria proattivi tarati sui tempi medi di consumo e conservazione degli alimenti, RelaxFood toglie all'utente l'onere mentale di dover ricordare cosa c'è in frigo o in dispensa prima che sia troppo tardi.

1.2 Mission & Valore Differenziante

Zero Friction Data Entry: Invece di richiedere inserimenti manuali complessi, l'utente scatta una foto allo scontrino della spesa e il sistema estrae automaticamente articoli, quantità e data.



Smart Consumption Alerts (Promemoria non invasivi): L'app non si limita a segnare la data di scadenza stampata, ma calcola il ciclo vitale stimato del prodotto dal giorno d'acquisto (es. latte fresco aperto o acquistato 5 giorni fa).



Tranquil User Experience: Un tono rassicurante, caldo ("tender hunger") che riduce il senso di colpa e lo stress associati allo spreco o alla pianificazione della dispensa.



2. Target Audience & Personas

Persona 1: Lo Studente Universitario Fuori Sede (Marco, 22 anni)





Pain Points: Budget limitato, condivisione del frigo con coinquilini, frequente dimenticanza di confezioni aperte (affettati, yogurt, latte), poco tempo per catalogare la spesa.



Needs: Scansione in 3 secondi appena torna dal supermercato (es. Conad/Lidl) e promemoria sintetici prima che il cibo deperisca.

Persona 2: Il Professionista Impegnato / Fitness Enthusiast (Chiara, 31 anni)





Pain Points: Acquista ingredienti freschi per il meal prep settimanale ma cene fuori programma o impegni di lavoro causano dimenticanze.



Needs: Liste separate per categorie ("Spesa Settimanale", "Dispensa & Colazione", "Integrazione & Snack"), avvisi puntuali prima che i cibi freschi perdano freschezza.



3. Product Architecture & User Journey

3.1 Flusso Principale (Core User Flow)





Acquisizione Spesa:





Scelta 1: Scatto foto scontrino (Crea Lista da Foto Scontrino) -> OCR & Normalizzazione nomi prodotto -> Creazione automatica lista.



Scelta 2: Inserimento rapido manuale (+ Aggiungi Nuova Lista).



Catalogazione & Monitoraggio:





I prodotti vengono organizzati in liste datate.



I prodotti deperibili a breve termine ricevono un tag di attenzione immediato (2 prodotti da verificare a breve, SCADENZA).



Interazione con l'Avviso Intelligente:





Notifica/Banner: "Hai acquistato Latte Intero 5 giorni fa... È ora di verificare se consumarlo!".



Azioni one-tap: Segna come consumato (archivia/rimuove dal conteggio allerta) o Rimanda promemoria (+24h/+48h).



4. Specifiche Funzionali & Feature Set

4.1 Modulo Inserimento & OCR Scontrini





Acquisizione Scontrino: Accesso alla fotocamera per scatto singolo o upload dalla galleria.



Parser OCR:





Riconoscimento data scontrino, insegna/supermercato (es. Conad, Coop, Esselunga) e lista prodotti.



Pulizia testo da codici cassa e abbreviazioni criptiche (es. "LATT.INT.UHT" -> "Latte intero").



Riconoscimento Metodo: Badge visivo per distinguere le liste generate da scontrino (Scontrino (N rilevati) - DOC) da quelle manuali (Manuale - MAN).

4.2 Modulo "Avviso Consumi Intelligente" (Smart Shelf-Life Engine)





Algoritmo di stima deperibilità basato su categoria merceologica:





Latticini / Latte fresco: 4–6 giorni dall'acquisto.



Carni e pollame fresco: 2–3 giorni dall'acquisto.



Ortofrutta delicata (es. pomodori, insalata): 4–7 giorni.



Dispensa secca (biscotti, pasta, caffè): monitoraggio a lungo termine.



Call-to-Action Dirette:





Segna come consumato



Rimanda promemoria

4.3 Gestione Multi-Lista & Visualizzazione Prodotti





Card lista con:





Nome lista e supermercato/contesto.



Data di riferimento.



Tag pillola con i primi articoli in evidenza (es. Latte intero (1L), Uova fresche (x6), Pasta integrale (500g)).



Status alert: badge dinamico di controllo (2 prodotti da verificare a breve vs Tutti i prodotti monitorati).



Azioni rapide: Visualizza (apertura dettaglio lista) e + Aggiungi (aggiunta prodotto rapida alla lista esistente).



5. UI/UX Design System & Direzione Creativa

5.1 Design Tokens (Versione High-Fidelity)





Palette Cromatica:





Background Primario: #FEF3E2 (Crema caldo accogliente, riduce l'affaticamento visivo)



Superficie Card / Contenitori: #FFFFFF (Massimo contrasto e ordine)



Primario / Brand CTA: #D4621A (Terracotta caldo e vibrante per azioni chiave)



Accento / Warning Morbido: #F4AE52 (Ambra / miele dorato per avvisi e stato orologio)



Testo / Dark Neutral: #2A1A0E (Espresso scuro a contrasto elevato, mai nero puro)



Verde Positivo / Safe: #E6F7ED / #1E7E4E (Stato di serenità "Tutti i prodotti monitorati")



Tipografia:





Titoli & Brand: Poppins (Bold, SemiBold, amichevole e rotondo)



Testi, body & etichette funzionali: Inter o Plus Jakarta Sans (Leggibilità tecnica ottimizzata)



Corner Radius:





Bottoni primari e badge di stato: 100% rounded-full (Pill-shaped)



Card di contenuto: rounded-3xl (24px–28px)



Iconografia:





Icone a linea morbida (Material Symbols Rounded) con stroke uniforme e angoli arrotondati.



6. Requisiti Non Funzionali & Tecnici





Performance: Tempo di parsing OCR ed estrazione lista entro 2.5 secondi dallo scatto.



Privacy & Data Security: Le foto degli scontrini vengono elaborate per estrarre esclusivamente articoli alimentari; i dati di pagamento (es. carte di credito o coordinate POS presenti a fondo scontrino) vengono scartati e non memorizzati.



Offline First: Possibilità di consultare le liste e confermare il consumo anche in assenza temporanea di connettività di rete.

Piattaforme di riferimento: Mobile iOS & Android (Responsive Mobile Web / Native app).
7. Roadmap & Deliverables Futuri
Fase 1 (MVP - Attuale):
Wireframe & UI High Fidelity della schermata principale di gestione liste e alert scontrino.
Creazione liste e monitoraggio scadenza a colpo d'occhio.

Fase 2:
Schermata di dettaglio lista con spunta dei singoli articoli e modifica quantità.
Flusso fotocamera con anteprima di ritaglio e rettifica OCR guidata.

Fase 3:
Suggerimenti ricette "Anti-Spreco": generazione idee culinarie con gli alimenti in scadenza rilevati.

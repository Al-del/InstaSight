InstaSight - Documentație GitHub

📌 Descrierea problemei

În era digitală, mulți utilizatori se confruntă cu o suprasaturare de conținut vizual și informațional. InstaSight își propune să ofere o modalitate rapidă, intuitivă și eficientă de a analiza, organiza și extrage informații relevante din imagini și documente vizuale, dar și din conținut alimentar, pentru utilizatori din domenii variate precum sănătate, educație, jurnalism, cercetare sau afaceri.

💡 Soluția propusă

InstaSight este aplicația ideală pentru cei care vor să-și ia sănătatea în propriile mâini. De multe ori, consumăm alimente fără a ști dacă acestea ne fac bine sau rău. Documentarea despre nutriție consumă timp și energie, iar InstaSight automatizează acest proces. Utilizatorul trebuie doar să îndrepte camera telefonului spre frigider — aplicația identifică automat conținutul acestuia folosind AI și oferă sugestii sănătoase de rețete, alături de valorile lor nutriționale.

În plus, aplicația contorizează caloriile consumate, oferă un plan alimentar bazat pe obiective și stil de viață, permite adăugarea mâncărurilor preferate într-o listă personală și include o funcție socială cu forum și listă de prieteni.

🎯 Publicul țintă

Persoane interesate de alimentație sănătoasă;

Utilizatori care vor să își gestioneze dieta fără efort;

Studenți, părinți, sportivi și persoane ocupate care vor sugestii rapide și corecte;

Comunități care doresc să împărtășească rețete și experiențe alimentare.

🔧 Funcționalități cheie

Detectarea automată a alimentelor din frigider cu AI;

Generarea de sugestii alimentare sănătoase și echilibrate caloric;

Afișarea valorilor nutriționale detaliate pentru fiecare aliment și rețetă;

Contorizarea caloriilor consumate și generarea unui plan alimentar personalizat;

Forum comunitar pentru întrebări și schimb de experiență;

Listă de prieteni și partajare meniuri;

Securitate avansată prin protocolul de nivel 4 al stivei OSI;

Backup în cloud și sincronizare multiplatformă.

🏗️ Arhitectura aplicației

Interfață multiplatformă: Kotlin Compose Multiplatform — ales pentru scalabilitate și eficiență, permite compilarea nativă pe orice platformă și rulare în JVM folosind întreaga suită de module Java;

Inteligență Artificială: TensorFlow — utilizat pentru dezvoltarea modelelor AI care detectează conținutul din frigider cu o acuratețe de peste 85%;

Stocare și sincronizare: Firebase — asigură un spațiu sigur pentru salvarea datelor utilizatorului, cu suport TTS (Text-to-Speech);

Sursa de informații nutriționale: API-uri de încredere, precum Edenman și altele acreditate, pentru furnizarea de informații despre alimente;

Nu se utilizează componente web — aplicația este complet nativă și optimizată pentru performanță locală.

🔍 Elemente distinctive

Fotografiere rapidă a conținutului frigiderului pentru sugestii alimentare;

Recomandări nutriționale validate de surse autorizate;

Securitate avansată pentru protejarea datelor personale;

Forum comunitar integrat pentru sprijin și discuții;

Integrarea AI într-o aplicație mobilă nativă multiplatformă.

⚙️ Ghid de instalare

Clonează repo-ul:

git clone https://github.com/username/instasight.git

Deschide proiectul în Android Studio sau IntelliJ cu suport Kotlin Multiplatform;

Rulează aplicația pe platforma dorită (Android, iOS, desktop);

Pentru testarea AI, pornește backendul Python cu TensorFlow (instrucțiuni în folderul ai_backend/).

🧠 Justificarea tehnologiilor

Kotlin Compose Multiplatform oferă o abordare modernă, scalabilă și performantă pentru dezvoltarea de aplicații native pe mai multe platforme. TensorFlow permite implementarea rapidă și precisă a funcționalităților AI. Firebase oferă o soluție sigură și ușor de utilizat pentru sincronizarea și stocarea datelor. Evitarea tehnologiilor web reduce latențele și îmbunătățește semnificativ experiența utilizatorului.

🗣️ Opinia autorului

InstaSight nu este doar o unealtă digitală, ci un partener pentru un stil de viață sănătos. Prin simpla fotografiere a frigiderului, utilizatorii primesc sugestii rapide, validate, și ușor de urmat. Comunitatea, securitatea și AI-ul se combină pentru a oferi o experiență completă și relevantă.

🛣️ Roadmap

Integrare voce: adăugarea comenzilor vocale pentru accesibilitate;

Recunoașterea automată a datelor de expirare;

Suport pentru wearable-uri și realitate augmentată;

Integrare cu aplicații de fitness;

Notificări de hidratare și memento-uri alimentare.

💬 Testimoniale

"Folosesc InstaSight zilnic. Mă ajută să aleg mâncăruri sănătoase fără stres." – Andrei, student

"În sfârșit o aplicație care chiar îmi ușurează deciziile alimentare." – Ioana, părinte

Dezvoltat cu pasiune de echipa InstaSight.


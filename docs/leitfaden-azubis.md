# Leitfaden: EPK bauen für Azubis

Willkommen! Dieser Leitfaden erklärt dir Schritt für Schritt, wie eine ereignisgesteuerte
Prozesskette (EPK) aufgebaut ist und wie du sie in der **EPK-Werkstatt** (`app/index.html`) selbst
baust. Für die Kurzversion direkt in der App: Klick oben auf **🧭 Tutorial starten**.

## 1. Was ist eine EPK?

Eine EPK zeigt, **in welcher Reihenfolge** Dinge in einem Prozess passieren — wer was wann tut und
welches Ereignis das jeweils auslöst. Beispiel aus dem Alltag:

> "Wecker klingelt" (Ereignis) → "Aufstehen" (Funktion) → "Bin wach" (Ereignis) → "Kaffee kochen"
> (Funktion) → "Kaffee ist fertig" (Ereignis)

Das Grundprinzip: **Ereignis → Funktion → Ereignis → Funktion → ...** Ereignisse und Funktionen
wechseln sich immer ab, wie ein Reißverschluss.

## 2. Die Symbole

| Symbol | Aussehen in der App | Was bedeutet es? |
|---|---|---|
| **Ereignis** | rotes Sechseck | Ein Zustand, der eingetreten ist ("Bestellung eingegangen"). Trifft selbst keine Entscheidung. |
| **Funktion** | grünes Rechteck | Eine Tätigkeit, die jemand ausführt ("Bestellung prüfen"). |
| **UND-Konnektor** | gelber Kreis mit ∧ | Alle Zweige laufen **gleichzeitig und zwingend**. |
| **ODER-Konnektor** | gelber Kreis mit ∨ | **Mindestens einer** der Zweige wird ausgeführt. |
| **XOR-Konnektor** | gelber Kreis mit × | **Genau einer** der Zweige wird ausgeführt (entweder-oder). |
| **Prozesswegweiser** | blaues Fünfeck | Verweist auf einen anderen Prozess (z. B. "siehe Prozess Rechnungsstellung"). |
| **Organisationseinheit** | gelbes Oval | Wer die Funktion ausführt (Person, Rolle, Abteilung). |
| **Informationsobjekt** | blaues Rechteck | Daten oder Dokumente, die eine Funktion braucht oder erzeugt. |

## 3. Die wichtigsten Regeln (mit Beispiel)

### Regel 1: Start und Ende sind immer ein Ereignis (oder Prozesswegweiser)

✅ Richtig: `(Ereignis) → Funktion → (Ereignis)`
❌ Falsch: `Funktion → (Ereignis) → Funktion` (beginnt mit einer Funktion)

### Regel 2: Ereignis und Funktion wechseln sich immer ab

✅ Richtig: `(Ereignis) → [Funktion] → (Ereignis) → [Funktion] → (Ereignis)`
❌ Falsch: `(Ereignis) → [Funktion A] → [Funktion B] → (Ereignis)` — zwischen den zwei Funktionen
fehlt ein Ereignis.

### Regel 3: Ereignisse treffen keine Entscheidung

Ein Ereignis darf **nicht** über ODER oder XOR verzweigen, weil ein Ereignis nichts entscheidet —
nur eine Funktion (bzw. das Ergebnis einer Funktion) kann eine Entscheidung auslösen.

✅ Richtig: `[Bestellung prüfen] → (XOR) → (Ereignis: vollständig) / (Ereignis: unvollständig)`
❌ Falsch: `(Ereignis: Bestellung eingegangen) → (XOR) → ...` — ein Ereignis darf hier nicht
verzweigen.

Eine Ausnahme gibt es: Nach einem Ereignis **ist ein UND-Konnektor erlaubt**, wenn danach mehrere
Funktionen zwingend parallel starten sollen (das ist keine Entscheidung, sondern reine
Parallelität).

### Regel 4: Organisationseinheiten und Informationsobjekte hängen seitlich an einer Funktion

Sie sind **nicht** Teil der Hauptkette (Ereignis-Funktion-Kette), sondern liefern Zusatzinfos: wer
macht es, welche Unterlagen werden gebraucht.

Die App zeigt dir alle diese Regeln in Echtzeit im Bereich **Live-Hinweise** rechts an — rot
markierte Symbole verstoßen gegen eine Regel, mit Erklärung beim Draufhalten mit der Maus.

## 4. Deine erste EPK in der App bauen

1. Öffne `app/index.html` im Browser.
2. Ziehe ein **Ereignis** aus der linken Palette auf die Zeichenfläche (oder klicke es an — es
   erscheint dann automatisch mittig).
3. Ziehe eine **Funktion** darunter.
4. Fahr mit der Maus über das Ereignis-Symbol — am unteren Rand erscheint ein kleiner Punkt
   (Anschlusspunkt). Zieh von dort zur Funktion, um eine Verbindung zu erstellen.
5. Wiederhole das Muster Ereignis → Funktion, bis dein Prozess fertig ist.
6. Doppelklick auf ein Symbol, um den Text umzubenennen. **Entf** löscht die aktuelle Auswahl.
7. Dein Fortschritt wird automatisch gespeichert. Über die Toolbar kannst du dein Modell zusätzlich
   als JSON- oder SVG-Datei exportieren.

## 5. Übungsaufgaben

Bau folgende Prozesse selbst nach — von leicht bis anspruchsvoll. Es gibt keine "eine richtige"
Lösung, aber jeweils eine Musterlösung als Beschreibung, an der du dich orientieren kannst.

### Übung 1 (leicht): Kaffee kochen

Baue diesen einfachen, linearen Prozess nach — nur Ereignisse und Funktionen, keine Verzweigung:

```
(Wecker klingelt) → [Aufstehen] → (Bin wach) → [Kaffee kochen] → (Kaffee ist fertig)
```

### Übung 2 (mittel): Bestellung bearbeiten

Hier kommt eine Entscheidung ins Spiel (XOR-Konnektor nach einer Funktion):

```
(Bestellung eingegangen)
  → [Bestellung prüfen]
  → (XOR)
       ├─ (Bestellung vollständig) → [Bestellung versenden] → (Bestellung versendet)
       └─ (Bestellung unvollständig) → [Kunde kontaktieren] → (Kunde kontaktiert)
```

Denk daran: Nach dem **Ereignis** "Bestellung eingegangen" folgt zuerst die **Funktion**
"Bestellung prüfen" — erst danach darf der XOR-Konnektor verzweigen (Regel 3!).

### Übung 3 (anspruchsvoll): Reklamation bearbeiten

Jetzt mit paralleler Bearbeitung (UND-Konnektor) und einer Organisationseinheit:

```
(Reklamation eingegangen)
  → [Reklamation prüfen]  -- seitlich angebunden: Organisationseinheit "Kundenservice"
  → (UND)
       ├─ [Lagerbestand prüfen] → (Lagerbestand geprüft)
       └─ [Kundendaten prüfen] → (Kundendaten geprüft)
  → (UND, Zusammenführung)
  → [Ersatzlieferung veranlassen]
  → (Reklamation abgeschlossen)
```

Tipp: Ziehe die Organisationseinheit "Kundenservice" neben die Funktion "Reklamation prüfen" und
verbinde sie über den seitlichen Anschlusspunkt.

## 6. Häufige Fehler

- **"Meine Verbindung entsteht nicht."** Du musst vom Anschlusspunkt (kleiner Punkt am Rand) aus
  ziehen und über dem Zielsymbol loslassen — nicht nur in dessen Nähe.
- **"Warum ist mein Ereignis rot markiert?"** Schau dir den Tooltip an (Maus über das Symbol
  halten) — dort steht, welche Regel verletzt ist.
- **"Kann ich zwei Funktionen direkt verbinden?"** Nein — dazwischen muss immer ein Ereignis (oder
  bei Verzweigungen ein Konnektor) stehen.

## 7. Weiterführende Quellen

- [Wikipedia: Ereignisgesteuerte Prozesskette](https://de.wikipedia.org/wiki/Ereignisgesteuerte_Prozesskette)
- [Lucidchart: EPK Tutorial](https://www.lucidchart.com/pages/de/tutorial/epk-ereignisgesteuerte-prozesskette)
- Fachliche Referenz im Projekt: `.claude/skills/epk-notation/SKILL.md`

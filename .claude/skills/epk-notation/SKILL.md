---
name: epk-notation
description: Use this skill whenever code, UI-Texte, Validierungslogik oder Tutorial-Inhalte der EPK-Werkstatt EPK-Normsymbole, Farben, Anschlusspunkte oder Syntaxregeln (Ereignis/Funktion-Alternierung, Konnektor-Regeln) betreffen. Liefert die verbindliche Referenz für Symbolformen, -farben und die 10 wichtigsten EPK-Modellierungsregeln, damit nicht aus dem Gedächtnis geraten wird. Triggers on: "EPK-Symbol", "Ereignis", "Funktion", "Konnektor", "UND/ODER/XOR", "Prozesswegweiser", "Organisationseinheit", "Informationsobjekt", "Syntaxregel", "Validierung".
---

## Metadaten

- **Version:** 0.1.0
- **Owner:** epk-werkstatt
- **Status:** stable
- **Dependencies:**
  - Skills: keine
  - Tools: keine zwingend (reines Nachschlagewerk)
  - Externe Systeme: keine
- **Performance-Hinweis:** reine Text-Referenz, kein Tool-Aufruf nötig, <1s
- **Letzte Review:** 2026-07-14 (Web-Recherche, siehe Quellen unten)

## Zweck

Verbindliche fachliche Referenz für die EPK-Normsymbole und Syntaxregeln, die im Editor (`app/js/symbols.js`,
`app/js/model.js`), im Tutorial (`app/js/tutorial.js`) und im Leitfaden (`docs/leitfaden-azubis.md`) korrekt
und konsistent verwendet werden müssen. Zielgruppe der App sind Azubis — Erklärtexte hier sind bewusst
einfach gehalten, damit sie 1:1 in UI-Tooltips/Tutorial-Text übernommen werden können.

## Die Normsymbole

| Symbol | Form | Farbe (Konvention) | Bedeutung | Anschlusspunkte |
|---|---|---|---|---|
| **Ereignis** | Sechseck (Hexagon) | Rot/Orange | Ein eingetretener Zustand, der den weiteren Ablauf auslöst oder beschreibt (z. B. "Bestellung eingegangen"). Passiv, trifft keine Entscheidung. | 1 oben (Eingang), 1 unten (Ausgang) |
| **Funktion** | Abgerundetes Rechteck | Grün | Eine Tätigkeit/ein Vorgang, der ausgeführt wird (z. B. "Bestellung prüfen"). Aktiv, kann verzweigen. | 1 oben (Eingang), 1 unten (Ausgang) |
| **UND-Konnektor** | Kreis mit `∧` | Gelb | Alle ausgehenden Zweige werden parallel und zwingend ausgeführt / alle eingehenden Zweige müssen abgeschlossen sein. | mehrere oben/unten |
| **ODER-Konnektor** | Kreis mit `∨` | Gelb | Mindestens einer der ausgehenden Zweige wird ausgeführt (inklusives Oder). | mehrere oben/unten |
| **XOR-Konnektor** | Kreis mit `×` (bzw. `⊗`) | Gelb | Genau einer der ausgehenden Zweige wird ausgeführt (exklusives Oder). | mehrere oben/unten |
| **Prozesswegweiser** | Haus-/Pfeilform (Fünfeck) | Blau/Türkis | Verweist auf einen anderen (Teil-)Prozess; markiert Start/Ende eines Teilprozesses im Gesamtkontext. | 1 oben oder 1 unten |
| **Organisationseinheit** | Oval/Ellipse | Gelb | Wer eine Funktion ausführt (Person, Rolle, Abteilung). Verbindet sich seitlich mit einer Funktion, nicht Teil des Kontrollflusses. | seitliche Verbindung zu Funktion |
| **Informationsobjekt** | Rechteck | Blau | Daten/Dokumente, die eine Funktion benötigt oder erzeugt. Verbindet sich seitlich mit einer Funktion, nicht Teil des Kontrollflusses. | seitliche Verbindung zu Funktion |

## Die wichtigsten Syntaxregeln

1. **Start/Ende:** Eine EPK beginnt und endet mit einem **Ereignis** oder einem **Prozesswegweiser** —
   nie mit einer Funktion oder einem Konnektor.
2. **Strikte Alternierung:** Ereignisse und Funktionen wechseln sich im Kontrollfluss immer ab. Zwei
   Funktionen oder zwei Ereignisse dürfen nie direkt aufeinanderfolgen (dazwischen ggf. ein Konnektor).
3. **Ereignisse treffen keine Entscheidung:** Nach einem Ereignis darf **kein ODER- oder XOR-Konnektor**
   folgen — ein Ereignis "entscheidet" nichts. Ein Ereignis darf nur in **eine** Funktion münden oder in
   einen **UND-Konnektor** (parallele Funktionen ohne Entscheidung), nie in eine Verzweigung mit Auswahl.
4. **Funktionen dürfen verzweigen:** Nach einer Funktion sind UND-, ODER- und XOR-Konnektoren erlaubt,
   da eine Funktion (bzw. ihr Ergebnis) eine Entscheidung auslösen kann.
5. **Konnektor-Typ-Konsistenz beim Zusammenführen:** Ein Split-Konnektor sollte mit dem passenden
   Join-Konnektor desselben Typs wieder zusammengeführt werden (didaktisch: "was du aufmachst, machst du
   auch wieder zu").
6. **Organisationseinheiten und Informationsobjekte hängen seitlich** an Funktionen und sind **nicht**
   Teil des linearen Kontrollflusses (keine Pfeile zu/von Ereignissen oder Konnektoren).
7. **Ein Konnektor hat entweder mehrere Eingänge (Join) oder mehrere Ausgänge (Split)**, nicht sinnvoll
   beides gleichzeitig in derselben Verzweigungslogik (Ausnahme: dokumentierte Sonderfälle, für die App
   hier nicht relevant — Split und Join werden als getrennte Konnektor-Knoten modelliert).

## Anwendung in der App

- `app/js/symbols.js` definiert Form/Farbe/Anschlusspunkte exakt nach obiger Tabelle.
- `app/js/model.js` implementiert Regel 1–4 als Live-Validierung (Regel 5–6 als Hinweise, nicht als
  hartes Blockieren, da Einsteiger sonst frustriert werden — siehe Leitfaden-Philosophie).
- Tutorial-Texte in `app/js/tutorial.js` und `docs/leitfaden-azubis.md` verwenden die Formulierungen aus
  "Die wichtigsten Syntaxregeln" 1:1, damit Begriffe zwischen App und Doku konsistent bleiben.

## Grenzen / Was dieser Skill NICHT tut

- Keine Aussage zu erweiterten ARIS-Sonderelementen (Cluster, Anwendungssysteme, Risiken etc.) — die App
  bildet bewusst nur die Kernsymbole für Einsteiger ab.
- Keine Konvertierung zu BPMN oder anderen Notationen.

## Referenzen

- [Wikipedia: Ereignisgesteuerte Prozesskette](https://de.wikipedia.org/wiki/Ereignisgesteuerte_Prozesskette)
- [Lucidchart: EPK Tutorial](https://www.lucidchart.com/pages/de/tutorial/epk-ereignisgesteuerte-prozesskette)
- [HarzOptics: Modellierung EPK — UND, ODER, XOR](https://harzoptics.wordpress.com/2013/07/02/modellierung-ereignisgesteuerter-prozessketten-und-oder-xor/)
- [KVP Institut: EPK Methodenblatt (PDF)](https://www.kvp.de/wp-content/uploads/2017/07/methodenblatt-epk-ereignisgesteuerte-prozesskette.pdf)

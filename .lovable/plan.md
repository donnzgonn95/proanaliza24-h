## Cel

Rozbudować stronę „Asystent" o: (1) wybór modelu AI dla raportów i chatu, (2) historię rozmów (zapisane konwersacje), (3) limity zapytań i orientacyjne koszty.

## 1. Wybór modelu AI

Dodam selektor modelu (dropdown) w karcie **Raport inwestorski** oraz w karcie **Chat-asystent**. Lista modeli z Lovable AI Gateway:

- `google/gemini-2.5-flash-lite` — najtańszy, najszybszy (chat dnia codziennego)
- `google/gemini-2.5-flash` — domyślny, balans
- `google/gemini-3-flash-preview` — nowy preview, szybki + mocny
- `google/gemini-2.5-pro` — głębsza analiza (raporty)
- `openai/gpt-5-mini` — alternatywa
- `openai/gpt-5` — premium do raportów

Każda opcja pokaże mały tag „szybki / balans / premium" oraz orientacyjny koszt (1–5 ✦).

Edge function `market-ai`:
- przyjmie opcjonalne pole `model` w body i przekaże do Gateway zamiast hardkodowanej stałej.
- zachowa fallback (`google/gemini-2.5-flash`) gdy brak.

Wybór modelu zapisany w `localStorage` per-tryb (`ai-model:report`, `ai-model:chat`).

## 2. Historia rozmów (chat)

Lokalna (bez bazy danych — szybciej, bez RLS, prywatnie w przeglądarce).

- Nowy moduł `src/lib/chat-history.ts` z API: `listConversations()`, `getConversation(id)`, `saveConversation(...)`, `deleteConversation(id)`, `renameConversation(id, title)`. Persistencja w `localStorage` (klucz `eljot-chat-history-v1`).
- Każda konwersacja: `{ id, title, createdAt, updatedAt, model, messages[] }`. Tytuł generowany z 1. wiadomości użytkownika (pierwsze 60 znaków).
- W `ChatCard`:
  - panel boczny (collapsible) z listą rozmów: „Nowa rozmowa", lista z datą, akcje: zmień nazwę, usuń, eksport (.md/.json).
  - aktywna konwersacja zapisuje się po każdej odpowiedzi asystenta.
  - przycisk „Wyczyść historię".

Jeśli wolisz zapisywać historię w Lovable Cloud (synchronizacja między urządzeniami, wymaga logowania), dopiszę to w iteracji 2 — na start lokalnie.

## 3. Limity i koszty

Dwa poziomy:

**A. Twardy limit klienta (anty-spam)** — `src/lib/ai-usage.ts`:
- licznik zapytań w `localStorage` z oknami czasu: na minutę, godzinę, dzień.
- domyślne limity (konfigurowalne w UI): 10/min, 60/h, 200/dzień.
- przy przekroczeniu — toast + blokada przycisku z czasem do odblokowania.

**B. Estymacja kosztów (kredyty AI Gateway)** — orientacyjna:
- po każdej odpowiedzi edge function zwróci `usage` z bramki (`prompt_tokens`, `completion_tokens`, `total_tokens`).
- mapa cen per-1k tokenów (przybliżona) per model → wyliczamy „credits used".
- agregat wyświetlany w nowej karcie „Zużycie AI" (dzisiaj / 7 dni / total) + ostrzeżenie powyżej progu.

**C. Ustawienia w UI** — nowa sekcja na `/ustawienia` (lub mała karta na `/asystent`) „Limity AI": pola na wartości limitów + miękki budżet kredytów (np. 100/dzień), z toastem ostrzegawczym przy 80%.

## 4. Edge function — zmiany

`supabase/functions/market-ai/index.ts`:
- przyjmuje `model` (opcjonalnie) i waliduje względem allowlisty
- zwraca `usage` z odpowiedzi gateway w trybach non-stream
- w trybie stream przepuszcza `usage` w ostatnim chunku (już zwykle przychodzi z OpenAI/Gemini SSE)

## 5. Pliki do utworzenia/edycji

Nowe:
- `src/lib/ai-models.ts` — definicje modeli + ceny
- `src/lib/chat-history.ts` — przechowywanie rozmów
- `src/lib/ai-usage.ts` — limity + agregacja kosztów
- `src/components/ModelPicker.tsx` — selektor modelu
- `src/components/ConversationsSidebar.tsx` — lista historii

Edycje:
- `src/routes/asystent.tsx` — wpięcie pickera, sidebaru, licznika
- `src/routes/ustawienia.tsx` — sekcja „Limity AI"
- `supabase/functions/market-ai/index.ts` — `model` + `usage`

## Pytanie

1. Czy historia rozmów ma być **lokalna w przeglądarce** (proste, bez logowania), czy **w chmurze z logowaniem** (synchronizacja)?
2. Czy zostawić obecny zestaw 6 modeli w pickerze, czy ograniczyć do 3 (tani/balans/premium)?

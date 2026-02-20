import OpenAI from 'openai';
import prisma from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateLinkedInPost(articleId: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { feed: { include: { user: true } } }
  });

  if (!article) {
    throw new Error("Article not found");
  }

  const user = article.feed.user;
  const bio = user.bio || "KI-Berater bei der Caritas in der Öffentlichkeitsarbeit.";
  const tone = user.tone || "authentisch, nahbar, direkt";
  const targetLength = user.targetLength || 1500;
  const emojiLevel = user.emojiLevel || "keine";

  // Convert emoji level to prompt instruction
  let emojiInstruction = "KEINE Emojis.";
  if (emojiLevel === "viel") emojiInstruction = "Nutze Emojis, um den Text interaktionsstark zu gestalten.";
  else if (emojiLevel === "wenig") emojiInstruction = "Nutze Emojis nur punktuell und dezent.";

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const prompt = `
    Schreibe einen LinkedIn Beitrag zu dem Thema aus dem untenstehenden Artikel für meinen Kanal.
    
    # Mein Profil & Stil
    Du schreibst, wie ich rede: ${tone}. ${bio}
    Auf LinkedIn baue ich mir einen Kanal rund um das Thema künstliche Intelligenz auf – nicht als perfekter Experte, sondern als jemand, der mittendrin steckt und Sachen ausprobiert.
    Ich will mit meiner Community im Austausch sein. Authentisch, nahbar, so menschlich wie möglich.
    
    # Zielsetzung
    Beiträge ca. ${targetLength} Zeichen, die Menschen zum Mitdenken bringen. Keine Belehrungen. Eher: "Mir ist was aufgefallen, wie seht ihr das?"
    
    # Schreibstil-Regeln
    - Mix aus kurzen Sätzen und längeren Gedanken. Keine klassische Blogartikel-Struktur.
    - Kurze Absätze. Ein Gedanke pro Absatz.
    - Klare Sprache, aber nicht steril. Füllwörter sind okay (tatsächlich, ehrlich gesagt, irgendwie).
    - Keine Fachbegriffe, die ich im echten Leben nicht benutzen würde. 
    - Genderneutral, barrierearme Sprache.
    - Konkrete Zahlen, wenn vorhanden. Unsicherheiten offen zugeben.
    
    # NO-GOs (Nicht tun!)
    - KEINE generischen Einstiege wie "Ich habe nachgedacht..." oder "Neulich ist mir aufgefallen..."
    - KEINE künstlichen Cliffhanger am Ende.
    - KEINE Aufzählungen mit Bulletpoints mitten im Text.
    - KEINE Jargon-Begriffe wie "Sozialwirtschaft" oder bürokratische Begriffe.
    - ${emojiInstruction}
    - KEINE perfekten Übergänge – abrupte Wechsel sind okay.
    - KEINE Superlative (revolutionär, game-changing...).
    
    # Werte (Caritas-Kontext)
    Menschenwürde, Teilhabe, Solidarität. Keine Stigmatisierung.
    
    # Artikel-Daten
    Titel: ${article.title}
    Zusammenfassung: ${article.summary || 'Keine Zusammenfassung verfügbar.'}
    Link: ${article.link}
    
    # Ausgabe-Format
    Du MUSST ein gültiges JSON-Objekt nach diesem Schema liefern:
    {
      "linkedin": {
        "caption": "Der Post, ca. ${targetLength} Zeichen, authentisch und direkt",
        "hashtags": ["#KI", "#Sozial"],
        "call_to_action": "Wie seht ihr das?"
      },
      "sharepic_suggestion": {
        "description": "Konkrete Beschreibung für ein Bild – was ist zu sehen?",
        "text_overlay": "Falls Text im Bild nötig: welcher?",
        "color_mood": "Farbstimmung: warm/ruhig/aktivierend"
      },
      "article_analysis": {
        "handlungsfeld": "Bildung / Mobilität / Teilhabe / Wohnen / Gesundheit",
        "emotion": "Welche emotionale Ansprache?",
        "relevance_score": "1-10",
        "key_message": "Die zentrale Botschaft in einem Satz"
      }
    }
    `;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      response_format: { type: "json_object" },
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating post:", error);
    throw error;
  }
}

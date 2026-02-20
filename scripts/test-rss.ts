import 'dotenv/config';
import prisma from '@/lib/prisma'; // This might fail if using tsx with aliases without config?
// Actually tsx supports tsconfig paths if configured.
import { fetchFeed, matchKeywords } from '@/lib/rss';

async function main() {
    console.log("Testing RSS Fetcher...");
    const url = 'https://techcrunch.com/feed/';
    console.log(`Fetching ${url}...`);

    const feed = await fetchFeed(url);
    if (!feed) {
        console.error("Failed to fetch feed");
        return;
    }

    console.log(`Fetched ${feed.items.length} items.`);
    console.log(`Title: ${feed.title}`);

    console.log("\nTesting Keyword Matching...");
    const text = "This is a text about Artificial Intelligence and Machine Learning.";
    const keywords = ["AI", "Intelligence"];
    const match = matchKeywords(text, keywords);
    console.log(`Text: "${text}"`);
    console.log(`Keywords: ${keywords.join(", ")}`);
    console.log(`Match: ${match} (Expected: true)`);

    const noMatch = matchKeywords(text, ["Cooking", "Food"]);
    console.log(`Match (Cooking): ${noMatch} (Expected: false)`);
}

main();

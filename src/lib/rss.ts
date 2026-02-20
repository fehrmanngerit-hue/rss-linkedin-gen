import Parser from 'rss-parser';
import prisma from '@/lib/prisma';

const parser = new Parser();

export type RSSItem = {
    title?: string;
    link?: string;
    contentSnippet?: string;
    isoDate?: string;
    content?: string;
}

export async function fetchFeed(url: string) {
    try {
        const feed = await parser.parseURL(url);
        return feed;
    } catch (error) {
        console.error(`Error fetching feed ${url}:`, error);
        return null;
    }
}

export function matchKeywords(text: string, keywords: string[]): boolean {
    if (keywords.length === 0) return true; // If no keywords, generally match all? Maybe not. 
    // Requirement: "Appsoll verschiedene RSS Feeds nach meinen persönlichen Keywords durchsuchen"
    // If user has keywords, we filter. If no keywords, maybe show nothing or all? 
    // Let's assume matches ANY keyword.

    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

export async function processFeed(feedId: string) {
    const feed = await prisma.feed.findUnique({
        where: { id: feedId },
        include: {
            user: {
                include: {
                    keywords: true
                }
            }
        }
    });

    if (!feed || !feed.user) {
        throw new Error("Feed or User not found");
    }

    const parsedFeed = await fetchFeed(feed.url);
    if (!parsedFeed) return;

    const keywords = feed.user.keywords.map(k => k.term);
    const newArticles = [];

    for (const item of parsedFeed.items) {
        // Check if article already exists
        const existing = await prisma.article.findUnique({
            where: { link: item.link! }
        });

        if (existing) continue;

        // Check keywords
        const textToScan = `${item.title || ''} ${item.contentSnippet || ''} ${item.content || ''}`;
        const isMatch = matchKeywords(textToScan, keywords);

        if (isMatch) {
            await prisma.article.create({
                data: {
                    title: item.title || 'No Title',
                    link: item.link!,
                    summary: item.contentSnippet?.slice(0, 500), // Limit length
                    publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
                    feedId: feed.id,
                    status: 'NEW'
                }
            });
            newArticles.push(item.title);
        }
    }

    await prisma.feed.update({
        where: { id: feed.id },
        data: { lastScannedAt: new Date() }
    });

    return newArticles;
}

export async function processAllFeeds() {
    const feeds = await prisma.feed.findMany();
    const results = [];
    for (const feed of feeds) {
        const added = await processFeed(feed.id);
        if (added && added.length > 0) {
            results.push({ feed: feed.name, added });
        }
    }
    return results;
}

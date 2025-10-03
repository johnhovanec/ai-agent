import type { ToolFn } from '../../types'
import { z } from 'zod';
import fetch from 'node-fetch';
import 'dotenv/config';

const NYT_API_KEY = process.env.NYT_API_KEY;

export const nytArticleSearchToolDefinition = {
    name: 'NYT_Culture_desk_news_articles',
    parameters: z.object({}),
    description: 'gets the latest NYT Culture desk articles'
}

type Args = z.infer<typeof nytArticleSearchToolDefinition.parameters>;

export const nytArticleSearch: ToolFn<Args, string> = async ({ toolArgs }) => {
    const { response: data } =
        await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=desk%3A%22Culture%22%20AND%20timesTag.location%3A%22New%20York%20City%22&api-key=${NYT_API_KEY}`)
                .then((res) => res.json()
            )
    const relevantInfo =
        data.docs.map((child: any) => ({
            headline: child.headline.main,
            link: child.web_url,
            abstract: child.abstract,
            author: child.byline.original,
    }))

    console.log('NYT relevant info:', relevantInfo);
    return JSON.stringify(relevantInfo, null, 2); // Formatting json to the llm helps improve how it reads the json
}

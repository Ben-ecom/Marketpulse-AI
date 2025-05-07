# Reddit Scraper Module

Deze module bevat de scraper voor Reddit content in MarketPulse AI. De scraper maakt gebruik van de Decodo API om Reddit pagina's te scrapen en posts, comments en andere gegevens te extraheren.

## Functionaliteit

De Reddit scraper biedt de volgende functionaliteit:

1. **Subreddit Scraping**: Verzamelen van posts, subscribers, beschrijving, regels en moderators van een subreddit
2. **Post Scraping**: Verzamelen van post details, upvotes, comments en andere metadata
3. **User Scraping**: Verzamelen van gebruiker profielen, posts, karma en trophies
4. **URL Generatie**: Genereren van URLs voor subreddits, zoekresultaten en paginering
5. **HTML Extractie**: Extraheren van gegevens uit HTML met CSS selectors

## Gebruik

### Initialisatie

```javascript
import { getRedditScraper } from './platforms/reddit';

const redditScraper = getRedditScraper();
```

### Subreddit Scraping

```javascript
// Maak een subreddit scrape job aan
const subredditUrls = [
  'https://www.reddit.com/r/programming/',
  'https://www.reddit.com/r/javascript/'
];

const job = await redditScraper.createSubredditScrapeJob('project-123', subredditUrls, {
  priority: 'high',
  // Extra opties...
});

console.log(`Subreddit scrape job aangemaakt: ${job.id}`);
```

### Post Scraping

```javascript
// Maak een post scrape job aan
const postUrls = [
  'https://www.reddit.com/r/programming/comments/abc123/title/',
  'https://www.reddit.com/r/javascript/comments/def456/another_title/'
];

const job = await redditScraper.createPostScrapeJob('project-123', postUrls, {
  priority: 'medium',
  // Extra opties...
});

console.log(`Post scrape job aangemaakt: ${job.id}`);
```

### User Scraping

```javascript
// Maak een user scrape job aan
const userUrls = [
  'https://www.reddit.com/user/username/',
  'https://www.reddit.com/user/another_user/'
];

const job = await redditScraper.createUserScrapeJob('project-123', userUrls, {
  priority: 'low',
  // Extra opties...
});

console.log(`User scrape job aangemaakt: ${job.id}`);
```

### URL Generatie

```javascript
// Genereer URLs voor een subreddit met paginering
const subredditUrls = redditScraper.generateSubredditUrls(
  'programming',  // Subreddit naam
  3,              // Aantal pagina's
  'top',          // Sortering (hot, new, top, rising)
  'month'         // Tijdsperiode voor 'top' sortering (hour, day, week, month, year, all)
);

// Genereer URLs voor een zoekquery
const searchUrls = redditScraper.generateSearchUrls(
  'javascript framework',  // Zoekterm
  'webdev',                // Optionele subreddit om in te zoeken
  2,                       // Aantal pagina's
  'relevance',             // Sortering (relevance, hot, new, top)
  'all'                    // Tijdsperiode voor 'top' sortering
);
```

## Scrape Opties

De Reddit scraper ondersteunt de volgende opties voor het aanpassen van het scrape gedrag:

### Algemene Opties

- `wait_for`: CSS selector om op te wachten voordat de pagina als geladen wordt beschouwd
- `device_type`: Type apparaat (desktop, mobile, tablet)
- `javascript`: Of JavaScript moet worden uitgevoerd (true/false)
- `timeout`: Timeout in milliseconden
- `screenshot`: Of een screenshot moet worden gemaakt (true/false)
- `html`: Of de HTML response moet worden teruggegeven (true/false)

### Subreddit Opties

```javascript
const subredditOptions = {
  wait_for: '.Post',
  device_type: 'desktop',
  javascript: true,
  timeout: 30000,
  screenshot: false,
  html: true,
  selectors: {
    posts: '.Post',
    postTitle: 'h1, h3',
    postVotes: '[id^="vote-arrows-"]',
    postComments: '.comments-page-link',
    postAuthor: '.author-link',
    postTime: 'a[data-click-id="timestamp"]',
    postContent: '.Post-body',
    postImage: '.media-element',
    postFlair: '.flair',
    pagination: '.pagination',
  }
};
```

### Post Opties

```javascript
const postOptions = {
  wait_for: '.Comment',
  device_type: 'desktop',
  javascript: true,
  timeout: 30000,
  screenshot: false,
  html: true,
  selectors: {
    postTitle: 'h1',
    postVotes: '[id^="vote-arrows-"]',
    postAuthor: '.author-link',
    postTime: 'a[data-click-id="timestamp"]',
    postContent: '.Post-body',
    postImage: '.media-element',
    postFlair: '.flair',
    comments: '.Comment',
    commentAuthor: '.author-link',
    commentTime: 'a[data-click-id="timestamp"]',
    commentContent: '.Comment-body',
    commentVotes: '[id^="vote-arrows-"]',
    commentReplies: '.Comment-replies',
    loadMoreComments: '.load-more-comments',
  }
};
```

### User Opties

```javascript
const userOptions = {
  wait_for: '.Post',
  device_type: 'desktop',
  javascript: true,
  timeout: 30000,
  screenshot: false,
  html: true,
  selectors: {
    userInfo: '.UserProfileHeader',
    userName: '.UserProfileHeader h1',
    userKarma: '.UserProfileHeader span',
    userPosts: '.Post',
    userPostTitle: 'h3',
    userPostVotes: '[id^="vote-arrows-"]',
    userPostComments: '.comments-page-link',
    userPostTime: 'a[data-click-id="timestamp"]',
    pagination: '.pagination',
  }
};
```

## Resultaat Structuur

### Subreddit Resultaat

```javascript
{
  name: 'programming',
  url: 'https://www.reddit.com/r/programming/',
  posts: [
    {
      title: 'Post title 1',
      url: 'https://www.reddit.com/r/programming/comments/abc123/post_title_1/',
      author: 'user1',
      upvotes: 123,
      commentCount: 45,
      createdAt: '2023-01-15T12:30:45Z',
      flair: 'Discussion'
    },
    // Meer posts...
  ],
  subscribers: 123456,
  description: 'This is a subreddit description',
  rules: [
    'Rule 1: Be respectful',
    'Rule 2: No spam',
    'Rule 3: Use proper formatting'
  ],
  moderators: ['mod1', 'mod2', 'mod3'],
  pagination: {
    hasNext: true,
    nextUrl: 'https://www.reddit.com/r/programming/?after=t3_abc123',
    count: 25
  },
  scrapedAt: '2023-01-20T10:15:30Z'
}
```

### Post Resultaat

```javascript
{
  id: 'abc123',
  subreddit: 'programming',
  title: 'Post title',
  author: 'username',
  authorId: 'u12345',
  createdAt: '2023-01-15T12:30:45Z',
  content: 'This is the content of the post',
  upvotes: 789,
  upvoteRatio: 0.92,
  commentCount: 123,
  flair: 'Discussion',
  awards: [
    { name: 'Silver', count: 2 },
    { name: 'Gold', count: 1 },
    { name: 'Helpful', count: 3 }
  ],
  images: [
    'https://i.redd.it/image1.jpg',
    'https://i.redd.it/image2.jpg'
  ],
  comments: [
    {
      id: 'comment1',
      author: 'user3',
      content: 'This is a comment',
      upvotes: 45,
      createdAt: '2023-01-15T13:45:30Z',
      replies: [
        {
          id: 'comment2',
          author: 'user4',
          content: 'This is a reply',
          upvotes: 12,
          createdAt: '2023-01-15T14:00:15Z',
          replies: []
        }
      ]
    },
    // Meer comments...
  ],
  url: 'https://www.reddit.com/r/programming/comments/abc123/title/',
  scrapedAt: '2023-01-20T10:15:30Z'
}
```

### User Resultaat

```javascript
{
  username: 'username',
  karma: {
    post: 12345,
    comment: 6789
  },
  accountAge: '3 years',
  posts: [
    {
      title: 'User post 1',
      url: 'https://www.reddit.com/r/subreddit/comments/ghi789/user_post_1/',
      subreddit: 'subreddit',
      upvotes: 78,
      commentCount: 23,
      createdAt: '2023-01-10T09:15:30Z'
    },
    // Meer posts...
  ],
  trophies: [
    'Verified Email',
    '5-Year Club',
    'Best Comment'
  ],
  url: 'https://www.reddit.com/user/username/',
  scrapedAt: '2023-01-20T10:15:30Z'
}
```

## Testen

Je kunt de Reddit scraper testen met het test script:

```bash
node src/services/scraping/test-reddit-scraper.js
```

Dit script test de volgende functionaliteit:

1. URL validatie
2. URL generatie
3. Subreddit scraping
4. Post scraping
5. User scraping

## Foutafhandeling

De Reddit scraper bevat uitgebreide foutafhandeling:

- Validatie van input parameters
- Controle van scrape resultaten
- Logging van fouten
- Integratie met de job queue voor retry mechanisme

## Implementatiedetails

De Reddit scraper is geïmplementeerd als een singleton class die de Decodo API client gebruikt voor het uitvoeren van scrape operaties. De scraper bevat mock implementaties voor de extractie functies, die in een productie-omgeving moeten worden vervangen door echte HTML parsing logica.

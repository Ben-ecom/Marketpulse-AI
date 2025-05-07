# Social Media Scraping Module (Instagram & TikTok)

Deze module bevat de scrapers voor Instagram en TikTok content in MarketPulse AI. De scrapers maken gebruik van de Decodo API om social media pagina's te scrapen en posts, videos, comments en andere gegevens te extraheren.

## Functionaliteit

De Social Media scrapers bieden de volgende functionaliteit:

### Instagram Scraper

1. **Hashtag Scraping**: Verzamelen van posts gebaseerd op hashtags
2. **Profiel Scraping**: Verzamelen van gebruiker profielen en posts
3. **Post Scraping**: Verzamelen van post details, comments en engagement metrics
4. **Media Type Detectie**: Onderscheid tussen afbeeldingen, videos en carousels
5. **Paginering**: Automatisch laden van meer content via paginering

### TikTok Scraper

1. **Hashtag Scraping**: Verzamelen van videos gebaseerd op hashtags
2. **Profiel Scraping**: Verzamelen van gebruiker profielen en videos
3. **Video Scraping**: Verzamelen van video details, comments en engagement metrics
4. **Muziek Extractie**: Verzamelen van muziek informatie bij videos
5. **Paginering**: Automatisch laden van meer content via paginering

## Gebruik

### Instagram Scraper

#### Initialisatie

```javascript
import { getInstagramScraper } from './platforms/instagram';

const instagramScraper = getInstagramScraper();
```

#### Hashtag Scraping

```javascript
// Maak een hashtag scrape job aan
const hashtagUrls = [
  'https://www.instagram.com/explore/tags/nature/',
  'https://www.instagram.com/explore/tags/travel/'
];

const job = await instagramScraper.createHashtagScrapeJob('project-123', hashtagUrls, {
  priority: 'high',
  // Extra opties...
});

console.log(`Hashtag scrape job aangemaakt: ${job.id}`);
```

#### Profiel Scraping

```javascript
// Maak een profiel scrape job aan
const profileUrls = [
  'https://www.instagram.com/instagram/',
  'https://www.instagram.com/nature_photography/'
];

const job = await instagramScraper.createProfileScrapeJob('project-123', profileUrls, {
  priority: 'medium',
  // Extra opties...
});

console.log(`Profiel scrape job aangemaakt: ${job.id}`);
```

#### Post Scraping

```javascript
// Maak een post scrape job aan
const postUrls = [
  'https://www.instagram.com/p/CpQnX8XMZ1Y/',
  'https://www.instagram.com/p/CpRt7JnMq2Z/'
];

const job = await instagramScraper.createPostScrapeJob('project-123', postUrls, {
  priority: 'high',
  // Extra opties...
});

console.log(`Post scrape job aangemaakt: ${job.id}`);
```

#### URL Generatie

```javascript
// Genereer hashtag URLs
const hashtagUrls = instagramScraper.generateHashtagUrls('nature', 3);

// Genereer URLs voor meerdere hashtags
const multiHashtagUrls = instagramScraper.generateMultiHashtagUrls(['nature', 'travel', 'food'], 2);
```

### TikTok Scraper

#### Initialisatie

```javascript
import { getTikTokScraper } from './platforms/tiktok';

const tiktokScraper = getTikTokScraper();
```

#### Hashtag Scraping

```javascript
// Maak een hashtag scrape job aan
const hashtagUrls = [
  'https://www.tiktok.com/tag/dance',
  'https://www.tiktok.com/tag/cooking'
];

const job = await tiktokScraper.createHashtagScrapeJob('project-123', hashtagUrls, {
  priority: 'high',
  // Extra opties...
});

console.log(`Hashtag scrape job aangemaakt: ${job.id}`);
```

#### Profiel Scraping

```javascript
// Maak een profiel scrape job aan
const profileUrls = [
  'https://www.tiktok.com/@tiktok',
  'https://www.tiktok.com/@charlidamelio'
];

const job = await tiktokScraper.createProfileScrapeJob('project-123', profileUrls, {
  priority: 'medium',
  // Extra opties...
});

console.log(`Profiel scrape job aangemaakt: ${job.id}`);
```

#### Video Scraping

```javascript
// Maak een video scrape job aan
const videoUrls = [
  'https://www.tiktok.com/@username/video/7123456789012345678',
  'https://www.tiktok.com/@another_user/video/7123456789012345679'
];

const job = await tiktokScraper.createVideoScrapeJob('project-123', videoUrls, {
  priority: 'high',
  // Extra opties...
});

console.log(`Video scrape job aangemaakt: ${job.id}`);
```

#### URL Generatie

```javascript
// Genereer hashtag URLs
const hashtagUrls = tiktokScraper.generateHashtagUrls('dance');

// Genereer URLs voor meerdere hashtags
const multiHashtagUrls = tiktokScraper.generateMultiHashtagUrls(['dance', 'cooking', 'music']);
```

## Scrape Opties

De Social Media scrapers ondersteunen de volgende opties voor het aanpassen van het scrape gedrag:

### Algemene Opties

- `wait_for`: CSS selector om op te wachten voordat de pagina als geladen wordt beschouwd
- `device_type`: Type apparaat (desktop, mobile, tablet)
- `javascript`: Of JavaScript moet worden uitgevoerd (true/false)
- `timeout`: Timeout in milliseconden
- `screenshot`: Of een screenshot moet worden gemaakt (true/false)
- `html`: Of de HTML response moet worden teruggegeven (true/false)

### Instagram Opties

```javascript
const instagramOptions = {
  wait_for: 'article',
  device_type: 'mobile', // Instagram werkt beter met mobile user-agent
  javascript: true,
  timeout: 60000, // Instagram kan langzaam laden
  screenshot: false,
  html: true,
  selectors: {
    // Hashtag selectors
    posts: 'article',
    postImage: 'img',
    postVideo: 'video',
    postCaption: 'div[role="button"] + div',
    postLikes: 'section:first-of-type span',
    postComments: 'section:nth-of-type(2) span',
    postDate: 'time',
    postOwner: 'header a',
    pagination: 'a[href*="max_id"]',
    
    // Profiel selectors
    profileName: 'header h1, header h2',
    profileBio: 'header > div:nth-of-type(3) > div',
    profileStats: 'header ul li',
    profileFollowers: 'header ul li:nth-of-type(2)',
    profileFollowing: 'header ul li:nth-of-type(3)',
    profilePosts: 'header ul li:first-of-type',
    profileImage: 'header img',
    
    // Post selectors
    comments: 'ul > li',
    commentText: 'span',
    commentOwner: 'a',
    commentDate: 'time',
    commentLikes: 'button span'
  }
};
```

### TikTok Opties

```javascript
const tiktokOptions = {
  wait_for: '.video-feed-item',
  device_type: 'mobile', // TikTok werkt beter met mobile user-agent
  javascript: true,
  timeout: 60000, // TikTok kan langzaam laden
  screenshot: false,
  html: true,
  selectors: {
    // Hashtag selectors
    videos: '.video-feed-item',
    videoThumb: '.video-feed-item img',
    videoStats: '.video-feed-item .item-stats',
    videoLikes: '.video-feed-item .like-count',
    videoComments: '.video-feed-item .comment-count',
    videoShares: '.video-feed-item .share-count',
    videoCaption: '.video-feed-item .video-caption',
    videoOwner: '.video-feed-item .author-uniqueId',
    pagination: '.pagination-button',
    
    // Profiel selectors
    profileName: '.user-profile-header .user-title',
    profileBio: '.user-profile-header .user-bio',
    profileStats: '.user-profile-header .count-infos',
    profileFollowers: '.user-profile-header .followers .count-info',
    profileFollowing: '.user-profile-header .following .count-info',
    profileLikes: '.user-profile-header .likes .count-info',
    profileImage: '.user-profile-header .avatar',
    
    // Video selectors
    videoPlayer: '.video-player',
    videoSource: '.video-player video',
    comments: '.comment-item',
    commentText: '.comment-text',
    commentOwner: '.comment-username',
    commentDate: '.comment-time',
    commentLikes: '.comment-like-count'
  }
};
```

## Resultaat Structuur

### Instagram Hashtag Resultaat

```javascript
{
  hashtag: 'nature',
  url: 'https://www.instagram.com/explore/tags/nature/',
  posts: [
    {
      id: 'CpQnX8XMZ1Y',
      type: 'image',
      url: 'https://www.instagram.com/p/CpQnX8XMZ1Y/',
      image_url: 'https://scontent.cdninstagram.com/v/t51.2885-15/image1.jpg',
      caption: 'Beautiful sunset at the beach #sunset #beach #nature',
      likes_count: 1234,
      comments_count: 56,
      owner: {
        username: 'nature_lover',
        profile_url: 'https://www.instagram.com/nature_lover/'
      },
      posted_at: '2023-03-01T18:45:30Z',
      hashtags: ['sunset', 'beach', 'nature'],
      mentions: []
    },
    // Meer posts...
  ],
  pagination: {
    has_next_page: true,
    end_cursor: 'QVFCX3VyZW1fNjM5MDIyNzE2MjgxNjk4NzlfMTIzNDU2Nzg5MA==',
    next_url: 'https://www.instagram.com/explore/tags/nature/?max_id=QVFCX3VyZW1fNjM5MDIyNzE2MjgxNjk4NzlfMTIzNDU2Nzg5MA=='
  },
  post_count: 3,
  scraped_at: '2023-01-20T10:15:30Z'
}
```

### Instagram Profiel Resultaat

```javascript
{
  username: 'nature_lover',
  url: 'https://www.instagram.com/nature_lover/',
  profile: {
    username: 'nature_lover',
    full_name: 'Nature Photography',
    bio: 'Capturing the beauty of nature 📸 | Professional photographer | Available for bookings',
    website: 'https://naturephotography.com',
    followers_count: 12345,
    following_count: 567,
    posts_count: 234,
    is_private: false,
    is_verified: true,
    profile_image_url: 'https://scontent.cdninstagram.com/v/t51.2885-19/profile.jpg'
  },
  posts: [
    // Posts zoals in hashtag resultaat
  ],
  pagination: {
    has_next_page: true,
    end_cursor: 'QVFCX3VyZW1fNjM5MDIyNzE2MjgxNjk4NzlfMTIzNDU2Nzg5MA==',
    next_url: 'https://www.instagram.com/nature_lover/?max_id=QVFCX3VyZW1fNjM5MDIyNzE2MjgxNjk4NzlfMTIzNDU2Nzg5MA=='
  },
  post_count: 3,
  scraped_at: '2023-01-20T10:15:30Z'
}
```

### Instagram Post Resultaat

```javascript
{
  post_id: 'CpQnX8XMZ1Y',
  url: 'https://www.instagram.com/p/CpQnX8XMZ1Y/',
  post: {
    id: 'CpQnX8XMZ1Y',
    type: 'image',
    url: 'https://www.instagram.com/p/CpQnX8XMZ1Y/',
    image_url: 'https://scontent.cdninstagram.com/v/t51.2885-15/image1.jpg',
    caption: 'Beautiful sunset at the beach #sunset #beach #nature',
    likes_count: 1234,
    comments_count: 56,
    owner: {
      username: 'nature_lover',
      profile_url: 'https://www.instagram.com/nature_lover/'
    },
    posted_at: '2023-03-01T18:45:30Z',
    hashtags: ['sunset', 'beach', 'nature'],
    mentions: [],
    location: {
      name: 'Malibu Beach',
      id: '12345678'
    }
  },
  comments: [
    {
      id: 'comment1',
      text: 'Wow, this is beautiful! 😍',
      owner: {
        username: 'beach_lover',
        profile_url: 'https://www.instagram.com/beach_lover/'
      },
      posted_at: '2023-03-01T19:00:15Z',
      likes_count: 12,
      mentions: [],
      hashtags: []
    },
    // Meer comments...
  ],
  comment_count: 3,
  scraped_at: '2023-01-20T10:15:30Z'
}
```

### TikTok Hashtag Resultaat

```javascript
{
  hashtag: 'dance',
  url: 'https://www.tiktok.com/tag/dance',
  stats: {
    views_count: 1234567890,
    videos_count: 98765,
    related_hashtags: ['similar', 'related', 'popular']
  },
  videos: [
    {
      id: '7123456789012345678',
      url: 'https://www.tiktok.com/@username/video/7123456789012345678',
      thumbnail_url: 'https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/thumbnail1.jpg',
      caption: 'Check out this cool trick! #trick #tutorial #howto',
      likes_count: 12345,
      comments_count: 678,
      shares_count: 234,
      views_count: 98765,
      owner: {
        username: 'username',
        profile_url: 'https://www.tiktok.com/@username'
      },
      posted_at: '2023-03-01T18:45:30Z',
      hashtags: ['trick', 'tutorial', 'howto'],
      mentions: [],
      duration: 30
    },
    // Meer videos...
  ],
  pagination: {
    has_more: true,
    cursor: '1234567890',
    next_url: 'https://www.tiktok.com/tag/dance?cursor=1234567890'
  },
  video_count: 3,
  scraped_at: '2023-01-20T10:15:30Z'
}
```

### TikTok Profiel Resultaat

```javascript
{
  username: 'username',
  url: 'https://www.tiktok.com/@username',
  profile: {
    username: 'username',
    nickname: 'User Name',
    bio: 'Creating fun content | Follow for daily videos | Business: email@example.com',
    followers_count: 123456,
    following_count: 567,
    likes_count: 2345678,
    videos_count: 234,
    is_verified: true,
    profile_image_url: 'https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/profile.jpg'
  },
  videos: [
    // Videos zoals in hashtag resultaat
  ],
  pagination: {
    has_more: true,
    cursor: '1234567890',
    next_url: 'https://www.tiktok.com/@username?cursor=1234567890'
  },
  video_count: 3,
  scraped_at: '2023-01-20T10:15:30Z'
}
```

### TikTok Video Resultaat

```javascript
{
  video_id: '7123456789012345678',
  url: 'https://www.tiktok.com/@username/video/7123456789012345678',
  video: {
    id: '7123456789012345678',
    url: 'https://www.tiktok.com/@username/video/7123456789012345678',
    video_url: 'https://v16-webapp.tiktok.com/video.mp4',
    thumbnail_url: 'https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/thumbnail1.jpg',
    caption: 'Check out this cool trick! #trick #tutorial #howto',
    likes_count: 12345,
    comments_count: 678,
    shares_count: 234,
    views_count: 98765,
    owner: {
      username: 'username',
      nickname: 'User Name',
      profile_url: 'https://www.tiktok.com/@username',
      is_verified: true,
      profile_image_url: 'https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/profile.jpg'
    },
    posted_at: '2023-03-01T18:45:30Z',
    hashtags: ['trick', 'tutorial', 'howto'],
    mentions: [],
    music: {
      title: 'Original Sound - username',
      author: 'username',
      url: 'https://www.tiktok.com/music/Original-Sound-7123456789012345678'
    },
    duration: 30
  },
  comments: [
    {
      id: 'comment1',
      text: 'This is amazing! 👏',
      owner: {
        username: 'commenter1',
        profile_url: 'https://www.tiktok.com/@commenter1'
      },
      posted_at: '2023-03-01T19:00:15Z',
      likes_count: 123,
      replies_count: 5,
      mentions: [],
      hashtags: []
    },
    // Meer comments...
  ],
  comment_count: 3,
  scraped_at: '2023-01-20T10:15:30Z'
}
```

## Testen

Je kunt de Social Media scrapers testen met het test script:

```bash
node src/services/scraping/test-social-scrapers.js
```

Dit script test de volgende functionaliteit:

1. Instagram URL validatie
2. TikTok URL validatie
3. Instagram hashtag scraping
4. Instagram profiel scraping
5. Instagram post scraping
6. TikTok hashtag scraping
7. TikTok profiel scraping
8. TikTok video scraping

## Foutafhandeling

De Social Media scrapers bevatten uitgebreide foutafhandeling:

- Validatie van input parameters
- Controle van scrape resultaten
- Logging van fouten
- Integratie met de job queue voor retry mechanisme

## Implementatiedetails

De Social Media scrapers zijn geïmplementeerd als singleton classes die de Decodo API client gebruiken voor het uitvoeren van scrape operaties. De scrapers bevatten mock implementaties voor de extractie functies, die in een productie-omgeving moeten worden vervangen door echte HTML parsing logica.

## Beperkingen

### Instagram

- Instagram heeft strenge rate limiting en kan IP-adressen blokkeren bij te veel requests
- Sommige content is alleen zichtbaar voor ingelogde gebruikers
- De HTML structuur kan regelmatig veranderen, waardoor selectors aangepast moeten worden
- Paginering is complex en vereist het extraheren van cursors uit de response

### TikTok

- TikTok heeft geavanceerde bot detectie en kan IP-adressen blokkeren
- Videos zijn vaak moeilijk te extraheren vanwege dynamische laadmechanismen
- De mobiele en desktop versies hebben verschillende HTML structuren
- TikTok kan geo-restricties hebben voor bepaalde content

## Best Practices

1. **Rate Limiting**: Beperk het aantal requests per IP-adres om blokkering te voorkomen
2. **Proxy Rotatie**: Gebruik verschillende IP-adressen voor scraping om detectie te vermijden
3. **User-Agent Variatie**: Wissel verschillende user-agents af om natuurlijk gedrag te simuleren
4. **Incrementele Scraping**: Verzamel data incrementeel in plaats van alles in één keer
5. **Caching**: Sla resultaten op om dubbele requests te voorkomen
6. **Fout Tolerantie**: Implementeer robuuste foutafhandeling en retry mechanismen
7. **Respecteer Robots.txt**: Houd rekening met de robots.txt regels van de websites

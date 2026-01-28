
interface YouTubeVideoDetails {
  duration: number;
  thumbnailUrl: string;
  title?: string;
  description?: string;
}

function extractYouTubeVideoId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = urlOrId.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

export async function fetchYouTubeVideoDetails(urlOrId: string): Promise<YouTubeVideoDetails | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("[YouTube] No YOUTUBE_API_KEY configured");
    return null;
  }
  
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) {
    console.error("[YouTube] Could not extract video ID from:", urlOrId);
    return null;
  }
  
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails,snippet&key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("[YouTube] API error:", response.status, await response.text());
      return null;
    }
    
    const data = await response.json() as any;
    
    if (!data.items || data.items.length === 0) {
      console.error("[YouTube] Video not found:", videoId);
      return null;
    }
    
    const item = data.items[0];
    const duration = parseISO8601Duration(item.contentDetails.duration);
    
    const thumbnails = item.snippet.thumbnails;
    const thumbnailUrl = thumbnails.maxres?.url || 
                         thumbnails.standard?.url || 
                         thumbnails.high?.url || 
                         thumbnails.medium?.url || 
                         thumbnails.default?.url;
    
    return {
      duration,
      thumbnailUrl,
      title: item.snippet.title,
      description: item.snippet.description,
    };
  } catch (error) {
    console.error("[YouTube] Failed to fetch video details:", error);
    return null;
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

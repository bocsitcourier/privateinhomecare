
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

export interface YouTubeChannelVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  publishedAt: string;
}

function extractChannelHandle(url: string): string | null {
  const match = url.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export async function fetchChannelVideos(channelUrlOrHandle: string): Promise<YouTubeChannelVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("[YouTube] No YOUTUBE_API_KEY configured");
    return [];
  }

  let handle = channelUrlOrHandle;
  if (channelUrlOrHandle.includes("youtube.com")) {
    handle = extractChannelHandle(channelUrlOrHandle) || channelUrlOrHandle;
  }

  try {
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?forHandle=${handle}&part=contentDetails,snippet&key=${apiKey}`
    );
    
    if (!channelResponse.ok) {
      console.error("[YouTube] Channel API error:", channelResponse.status);
      return [];
    }

    const channelData = await channelResponse.json() as any;
    if (!channelData.items || channelData.items.length === 0) {
      console.error("[YouTube] Channel not found:", handle);
      return [];
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${uploadsPlaylistId}&part=snippet,contentDetails&maxResults=50&key=${apiKey}`
    );
    
    if (!playlistResponse.ok) {
      console.error("[YouTube] Playlist API error:", playlistResponse.status);
      return [];
    }

    const playlistData = await playlistResponse.json() as any;
    const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(",");

    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=snippet,contentDetails&key=${apiKey}`
    );

    if (!videosResponse.ok) {
      console.error("[YouTube] Videos API error:", videosResponse.status);
      return [];
    }

    const videosData = await videosResponse.json() as any;
    
    return videosData.items.map((item: any) => {
      const thumbnails = item.snippet.thumbnails;
      return {
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description || "",
        thumbnailUrl: thumbnails.maxres?.url || thumbnails.standard?.url || thumbnails.high?.url || thumbnails.medium?.url,
        duration: parseISO8601Duration(item.contentDetails.duration),
        publishedAt: item.snippet.publishedAt,
      };
    });
  } catch (error) {
    console.error("[YouTube] Failed to fetch channel videos:", error);
    return [];
  }
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
}

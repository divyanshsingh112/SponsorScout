import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export const fetchAndCalculateStats = async (channelId: string) => {
  try {
    // 1. Fetch channel details to get the uploads playlist ID
    const channelRes = await youtube.channels.list({
      part: ['statistics', 'contentDetails', 'snippet'],
      id: [channelId],
    });

    const channelItem = channelRes.data.items?.[0];
    if (!channelItem) {
      throw new Error('YouTube channel not found');
    }

    const uploadsPlaylistId = channelItem.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      throw new Error('No uploads playlist found for this channel');
    }

    // 2. Fetch the last 15 uploaded videos
    const playlistItemsRes = await youtube.playlistItems.list({
      part: ['contentDetails'],
      playlistId: uploadsPlaylistId,
      maxResults: 15,
    });

    const videoIds = playlistItemsRes.data.items
      ?.map((item) => item.contentDetails?.videoId)
      .filter((id): id is string => !!id);

    if (!videoIds || videoIds.length === 0) {
      throw new Error('No videos found for this channel');
    }

    // 3. Fetch statistics for these 15 videos
    const videosRes = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      id: videoIds,
    });

    const videos = videosRes.data.items || [];

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let actualVideoCount = 0;

    for (const video of videos) {
      const stats = video.statistics;
      if (stats) {
        totalViews += parseInt(stats.viewCount || '0', 10);
        totalLikes += parseInt(stats.likeCount || '0', 10);
        totalComments += parseInt(stats.commentCount || '0', 10);
        actualVideoCount++;
      }
    }

    if (actualVideoCount === 0) {
      throw new Error('Could not retrieve statistics for the latest videos');
    }

    // 4. Calculate metrics
    const averageViews = Math.round(totalViews / 15);
    
    let engagementRate = 0;
    if (averageViews > 0) {
      engagementRate = ((totalLikes + totalComments) / averageViews) * 100;
    }

    const recentVideos = videos.slice(0, 3).map((video) => ({
      title: video.snippet?.title || 'Unknown Video',
      viewCount: video.statistics?.viewCount || '0',
    }));

    return {
      channelId,
      channelName: channelItem.snippet?.title || 'Unknown Channel',
      channelAvatarUrl: channelItem.snippet?.thumbnails?.high?.url || '',
      averageViews,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      totalVideosAnalyzed: actualVideoCount,
      totalLikes,
      totalComments,
      totalViews,
      channelStatistics: channelItem.statistics,
      recentVideos,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch YouTube stats: ${error.message}`);
  }
};

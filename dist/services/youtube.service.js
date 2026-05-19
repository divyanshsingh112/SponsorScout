"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndCalculateStats = void 0;
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const youtube = googleapis_1.google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
});
const fetchAndCalculateStats = async (channelId) => {
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
            .filter((id) => !!id);
        if (!videoIds || videoIds.length === 0) {
            throw new Error('No videos found for this channel');
        }
        // 3. Fetch statistics for these 15 videos
        const videosRes = await youtube.videos.list({
            part: ['statistics'],
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
        return {
            channelId,
            channelName: channelItem.snippet?.title || 'Unknown Channel',
            averageViews,
            engagementRate: parseFloat(engagementRate.toFixed(2)),
            totalVideosAnalyzed: actualVideoCount,
            totalLikes,
            totalComments,
            totalViews,
            channelStatistics: channelItem.statistics,
        };
    }
    catch (error) {
        throw new Error(`Failed to fetch YouTube stats: ${error.message}`);
    }
};
exports.fetchAndCalculateStats = fetchAndCalculateStats;

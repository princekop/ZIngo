// ByteGram Feed Algorithm
// Determines post ranking based on engagement and user preferences

interface Post {
  id: string
  likes: number
  comments: number
  shares: number
  views: number
  timestamp: Date
  authorId: string
  isFollowed?: boolean
}

interface UserPreferences {
  followedUsers: string[]
  likedCategories: string[]
  blockedUsers: string[]
  mutedUsers: string[]
}

/**
 * Calculate engagement score for a post
 * Higher score = more likely to be shown
 */
export function calculateEngagementScore(post: Post): number {
  const now = new Date()
  const ageInHours = (now.getTime() - post.timestamp.getTime()) / (1000 * 60 * 60)

  // Decay factor: older posts get lower scores
  const decayFactor = Math.max(0.1, 1 / (1 + ageInHours * 0.1))

  // Engagement metrics
  const likeScore = post.likes * 1
  const commentScore = post.comments * 3 // Comments are more valuable
  const shareScore = post.shares * 5 // Shares are most valuable
  const viewScore = post.views * 0.1

  const totalEngagement = (likeScore + commentScore + shareScore + viewScore) * decayFactor

  return totalEngagement
}

/**
 * Rank posts for feed display
 */
export function rankPostsForFeed(
  posts: Post[],
  userPreferences: UserPreferences,
  feedType: 'trending' | 'following' | 'recent'
): Post[] {
  // Filter out blocked and muted users
  const filteredPosts = posts.filter(
    (post) =>
      !userPreferences.blockedUsers.includes(post.authorId) &&
      !userPreferences.mutedUsers.includes(post.authorId)
  )

  if (feedType === 'recent') {
    // Sort by timestamp, newest first
    return filteredPosts.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
  }

  if (feedType === 'following') {
    // Prioritize followed users
    return filteredPosts
      .filter((post) => userPreferences.followedUsers.includes(post.authorId))
      .sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a))
  }

  // Trending feed: sort by engagement score
  return filteredPosts.sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a))
}

/**
 * Get personalized feed recommendations
 */
export function getPersonalizedFeed(
  posts: Post[],
  userPreferences: UserPreferences,
  limit: number = 20
): Post[] {
  // Start with trending posts
  let rankedPosts = rankPostsForFeed(posts, userPreferences, 'trending')

  // Boost posts from followed users
  const followedUserPosts = rankedPosts.filter((post) =>
    userPreferences.followedUsers.includes(post.authorId)
  )
  const otherPosts = rankedPosts.filter(
    (post) => !userPreferences.followedUsers.includes(post.authorId)
  )

  // Mix followed and other posts (70% followed, 30% discovery)
  const mixedPosts: Post[] = []
  const followedLimit = Math.ceil((limit * 70) / 100)
  const otherLimit = limit - followedLimit

  mixedPosts.push(...followedUserPosts.slice(0, followedLimit))
  mixedPosts.push(...otherPosts.slice(0, otherLimit))

  return mixedPosts.slice(0, limit)
}

/**
 * Detect trending topics/hashtags
 */
export function detectTrendingTopics(posts: Post[], limit: number = 10): string[] {
  const hashtagMap = new Map<string, number>()

  posts.forEach((post) => {
    // Extract hashtags from post content
    // This is a placeholder - actual implementation would parse post content
    const hashtags = ['#coding', '#webdev', '#javascript', '#react']
    hashtags.forEach((tag) => {
      hashtagMap.set(tag, (hashtagMap.get(tag) || 0) + 1)
    })
  })

  // Sort by frequency
  return Array.from(hashtagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag)
}

/**
 * Calculate post virality score
 * Used to determine if a post should be promoted
 */
export function calculateVirality(post: Post): number {
  const engagementRate = (post.likes + post.comments + post.shares) / Math.max(post.views, 1)
  const shareRatio = post.shares / Math.max(post.likes, 1)

  // High engagement rate and share ratio = viral
  const viralityScore = engagementRate * 100 + shareRatio * 50

  return Math.min(100, viralityScore) // Cap at 100
}

/**
 * Get suggested users to follow based on engagement
 */
export function getSuggestedUsers(
  posts: Post[],
  userPreferences: UserPreferences,
  limit: number = 5
): string[] {
  const userEngagement = new Map<string, number>()

  posts.forEach((post) => {
    if (!userPreferences.followedUsers.includes(post.authorId)) {
      const score = calculateEngagementScore(post)
      userEngagement.set(
        post.authorId,
        (userEngagement.get(post.authorId) || 0) + score
      )
    }
  })

  // Sort by engagement and return top users
  return Array.from(userEngagement.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([userId]) => userId)
}

/**
 * Calculate content diversity score
 * Ensures feed has variety of content
 */
export function calculateDiversityScore(posts: Post[]): number {
  if (posts.length === 0) return 0

  // Calculate variance in engagement scores
  const scores = posts.map(calculateEngagementScore)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length

  return Math.sqrt(variance)
}

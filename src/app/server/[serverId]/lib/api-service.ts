/**
 * Complete API Service for Server/[serverId] Page
 * All real API endpoints - NO MOCK DATA
 */

export class ServerAPIService {
  private baseURL = '/api'

  // ==================== SERVER APIs ====================

  /**
   * Get server details
   * GET /api/servers/{serverId}
   */
  async getServer(serverId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}`)
    if (!response.ok) throw new Error('Failed to fetch server')
    return response.json()
  }

  /**
   * Update server settings
   * PUT /api/servers/{serverId}
   */
  async updateServer(serverId: string, data: {
    name?: string
    icon?: string
    banner?: string
    description?: string
  }) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update server')
    return response.json()
  }

  /**
   * Leave server
   * POST /api/servers/{serverId}/leave
   */
  async leaveServer(serverId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/leave`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to leave server')
    return response.json()
  }

  // ==================== CATEGORIES APIs ====================

  /**
   * Get all categories with channels
   * GET /api/servers/{serverId}/categories
   */
  async getCategories(serverId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/categories`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return response.json()
  }

  /**
   * Create new category
   * POST /api/servers/{serverId}/categories
   */
  async createCategory(serverId: string, data: {
    name: string
    description?: string
  }) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create category')
    return response.json()
  }

  /**
   * Update category
   * PUT /api/servers/{serverId}/categories/{categoryId}
   */
  async updateCategory(serverId: string, categoryId: string, data: {
    name?: string
    description?: string
  }) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update category')
    return response.json()
  }

  /**
   * Delete category
   * DELETE /api/servers/{serverId}/categories/{categoryId}
   */
  async deleteCategory(serverId: string, categoryId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/categories/${categoryId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete category')
    return response.json()
  }

  // ==================== CHANNELS APIs ====================

  /**
   * Get channel details
   * GET /api/channels/{channelId}
   */
  async getChannel(channelId: string) {
    const response = await fetch(`${this.baseURL}/channels/${channelId}`)
    if (!response.ok) throw new Error('Failed to fetch channel')
    return response.json()
  }

  /**
   * Create new channel
   * POST /api/servers/{serverId}/categories/{categoryId}/channels
   */
  async createChannel(serverId: string, categoryId: string, data: {
    name: string
    type: 'text' | 'voice' | 'announcement'
    description?: string
  }) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/categories/${categoryId}/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create channel')
    return response.json()
  }

  /**
   * Update channel
   * PUT /api/channels/{channelId}
   */
  async updateChannel(channelId: string, data: {
    name?: string
    description?: string
    type?: string
    slowmode?: number
    nsfw?: boolean
  }) {
    const response = await fetch(`${this.baseURL}/channels/${channelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update channel')
    return response.json()
  }

  /**
   * Delete channel
   * DELETE /api/channels/{channelId}
   */
  async deleteChannel(channelId: string) {
    const response = await fetch(`${this.baseURL}/channels/${channelId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete channel')
    return response.json()
  }

  // ==================== MESSAGES APIs ====================

  /**
   * Get messages from channel
   * GET /api/channels/{channelId}/messages
   */
  async getMessages(channelId: string, limit = 50, before?: string) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (before) params.append('before', before)

    const response = await fetch(`${this.baseURL}/channels/${channelId}/messages?${params}`)
    if (!response.ok) throw new Error('Failed to fetch messages')
    return response.json()
  }

  /**
   * Send message to channel
   * POST /api/channels/{channelId}/messages
   */
  async sendMessage(channelId: string, data: {
    content: string
    replyTo?: string
    attachments?: File[]
  }) {
    const formData = new FormData()
    formData.append('content', data.content)
    if (data.replyTo) formData.append('replyTo', data.replyTo)

    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file)
      })
    }

    const response = await fetch(`${this.baseURL}/channels/${channelId}/messages`, {
      method: 'POST',
      body: formData
    })
    if (!response.ok) throw new Error('Failed to send message')
    return response.json()
  }

  /**
   * Edit message
   * PUT /api/messages/{messageId}
   */
  async editMessage(messageId: string, content: string) {
    const response = await fetch(`${this.baseURL}/messages/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
    if (!response.ok) throw new Error('Failed to edit message')
    return response.json()
  }

  /**
   * Delete message
   * DELETE /api/messages/{messageId}
   */
  async deleteMessage(messageId: string) {
    const response = await fetch(`${this.baseURL}/messages/${messageId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete message')
    return response.json()
  }

  /**
   * Add reaction to message
   * POST /api/messages/{messageId}/reactions
   */
  async addReaction(messageId: string, emoji: string) {
    const response = await fetch(`${this.baseURL}/messages/${messageId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji })
    })
    if (!response.ok) throw new Error('Failed to add reaction')
    return response.json()
  }

  /**
   * Remove reaction from message
   * DELETE /api/messages/{messageId}/reactions
   */
  async removeReaction(messageId: string, emoji: string) {
    const response = await fetch(`${this.baseURL}/messages/${messageId}/reactions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji })
    })
    if (!response.ok) throw new Error('Failed to remove reaction')
    return response.json()
  }

  /**
   * Pin message
   * POST /api/messages/{messageId}/pin
   */
  async pinMessage(messageId: string) {
    const response = await fetch(`${this.baseURL}/messages/${messageId}/pin`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to pin message')
    return response.json()
  }

  // ==================== MEMBERS APIs ====================

  /**
   * Get server members
   * GET /api/servers/{serverId}/members
   */
  async getMembers(serverId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/members`)
    if (!response.ok) throw new Error('Failed to fetch members')
    return response.json()
  }

  /**
   * Kick member
   * POST /api/servers/{serverId}/members/{memberId}/kick
   */
  async kickMember(serverId: string, memberId: string, reason?: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/members/${memberId}/kick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    })
    if (!response.ok) throw new Error('Failed to kick member')
    return response.json()
  }

  /**
   * Ban member
   * POST /api/servers/{serverId}/members/{memberId}/ban
   */
  async banMember(serverId: string, memberId: string, reason?: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/members/${memberId}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    })
    if (!response.ok) throw new Error('Failed to ban member')
    return response.json()
  }

  /**
   * Mute member
   * POST /api/servers/{serverId}/members/{memberId}/mute
   */
  async muteMember(serverId: string, memberId: string, duration?: number) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/members/${memberId}/mute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration })
    })
    if (!response.ok) throw new Error('Failed to mute member')
    return response.json()
  }

  /**
   * Unmute member
   * POST /api/servers/{serverId}/members/{memberId}/unmute
   */
  async unmuteMember(serverId: string, memberId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/members/${memberId}/unmute`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to unmute member')
    return response.json()
  }

  /**
   * Update member nickname
   * PUT /api/servers/{serverId}/members/{memberId}/nickname
   */
  async updateNickname(serverId: string, memberId: string, nickname: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/members/${memberId}/nickname`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname })
    })
    if (!response.ok) throw new Error('Failed to update nickname')
    return response.json()
  }

  // ==================== ROLES APIs ====================

  /**
   * Get server roles
   * GET /api/servers/{serverId}/roles
   */
  async getRoles(serverId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/roles`)
    if (!response.ok) throw new Error('Failed to fetch roles')
    return response.json()
  }

  /**
   * Assign role to member
   * POST /api/servers/{serverId}/members/{memberId}/roles
   */
  async assignRole(serverId: string, memberId: string, roleId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/members/${memberId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId })
    })
    if (!response.ok) throw new Error('Failed to assign role')
    return response.json()
  }

  // ==================== INVITES APIs ====================

  /**
   * Create server invite
   * POST /api/servers/{serverId}/invites
   */
  async createInvite(serverId: string, data?: {
    channelId?: string
    maxUses?: number
    expiresIn?: number
  }) {
    // Use a default channelId if not provided
    const requestData = {
      channelId: data?.channelId || 'general',
      ...data
    }
    const response = await fetch(`${this.baseURL}/servers/${serverId}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create invite: ${error}`)
    }
    return response.json()
  }

  /**
   * Get server invites
   * GET /api/servers/{serverId}/invites
   */
  async getInvites(serverId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/invites`)
    if (!response.ok) throw new Error('Failed to fetch invites')
    return response.json()
  }

  // ==================== BOOSTS APIs ====================

  /**
   * Boost server
   * POST /api/servers/{serverId}/boosts
   */
  async boostServer(serverId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/boosts`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to boost server')
    return response.json()
  }

  /**
   * Get server boosts
   * GET /api/servers/{serverId}/boosts
   */
  async getBoosts(serverId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/boosts`)
    if (!response.ok) throw new Error('Failed to fetch boosts')
    return response.json()
  }

  // ==================== BANS APIs ====================

  /**
   * Get server bans
   * GET /api/servers/{serverId}/bans
   */
  async getBans(serverId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/bans`)
    if (!response.ok) throw new Error('Failed to fetch bans')
    return response.json()
  }

  /**
   * Unban member
   * DELETE /api/servers/{serverId}/bans/{userId}
   */
  async unbanMember(serverId: string, userId: string) {
    const response = await fetch(`${this.baseURL}/servers/${serverId}/bans/${userId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to unban member')
    return response.json()
  }

  // ==================== TYPING INDICATOR ====================

  /**
   * Send typing indicator
   * POST /api/channels/{channelId}/typing
   */
  async startTyping(channelId: string) {
    const response = await fetch(`${this.baseURL}/channels/${channelId}/typing`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to send typing indicator')
    return response.json()
  }
}

// Export singleton instance
export const serverAPI = new ServerAPIService()

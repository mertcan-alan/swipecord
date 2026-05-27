/**
 * Swipecord — Discord API Handler
 * Handles all communication with Discord's API using user token.
 */

class DiscordAPI {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://discord.com/api/v10';
    this.headers = {
      'Authorization': token,
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
  }

  async request(method, endpoint, body = null) {
    const opts = {
      method,
      headers: this.headers
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${this.baseURL}${endpoint}`, opts);

    // Rate limit handling
    if (res.status === 429) {
      const data = await res.json();
      const retryAfter = (data.retry_after || 1) * 1000;
      console.warn(`Rate limited, retrying after ${retryAfter}ms`);
      await this.sleep(retryAfter);
      return this.request(method, endpoint, body);
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Discord API Error ${res.status}: ${errText}`);
    }

    // 204 No Content (e.g., leave guild)
    if (res.status === 204) return null;

    return res.json();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate token & get current user info
   */
  async getMe() {
    return this.request('GET', '/users/@me');
  }

  /**
   * Get all guilds the user is in
   * Returns array of partial guild objects
   */
  async getGuilds() {
    let allGuilds = [];
    let after = null;

    // Paginate — Discord returns max 200 per request
    while (true) {
      let endpoint = '/users/@me/guilds?limit=200';
      if (after) endpoint += `&after=${after}`;

      const batch = await this.request('GET', endpoint);
      if (!batch || batch.length === 0) break;

      allGuilds = allGuilds.concat(batch);

      if (batch.length < 200) break;
      after = batch[batch.length - 1].id;
    }

    return allGuilds;
  }

  /**
   * Leave a guild
   */
  async leaveGuild(guildId) {
    return this.request('DELETE', `/users/@me/guilds/${guildId}`, { lurking: false });
  }

  /**
   * Get the icon URL for a guild
   */
  getGuildIconURL(guild, size = 256) {
    if (!guild.icon) return null;
    const ext = guild.icon.startsWith('a_') ? 'gif' : 'webp';
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=${size}`;
  }

  /**
   * Get the banner URL for a guild
   */
  getGuildBannerURL(guild, size = 480) {
    if (!guild.banner) return null;
    const ext = guild.banner.startsWith('a_') ? 'gif' : 'webp';
    return `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${ext}?size=${size}`;
  }

  /**
   * Get user avatar URL
   */
  getUserAvatarURL(user, size = 64) {
    if (!user.avatar) {
      const defaultIndex = (parseInt(user.id) >> 22) % 6;
      return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
    }
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'webp';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`;
  }

  /**
   * Get guild initials for fallback icon
   */
  getGuildInitials(name) {
    return name
      .split(/\s+/)
      .map(w => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  /**
   * Check if user is the owner of a guild
   * owner flag is present on partial guild object
   */
  isOwner(guild) {
    return guild.owner === true;
  }

  /**
   * Approximate member count from guild features / permissions
   * Partial guilds have `approximate_member_count` if fetched with ?with_counts=true
   */
  async getGuildsWithCounts() {
    let allGuilds = [];
    let after = null;

    while (true) {
      let endpoint = '/users/@me/guilds?limit=200&with_counts=true';
      if (after) endpoint += `&after=${after}`;

      const batch = await this.request('GET', endpoint);
      if (!batch || batch.length === 0) break;

      allGuilds = allGuilds.concat(batch);

      if (batch.length < 200) break;
      after = batch[batch.length - 1].id;
    }

    return allGuilds;
  }
}

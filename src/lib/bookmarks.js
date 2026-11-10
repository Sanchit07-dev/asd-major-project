
import { supabase } from './supabase'

/**
 * Fetch all resource IDs bookmarked by the user.
 * @param {string} userId
 * @returns {Promise<Set<number>>}
 */
export async function getBookmarkedResourceIds(userId) {
  if (!userId) return new Set()

  const { data, error } = await supabase
    .from('bookmarks')
    .select('resource_id')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching bookmark IDs:', error)
    throw error
  }

  return new Set((data || []).map((bookmark) => bookmark.resource_id))
}

/**
 * Toggle bookmark status for a resource.
 * @param {string} userId
 * @param {number} resourceId
 * @param {boolean} isCurrentlyBookmarked
 * @returns {Promise<boolean>}
 */
export async function toggleBookmark(userId, resourceId, isCurrentlyBookmarked) {
  if (!userId) {
    throw new Error('You must be logged in to bookmark resources.')
  }

  if (isCurrentlyBookmarked) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('resource_id', resourceId)

    if (error) throw error

    return false
  }

  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, resource_id: resourceId })

  if (error) throw error

  return true
}

/**
 * Fetch full resource details for all bookmarks saved by a user.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getBookmarkedResources(userId) {
  if (!userId) return []

  const { data: bookmarkRows, error: bookmarkError } = await supabase
    .from('bookmarks')
    .select('resource_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (bookmarkError) {
    console.error('Error fetching bookmarks:', bookmarkError)
    throw bookmarkError
  }

  if (!bookmarkRows || bookmarkRows.length === 0) return []

  const resourceIds = bookmarkRows.map((bookmark) => bookmark.resource_id)

  const { data: resources, error: resourceError } = await supabase
    .from('resource_stats')
    .select('*')
    .in('id', resourceIds)

  if (resourceError) {
    console.error('Error fetching bookmarked resources:', resourceError)
    throw resourceError
  }

  // Preserve the original bookmark order.
  const resourceMap = new Map(
    (resources || []).map((resource) => [resource.id, resource])
  )

  return resourceIds
    .map((resourceId) => resourceMap.get(resourceId))
    .filter(Boolean)
}

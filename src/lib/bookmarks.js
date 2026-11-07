import { supabase } from './supabase'

/**
 * Fetch all resource IDs bookmarked by the user.
 * @param {string} userId
 * @returns {Promise<Set<number>>} Set of bookmarked resource IDs
 */
export async function getBookmarkedResourceIds(userId) {
  if (!userId) return new Set()
  const { data, error } = await supabase
    .from('bookmarks')
    .select('resource_id')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching bookmark IDs:', error)
    return new Set()
  }
  return new Set((data || []).map((b) => b.resource_id))
}

/**
 * Toggle bookmark status for a resource.
 * @param {string} userId
 * @param {number} resourceId
 * @param {boolean} isCurrentlyBookmarked
 * @returns {Promise<boolean>} New bookmark status
 */
export async function toggleBookmark(userId, resourceId, isCurrentlyBookmarked) {
  if (!userId) throw new Error('You must be logged in to bookmark resources.')

  if (isCurrentlyBookmarked) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('resource_id', resourceId)

    if (error) throw error
    return false
  } else {
    const { error } = await supabase
      .from('bookmarks')
      .insert({ user_id: userId, resource_id: resourceId })

    if (error) throw error
    return true
  }
}

/**
 * Fetch full resource details for all bookmarks saved by a user.
 * @param {string} userId
 * @returns {Promise<Array>} List of bookmarked resources
 */
export async function getBookmarkedResources(userId) {
  if (!userId) return []
  const { data: bookmarkRows, error: bmError } = await supabase
    .from('bookmarks')
    .select('resource_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (bmError || !bookmarkRows || bookmarkRows.length === 0) return []

  const resourceIds = bookmarkRows.map((b) => b.resource_id)
  const { data: resources, error: resError } = await supabase
    .from('resource_stats')
    .select('*')
    .in('id', resourceIds)

  if (resError) {
    console.error('Error fetching bookmarked resources:', resError)
    return []
  }

  // Preserve bookmarked order
  const resourceMap = new Map((resources || []).map((r) => [r.id, r]))
  return resourceIds.map((id) => resourceMap.get(id)).filter(Boolean)
}

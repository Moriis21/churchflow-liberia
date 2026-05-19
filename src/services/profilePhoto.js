// ============================================================
// ChurchFlow Liberia — profilePhoto.js
// Re-exports from imageStorage.js for backward compatibility.
// ============================================================
export {
  uploadProfilePhoto,
  uploadChurchLogo,
  uploadMemberPhoto,
  getReadableFileUrl,
  getReadableFileUrl as getReadableUrl,
  getSignedImageUrl,
  validateImageUpload,
  validateImageUpload as validateImageFile,
  validateImageUpload as validatePhotoFile,
  addApiKey,
  extractPath,
  removeOldImage,
  BUCKETS,
} from './imageStorage'

// saveAvatarUrl — kept here for any legacy callers
import { insforge } from '../lib/insforge'

export async function saveAvatarUrl(userId, url, path = null) {
  const { error } = await insforge.database
    .rpc('update_profile_avatar', {
      p_user_id:     userId,
      p_avatar_url:  url,
      p_avatar_path: path,
    })
  if (error) throw new Error(`Failed to save photo to profile: ${error.message}`)
}

export async function saveMemberPhotoUrl(memberId, url, path = null) {
  const { error } = await insforge.database
    .rpc('update_member_photo', {
      p_member_id:  memberId,
      p_photo_url:  url,
      p_photo_path: path,
    })
  if (error) throw new Error(`Failed to save photo to member record: ${error.message}`)
}

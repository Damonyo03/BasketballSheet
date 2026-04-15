import { createClient } from '@/lib/supabase/client';

/**
 * Uploads a file to a specific bucket with a structured path
 */
export async function uploadFile(file: File, bucket: string, path: string) {
  const supabase = createClient();
  
  const fileExt = file.name.split('.').pop();
  const filePath = `${path}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

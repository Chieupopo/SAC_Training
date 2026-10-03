/**
 * Helper to extract YouTube video ID and generate embed URLs.
 * Handles standard formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If already just an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autoplay=0`;
}

export const SAMPLE_YOUTUBE_LECTURES = [
  {
    category: 'Sales',
    title: 'Nghệ Thuật Trình Bày Giải Pháp & Thuyết Phục Khách Hàng Doanh Nghiệp',
    url: 'https://www.youtube.com/watch?v=M988_fsOSWo',
    duration: '18:45',
  },
  {
    category: 'Sales',
    title: 'Chiến Lược Tư Vấn & Xử Lý Phản Đối Về Giá B2B',
    url: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
    duration: '22:15',
  },
  {
    category: 'Technical',
    title: 'Kiến Trúc Hạ Tầng Cloud Phân Tán & Kubernetes Căn Bản',
    url: 'https://www.youtube.com/watch?v=d_k8w_m5yv4',
    duration: '26:30',
  },
  {
    category: 'Technical',
    title: 'Triển Khai Microservices & Bảo Mật Hệ Thống Doanh Nghiệp',
    url: 'https://www.youtube.com/watch?v=X48VuDVv0do',
    duration: '19:50',
  },
];

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i;
const PDF_EXTENSIONS = /\.pdf(\?.*)?$/i;

const normalizeUrlForTypeCheck = (url: string): string => url.trim();

export const isImageUrl = (url: string): boolean =>
    IMAGE_EXTENSIONS.test(normalizeUrlForTypeCheck(url));

export const isVideoUrl = (url: string): boolean =>
    VIDEO_EXTENSIONS.test(normalizeUrlForTypeCheck(url));

export const isPdfUrl = (url: string): boolean =>
    PDF_EXTENSIONS.test(normalizeUrlForTypeCheck(url));

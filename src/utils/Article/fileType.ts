const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i;
const PDF_EXTENSIONS = /\.pdf(\?.*)?$/i;

export const isImageUrl = (url: string): boolean => IMAGE_EXTENSIONS.test(url);

export const isVideoUrl = (url: string): boolean => VIDEO_EXTENSIONS.test(url);

export const isPdfUrl = (url: string): boolean => PDF_EXTENSIONS.test(url);

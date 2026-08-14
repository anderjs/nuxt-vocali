/**
 * Starts a browser navigation to a presigned attachment URL.
 * S3 controls the filename through the signed Content-Disposition response.
 *
 * @param downloadUrl Short-lived URL returned by the authenticated API.
 */
export function startBrowserDownload(downloadUrl: string): void {
  window.location.assign(downloadUrl);
}

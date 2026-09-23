import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { getVersion } from "@tauri-apps/api/app";
import { isTauri } from "@tauri-apps/api/core";

/**
 * Check whether the application is running inside Tauri.
 */
export function isDesktopApp() {
    return isTauri();
}

/**
 * Get the currently installed desktop application version.
 */
export async function getCurrentAppVersion() {
    if (!isDesktopApp()) {
        return null;
    }

    try {
        return await getVersion();
    } catch (error) {
        console.error("Unable to get application version:", error);
        return null;
    }
}

/**
 * Check GitHub for a newer desktop release.
 */
export async function checkForAppUpdate() {
    if (!isDesktopApp()) {
        return {
            available: false,
            update: null,
            reason: "web",
        };
    }

    try {
        const update = await check();

        if (!update) {
            return {
                available: false,
                update: null,
            };
        }

        return {
            available: true,
            update,
        };
    } catch (error) {
        console.error("Update check failed:", error);

        throw error;
    }
}

/**
 * Download and install the available update.
 */
export async function downloadAndInstallUpdate(
    update,
    onProgress = () => { }
) {
    if (!isDesktopApp()) {
        throw new Error("Application updates are only available in the desktop app.");
    }

    if (!update) {
        throw new Error("No update is available.");
    }

    let downloaded = 0;
    let contentLength = 0;

    await update.downloadAndInstall((event) => {
        switch (event.event) {
            case "Started":
                contentLength = event.data.contentLength || 0;
                downloaded = 0;

                onProgress({
                    status: "started",
                    downloaded: 0,
                    total: contentLength,
                    percentage: 0,
                });
                break;

            case "Progress":
                downloaded += event.data.chunkLength || 0;

                onProgress({
                    status: "downloading",
                    downloaded,
                    total: contentLength,
                    percentage: contentLength
                        ? Math.min(
                            Math.round((downloaded / contentLength) * 100),
                            100
                        )
                        : 0,
                });
                break;

            case "Finished":
                onProgress({
                    status: "finished",
                    downloaded,
                    total: contentLength,
                    percentage: 100,
                });
                break;

            default:
                break;
        }
    });

    onProgress({
        status: "installing",
        downloaded,
        total: contentLength,
        percentage: 100,
    });

    await relaunch();
}
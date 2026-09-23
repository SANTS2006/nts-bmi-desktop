# NTS BMI Desktop Application

The desktop application is the existing NTS BMI React/Vite frontend packaged with Tauri 2 for Windows and macOS.

## Architecture

The desktop app does not contain a second backend or database.

```text
NTS BMI Desktop
      |
      | HTTPS / WebSocket
      v
NTS BMI API
      |
      v
PostgreSQL
```

The existing web frontend is reused. Authentication, RBAC, finance, projects, communication, notifications and other modules continue to use the existing backend.

## API URL

Before a production build, provide the deployed HTTPS backend URL:

```env
VITE_API_URL=https://your-production-api.example.com
```

For local desktop development:

```env
VITE_API_URL=http://localhost:4000
```

Do not ship a desktop production build with a local LAN address such as `172.x.x.x`.

## Local development

From `frontend`:

```powershell
npm install
npm run desktop:dev
```

Tauri will start Vite on port 5173 and open the NTS BMI desktop window.

## Build Windows installer

Generate the platform icon set first:

```powershell
npm run desktop:icons
```

Then on Windows:

```powershell
npm run desktop:build:windows
```

The NSIS installer will be generated under:

```text
src-tauri/target/release/bundle/nsis/
```

The Windows installer is an `.exe`. Tauri also supports MSI packaging, but NSIS is configured here for a simple employee installation experience.

## Build macOS installer

On macOS, generate the platform icon set first:

```bash
npm run desktop:icons
```

Then:

```bash
npm run desktop:build:mac
```

The DMG will be generated under:

```text
src-tauri/target/release/bundle/dmg/
```

For production distribution outside the Mac App Store, Apple code signing and notarization should be configured.

## Backend CORS

The backend has been updated to allow Tauri desktop origins:

- `tauri://localhost`
- `http://tauri.localhost`
- `https://tauri.localhost`

You can also set:

```env
DESKTOP_APP_ORIGINS=tauri://localhost,http://tauri.localhost,https://tauri.localhost
```

The Socket.IO communication server uses the same allowed origins.

## GitHub Actions

`.github/workflows/desktop-build.yml` builds:

- Windows x64
- macOS Apple Silicon
- macOS Intel

Create a GitHub repository secret named:

```text
NTS_BMI_API_URL
```

and set it to the production HTTPS API URL.

Then create a tag such as:

```text
desktop-v1.0.0
```

The workflow will build the installers and upload them as GitHub Actions artifacts.

## Important

The desktop application is a client of the existing NTS BMI server. Employees still need network access to the deployed API. The desktop app should never contain database credentials or backend secrets.

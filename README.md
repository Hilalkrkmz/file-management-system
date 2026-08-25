# 📁 FileFlow — File Management System

A web-based file management system built with Spring Boot and React, where users can upload, organize, and share their files and folders.

## Screenshots

| Login | My Files |
|---|---|
| ![Login](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) |

| Shared With Me | Trash |
|---|---|
| ![Shared With Me](docs/screenshots/shared-with-me.png) | ![Trash](docs/screenshots/trash.png) |

| Starred | Storage Usage |
|---|---|
| ![Starred](docs/screenshots/starred.png) | ![Storage Usage](docs/screenshots/storage.png) |

| Settings | Admin Panel |
|---|---|
| ![Settings](docs/screenshots/settings.png) | ![Admin Panel](docs/screenshots/admin.png) |

| Admin — Users | Admin — All Files |
|---|---|
| ![Admin Users](docs/screenshots/admin-users.png) | ![Admin Files](docs/screenshots/admin-files.png) |

## Features

**File & folder management**
- Create folders, upload / download / delete / rename / move files
- Folder upload (preserving subfolder structure) and drag-and-drop upload (including nested folders)
- Grid / list view
- Bulk actions: multi-select files and folders to move or delete together

**Sharing**
- Share files/folders with a specific user
- Share via a time-limited (24-hour) download link
- Folder shares are read-only and are inherited by nested subfolders
- In-app notification when something is shared with you

**Search & organization**
- Search across your own files/folders and everything shared with you, from one search box
- Starring — per-user (starring a file someone shared with you doesn't affect their own copy)
- Recent — per-user access history
- Type, Folder/User, and Date filters on the Starred / Recent / Shared With Me pages

**Trash**
- Soft delete: removed files/folders land in the trash
- Restore or permanently delete, individually or in bulk

**Storage**
- Storage usage page: quota bar, file count, used/remaining space

**Account**
- JWT-based registration / login
- Profile photo, and changing password / email / username (a username change takes effect instantly, without interrupting the session)
- Permanently delete your account (along with all your files, folders, shares, and history)

**Admin panel**
- List all users, change role and storage quota, bulk or single delete
- Browse every file in the system
- Bulk actions on both the user and file tables

## Tech Stack

**Backend:** Java 17, Spring Boot 3, Spring Data JPA, Spring Security + JWT, PostgreSQL

**Frontend:** React 18, Vite, Material UI, React Router, Axios

## Project Structure

```
file-management-system/
├── backend/     # Spring Boot API
├── frontend/    # React application
└── docs/        # Screenshots, ER diagram, API documentation
```

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.9+
- PostgreSQL 16 (local install or Docker)

### 1. Database

```bash
docker run --name fms-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
docker exec -it fms-postgres psql -U postgres -c "CREATE DATABASE file_management_db;"
```

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

The API starts on `http://localhost:8080`. Tables are created automatically by Hibernate.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens on `http://localhost:3000` and automatically proxies `/api` requests to the backend.

### Environment Variables (optional)

The defaults are fine for local development; the following **must** be overridden in production:

| Variable | Description | Default |
|---|---|---|
| `DB_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/file_management_db` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `JWT_SECRET` | JWT signing key (32+ characters) | ⚠️ must be changed in production |

## User Roles

| Role | Permissions |
|---|---|
| Admin | User management (role/quota/delete), browse every file in the system |
| User | Create folders, upload/download/delete/move/share files, search, star |

## API Endpoints

All routes are prefixed with `/api` and require a `Authorization: Bearer <token>` header unless noted otherwise.

**Auth**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Log in, returns a JWT |

**Users**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me` | Current user's profile |
| POST | `/users/me/photo` | Upload profile photo |
| GET | `/users/me/photo` | Get profile photo |
| PUT | `/users/me/password` | Change password |
| PUT | `/users/me/email` | Change email |
| PUT | `/users/me/username` | Change username (returns a fresh JWT) |
| DELETE | `/users/me` | Permanently delete your account |

**Folders**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/folders` | Create a folder |
| GET | `/folders?parentId=` | List folders in a parent (root if omitted) |
| PATCH | `/folders/{id}` | Rename |
| PUT | `/folders/{id}/move?targetFolderId=` | Move |
| DELETE | `/folders/{id}` | Move to trash |
| GET | `/folders/trash` | List trashed folders |
| POST | `/folders/{id}/restore` | Restore from trash |
| DELETE | `/folders/{id}/permanent` | Permanently delete |

**Files**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/files?folderId=` | Upload a file (multipart) |
| GET | `/files?folderId=` | List files in a folder (root if omitted) |
| GET | `/files/{id}/download` | Download |
| PATCH | `/files/{id}` | Rename |
| PUT | `/files/{id}/move?targetFolderId=` | Move |
| DELETE | `/files/{id}` | Move to trash |
| GET | `/files/trash` | List trashed files |
| POST | `/files/{id}/restore` | Restore from trash |
| DELETE | `/files/{id}/permanent` | Permanently delete |
| GET | `/files/recent` | Recently accessed files |
| POST | `/files/{id}/star` | Toggle star |
| GET | `/files/starred` | List starred files |
| GET | `/files/search?query=` | Search own files by name |
| GET | `/files/storage-usage` | Storage quota / usage stats |

**Sharing**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/share/user` | Share a file with a user |
| GET | `/share/with-me` | Files shared with you |
| GET | `/share/file/{fileId}` | List shares for a file you own |
| DELETE | `/share/{shareId}` | Remove a file share |
| POST | `/share/folder` | Share a folder with a user |
| GET | `/share/folders-with-me` | Folders shared with you |
| GET | `/share/folder/{folderId}` | List shares for a folder you own |
| DELETE | `/share/folder/{shareId}` | Remove a folder share |
| POST | `/share/link` | Create a time-limited download link |
| GET | `/share/public/{token}` | Download via link — *no auth required* |

**Search**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search?query=` | Combined search: own files, own folders, shared files, shared folders |

**Notifications**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | List notifications |
| GET | `/notifications/unread-count` | Unread count |
| POST | `/notifications/read-all` | Mark all as read |

**Admin** — *requires the ADMIN role*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | List all users |
| PUT | `/admin/users/{id}/quota` | Change a user's storage quota |
| PUT | `/admin/users/{id}/role` | Change a user's role |
| DELETE | `/admin/users/{id}` | Delete a user (cascades to all their data) |
| GET | `/admin/files` | List every file in the system |
| DELETE | `/admin/files/{id}` | Delete any file |
| DELETE | `/admin/folders/{id}` | Delete any folder |

## License

MIT — see [LICENSE](LICENSE).

# IoT Dashboard — Proyecto base (Vue 3 + Vite)

Esqueleto de aplicación web cliente para prácticas de **IoT**.
Incluye login, layout con menú lateral, dashboard, listado de dispositivos
y toda la infraestructura básica (router, store, servicios, configuración por
entornos) lista para que los estudiantes añadan nuevas vistas y lógica de
negocio sin perderse.

---

## Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Vite**
- **Vue Router 4**
- **Pinia** (gestión de estado)
- **PrimeVue 4** (tema Aura)
- **Axios** (cliente HTTP con interceptores)
- **JavaScript** (sin TypeScript)

---

## 1. Instalación

```bash
npm install
```

## 2. Ejecutar en local

```bash
npm run dev
```

La app abrirá en [http://localhost:5173](http://localhost:5173).

> La aplicación consume un backend real. Asegúrate de tener el servidor
> arrancado y de que `VITE_API_BASE_URL` en [.env](.env) apunte a él.

## 3. Build de producción

```bash
npm run build
npm run preview
```

---

## 4. Variables de entorno

Existen dos archivos:

- [.env](.env) — se usa en desarrollo (`npm run dev`)
- [.env.production](.env.production) — se usa en el build (`npm run build`)

Variables disponibles:

| Variable               | Descripción                                 | Ejemplo local            | Ejemplo producción        |
|------------------------|---------------------------------------------|--------------------------|---------------------------|
| `VITE_API_BASE_URL`    | URL base del backend                        | `http://localhost:3000`  | `https://midominio.com`   |
| `VITE_API_KEY`         | API key opcional (cabecera `X-API-Key`)     | *(vacío)*                | `abc123...`               |
| `VITE_AUTH_LOGIN_PATH` | Ruta del endpoint de login                  | `/auth/login`            | `/auth/login`             |

### Cambiar de local a producción

Solo hay que editar [.env](.env) (o [.env.production](.env.production))
y apuntar `VITE_API_BASE_URL` al servidor correspondiente. Toda la app
toma esa URL desde [src/config/api.js](src/config/api.js), que centraliza
la configuración.

---

## 5. Estructura del proyecto

```
src/
├─ assets/                 Estilos globales
│  └─ main.css
├─ components/
│  ├─ layout/
│  │  ├─ AppSidebar.vue    Menú lateral
│  │  └─ AppTopbar.vue     Barra superior con título y logout
│  └─ ui/
│     ├─ SectionHeader.vue Cabecera reutilizable para vistas
│     └─ StatCard.vue      Card reutilizable para estadísticas
├─ config/
│  └─ api.js               Configuración centralizada (baseURL, endpoints)
├─ layouts/
│  └─ MainLayout.vue       Layout general (sidebar + topbar + contenido)
├─ router/
│  └─ index.js             Rutas + navigation guards
├─ services/
│  ├─ http.js              Axios + interceptores (Bearer token, API key)
│  ├─ authService.js       Login (con fallback mock)
│  ├─ devicesService.js    CRUD de dispositivos
│  └─ readingsService.js   Lecturas de dispositivos
├─ stores/
│  ├─ auth.js              Pinia: token, user, login, logout
│  └─ devices.js           Pinia: listado y métricas de dispositivos
├─ views/
│  ├─ LoginView.vue
│  ├─ DashboardView.vue
│  ├─ DevicesView.vue
│  └─ NotFoundView.vue
├─ App.vue
└─ main.js                 Registro de Pinia, Router y PrimeVue
```

### Dónde está cada cosa

| Necesito…                                  | Voy a…                                   |
|--------------------------------------------|-------------------------------------------|
| Añadir una nueva pantalla                  | `src/views/` + registrar en `router/index.js` |
| Añadir una entrada en el menú lateral      | `components/layout/AppSidebar.vue`       |
| Consumir un nuevo endpoint                 | Crear método en `services/xxxService.js` |
| Guardar estado global                      | Crear store en `stores/`                 |
| Cambiar la URL del backend                 | Editar `.env` / `.env.production`        |
| Cambiar la ruta de login                   | `.env` -> `VITE_AUTH_LOGIN_PATH`         |
| Crear un componente reutilizable           | `components/ui/`                         |

---

## 6. Flujo de autenticación

1. El usuario entra credenciales en `LoginView.vue`.
2. Se llama a `authStore.login()`, que usa `authService.login()`.
3. Si es correcto, el token se guarda en:
   - Pinia (`authStore.token`)
   - `localStorage` (`auth_token`)
4. El router redirige al dashboard.
5. En cada petición, el interceptor de [http.js](src/services/http.js) añade:
   - `Authorization: Bearer <token>`
   - `X-API-Key: <apiKey>` (si está definida)
6. Si la API responde 401, se limpia la sesión y se redirige a login.
7. Al recargar la página, `main.js` llama a `loadTokenFromStorage()` y
   la sesión se restaura automáticamente.

---

## 7. Endpoints del backend contemplados

| Método | Ruta                                               | Auth       | Descripción                   |
|--------|----------------------------------------------------|------------|-------------------------------|
| GET    | /devices                                           | pública    | Listar dispositivos           |
| GET    | /devices/:id                                       | pública    | Detalle                       |
| POST   | /devices                                           | protegida  | Crear                         |
| PUT    | /devices/:id                                       | protegida  | Actualizar                    |
| DELETE | /devices/:id                                       | protegida  | Eliminar                      |
| GET    | /readings/device/:deviceId                         | pública    | Lecturas de un dispositivo    |
| GET    | /readings/device/:deviceId/range?start=..&end=..   | pública    | Lecturas por rango de fechas  |
| POST   | /readings                                          | protegida  | Crear lectura                 |
| DELETE | /readings/device/:deviceId                         | protegida  | Eliminar lecturas             |

Todos están cableados en [src/config/api.js](src/config/api.js) y listos
para usarse desde los servicios.

---

## 8. Cómo ampliar el proyecto

### Añadir una nueva vista (ejemplo: DeviceDetailView)

1. Crear `src/views/DeviceDetailView.vue`.
2. Registrar la ruta en `src/router/index.js`:
   ```js
   {
     path: 'devices/:id',
     name: 'device-detail',
     component: () => import('@/views/DeviceDetailView.vue'),
     meta: { title: 'Detalle dispositivo' }
   }
   ```
3. (Opcional) Añadir una entrada en el sidebar.

### Añadir un nuevo servicio / endpoint

1. Añadir la ruta en `src/config/api.js` -> `endpoints`.
2. Crear el método en el servicio correspondiente (`services/*.js`).
3. Consumirlo desde la vista o el store.

---

## 9. Notas

- La aplicación está conectada a un backend real. Si el servidor no
  está disponible verás un error en el login y en el listado de dispositivos.
- Los componentes `SectionHeader` y `StatCard` son reutilizables: podéis
  usarlos en cualquier vista nueva para mantener la coherencia visual.

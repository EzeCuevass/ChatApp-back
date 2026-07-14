# 💬 ChatApp Back

Backend de ChatApp desarrollado en Node.js y JavaScript.  
Expone endpoints REST y eventos en tiempo real para autenticación, chat global, chats grupales y chats privados.

> Repositorio frontend relacionado:  
> https://github.com/EzeCuevass/ChatApp-Front

---

## 🛠️ Tecnologías

- **JavaScript (Node.js)**
- **Express**
- **MongoDB + Mongoose**
- **Socket.IO** (comunicación en tiempo real)
- **Passport** (`passport-local`, `passport-jwt`) para autenticación
- **JWT** (`jsonwebtoken`)
- **bcrypt** (hash de contraseñas)
- **Multer** (subida de imágenes/perfiles)
- **cookie-parser**
- **CORS**
- **dotenv**
- **Nodemon** (entorno de desarrollo)
- **ES Modules** (`"type": "module"`)

### Dependencias instaladas adicionales
- `express-session`
- `connect-mongo`
- `express-handlebars`

---

## 📁 Estructura del proyecto

```txt
ChatApp-back/
├── app.js
├── utils.js
├── config/
│   └── passport.config.js
├── controllers/
│   ├── usercontrollers.js
│   ├── messagecontrollers.js
│   ├── groupcontrollers.js
│   └── privatechatcontrollers.js
├── dao/
│   ├── users.dao.js
│   ├── message.dao.js
│   ├── group.dao.js
│   └── privatechat.dao.js
├── db/
│   └── connect.js
├── routes/
│   ├── user-routes.js
│   ├── message-routes.js
│   ├── group-routes.js
│   └── private-chat-routes.js
├── public/
│   └── uploads/
├── package.json
└── .gitignore
```

---

## ✅ Requisitos

- Node.js 18 o superior
- npm 9 o superior
- MongoDB disponible

---

## 🚀 Instalación y ejecución local

```bash
git clone https://github.com/EzeCuevass/ChatApp-back.git
cd ChatApp-back
npm install
npm run dev
```

También disponible:

```bash
npm start
```

---

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz del backend con:

```env
MONGO_URI=tu_uri_de_mongodb
SESSION_SECRET=tu_secret_de_sesion
PRIVATE_KEY=tu_clave_privada
MYFRONT_URL=http://localhost:3000
```

### 📌 Importante sobre JWT en tu código actual

En el código se usa **`process.env.PRIVATE_KEY_JWT`** para firmar/verificar tokens (`utils.js`, `usercontrollers.js`, `passport.config.js`).

Para evitar errores, usa también esta variable:

```env
PRIVATE_KEY_JWT=tu_clave_jwt
```

> Recomendación: unificar en el código a un solo nombre de variable (`PRIVATE_KEY` o `PRIVATE_KEY_JWT`) para evitar confusiones.

---

## 🌐 CORS y credenciales

El servidor está configurado con `credentials: true` y orígenes permitidos incluyendo `MYFRONT_URL`, por lo que el frontend debe enviar cookies/credenciales correctamente.

---

## 🔌 Rutas principales REST

### Mensajes (chat global)
- `GET /` → obtiene mensajes globales
- `POST /` → publica mensaje global
- `GET /getLastMessage` → último mensaje global

### Usuarios
- `POST /users/register`
- `POST /users/login`
- `GET /users/logout`
- `POST /users/upload-photo`
- `GET /users/search?user=<username>`
- `GET /users/searchUsers?user=<prefix>`
- `GET /users/getgroups`
- `GET /users/current`

### Grupos
- `POST /group/createGroup`
- `PUT /group/addMembers`
- `PUT /group/postMessageInGroup`
- `GET /group/:id`
- `GET /group/getLastMessageInGroup?id=<groupId>`
- `PUT /group/leave/:groupId`
- `DELETE /group/:id`

### Chat privado
- `POST /privatechat/:userId` (obtiene o crea chat)
- `PUT /privatechat/:chatId/message`
- `GET /privatechat/`

---

## ⚡ Eventos Socket.IO (tiempo real)

- `setusername`
- `getOnlineUsers`
- `get`
- `getgroup`
- `sendmessage`
- `sendmessagetogroup`
- `getlastmessage`
- `getlastmessageingroup`
- `getprivatechat`
- `sendmessagetoprivate`
- `getprivatechatbyid`
- `getlastmessageinprivate`
- `updateusers`

---

## 🧪 Flujo recomendado de prueba local

1. Levantar MongoDB
2. Configurar `.env`
3. Ejecutar backend con `npm run dev`
4. Levantar frontend
5. Probar:
   - registro/login
   - chat global
   - creación de grupos y mensajes
   - chat privado en tiempo real
   - subida de foto de perfil

---

## 📌 Estado del proyecto

Proyecto orientado a entorno local (sin deploy público por ahora).

---

## 👤 Autor

**EzeCuevas**

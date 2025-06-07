# Usar una imagen base de Node.js 20
FROM node:22-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar TypeScript
RUN npm run build

# Comando para ejecutar la aplicación
CMD ["npm", "run", "start"]
# Usar imagen base
FROM node:22-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar solo package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# 🔧 Asegurarse de que tsc tenga permisos de ejecución
#RUN chmod +x ./node_modules/.bin/tsc

RUN chmod +x ./node_modules/.bin/tsc

# Copiar el resto del código
COPY . .

# Compilar TypeScript
RUN npm run build

# Comando por defecto para correr la app
CMD ["npm", "run", "start"]
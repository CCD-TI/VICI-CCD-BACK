# Usar imagen base
FROM node:22-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar solo package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install
RUN npm install -g typescript
# 🔧 Asegurarse de que tsc tenga permisos de ejecución
#RUN chmod +x ./node_modules/.bin/tsc

# Copiar el resto del código
COPY . .

# Compilar TypeScript
RUN tsc

# Comando por defecto para correr la app
CMD ["npm", "run", "start"]
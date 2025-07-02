# Usa la imagen oficial de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración
COPY package.json pnpm-lock.yaml ./

# Instala las dependencias
RUN npm install -g pnpm
RUN pnpm install

# Copia el resto de los archivos
COPY . .

# Expone el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["pnpm", "run", "dev"]

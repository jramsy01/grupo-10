FROM node:18

# Crear el directorio de trabajo
WORKDIR /app

# Copiar los archivos package*
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto si es necesario
EXPOSE 3000

# Comando para desarrollo
CMD ["npm", "run", "dev"]

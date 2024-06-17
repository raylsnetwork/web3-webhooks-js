#
# Dev stage.
#
FROM node:16.18.0

# Make port 80 available to the world outside this container
EXPOSE 3030
ENV PORT 3030

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json package.json
COPY prisma/ prisma/

RUN npm install
RUN npx prisma generate

COPY . .
# COPY src/ src/
# COPY tsconfig.json tsconfig.json
# COPY start.sh start.sh
# Transpiling
RUN npm run build

# Run src/app.js when the container launches
ENTRYPOINT [ "./start.sh" ]
FROM node:11

# Set working dir
WORKDIR /code

# Install packages
COPY package*.json /code/
RUN npm install

# Copy code
COPY . /code

# Port
EXPOSE 4001

# Wait until db is ready
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.5.0/wait /wait
RUN chmod +x /wait

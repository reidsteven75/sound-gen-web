FROM node:11

# Set working dir
WORKDIR /code

# Install packages
COPY package*.json /code/
RUN npm install

# Copy code
COPY . /code

# Port
EXPOSE 8080

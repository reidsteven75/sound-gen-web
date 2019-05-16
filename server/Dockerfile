FROM node:11

# Install libraries
RUN apt-get update && apt-get install -y 

# Set working dir
WORKDIR /code

# Install packages
COPY package*.json /code/
RUN npm install

# Copy code
COPY . /code

# Port
EXPOSE 81

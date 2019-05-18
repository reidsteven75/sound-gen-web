FROM node:11

# Set working dir
WORKDIR /code

# Install packages
COPY package*.json /code/
RUN npm install --production

# Copy code
COPY . /code

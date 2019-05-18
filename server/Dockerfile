FROM gcr.io/google-appengine/nodejs

# Set working dir
WORKDIR /code

# Install packages
COPY package*.json /code/
RUN npm install

# Production Env
ENV SERVER_PORT=8080
ENV NODE_ENV='production'

# Copy code
COPY . /code


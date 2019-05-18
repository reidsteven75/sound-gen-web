FROM gcr.io/google-appengine/nodejs

# Set working dir
WORKDIR /code

# Install packages
COPY package*.json /code/
RUN npm install --production

# Copy code
COPY . /code


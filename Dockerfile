# Use an official Python runtime as a parent image
FROM tensorflow/tensorflow:1.12.0-gpu

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install libraries
RUN apt-get update && apt-get install -y \
  build-essential \
  libasound2-dev \
  libjack-dev \
  sox \
  lame

# Install packages
RUN pip install magenta-gpu
RUN pip install pipenv
RUN pipenv install --system

# Make port 80 available to the world outside this container
EXPOSE 80

# Run when the container launches
# CMD ["python", "generate.py"]
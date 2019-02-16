# NOTE: this doesn't invoke a run command as this is used
# in paperspace jobs where the command is invoked in the job itself

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
RUN pip install tqdm
RUN pip install librosa
# RUN pip install pipenv
# RUN pipenv install --system --deploy

# Make port 80 available to the world outside this container
EXPOSE 80

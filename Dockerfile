# Use an official Python runtime as a parent image
FROM tensorflow/tensorflow:1.12.0-gpu

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages
RUN pip install pipenv
# ONBUILD COPY Pipfile Pipfile
# ONBUILD COPY Pipfile.lock Pipfile.lock
RUN pipenv install --system

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["python", "generate.py"]
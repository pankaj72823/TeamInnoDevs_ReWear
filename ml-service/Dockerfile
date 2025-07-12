# syntax=docker/dockerfile:1

# Use a slim Python base image
FROM python:3.9-slim AS base

# Set working directory
WORKDIR /app

# Builder stage for installing dependencies
FROM base AS builder

# Copy requirements file and install dependencies
COPY --link requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m venv .venv && \
    .venv/bin/pip install -r requirements.txt

# Final stage
FROM base AS final

# Copy application code
COPY --link . .

# Copy virtual environment from builder stage
COPY --from=builder /app/.venv /app/.venv

# Set environment variables
ENV PATH="/app/.venv/bin:$PATH"

# Expose the application port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
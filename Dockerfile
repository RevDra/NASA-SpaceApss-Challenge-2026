# NODIXHI sky explorer: the Python server (standard library only) serves the pages and the NASA/IPAC proxy.
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 TRUST_PROXY=1
RUN useradd --create-home --uid 10001 app
WORKDIR /app
COPY viewer/ /app/viewer/
RUN mkdir -p /app/reports && chown -R app:app /app
USER app
WORKDIR /app/viewer

# The host sets PORT (Render: 10000); serve.py then listens on 0.0.0.0:$PORT.
EXPOSE 10000
CMD ["python", "serve.py", "--no-browser"]

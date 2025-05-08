# ArtHub frontend

# Режим запуска
```bash
    docker stop art_hub-frontend
    docker build -t art_hub-frontend:latest .
    docker run --rm --name art_hub-frontend -d -p 0.0.0.0:8088:80 art_hub-frontend
```


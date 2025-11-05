docker run -d `
  --name redis `
  -p 6379:6379 `
  redis:7 `
  redis-server --requirepass your_strong_redis_password_here

docker run -d `
  --name minio `
  -p 9000:9000 `
  -p 9090:9090 `
  -e "MINIO_ROOT_USER=minioadmin" `
  -e "MINIO_ROOT_PASSWORD=your_strong_minio_password_here" `
  quay.io/minio/minio server /data --console-address ":9090"

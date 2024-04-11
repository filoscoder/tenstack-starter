FROM alpine:3.19.1

RUN apk add openssh rsync mariadb-client

# WORKDIR /app
RUN ssh-keygen -f ~/.ssh/id_ed25519 -N ""

# scripts in /etc/periodic/daily run at 2 am every day
COPY backup.sh /etc/periodic/daily

RUN chmod u+x /etc/periodic/daily/backup.sh

# Start the cron daemon in the foreground
CMD crond -f
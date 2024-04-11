#!/bin/sh

# Backup timba database, compress and send to backup sotorage
# Dependencies:
# 	rsync
#	bzip2

DB_USER=$DB_USER
DB_PASS=$DB_PASS
REMOTE_USER=$REMOTE_USER
REMOTE_HOST=$REMOTE_HOST
# Location of file on remote server
REMOTE_LOCATION=${REMOTE_LOCATION:-/}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}

FILE_NAME=timba-backup-$(date -I).sql
FILE_LOCATION=./tmp

# Ensure containing directory exists
if [ ! -d "$FILE_LOCATION" ]; then
	mkdir -p "$FILE_LOCATION"
fi

echo "Backing up"
# Create backup
mariadb-dump \
	-h $DB_HOST \
	-P $DB_PORT \
	--user=$DB_USER \
	--password=$DB_PASS \
	--lock-tables \
	--all-databases \
	> ${FILE_LOCATION}/${FILE_NAME}

echo "Compressing"
# Compress 
bzip2 ${FILE_LOCATION}/${FILE_NAME}

echo "Transfering"
# Transfer
rsync --quiet \
	${FILE_LOCATION}/${FILE_NAME}.bz2 \
	$REMOTE_USER@$REMOTE_HOST:$REMOTE_LOCATION

# Remove local file
rm -r $FILE_LOCATION

echo "$FILE_NAME Done"
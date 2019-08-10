#!/bin/sh

set -eo pipefail

[ $# -eq 0 ] && {
    of=`date +%Y%m%d%H%M%S`.json
    node src/index.js $of && cp $of /data
    exit
}

exec "$@"

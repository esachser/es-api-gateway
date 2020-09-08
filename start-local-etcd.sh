~/go/bin/etcd --name Etcd \
--initial-advertise-peer-urls http://0.0.0.0:2380 --listen-peer-urls http://0.0.0.0:2380 \
--advertise-client-urls http://0.0.0.0:2379 --listen-client-urls http://0.0.0.0:2379